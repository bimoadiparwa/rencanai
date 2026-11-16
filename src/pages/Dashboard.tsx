import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useReveal } from "../hooks/useReveal";

export default function Dashboard() {
  const prds = useStore((state) => state.prds);
  const navigate = useNavigate();
  const { ref, visible } = useReveal();
  const reveal = {
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 24}px)`,
    transition: "all 0.8s ease",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto py-8 px-4">
        <div ref={ref} style={reveal} className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold">PRD Anda</h1>
            <p className="text-sm text-muted">Semua dokumen PRD disimpan di browser Anda.</p>
          </div>
          <Button onClick={() => navigate("/prd/create")}>Buat PRD Baru</Button>
        </div>

        {prds.length === 0 ? (
          <EmptyState
            title="Belum ada PRD"
            description="Buat PRD pertama Anda dengan AI — gratis."
            action={<Button onClick={() => navigate("/prd/create")}>Buat PRD Baru</Button>}
          />
        ) : (
          <div className="space-y-3">
            {prds.map((prd) => (
              <Card key={prd.id} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer">
                <Link to={`/prd/${prd.id}`} className="block">
                  <h2 className="font-semibold">{prd.title}</h2>
                  <p className="text-sm text-muted">
                    {new Date(prd.updatedAt).toLocaleDateString("id-ID")}
                  </p>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
