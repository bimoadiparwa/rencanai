import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";

export default function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold tracking-tight">
              RencanAI
            </Link>
            <Badge variant="default">Free</Badge>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/settings" className="text-sm text-muted hover:text-text">
              Pengaturan
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
