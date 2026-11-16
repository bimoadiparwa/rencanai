import { ClipboardList } from "lucide-react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="text-muted mx-auto mb-4"><ClipboardList size={48} /></div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
