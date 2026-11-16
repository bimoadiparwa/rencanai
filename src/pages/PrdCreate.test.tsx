import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import PrdCreate from "./PrdCreate";
import { useStore } from "../store/useStore";
import { generatePrd } from "../lib/ai";

vi.mock("../lib/ai", () => ({
  generatePrd: vi.fn((opts: any) => {
    opts.onChunk("## Ringkasan\n");
    opts.onComplete();
    return { abort: vi.fn(), promise: Promise.resolve() };
  }),
}));

const mockGeneratePrd = vi.mocked(generatePrd);

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

beforeEach(() => {
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
  mockGeneratePrd.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

function renderPrdCreate() {
  return render(
    <MemoryRouter initialEntries={["/prd/create"]}>
      <PrdCreate />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("PrdCreate", () => {
  it("shows Perlu API Key and disables Generate without settings", () => {
    renderPrdCreate();
    expect(screen.getByText("Perlu API Key")).toBeDefined();
    expect(screen.getByRole("button", { name: /buat prd dengan ai/i })).toBeDisabled();
  });

  it("streams content, calls generatePrd with brief, and navigates to /prd/:id", async () => {
    useStore.getState().setSettings({ provider: "gemini", apiKey: "k", model: "gemini-3.8-flash" });
    renderPrdCreate();

    fireEvent.change(screen.getByPlaceholderText(/contoh:/i), {
      target: { value: "Aplikasi Manajemen Tugas" },
    });
    fireEvent.change(screen.getByPlaceholderText(/mengatur tugas/i), {
      target: { value: "Manajemen tugas harian untuk tim." },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /buat prd dengan ai/i }));
    });

    expect(mockGeneratePrd).toHaveBeenCalledTimes(1);
    const opts = mockGeneratePrd.mock.calls[0][0];
    expect(opts.provider).toBe("gemini");
    expect(opts.apiKey).toBe("k");
    expect(opts.brief).toContain("Aplikasi Manajemen Tugas");
    expect(opts.brief).toContain("Manajemen tugas harian");

    expect(screen.getByTestId("prd-content").textContent).toContain("## Ringkasan");
    expect(screen.getByTestId("current-path").textContent).toMatch(/^\/prd\//);
  });
});
