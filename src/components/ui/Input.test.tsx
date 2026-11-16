import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("fires onChange on change event", () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} placeholder="Masukkan teks" />);
    const input = screen.getByPlaceholderText("Masukkan teks") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "halo" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
