import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DesignCanvas from "../components/ui/DesignCanvas";
import { ExportButton } from "../components/ui/ExportButton";

function renderCanvas() {
  return render(<DesignCanvas />);
}

function captureBlobs() {
  const captured: Blob[] = [];
  const createDesc = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const revokeDesc = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
  const urlStub = URL as unknown as {
    createObjectURL?: (obj: Blob) => string;
    revokeObjectURL?: () => void;
  };
  urlStub.createObjectURL = (obj: Blob) => {
    captured.push(obj);
    return "blob:mock";
  };
  urlStub.revokeObjectURL = () => {};
  return {
    captured,
    restore: () => {
      if (createDesc) Object.defineProperty(URL, "createObjectURL", createDesc);
      else delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
      if (revokeDesc) Object.defineProperty(URL, "revokeObjectURL", revokeDesc);
      else delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;
    },
  };
}

describe("DesignCanvas", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders title input, accent swatches, layout select, and export button", () => {
    renderCanvas();
    expect(screen.getByText("Design preview")).toBeDefined();
    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByTitle("Stamp red")).toBeDefined();
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("button", { name: /export preview/i })).toBeDefined();
  });

  it("defaults to the stamp accent on the preview border", () => {
    renderCanvas();
    const border = () =>
      Array.from(document.querySelectorAll("div")).find(
        (el) => el.style.borderTop && el.style.borderTop.includes("solid"),
      )?.style.borderTop;
    expect(border()).toContain("rgb(191, 59, 30)");
  });

  it("changes the preview accent color when a swatch is selected", () => {
    renderCanvas();
    const border = () =>
      Array.from(document.querySelectorAll("div")).find(
        (el) => el.style.borderTop && el.style.borderTop.includes("solid"),
      )?.style.borderTop;

    fireEvent.click(screen.getByTitle("Emerald"));
    expect(border()).toContain("rgb(5, 150, 105)");
    expect(screen.getByTitle("Emerald")).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the entered title in the preview", () => {
    renderCanvas();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task Management App" },
    });
    expect(screen.getByText("Task Management App")).toBeDefined();
  });

  it("switches between doc cover and task card layout", () => {
    renderCanvas();
    expect(screen.getByText("Untitled PRD")).toBeDefined();
    expect(screen.queryByText("Untitled task card")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "task-card" },
    });
    expect(screen.getByText("Untitled task card")).toBeDefined();
    expect(screen.queryByText("Untitled PRD")).not.toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("export produces an HTML blob containing the preview", async () => {
    renderCanvas();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task Management App" },
    });
    const { captured, restore } = captureBlobs();

    fireEvent.click(screen.getByRole("button", { name: /export preview/i }));

    expect(captured).toHaveLength(1);
    expect(captured[0].type).toBe("text/html");
    const html = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsText(captured[0]);
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Task Management App");
    restore();
  });
});

describe("ExportButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("export svg format produces an SVG blob", () => {
    const { captured, restore } = captureBlobs();
    render(
      <ExportButton content="<b>hi</b>" format="svg">
        Ekspor pratinjau
      </ExportButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: /ekspor pratinjau/i }));
    expect(captured).toHaveLength(1);
    expect(captured[0].type).toBe("image/svg+xml");
    restore();
  });
});
