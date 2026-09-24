import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  careersStore,
  useActiveJobs,
  type JobPosting,
} from "@/lib/careers-store";

export const Route = createFileRoute("/karriere")({
  head: () => ({
    meta: [
      { title: "Karriere bei Auto Semmel — Werden Sie Teil des Teams" },
      {
        name: "description",
        content:
          "Offene Stellen bei Auto Semmel Langenselbold — Kfz-Mechatroniker und Verkaufsberater für Alfa Romeo, Fiat & Abarth.",
      },
      { property: "og:title", content: "Karriere bei Auto Semmel — Langenselbold" },
      {
        property: "og:description",
        content:
          "Werden Sie Teil der Familie. Aktuelle Stellen in Werkstatt und Verkauf bei Auto Semmel.",
      },
    ],
  }),
  component: KarrierePage,
});

function KarrierePage() {
  const jobs = useActiveJobs();
  const [applyJob, setApplyJob] = useState<JobPosting | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <span className="font-display text-sm font-bold italic">AS</span>
            </div>
            <div>
              <div className="font-display text-base font-semibold leading-tight">Auto Semmel</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Karriere · Langenselbold
              </div>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
          </Link>
        </div>
        <div className="tricolore-bar h-[2px] w-full opacity-50" />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-surface/50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.55 0.22 27 / 0.18), transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.55 0.18 145 / 0.12), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary">
            <Briefcase className="h-3.5 w-3.5" /> Stellenangebote · La Famiglia
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Ihre Karriere bei Auto Semmel — <span className="italic text-primary">Werden Sie Teil des Teams</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Seit über 40 Jahren stehen wir für Qualität und italienische Leidenschaft in Langenselbold.
            Um weiter zu wachsen, suchen wir Verstärkung für unsere Werkstatt und den Verkauf.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Gelnhäuser Straße 40 · Langenselbold
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Offizieller Stellantis-Partner
            </span>
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Aktuelle Stellen</p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              {jobs.length} offene {jobs.length === 1 ? "Position" : "Positionen"}
            </h2>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-12 text-center text-sm text-muted-foreground">
            Aktuell sind keine Stellen ausgeschrieben. Initiativbewerbungen sind jederzeit willkommen unter{" "}
            <a href="mailto:bewerbung@auto-semmel.de" className="text-primary hover:underline">
              bewerbung@auto-semmel.de
            </a>
            .
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={() => setApplyJob(job)} />
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-border/60 bg-card/40 p-8 md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Keine passende Stelle?</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Initiativbewerbung senden</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Wir freuen uns über engagierte Persönlichkeiten — auch außerhalb aktueller Ausschreibungen.
              </p>
            </div>
            <a
              href="mailto:bewerbung@auto-semmel.de"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-5 py-2.5 text-sm font-medium transition hover:border-primary/60 hover:text-primary"
            >
              bewerbung@auto-semmel.de <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {applyJob && <ApplyDialog job={applyJob} onClose={() => setApplyJob(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function JobCard({ job, onApply }: { job: JobPosting; onApply: () => void }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border/70 bg-card/60 p-7 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          {job.department}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <Clock className="h-3 w-3" /> {job.type} · {job.contract}
        </span>
      </div>

      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">{job.title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{job.shortPitch}</p>

      <ul className="mt-5 space-y-2 text-sm">
        {job.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
        <span className="text-xs text-muted-foreground">Standort: Langenselbold</span>
        <button
          onClick={onApply}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          Schnell-Bewerbung <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
function ApplyDialog({ job, onClose }: { job: JobPosting; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Bitte füllen Sie Name, E-Mail und Telefon aus.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse an.");
      return;
    }
    careersStore.addApplicant({
      jobId: job.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim() || undefined,
      cvFileName: fileName,
    });
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm md:items-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl border border-border/70 bg-card shadow-2xl md:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-muted-foreground transition hover:text-foreground"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold">Ihre Bewerbung ist eingegangen!</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Vielen Dank, {name.split(" ")[0] || "vielen Dank"}. Wir melden uns innerhalb von 5 Werktagen telefonisch oder
              per E-Mail bei Ihnen.
            </p>
            <button
              onClick={onClose}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Schnell-Bewerbung</p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{job.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {job.department} · {job.type} · {job.contract}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name *
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  maxLength={100}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.de"
                    maxLength={150}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Telefon *
                  </label>
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0177 1234567"
                    maxLength={30}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Kurze Nachricht (optional)
                </label>
                <textarea
                  className="input min-h-[90px] resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Warum passen Sie zu uns?"
                  maxLength={800}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Lebenslauf / CV
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-background/40 px-4 py-3 text-sm transition hover:border-primary/60">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Upload className="h-4 w-4 text-primary" />
                    {fileName ?? "PDF, DOC oder DOCX auswählen (max. 5 MB)"}
                  </span>
                  <span className="rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground">
                    Datei wählen
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFileName(f.name);
                    }}
                  />
                </label>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Demo-Upload — die Datei wird in dieser Vorschau nicht serverseitig gespeichert.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                Mit Klick auf „Bewerbung senden" stimmen Sie der{" "}
                <a href="/datenschutz" className="text-primary hover:underline">
                  Verarbeitung Ihrer Daten
                </a>{" "}
                zur Bewerbung zu.
              </p>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
              >
                Bewerbung senden
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
