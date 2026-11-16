import type { Task } from "../types";
import { makeId } from "./id";

// Reads the "Daftar Tugas" checklist from a generated PRD and returns tasks.
// Expected line format (from the system prompt): "- [ ] T-001 [P0] Judul (FR-001)"
export function extractTasks(markdown: string, now: number = Date.now()): Task[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s+Daftar Tugas\s*$/i.test(l.trim()));
  if (start === -1) return [];
  const tasks: Task[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    const m = line.match(/^\s*[-*]\s+\[\s?\]\s+(.+?)\s*$/);
    if (!m) continue;
    const title = m[1].replace(/\*\*/g, "").trim();
    if (!title) continue;
    tasks.push({ id: makeId(), title, status: "todo", createdAt: now });
  }
  return tasks;
}
