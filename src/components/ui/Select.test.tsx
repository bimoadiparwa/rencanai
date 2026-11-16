import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "./Select";

describe("Select", () => {
  it("fires onChange on change event with value", () => {
    const onChange = vi.fn();
    const options = [
      { label: "Gemini", value: "gemini" },
      { label: "OpenRouter", value: "openrouter" },
    ];
    render(<Select value="gemini" onChange={onChange} options={options} label="Penyedia AI" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "openrouter" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("openrouter");
  });
});
