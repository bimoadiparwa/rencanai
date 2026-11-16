import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders percentage text", () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByText("50%")).toBeDefined();
  });
});
