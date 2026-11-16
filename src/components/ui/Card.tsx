import { twMerge } from "tailwind-merge";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge("rounded-lg border bg-white dark:bg-slate-800 p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}
