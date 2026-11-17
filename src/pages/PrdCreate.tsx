import { makeId } from "../lib/id";
import { extractTasks } from "../lib/prd";
import { sanitizeMarkdown } from "../lib/sanitize";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { generatePrd } from "../lib/ai";
import { getProvider, resolveSettings } from "../lib/providers";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useLang } from "../i18n";

export default function PrdCreate() {
  const { t } = useLang();
  const navigate = useNavigate();
  const rawSettings = useStore((s) => s.settings);
  const addPrd = useStore((s) => s.addPrd);
  const settings = resolveSettings(rawSettings);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortCtrl, setAbortCtrl] = useState<{ abort: () => void } | null>(null);

  const ready = Boolean(settings?.apiKey);
  const providerInfo = settings ? getProvider(settings.provider) : null;
  const modelLabel =
    providerInfo?.models.find((m) => m.id === settings?.model)?.label ?? settings?.model ?? "";

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !settings || generating) return;
    setError(null);
    setContent("");
    setGenerating(true);
    let accumulated = "";
    const { abort } = generatePrd({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      brief: `${title}\n\n${brief}`,
      onChunk: (t) => {
        accumulated += t;
        setContent((c) => c + t);
      },
      onComplete: () => {
        setGenerating(false);
        const id = makeId();
        addPrd({
          id,
          title,
          description: brief,
          content: sanitizeMarkdown(accumulated),
          tasks: extractTasks(accumulated),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        navigate(`/prd/${id}`);
      },
      onError: (err) => {
        setGenerating(false);
        setError(err.message);
      },
    });
    setAbortCtrl({ abort });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{t("create.eyebrow")}</p>

      {!ready ? (
        <Card className="mb-6 border-dashed">
          <Badge variant="muted">{t("create.needBadge")}</Badge>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {t("create.needTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("create.needDesc")}
          </p>
          <Link
            to="/settings"
            className="mt-4 inline-block text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-stamp hover:decoration-stamp"
          >
            {t("create.openSettings")}
          </Link>
        </Card>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">{providerInfo?.label}</span>
            <span className="text-muted"> · {modelLabel}</span>
          </p>
          <Link
            to="/settings"
            className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-stamp"
          >
            {t("create.changeSettings")}
          </Link>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-5">
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            {t("create.titleLabel")}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("create.titlePh")}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            {t("create.briefLabel")}
          </label>
          <Input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={t("create.briefPh")}
            className="h-32"
          />
        </div>
        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/5 p-4">
            <p className="text-sm text-danger">{error}</p>
            <Link
              to="/settings"
              className="mt-1.5 inline-block text-sm text-danger underline underline-offset-4 hover:opacity-80"
            >
              {t("create.fixSettings")}
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" variant="primary" disabled={!ready || generating || !title.trim() || !brief.trim()}>
            {generating ? t("create.generating") : t("create.submit")}
          </Button>
          {generating && abortCtrl && (
            <Button type="button" variant="danger" onClick={() => abortCtrl.abort()}>
              {t("create.cancel")}
            </Button>
          )}
        </div>
      </form>

      <div className="mt-10 border-t border-line pt-6">
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{t("create.resultTitle")}</h3>
        <div
          data-testid="prd-content"
          className="h-64 overflow-y-auto rounded-md border border-line bg-card p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink-soft"
        >
          {content || (generating ? "" : t("create.resultEmpty"))}
        </div>
      </div>
    </div>
  );
}
