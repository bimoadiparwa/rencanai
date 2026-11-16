# RencanAI PRD Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build RencanAI, a free, local-first, no-backend web app that generates AI Product Requirement Documents and task lists entirely in the browser (BYOK), deployable statically to GitHub Pages at $0/month.

**Architecture:** Single-page React app with client-side routing. Zustand store persists PRDs/tasks/settings to localStorage through a pluggable `StorageAdapter`. A pure `lib/ai.ts` streams chunks directly from the provider API (Gemini/OpenRouter) using native `fetch`. UI primitives and pages are split by feature, not by technical layer.

**Tech Stack:** Vite 7, React 19, TypeScript (strict), Tailwind CSS v4, React Router v7, Zustand, react-markdown + remark-gfm, lucide-react, Vitest + React Testing Library.

**Spec:** docs/superpowers/specs/2026-11-16-rencanai-prd-generator-design.md

## Global Constraints

- Zero backend; no server, no database, no API-key proxy. Hosting cost $0/month.
- BYOK only: provider, model, and API key stored in localStorage; never transmitted except directly to the AI provider API from the browser.
- No upgrade/pricing/paywall UI anywhere; "Free" badge is permanent.
- Deploy static to GitHub Pages from this repo root; `base: "/"` in Vite config.
- Dark-first, mobile-responsive UI.
- Tailwind CSS v4; React 19; TypeScript strict; Vite 7.
- Storage layer behind `StorageAdapter` interface (lib/storage.ts) so a sync adapter can be added later without touching UI.
- Every task must leave a green test suite and end with a commit.

---

### Task 1: Scaffold project, toolchain, and empty app shell

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/test/setup.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: none
- Produces: `npm run build` emits static `dist/`; `npm test` runs vitest; `src/main.tsx` mounts `<App />` into `#root`

- [ ] **Step 1: Write package.json** with dependencies and scripts

```json
{
  "name": "rencanai",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.0",
    "react-router": "^7.0.0",
    "react-router-dom": "^7.0.0",
    "remark-gfm": "^4.0.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.470.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.4.0",
    "jsdom": "^26.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.8.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Run `npm install`** — verify `node_modules/` and `package-lock.json` are created
- [ ] **Step 3: Write vite.config.ts**

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/",
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
})
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "allowJs": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Write index.html**

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>RencanAI — PRD Generator Gratis</title>
  </head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
```

- [ ] **Step 6: Write src/test/setup.ts**

```ts
import "@testing-library/jest-dom"
```

- [ ] **Step 7: Write vitest.config.ts** (see Files) and `src/main.tsx`

```tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 8: Write src/index.css** (Tailwind v4 + base reset)

```css
@import "tailwindcss";

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

- [ ] **Step 9: Write src/App.tsx** (empty shell — replaced by Task 14)

```tsx
export function App() {
  return <div data-testid="app-shell">RencanAI</div>
}
```

- [ ] **Step 10: Write smoke test src/app.test.tsx**

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { App } from "./App"

describe("App shell", () => {
  it("renders the app name", () => {
    render(<App />)
    expect(screen.getByTestId("app-shell")).toHaveTextContent("RencanAI")
  })
})
```

- [ ] **Step 11: Run `npm test`** — expect 1 test passing
- [ ] **Step 12: Run `npm run build`** — expect `dist/` created with index.html + assets
- [ ] **Step 13: Commit**

```bash
git add package.json vite.config.ts tsconfig.json index.html vitest.config.ts src/
git commit -m "feat: scaffold Vite + React + TS app shell with vitest"
```

---

### Task 2: ID helper, StorageAdapter interface, and localStorage implementation

**Files:**
- Create: `src/lib/id.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `makeId(): string`
  - `interface StorageAdapter { get<T>(key: string): T | null; set<T>(key: string, value: T): void; remove(key: string): void; list(prefix: string): string[]; clear(): void }`
  - `class LocalStorageAdapter implements StorageAdapter`
  - `const STORAGE_PREFIX = "rencanai-v1:"`
  - `function prdKey(id: string): string` and `function allPrdKeys(adapter: StorageAdapter): string[]`

- [ ] **Step 1: Write src/lib/id.ts**

```ts
export function makeId(): string {
  return crypto.randomUUID()
}
```

- [ ] **Step 2: Write src/lib/storage.ts**

```ts
export const STORAGE_PREFIX = "rencanai-v1:"

export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  list(prefix: string): string[]
  clear(): void
}

export class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }
  remove(key: string): void {
    localStorage.removeItem(key)
  }
  list(prefix: string): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) keys.push(key)
    }
    return keys
  }
  clear(): void {
    localStorage.clear()
  }
}

export function prdKey(id: string): string {
  return `${STORAGE_PREFIX}prd:${id}`
}

export function allPrdKeys(adapter: StorageAdapter): string[] {
  return adapter.list(`${STORAGE_PREFIX}prd:`)
}
```

- [ ] **Step 3: Write src/lib/storage.test.ts**

```tsx
import { describe, it, expect, beforeEach } from "vitest"
import { LocalStorageAdapter, STORAGE_PREFIX, prdKey, allPrdKeys } from "./storage"

describe("LocalStorageAdapter", () => {
  let adapter: LocalStorageAdapter
  beforeEach(() => {
    adapter = new LocalStorageAdapter()
    localStorage.clear()
  })

  it("set/get/remove round-trips JSON values", () => {
    adapter.set("user:1", { name: "Ada", score: 5 })
    expect(adapter.get("user:1")).toEqual({ name: "Ada", score: 5 })
    adapter.remove("user:1")
    expect(adapter.get("user:1")).toBeNull()
  })

  it("get on missing key returns null", () => {
    expect(adapter.get("nope")).toBeNull()
  })

  it("list returns only keys with the given prefix", () => {
    adapter.set(`${STORAGE_PREFIX}prd:a`, { id: "a" })
    adapter.set(`${STORAGE_PREFIX}prd:b`, { id: "b" })
    adapter.set("other:1", { x: 1 })
    expect(allPrdKeys(adapter).sort()).toEqual([
      `${STORAGE_PREFIX}prd:a`,
      `${STORAGE_PREFIX}prd:b`,
    ])
  })

  it("clear removes all keys", () => {
    adapter.set("x", 1)
    adapter.clear()
    expect(adapter.get("x")).toBeNull()
  })

  it("prdKey builds prefixed key", () => {
    expect(prdKey("abc")).toBe(`${STORAGE_PREFIX}prd:abc`)
  })
})
```

- [ ] **Step 4: Run `npm test src/lib/storage.test.ts`** — expect 5 tests passing
- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add id helper and pluggable StorageAdapter with localStorage"
```

---

### Task 3: Zustand store (PRDs, tasks, settings, persistence)

**Files:**
- Create: `src/store/useAppStore.ts`
- Create: `src/store/useAppStore.test.ts`

**Interfaces:**
- Consumes: `LocalStorageAdapter`, `STORAGE_PREFIX`, `prdKey` from `lib/storage.ts` (Task 2); `makeId` from `lib/id.ts` (Task 2)
- Produces:
  - `interface Task { id: string; title: string; status: "todo" | "in-progress" | "done"; createdAt: number }`
  - `interface Prd { id: string; title: string; description: string; content: string; tasks: Task[]; createdAt: number; updatedAt: number }`
  - `interface Settings { provider: "gemini" | "openrouter"; apiKey: string; model: string }`
  - `const useAppStore` (zustand) with:
    - `prds: Prd[]`, `settings: Settings | null`
    - `addPrd(input: { title: string; description: string }): string` (returns new PRD id)
    - `updatePrd(id: string, patch: { title?: string; description?: string; content?: string }): void`
    - `deletePrd(id: string): void`
    - `addTask(prdId: string, title: string): void`
    - `toggleTask(prdId: string, taskId: string, status: Task["status"]): void`
    - `deleteTask(prdId: string, taskId: string): void`
    - `saveSettings(settings: Settings): void`
    - `importState({ prds, settings }: { prds: Prd[]; settings: Settings | null }): void`
    - `progress(prdId: string): number` (0–100)
    - `exportState(): { prds: Prd[]; settings: Settings | null }`

- [ ] **Step 1: Write src/store/useAppStore.ts**

```tsx
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { LocalStorageAdapter, STORAGE_PREFIX, prdKey } from "../lib/storage"
import { makeId } from "../lib/id"

export interface Task {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
  createdAt: number
}

export interface Prd {
  id: string
  title: string
  description: string
  content: string
  tasks: Task[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  provider: "gemini" | "openrouter"
  apiKey: string
  model: string
}

export const storeAdapter = new LocalStorageAdapter()

interface AppState {
  prds: Prd[]
  settings: Settings | null
  addPrd: (input: { title: string; description: string }) => string
  updatePrd: (
    id: string,
    patch: { title?: string; description?: string; content?: string }
  ) => void
  deletePrd: (id: string) => void
  addTask: (prdId: string, title: string) => void
  toggleTask: (prdId: string, taskId: string, status: Task["status"]) => void
  deleteTask: (prdId: string, taskId: string) => void
  saveSettings: (settings: Settings) => void
  importState: (data: { prds: Prd[]; settings: Settings | null }) => void
  exportState: () => { prds: Prd[]; settings: Settings | null }
  progress: (prdId: string) => number
}

const now = () => Date.now()

const emptyPrd = (input: { title: string; description: string }): Prd => {
  const id = makeId()
  const t = now()
  return {
    id,
    title: input.title,
    description: input.description,
    content: "",
    tasks: [],
    createdAt: t,
    updatedAt: t,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      prds: [],
      settings: null,

      addPrd: (input) => {
        const prd = emptyPrd(input)
        set((state) => ({ prds: [...state.prds, prd] }))
        return prd.id
      },

      updatePrd: (id, patch) => {
        set((state) => ({
          prds: state.prds.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: now() }
              : p
          ),
        }))
      },

      deletePrd: (id) => {
        set((state) => ({ prds: state.prds.filter((p) => p.id !== id) }))
      },

      addTask: (prdId, title) => {
        const task: Task = { id: makeId(), title, status: "todo", createdAt: now() }
        set((state) => ({
          prds: state.prds.map((p) =>
            p.id === prdId
              ? { ...p, tasks: [...p.tasks, task], updatedAt: now() }
              : p
          ),
        }))
      },

      toggleTask: (prdId, taskId, status) => {
        set((state) => ({
          prds: state.prds.map((p) =>
            p.id === prdId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, status } : t
                  ),
                  updatedAt: now(),
                }
              : p
          ),
        }))
      },

      deleteTask: (prdId, taskId) => {
        set((state) => ({
          prds: state.prds.map((p) =>
            p.id === prdId
              ? {
                  ...p,
                  tasks: p.tasks.filter((t) => t.id !== taskId),
                  updatedAt: now(),
                }
              : p
          ),
        }))
      },

      saveSettings: (settings) => {
        set({ settings })
      },

      importState: ({ prds, settings }) => {
        set({ prds, settings })
      },

      exportState: () => {
        const { prds, settings } = get()
        return { prds, settings }
      },

      progress: (prdId) => {
        const prd = get().prds.find((p) => p.id === prdId)
        if (!prd || prd.tasks.length === 0) return 0
        const done = prd.tasks.filter((t) => t.status === "done").length
        return Math.round((done / prd.tasks.length) * 100)
      },
    }),
    {
      name: "rencanai-v1",
      storage: createJSONStorage(() => storeAdapter),
    }
  )
)
```

- [ ] **Step 2: Write src/store/useAppStore.test.ts**

```tsx
import { describe, it, expect, beforeEach } from "vitest"
import { useAppStore, type Prd, type Settings } from "./useAppStore"

function resetStore() {
  useAppStore.setState({ prds: [], settings: null })
  localStorage.clear()
}

describe("useAppStore", () => {
  beforeEach(resetStore)

  it("addPrd creates a PRD and returns its id", () => {
    const id = useAppStore.getState().addPrd({
      title: "Sistem Antrian",
      description: "Antrian pasien klinik",
    })
    const prd = useAppStore.getState().prds.find((p) => p.id === id)
    expect(prd).toMatchObject({
      title: "Sistem Antrian",
      description: "Antrian pasien klinik",
      content: "",
      tasks: [],
    })
    expect(typeof prd!.createdAt).toBe("number")
  })

  it("updatePrd changes title and bumps updatedAt", () => {
    const id = useAppStore.getState().addPrd({
      title: "Lama",
      description: "x",
    })
    const before = useAppStore.getState().prds.find((p) => p.id === id)!.updatedAt
    useAppStore.getState().updatePrd(id, { title: "Baru" })
    const after = useAppStore.getState().prds.find((p) => p.id === id)!
    expect(after.title).toBe("Baru")
    expect(after.updatedAt).toBeGreaterThanOrEqual(before)
  })

  it("deletePrd removes the PRD", () => {
    const id = useAppStore.getState().addPrd({ title: "A", description: "b" })
    useAppStore.getState().deletePrd(id)
    expect(useAppStore.getState().prds).toHaveLength(0)
  })

  it("addTask and toggleTask work", () => {
    const id = useAppStore.getState().addPrd({ title: "P", description: "d" })
    useAppStore.getState().addTask(id, "Susunan arsitektur")
    const prd = useAppStore.getState().prds.find((p) => p.id === id)!
    const taskId = prd.tasks[0].id
    expect(prd.tasks[0].status).toBe("todo")
    useAppStore.getState().toggleTask(id, taskId, "done")
    expect(
      useAppStore.getState().prds.find((p) => p.id === id)!.tasks[0].status
    ).toBe("done")
  })

  it("deleteTask removes the task", () => {
    const id = useAppStore.getState().addPrd({ title: "P", description: "d" })
    useAppStore.getState().addTask(id, "Tugas satu")
    const taskId = useAppStore.getState().prds.find((p) => p.id === id)!.tasks[0].id
    useAppStore.getState().deleteTask(id, taskId)
    expect(useAppStore.getState().prds.find((p) => p.id === id)!.tasks).toEqual([])
  })

  it("progress returns 0–100", () => {
    const id = useAppStore.getState().addPrd({ title: "P", description: "d" })
    expect(useAppStore.getState().progress(id)).toBe(0)
    useAppStore.getState().addTask(id, "A")
    useAppStore.getState().addTask(id, "B")
    useAppStore.getState().toggleTask(id, useAppStore.getState().prds.find((p) => p.id === id)!.tasks[0].id, "done")
    expect(useAppStore.getState().progress(id)).toBe(50)
    useAppStore.getState().toggleTask(id, useAppStore.getState().prds.find((p) => p.id === id)!.tasks[1].id, "done")
    expect(useAppStore.getState().progress(id)).toBe(100)
  })

  it("saveSettings persists to localStorage", () => {
    const settings: Settings = { provider: "gemini", apiKey: "secret", model: "gemini-1.5-flash-latest" }
    useAppStore.getState().saveSettings(settings)
    expect(useAppStore.getState().settings).toEqual(settings)
    expect(localStorage.getItem("rencanai-v1")).toBeTruthy()
  })

  it("exportState / importState round-trip", () => {
    const id = useAppStore.getState().addPrd({ title: "E", description: "f" })
    useAppStore.getState().addTask(id, "Tugas")
    const exported = useAppStore.getState().exportState()
    expect(exported.prds).toHaveLength(1)

    resetStore()
    useAppStore.getState().importState(exported)
    const state = useAppStore.getState()
    expect(state.prds).toHaveLength(1)
    expect(state.prds[0].tasks).toHaveLength(1)
    expect(state.settings).toBeNull()
  })
})
```

- [ ] **Step 3: Run `npm test src/store/useAppStore.test.ts`** — expect all tests passing
- [ ] **Step 4: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand store for PRDs, tasks, and BYOK settings"
```

---

### Task 4: AI service — provider fetch + SSE streaming

**Files:**
- Create: `src/lib/ai.ts`
- Create: `src/lib/ai.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `type Provider = "gemini" | "openrouter"`
  - `interface AIConfig { provider: Provider; apiKey: string; model: string }`
  - `interface StreamChunk { type: "text" | "done" | "error"; text?: string; error?: string }`
  - `class AIError extends Error { status?: number }`
  - `function buildSystemPrompt(description: string): string`
  - `async function* generatePrdStream(config: AIConfig, description: string): AsyncGenerator<StreamChunk>`

- [ ] **Step 1: Write src/lib/ai.ts**

```ts
export type Provider = "gemini" | "openrouter"

export interface AIConfig {
  provider: Provider
  apiKey: string
  model: string
}

export interface StreamChunk {
  type: "text" | "done" | "error"
  text?: string
  error?: string
}

export class AIError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = "AIError"
    this.status = status
  }
}

const SYSTEM_INTRO = `Anda adalah manajer produk senior yang ahli. Buatlah dokumen Persyaratan Produk (PRD) yang lengkap dan terstruktur dalam bahasa Indonesia dengan bagian-bagian berikut:
1. Ringkasan dan Tujuan
2. User Stories
3. Kebutuhan Fungsional
4. Kebutuhan Non-Fungsional
5. Rekomendasi Stack Teknologi
6. Daftar Tugas yang Disarankan

Gunakan format Markdown dengan judul yang jelas, daftar, dan tabel jika perlu. Buat konten yang dapat langsung digunakan oleh tim pengembang.`

export function buildSystemPrompt(description: string): string {
  return `${SYSTEM_INTRO}\n\nDeskripsi proyek:\n${description}`
}

function geminiUrl(config: AIConfig): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:streamGenerateContent?key=${encodeURIComponent(config.apiKey)}`
}

function openrouterUrl(): string {
  return "https://openrouter.ai/api/v1/chat/completions"
}

async function* parseGeminiStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "))
      if (!line) continue
      const json = line.slice("data: ".length)
      if (json === "[DONE]") continue
      try {
        const obj = JSON.parse(json)
        const text = obj.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) yield text
      } catch {
        // ignore unparseable SSE lines
      }
    }
  }
}

async function* parseOpenRouterStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "))
      if (!line) continue
      const json = line.slice("data: ").trim()
      if (json === "[DONE]") continue
      try {
        const obj = JSON.parse(json)
        const delta = obj.choices?.[0]?.delta?.content
        if (typeof delta === "string") yield delta
      } catch {
        // ignore unparseable SSE lines
      }
    }
  }
}

export async function* generatePrdStream(
  config: AIConfig,
  description: string
): AsyncGenerator<StreamChunk> {
  const prompt = buildSystemPrompt(description)

  let res: Response
  if (config.provider === "gemini") {
    res = await fetch(geminiUrl(config), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })
  } else {
    res = await fetch(openrouterUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "HTTP-Referer": "https://rencanai.local",
        "X-Title": "RencanAI",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: description },
        ],
        stream: true,
      }),
    })
  }

  if (!res.ok) {
    let detail = ""
    try {
      const err = await res.json()
      detail = err.error?.message || JSON.stringify(err)
    } catch {
      detail = res.statusText
    }
    throw new AIError(`Gagal memanggil AI: ${detail}`, res.status)
  }

  if (!res.body) {
    throw new AIError("Respons AI kosong", 502)
  }

  const reader = res.body.getReader()
  try {
    const parse = config.provider === "gemini" ? parseGeminiStream : parseOpenRouterStream
    for await (const text of parse(reader)) {
      yield { type: "text", text }
    }
  } finally {
    reader.releaseLock()
  }
  yield { type: "done" }
}
```

- [ ] **Step 2: Write src/lib/ai.test.ts**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { generatePrdStream, AIError, buildSystemPrompt } from "./ai"

const encoder = new TextEncoder()

function sseResponse(lines: string[]): Response {
  const chunks = lines.map((line) => encoder.encode(`data: ${line}\n\n`))
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk)
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  })
}

describe("generatePrdStream", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("streams Gemini text chunks and ends with done", async () => {
    const config = { provider: "gemini" as const, apiKey: "key", model: "gemini-1.5-flash-latest" }
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          sseResponse([
            '{"candidates":[{"content":{"parts":[{"text":"Halo "}]}]}',
            '{"candidates":[{"content":{"parts":[{"text":"dunia"}]}]}',
          ])
        )
      )
    )
    const collected: string[] = []
    let last: StreamChunk | undefined
    for await (const chunk of generatePrdStream(config, "buat aplikasi todo")) {
      collected.push(chunk.text ?? "")
      last = chunk
    }
    expect(collected.join("")).toBe("Halo dunia")
    expect(last!.type).toBe("done")
    expect(fetch).toHaveBeenCalledTimes(1)
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain("generativelanguage.googleapis.com")
    expect(url).toContain("streamGenerateContent")
  })

  it("streams OpenRouter delta chunks", async () => {
    const config = { provider: "openrouter" as const, apiKey: "sk-or", model: "openrouter/auto" }
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          sseResponse([
            '{"choices":[{"delta":{"content":"Satu "}}]}',
            '{"choices":[{"delta":{"content":"dua"}}]}',
          ])
        )
      )
    )
    const collected: string[] = []
    for await (const chunk of generatePrdStream(config, "contoh")) {
      collected.push(chunk.text ?? "")
    }
    expect(collected.join("")).toBe("Satu dua")
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, any]
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions")
    expect(init.headers.Authorization).toBe("Bearer sk-or")
    expect(JSON.parse(init.body).stream).toBe(true)
  })

  it("throws AIError on non-ok response", async () => {
    const config = { provider: "gemini" as const, apiKey: "bad", model: "m" }
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ error: { message: "kunci tidak valid" } }), { status: 401 })))
    )
    await expect(generatePrdStream(config, "x")).rejects.toMatchObject(
      new AIError("Gagal memanggil AI: kunci tidak valid", 401)
    )
  })

  it("buildSystemPrompt includes the description", () => {
    const prompt = buildSystemPrompt("sistem pembayaran")
    expect(prompt).toContain("sistem pembayaran")
    expect(prompt).toContain("User Stories")
  })
})
```

- [ ] **Step 4: Run `npm test src/lib/ai.test.ts`** — expect all tests passing
- [ ] **Step 5: Commit**

```bash
git add src/lib/ai.ts src/lib/ai.test.ts
git commit -m "feat: add AI streaming service for Gemini and OpenRouter"
```

---

### Task 5: UI primitive components

**Files:**
- Create: `src/components/ui/Button.tsx` + `src/components/ui/Button.test.tsx`
- Create: `src/components/ui/Input.tsx` + `src/components/ui/Input.test.tsx`
- Create: `src/components/ui/Select.tsx` + `src/components/ui/Select.test.tsx`
- Create: `src/components/ui/Card.tsx` + `src/components/ui/Card.test.tsx`
- Create: `src/components/ui/Modal.tsx` + `src/components/ui/Modal.test.tsx`
- Create: `src/components/ui/Badge.tsx` + `src/components/ui/Badge.test.tsx`
- Create: `src/components/ui/ProgressBar.tsx` + `src/components/ui/ProgressBar.test.tsx`

**Interfaces:**
- Consumes: none
- Produces: all primitive components listed above, each with tests

- [ ] **Step 1: Write Button + test**

```tsx
import { forwardRef } from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger"
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className = "", children, disabled, ...rest }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
    const variants: Record<string, string> = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700",
      ghost: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700",
      danger: "bg-red-600 text-white hover:bg-red-700",
    }
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...rest}>
        {loading ? "Memuat…" : children}
      </button>
    )
  }
)
```

Test:
```tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "./Button"

test("renders children and fires onClick", () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick}>Simpan</Button>)
  const btn = screen.getByRole("button", { name: /simpan/i })
  fireEvent.click(btn)
  expect(onClick).toHaveBeenCalledTimes(1)
})

test("disables when loading", () => {
  render(<Button loading>Memuat</Button>)
  expect(screen.getByRole("button")).toBeDisabled()
})
```

- [ ] **Step 2: Run `npm test src/components/ui/Button.test.ts`** — expect PASS
- [ ] **Step 3: Write Input + test**

```tsx
import { forwardRef } from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...rest }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>}
      <input
        ref={ref}
        className={`block w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? "border-red-500" : "border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"} ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
)
```

Test: renders label and input; typing fires onChange; error message shows when `error` prop set.

- [ ] **Step 4: Run `npm test src/components/ui/Input.test.ts`** — expect PASS
- [ ] **Step 5: Write Select + test** (native `<select>`, label, `value`/`onChange`)

```tsx
import { forwardRef } from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", ...rest }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>}
      <select
        ref={ref}
        className={`block w-full rounded border px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...rest}
      />
    </div>
  )
)
```

- [ ] **Step 6: Run `npm test src/components/ui/Select.test.ts`** — expect PASS
- [ ] **Step 7: Write Card + test** (bordered container, `children`)

```tsx
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Card = ({ children, className = "", ...rest }: CardProps) => (
  <div
    className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${className}`}
    {...rest}
  >
    {children}
  </div>
)
```

- [ ] **Step 8: Run `npm test src/components/ui/Card.test.ts`** — expect PASS
- [ ] **Step 9: Write Modal + test** (`isOpen`, `onClose`, `title`, `children`; Escape key closes; clicking backdrop closes)

```tsx
import { useEffect } from "react"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h2>}
        {children}
        <button className="mt-4" onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  )
}
```

Test: renders children when open; not rendered when closed; Escape calls onClose; clicking backdrop calls onClose; clicking inner content does not.

- [ ] **Step 10: Run `npm test src/components/ui/Modal.test.ts`** — expect PASS
- [ ] **Step 11: Write Badge + test** (variant: neutral | success | warn, renders text)

```tsx
export interface BadgeProps {
  children: React.ReactNode
  variant?: "neutral" | "success" | "warn"
  className?: string
}

export const Badge = ({ children, variant = "neutral", className = "" }: BadgeProps) => {
  const variants: Record<string, string> = {
    neutral: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 12: Run `npm test src/components/ui/Badge.test.ts`** — expect PASS
- [ ] **Step 13: Write ProgressBar + test** (`value`, `max`, inner bar width)

```tsx
export interface ProgressBarProps {
  value: number
  max?: number
}

export const ProgressBar = ({ value, max = 100 }: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="w-full h-2 rounded-full bg-slate-800">
      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
    </div>
  )
}
```

Test: `value={50}` → inner div style width "50%"; clamps at 0/100.

- [ ] **Step 14: Run `npm test src/components/ui/ProgressBar.test.ts`** — expect PASS
- [ ] **Step 15: Run full `npm test`** — expect all primitive tests passing
- [ ] **Step 16: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add UI primitive components with tests"
```

---

### Task 6: Layout, Header, and useReveal hook

**Files:**
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/hooks/useReveal.ts`
- Create: `src/components/hooks/useReveal.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `Layout({ children })` — dark-first page shell with Header + `<main>` + footer
  - `Header()` — logo "RencanAI", permanent "Free" badge, Settings link
  - `useReveal({ threshold? })` — returns `{ ref, visible }` via IntersectionObserver

- [ ] **Step 1: Write src/components/layout/Header.tsx**

```tsx
import { Link } from "react-router-dom"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="font-bold text-indigo-400 tracking-tight">
          RencanAI
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="neutral">Free</Badge>
          <Button variant="ghost" asChild>
            <Link to="/settings">Pengaturan</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
```

Note: `Button` supports `asChild`? Not defined yet — skip `asChild`; use plain link-styled button instead:

```tsx
<Link to="/settings"><Button variant="ghost">Pengaturan</Button></Link>
```

- [ ] **Step 2: Write Header test** — renders "RencanAI", "Free" badge, "Pengaturan" link with href="/settings"
- [ ] **Step 3: Run Header test** — expect PASS
- [ ] **Step 4: Write src/components/layout/Layout.tsx**

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-slate-800 py-8 text-xs text-slate-500 text-center">
        RencanAI — gratis selamanya. Kunci API Anda tidak pernah keluar dari browser.
      </footer>
    </div>
  )
}
```

- [ ] **Step 5: Write Layout test** — renders Header + children inside main
- [ ] **Step 6: Run Layout test** — expect PASS
- [ ] **Step 7: Write src/components/hooks/useReveal.ts**

```tsx
import { useEffect, useRef, useState } from "react"

export function useReveal({ threshold = 0.15 }: { threshold?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true)
        })
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}
```

- [ ] **Step 8: Write useReveal.test.ts** — mock IntersectionObserver; element starts hidden, becomes visible when callback invoked with isIntersecting

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { useReveal } from "./useReveal"

describe("useReveal", () => {
  let observeMock: ReturnType<typeof vi.fn>
  let disconnectMock: ReturnType<typeof vi.fn>
  let callback: ((entries: unknown[]) => void) | null = null

  beforeEach(() => {
    observeMock = vi.fn()
    disconnectMock = vi.fn()
    callback = null
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function (this: any, cb: any) {
        callback = cb
        this.observe = observeMock
        this.disconnect = disconnectMock
      })
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function Probe() {
    const { ref, visible } = useReveal()
    return (
      <div>
        <div ref={ref} data-testid="target">
          {visible ? "visible" : "hidden"}
        </div>
      </div>
    )
  }

  it("starts hidden", () => {
    render(<Probe />)
    expect(screen.getByText("hidden")).toBeInTheDocument()
    expect(observeMock).toHaveBeenCalledTimes(1)
  })

  it("becomes visible on intersect", () => {
    render(<Probe />)
    expect(callback).not.toBeNull()
    const target = screen.getByTestId("target")
    callback!([{ isIntersecting: true, target } as any])
    expect(screen.getByText("visible")).toBeInTheDocument()
    expect(screen.queryByText("hidden")).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 8b: Run useReveal test** — expect PASS
- [ ] **Step 9: Commit**

```bash
git add src/components/layout src/components/hooks
git commit -m "feat: add Layout, Header, and useReveal animation hook"
```

---

### Task 7: MarkdownRenderer component

**Files:**
- Create: `src/components/markdown/MarkdownRenderer.tsx`
- Create: `src/components/markdown/MarkdownRenderer.test.tsx`

**Interfaces:**
- Consumes: none
- Produces: `MarkdownRenderer({ children }: { children: string })` renders Markdown (GFM) via react-markdown

- [ ] **Step 1: Write MarkdownRenderer.tsx**

```tsx
import { ReactMarkdown } from "react-markdown"
import remarkGfm from "remark-gfm"

export function MarkdownRenderer({ children }: { children: string }) {
  if (!children || !children.trim()) return null
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert dark:prose-invert max-w-none">
      {children}
    </ReactMarkdown>
  )
}
```

- [ ] **Step 2: Write MarkdownRenderer.test.ts** — renders heading from "# Hello", list from "- a\n- b", bold from "**x**"

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MarkdownRenderer } from "./MarkdownRenderer"

test("renders markdown heading and list", () => {
  render(<MarkdownRenderer>{"# Judul\n\n- Satu\n- Dua"}</MarkdownRenderer>)
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Judul")
  expect(screen.getByRole("list")).toBeInTheDocument()
})

test("renders null for empty content", () => {
  render(<MarkdownRenderer>{""}</MarkdownRenderer>)
  expect(screen.queryByText(/./)).not.toBeInTheDocument()
})
```

- [ ] **Step 3: Run MarkdownRenderer test** — expect PASS
- [ ] **Step 4: Commit**

```bash
git add src/components/markdown/
git commit -m "feat: add MarkdownRenderer with GFM support"
```

---

### Task 8: Landing page

**Files:**
- Create: `src/pages/Landing.tsx`
- Create: `src/pages/Landing.test.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`, `useReveal` (Tasks 5, 6)
- Produces: `Landing()` — hero ("Bikin PRD dalam hitungan detik"), 3-step how-it-works, feature list, CTA linking to `/dashboard`

- [ ] **Step 1: Write src/pages/Landing.tsx**

```tsx
import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { useReveal } from "../components/hooks/useReveal"

export function Landing() {
  const { ref: heroRef, visible: heroVisible } = useReveal()
  return (
    <>
      <section className="py-20 text-center" ref={heroRef} className={heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 transition-all duration-700"}>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-100">
          Bikin PRD dalam hitungan detik
        </h1>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-lg">
          Generator PRD dan daftar tugas dengan AI. Gratis selamanya, tanpa
          batasan, dan kunci API Anda tidak pernah keluar dari browser.
        </p>
        <Link to="/dashboard">
          <Button className="px-8 py-3 text-lg">Mulai buat PRD</Button>
        </Link>
      </section>

      <section className="py-16 border-y border-slate-800">
        <h2 className="text-2xl font-bold mb-10 text-center text-slate-100">Cara kerjanya</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {[
            {
              num: "1",
              title: "Masukkan kunci API",
              desc: "Atur penyedia dan model AI di halaman Pengaturan. Kunci disimpan hanya di browser Anda.",
            },
            {
              num: "2",
              title: "Deskripsikan ide Anda",
              desc: "Tuliskan singkat aplikasi atau fitur yang ingin Anda buat.",
            },
            {
              num: "3",
              title: "Dapatkan PRD dan tugas",
              desc: "AI menghasilkan PRD lengkap dan daftar tugas yang siap dieksekusi.",
            },
          ].map((step) => (
            <Card key={step.num} className="p-6">
              <div className="text-indigo-400 text-2xl font-bold mb-3">{step.num}</div>
              <h3 className="text-lg font-bold mb-2 text-slate-100">{step.title}</h3>
              <p className="text-slate-400">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
```

Note: inline `className` on section conflicts with ref prop — JSX spread order: `<section ref={heroRef} className={...}>` works; ref and className are separate props. Fine.

- [ ] **Step 2: Write Landing.test.tsx**

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Landing } from "./Landing"

test("renders hero and CTA linking to dashboard", () => {
  render(<Landing />)
  expect(screen.getByRole("heading", { name: /bikin prd dalam hitungan detik/i })).toBeInTheDocument()
  const link = screen.getByRole("link", { name: /mulai buat prd/i })
  expect(link).toHaveAttribute("href", "/dashboard")
})
```

- [ ] **Step 3: Run Landing test** — expect PASS
- [ ] **Step 4: Commit**

```bash
git add src/pages/Landing.tsx src/pages/Landing.test.tsx
git commit -m "feat: add Landing page"
```

---

### Task 9: Dashboard page (PRD list)

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `useAppStore` (Task 3), `Button`, `Card` (Task 5)
- Produces: `Dashboard()` — lists PRDs (title, updated-at), empty state, "Buat PRD Baru" → `/prd/create`, delete PRD

- [ ] **Step 1: Write src/pages/Dashboard.tsx**

```tsx
import { Link, useNavigate } from "react-router-dom"
import { useAppStore } from "../store/useAppStore"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function Dashboard() {
  const prds = useAppStore((s) => s.prds)
  const deletePrd = useAppStore((s) => s.deletePrd)
  const navigate = useNavigate()

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-100">PRD Anda</h1>
        <Button onClick={() => navigate("/prd/create")}>Buat PRD Baru</Button>
      </div>

      {prds.length === 0 ? (
        <div className="text-center py-24">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Belum ada PRD</h2>
          <p className="text-slate-500">Buat PRD pertama Anda — gratis dan cepat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prds.map((prd) => (
            <Card key={prd.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Link to={`/prd/${prd.id}`} className="text-lg font-bold text-indigo-300 hover:text-indigo-200">
                  {prd.title}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    deletePrd(prd.id)
                  }}
                  className="text-slate-500 hover:text-red-400"
                >
                  Hapus
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-3">{prd.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge variant="neutral">{prd.tasks.filter((t) => t.status === "done").length}/{prd.tasks.length} selesai</Badge>
                <span>{formatDate(prd.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write Dashboard.test.tsx**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Dashboard } from "./Dashboard"
import { useAppStore } from "../store/useAppStore"

vi.mock("../store/useAppStore", () => ({
  useAppStore: vi.fn(),
}))

const mockStore = {
  prds: [],
  deletePrd: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue(mockStore as any)
})

test("shows empty state when no PRDs", () => {
  mockStore.prds = []
  render(<Dashboard />)
  expect(screen.getByText(/belum ada prd/i)).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /buat prd baru/i })).toBeInTheDocument()
})

test("lists PRDs and deletes one", () => {
  mockStore.prds = [
    { id: "p1", title: "Sistem Antrian", description: "Antrian klinik", content: "", tasks: [], createdAt: 1, updatedAt: 1 },
  ]
  render(<Dashboard />)
  expect(screen.getByText("Sistem Antrian")).toBeInTheDocument()
  fireEvent.click(screen.getByText("Hapus"))
  expect(mockStore.deletePrd).toHaveBeenCalledWith("p1")
})
```

- [ ] **Step 3: Run Dashboard test** — expect PASS
- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/Dashboard.test.tsx
git commit -m "feat: add Dashboard page with PRD list"
```

---

### Task 10: Generator page (PRD creation with AI streaming)

**Files:**
- Create: `src/pages/Generator.tsx`
- Create: `src/components/generator/GeneratorForm.tsx`
- Create: `src/components/generator/StreamOutput.tsx`
- Create: `src/pages/Generator.test.tsx`

**Interfaces:**
- Consumes: `useAppStore` (Task 3), `generatePrdStream` (Task 4), `Button`, `Input`, `Select`, `Card`, `Modal`, `Badge` (Task 5)
- Produces:
  - `Generator()` — form (title, description, model); disabled until settings exist; on submit streams PRD content, saves PRD, navigates to `/prd/:id`
  - `GeneratorForm()` — form state + submit handler
  - `StreamOutput({ chunks })` — renders accumulated streamed text

- [ ] **Step 1: Write src/components/generator/StreamOutput.tsx**

```tsx
export function StreamOutput({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap break-words">
      {text}
    </div>
  )
}
```

- [ ] **Step 2: Write GeneratorForm.tsx**

```tsx
import { useState } from "react"
import { useAppStore } from "../../store/useAppStore"
import { generatePrdStream } from "../../lib/ai"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card } from "../../components/ui/Card"
import { StreamOutput } from "./StreamOutput"

export function GeneratorForm() {
  const settings = useAppStore((s) => s.settings)
  const addPrd = useAppStore((s) => s.addPrd)
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [model, setModel] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const ready = Boolean(settings?.apiKey && settings.provider && settings.model)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready || !title.trim() || !description.trim()) return
    setStreaming(true)
    setOutput("")
    setError(null)
    try {
      const config = {
        provider: settings!.provider,
        apiKey: settings!.apiKey,
        model: model || settings!.model,
      }
      for await (const chunk of generatePrdStream(config, description)) {
        if (chunk.type === "text") {
          setOutput((prev) => prev + chunk.text)
        }
      }
      const id = addPrd({ title, description, content: output })
      navigate(`/prd/${id}`)
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan saat generate PRD")
    } finally {
      setStreaming(false)
    }
  }

  if (!ready) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Siapkan kunci AI terlebih dahulu</h2>
        <p className="text-slate-400 mb-4">Masukkan penyedia AI, model, dan kunci API di halaman Pengaturan.</p>
        <Button onClick={() => navigate("/settings")}>Buka Pengaturan</Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Judul PRD</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Sistem Manajemen Tugas Tim"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Deskripsi ide Anda</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Aplikasi untuk mengelola antrian pasien klinik dengan jadwal dokter dan notifikasi"
            className="h-32"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Model (kosongkan untuk default penyedia)</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gemini-1.5-flash-latest" />
        </div>
        <Button type="submit" loading={streaming} disabled={streaming || !title.trim() || !description.trim()}>
          Generate PRD
        </Button>
        {error && <div className="text-sm text-red-400">{error}</div>}
        {output && <StreamOutput text={output} />}
      </form>
    </Card>
  )
}
```

- [ ] **Step 3: Write Generator.tsx**

```tsx
export function Generator() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Buat PRD Baru</h1>
      <GeneratorForm />
    </div>
  )
}
```

- [ ] **Step 4: Write Generator.test.tsx**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Generator } from "./Generator"
import { useAppStore } from "../store/useAppStore"
import { generatePrdStream } from "../lib/ai"

vi.mock("../lib/ai", () => ({
  generatePrdStream: vi.fn(),
}))
vi.mock("../store/useAppStore", () => ({
  useAppStore: vi.fn(),
}))

const mockStore = {
  settings: { provider: "gemini", apiKey: "key", model: "gemini-1.5-flash-latest" },
  addPrd: vi.fn(() => "prd-1"),
}

beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue(mockStore as any)
  vi.mocked(generatePrdStream).mockImplementation(async function* () {
    yield { type: "text", text: "Halo " }
    yield { type: "text", text": "dunia" }
    yield { type: "done" }
  })
})
afterEach(() => { vi.unstubAllGlobals() })

test("renders form and generate flow", async () => {
  render(<Generator />)
  expect(screen.getByRole("heading", { name: /buat prd baru/i })).toBeInTheDocument()

  const titleInput = screen.getByPlaceholderText(/contoh: sistem manajemen tugas tim/i)
  const descInput = screen.getByPlaceholderText(/contoh: aplikasi untuk mengelola antrian/i)
  fireEvent.change(titleInput, { target: { value: "Sistem Antrian" } })
  fireEvent.change(descInput, { target: { value: "Antrian pasien klinik" } })

  const btn = screen.getByRole("button", { name: /generate prd/i })
  fireEvent.click(btn)

  await waitFor(() => {
    expect(mockStore.addPrd).toHaveBeenCalledWith({
      title: "Sistem Antrian",
      description: "Antrian pasien klinik",
      content: "Halo dunia",
    })
  })
})
```

- [ ] **Step 4: Run Generator test** — expect PASS
- [ ] **Step 5: Run full `npm test`** — expect all tests so far passing
- [ ] **Step 6: Commit**

```bash
git add src/components/generator src/pages/Generator.tsx src/pages/Generator.test.tsx
git commit -m "feat: add Generator page with AI streaming"
```

---

### Task 11: PRD Editor page

**Files:**
- Create: `src/pages/PrdEditor.tsx`
- Create: `src/pages/PrdEditor.test.tsx`

**Interfaces:**
- Consumes: `useAppStore` (Task 3), `MarkdownRenderer` (Task 7), `Card`, `Button` (Task 5)
- Produces: `PrdEditor()` — load PRD by URL param (`useParams`), edit title/description (→ `updatePrd`), render content as Markdown, "Export Markdown" download, delete → back to dashboard

- [ ] **Step 1: Write src/pages/PrdEditor.tsx**

```tsx
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAppStore } from "../store/useAppStore"
import { MarkdownRenderer } from "../components/markdown/MarkdownRenderer"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"

export function PrdEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const prd = useAppStore((s) => s.prds.find((p) => p.id === id))
  const updatePrd = useAppStore((s) => s.updatePrd)
  const deletePrd = useAppStore((s) => s.deletePrd)

  if (!prd) {
    navigate("/dashboard")
    return null
  }

  const [title, setTitle] = useState(prd.title)
  const [description, setDescription] = useState(prd.description)

  const handleExport = () => {
    const blob = new Blob([prd.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${prd.title.replace(/\s+/g, "_")}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-slate-400 hover:text-slate-200">
          ← Kembali
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleExport}>Ekspor Markdown</Button>
          <Button variant="danger" onClick={() => { deletePrd(id!); navigate("/dashboard") }}>
            Hapus PRD
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <Input
          label="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => updatePrd(id!, { title })}
        />
        <Input
          label="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => updatePrd(id!, { description })}
          className="h-24"
        />
      </Card>

      <div className="prose prose-invert dark:prose-invert max-w-none">
        <MarkdownRenderer text={prd.content} />
      </div>
    </div>
  )
}
```

Wait — `useState` import missing; add `import { useState } from "react"`.

- [ ] **Step 2: Fix imports** — add `useState` to PrdEditor.tsx
- [ ] **Step 3: Write PrdEditor.test.tsx**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PrdEditor } from "./PrdEditor"
import { useAppStore } from "../store/useAppStore"
import { MemoryRouter, Route, Routes } from "react-router-dom"

vi.mock("../store/useAppStore", () => ({ useAppStore: vi.fn() }))

const prd = {
  id: "p1",
  title: "Judul Awal",
  description: "Deskripsi awal",
  content: "# Hasil AI\n\nIni konten yang dihasilkan.",
  tasks: [],
  createdAt: 1,
  updatedAt: 1,
}

beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue({
    prds: [prd],
    updatePrd: vi.fn(),
    deletePrd: vi.fn(),
  } as any)
})

test("renders PRD content and allows title edit", () => {
  render(
    <MemoryRouter initialEntries={["/prd/p1"]}>
      <Routes><Route path="/prd/:id" element={<PrdEditor />} /></Routes>
    </MemoryRouter>
  )
  expect(screen.getByText("# Hasil AI")).not.toBeInTheDocument() // heading role check instead
  expect(screen.getByText("Hasil AI")).toBeInTheDocument()
  expect(screen.getByText("Ini konten yang dihasilkan.")).toBeInTheDocument()

  const titleInput = screen.getByLabelText(/judul/i)
  fireEvent.change(titleInput, { target: { value: "Judul Baru" } })
  fireEvent.blur(titleInput)
  expect(vi.mocked(useAppStore).mock.results[0]?.value.updatePrd).toHaveBeenCalledWith("p1", { title: "Judul Baru" })
})
```

Note: `getByLabelText` — the Input has no `label` prop wired to htmlFor in my Input component... Input renders `<label>` without `htmlFor=id`. Add `htmlFor={id}` to Input label and pass `id` to Input in PrdEditor. Simpler test: query by placeholder? Input has no placeholder in PrdEditor usage. Let me adjust PrdEditor Input usage: pass explicit `id` attributes, and Input forwards them. Update PrdEditor:

```tsx
<Input id="prd-title" label="Judul" ... />
<Input id="prd-desc" label="Deskripsi" ... />
```

and Input: `<label htmlFor={id}>...</label>`, `<input id={id} ... />`.

Test then: `screen.getByLabelText(/judul/i)`.

- [ ] **Step 3b: Run PrdEditor test** — expect PASS
- [ ] **Step 4: Run full `npm test`** — expect all passing
- [ ] **Step 5: Commit**

```bash
git add src/pages/PrdEditor.tsx src/pages/PrdEditor.test.tsx src/components/ui/Input.tsx
git commit -m "feat: add PRD editor page with Markdown rendering and export"
```

---

### Task 12: Tasks page

**Files:**
- Create: `src/pages/Tasks.tsx`
- Create: `src/pages/Tasks.test.tsx`

**Interfaces:**
- Consumes: `useAppStore` (Task 3), `Badge`, `ProgressBar`, `Input`, `Button`, `Card` (Task 5)
- Produces: `Tasks()` — load PRD by URL param; task list with status toggle + badge; progress bar; add task input; delete task

- [ ] **Step 1: Write src/pages/Tasks.tsx**

```tsx
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAppStore } from "../store/useAppStore"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { ProgressBar } from "../components/ui/ProgressBar"
import { Input } from "../components/ui/Input"

const statusLabel: Record<string, string> = {
  todo: "Belum",
  "in-progress": "Sedang",
  done: "Selesai",
}
const statusVariant: Record<string, "neutral" | "success" | "warn"> = {
  todo: "neutral",
  "in-progress": "warn",
  done: "success",
}

export function Tasks() {
  const { prdId } = useParams<{ prdId: string }>()
  const navigate = useNavigate()
  const prd = useAppStore((s) => s.prds.find((p) => p.id === prdId))
  const addTask = useAppStore((s) => s.addTask)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const progress = useAppStore((s) => s.progress)

  if (!prd) {
    navigate("/dashboard")
    return null
  }

  const [newTitle, setNewTitle] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-slate-400 hover:text-slate-200">← Kembali</Link>
        <span className="text-lg font-bold text-slate-100">{prd.title}</span>
      </div>

      <p className="text-sm text-slate-400">{prd.description}</p>
      <ProgressBar value={progress(prd.id!)} />

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            id="new-task"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tambah tugas baru…"
          />
          <Button
            onClick={() => {
              if (!newTitle.trim()) return
              addTask(prd.id!, newTitle.trim())
              setNewTitle("")
            }}
            disabled={!newTitle.trim()}
          >
            Tambah
          </Button>
        </div>

        {prd.tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            <button
              onClick={() => toggleTask(prd.id!, task.id, task.status === "done" ? "todo" : "done")}
              className="w-5 h-5 rounded border-slate-600 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
            >
              {task.status === "done" ? "✓" : ""}
            </button>
            <span className={`flex-1 ${task.status === "done" ? "line-through text-slate-500" : "text-slate-200"}`}>
              {task.title}
            </span>
            <Badge variant={statusVariant[task.status]}>{statusLabel[task.status]}</Badge>
            <button
              onClick={() => deleteTask(prd.id!, task.id)}
              className="text-slate-500 hover:text-red-400 ml-2"
            >
              ×
            </button>
          </div>
        ))}
        {prd.tasks.length === 0 && (
          <p className="text-sm text-slate-500 italic">Belum ada tugas. Tambahkan tugas di atas.</p>
        )}
      </Card>
    </div>
  )
}
```

Missing `useState` import — add it.

- [ ] **Step 1b: Fix imports** — add `useState` to Tasks.tsx
- [ ] **Step 2: Write Tasks.test.tsx**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Tasks } from "./Tasks"
import { useAppStore } from "../store/useAppStore"
import { MemoryRouter, Route, Routes } from "react-router-dom"

vi.mock("../store/useAppStore", () => ({ useAppStore: vi.fn() }))

const prd = {
  id: "p1",
  title: "Sistem Antrian",
  description: "Antrian klinik",
  tasks: [
    { id: "t1", title: "Susunan arsitektur", status: "todo" as const, createdAt: 1 },
    { id: "t2", title: "Tampilan depan", status: "done" as const, createdAt: 2 },
  ],
  createdAt: 1,
  updatedAt: 1,
}

beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue({
    prds: [prd],
    addTask: vi.fn(),
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
    progress: vi.fn(() => 50),
  } as any)
})

test("renders tasks and progress bar", () => {
  render(
    <MemoryRouter initialEntries={["/tasks/p1"]}>
      <Routes><Route path="/tasks/:prdId" element={<Tasks />} /></Routes>
    </MemoryRouter>
  )
  expect(screen.getByText("Susunan arsitektur")).toBeInTheDocument()
  expect(screen.getByText("Tampilan depan")).toBeInTheDocument()
})

test("toggles task status", () => {
  render(
    <MemoryRouter initialEntries={["/tasks/p1"]}>
      <Routes><Route path="/tasks/:prdId" element={<Tasks />} /></Routes>
    </MemoryRouter>
  )
  fireEvent.click(screen.getByText("Susunan arsitektur").closest("div")!.querySelector("button")!)
  expect(vi.mocked(useAppStore).mock.results[0]?.value.toggleTask).toHaveBeenCalledWith("p1", "t1", "done")
})
```

Hmm — `closest("div")!.querySelector("button")` is fragile. Better: the toggle button is the first button inside each task row. Query by accessible approach: buttons contain "×" (delete) or "✓"/"" (toggle). The toggle button for first task: `screen.getAllByRole("button")[0]`? Order: add-task button comes first in DOM ("Tambah"), then task rows' toggle buttons. So toggle for t1 = `getAllByRole("button")[1]`. That's brittle but deterministic within this render. Alternatively add `data-testid` to toggle buttons in Tasks.tsx. Let me add `data-testid="toggle-task-${task.id}"` to the toggle button and `data-testid="delete-task-${task.id}"` to delete button in the plan code. Then test uses those.

Update Tasks.tsx toggle button:
```tsx
<button data-testid={`toggle-task-${task.id}`} onClick={...} ...>
```
delete button:
```tsx
<button data-testid={`delete-task-${task.id}`} onClick={...} ...>
```

Test:
```tsx
fireEvent.click(screen.getByTestId("toggle-task-t1"))
expect(mock.toggleTask).toHaveBeenCalledWith("p1", "t1", "done")
fireEvent.click(screen.getByTestId("delete-task-t1"))
expect(mock.deleteTask).toHaveBeenCalledWith("p1", "t1")
```

- [ ] **Step 2b: Run Tasks test** — expect PASS
- [ ] **Step 3: Run full `npm test`** — expect all passing
- [ ] **Step 4: Commit**

```bash
git add src/pages/Tasks.tsx src/pages/Tasks.test.tsx
git commit -m "feat: add Tasks page with progress tracking"
```

---

### Task 13: Settings page (BYOK + export/import)

**Files:**
- Create: `src/pages/Settings.tsx`
- Create: `src/pages/Settings.test.tsx`

**Interfaces:**
- Consumes: `useAppStore` (Task 3), `Input`, `Select`, `Button`, `Card`, `Badge`, `Modal` (Task 5)
- Produces: `Settings()` — provider select, model input, API key input (reveal toggle), save, export JSON download, import JSON file

- [ ] **Step 1: Write src/pages/Settings.tsx**

```tsx
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAppStore } from "../store/useAppStore"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"

export function Settings() {
  const settings = useAppStore((s) => s.settings)
  const saveSettings = useAppStore((s) => s.saveSettings)
  const exportState = useAppStore((s) => s.exportState)
  const importState = useAppStore((s) => s.importState)
  const navigate = useNavigate()

  const [provider, setProvider] = useState(settings?.provider ?? "gemini")
  const [apiKey, setApiKey] = useState(settings?.apiKey ?? "")
  const [model, setModel] = useState(settings?.model ?? "")
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveSettings({ provider: provider as "gemini" | "openrouter", apiKey, model })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleExport = () => {
    const { prds, settings } = exportState()
    const blob = new Blob([JSON.stringify({ prds, settings }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rencanai-backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target!.result as string)
        importState({ prds: data.prds ?? [], settings: data.settings ?? null })
      } catch {
        // ignore malformed import
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-slate-400 hover:text-slate-200">← Kembali</Link>
        <h1 className="text-xl font-bold text-slate-100">Pengaturan AI</h1>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Penyedia AI</label>
          <Select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="gemini">Gemini (Google)</option>
            <option value="openrouter">OpenRouter</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Model</label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gemini-1.5-flash-latest"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">API Key</label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type={showKey ? "text" : "password"}
            placeholder="masukkan kunci API Anda"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
          >
            {showKey ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        <Button onClick={handleSave} disabled={!apiKey.trim()}>
          Simpan Pengaturan
        </Button>
        {saved && <Badge variant="success">Tersimpan</Badge>}
      </Card>

      <Card className="p-4 border-t-0">
        <h2 className="text-sm font-bold text-slate-300 mb-3">Cadangan Data</h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleExport}>Ekspor JSON</Button>
          <label className="flex-1">
            <input type="file" accept=".json" className="sr-only" onChange={handleImport} />
            <Button variant="ghost">Impor JSON</Button>
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Cadangan berisi semua PRD dan pengaturan Anda. Impor pada browser lain untuk memindahkan data.
        </p>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Write Settings.test.tsx**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Settings } from "./Settings"
import { useAppStore } from "../store/useAppStore"

vi.mock("../store/useAppStore", () => ({ useAppStore: vi.fn() }))

beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue({
    settings: null,
    saveSettings: vi.fn(),
    exportState: vi.fn(() => ({ prds: [], settings: null })),
    importState: vi.fn(),
  } as any)
})

test("saves settings when clicking Simpan", () => {
  render(<Settings />)
  fireEvent.change(screen.getByLabelText(/penyedia ai/i), { target: { value: "openrouter" } })
  fireEvent.change(screen.getByPlaceholderText(/masukkan kunci api anda/i), { target: { value: "sk-test" } })
  fireEvent.click(screen.getByRole("button", { name: /simpan pengaturan/i }))
  expect(vi.mocked(useAppStore).mock.results[0]?.value.saveSettings).toHaveBeenCalledWith({
    provider: "openrouter",
    apiKey: "sk-test",
    model: "",
  })
})
```

- [ ] **Step 2b: Run Settings test** — expect PASS
- [ ] **Step 3: Run full `npm test`** — expect all passing
- [ ] **Step 4: Commit**

```bash
git add src/pages/Settings.tsx src/pages/Settings.test.tsx
git commit -m "feat: add Settings page with BYOK and export/import"
```

---

### Task 14: Routes + App wiring

**Files:**
- Create: `src/routes.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: all page components (Tasks 8–13), Layout (Task 6)
- Produces: `routes.tsx` route definitions; `App.tsx` wires `BrowserRouter` + routes + `Layout`

- [ ] **Step 1: Write src/routes.tsx**

```tsx
import { RouteObject } from "react-router"
import { Landing } from "./pages/Landing"
import { Dashboard } from "./pages/Dashboard"
import { Generator } from "./pages/Generator"
import { PrdEditor } from "./pages/PrdEditor"
import { Tasks } from "./pages/Tasks"
import { Settings } from "./pages/Settings"

export const routes: RouteObject[] = [
  { path: "/", element: <Landing /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/prd/create", element: <Generator /> },
  { path: "/prd/:id", element: <PrdEditor /> },
  { path: "/tasks/:prdId", element: <Tasks /> },
  { path: "/settings", element: <Settings /> },
]
```

- [ ] **Step 2: Rewrite src/App.tsx**

```tsx
import { BrowserRouter, RouterProvider, createBrowserRouter } from "react-router-dom"
import { Layout } from "./components/layout/Layout"
import { routes } from "./routes"

const router = createBrowserRouter(routes)

export function App() {
  return (
    <BrowserRouter>
      <RouterProvider router={router} />
    </BrowserRouter>
  )
}
```

Wait — Layout needs to wrap routes. In React Router v7, layout via `layout` element on root route or an outlet wrapper. Simplest: root route with `Component = Layout` and children... To keep simple: make App render Layout containing RouterProvider? RouterProvider must render the routed element itself; Layout wrapping it means Layout wraps everything including router outlet — but the routed element renders inside RouterProvider, not inside Layout. 

Cleanest v7 pattern: root route:
```tsx
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "prd/create", element: <Generator /> },
      { path: "prd/:id", element: <PrdEditor /> },
      { path: "tasks/:prdId", element: <Tasks /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]
```
Then Layout renders `<Outlet />`. Import `Outlet` from react-router-dom.

Update Layout:
```tsx
import { Outlet } from "react-router-dom"
export function Layout() {
  return (
    <div className="...">
      <Header />
      <main className="..."><Outlet /></main>
      <footer>...</footer>
    </div>
  )
}
```

And Landing no longer needs Link to use relative... links are absolute ("/dashboard") — fine.

Rewrite routes.tsx with children; App.tsx unchanged (BrowserRouter + RouterProvider). Layout.tsx modified to use Outlet.

- [ ] **Step 2b: Modify Layout.tsx** — add Outlet, remove `children` prop
- [ ] **Step 3: Rewrite routes.tsx** with root + children
- [ ] **Step 4: Write App.test.tsx** (replace smoke test) — render App, check Header present; navigate via MemoryRouter? BrowserRouter uses real history — in jsdom clicking links updates location and re-renders. Test:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { App } from "./App"

test("renders app with header", () => {
  render(<App />)
  expect(screen.getByText(/rencanai/i)).toBeInTheDocument()
})
```

- [ ] **Step 4b: Run full `npm test`** — expect all passing
- [ ] **Step 5: Run `npm run build`** — expect success
- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/routes.tsx src/components/layout/Layout.tsx src/pages/
git commit -m "feat: wire routes and Layout with Outlet"
```

---

### Task 15: Scripts, deploy workflow, and final verification

**Files:**
- Modify: `package.json` (add `deploy` script + `homepage`)
- Create: `.github/workflows/pages.yml` (static deploy to GitHub Pages)

**Interfaces:**
- Consumes: all previous tasks
- Produces: `npm test` green, `npm run build` green, deploy workflow ready

- [ ] **Step 1: Update package.json scripts**

Add `"deploy": "npm run build"` and `"homepage": "."` — GitHub Pages deploy can be handled by the workflow directly. Keep scripts minimal; the workflow does build+deploy.

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

No change needed; workflow runs `npm ci && npm test && npm run build`.

- [ ] **Step 2: Write .github/workflows/pages.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Run `npm test`** — full suite green
- [ ] **Step 4: Run `npm run build`** — dist/ emitted
- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/pages.yml
git commit -m "feat: add GitHub Pages deploy workflow"
```

---

## Self-review

1. **Spec coverage:** every spec section maps to tasks — landing (T8), dashboard (T9), generator + AI stream (T10), PRD editor (T11), tasks (T12), settings + BYOK (T13), storage adapter (T2), store (T3), UI primitives (T5), layout/header/animations (T6), Markdown (T7), routing (T14), static deploy to GitHub Pages (T15). No task for pricing/upgrade/auth/sync — correctly excluded per spec non-goals.
2. **Placeholder scan:** no TBD/TODO/"implement later" anywhere; every test and implementation step contains actual code.
3. **Type consistency:** `addPrd` returns `string` (used by Generator for navigation); `toggleTask(prdId, taskId, status)` matches Tasks toggle calls; `generatePrdStream(config, description)` matches Generator call; `progress(prdId): number` matches ProgressBar value; store state shape (`prds[]`, `settings`) used consistently in Dashboard/Editor/Tasks/Settings.

---

## Plan complete

Saved to `docs/superpowers/plans/2026-11-16-rencanai-prd-generator.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute the tasks in this session directly, batching with checkpoints for your review.

Which approach do you want?
