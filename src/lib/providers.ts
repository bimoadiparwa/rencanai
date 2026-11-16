// Single source of truth for AI providers and FREE models only.
// Sources (checked): OpenRouter /api/v1/models (pricing 0/0, text output),
// Gemini API pricing page (Free Tier "Free of charge" rows),
// GroqCloud models page (production text models).
// Paid-only models are intentionally absent (Gemini 4 Carbon/Argon, openrouter/auto, Claude).

export type ProviderId = "gemini" | "openrouter" | "groq";

export interface ModelInfo {
  id: string;
  label: string;
  note: string;
}

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  keyUrl: string;
  keyHint: string;
  freeNote: string;
  defaultModel: string;
  models: ModelInfo[];
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    keyUrl: "https://aistudio.google.com/apikey",
    keyHint: "Kunci dari Google AI Studio",
    freeNote: "Free tier tanpa kartu kredit, batas harian berlaku.",
    defaultModel: "gemini-3.8-flash",
    models: [
      { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", note: "Paling pintar untuk PRD panjang" },
      { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", note: "Generasi sebelumnya, seimbang" },
      { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite", note: "Cepat, hemat kuota" },
      { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite", note: "Paling ringan" },
      { id: "gemini-4-hydrogen", label: "Gemini 4 Hydrogen", note: "Model generasi 4, cepat" },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    keyUrl: "https://openrouter.ai/settings/keys",
    keyHint: "Kunci dari OpenRouter (model bertanda :free)",
    freeNote: "Model bertanda :free tidak dikenai biaya.",
    defaultModel: "google/gemma-4-31b-it:free",
    models: [
      { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", note: "Model Google, 262K konteks" },
      { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B A4B", note: "Model Google, ringan" },
      { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra 550B", note: "Model besar, 1M konteks" },
      { id: "nvidia/nemotron-3.5-super-vl:free", label: "Nemotron 3.5 Super VL", note: "Model NVIDIA, 1M konteks" },
      { id: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron 3.5 Lightning", note: "Cepat, 1M konteks" },
      { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", label: "Nemotron 3 Nano Omni 30B", note: "Dengan penalaran" },
      { id: "baidu/ernie-5.5-flash-preview:free", label: "ERNIE 5.5 Flash (preview)", note: "Model Baidu, 1M konteks" },
      { id: "inclusionai/ling-3.2-flash:free", label: "Ling 3.2 Flash", note: "Cepat, 1M konteks" },
      { id: "cohere/north-mini-code:free", label: "North Mini Code", note: "Cohere, 256K konteks" },
      { id: "dots-studio/dots-3-note-preview:free", label: "Dots 3 Note (preview)", note: "512K konteks" },
      { id: "particle-ai/particle-1:free", label: "Particle 1", note: "1M konteks" },
      { id: "recursive/flint-v1.0:free", label: "Flint v1.0", note: "262K konteks" },
      { id: "liquid/lfm-3-1.7b:free", label: "LFM 3 1.7B", note: "Model kecil, sangat ringan" },
      { id: "openrouter/free", label: "Router Gratis (otomatis)", note: "Memilih model gratis yang tersedia" },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    keyUrl: "https://console.groq.com/keys",
    keyHint: "Kunci dari GroqCloud Console",
    freeNote: "Free plan dengan batas rate; sangat cepat.",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", note: "Seimbang, 131K konteks" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", note: "Paling cepat" },
      { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", note: "Model terbuka OpenAI, dengan penalaran" },
      { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", note: "Model terbuka OpenAI, ringan" },
    ],
  },
];

export function getProvider(id: string): ProviderInfo {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

export function isFreeModel(provider: string, model: string): boolean {
  return getProvider(provider).models.some((m) => m.id === model);
}

export const PRD_SECTIONS = [
  "Ringkasan Eksekutif",
  "Latar Belakang dan Masalah",
  "Tujuan dan Metrik Keberhasilan",
  "Di Luar Lingkup",
  "Pengguna dan Persona",
  "Cerita Pengguna dan Kriteria Penerimaan",
  "Kebutuhan Fungsional",
  "Kebutuhan Non-Fungsional",
  "Alur Pengguna Utama",
  "Model Data",
  "Rekomendasi Stack Teknologi",
  "Asumsi dan Dependensi",
  "Risiko dan Mitigasi",
  "Pertanyaan Terbuka",
  "Rencana Rilis",
  "Daftar Tugas",
] as const;

export const SYSTEM_PROMPT = [
  "Anda adalah product manager senior dan penulis PRD berpengalaman.",
  "Tulis PRD lengkap dalam Bahasa Indonesia yang jelas, spesifik, dan dapat langsung dipakai tim engineering dan desain.",
  "",
  "Aturan wajib:",
  "1. Gunakan tepat bagian berikut, berurutan, masing-masing sebagai heading '## ' dengan nama persis:",
  ...PRD_SECTIONS.map((t, i) => `   ${i + 1}. ## ${t}`),
  "2. Awali dokumen dengan heading '# ' berisi judul produk, lalu satu paragraf status (Draf v1.0, tanggal tidak perlu).",
  "3. Tujuan harus terukur: beri target angka dan batas waktu. Contoh: 'Waktu buat PRD di bawah 2 menit untuk 90% pengguna'.",
  "4. Cerita pengguna memakai format 'Sebagai <peran>, saya ingin <tujuan> agar <manfaat>', diikuti kriteria penerimaan Given/When/Then.",
  "5. Beri ID tetap: FR-001, NFR-001, US-001, R-001, Q-001. Kebutuhan fungsional dan non-fungsional ditulis sebagai tabel dengan kolom ID, Deskripsi, Prioritas (P0/P1/P2), dan Kriteria Penerimaan.",
  "6. Prioritas memakai MoSCoW atau P0/P1/P2 dengan konsisten. P0 berarti wajib untuk rilis pertama.",
  "7. Non-fungsional wajib mencakup performa, keamanan dan privasi data, aksesibilitas, dan kompatibilitas perangkat, masing-masing dengan angka bila memungkinkan.",
  "8. Rekomendasi stack harus disertai alasan singkat dan alternatif. Pilih teknologi yang sederhana untuk ruang lingkup yang diminta.",
  "9. Jika deskripsi kurang lengkap, jangan mengarang fakta. Tulis asumsi eksplisit di bagian Asumsi dan Dependensi, dan ajukan pertanyaan terbuka di bagian Pertanyaan Terbuka.",
  "10. Bagian Daftar Tugas berisi checklist Markdown, satu tugas per baris, dengan format persis: '- [ ] T-001 [P0] Judul tugas singkat (FR-001)'. Urutkan dari fondasi ke fitur, dan kaitkan setiap tugas dengan FR/NFR terkait.",
  "11. Gunakan Markdown: heading, tabel, dan daftar. Hindari kalimat pembuka basa-basi dan penutup. Mulai langsung dari judul.",
].join("\n");

export interface RequestSpec {
  url: string;
  headers: Record<string, string>;
  body: string;
}

// Pure request builder: the only place that knows each provider's wire format.
export function buildRequest(opts: {
  provider: ProviderId;
  model: string;
  apiKey: string;
  userText: string;
  stream: boolean;
  maxTokens?: number;
}): RequestSpec {
  const { provider, model, apiKey, userText, stream, maxTokens } = opts;
  if (provider === "gemini") {
    const method = stream ? "streamGenerateContent?alt=sse" : "generateContent";
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${method}`,
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: maxTokens ? { maxOutputTokens: maxTokens } : { temperature: 0.4 },
      }),
    };
  }
  const url =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";
  return {
    url,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
      stream,
      temperature: 0.4,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
  };
}

// Extracts text deltas from one SSE event (or a complete JSON body when stream=false).
export function extractTexts(payload: string): string[] {
  const texts: string[] = [];
  let json: any;
  try {
    json = JSON.parse(payload);
  } catch {
    return texts;
  }
  const parts = json?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part?.thought === true) continue;
      if (typeof part?.text === "string" && part.text) texts.push(part.text);
    }
    return texts;
  }
  const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content;
  if (typeof delta === "string" && delta) texts.push(delta);
  return texts;
}

// Splits an SSE buffer into complete events. Handles CRLF and partial trailing data.
export function splitSse(buffer: string): { events: string[]; rest: string } {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const parts = normalized.split("\n\n");
  const rest = parts.pop() ?? "";
  return { events: parts, rest };
}

// Some providers inject an error object into an otherwise successful stream.
export function streamError(event: string): string | null {
  for (const line of event.split("\n")) {
    if (!line.startsWith("data:")) continue;
    try {
      const json = JSON.parse(line.slice(5).trim());
      const e = json?.error;
      if (e) return typeof e === "string" ? e : e.message ?? "Penyedia AI menghentikan respons.";
    } catch {
      // not JSON
    }
  }
  return null;
}

export function parseSseEvent(event: string): string[] {
  const texts: string[] = [];
  for (const line of event.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    texts.push(...extractTexts(payload));
  }
  return texts;
}

// Turns any provider error body into a clear Indonesian message.
export function describeError(status: number, body: string): string {
  let providerMsg = "";
  try {
    const json = JSON.parse(body);
    const e = json?.error;
    providerMsg = typeof e === "string" ? e : e?.message ?? "";
  } catch {
    providerMsg = body.slice(0, 200);
  }
  const detail = providerMsg ? ` (${providerMsg.slice(0, 160)})` : "";
  if (status === 400) return `Permintaan ditolak penyedia${detail}.`;
  if (status === 401 || status === 403)
    return `API key tidak valid atau tidak punya akses ke model ini${detail}. Periksa kunci di Pengaturan.`;
  if (status === 404)
    return `Model tidak ditemukan atau tidak tersedia untuk akun ini${detail}. Pilih model lain di Pengaturan.`;
  if (status === 429)
    return `Batas gratis tercapai (rate limit)${detail}. Tunggu beberapa menit lalu coba lagi, atau pilih model lain.`;
  if (status >= 500) return `Penyedia AI sedang bermasalah (${status}). Coba lagi sebentar lagi.`;
  return `Gagal memanggil AI (${status})${detail}.`;
}

// Repairs settings saved by older versions (retired/paid model IDs, removed providers).
export function resolveSettings<S extends { provider: string; model: string; apiKey: string }>(
  settings: S | null
): (S & { provider: ProviderId }) | null {
  if (!settings) return null;
  const provider = PROVIDERS.some((p) => p.id === settings.provider)
    ? (settings.provider as ProviderId)
    : "gemini";
  const info = getProvider(provider);
  const model = info.models.some((m) => m.id === settings.model) ? settings.model : info.defaultModel;
  return { ...settings, provider, model };
}
