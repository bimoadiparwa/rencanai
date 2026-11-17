import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Markdown } from "../components/ui/Markdown";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useLang } from "../i18n";

export default function PrdEditor() {
  const { t } = useLang();
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
    if (window.confirm(t("editor.deleteConfirm"))) {
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {t("editor.eyebrow")}
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {prd.title}
            </h1>
            <p className="mt-1 max-w-[60ch] text-sm text-muted">{prd.description}</p>
          </div>
          <Button variant="danger" onClick={handleDelete}>
            {t("editor.deleteBtn")}
          </Button>
        </div>
      </div>

      <article className="rounded-xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] sm:p-8 overflow-x-auto [&_a]:text-stamp [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-ink [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:text-sm [&_ol]:list-decimal [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-ink-soft [&_table]:text-sm [&_td]:border-line [&_th]:border-line [&_ul]:list-disc">
        <Markdown text={prd.content} />
      </article>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {t("editor.tasksTitle")}
        </h3>
        <ProgressBar value={done} max={prd.tasks.length} />
        <div className="mt-4 divide-y divide-line border-y border-line">
          {prd.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 py-3.5">
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => updateTaskStatus(prd.id, task.id, task.status === "done" ? "todo" : "done")}
                aria-label={t("tasks.markDone", { title: task.title })}
                className="h-5 w-5 shrink-0 cursor-pointer rounded-[4px] border border-line accent-stamp transition-colors hover:border-stamp"
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  task.status === "done" ? "text-muted line-through" : "text-ink"
                }`}
              >
                {task.title}
              </span>
              <Button variant="ghost" onClick={() => deleteTask(prd.id, task.id)} className="px-3 py-2.5 text-xs">
                {t("tasks.delete")}
              </Button>
            </div>
          ))}
          {prd.tasks.length === 0 && (
            <p className="py-4 text-sm text-muted">
              {t("editor.tasksEmpty")}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={`/tasks/${prd.id}`}>
          <Button variant="ghost">{t("editor.backTasks")}</Button>
        </Link>
        <Button onClick={handleExport}>{t("editor.export")}</Button>
      </div>
    </div>
  );
}
