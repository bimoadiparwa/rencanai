import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { useReveal } from "../hooks/useReveal";

export default function Dashboard() {
  const prds = useStore((state) => state.prds);
  const navigate = useNavigate();
  const { ref, visible } = useReveal();
  const reveal = {
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 16}px)`,
    transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div ref={ref} style={reveal} className="mb-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          dokumen
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              PRD Anda
            </h1>
            <p className="mt-1 text-sm text-muted">
              Semua dokumen PRD disimpan di browser Anda.
            </p>
          </div>
          <Button onClick={() => navigate("/prd/create")}>Buat PRD Baru</Button>
        </div>
      </div>

      {prds.length === 0 ? (
        <EmptyState
          title="Belum ada PRD"
          description="Buat PRD pertama Anda dengan AI — gratis."
          action={<Button onClick={() => navigate("/prd/create")}>Buat PRD Baru</Button>}
        />
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {prds.map((prd) => (
            <Link
              key={prd.id}
              to={`/prd/${prd.id}`}
              className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-card"
            >
              <div className="min-w-0">
                <h2 className="truncate font-medium tracking-tight text-ink transition-colors group-hover:text-stamp">
                  {prd.title}
                </h2>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                  {new Date(prd.updatedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted opacity-0 transition-opacity group-hover:opacity-100">
                buka →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
