import { twMerge } from "tailwind-merge";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={twMerge(
        "rounded-xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}
