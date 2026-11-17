import { buildRequest, describeError, extractTexts, type ProviderId } from "./providers";
import { t } from "../i18n";

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const spec = buildRequest({
      provider,
      model,
      apiKey,
      userText: "Balas dengan satu kata: ya",
      stream: false,
      maxTokens: 512,
    });
    const res = await fetch(spec.url, {
      method: "POST",
      headers: spec.headers,
      body: spec.body,
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, message: describeError(res.status, await res.text()) };
    }
    const texts = extractTexts(await res.text());
    if (texts.length === 0) {
      // Reasoning models may use the whole budget on hidden reasoning; the key is still accepted.
      return { ok: true, message: t("conn.okNoText", { model }) };
    }
    return { ok: true, message: t("conn.ok", { model }) };
  } catch (err) {
    if (controller.signal.aborted) {
      return { ok: false, message: t("conn.timeout") };
    }
    const network = err instanceof TypeError;
    return {
      ok: false,
      message: network
        ? t("conn.network")
        : err instanceof Error
          ? err.message
          : t("conn.fail"),
    };
  } finally {
    clearTimeout(timeout);
  }
}
