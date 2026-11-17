import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PwaInstallBanner } from "./PwaInstallBanner";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

/** Fires a beforeinstallprompt event on window and returns the mock prompt(). */
function fireBeforeInstallPrompt() {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const e = Object.assign(
    new Event("beforeinstallprompt"),
    { prompt }
  ) as unknown as BeforeInstallPromptEvent;
  act(() => {
    window.dispatchEvent(e);
  });
  return prompt;
}

describe("PwaInstallBanner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing until beforeinstallprompt fires", () => {
    render(<PwaInstallBanner />);
    expect(
      screen.queryByRole("button", { name: /install app/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dismiss/i })
    ).not.toBeInTheDocument();
  });

  it("shows the install banner when beforeinstallprompt fires", () => {
    render(<PwaInstallBanner />);
    fireBeforeInstallPrompt();
    expect(
      screen.getByRole("button", { name: /install app/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /dismiss/i })
    ).toBeInTheDocument();
  });

  it("calls prompt() on install and shows installed state", async () => {
    render(<PwaInstallBanner />);
    const prompt = fireBeforeInstallPrompt();
    fireEvent.click(screen.getByRole("button", { name: /install app/i }));
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Installed!")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /install app/i })
    ).not.toBeInTheDocument();
  });

  it("hides the banner when dismissed", () => {
    render(<PwaInstallBanner />);
    fireBeforeInstallPrompt();
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(
      screen.queryByRole("button", { name: /install app/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dismiss/i })
    ).not.toBeInTheDocument();
  });
});
