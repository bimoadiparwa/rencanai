export function Select({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  label?: string;
  className?: string;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-md border border-line bg-card bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%2371717a%22 stroke-width=%221.5%22><path d=%22M2 4l4 4 4-4%22/></svg>')] bg-[right_0.85rem_center] bg-no-repeat px-3.5 py-2.5 pr-9 text-sm text-ink transition-colors duration-150 hover:border-muted/60 focus:border-ink focus:outline-none ${className ?? ""}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
