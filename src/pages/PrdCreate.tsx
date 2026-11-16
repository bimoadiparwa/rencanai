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
  anthropic: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229"],
  groq: ["llama3-8b-8192", "llama3-70b-8192"],
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
      onComplete: async () => {
        setGenerating(false);
        const prd = {
          id: crypto.randomUUID(),
          title,
          description: brief,
          content: accumulated,
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        generator
      </p>
      {!ready && (
        <Card className="mb-6 border-dashed">
          <Badge variant="muted">Perlu API Key</Badge>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Konfigurasi AI terlebih dahulu
          </h1>
          <p className="mt-1 text-sm text-muted">Masukkan API Key Anda di halaman Settings sebelum membuat PRD.</p>
          <Link
            to="/settings"
            className="mt-4 inline-block text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-stamp hover:decoration-stamp"
          >
            Buka Pengaturan
          </Link>
        </Card>
      )}
      <form onSubmit={handleGenerate} className="space-y-5">
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            Judul Proyek
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Aplikasi Manajemen Tugas"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            Deskripsi Singkat
          </label>
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
              { label: "Anthropic", value: "anthropic" },
              { label: "Groq", value: "groq" },
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
          <div className="rounded-md border border-danger/40 bg-danger/5 p-4">
            <p className="text-sm text-danger">{error}</p>
            <Link
              to="/settings"
              className="mt-1.5 inline-block text-sm text-danger underline underline-offset-4 hover:opacity-80"
            >
              Perbaiki di Settings
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3 pt-1">
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
      <div className="mt-10 border-t border-line pt-6">
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Hasil PRD
        </h3>
        <div
          data-testid="prd-content"
          className="h-64 overflow-y-auto rounded-md border border-line bg-card p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink-soft"
        >
          {content}
        </div>
      </div>
    </div>
  );
}
