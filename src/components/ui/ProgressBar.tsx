export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className={className}>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-muted mt-1">{pct}%</div>
    </div>
  );
}
