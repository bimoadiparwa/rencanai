import { Link } from "react-router-dom";
import { Sun, Moon, Monitor } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useStore } from "../../store/useStore";
import { getLang, setLang, useLang } from "../../i18n";
import type { Theme } from "../../types";

const CYCLE: Theme[] = ["light", "dark", "system"];

function ThemeButton() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const { t } = useLang();
  const labelKey = {
    light: "theme.toDark",
    dark: "theme.toSystem",
    system: "theme.toLight",
  } as const;
  const next = () => setTheme(CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]);
  return (
    <button
      type="button"
      onClick={next}
      title={t(labelKey[theme])}
      aria-label={t(labelKey[theme])}
      className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-card hover:text-stamp"
    >
      {theme === "light" && <Sun size={18} strokeWidth={1.75} />}
      {theme === "dark" && <Moon size={18} strokeWidth={1.75} />}
      {theme === "system" && <Monitor size={18} strokeWidth={1.75} />}
    </button>
  );
}

function LangButton() {
  const { t } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(getLang() === "en" ? "id" : "en")}
      title={t("lang.switch")}
      aria-label={t("lang.switch")}
      className="flex h-10 items-center justify-center rounded-md px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:bg-card hover:text-stamp"
    >
      {t("lang.other")}
    </button>
  );
}

export default function Header() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-stamp text-[13px] font-bold leading-none text-white transition-transform duration-150 group-hover:-rotate-6">
            R
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            RencanAI
          </span>
          <Badge>Free</Badge>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:inline">
            {t("nav.tagline")}
          </span>
          <ThemeButton />
          <LangButton />
          <Link
            to="/settings"
            className="flex h-10 items-center rounded-md px-2.5 text-sm text-ink-soft transition-colors hover:text-stamp"
          >
            {t("nav.settings")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
