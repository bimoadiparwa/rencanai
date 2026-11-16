import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open) return null;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg border p-6 max-w-2xl w-full mx-4 shadow-xl">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-text">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
