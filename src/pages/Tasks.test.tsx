import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Tasks from "./Tasks";
import { useStore } from "../store/useStore";
import type { Prd } from "../types";

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

beforeEach(() => {
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

afterEach(() => {
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

function renderTasks() {
  return render(
    <MemoryRouter initialEntries={["/tasks/p1"]}>
      <Routes>
        <Route path="/tasks/:prdId" element={<Tasks />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}

function createPrd(overrides: Partial<Prd> = {}): Prd {
  return {
    id: "p1",
    title: "Judul PRD",
    description: "deskripsi singkat",
    content: "# isi PRD",
    tasks: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

describe("Tasks", () => {
  it("navigates to /dashboard when PRD not found", () => {
    renderTasks();
    expect(screen.getByTestId("current-path").textContent).toBe("/dashboard");
  });

  it("renders progress bar and task list", () => {
    const prd = createPrd({
      tasks: [
        { id: "t1", title: "Tugas satu", status: "todo", createdAt: 1 },
        { id: "t2", title: "Tugas dua", status: "done", createdAt: 2 },
      ],
    });
    useStore.getState().addPrd(prd);
    renderTasks();

    expect(screen.getByText("50%")).toBeDefined();
    expect(screen.getByText("Tugas satu")).toBeDefined();
    expect(screen.getByText("Tugas dua")).toBeDefined();
  });

  it("toggles task status and updates progress bar", () => {
    const prd = createPrd({
      tasks: [{ id: "t1", title: "Tugas satu", status: "todo", createdAt: 1 }],
    });
    useStore.getState().addPrd(prd);
    renderTasks();

    expect(screen.getByText("0%")).toBeDefined();
    expect(useStore.getState().prds[0]!.tasks[0].status).toBe("todo");

    act(() => {
      fireEvent.click(screen.getAllByRole("checkbox")[0]);
    });

    expect(useStore.getState().prds[0]!.tasks[0].status).toBe("done");
    expect(screen.getByText("100%")).toBeDefined();

    act(() => {
      fireEvent.click(screen.getAllByRole("checkbox")[0]);
    });

    expect(useStore.getState().prds[0]!.tasks[0].status).toBe("todo");
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("adds a new task via Tambah button", () => {
    const prd = createPrd({ tasks: [] });
    useStore.getState().addPrd(prd);
    renderTasks();

    const input = screen.getByPlaceholderText(/tambah tugas baru/i);
    act(() => {
      fireEvent.change(input, { target: { value: "Tugas baru" } });
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /tambah/i }));
    });

    expect(screen.getByText("Tugas baru")).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
    expect(input).toHaveValue("");
  });

  it("deletes a task", () => {
    const prd = createPrd({
      tasks: [{ id: "t1", title: "Tugas satu", status: "todo", createdAt: 1 }],
    });
    useStore.getState().addPrd(prd);
    renderTasks();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /hapus/i }));
    });

    expect(screen.queryByText("Tugas satu")).not.toBeInTheDocument();
  });
});
