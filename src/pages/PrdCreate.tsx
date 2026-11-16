import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { generatePrd } from "../lib/ai";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import type { Settings } from "../types";

const MODELS = {
  gemini: ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"],
  openrouter: ["openrouter/auto", "google/gemini-2.0-flash-exp:free"],
};

export default function PrdCreate() {
  const navigate = useNavigate();
  const settings = useStore((s) => s.settings);
  const addPrd = useStore((s) => s.addPrd);
  const setSettings = useStore((s) => s.setSettings);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortCtrl, setAbortCtrl] = useState<{ abort: () => void } | null>(null);

  const ready = Boolean(settings?.apiKey);
  const models = settings ? MODELS[settings.provider] : MODELS.gemini;

  const handleProviderChange = (v: string) => {
    setSettings({ ...(settings ?? ({} as Settings)), provider: v as Settings["provider"] });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !settings) return;
    setError(null);
    setContent("");
    setGenerating(true);
    const { abort } = generatePrd({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      brief: `${title}\n\n${brief}`,
      onChunk: (t) => setContent((c) => c + t),
      onComplete: async () => {
        setGenerating(false);
        const prd = {
          id: crypto.randomUUID(),
          title,
          description: brief,
          content,
          tasks: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addPrd(prd);
        navigate(`/prd/${prd.id}`);
      },
      onError: (err) => {
        setGenerating(false);
        setError(err.message);
      },
    });
    setAbortCtrl({ abort });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {!ready && (
        <Card className="mb-6">
          <Badge variant="muted">Perlu API Key</Badge>
          <h1 className="mt-2 text-xl font-bold">Konfigurasi AI terlebih dahulu</h1>
          <p className="text-muted">Masukkan API Key Anda di halaman Settings sebelum membuat PRD.</p>
          <Link to="/settings" className="mt-4 inline-block text-sm underline underline-offset-4">
            Buka Pengaturan
          </Link>
        </Card>
      )}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Judul Proyek</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Aplikasi Manajemen Tugas"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
          <Input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Aplikasi untuk mengatur tugas harian tim…"
            className="h-32"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={settings?.provider ?? "gemini"}
            onChange={handleProviderChange}
            options={[
              { label: "Gemini", value: "gemini" },
              { label: "OpenRouter", value: "openrouter" },
            ]}
            label="Penyedia AI"
          />
          <Select
            value={settings?.model ?? ""}
            onChange={(v) =>
              setSettings({ ...(settings ?? ({} as Settings)), model: v })
            }
            options={models.map((m) => ({ label: m, value: m }))}
            label="Model"
          />
        </div>
        {error && (
          <Card className="border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-900/20 p-3 mt-4">
            {error}
            <Link
              to="/settings"
              className="mt-2 inline-block text-sm underline underline-offset-4 text-red-700 dark:text-red-400"
            >
              Perbaiki di Settings
            </Link>
          </Card>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={!ready || generating}>
            {generating ? "Menghasilkan PRD…" : "Buat PRD dengan AI"}
          </Button>
          {generating && abortCtrl && (
            <Button type="button" variant="danger" onClick={() => abortCtrl?.abort()}>
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Hasil PRD</h3>
        <div
          data-testid="prd-content"
          className="h-64 overflow-y-auto border rounded p-4 bg-white dark:bg-slate-800 font-mono text-sm whitespace-pre-wrap"
        >
          {content}
        </div>
      </div>
    </div>
  );
}
