import { makeId } from "../lib/id";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Prd, Task, Settings } from "../types";

export interface StoreAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: unknown): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const browserStorage: StoreAdapter = {
  // zustand's JSON storage already serializes the state; store the string as-is.
  getItem: (key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) return Promise.resolve(null);
    // Recover values written by an earlier build that double-encoded the JSON.
    if (raw.startsWith('"')) {
      try {
        const once = JSON.parse(raw);
        if (typeof once === "string") return Promise.resolve(once);
      } catch {
        // not double-encoded; fall through
      }
    }
    return Promise.resolve(raw);
  },
  setItem: (key, value) => {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    return Promise.resolve();
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

interface PrdState {
  prds: Prd[];
  settings: Settings | null;
  addPrd: (prd: Prd) => void;
  updatePrd: (id: string, patch: Partial<Omit<Prd, "id">>) => void;
  deletePrd: (id: string) => void;
  setSettings: (settings: Settings) => void;
  addTask: (prdId: string, task: Omit<Task, "id" | "createdAt">) => void;
  updateTaskStatus: (prdId: string, taskId: string, status: Task["status"]) => void;
  deleteTask: (prdId: string, taskId: string) => void;
  resetStore: () => void;
}

export function createStore(opts: { storage?: StoreAdapter }) {
  const storage = opts.storage ?? browserStorage;
  const store = create<PrdState>()(
    persist(
      (set) => ({
        prds: [],
        settings: null,
        addPrd: (prd) => set((state) => ({ prds: [...state.prds, prd] })),
        updatePrd: (id, patch) =>
          set((state) => ({
            prds: state.prds.map((p) =>
              p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
            ),
          })),
        deletePrd: (id) => set((state) => ({ prds: state.prds.filter((p) => p.id !== id) })),
        setSettings: (settings) => set({ settings }),
        addTask: (prdId, task) =>
          set((state) => ({
            prds: state.prds.map((p) =>
              p.id === prdId
                ? {
                    ...p,
                    tasks: [...p.tasks, { ...task, id: makeId(), createdAt: Date.now() }],
                    updatedAt: Date.now(),
                  }
                : p
            ),
          })),
        updateTaskStatus: (prdId, taskId, status) =>
          set((state) => ({
            prds: state.prds.map((p) =>
              p.id === prdId
                ? {
                    ...p,
                    tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
                    updatedAt: Date.now(),
                  }
                : p
            ),
          })),
        deleteTask: (prdId, taskId) =>
          set((state) => ({
            prds: state.prds.map((p) =>
              p.id === prdId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId), updatedAt: Date.now() } : p
            ),
          })),
        resetStore: () => set({ prds: [], settings: null }),
      }),
      {
        name: "rencanai-store",
        storage: createJSONStorage(() => storage),
      }
    )
  );
  // Expose actions directly so the store works imperatively (tests, non-component
  // code) while remaining a zustand hook for React components.
  const actions = store.getState();
  return Object.assign(store, {
    addPrd: actions.addPrd,
    updatePrd: actions.updatePrd,
    deletePrd: actions.deletePrd,
    setSettings: actions.setSettings,
    addTask: actions.addTask,
    updateTaskStatus: actions.updateTaskStatus,
    deleteTask: actions.deleteTask,
    resetStore: actions.resetStore,
  });
}

export const useStore = createStore({});
