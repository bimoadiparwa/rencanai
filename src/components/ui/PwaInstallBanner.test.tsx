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