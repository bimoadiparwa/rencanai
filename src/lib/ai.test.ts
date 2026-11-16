import { describe, it, expect } from "vitest";
import { geminiUrl, openrouterUrl, anthropicUrl, groqUrl, parseStreamChunk } from "./ai";

describe("geminiUrl", () => {
  it("builds streamGenerateContent URL", () => {
    const url = geminiUrl("gemini-1.5-flash-latest", "abc");
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(url).toContain("streamGenerateContent");
    expect(url).toContain("key=abc");
    expect(url).toContain("models/gemini-1.5-flash-latest");
  });
});

describe("openrouterUrl", () => {
  it("builds chat completions URL", () => {
    expect(openrouterUrl("openrouter/auto")).toBe("https://openrouter.ai/api/v1/chat/completions");
  });
});

describe("parseStreamChunk", () => {
  it("parses gemini text chunk", () => {
    const lines = parseStreamChunk('data: {"candidates":[{"content":{"parts":[{"text":"Halo"}]}}]}');
    expect(lines).toContain("Halo");
  });

  it("ignores non-data lines", () => {
    expect(parseStreamChunk(": ping\n")).toEqual([]);
  });
});

describe("anthropicUrl", () => {
  it("builds messages URL", () => {
    expect(anthropicUrl("claude-3-haiku-20240307")).toBe("https://api.anthropic.com/v1/messages");
  });
});

describe("groqUrl", () => {
  it("builds chat completions URL", () => {
    expect(groqUrl("llama3-8b-8192")).toBe("https://api.groq.com/openai/v1/chat/completions");
  });
});

describe("parseStreamChunk anthropic/groq", () => {
  it("parses anthropic text_delta chunk", () => {
    const lines = parseStreamChunk('data: {"delta":{"type":"text_delta","text":"Halo"}}');
    expect(lines).toContain("Halo");
  });

  it("parses groq delta content chunk", () => {
    const lines = parseStreamChunk('data: {"choices":[{"delta":{"content":"Hai"}}]}');
    expect(lines).toContain("Hai");
  });
});
