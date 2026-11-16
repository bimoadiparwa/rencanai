import { describe, it, expect, vi, afterEach } from "vitest";
import {
  PROVIDERS,
  buildRequest,
  describeError,
  extractTexts,
  getProvider,
  resolveSettings,
  splitSse,
  parseSseEvent,
} from "./providers";
import { generatePrd } from "./ai";
import { testConnection } from "./connection";

const enc = new TextEncoder();
function sseBody(events: string[]) {
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (const e of events) c.enqueue(enc.encode(e));
      c.close();
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("free-only model catalog", () => {
  it("has a default model that exists in every provider list", () => {
    for (const p of PROVIDERS) {
      expect(p.models.map((m) => m.id)).toContain(p.defaultModel);
    }
  });

  it("does not list paid or retired models", () => {
    const all = PROVIDERS.flatMap((p) => p.models.map((m) => m.id));
    expect(all).not.toContain("openrouter/auto");
    expect(all.some((id) => id.startsWith("gemini-1.5"))).toBe(false);
    expect(all.some((id) => id.includes("claude"))).toBe(false);
    expect(all.some((id) => id.includes("gemini-4-carbon") || id.includes("gemini-4-argon"))).toBe(false);
    expect(all.some((id) => id.includes("lyria"))).toBe(false);
  });

  it("OpenRouter models are all ':free' or the free router", () => {
    for (const m of getProvider("openrouter").models) {
      expect(m.id.endsWith(":free") || m.id === "openrouter/free").toBe(true);
    }
  });
});

describe("buildRequest wire formats", () => {
  it("gemini streams via SSE with key in header, not in the URL", () => {
    const r = buildRequest({ provider: "gemini", model: "gemini-3.8-flash", apiKey: "k1", userText: "hi", stream: true });
    expect(r.url).toContain("models/gemini-3.8-flash:streamGenerateContent?alt=sse");
    expect(r.url).not.toContain("key=");
    expect(r.headers["x-goog-api-key"]).toBe("k1");
    expect(JSON.parse(r.body).systemInstruction.parts[0].text).toContain("PRD");
  });

  it("gemini non-stream uses generateContent", () => {
    const r = buildRequest({ provider: "gemini", model: "m", apiKey: "k", userText: "x", stream: false, maxTokens: 64 });
    expect(r.url.endsWith(":generateContent")).toBe(true);
    expect(JSON.parse(r.body).generationConfig.maxOutputTokens).toBe(64);
  });

  it("openrouter and groq use bearer auth on OpenAI-compatible chat endpoints", () => {
    const o = buildRequest({ provider: "openrouter", model: "google/gemma-4-31b-it:free", apiKey: "sk-or", userText: "x", stream: true });
    expect(o.url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(o.headers.Authorization).toBe("Bearer sk-or");
    expect(JSON.parse(o.body).stream).toBe(true);
    const g = buildRequest({ provider: "groq", model: "llama-3.3-70b-versatile", apiKey: "gsk", userText: "x", stream: true });
    expect(g.url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(JSON.parse(g.body).model).toBe("llama-3.3-70b-versatile");
  });
});

describe("stream parsing", () => {
  it("handles CRLF SSE framing split across chunks", () => {
    const { events, rest } = splitSse('data: {"a":1}\r\n\r\ndata: {"b"');
    expect(events).toEqual(['data: {"a":1}']);
    expect(rest).toBe('data: {"b"');
  });

  it("skips Gemini thought parts and keeps answer text", () => {
    const payload = JSON.stringify({
      candidates: [{ content: { parts: [{ thought: true, text: "berpikir" }, { text: "Halo" }] } }],
    });
    expect(extractTexts(payload)).toEqual(["Halo"]);
  });

  it("parses OpenAI-style deltas and ignores [DONE]", () => {
    expect(parseSseEvent('data: {"choices":[{"delta":{"content":"Hai"}}]}')).toEqual(["Hai"]);
    expect(parseSseEvent("data: [DONE]")).toEqual([]);
  });
});

describe("describeError", () => {
  it("explains auth, model, and rate-limit failures in Indonesian", () => {
    expect(describeError(401, "{}")).toContain("API key tidak valid");
    expect(describeError(404, '{"error":{"message":"no such model"}}')).toContain("Model tidak ditemukan");
    expect(describeError(429, "{}")).toContain("Batas gratis tercapai");
  });
});

describe("generatePrd end to end (stubbed network)", () => {
  it("streams Gemini SSE text into onChunk and completes", async () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
      Promise.resolve(
        new Response(
          sseBody([
            'data: {"candidates":[{"content":{"parts":[{"text":"## Ringkasan\\n"}]}}]}\r\n\r\n',
            'data: {"candidates":[{"content":{"parts":[{"text":"Isi PRD"}]}}]}\r\n\r\n',
          ]),
          { status: 200 }
        )
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const chunks: string[] = [];
    const onComplete = vi.fn();
    const onError = vi.fn();
    await generatePrd({ provider: "gemini", apiKey: "k", model: "gemini-3.8-flash", brief: "b", onChunk: (t) => chunks.push(t), onComplete, onError }).promise;
    expect(chunks.join("")).toBe("## Ringkasan\nIsi PRD");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(String(fetchMock.mock.calls[0][0])).toContain("alt=sse");
  });

  it("reports a clear error for an invalid key and never rejects", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response('{"error":{"message":"bad key"}}', { status: 400 }))));
    const onError = vi.fn();
    await expect(
      generatePrd({ provider: "groq", apiKey: "x", model: "llama-3.3-70b-versatile", brief: "b", onChunk: () => {}, onError }).promise
    ).resolves.toBeUndefined();
    expect(onError.mock.calls[0][0].message).toContain("bad key");
  });

  it("treats an empty stream as an error instead of saving an empty PRD", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(sseBody([]), { status: 200 }))));
    const onComplete = vi.fn();
    const onError = vi.fn();
    await generatePrd({ provider: "openrouter", apiKey: "k", model: "openrouter/free", brief: "b", onChunk: () => {}, onComplete, onError }).promise;
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("maps network failure to a connection message", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
    const onError = vi.fn();
    await generatePrd({ provider: "gemini", apiKey: "k", model: "gemini-3.8-flash", brief: "b", onChunk: () => {}, onError }).promise;
    expect(onError.mock.calls[0][0].message).toContain("Tidak dapat terhubung");
  });
});

describe("testConnection", () => {
  it("returns ok when the provider answers with text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ choices: [{ message: { content: "ya" } }] }), { status: 200 })))
    );
    const r = await testConnection("groq", "gsk", "llama-3.3-70b-versatile");
    expect(r.ok).toBe(true);
  });

  it("returns the provider reason when the key is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response('{"error":{"message":"invalid key"}}', { status: 401 }))));
    const r = await testConnection("openrouter", "bad", "openrouter/free");
    expect(r.ok).toBe(false);
    expect(r.message).toContain("API key tidak valid");
  });
});

describe("resolveSettings", () => {
  it("repairs retired models and removed providers saved by older versions", () => {
    expect(resolveSettings({ provider: "gemini", apiKey: "k", model: "gemini-1.5-flash-latest" })?.model).toBe("gemini-3.8-flash");
    expect(resolveSettings({ provider: "anthropic", apiKey: "k", model: "claude-3-haiku" })).toMatchObject({ provider: "gemini" });
    expect(resolveSettings(null)).toBeNull();
  });
});

describe("generatePrd callback errors", () => {
  it("reports a failure inside onComplete as that error, not as a connection problem", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(sseBody(['data: {"choices":[{"delta":{"content":"Halo"}}]}\n\n']), { status: 200 })))
    );
    const onError = vi.fn();
    await generatePrd({
      provider: "groq",
      apiKey: "k",
      model: "llama-3.3-70b-versatile",
      brief: "b",
      onChunk: () => {},
      onComplete: () => {
        throw new TypeError("crypto.randomUUID is not a function");
      },
      onError,
    }).promise;
    expect(onError.mock.calls[0][0].message).toContain("randomUUID");
  });
});
