import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-primary text-white border-transparent hover:bg-primary-hover",
    ghost: "bg-transparent border-muted hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-red-600 text-white border-transparent hover:bg-red-700",
  };
  return (
    <button
      className={twMerge(clsx(base, variants[variant], className))}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          Memuat<span className="animate-pulse">.</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
