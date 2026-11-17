import { useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "../../i18n";

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
  const { t } = useLang();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="rise relative my-auto w-full max-w-2xl rounded-xl border border-line bg-card p-6 shadow-[0_24px_60px_-20px_rgba(24,24,27,0.25)]">
        {title && (
          <h2 className="mb-4 pr-12 text-lg font-semibold tracking-tight text-ink">{title}</h2>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("ui.close")}
          className="absolute right-3 top-3 rounded-md p-2.5 text-muted transition-colors hover:bg-line/60 hover:text-ink"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
        {children}
      </div>
    </div>
  );
}
