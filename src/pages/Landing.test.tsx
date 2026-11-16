import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Landing from "./Landing";

beforeEach(() => {
  (window as any).IntersectionObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor() {}
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="current-path">{pathname}</div>;
}

describe("Landing", () => {
  it("renders hero heading", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Landing />
      </MemoryRouter>
    );
    expect(screen.getByText("Bikin PRD dalam hitungan detik")).toBeDefined();
  });

  it("CTA navigates to /dashboard", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Landing />
        <LocationProbe />
      </MemoryRouter>
    );
    const cta = screen.getByRole("button", { name: /mulai buat prd/i });
    act(() => fireEvent.click(cta));
    expect(screen.getByTestId("current-path").textContent).toBe("/dashboard");
  });
});
