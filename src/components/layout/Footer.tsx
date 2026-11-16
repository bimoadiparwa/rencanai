export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-4 py-6 sm:flex-row sm:items-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          RencanAI — gratis, selamanya. Tanpa login, tanpa bayar.
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
          data di browser Anda
        </p>
      </div>
    </footer>
  );
}
