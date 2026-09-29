import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarX, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cancelAppointmentByToken, getAppointmentByToken } from "@/lib/workshop.functions";
import { formatDayLong } from "@/lib/workshop";

export const Route = createFileRoute("/termin/absagen")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: CancelPage,
  head: () => ({
    meta: [
      { title: "Werkstatttermin absagen – Auto Semmel" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Info =
  | { found: false }
  | {
      found: true;
      service: string;
      date: string;
      time: string;
      status: string;
      canCancel: boolean;
    };

function CancelPage() {
  const { token } = Route.useSearch();
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (token.length < 32) return setInfo({ found: false });
    getAppointmentByToken({ data: { token } })
      .then((r) => setInfo(r as Info))
      .catch(() => setFailed(true));
  }, [token]);

  // Absage erst nach ausdrücklichem Klick – Mail-Scanner rufen Links nur auf, klicken aber nicht.
  async function cancel() {
    setState("busy");
    try {
      const res = await cancelAppointmentByToken({ data: { token } });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          {failed ? (
            <Problem text="Beim Laden ist etwas schiefgelaufen. Bitte rufen Sie uns an: 06184 / 2633." />
          ) : !info ? (
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-label="Lädt" />
          ) : !info.found ? (
            <Problem text="Dieser Link ist ungültig. Bitte rufen Sie uns an: 06184 / 2633." />
          ) : state === "done" ? (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="font-display text-2xl font-bold">Termin abgesagt</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Danke für die Info. Eine Bestätigung ist per E-Mail unterwegs. Sie können jederzeit
                einen neuen Termin buchen.
              </p>
            </>
          ) : info.status === "abgesagt" ? (
            <Problem text="Dieser Termin ist bereits abgesagt." />
          ) : (
            <>
              <CalendarX className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="font-display text-2xl font-bold">Termin absagen?</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {info.service}
                <br />
                <strong className="text-foreground">
                  {formatDayLong(info.date)}, {info.time} Uhr
                </strong>
              </p>
              {info.canCancel ? (
                <button
                  onClick={cancel}
                  disabled={state === "busy"}
                  className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {state === "busy" ? "Wird abgesagt …" : "Ja, Termin absagen"}
                </button>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  Online-Absagen sind nur bis zum Vortag möglich. Bitte rufen Sie uns an:{" "}
                  <a href="tel:+4961842633" className="text-primary underline">
                    06184 / 2633
                  </a>
                  .
                </p>
              )}
              {state === "error" && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  Die Absage hat nicht geklappt. Bitte rufen Sie uns an.
                </p>
              )}
            </>
          )}
          <Link
            to="/"
            className="mt-6 block text-sm text-muted-foreground underline hover:text-foreground"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}

function Problem({ text }: { text: string }) {
  return (
    <>
      <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </>
  );
}
