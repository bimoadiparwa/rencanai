import { ClipboardList } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-card/60 px-6 py-14 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-stamp/60 text-stamp">
        <ClipboardList size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
