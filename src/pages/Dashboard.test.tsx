import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useStore } from "../store/useStore";
import type { Prd } from "../types";

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

beforeEach(() => {
  (window as any).IntersectionObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor() {}
  };
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Dashboard />
      <LocationProbe />
    </MemoryRouter>
  );
}

function createPrd(overrides: Partial<Prd> = {}): Prd {
  return {
    id: "prd-1",
    title: "Judul PRD",
    description: "deskripsi singkat",
    content: "# isi PRD",
    tasks: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

describe("Dashboard", () => {
  it("renders empty state when no prds", () => {
    renderDashboard();
    expect(screen.getByText("No PRDs yet")).toBeDefined();
    expect(screen.getByText("Create your first PRD with AI — free.")).toBeDefined();
    expect(screen.getAllByText(/new prd/i)).toHaveLength(2);
  });

  it("renders list items when prds exist", () => {
    const prd = createPrd({ updatedAt: Date.now() });
    useStore.getState().addPrd(prd);
    const updatedAtText = new Date(prd.updatedAt).toLocaleDateString("en-US");
    renderDashboard();
    expect(screen.getByText("Judul PRD")).toBeDefined();
    expect(screen.getByText(updatedAtText)).toBeDefined();
  });

  it("navigates to /prd/:id when a prd is clicked", () => {
    const prd = createPrd({ id: "prd-abc", title: "Judul PRD" });
    useStore.getState().addPrd(prd);
    renderDashboard();
    act(() => fireEvent.click(screen.getByText("Judul PRD")));
    expect(screen.getByTestId("current-path").textContent).toBe("/prd/prd-abc");
  });

  it("top-right New PRD navigates to /prd/create", () => {
    useStore.getState().addPrd(createPrd());
    renderDashboard();
    act(() => fireEvent.click(screen.getByRole("button", { name: /new prd/i })));
    expect(screen.getByTestId("current-path").textContent).toBe("/prd/create");
  });
});
