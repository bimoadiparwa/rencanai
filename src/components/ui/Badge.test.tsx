import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Aktif</Badge>);
    expect(screen.getByText("Aktif")).toBeDefined();
  });
});
