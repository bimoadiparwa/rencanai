import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import App from "./App";
import { useStore } from "./store/useStore";
import { generatePrd } from "./lib/ai";

vi.mock("./lib/ai", () => ({
  generatePrd: vi.fn((opts: any) => {
    opts.onChunk("## Summary\n");
    opts.onComplete();
    return { abort: vi.fn(), promise: Promise.resolve() };
  }),
}));

const mockGeneratePrd = vi.mocked(generatePrd);

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

let navigateApp: ((to: string) => void) | undefined;
function NavCapture() {
  navigateApp = useNavigate();
  return null;
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <NavCapture />
      <App />
      <LocationProbe />
    </MemoryRouter>
  );
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
  mockGeneratePrd.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("rencanai-store");
  useStore.getState().resetStore();
});

describe("integration: happy path", () => {
  it("clicks through Landing → Settings → PRD create → editor → tasks", async () => {
    // 1. Render App at "/"
    renderApp();

    // 2. Landing hero heading visible
    expect(screen.getByText("Create a PRD in seconds")).toBeDefined();

    // 3. Click link to /settings (Header "Settings")
    act(() => {
      fireEvent.click(screen.getByRole("link", { name: /^settings$/i }));
    });
    expect(screen.getByTestId("current-path").textContent).toBe("/settings");
    expect(screen.getByText("AI Settings")).toBeDefined();

    // 4. Select provider, type API key, pick model, click Save
    const providerSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(providerSelect, { target: { value: "gemini" } });
    const apiKeyInput = screen.getByPlaceholderText("Enter API key");
    fireEvent.change(apiKeyInput, { target: { value: "test-key-123" } });
    const modelSelect = screen.getAllByRole("combobox")[1];
    fireEvent.change(modelSelect, { target: { value: "gemini-3.8-flash" } });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /save settings/i }));
    });

    // 5. Settings persisted to the default Zustand store
    expect(useStore.getState().settings).toEqual({
      provider: "gemini",
      apiKey: "test-key-123",
      model: "gemini-3.8-flash",
    });

    // 6. Go to /prd/create (no link exists from Settings; navigate directly)
    act(() => {
      navigateApp!("/prd/create");
    });
    expect(screen.getByTestId("current-path").textContent).toBe("/prd/create");

    // 7. generatePrd is mocked: onChunk("## Summary\n") then onComplete() sync

    // 8. Fill title and brief, click Generate
    fireEvent.change(screen.getByPlaceholderText(/e\.g\./i), {
      target: { value: "Test PRD" },
    });
    fireEvent.change(screen.getByPlaceholderText(/daily tasks/i), {
      target: { value: "Test app" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /create prd with ai/i }));
    });

    // 9. Navigated to /prd/:id and content shows "## Summary"
    expect(screen.getByTestId("current-path").textContent).toMatch(/^\/prd\//);
    expect(mockGeneratePrd).toHaveBeenCalledTimes(1);
    const opts = mockGeneratePrd.mock.calls[0][0];
    expect(opts.brief).toContain("Test PRD");
    expect(opts.brief).toContain("Test app");
    expect(screen.getByRole("heading", { name: "Summary" })).toBeDefined();

    const prdId = useStore.getState().prds[0]!.id;

    // 10. Click editor's "Back to tasks" link to /tasks/:prdId
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /back to tasks/i }));
    });
    expect(screen.getByTestId("current-path").textContent).toBe(`/tasks/${prdId}`);

    // 11. ProgressBar renders and a task can be added
    expect(screen.getByText("0%")).toBeDefined();
    const taskInput = screen.getByPlaceholderText(/add a new task/i);
    act(() => {
      fireEvent.change(taskInput, { target: { value: "Tugas Uji" } });
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    });
    expect(screen.getByText("Tugas Uji")).toBeDefined();
    expect(useStore.getState().prds[0]!.tasks).toHaveLength(1);
  });
});
