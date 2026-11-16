import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="rise relative w-full max-w-2xl rounded-xl border border-line bg-card p-6 shadow-[0_24px_60px_-20px_rgba(24,24,27,0.25)]">
        {title && (
          <h2 className="mb-4 pr-8 text-lg font-semibold tracking-tight text-ink">{title}</h2>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted transition-colors hover:bg-line/60 hover:text-ink"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
        {children}
      </div>
    </div>
  );
}
