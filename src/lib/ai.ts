import { buildRequest, describeError, parseSseEvent, splitSse, streamError, type ProviderId } from "./providers";
import { t } from "../i18n";

export interface GeneratePrdOptions {
  provider: ProviderId;
  apiKey: string;
  model: string;
  brief: string;
  onChunk: (text: string) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

// Streams a PRD from the chosen provider. The returned promise never rejects:
// failures go to onError, so callers cannot leave an unhandled rejection.
export function generatePrd(opts: GeneratePrdOptions): { abort: () => void; promise: Promise<void> } {
  const controller = new AbortController();
  let produced = false;

  const fail = (message: string) => {
    opts.onError?.(new Error(message));
  };

  const promise = (async () => {
    let finished = false;
    try {
      const spec = buildRequest({
        provider: opts.provider,
        model: opts.model,
        apiKey: opts.apiKey,
        userText: opts.brief,
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
      finished = true;
    } catch (err) {
      if (controller.signal.aborted) return;
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
    // Outside the network try: a failure while saving must not look like a connection error.
    if (finished) {
      try {
        opts.onComplete?.();
      } catch (err) {
        fail(err instanceof Error ? err.message : t("err.saveFailed"));
      }
    }
  })();

  return { abort: () => controller.abort(), promise };
}
