import { useLang } from "../../i18n";

export function ProgressBar({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const { t } = useLang();
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className={className}>
      <div className="w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-1.5 rounded-full bg-stamp transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
        <span>{t("ui.progress")}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
