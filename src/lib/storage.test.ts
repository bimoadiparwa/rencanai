import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LocalStorageAdapter } from "./storage";

const KEY = "rencanai-v1-test";

describe("LocalStorageAdapter", () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter(KEY);
    localStorage.removeItem(KEY);
  });

  afterEach(() => {
    localStorage.removeItem(KEY);
  });

  it("saves and reads prds", () => {
    const prd = {
      id: "prd-1",
      title: "Tes PRD",
      description: "deskripsi singkat",
      content: "# Isi PRD",
      tasks: [],
      createdAt: 1000,
      updatedAt: 1000,
    };
    adapter.savePrd(prd);
    const all = adapter.getPrds();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("Tes PRD");
  });

  it("returns empty array when nothing stored", () => {
    expect(adapter.getPrds()).toEqual([]);
  });

  it("deletes a prd by id", () => {
    adapter.savePrd({ id: "a", title: "A", description: "", content: "", tasks: [], createdAt: 1, updatedAt: 1 });
    adapter.savePrd({ id: "b", title: "B", description: "", content: "", tasks: [], createdAt: 2, updatedAt: 2 });
    adapter.deletePrd("a");
    expect(adapter.getPrds().map((p) => p.id)).toEqual(["b"]);
  });

  it("persists settings", () => {
    adapter.saveSettings({ provider: "gemini", apiKey: "key-123", model: "gemini-1.5-flash-latest" });
    const s = adapter.getSettings();
    expect(s?.provider).toBe("gemini");
    expect(s?.apiKey).toBe("key-123");
  });
});
