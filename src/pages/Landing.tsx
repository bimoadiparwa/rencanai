import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useReveal } from "../hooks/useReveal";
import { useLang } from "../i18n";
import { KeyRound, HardDrive, Check } from "lucide-react";

function DocMock() {
  const { lang, t } = useLang();

  const docTasks = useMemo(
    () => [
      { title: t("landing.docTask1"), done: true },
      { title: t("landing.docTask2"), done: true },
      { title: t("landing.docTask3"), done: false },
    ],
    [lang], // eslint-disable-line react-hooks/exhaustive-deps -- t is stable; lang drives re-translation
  );

  return (
    <div className="relative">
      {/* Signature: stamped seal */}
      <div className="stamp-in absolute -right-2 -top-5 z-10 flex h-20 w-20 rotate-[-8deg] flex-col items-center justify-center rounded-full border-2 border-dashed border-stamp/70 bg-paper/80 text-center sm:-top-6 sm:h-24 sm:w-24 lg:-right-6">
        <span className="font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.18em] text-stamp">
          {t("landing.sealA")}
        </span>
        <span className="font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.18em] text-stamp">
          {t("landing.sealB")}
        </span>
        <span className="mt-0.5 h-px w-8 bg-stamp/50" />
        <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-stamp/70">
          {t("landing.sealC")}
        </span>
      </div>

      <div className="rounded-xl border border-line bg-card p-6 shadow-[0_20px_45px_-25px_rgba(24,24,27,0.25)] sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-line pb-3 pr-20 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:pr-24">
          <span>prd-001</span>
          <span>v1.0</span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-ink">
          {t("landing.docTitle")}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {t("landing.docSummary")}
        </p>

        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {t("landing.docTasks")}
            </span>
            <span className="font-mono text-[10px] text-muted">
              {docTasks.filter((task) => task.done).length}/{docTasks.length}
            </span>
          </div>
          <ul className="space-y-2.5">
            {docTasks.map((task, i) => (
              <li key={task.title} className="flex items-center gap-3 text-[13px]">
                <span
                  className={`check-pop flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                    task.done
                      ? "border-stamp bg-stamp text-white"
                      : "border-line bg-card"
                  }`}
                  style={{ animationDelay: `${0.7 + i * 0.25}s` }}
                >
                  {task.done && <Check size={11} strokeWidth={3} />}
                </span>
                <span className={task.done ? "text-muted line-through" : "text-ink"}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLang();
  const stepsRef = useReveal();
  const featuresRef = useReveal();

  const STEPS = [
    {
      num: "01",
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
    },
    {
      num: "02",
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
    },
    {
      num: "03",
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
    },
  ];

  const revealStyle = (r: { visible: boolean }) => ({
    opacity: r.visible ? 1 : 0,
    transform: `translateY(${r.visible ? 0 : 22}px)`,
    transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
  });

  return (
    <div className="flex-1">
      {/* HERO — asymmetric split, mount-time entrance */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 md:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <h1
                className="rise text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-[3.4rem]"
                style={{ animationDelay: "0.05s" }}
              >
                {t("landing.heroTitle")}
              </h1>
              <p
                className="rise mt-5 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg"
                style={{ animationDelay: "0.16s" }}
              >
                {t("landing.heroSub")}
              </p>
              <div
                className="rise mt-7 flex flex-wrap items-center gap-4"
                style={{ animationDelay: "0.27s" }}
              >
                <Button onClick={() => navigate("/dashboard")}>
                  {t("landing.cta")}
                </Button>
                <a
                  href="#cara-kerja"
                  className="text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-stamp hover:decoration-stamp"
                >
                  {t("landing.howLink")}
                </a>
              </div>
              <p
                className="rise mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
                style={{ animationDelay: "0.36s" }}
              >
                {t("landing.noLogin")}
              </p>
            </div>

            <div className="rise" style={{ animationDelay: "0.22s" }}>
              <DocMock />
            </div>
          </div>
        </section>

        {/* CARA KERJA — numbered sequence (order carries meaning) */}
        <section id="cara-kerja" className="mx-auto max-w-5xl px-4 py-14">
          <div ref={stepsRef.ref} style={revealStyle(stepsRef)}>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
              {t("landing.howTitle")}
            </h2>
          <div className="divide-y divide-line border-y border-line">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="grid grid-cols-1 gap-1 py-6 md:grid-cols-[3.5rem_13rem_1fr] md:gap-x-6"
              >
                <span className="font-mono text-sm font-medium text-stamp">
                  {step.num}
                </span>
                <h3 className="font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="max-w-[60ch] text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* FITUR — asymmetric: one dominant tile + two stacked */}
        <section className="mx-auto max-w-5xl px-4 py-14">
          <div ref={featuresRef.ref} style={revealStyle(featuresRef)}>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
              {t("landing.featuresTitle")}
            </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl bg-ink p-8 text-paper">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">
                  {t("landing.priceEyebrow")}
                </p>
                <p className="mt-3 font-mono text-5xl font-medium tracking-tight text-stamp">
                  {t("landing.priceValue")}
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {t("landing.freeTitle")}
                </h3>
                <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-paper/70">
                  {t("landing.freeDesc")}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border border-line bg-card p-6">
                <KeyRound size={20} strokeWidth={1.5} className="text-stamp" />
                <h3 className="mt-3 font-semibold tracking-tight text-ink">
                  {t("landing.keyTitle")}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t("landing.keyDesc")}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-card p-6">
                <HardDrive size={20} strokeWidth={1.5} className="text-stamp" />
                <h3 className="mt-3 font-semibold tracking-tight text-ink">
                  {t("landing.storageTitle")}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t("landing.storageDesc")}
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>
      </div>
  );
}
