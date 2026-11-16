import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Isi kartu</Card>);
    expect(screen.getByText("Isi kartu")).toBeDefined();
  });
});
