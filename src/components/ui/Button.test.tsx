import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and calls onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Simpan</Button>);
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables click", () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Simpan</Button>);
    const btn = screen.getByRole("button", { name: /memuat/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
