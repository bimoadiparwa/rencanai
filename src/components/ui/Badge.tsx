export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted" | "danger";
}) {
  const variants = {
    default: "border border-ink/25 text-ink-soft bg-transparent",
    primary: "bg-stamp text-white border border-transparent",
    muted: "bg-line/70 text-muted border border-transparent",
    danger: "bg-danger/15 text-danger border border-danger/30 dark:bg-danger/15 dark:text-danger dark:border-danger/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
