import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("is null when open is false", () => {
    const { container } = render(<Modal open={false} onClose={vi.fn()}>Tidak terlihat</Modal>);
    expect(container.innerHTML).toBe("");
  });

  it("renders title and children when open", () => {
    render(
      <Modal open onClose={vi.fn()} title="Judul Modal">
        Isi modal
      </Modal>,
    );
    expect(screen.getByText("Judul Modal")).toBeDefined();
    expect(screen.getByText("Isi modal")).toBeDefined();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Isi</Modal>);
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
