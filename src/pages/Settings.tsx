import { useState } from "react";
import { useStore } from "../store/useStore";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { Settings } from "../types";

const PROVIDERS = [
  { label: "Google Gemini (Gratis tier tersedia)", value: "gemini" },
  { label: "OpenRouter (banyak model gratis)", value: "openrouter" },
  { label: "Anthropic Claude", value: "anthropic" },
  { label: "Groq", value: "groq" },
];

const MODELS: Record<Settings["provider"], string[]> = {
  gemini: ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"],
  openrouter: ["openrouter/auto", "google/gemini-2.0-flash-exp:free"],
  anthropic: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229"],
  groq: ["llama3-8b-8192", "llama3-70b-8192"],
};

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [provider, setProvider] = useState<Settings["provider"]>(settings?.provider ?? "gemini");
  const [apiKey, setApiKey] = useState(settings?.apiKey ?? "");
  const [model, setModel] = useState(settings?.model ?? MODELS.gemini[0]);

  const handleProviderChange = (value: string) => {
    const next = value as Settings["provider"];
    setProvider(next);
    if (!MODELS[next].includes(model)) setModel(MODELS[next][0]);
  };

  const handleSave = () => {
    setSettings({ provider, apiKey, model });
  };

  const handleExport = () => {
    const { prds } = useStore.getState();
    const data = JSON.stringify({ prds, settings }, null, 2);
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
          store.setSettings(json.settings as Settings);
        }
      } catch {
        // berkas impor tidak valid — diabaikan
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        konfigurasi
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Pengaturan AI
      </h1>
      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
        Kunci API disimpan hanya di browser Anda dan tidak pernah dikirim ke
        server kami.
      </p>

      <Card className="mt-6 space-y-5">
        <Select value={provider} onChange={handleProviderChange} options={PROVIDERS} label="Penyedia" />
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            API key
          </label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            reveal
            ariaLabel="API key"
            placeholder="Masukkan API Key"
          />
        </div>
        <Select
          value={model}
          onChange={setModel}
          options={MODELS[provider].map((m) => ({ label: m, value: m }))}
          label="Model"
        />
        <div className="pt-1">
          <Button onClick={handleSave}>Simpan Pengaturan</Button>
        </div>
      </Card>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Cadangkan Data
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={handleExport}>
            Ekspor Semua PRD (JSON)
          </Button>
          <input type="file" accept=".json" hidden id="import-file" onChange={handleImport} />
          <label
            htmlFor="import-file"
            className="cursor-pointer text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-stamp hover:decoration-stamp"
          >
            Impor JSON
          </label>
        </div>
      </div>
    </div>
  );
}
