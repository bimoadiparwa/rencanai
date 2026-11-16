export function geminiUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${encodeURIComponent(apiKey)}`;
}

export function openrouterUrl(_model: string): string {
  return "https://openrouter.ai/api/v1/chat/completions";
}

export function anthropicUrl(_model: string): string {
  return "https://api.anthropic.com/v1/messages";
}

export function groqUrl(_model: string): string {
  return "https://api.groq.com/openai/v1/chat/completions";
}

export function parseStreamChunk(raw: string): string[] {
  const texts: string[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") continue;
    try {
      const json = JSON.parse(payload);
      // Gemini shape
      const parts = json.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (part.text) texts.push(part.text);
        }
        continue;
      }
      // Anthropic shape: delta.type "text_delta" -> delta.text
      const aDelta = json.delta;
      if (aDelta && aDelta.type === "text_delta" && typeof aDelta.text === "string") {
        texts.push(aDelta.text);
        continue;
      }
      // OpenRouter / Groq shape
      const delta = json.choices?.[0]?.delta?.content;
      if (typeof delta === "string") texts.push(delta);
    } catch {
      // ignore malformed lines
    }
  }
  return texts;
}

export interface GeneratePrdOptions {
  provider: "gemini" | "openrouter" | "anthropic" | "groq";
  apiKey: string;
  model: string;
  brief: string;
  onChunk: (text: string) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

export function generatePrd(opts: GeneratePrdOptions): { abort: () => void; promise: Promise<void> } {
  let controller: AbortController | null = null;
  const systemPrompt =
    "Anda adalah produkt manajer ahli. Buatlah PRD lengkap dalam Bahasa Indonesia dengan bagian: " +
    "Ringkasan, Tujuan, Cerita Pengguna, Kebutuhan Fungsional, Kebutuhan Non-Fungsional, " +
    "Rekomendasi Stack Teknologi, dan Tugas yang Disarankan. Gunakan format Markdown.";

  const promise = new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        controller = new AbortController();
        const isGemini = opts.provider === "gemini";
        const isAnthropic = opts.provider === "anthropic";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        let url: string;
        let body: unknown;

        if (isGemini) {
          url = geminiUrl(opts.model, opts.apiKey);
          body = {
            contents: [{ parts: [{ text: `${systemPrompt}\n\nDeskripsi proyek: ${opts.brief}` }] }],
          };
        } else if (isAnthropic) {
          url = anthropicUrl(opts.model);
          headers["x-api-key"] = opts.apiKey;
          headers["anthropic-version"] = "2023-06-01";
          body = {
            model: opts.model,
            max_tokens: 1024,
            messages: [{ role: "user", content: `${systemPrompt}\n\nDeskripsi proyek: ${opts.brief}` }],
            stream: true,
          };
        } else {
          url = opts.provider === "groq" ? groqUrl(opts.model) : openrouterUrl(opts.model);
          headers["Authorization"] = `Bearer ${opts.apiKey}`;
          body = {
            model: opts.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: opts.brief },
            ],
            stream: true,
          };
        }

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = new Error(`Gagal memanggil AI: ${res.status} ${res.statusText}`);
          (err as any).status = res.status;
          opts.onError?.(err);
          reject(err);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Tidak dapat membaca respons streaming");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const texts = parseStreamChunk(part);
            for (const t of texts) opts.onChunk(t);
          }
        }
        // flush remaining
        if (buffer.trim()) {
          for (const t of parseStreamChunk(buffer)) opts.onChunk(t);
        }

        opts.onComplete?.();
        resolve();
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (e.name === "AbortError") {
          resolve(); // user-initiated cancel is not an error
          return;
        }
        opts.onError?.(e);
        reject(e);
      }
    })();
  });

  return {
    abort: () => {
      controller?.abort();
    },
    promise,
  };
}
