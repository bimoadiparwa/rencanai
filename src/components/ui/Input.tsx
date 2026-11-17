import React from "react";
import { useLang } from "../../i18n";

export function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  reveal = false,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "password";
  placeholder?: string;
  reveal?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const [shown, setShown] = React.useState(false);
  const { t } = useLang();
  const base =
    "w-full rounded-md border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/80 transition-colors duration-150 hover:border-muted/60 focus:border-ink focus:outline-none";
  return (
    <div className="relative w-full">
      <input
        type={reveal && !shown ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={reveal ? `${base} pr-24 ${className ?? ""}` : `${base} ${className ?? ""}`}
      />
      {reveal && (
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-stamp"
        >
          {shown ? t("ui.hide") : t("ui.show")}
        </button>
      )}
    </div>
  );
}
