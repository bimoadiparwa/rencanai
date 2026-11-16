import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Markdown } from "../components/ui/Markdown";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";

export default function PrdEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { prds, deletePrd, updateTaskStatus, deleteTask } = useStore();
  const prd = prds.find((p) => p.id === id);

  if (!prd) {
    navigate("/dashboard");
    return null;
  }

  const done = prd.tasks.filter((t) => t.status === "done").length;

  const handleDelete = () => {
    if (window.confirm("Hapus PRD ini?")) {
      deletePrd(prd.id);
      navigate("/dashboard");
    }
  };

  const handleExport = () => {
    const md = `# ${prd.title}\n\n${prd.content}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prd.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">{prd.title}</h1>
          <p className="text-muted">{prd.description}</p>
        </div>
        <Button variant="danger" onClick={handleDelete}>
          Hapus PRD
        </Button>
      </div>
      <Markdown text={prd.content} />
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Tugas</h3>
        <ProgressBar value={done} max={prd.tasks.length} />
        <div className="space-y-2 mt-4">
          {prd.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={t.status === "done"}
                onChange={() => updateTaskStatus(prd.id, t.id, t.status === "done" ? "todo" : "done")}
              />
              <span className={t.status === "done" ? "line-through text-muted" : ""}>
                {t.title}
              </span>
              <Button variant="ghost" onClick={() => deleteTask(prd.id, t.id)}>
                Hapus
              </Button>
            </div>
          ))}
          {prd.tasks.length === 0 && <p className="text-muted">Tugas akan muncul di sini setelah PRD dihasilkan.</p>}
        </div>
      </div>
      <div className="mt-8 flex gap-2">
        <Link to={`/tasks/${prd.id}`}>
          <Button variant="ghost">← Kembali ke Tugas</Button>
        </Link>
        <Button onClick={handleExport}>Ekspor Markdown</Button>
      </div>
    </div>
  );
}
