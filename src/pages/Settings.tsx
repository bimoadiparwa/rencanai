import { useState } from "react";
import { useStore } from "../store/useStore";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import type { Settings } from "../types";

const PROVIDERS = [
  { label: "Google Gemini (Gratis tier tersedia)", value: "gemini" },
  { label: "OpenRouter (banyak model gratis)", value: "openrouter" },
];

const MODELS: Record<Settings["provider"], string[]> = {
  gemini: ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"],
  openrouter: ["openrouter/auto", "google/gemini-2.0-flash-exp:free"],
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
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Pengaturan AI</h1>
      <p className="text-muted mb-6">
        Kunci API disimpan hanya di browser Anda dan tidak pernah dikirim ke server kami.
      </p>
      <Select value={provider} onChange={handleProviderChange} options={PROVIDERS} label="Penyedia" />
      <Input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        type="password"
        reveal
        placeholder="Masukkan API Key"
      />
      <Select
        value={model}
        onChange={setModel}
        options={MODELS[provider].map((m) => ({ label: m, value: m }))}
        label="Model"
      />
      <Button onClick={handleSave}>Simpan Pengaturan</Button>
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Cadangkan Data</h3>
        <Button variant="ghost" onClick={handleExport}>
          Ekspor Semua PRD (JSON)
        </Button>
        <input type="file" accept=".json" hidden id="import-file" onChange={handleImport} />
        <label htmlFor="import-file">Impor JSON</label>
      </div>
    </div>
  );
}
