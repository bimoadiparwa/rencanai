# RencanAI — AI PRD Generator (Free Version)

**Spec:** `docs/superpowers/specs/2026-11-16-rencanai-prd-generator-design.md`
**Status:** Draft — pending user review
**Date:** 2026-11-16

---

## 1. Overview

RencanAI is a free, local-first web app that generates Product Requirement Documents (PRDs) and task lists using AI. The user brings their own API key (BYOK — Gemini free tier, OpenRouter free models, etc.); keys and documents never leave the browser. There is no backend, no paywall, no upgrade path — everything in v1 is completely free.

The product is inspired by the features of ngodingpakeai.com (duration-tab pricing, scroll-reveal animations, promo/modal UX, dark-hero layout) but with its own branding (`RencanAI`), its own design system, and its own scope: PRD generation + task list only.

---

## 2. Goals & non-goals

### Goals
- Generate a complete PRD (overview, objectives, user stories, functional + non-functional requirements, tech stack, suggested tasks) from a short project description.
- Stream AI output into the PRD as it arrives.
- Manage tasks per PRD (todo/in-progress/done) with progress tracking.
- Export PRD to Markdown; import/export project JSON for backup.
- Run entirely client-side with zero hosting cost; deploy static to GitHub Pages.
- Mobile-responsive, dark-first UI.

### Non-goals (v1)
- User accounts, authentication, cross-device sync, shared links.
- Backend of any kind (no server, no database, no API key proxy).
- Design canvas / image generation (Desainpakeai-equivalent deferred).
- Multi-model chat (AndalAI-equivalent deferred).
- Pricing pages, upgrade flows, payment integration.
- Real-time collaboration.

---

## 3. Tech stack (chosen for speed)

| Layer | Choice | Reason |
|-------|--------|--------|
| Build tool | **Vite 7** | Coldest dev start, instant HMR, zero-config static build |
| Framework | **React 19** | Familiar, huge ecosystem, streaming-friendly |
| Language | **TypeScript strict** | Catches errors at build time, no runtime surprises |
| Styling | **Tailwind v4** | CSS-first, no build-step class scanning overhead, fast iteration |
| Routing | **React Router v7** | File-based or config routes, tiny client-side router |
| State | **Zustand** (one store) | Minimal boilerplate, persists to localStorage via middleware |
| Storage | **localStorage** | No backend, instant read/write, works offline |
| AI client | Native `fetch` | No heavy SDKs; stream via SSE/fetch ReadableStream |
| Testing | **Vitest + React Testing Library** | Fast, Vite-native |
| Deploy | **GitHub Pages** (static) | $0, integrated with this repo |

Total build-time dependency count: deliberately minimal. Every extra package is a decision gate.

---

## 4. Architecture

```
browser (single tab)
├── React Router (client-side routes)
├── Zustand store (PRDs, tasks, settings, UI state)
│   └── localStorage persistence (key: rencanai-v1)
├── Components (own design system)
│   ├── Button, Input, Select, Card, Modal, Badge, ProgressBar
│   ├── Markdown renderer (react-markdown + remark-gfm)
│   └── animations: IntersectionObserver scroll-reveal, modal fade/scale
└── AI service (browser → provider API directly)
    ├── Gemini: streamGenerateContent (streaming)
    └── OpenRouter: completions/chat completions (streaming)
```

Data flow:
1. `Settings` page → user picks provider + model + API key → persisted to `localStorage`.
2. Generator form submits project name/description → `prdService.generate()` streams chunks from provider → each chunk appended to PRD Markdown content live.
3. On completion, PRD saved to localStorage → redirect to `/prd/:id`.
4. Tasks created from PRD's suggested tasks; toggling status optimistic-update + persist.
5. Export/Import: JSON dump/load of all PRDs; Markdown export of single PRD.

Storage abstraction: `StorageAdapter` interface (`get`, `set`, `remove`, `list`, `clear`). v1 implements `LocalStorageAdapter`. A later sync adapter can be dropped in without touching UI.

---

## 5. Routes & pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Hero ("Bikin PRD dalam hitungan detik"), how-it-works (3 steps), feature list, CTA to dashboard |
| `/dashboard` | PRD List | List of saved PRDs (title, updated-at), empty state, "Buat PRD Baru" button |
| `/prd/create` | Generator | Form: project name, description, model override; Generate button; streaming output |
| `/prd/:id` | PRD Editor | Title/description edits, rendered Markdown content, task list inline, Export Markdown |
| `/tasks/:prdId` | Tasks | Task list with status toggles, progress bar, add/edit/delete task |
| `/settings` | Settings | Provider select, API key input (hidden), model select, export/import JSON |

**Header** (all pages): RencanAI logo, "Free" badge (permanent — never an upsell), Settings link. Footer: minimal.

No login, no pricing table, no checkout, no plan cards — those features from the reference site are intentionally excluded so the app stays free.

---

## 6. Components (own design system)

Primitive components, each one file:
- `Button` — primary/ghost/danger variants, loading state
- `Input` — text, with optional reveal toggle (for API key)
- `Select` — provider/model pickers
- `Card` — surface container with subtle border
- `Modal` — overlay + backdrop, esc-to-close, focus trap
- `Badge` — "Free", status pills
- `ProgressBar` — task completion %
- `Markdown` — `react-markdown` renderer for PRD content
- `EmptyState` — illustration + CTA for empty lists

Design tokens (own, not cloned):
- Primary: indigo-600; accent: violet-500
- Surface: slate-50 (light) / slate-900 (dark-first default)
- Text: slate-900 / slate-100; muted: slate-500/400

Animations (our own implementation of the reveal pattern seen on the reference site):
- `useReveal` — IntersectionObserver hook; elements fade/slide up when they enter viewport
- Modal: scale-down + fade entrance/exit
- Task toggle: optimistic color transition

---

## 7. Data model

```ts
// PRD
{
  id: string;            // ulid or crypto.randomUUID
  title: string;         // e.g. "Sistem Manajemen Tugas Tim"
  description: string;   // user's input brief
  content: string;       // generated Markdown PRD
  tasks: Task[];
  createdAt: number;     // epoch ms
  updatedAt: number;
}

// Task
{
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  createdAt: number;
}

// Settings
{
  provider: "gemini" | "openrouter";
  apiKey: string;        // localStorage only
  model: string;         // e.g. "gemini-1.5-flash-latest"
}
```

---

## 8. AI generation flow (BYOK)

1. User enters provider + API key + model in `/settings` → saved to localStorage immediately.
2. On `/prd/create`, "Generate" is disabled until settings are complete.
3. Submit → POST to provider endpoint:
   - Gemini: `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={key}`
   - OpenRouter: `https://openrouter.ai/api/v1/chat/completions` with `stream: true`
   - System prompt: expert product manager; output sections: Overview, Objectives, User Stories, Functional Requirements, Non-Functional Requirements, Tech Stack, Suggested Tasks.
4. Stream chunks appended to PRD content in real time; "Generating…" indicator with cancel (AbortController).
5. On done → save PRD → navigate to `/prd/:id`. On error → inline error card with "Perbaiki di Settings" link.

Error cases handled: invalid key (401), quota exceeded (429), network failure, malformed stream — all with user-facing Indonesian messages.

---

## 9. Error handling & edge cases

- No settings → generator disabled, settings banner on dashboard.
- Empty generation → validation error, no API call.
- Stream interrupted → last good content retained, retry button.
- localStorage full / quota exceeded → clear old PRDs warning, export-first prompt.
- Offline → generation blocked, "Anda sedang offline" banner.

---

## 10. Testing

- **Vitest + RTL**: storage adapter round-trip, PRD/task reducers, streaming chunk parser, form validation.
- Component tests: Generator form submission, task toggle optimistic update, modal open/close.
- Target: ≥ 80% line coverage on `src/lib` and `src/store`.
- Playwright E2E: optional post-v1 (skip for v1 speed).

---

## 11. Deployment

`npm run build` → `dist/` → GitHub Pages (`gh-pages` or Actions static deploy). $0/month. Custom domain optional later.

---

## 12. Open questions (deferrable post-v1)

- Cross-device sync (requires backend — explicitly deferred).
- Public share links for PRDs (deferred).
- More providers (Anthropic, Groq) — provider interface makes this additive.
- Task due dates, assignees, priorities — deferred beyond v1 status toggle.

---

## 13. Success criteria (v1)

- User can open the site, enter an API key, generate a PRD in < 30s, and see tasks created — all without creating an account or paying anything.
- Zero backend infra cost.
- Lighthouse ≥ 90 on performance, accessibility, best practices.

---

*Next step (pending your review): if this spec looks right, I'll commit it and then invoke the writing-plans skill to produce the implementation plan.*
