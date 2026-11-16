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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">Tugas — {prd.title}</h1>
          <p className="text-muted">Kelola tugas untuk PRD ini.</p>
        </div>
        <Link to={`/prd/${prdId}`}>
          <Button variant="ghost">← Kembali ke PRD</Button>
        </Link>
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

      <div className="space-y-2 mt-6">
        {prd.tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={t.status === "done"}
              onChange={() =>
                updateTaskStatus(prdId!, t.id, t.status === "done" ? "todo" : "done")
              }
              aria-label={`Tandai "${t.title}" selesai`}
            />
            <span className={t.status === "done" ? "line-through text-muted" : ""}>
              {t.title}
            </span>
            <Button variant="ghost" onClick={() => deleteTask(prdId!, t.id)}>
              Hapus
            </Button>
          </div>
        ))}
        {prd.tasks.length === 0 && <p className="text-muted">Belum ada tugas. Tambahkan tugas di atas.</p>}
      </div>
    </div>
  );
}
