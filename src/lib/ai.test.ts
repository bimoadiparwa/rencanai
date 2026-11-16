import { describe, it, expect } from "vitest";
import { geminiUrl, openrouterUrl, parseStreamChunk } from "./ai";

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
