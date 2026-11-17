import { useCallback, useRef, useState } from "react";
import { Card } from "./Card";
import { Input } from "./Input";
import { Select } from "./Select";
import { ProgressBar } from "./ProgressBar";
import { ColorSwatch } from "./ColorSwatch";
import { ExportButton } from "./ExportButton";
import { useLang } from "../../i18n";

type Layout = "doc-cover" | "task-card";

export interface DesignValues {
  title: string;
  accentId: string;
  layout: Layout;
}

export const DESIGN_ACCENTS = [
  { id: "stamp", label: "Stamp red", hex: "#bf3b1e" },
  { id: "slate", label: "Slate", hex: "#475569" },
  { id: "emerald", label: "Emerald", hex: "#059669" },
  { id: "amber", label: "Amber", hex: "#d97706" },
  { id: "violet", label: "Violet", hex: "#7c3aed" },
] as const;

const DESIGN_TASKS = [
  { title: "Design the data model", done: true },
  { title: "Login & registration page", done: true },
  { title: "Notification integration", done: false },
] as const;

const DEFAULT_VALUES: DesignValues = {
  title: "",
  accentId: "stamp",
  layout: "doc-cover",
};

export function selectedAccent(accentId: string) {
  return DESIGN_ACCENTS.find((a) => a.id === accentId) ?? DESIGN_ACCENTS[0];
}

/** Self-contained, printable HTML snapshot of the current design (no external CSS). */
export function designToHtml(values: DesignValues): string {
  const accent = selectedAccent(values.accentId);
  const title = values.title || "Untitled PRD";
  const escapedTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const seal = `
    <div class="seal" style="border-color: ${accent.hex}; color: ${accent.hex}">PRD</div>
  `;

  const coverBody = `
    ${seal}
    <p class="muted uppercase">prd-001 &middot; v1.0</p>
    <h1>${escapedTitle}</h1>
    <p>PRD cover designed in the browser — no backend, no API keys, no cost.</p>
    <div class="mt-6" style="margin-top: 24px;">
      <span class="accent-chip" style="background-color: ${accent.hex}"></span>
      <span class="muted uppercase" style="margin-left: 8px; display: inline-block;">${accent.label}</span>
    </div>
  `;



  const taskList = DESIGN_TASKS.map(
    (t) =>
      `<li style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" ${t.done ? "checked" : ""} disabled style="accent-color: ${accent.hex}" />
        <span style="${t.done ? "text-decoration: line-through; color: #6b6b70;" : ""}">${t.title}</span>
      </li>`,
  ).join("");

  const body =
    values.layout === "task-card"
      ? `
        <h2>${escapedTitle}</h2>
        <p class="muted uppercase">${accent.label} &middot; task card</p>
        <ul style="border-top: 1px solid #d4d4d8; padding-top: 16px;">${taskList}</ul>
        <p class="muted uppercase" style="margin-top: 16px; font-size: 11px;">progress &middot; 66%</p>
        <div style="height: 6px; background: #d4d4d8; border-radius: 3px; overflow: hidden; margin-top: 8px;">
          <div style="width: 66%; height: 100%; background: ${accent.hex}"></div>
        </div>
      `
      : coverBody;

  return `
    <div class="card" style="border-top: 6px solid ${accent.hex};">
      ${body}
    </div>`;
}

export default function DesignCanvas() {
  const { t } = useLang();
  const [values, setValues] = useState<DesignValues>(DEFAULT_VALUES);
  const previewRef = useRef<HTMLDivElement>(null);
  const accent = selectedAccent(values.accentId);

  const setField = useCallback(
    (patch: Partial<DesignValues>) =>
      setValues((curr) => ({ ...curr, ...patch })),
    [],
  );

  const content = designToHtml(values);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {t("design.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Design a PRD cover or task card preview in the browser — zero backend, zero cost.
        </p>
      </div>

      <Card className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-4 flex flex-col gap-4">
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {t("design.titleLabel")}
          </label>
          <Input
            value={values.title}
            onChange={(e) => setField({ title: e.target.value })}
            placeholder="e.g. Task Management App"
            ariaLabel={t("design.title")}
          />
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {t("design.accent")}
          </label>
          <div className="flex flex-wrap gap-3">
            {DESIGN_ACCENTS.map((a) => (
              <ColorSwatch
                key={a.id}
                id={a.id}
                label={a.label}
                hex={a.hex}
                selected={values.accentId === a.id}
                onSelect={(id) => setField({ accentId: id })}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {t("design.layout")}
          </label>
          <Select
            value={values.layout}
            onChange={(v) => setField({ layout: v as Layout })}
            options={[
              { label: t("design.docCover"), value: "doc-cover" },
              { label: t("design.taskCard"), value: "task-card" },
            ]}
          />
        </div>
      </Card>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold tracking-tight text-ink">
            {t("design.preview")}
          </h3>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-[10px] uppercase tracking-wider text-muted">
            {values.layout}
          </span>
        </div>
        <div ref={previewRef} className="mx-auto max-w-[640px]">
          {values.layout === "doc-cover" ? (
            <DocCover values={values} accent={accent} />
          ) : (
            <TaskCard values={values} accent={accent} />
          )}
        </div>
        <ExportButton content={content}>{t("design.export")}</ExportButton>
      </div>
    </div>
  );
}

function DocCover({ values, accent }: { values: DesignValues; accent: (typeof DESIGN_ACCENTS)[number] }) {
  return (
    <Card className="relative overflow-hidden border border-line">
      <div style={{ borderTop: `6px solid ${accent.hex}` }}>
        <div className="absolute right-4 top-4 z-10">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed text-center"
          style={{
            borderColor: accent.hex,
            color: accent.hex,
          }}
        >
          <span className="font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.18em]">
            PRD
          </span>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-line pb-3 pr-20 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>prd-001</span>
        <span>v1.0</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {values.title || "Untitled PRD"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        PRD cover designed in the browser — no backend, no API keys, no cost.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <span
          className="h-1 w-16 shrink-0"
          style={{ backgroundColor: accent.hex }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {accent.label}
        </span>
      </div>
      </div>
    </Card>
  );
}

function TaskCard({ values, accent }: { values: DesignValues; accent: (typeof DESIGN_ACCENTS)[number] }) {
  const { t } = useLang();
  const doneCount = DESIGN_TASKS.filter((task) => task.done).length;
  const pct = Math.round((doneCount / DESIGN_TASKS.length) * 100);
  return (
    <Card className="border border-line">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {values.title || "Untitled task card"}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {t("design.taskCard")}
        </span>
      </div>
      <ul className="divide-y divide-line py-4">
        {DESIGN_TASKS.map((task, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              defaultChecked={task.done}
              readOnly
              className="shrink-0"
              style={{ accentColor: accent.hex }}
            />
            <span
              className={
                task.done
                  ? "text-muted line-through"
                  : "text-ink"
              }
            >
              {task.title}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          Progress
        </span>
        <span className="font-mono text-[11px] text-muted">{pct}%</span>
      </div>
      <ProgressBar value={pct} className="mt-1.5" />
    </Card>
  );
}
