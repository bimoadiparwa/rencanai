import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import PrdEditor from "./PrdEditor";
import { useStore } from "../store/useStore";

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

beforeEach(() => {
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

function renderPrdEditor() {
  return render(
    <MemoryRouter initialEntries={["/prd/p1"]}>
      <Routes>
        <Route path="/prd/:id" element={<PrdEditor />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("PrdEditor", () => {
  it("renders PRD title, description, and markdown content", () => {
    useStore.getState().addPrd({
      id: "p1",
      title: "Judul PRD",
      description: "deskripsi singkat",
      content: "# Ringkasan\n\nIni isi PRD.",
      tasks: [],
      createdAt: 1000,
      updatedAt: 1000,
    });
    renderPrdEditor();
    expect(screen.getByText("Judul PRD")).toBeDefined();
    expect(screen.getByText("deskripsi singkat")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Ringkasan" })).toBeDefined();
    expect(screen.getByText("Ini isi PRD.")).toBeDefined();
  });

  it("deletes PRD and navigates to /dashboard when confirmed", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    useStore.getState().addPrd({
      id: "p1",
      title: "Judul PRD",
      description: "deskripsi singkat",
      content: "# Ringkasan",
      tasks: [],
      createdAt: 1000,
      updatedAt: 1000,
    });
    renderPrdEditor();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /hapus prd/i }));
    });
    expect(screen.getByTestId("current-path").textContent).toBe("/dashboard");
  });
});
