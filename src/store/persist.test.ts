import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "./useStore";

const KEY = "rencanai-store";

beforeEach(() => {
  localStorage.clear();
});

describe("settings survive a page reload", () => {
  it("restores API key and model into a fresh store", async () => {
    const first = createStore({});
    first.getState().setSettings({ provider: "groq", apiKey: "gsk-123", model: "llama-3.1-8b-instant" });

    const reloaded = createStore({});
    await reloaded.persist.rehydrate();
    expect(reloaded.getState().settings).toEqual({
      provider: "groq",
      apiKey: "gsk-123",
      model: "llama-3.1-8b-instant",
    });
  });

  it("recovers settings saved by the earlier double-encoding build", async () => {
    const inner = JSON.stringify({
      state: { prds: [], settings: { provider: "gemini", apiKey: "old-key", model: "gemini-3.8-flash" } },
      version: 0,
    });
    localStorage.setItem(KEY, JSON.stringify(inner));

    const reloaded = createStore({});
    await reloaded.persist.rehydrate();
    expect(reloaded.getState().settings?.apiKey).toBe("old-key");
  });
});
