import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title, description, and action", () => {
    render(
      <EmptyState
        title="Belum ada PRD"
        description="Buat PRD pertama Anda."
        action={<button>Buat Baru</button>}
      />,
    );
    expect(screen.getByText("Belum ada PRD")).toBeDefined();
    expect(screen.getByText("Buat PRD pertama Anda.")).toBeDefined();
    expect(screen.getByText("Buat Baru")).toBeDefined();
  });
});
