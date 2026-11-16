# NgodingPakeAI — Feature Analysis Report

Date: 2026-11-16
Source: reverse-engineering of built assets in `/tmp/opencode/ngpa-app/assets/`
App state: v1 committed at `5150827`, integration test at `80fb3c6`. Docs-only task; no app code changes.

## Evidence index

All paths below are under `/tmp/opencode/ngpa-app/assets/`.

| File | Status | Notes |
|---|---|---|
| `index-pretty.js` | fully scanned (57,969 lines) | main runtime bundle; helper defs at ~33050–33080 |
| `pretty-pricing-plans-DX91EkBB.js` | fully read (1,133 lines) | `Ia` pricing page component (exported `P`) |
| `pretty-entry.js` | fully read (1,562 lines) | landing chunk; `ft` IntersectionObserver hook, `iso-stage` CSS, `sc-scroll` keyframe, `ca` confetti |
| `upgrade-modal-C0O5Ir6r.js` | read (truncated at 2,000 chars) | upgrade modal structure; feature map `m` |
| `pricing-Cgc2LJFC.js` | read | thin route wrapper rendering `P` from pricing-plans |
| `index-B1GyawIZ.js` | minified, scanned | runtime helpers |
| `tabs-yHoQOsZZ.js` | NOT downloaded | only listed in `chunk-list.txt` |
| `voucher-jls62KHB.js` | NOT downloaded | only listed in `chunk-list.txt` |
| `use-midtrans-B5i4Jhz_.js` | NOT downloaded | only listed in `chunk-list.txt` |
| `payment-BqAlqlF9.js` | NOT downloaded | only listed in `chunk-list.txt` |
| `manual-payment-dialog-VdPUn88n.js` | NOT downloaded | gap |
| `confetti.module-*.js` | NOT downloaded | lazy-loaded inside `ca`; gap |

Variable names are minified (single-letter) in bundles; names below match the pretty-pricing-plans source.

---

## 1. Pricing toggle — duration tabs

### Code evidence

`pretty-pricing-plans-DX91EkBB.js`, component `Ia` (exported `P`), ~line 264:

- `const [m, h] = Fe("tab", Me([...je]).withDefault("1bulan"))` — line 265. Persisted-state hook `Fe` keyed `"tab"`, default `"1bulan"`.
- `je.map(...)` renders three tabs at lines 542–604: `"1bulan"` → "1 Bulan", `"3bulan"` → "3 Bulan" + "Hemat" pill, `"tahunan"` → "Tahunan".
- `const pe = { "1bulan": ne(q,"1bulan"), "3bulan": ne(q,"3bulan"), tahunan: ne(q,"tahunan") }` — line 419. Per-tab plan lists.
- `je` is the tab-order array; per task evidence `PV = ["1bulan","3bulan","tahunan"]` lives in `index-pretty.js` line 33064.

Duration-label and grouping helpers in `index-pretty.js`:

- `PV = ["1bulan","3bulan","tahunan"]` — line 33064.
- `zV = 90`, `IV = 365` — lines 33059–33060.
- `function MS(e)` — lines 33065–33066: `durationDays === IV ? "tahunan" : durationDays === zV ? "3bulan" : "1bulan"`.
- `function Aie(e,t)` — lines 33068–33074: filters active plans, excludes bundle, groups by `MS(i) === t`, sorts starters first, then prepends bundle (`Sf = "pro-desain-bundle"`, line 33050).
- `function Gp(e)` — lines 33061–33063: `"pro-desain-bundle" ? "pro" : e.replace(/-(?:3mo|12mo)$/,"")`. Slug-strips "-3mo"/"-12mo".

Pricing formatters & discount:

- `function M(a)` — lines 245–247: `a === 0 ? "Rp 0" : \`Rp ${Math.floor(a / 1e3)}k\``.
- `function Y(a,r)` — lines 248–252: percentage or fixed discount, clamped `Math.max(a - Math.min(l,a), 0)`.
- Per-duration price resolvers `Le` (1 bulan), `Se` (3 bulan), `Te` (tahunan) — lines 425–468. `Te` uses `Ze(s,q)` for months/comparisonPrice/savings.

Highlighted bundle + badge:

- `W` plan meta map — lines 237–244: `bundle: { cta:"Pilih Pro Bundle", highlighted:true, ... }`.
- `ga` plan card — lines 882–1059: `highlighted: !be && P` (line 574); badge row "Paling Worth" at lines 913–922 (`p ? "Promo aktif" : "Paling Worth"`) rendered absolutely at `-top-3` with orange `border-primary`/`bg-primary` styling (lines 905–911).
- Voucher code `FEEDBACK20` special-case — line 260.

Voucher auto-tab-switch:

- lines 301–312: when a voucher `b` applies, filter matching plans `n`; if current tab `m` not among them, switch `h(H(n[0]))`.

### Logic explanation

1. User opens pricing → `Fe("tab", ...)` restores persisted tab (default `"1bulan"`).
2. `Aie` groups active, duration-filtered plans for that tab; bundle is pinned first.
3. Each plan card calls `Le`/`Se`/`Te` by active tab to compute per-month price, original label, discount %, and total.
4. `M()` renders `Rp ${Math.floor(a/1e3)}k`. `Y()` applies voucher discount.
5. Clicking a tab calls `h(s)` → persists `"tab"` → re-renders that tab's plan grid.
6. Applying an auto voucher whose plans don't include the current tab auto-switches the tab to the voucher's plan duration.
7. Bundle card (`slug === "pro-desain-bundle"`) gets `highlighted: true`, orange border, "Paling Worth" badge; its pricing compares against buying two separate Pro plans ("dibanding beli kedua paket Pro terpisah untuk 30 hari").

### Confidence: high

Fully read `pretty-pricing-plans-DX91EkBB.js`; helper defs located in `index-pretty.js` with exact line numbers.

### Verification needed

- Confirm `je` (tab order array) equals `PV` and where `je` is defined (imported, source not yet located).
- Confirm `Fe` persistence mechanism (localStorage key) — hook body not yet located; usage site confirms persisted behavior only by name.

---

## 2. Voucher & checkout

### Code evidence

`pretty-pricing-plans-DX91EkBB.js`:

- Promo modal `ma` — lines 610–733. Radix Dialog (`Oe` root, `Ue` content, `open: true`), shows voucher code, discount (`${a.discountValue}% OFF` or `Potongan ${B(...)}`), expiry `ia(a.expiresAt)`, per-plan discounted prices, "Pakai promo" button → `onChoose(m)`.
- Voucher form `ha` — lines 776–881. Input "Kode promo", submit calls `N()` → `we.apply(y, l)` → `POST /api/vouchers/apply` body `{ code, claimCelebration }` (lines 200–212). On success calls `onApplied`; on error shows message.
- Voucher auto-fetch `we.getAuto` — lines 213–216: `GET /api/vouchers/auto[?celebrate=1]`.
- `ge` checkout flow — lines 322–413: sign-in guard, `free` slug guard, Midtrans-ready check, `_.createTransaction(s.id, n?.code)`, `T(t, {...})` pay with `onSuccess`/`onPending`/`onError`/`onClose` callbacks, `verifyTransaction(u)`, bundle path redirects to `/pricing#bundle-orders`, GA4 call `da({ orderId: u, value: P, itemId: s.slug, itemName: s.name })`.
- `ga4_purchase_fired:<orderId>` dedup — function `da`, lines 218–236: `const r = \`ga4_purchase_fired:${a.orderId}\``; returns early if `localStorage.getItem(r)` set; fires `gtag("event","purchase",...)` then `localStorage.setItem(r, ISO)`.
- `I.event("checkout_initiated", ...)`, `I.event("purchase_completed/pending/failed/closed", ...)` analytics events (lines 343, 358, 397, 400, 403).
- `bundle-orders` section `oa` — lines 52–144: `queryKey ["bundle-orders"]`, `_.getTransactions()`, status labels in Indonesian ("Pembayaran tidak selesai", "Menunggu konfirmasi pembayaran", etc.), "Periksa pembayaran" → `_.verifyTransaction(i.orderId)`.

Modules imported but NOT downloaded (gap): `payment-BqAlqlF9.js` (`_`), `use-midtrans-B5i4Jhz_.js` (`na`), `manual-payment-dialog-VdPUn88n.js` (`ra`).

### Logic explanation

1. Auto voucher fetched on load (`we.getAuto`); if applicable, promo modal `ma` opens and may force a duration-tab switch.
2. User can enter a manual voucher in `ha`; `POST /api/vouchers/apply` validates and returns discount.
3. Clicking "Pakai promo"/subscribe calls `ge`: guards auth and Midtrans readiness; creates Midtrans transaction via `createTransaction` with optional voucher code; opens Midtrans checkout (`T`).
4. On success: `purchase_completed` event + GA4 purchase event `da` (deduped by `ga4_purchase_fired:<orderId>` in localStorage) + verify transaction; bundle plans redirect to `#bundle-orders`, others extend subscription or show "Perpanjangan berhasil" toast.
5. On error/close: `purchase_failed`/`purchase_closed` events, transaction cancelled (`he` → `_.cancelTransaction`), alert shown.
6. Post-purchase bundle status visible in `oa` "Bundle kamu" section with Indonesian status labels and re-check button.

### Confidence: high for pricing-plans checkout logic; medium for Midtrans/payment module internals

`pretty-pricing-plans-DX91EkBB.js` fully read. `payment-*`, `use-midtrans-*`, `manual-payment-dialog-*` only appear in `chunk-list.txt`; their bodies are not available.

### Verification needed

- Download/read `manual-payment-dialog-VdPUn88n.js`, `payment-BqAlqlF9.js`, `use-midtrans-B5i4Jhz_.js`, `voucher-jls62KHB.js` to confirm Midtrans token flow and manual-payment UI.
- Confirm `ga4_purchase_fired` key fires exactly once per orderId (dedup relies on localStorage surviving; cleared only manually).

---

## 3. Navigation animation

### Code evidence

`pretty-entry.js`:
- Header entrance style present on promo chip: `animate-in fade-in slide-in-from-bottom-2 duration-700` (line 1451). No dedicated header component found in this chunk.
- `ft` hook (lines 121–132) uses `IntersectionObserver` with `rootMargin: a`; drives `data-active` on `.iso-stage` (line 140).
- No `window.onscroll`, no `useScroll`, no scroll-state hook found in `pretty-entry.js`.
- `-nav-DHu60lHv.js` is 0 bytes; `raw--nav-DHu60lHv.js` is 689 bytes (minimal). Nav chunk not meaningfully available.

Task-stated claims not yet confirmed in available files:
- header `position: relative` (not sticky/fixed) with `backdrop-blur-md`.
- `animate-in fade-in duration-1000` header entrance (only `duration-700` promo chip observed).
- No scroll-state JS found (consistent with scan, but nav chunk missing).

### Logic explanation

From what is readable: reveal animations are IntersectionObserver-driven (`ft` sets `data-active=true` when element intersects, with configurable `rootMargin`). Elements gate their CSS animation behind `data-active`. Header-specific entrance/blur behavior cannot be confirmed from the downloaded chunks because the nav chunk is empty/unavailable.

### Confidence: low

Nav asset not downloaded; only indirect hints in `pretty-entry.js` and `chunk-list.txt`.

### Verification needed

- Obtain `-nav-DHu60lHv.js` (currently 0 bytes) or the live nav markup/CSS to confirm header position, backdrop blur, entrance animation duration, and absence/presence of scroll-state JS.

---

## 4. Scroll animations

### Code evidence

`pretty-entry.js`:

- `ft(s, a)` hook — lines 121–132: `useState(false)`, `useEffect` creates `IntersectionObserver` with `{ rootMargin: a }`, sets `true` when any entry `isIntersecting`, disconnects on cleanup.
- `mt` illustration wrapper — lines 133–146: `ref`, `data-active={l}`, class `iso-stage ... group-hover:scale-[1.05]`.
- `.iso-stage` CSS gating — lines 468–474:
  ```
  .iso-stage[data-active="false"] svg * { animation-play-state: paused; }
  @media (prefers-reduced-motion: reduce) {
    .iso-stage svg * { animation: none !important; }
    .iso-stage svg [stroke-dashoffset] { stroke-dashoffset: 0 !important; }
  }
  ```
- `sc-scroll` keyframe — lines 420–424: `0%,44% { transform: translateY(0) } ...52%,100% { transform: translateY(-106px) }` (44% = bt=4.4/N, 52% = $t=5.2/N over N=16s).
- Other keyframes: `sc-draw-*`, `sc-pop-*`, `sc-rise-*`, `sc-ghost-*`, `sc-flow`, `sc-ring`, `sc-type`, `sc-caret`, `sc-enter`, `sc-ripple`, `sc-sent`, `sc-blink`, `sc-bar`, `sc-turn-a/b` (lines 356–466).
- Confetti `ca` respects `prefers-reduced-motion` — line 148 early return.

### Logic explanation

1. `mt` renders an illustration inside `.iso-stage` with `data-active` bound to `ft()` IntersectionObserver result.
2. While not intersecting, `data-active="false"` pauses all SVG animations (`animation-play-state: paused`).
3. When intersecting, `data-active` becomes `true` and the infinite keyframe animations run (16s loop `N`).
4. `sc-scroll` is one such animation: element translates `translateY(0)` → `translateY(-106px)` over the loop, simulating a scroll reveal.
5. `prefers-reduced-motion: reduce` disables all animations and flushes stroke offsets so drawn strokes render immediately.
6. Confetti also bails out under reduced motion.

### Confidence: high

`pretty-entry.js` fully read; exact lines for `ft`, `data-active` gating, and `sc-scroll` keyframe confirmed.

### Verification needed

- None critical for scroll animation logic; `rootMargin` value `a` is passed at call sites not yet enumerated.

---

## 5. Modal behavior

### Code evidence

`upgrade-modal-C0O5Ir6r.js` (read, truncated at ~2,000 chars):
- Radix Dialog: `fixed inset-0 z-50 flex items-center justify-center p-4` overlay, `fixed inset-0 bg-black/50` backdrop with `onClose`, content `rounded-2xl border bg-card shadow-lg`, close button `aria-label="Tutup"`.
- Feature map `m` — lines ~5–14: keys `prd` ("Batas PRD Tercapai"), `revision` ("Fitur Revisi Chat"), `pdf` ("Download PDF"), `attachment` ("Attachment Referensi"), `workspace` ("Upgrade untuk Workspace"), each with Indonesian title/description.

`pretty-pricing-plans-DX91EkBB.js`:
- Promo modal `ma` — lines 610–733 (Radix Dialog, voucher code + per-plan prices, "Pakai promo").
- Manual-payment dialog `ra` imported from `./manual-payment-dialog-VdPUn88n.js` — line 45; rendered `e.jsx(ra, { item: f, onClose: ... })` line 475. Body NOT downloaded.
- Confetti `ca` — lines 145–198:
  - Respects `prefers-reduced-motion` (line 148).
  - Two side bursts: `angle: 60, origin { x: 0, y: 0.75 }` and `angle: 120, origin { x: 1, y: 0.75 }` (line 171), particleCount 110, colors `["#e87538","#fbbf24","#34d399","#fef3c7"]`.
  - Seven timed rain bursts: `setTimeout(..., 250 + h * 350)` for h in 0..6 (lines 172–189), each firing 6 origins across x `[0,0.2,...,1]`, angle 270, particleCount 10.
  - Lazy-loads `./confetti.module-5PKC4vm3.js` (line 154); `disableForReducedMotion: true`.
- Celebration trigger — lines 285–299: when voucher `b.showCelebration` and plans match, sets `ee(b)`, increments `me` (render gate `me > 0 && e.jsx(ca,{},me)` line 474), marks celebration shown in query cache.

### Logic explanation

1. Upgrade modals (`upgrade-modal`) are Radix Dialogs triggered by feature gates (PRD limit, revisions, PDF, attachments, workspace); content driven by feature key `m[feature]`.
2. Promo modal `ma` opens when an auto voucher is applicable; shows code, discount, expiry, and per-plan prices with "Pakai promo" → checkout.
3. Manual-payment dialog `ra` renders during checkout when Midtrans is unavailable (`!k`), showing plan name + amount; not yet readable.
4. Confetti `ca` plays on successful voucher claim with celebration (`me > 0` render gate): two wide side bursts immediately, then 7 staggered rain bursts every 350ms starting at 250ms; fully disabled under `prefers-reduced-motion`.
5. Celebration is shown once per voucher/plan combination (dedup via `ue.current` ref and query-cache flag `showCelebration: false`).

### Confidence: high for upgrade-modal structure & confetti; medium for manual-payment dialog

`upgrade-modal` structure and `ca` confetti confirmed from reads. `manual-payment-dialog-VdPUn88n.js` body not downloaded.

### Verification needed

- Download/read `manual-payment-dialog-VdPUn88n.js` to confirm its fields, triggers, and Radix parts.
- Confirm confetti module `confetti.module-5PKC4vm3.js` behavior matches `ca` invocation (lazy-loaded, not downloaded).

---

## Gaps summary (verification needed)

| Gap | File | Why it matters |
|---|---|---|
| Nav chunk empty/unavailable | `-nav-DHu60lHv.js` (0 bytes) | header position/blur/entrance duration, scroll-state JS |
| Tab order array source | `je` / `PV` definition | confirm `PV = ["1bulan","3bulan","tahunan"]` wiring |
| Persisted-state hook body | `Fe` in runtime bundle | confirm localStorage key & mechanism for "tab" |
| Midtrans/payment module | `payment-BqAlqlF9.js`, `use-midtrans-B5i4Jhz_.js` | token creation & checkout UI internals |
| Voucher module | `voucher-jls62KHB.js` | `ia` expiry formatting, auto-voucher API shape |
| Manual-payment dialog | `manual-payment-dialog-VdPUn88n.js` | fallback checkout UI when Midtrans unavailable |
| Confetti module | `confetti.module-5PKC4vm3.js` | lazy-loaded burst rendering |

---

## Coverage & confidence summary

| Section | Confidence | Primary evidence |
|---|---|---|
| 1. Pricing toggle — duration tabs | high | `pretty-pricing-plans-DX91EkBB.js` fully read; helpers in `index-pretty.js` |
| 2. Voucher & checkout | high / medium | pricing-plans fully read; payment modules not downloaded |
| 3. Navigation animation | low | nav chunk empty; only indirect hints |
| 4. Scroll animations | high | `pretty-entry.js` fully read |
| 5. Modal behavior | high / medium | upgrade-modal + confetti read; manual-payment dialog not downloaded |
