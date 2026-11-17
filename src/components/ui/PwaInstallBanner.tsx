import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { useLang } from "../../i18n";

/**
 * Minimal install prompt (Chrome/Android "beforeinstallprompt" flow).
 * Shown only when the browser fires beforeinstallprompt (installable PWA on
 * HTTPS/localhost). Dismissible; after install shows "Installed!" briefly.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const { t } = useLang();
  const [shown, setShown] = useState(false);
  const [installed, setInstalled] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  const dismiss = useCallback(() => {
    setShown(false);
  }, []);

  const installApp = useCallback(async () => {
    const prompt = deferred.current;
    if (!prompt) return;
    try {
      await prompt.prompt();
      setInstalled(true);
      setTimeout(() => setShown(false), 3000);
    } catch {
      // Install failed — banner stays dismissible.
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      const prompt = e as BeforeInstallPromptEvent;
      try {
        prompt.preventDefault();
      } catch {
        // not preventable; continue anyway
      }
      deferred.current = prompt;
      setShown(true);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setTimeout(() => setShown(false), 3000);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!shown) return null;

  return (
    <section
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-1rem)] rounded-xl border border-line bg-paper/95 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(24,24,27,0.35)] p-3 md:p-4 text-[12px]"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {installed ? (
          <span className="font-mono font-medium text-ink">
            {t("pwa.installed")}
          </span>
        ) : (
          <Button variant="ghost" onClick={installApp}>
            {t("pwa.install")}
          </Button>
        )}
        <Button variant="ghost" onClick={dismiss} ariaLabel={t("pwa.dismiss")}>
          <span aria-hidden="true">×</span>
        </Button>
      </div>
    </section>
  );
}
