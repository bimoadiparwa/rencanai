import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useReveal } from "../hooks/useReveal";
import { KeyRound, HardDrive, Check } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Tulis ide",
    desc: "Ceritakan proyek yang ingin Anda buat dalam satu dua kalimat.",
  },
  {
    num: "02",
    title: "AI generate PRD",
    desc: "Dapatkan dokumen PRD lengkap dalam hitungan detik.",
  },
  {
    num: "03",
    title: "Mulai eksekusi",
    desc: "Ubah PRD menjadi daftar tugas siap dikerjakan tim.",
  },
];

const DOC_TASKS = [
  { title: "Susun struktur data", done: true },
  { title: "Halaman login & registrasi", done: true },
  { title: "Integrasi notifikasi", done: false },
];

function DocMock() {
  return (
    <div className="relative">
      {/* Signature: stamped seal */}
      <div className="stamp-in absolute -right-2 -top-6 z-10 flex h-24 w-24 rotate-[-8deg] flex-col items-center justify-center rounded-full border-2 border-dashed border-stamp/70 bg-paper/80 text-center lg:-right-6">
        <span className="font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.18em] text-stamp">
          Gratis
        </span>
        <span className="font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.18em] text-stamp">
          selamanya
        </span>
        <span className="mt-0.5 h-px w-8 bg-stamp/50" />
        <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-stamp/70">
          tanpa login
        </span>
      </div>

      <div className="rounded-xl border border-line bg-card p-6 shadow-[0_20px_45px_-25px_rgba(24,24,27,0.25)] sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-line pb-3 pr-16 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:pr-24">
          <span>prd-001</span>
          <span>v1.0</span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-ink">
          Aplikasi Manajemen Tugas
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Ringkasan: tim butuh satu tempat untuk menyusun tugas harian,
          menetapkan penanggung jawab, dan melihat progres tanpa berpindah
          alat.
        </p>

        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              tugas
            </span>
            <span className="font-mono text-[10px] text-muted">
              {DOC_TASKS.filter((t) => t.done).length}/{DOC_TASKS.length}
            </span>
          </div>
          <ul className="space-y-2.5">
            {DOC_TASKS.map((t, i) => (
              <li key={t.title} className="flex items-center gap-3 text-[13px]">
                <span
                  className={`check-pop flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                    t.done
                      ? "border-stamp bg-stamp text-white"
                      : "border-line bg-card"
                  }`}
                  style={{ animationDelay: `${0.7 + i * 0.25}s` }}
                >
                  {t.done && <Check size={11} strokeWidth={3} />}
                </span>
                <span className={t.done ? "text-muted line-through" : "text-ink"}>
                  {t.title}
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
  const stepsRef = useReveal();
  const featuresRef = useReveal();

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
                Bikin PRD dalam hitungan detik
              </h1>
              <p
                className="rise mt-5 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg"
                style={{ animationDelay: "0.16s" }}
              >
                Dari ide proyek menjadi dokumen PRD lengkap dengan daftar tugas
                siap eksekusi — dikembangkan AI dengan API key Anda sendiri.
              </p>
              <div
                className="rise mt-7 flex flex-wrap items-center gap-4"
                style={{ animationDelay: "0.27s" }}
              >
                <Button onClick={() => navigate("/dashboard")}>
                  Mulai Buat PRD
                </Button>
                <a
                  href="#cara-kerja"
                  className="text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-stamp hover:decoration-stamp"
                >
                  Cara kerja
                </a>
              </div>
              <p
                className="rise mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
                style={{ animationDelay: "0.36s" }}
              >
                tanpa login — kunci api tetap di browser
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
              Cara kerja
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
              Fitur
            </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl bg-ink p-8 text-paper">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">
                  harga
                </p>
                <p className="mt-3 font-mono text-5xl font-medium tracking-tight text-stamp">
                  Rp 0
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  Gratis selamanya
                </h3>
                <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-paper/70">
                  Tanpa upgrade, tanpa paywall, dan tanpa login. Tidak ada
                  paket berbayar yang disembunyikan di balik tombol.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border border-line bg-card p-6">
                <KeyRound size={20} strokeWidth={1.5} className="text-stamp" />
                <h3 className="mt-3 font-semibold tracking-tight text-ink">
                  Bawa API key sendiri
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Hubungkan Gemini atau OpenRouter dengan key Anda sendiri.
                </p>
              </div>
              <div className="rounded-xl border border-line bg-card p-6">
                <HardDrive size={20} strokeWidth={1.5} className="text-stamp" />
                <h3 className="mt-3 font-semibold tracking-tight text-ink">
                  Simpan di browser
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Semua PRD tersimpan di localStorage, milik Anda.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>
      </div>
  );
}
