import { describe, it, expect } from "vitest";
import { extractTasks } from "./prd";

describe("extractTasks", () => {
  it("turns the Daftar Tugas checklist into todo tasks", () => {
    const md = [
      "# Produk",
      "## Rencana Rilis",
      "- [ ] bukan tugas",
      "## Daftar Tugas",
      "- [ ] T-001 [P0] Siapkan skema database (FR-001)",
      "- [ ] **T-002** [P1] Halaman login (FR-002)",
      "- [x] T-003 [P2] sudah selesai (FR-003)",
      "## Lampiran",
      "- [ ] di luar bagian",
    ].join("\n");
    const tasks = extractTasks(md);
    expect(tasks.map((t) => t.title)).toEqual([
      "T-001 [P0] Siapkan skema database (FR-001)",
      "T-002 [P1] Halaman login (FR-002)",
    ]);
    expect(tasks.every((t) => t.status === "todo" && t.id)).toBe(true);
  });

  it("returns no tasks when the section is missing", () => {
    expect(extractTasks("# Tanpa tugas\n## Ringkasan Eksekutif\nIsi")).toEqual([]);
  });
});
