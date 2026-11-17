import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  it("renders heading from markdown text", () => {
    render(<Markdown text="# Foo" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
    expect(screen.getByText("Foo")).toBeDefined();
  });

  it("renders bold and code blocks from image-like content", () => {
    const content = `### Goals and Success Metrics
- Launch MVP within 6-8 weeks
- **95%** of calculations complete in under 200 ms.
- Support **trigonometric calculations** in both degrees and radians.

\`\`\`javascript
function calculate(x) {
  return x ** 2;
}
\`\`\``;
    render(<Markdown text={content} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeDefined();
    expect(screen.getByText("Launch MVP within 6-8 weeks")).toBeDefined();
    expect(screen.getByText("95%")).toBeDefined();
    expect(screen.getByRole("code")).toBeDefined();
  });
});
