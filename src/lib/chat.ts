import { buildRequest, describeError, parseSseEvent, splitSse, streamError, type ProviderId } from "./providers";
import { getLang, t } from "../i18n";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  provider: ProviderId;
  apiKey: string;
  model: string;
  messages: AIMessage[];
  onChunk: (text: string) => void;
  onError?: (err: Error) => void;
}

// Streams a chat completion from the chosen provider. The returned promise
// never rejects: failures go to onError, so callers cannot leave an
// unhandled rejection. Reuses buildRequest with stream: true and a chat
// message format (system + user/assistant messages).
export function chatCompletion(opts: ChatCompletionOptions): { abort: () => void; promise: Promise<void> } {
  const controller = new AbortController();
  let produced = false;

  const fail = (message: string) => {
    opts.onError?.(new Error(message));
  };

  const promise = (async () => {
    try {
      const spec = buildRequest({
        provider: opts.provider,
        model: opts.model,
        apiKey: opts.apiKey,
        messages: opts.messages,
        stream: true,
      });
      const res = await fetch(spec.url, {
        method: "POST",
        headers: spec.headers,
        body: spec.body,
        signal: controller.signal,
      });
      if (!res.ok) {
        fail(describeError(res.status, await res.text()));
        return;
      }
      if (!res.body) {
        fail(t("err.emptyResponse"));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = splitSse(buffer);
        buffer = rest;
        for (const event of events) {
          const providerError = streamError(event);
          if (providerError) {
            fail(t("err.stream", { detail: providerError }));
            await reader.cancel().catch(() => {});
            return;
          }
          for (const text of parseSseEvent(event)) {
            produced = true;
            opts.onChunk(text);
          }
        }
      }
      buffer += decoder.decode();
      for (const text of parseSseEvent(buffer)) {
        produced = true;
        opts.onChunk(text);
      }

      if (!produced) {
        fail(t("err.noText"));
        return;
      }
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      const isNetwork = err instanceof TypeError && /fetch|network|load failed/i.test(err.message);
      fail(
        isNetwork
          ? t("err.network")
          : err instanceof Error
            ? err.message
            : t("err.unexpected")
      );
      return;
    }
  })();

  return { abort: () => controller.abort(), promise };
}

const CHAT_SYSTEM_PROMPTS: Record<string, string> = {
  en: "You are a helpful assistant that refines PRD documents through conversation. Be clear, concise, and practical.",
  id: "Anda adalah asisten yang membantu menyunting dokumen PRD melalui obrolan. Jelas, ringkas, dan praktis.",
};

export function chatSystemPrompt(lang = getLang()): string {
  return CHAT_SYSTEM_PROMPTS[lang] ?? CHAT_SYSTEM_PROMPTS.en;
}
