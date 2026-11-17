// Single source of truth for AI providers and FREE models only.
// Sources (checked): OpenRouter /api/v1/models (pricing 0/0, text output),
// Gemini API pricing page (Free Tier "Free of charge" rows),
// GroqCloud models page (production text models).
// Paid-only models are intentionally absent (Gemini 4 Carbon/Argon, openrouter/auto, Claude).

import { t, getLang, type DictKey, type Lang } from "../i18n";

export type ProviderId = "gemini" | "openrouter" | "groq";

export interface ModelInfo {
  id: string;
  label: string;
  noteKey: DictKey;
}

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  keyUrl: string;
  keyHintKey: DictKey;
  freeNoteKey: DictKey;
  defaultModel: string;
  models: ModelInfo[];
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    keyUrl: "https://aistudio.google.com/apikey",
    keyHintKey: "prov.gemini.hint",
    freeNoteKey: "prov.gemini.note",
    defaultModel: "gemini-3.8-flash",
    models: [
      { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", noteKey: "prov.gemini.n1" },
      { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", noteKey: "prov.gemini.n2" },
      { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite", noteKey: "prov.gemini.n3" },
      { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite", noteKey: "prov.gemini.n4" },
      { id: "gemini-4-hydrogen", label: "Gemini 4 Hydrogen", noteKey: "prov.gemini.n5" },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    keyUrl: "https://openrouter.ai/settings/keys",
    keyHintKey: "prov.or.hint",
    freeNoteKey: "prov.or.note",
    defaultModel: "google/gemma-4-31b-it:free",
    models: [
      { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", noteKey: "prov.or.n1" },
      { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B A4B", noteKey: "prov.or.n2" },
      { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra 550B", noteKey: "prov.or.n3" },
      { id: "nvidia/nemotron-3.5-super-vl:free", label: "Nemotron 3.5 Super VL", noteKey: "prov.or.n4" },
      { id: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron 3.5 Lightning", noteKey: "prov.or.n5" },
      { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", label: "Nemotron 3 Nano Omni 30B", noteKey: "prov.or.n6" },
      { id: "baidu/ernie-5.5-flash-preview:free", label: "ERNIE 5.5 Flash (preview)", noteKey: "prov.or.n7" },
      { id: "inclusionai/ling-3.2-flash:free", label: "Ling 3.2 Flash", noteKey: "prov.or.n5" },
      { id: "cohere/north-mini-code:free", label: "North Mini Code", noteKey: "prov.or.n8" },
      { id: "dots-studio/dots-3-note-preview:free", label: "Dots 3 Note (preview)", noteKey: "prov.or.n9" },
      { id: "particle-ai/particle-1:free", label: "Particle 1", noteKey: "prov.or.n10" },
      { id: "recursive/flint-v1.0:free", label: "Flint v1.0", noteKey: "prov.or.n11" },
      { id: "liquid/lfm-3-1.7b:free", label: "LFM 3 1.7B", noteKey: "prov.or.n12" },
      { id: "openrouter/free", label: "Free Router (auto)", noteKey: "prov.or.n13" },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    keyUrl: "https://console.groq.com/keys",
    keyHintKey: "prov.groq.hint",
    freeNoteKey: "prov.groq.note",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", noteKey: "prov.groq.n1" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", noteKey: "prov.groq.n2" },
      { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", noteKey: "prov.groq.n3" },
      { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", noteKey: "prov.groq.n4" },
    ],
  },
];

export function getProvider(id: string): ProviderInfo {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

export function isFreeModel(provider: string, model: string): boolean {
  return getProvider(provider).models.some((m) => m.id === model);
}

// PRD template sections per UI language. The PRD itself is written in the
// language the app is currently displayed in.
const PRD_SECTIONS_ID = [
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

export const PRD_SECTIONS_EN_ARR = [
  "Executive Summary",
  "Background and Problem",
  "Goals and Success Metrics",
  "Out of Scope",
  "Users and Personas",
  "User Stories and Acceptance Criteria",
  "Functional Requirements",
  "Non-Functional Requirements",
  "Key User Flows",
  "Data Model",
  "Tech Stack Recommendation",
  "Assumptions and Dependencies",
  "Risks and Mitigations",
  "Open Questions",
  "Release Plan",
  "Task Checklist",
] as const;

// Bahasa Indonesia template — kept as the default export for compatibility.
export const PRD_SECTIONS = PRD_SECTIONS_ID;

const SYSTEM_PROMPTS: Record<Lang, string> = {
  id: [
    "Anda adalah product manager senior dan penulis PRD berpengalaman.",
    "Tulis PRD lengkap dalam Bahasa Indonesia yang jelas, spesifik, dan dapat langsung dipakai tim engineering dan desain.",
    "",
    "Aturan wajib:",
    "1. Gunakan tepat bagian berikut, berurutan, masing-masing sebagai heading '## ' dengan nama persis:",
    ...PRD_SECTIONS_ID.map((s, i) => `   ${i + 1}. ## ${s}`),
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
  ].join("\n"),
  en: [
    "You are a senior product manager and experienced PRD author.",
    "Write a complete PRD in clear, specific English that the engineering and design team can use directly.",
    "",
    "Mandatory rules:",
    "1. Use exactly the following sections, in order, each as a '## ' heading with the exact name:",
    ...PRD_SECTIONS_EN_ARR.map((s, i) => `   ${i + 1}. ## ${s}`),
    "2. Start the document with a '# ' heading containing the product name, then one status paragraph (Draft v1.0; no date needed).",
    "3. Goals must be measurable: give numeric targets and deadlines. Example: 'PRD creation time under 2 minutes for 90% of users'.",
    "4. User stories use the format 'As a <role>, I want <goal> so that <benefit>', followed by Given/When/Then acceptance criteria.",
    "5. Use stable IDs: FR-001, NFR-001, US-001, R-001, Q-001. Functional and non-functional requirements are written as tables with the columns ID, Description, Priority (P0/P1/P2), and Acceptance Criteria.",
    "6. Priorities use MoSCoW or P0/P1/P2 consistently. P0 means required for the first release.",
    "7. Non-functional requirements must cover performance, security and data privacy, accessibility, and device compatibility, each with numbers where possible.",
    "8. Stack recommendations must include a short rationale and alternatives. Choose technologies that are simple for the requested scope.",
    "9. If the description is incomplete, do not invent facts. State explicit assumptions in the Assumptions and Dependencies section, and raise open questions in the Open Questions section.",
    "10. The Task Checklist section contains a Markdown checklist, one task per line, in the exact format: '- [ ] T-001 [P0] Short task title (FR-001)'. Order from foundation to features, and link each task to its related FR/NFR.",
    "11. Use Markdown: headings, tables, and lists. Avoid filler openers and closers. Start directly with the title.",
  ].join("\n"),
};

export function systemPrompt(lang: Lang = getLang()): string {
  return SYSTEM_PROMPTS[lang];
}

// Back-compat export (Bahasa Indonesia template).
export const SYSTEM_PROMPT = SYSTEM_PROMPTS.id;

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RequestSpec {
  url: string;
  headers: Record<string, string>;
  body: string;
}

// Pure request builder: the only place that knows each provider's wire format.
// Accepts either a single `userText` (PRD generation) or a full chat message
// list (system + user/assistant). Both produce `stream: true` bodies.
export function buildRequest(opts: {
  provider: ProviderId;
  model: string;
  apiKey: string;
  userText?: string;
  messages?: AIMessage[];
  stream: boolean;
  maxTokens?: number;
}): RequestSpec {
  const { provider, model, apiKey, stream, maxTokens } = opts;
  const system = opts.messages?.find((m) => m.role === "system")?.content ?? systemPrompt();
  const turns = (opts.messages ?? []).filter((m) => m.role !== "system");
  if (opts.userText) turns.push({ role: "user", content: opts.userText });
  if (provider === "gemini") {
    const method = stream ? "streamGenerateContent?alt=sse" : "generateContent";
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${method}`,
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
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
      messages: [{ role: "system", content: system }, ...turns],
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
      if (e) return typeof e === "string" ? e : e.message ?? t("err.streamPlain");
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

// Turns any provider error body into a clear message in the current UI language.
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
  if (status === 400) return t("err.400", { detail });
  if (status === 401 || status === 403) return t("err.401", { detail });
  if (status === 404) return t("err.404", { detail });
  if (status === 429) return t("err.429", { detail });
  if (status >= 500) return t("err.5xx", { status: String(status) });
  return t("err.other", { status: String(status), detail });
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
