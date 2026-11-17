import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

describe("Header", () => {
  it("renders logo text", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText("RencanAI")).toBeDefined();
  });

  it("renders permanent Free badge", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText("Free")).toBeDefined();
  });

  it("renders link to /settings", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/settings");
  });
});
