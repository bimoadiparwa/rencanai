export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted" | "danger";
}) {
  const variants = {
    default: "border border-slate-700 text-slate-600 dark:border-slate-600 dark:text-slate-400",
    primary: "bg-primary text-white border-transparent",
    muted: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    danger: "bg-red-600 text-white border-transparent",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
