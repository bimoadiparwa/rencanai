import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ProgressBar } from "../components/ui/ProgressBar";

export default function Tasks() {
  const { prdId } = useParams<{ prdId: string }>();
  const navigate = useNavigate();
  const { prds, addTask, updateTaskStatus, deleteTask } = useStore();
  const prd = prds.find((p) => p.id === prdId);

  const [taskTitle, setTaskTitle] = useState("");

  useEffect(() => {
    if (!prd) navigate("/dashboard");
  }, [prd, prdId, navigate]);

  if (!prd) return null;

  const done = prd.tasks.filter((t) => t.status === "done").length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    addTask(prdId!, { title, status: "todo" });
    setTaskTitle("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          daftar tugas
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Tugas — {prd.title}
            </h1>
            <p className="mt-1 text-sm text-muted">Kelola tugas untuk PRD ini.</p>
          </div>
          <Link to={`/prd/${prdId}`}>
            <Button variant="ghost">← Kembali ke PRD</Button>
          </Link>
        </div>
      </div>

      <ProgressBar value={done} max={prd.tasks.length} />

      <form onSubmit={handleAddTask} className="mt-8 flex gap-2">
        <Input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Tambah tugas baru..."
        />
        <Button type="submit">Tambah</Button>
      </form>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {prd.tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-3.5">
            <input
              type="checkbox"
              checked={t.status === "done"}
              onChange={() =>
                updateTaskStatus(prdId!, t.id, t.status === "done" ? "todo" : "done")
              }
              aria-label={`Tandai "${t.title}" selesai`}
              className="h-4 w-4 shrink-0 cursor-pointer rounded-[4px] border border-line accent-stamp transition-colors hover:border-stamp"
            />
            <span
              className={`min-w-0 flex-1 text-sm ${
                t.status === "done" ? "text-muted line-through" : "text-ink"
              }`}
            >
              {t.title}
            </span>
            <Button variant="ghost" onClick={() => deleteTask(prdId!, t.id)} className="px-2.5 py-1.5 text-xs">
              Hapus
            </Button>
          </div>
        ))}
        {prd.tasks.length === 0 && (
          <p className="py-4 text-sm text-muted">Belum ada tugas. Tambahkan tugas di atas.</p>
        )}
      </div>
    </div>
  );
}
