# RencanAI

**Generator PRD gratis berbasis AI — tanpa server, tanpa login, tanpa biaya.**

RencanAI mengubah deskripsi singkat tentang produk Anda menjadi Product Requirements Document (PRD) yang terstruktur, lengkap dengan daftar tugas, langsung di browser Anda. Terinspirasi dari [ngodingpakeai.com](https://www.ngodingpakeai.com) — tetapi dibangun ulang dari nol sebagai aplikasi 100% gratis dan open source.

> 🌐 **Coba langsung:** [https://bimoadiparwa.github.io/rencanai/](https://bimoadiparwa.github.io/rencanai/)

---

## Cara Kerja

1. **Masukkan API key Anda sendiri** (BYOK — Bring Your Own Key) di halaman Pengaturan. Kunci hanya tersimpan di `localStorage` browser Anda dan tidak pernah dikirim ke server mana pun — aplikasi ini bahkan tidak punya server.
2. **Tulis judul + deskripsi singkat** produk yang ingin dibangun.
3. **AI menghasilkan PRD secara streaming** ke layar Anda dalam hitungan detik, mengikuti template 16 bagian.
4. **Daftar "Tugas" di bagian akhir PRD otomatis diubah menjadi task** yang bisa Anda tandai todo / in-progress / done.
5. Semua PRD tersimpan lokal. Ekspor/impor JSON kapan saja.

## Fitur

- **PRD terstruktur best-practice** — template tetap 16 bagian: Ringkasan Eksekutif, Latar Belakang, Tujuan & Metrik terukur, Di Luar Lingkup, Persona, Cerita Pengguna dengan kriteria penerimaan Given/When/Then, kebutuhan fungsional & non-fungsional bernomor (FR-001, NFR-001) dengan prioritas P0/P1/P2, Alur Pengguna, Model Data, Rekomendasi Stack beserta alasannya, Asumsi, Risiko & Mitigasi, Pertanyaan Terbuka, Rencana Rilis, dan Daftar Tugas.
- **Streaming langsung** — teks muncul selagi model menulis, bukan setelah selesai.
- **Ekstraksi tugas otomatis** — checklist `- [ ] T-001 [P0] ...` dari PRD menjadi task board dengan progress bar.
- **Tema terang / gelap / sistem** — mengikuti OS secara live, tanpa flash saat load.
- **Dwibahasa: Inggris (default) & Indonesia** — ganti lewat toggle di header; PRD yang dihasilkan mengikuti bahasa UI.
- **Editor PRD** — ubah hasil PRD, tambah tugas manual, ekspor Markdown.
- **Multi-provider, hanya model gratis** — lihat tabel di bawah. Tidak ada model berbayar di daftar.
- **Tes API key** — satu klik membuktikan kunci dan model benar-benar bekerja sebelum Anda mencoba generate, dengan pesan error yang jelas dari penyedia (kunci tidak valid, model tidak ada, rate limit).
- **100% lokal** — tanpa backend, tanpa analytics, tanpa cookies. Data tinggal di browser Anda.
- **Aksesibel** — navigasi keyboard, `role="alert"` untuk error, `prefers-reduced-motion` mematikan semua animasi.

## Provider & Model Gratis

Semua model di daftar berikut gratis. Anda membutuhkan **satu** kunci saja.

| Provider | Cara dapat kunci | Contoh model gratis di daftar |
|---|---|---|
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Gemini 3.8 Flash (default), 3.6 Flash, 3.5 Flash-Lite, dll. |
| **OpenRouter** | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) | Gemma 4 31B `:free` (default), Nemotron 3 Ultra 550B `:free`, dan 12 lainnya — semua bertanda `:free` |
| **Groq** | [console.groq.com/keys](https://console.groq.com/keys) | Llama 3.3 70B (default), Llama 3.1 8B Instant, GPT-OSS 120B/20B |

Rekomendasi: **Gemini** untuk hasil PRD terbaik di free tier; **Groq** untuk kecepatan; **OpenRouter** untuk variasi model. Daftar lengkap selalu terlihat di halaman Pengaturan aplikasi.

> Catatan: kuota free tier tiap provider berlaku (rate limit harian/menit). Jika terkena limit, pesan errornya muncul jelas — tunggu sebentar atau pilih model lain.

## Mulai Cepat (Pengguna)

1. Buka [rencanai](https://bimoadiparwa.github.io/rencanai/).
2. Klik **Pengaturan** → pilih provider → tempel API key → **Tes API key** → **Simpan Pengaturan**.
3. Klik **Buat PRD** → isi judul + deskripsi → **Buat PRD dengan AI**.

Tanpa registrasi, tanpa kartu kredit.

## Menjalankan dari Source (Developer)

```bash
git clone https://github.com/bimoadiparwa/rencanai.git
cd rencanai
npm install
npm run dev        # buka http://localhost:5173
```

Perintah lain:

```bash
npm test           # seluruh unit + integration test (vitest)
npm run test:watch # mode watch
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # sajikan hasil build secara lokal
npm run deploy     # build + terbitkan ke branch gh-pages (GitHub Pages)
```

## Uji End-to-End di Browser

`scripts/e2e-browser.mjs` menjalankan aplikasi di Chromium nyata melalui Chrome DevTools Protocol (CDP). Secara default, panggilan HTTP provider di-intercept di lapisan jaringan dengan respons realistis — sehingga seluruh alur UI, streaming, dan penyimpanan diuji tanpa kunci API:

```bash
# chromium dengan --remote-debugging-port=9225 harus berjalan
node scripts/e2e-browser.mjs ws://127.0.0.1:9225/devtools/page/<ID> http://localhost:5173
```

Dengan `OPENROUTER_API_KEY` ter-set, mode live memanggil API OpenRouter sungguhan untuk semua model `:free` — tidak ada yang di-mock:

```bash
OPENROUTER_API_KEY=sk-or-... node scripts/e2e-browser.mjs <page-ws-url> <app-base-url>
```

## Teknologi

| Lapisan | Pilihan |
|---|---|
| Build | Vite 6 |
| UI | React 19 + TypeScript (strict) + Tailwind CSS 4 |
| State | Zustand 5, persist ke `localStorage` |
| Markdown | react-markdown + remark-gfm + @tailwindcss/typography |
| Font | Outfit Variable + JetBrains Mono (self-hosted via Fontsource) |
| Test | Vitest + Testing Library (unit & integration), e2e via CDP |
| Deploy | GitHub Pages (`gh-pages`), biaya $0 |

## Arsitektur

Aplikasi SPA tanpa backend. Semua komponen berjalan di browser:

```
Browser
├── React SPA (routes: /, /dashboard, /prd/create, /prd/:id, /tasks/:prdId, /settings)
├── Zustand store → localStorage ("rencanai-store")   ← semua data pengguna
└── src/lib/
    ├── providers.ts  — katalog model gratis + builder request per-provider (satu-satunya
    │                    tempat yang tahu format wire Gemini/OpenAI-compatible)
    ├── ai.ts         — klien streaming SSE: parse event, deteksi error di dalam stream,
    │                    pesan error mengikuti bahasa UI (ID/EN)
    ├── connection.ts — tes API key satu panggilan non-streaming
    ├── prd.ts        — ekstraksi checklist "Daftar Tugas" → tasks
    └── id.ts         — UUID v4 aman untuk konteks non-secure (http LAN)
```

Panggilan AI berlangsung **langsung dari browser ke provider** (Gemini / OpenRouter / Groq) membawa kunci Anda. Tidak ada proxy, tidak ada data yang melewati pihak ketiga selain provider yang Anda pilih.

## Privasi & Keamanan

- **API key disimpan di `localStorage` browser Anda (plaintext), tidak pernah dikirim ke mana pun selain penyedia AI yang Anda pilih.** Ada tombol "Hapus semua data" di Pengaturan untuk menghapus kunci + PRD kapan saja. Kunci tidak dienkripsi di browser — jangan gunakan kunci produksi sensitif.
- Tidak ada server, database, analytics, atau pelacakan. Semua panggilan AI berlangsung langsung dari browser ke provider yang Anda pilih.
- **Konten PRD di-sanitasi sebelum dirender dan disimpan** (`rehype-sanitize`), sehingga output model tidak dapat mengeksekusi skrip di dalam aplikasi.
- **Content-Security-Policy** aktif (`frame-ancestors 'none'`, `connect-src` terbatas pada endpoint provider) mencegah clickjacking dan exfil data.
- Ekspor/import JSON untuk memindahkan data antar browser/perangkat.
- Aplikasi disajikan via HTTPS di GitHub Pages. Jika Anda meng-host sendiri di HTTP non-localhost, fitur tetap bekerja (UUID dengan fallback aman), namun HTTPS selalu disarankan.

## Struktur Proyek

```
├── src/
│   ├── components/ui/      # primitif: Button, Input, Select, Card, Modal, dll.
│   ├── components/layout/  # Header, Footer, Layout
│   ├── pages/              # Landing, Dashboard, PrdCreate, PrdEditor, Tasks, Settings
│   ├── lib/                # providers, ai, connection, prd, id, storage
│   ├── store/              # Zustand + persist
│   └── test/               # setup vitest
├── scripts/e2e-browser.mjs # uji browser end-to-end via CDP
├── docs/superpowers/       # spesifikasi & rencana implementasi
└── index.html, vite.config.ts, ...
```

## Dokumentasi Tambahan

- [CHANGELOG.md](CHANGELOG.md) — riwayat rilis
- [CONTRIBUTING.md](CONTRIBUTING.md) — cara berkontribusi
- [docs/superpowers/specs/](docs/superpowers/specs/) — spesifikasi desain & analisis referensi
- [docs/superpowers/plans/](docs/superpowers/plans/) — rencana implementasi

## Batasan yang Diketahui

- Kuota free tier provider berlaku — PRD panjang bisa memakan kuota cepat.
- Anthropic tidak didukung (tidak memiliki free tier).
- Data hanya di browser aktif — bersihkan data browser = hilang; gunakan Ekspor JSON untuk cadangan.
- Mode gelap tersedia (terang / gelap / sistem, mengikuti OS).

- [x] PWA (offline-ready, installable)
- [x] Standalone task-list generator (tanpa PRD)
- [x] Alat desain berbasis AI (lanjutan dari scope awal)
- [x] Multi-model chat untuk iterasi PRD

## Kredit

- Terinspirasi oleh [ngodingpakeai.com](https://www.ngodingpakeai.com). Tidak berafiliasi dengan mereka; seluruh kode di sini ditulis dari nol.
- Ditenagai oleh API gratis dari Google Gemini, OpenRouter, dan Groq.

## Berkontribusi

PR dipersilakan! Lihat [CONTRIBUTING.md](CONTRIBUTING.md).

## Lisensi

[MIT](LICENSE) © 2026 Bimo Adiparwa
