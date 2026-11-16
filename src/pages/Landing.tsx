import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useReveal } from "../hooks/useReveal";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const STEPS = [
  { num: 1, title: "Tulis ide", desc: "Ceritakan proyek yang ingin Anda buat dalam kalimat." },
  { num: 2, title: "AI generate PRD", desc: "Dapatkan dokumen PRD lengkap dalam hitungan detik." },
  { num: 3, title: "Mulai eksekusi", desc: "Ubah PRD menjadi daftar tugas siap dikerjakan tim." },
];

const FEATURES = [
  { title: "Gratis selamanya", desc: "Tanpa upgrade, tanpa paywall, dan tanpa login." },
  { title: "Bawa API key sendiri", desc: "Hubungkan Gemini atau OpenRouter dengan key Anda." },
  { title: "Simpan di browser", desc: "Semua PRD tersimpan di localStorage, milik Anda." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { ref, visible } = useReveal();
  const reveal = {
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : 24}px)`,
    transition: "all 0.8s ease",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <section ref={ref} style={reveal} className="text-center space-y-4 mb-16">
          <Badge variant="default">Free</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Bikin PRD dalam hitungan detik</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Dari ide proyek menjadi dokumen PRD lengkap dengan daftar tugas siap eksekusi — dikembangkan AI dengan API key Anda sendiri.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => navigate("/dashboard")}>Mulai Buat PRD</Button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-8 text-center">Cara kerja</h2>
          <ol className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <li key={step.num} className="text-center p-4 rounded-lg border">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mb-3">
                  {step.num}
                </span>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6 text-center">Fitur</h2>
          <ul className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
