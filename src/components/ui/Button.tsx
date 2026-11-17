import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLang } from "../../i18n";

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) {
  const base =
    "press inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium tracking-tight transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none";
  const variants = {
    primary:
      "bg-stamp text-white border border-transparent hover:bg-stamp-dark shadow-[0_1px_2px_rgba(191,59,30,0.25)] hover:shadow-[0_2px_8px_rgba(191,59,30,0.3)] hover:-translate-y-px",
    ghost:
      "bg-transparent text-ink border border-line hover:border-ink hover:bg-card",
    danger:
      "bg-transparent text-danger border border-line hover:border-danger hover:bg-danger/5",
  };
  const { t } = useLang();
  return (
    <button
      className={twMerge(clsx(base, variants[variant], className))}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="flex items-center gap-1 font-mono text-xs">
          {t("ui.loading")}
          <span className="animate-pulse">.</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
