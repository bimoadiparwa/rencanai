import { buildRequest, describeError, extractTexts, type ProviderId } from "./providers";

export interface ConnectionResult {
  ok: boolean;
  message: string;
}

// One tiny non-streaming call that proves the key and model work end to end.
export async function testConnection(
  provider: ProviderId,
  apiKey: string,
  model: string
): Promise<ConnectionResult> {
  try {
    const spec = buildRequest({
      provider,
      model,
      apiKey,
      userText: "Balas dengan satu kata: ya",
      stream: false,
      maxTokens: 512,
    });
    const res = await fetch(spec.url, { method: "POST", headers: spec.headers, body: spec.body });
    if (!res.ok) {
      return { ok: false, message: describeError(res.status, await res.text()) };
    }
    const texts = extractTexts(await res.text());
    if (texts.length === 0) {
      // Reasoning models may use the whole budget on hidden reasoning; the key is still accepted.
      return { ok: true, message: `Kunci valid. Model ${model} merespons (tanpa teks pada tes singkat).` };
    }
    return { ok: true, message: `Kunci valid. Model ${model} merespons.` };
  } catch (err) {
    const network = err instanceof TypeError;
    return {
      ok: false,
      message: network
        ? "Tidak dapat terhubung ke penyedia AI. Periksa koneksi internet."
        : err instanceof Error
          ? err.message
          : "Gagal menguji koneksi.",
    };
  }
}
