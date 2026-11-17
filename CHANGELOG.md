# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- PWA (offline-ready, installable)
- Standalone task-list generator
- AI design tools (original scope beyond PRD)
- Multi-model chat for PRD iteration

## [0.3.0] - 2026-11-17

### Added
- **Light / Dark / System theme.** Semantic tokens get dark values under a
  `.dark` class on `<html>`; a pre-paint inline script in `index.html` prevents
  dark-mode flash; "system" follows the OS `prefers-color-scheme` live. Header
  gets a theme cycle button (sun/moon/monitor) and the browser theme-color meta
  follows the resolved theme.
- **Bilingual UI: English (default) and Bahasa Indonesia.** Lightweight typed
  dictionary (`src/i18n/`) with a singleton `t()` so lib code translates too;
  header language toggle; `html[lang]` syncs; dates follow the UI locale; the
  generated PRD is written in the UI language (separate ID/EN system prompts).
  Settings page and provider copy fully translated in both languages.

### Fixed
- **Mobile layout.** Landing stamp seal no longer covers the card meta at 375px;
  modal scrolls on small viewports with a larger close target; markdown tables
  scroll horizontally; checkboxes enlarged; delete/reveal buttons got bigger
  touch targets; add-task form stacks vertically on phones.
- `color-scheme` declared per theme, so native selects/scrollbars match dark mode.

### Changed
- Default UI language is now English; Indonesian remains fully supported
  (switch via the header toggle).

## [0.2.0] - 2026-11-17

### Fixed
- **Generation workflow end-to-end.** API keys were silently lost on page reload
  because the store double-encoded persisted JSON; settings now persist correctly
  and older saved formats are recovered automatically.
- **Gemini streaming.** Requests now use `streamGenerateContent?alt=sse` with the
  key in the `x-goog-api-key` header, and the parser handles CRLF framing,
  thought-part filtering, and in-stream provider error objects.
- **Broken PRD save on plain-HTTP origins.** `crypto.randomUUID` is unavailable
  outside secure contexts (e.g. LAN addresses); replaced with a safe `makeId()`
  helper. A failure during save is no longer misreported as a network error.
- **Retired/paid models removed from pickers** (`gemini-1.5-*`, `openrouter/auto`,
  `llama3-*`, Claude). The create page now reads the active provider/model from
  shared settings instead of keeping stale local state.

### Added
- **Structured best-practice PRD template** — fixed 16-section system prompt with
  measurable goals, stable IDs (FR-/NFR-/US-/R-/Q-), P0/P1/P2 priorities,
  Given/When/Then acceptance criteria, and a "no invented facts" rule; temperature
  lowered to 0.4 for structural consistency.
- **Automatic task extraction** — the PRD's "Daftar Tugas" checklist becomes real
  tasks (todo by default) in the Tasks board.
- **"Tes API key" button** in Settings: one small non-streaming call proves the
  key and model work, surfacing the provider's exact failure reason; save now
  confirms with "Tersimpan."
- **Browser end-to-end test** (`scripts/e2e-browser.mjs`): drives the real app in
  Chromium over CDP, intercepting provider traffic at the network layer to verify
  each request's URL, auth header, model, and SSE handling for every free model
  of every provider; supports a live mode against the real OpenRouter API.
- Human-readable Indonesian error messages for invalid keys, unknown models,
  rate limits, empty streams, and connection failures.

### Changed
- **Free models only.** Provider catalog rebuilt from live sources: Gemini 5,
  OpenRouter 14 (`:free` / free router), Groq 4. Anthropic removed entirely (no
  free tier). Settings and PrdCreate now share one source of truth
  (`src/lib/providers.ts`).

## [0.1.0] - 2026-11-16

### Added
- Initial release.
- Project scaffold: Vite 6 + React 19 + TypeScript (strict) + Tailwind CSS 4.
- Zustand store with localStorage persistence and typed storage adapter.
- AI streaming service with per-provider wire formats (Gemini, OpenRouter) and
  SSE chunk parsing.
- Design-system UI primitives with tests: Button, Input, Select, Card, Badge,
  Modal, ProgressBar, EmptyState, Markdown renderer.
- Pages: Landing (scroll-reveal hero), Dashboard, PRD generator with streaming,
  PRD editor with Markdown export, Tasks board with progress bar, Settings
  (BYOK, JSON export/import).
- Layout wrapper (Header/Footer), routes, and PRD generator integration test.
- Design system: "technical document" theme (Outfit Variable + JetBrains Mono,
  stamp-red accent), reduced-motion support.
- GitHub Pages deployment (`gh-pages`) and reverse-engineering analysis report of
  the reference site (`docs/superpowers/specs/`).

[Unreleased]: https://github.com/bimoadiparwa/rencanai/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/bimoadiparwa/rencanai/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/bimoadiparwa/rencanai/releases/tag/v0.1.0
