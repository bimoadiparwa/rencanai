# Contributing to RencanAI

Terima kasih mau berkontribusi! 🙌 Panduan ini singkat — baca dulu, lalu kirim PR.

## Cara Berkontribusi

1. **Fork** repo ini, lalu clone fork Anda:
   ```bash
   git clone https://github.com/<username>/rencanai.git
   cd rencanai && npm install
   ```
2. **Buat branch** dari `main`:
   ```bash
   git checkout -b feat/nama-fitur
   ```
3. **Kerjakan perubahan** — lihat standar di bawah.
4. **Pastikan semua hijau** sebelum push:
   ```bash
   npx tsc --noEmit   # tanpa error type
   npm test           # semua test lulus
   npm run build      # build produksi sukses
   ```
5. **Commit dengan Conventional Commits**, lalu buka Pull Request.

## Standar Kode

- **TypeScript strict** — tidak ada `any` baru kecuali di tempat yang sudah ada dan beralasan.
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- **Test adalah kontrak.** Test component mengecek string/role/placeholder Indonesia yang persis (mis. `"Buat PRD dengan AI"`, `"Masukkan API Key"`, `data-testid="prd-content"`). Jangan mengubah teks UI tanpa ikut memperbarui test yang mengeceknya.
- **Satu sumber kebenaran** untuk katalog provider/model: `src/lib/providers.ts`. Jangan menyalin daftar model ke halaman lain.
- Semua teks UI dalam **Bahasa Indonesia**, termasuk pesan error (`src/lib/providers.ts` → `describeError`).

## Area yang Sering Perlu Diperbarui

| Perubahan | File yang disentuh |
|---|---|
| Tambah model/provider | `src/lib/providers.ts` (+ `scripts/e2e-browser.mjs` membaca katalog ini secara dinamis) |
| Ubah struktur PRD | `SYSTEM_PROMPT` di `src/lib/providers.ts`, `PRD_SECTIONS`, dan test terkait |
| Fitur halaman | `src/pages/*.tsx` + `*.test.tsx` pasangannya |
| Alur store | `src/store/useStore.ts` + `src/store/persist.test.ts` |

## Menjalankan Uji Browser E2E (opsional, untuk perubahan alur UI)

`scripts/e2e-browser.mjs` butuh Chromium dengan remote debugging:

```bash
chromium --remote-debugging-port=9225
node scripts/e2e-browser.mjs ws://127.0.0.1:9225/devtools/page/<ID> http://localhost:5173
```

Mode live (panggil provider sungguhan, butuh kunci OpenRouter Anda sendiri):

```bash
OPENROUTER_API_KEY=sk-or-... node scripts/e2e-browser.mjs <page-ws-url> <app-base-url>
```

⚠️ Jangan pernah commit API key ke repo — kunci hanya boleh lewat environment variable.

## Laporan Bug & Ide

Buka [Issue](https://github.com/bimoadiparwa/rencanai/issues) dengan:

- Langkah reproduksi + yang diharapkan vs yang terjadi
- Provider & model yang dipakai (tanpa API key!)
- Screenshot bila relevan

## Lisensi

Dengan berkontribusi, Anda menyetujui kontribusi dilisensikan di bawah [MIT License](LICENSE).
