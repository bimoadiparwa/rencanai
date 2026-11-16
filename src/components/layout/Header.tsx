import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-stamp text-[13px] font-bold leading-none text-white transition-transform duration-150 group-hover:-rotate-6">
            R
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            RencanAI
          </span>
          <Badge>Free</Badge>
        </Link>
        <nav className="flex items-center gap-5">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:inline">
            prd generator
          </span>
          <Link
            to="/settings"
            className="text-sm text-ink-soft transition-colors hover:text-stamp"
          >
            Pengaturan
          </Link>
        </nav>
      </div>
    </header>
  );
}
