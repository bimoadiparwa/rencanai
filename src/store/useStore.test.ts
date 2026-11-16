import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createStore, type StoreAdapter } from "./useStore";

function mockStorage(): StoreAdapter {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn(async (key: string) => {
      const raw = data.get(key);
      return raw ? JSON.parse(raw) : null;
    }),
    setItem: vi.fn(async (key: string, value: unknown) => {
      data.set(key, JSON.stringify(value));
    }),
    removeItem: vi.fn(async (key: string) => {
      data.delete(key);
    }),
  } as unknown as StoreAdapter;
}

describe("useStore", () => {
  let store: ReturnType<typeof createStore>;
  let storage: StoreAdapter;

  beforeEach(() => {
    storage = mockStorage();
    store = createStore({ storage });
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("adds and lists prds", () => {
    store.addPrd({ id: "p1", title: "Judul", description: "d", content: "# x", tasks: [], createdAt: 1, updatedAt: 1 });
    expect(store.getState().prds).toHaveLength(1);
    expect(store.getState().prds[0].title).toBe("Judul");
  });

  it("updates task status", () => {
    store.addPrd({ id: "p1", title: "Judul", description: "d", content: "# x", tasks: [{ id: "t1", title: "Tugas", status: "todo", createdAt: 1 }], createdAt: 1, updatedAt: 1 });
    store.updateTaskStatus("p1", "t1", "done");
    const task = store.getState().prds[0]!.tasks[0];
    expect(task.status).toBe("done");
  });

  it("persists settings through storage adapter", async () => {
    store.setSettings({ provider: "gemini", apiKey: "k", model: "m" });
    // zustand persist writes asynchronously; flush by awaiting microtask
    await new Promise((r) => setTimeout(r, 0));
    expect(storage.setItem).toHaveBeenCalled();
  });
});
