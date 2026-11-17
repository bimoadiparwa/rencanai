import { useState } from "react";
import { useStore } from "../store/useStore";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PROVIDERS, getProvider, resolveSettings, type ProviderId } from "../lib/providers";
import { testConnection } from "../lib/connection";
import { useLang } from "../i18n";
import type { Settings } from "../types";

type Status = { tone: "ok" | "error" | "info"; text: string } | null;

export default function Settings() {
  const { t } = useLang();
  const stored = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const resolved = resolveSettings(stored);
  const [provider, setProvider] = useState<ProviderId>(resolved?.provider ?? "gemini");
  const [apiKey, setApiKey] = useState(resolved?.apiKey ?? "");
  const [model, setModel] = useState(resolved?.model ?? getProvider("gemini").defaultModel);
  const [status, setStatus] = useState<Status>(null);
  const [testing, setTesting] = useState(false);

  const info = getProvider(provider);
  const modelInfo = info.models.find((m) => m.id === model);

  const handleProviderChange = (value: string) => {
    const next = value as ProviderId;
    setProvider(next);
    setModel(getProvider(next).defaultModel);
    setStatus(null);
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus({ tone: "error", text: t("settings.needKey") });
      return;
    }
    const next: Settings = { provider, apiKey: apiKey.trim(), model };
    setSettings(next);
    setStatus({ tone: "ok", text: t("settings.saved") });
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setStatus({ tone: "error", text: t("settings.needKey") });
      return;
    }
    setTesting(true);
    setStatus({ tone: "info", text: t("settings.testing") });
    const result = await testConnection(provider, apiKey.trim(), model);
    setTesting(false);
    setStatus({ tone: result.ok ? "ok" : "error", text: result.message });
  };

  const handleExport = () => {
    const { prds } = useStore.getState();
    const data = JSON.stringify({ prds, settings: stored }, null, 2);
    const a = document.createElement("a");
    a.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
    a.download = "rencanai-prds.json";
    a.style.display = "none";
    document.body!.appendChild(a);
    a.click();
    document.body!.removeChild(a);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result;
        const json = typeof raw === "string" ? JSON.parse(raw) : {};
        const store = useStore.getState();
        store.resetStore();
        if (Array.isArray(json.prds)) {
          for (const prd of json.prds) store.addPrd(prd);
        }
        if (json.settings && typeof json.settings === "object" && (json.settings as Settings).provider) {
          store.setSettings(resolveSettings(json.settings as Settings) as Settings);
        }
      } catch {
        // berkas impor tidak valid, diabaikan
      }
    };
    reader.readAsText(file);
  };

  const toneClass = {
    ok: "border-emerald-700/30 bg-emerald-50 text-emerald-900 dark:border-emerald-700/40 dark:bg-emerald-950/60 dark:text-emerald-300",
    error: "border-danger/40 bg-danger/5 text-danger",
    info: "border-line bg-card text-ink-soft",
  } as const;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{t("settings.eyebrow")}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t("settings.title")}</h1>
      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
        {t("settings.privacy")}
      </p>

      <Card className="mt-6 space-y-5">
        <Select value={provider} onChange={handleProviderChange} options={PROVIDERS.map((p) => ({ label: p.label, value: p.id }))} label={t("settings.provider")} />
        <p className="-mt-3 text-xs text-muted">{t(info.freeNoteKey)}</p>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted">{t("settings.keyLabel")}</label>
            <a
              href={info.keyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-stamp"
            >
              {t("settings.getKey")}
            </a>
          </div>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            reveal
            ariaLabel={t("settings.keyLabel")}
            placeholder={t("settings.keyPh")}
          />
          <p className="mt-1.5 text-xs text-muted">{t(info.keyHintKey)}</p>
        </div>

        <div>
          <Select
            value={model}
            onChange={(v) => {
              setModel(v);
              setStatus(null);
            }}
            options={info.models.map((m) => ({ label: `${m.label}`, value: m.id }))}
            label={t("settings.model")}
          />
          {modelInfo && <p className="mt-1.5 text-xs text-muted">{t(modelInfo.noteKey)}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button onClick={handleSave}>{t("settings.save")}</Button>
          <Button variant="ghost" onClick={handleTest} loading={testing}>
            {t("settings.test")}
          </Button>
        </div>

        {status && (
          <div role="status" className={`rounded-md border px-4 py-3 text-sm ${toneClass[status.tone]}`}>
            {status.text}
          </div>
        )}
      </Card>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{t("settings.backup")}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={handleExport}>
            {t("settings.export")}
          </Button>
          <input type="file" accept=".json" hidden id="import-file" onChange={handleImport} />
          <label
            htmlFor="import-file"
            className="cursor-pointer text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-stamp hover:decoration-stamp"
          >
            {t("settings.import")}
          </label>
        </div>
      </div>
    </div>
  );
}
