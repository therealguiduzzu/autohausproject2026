import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { confirmNewsletter } from "@/lib/newsletter.functions";

type Status = "loading" | "success" | "already" | "invalid" | "error";

export const Route = createFileRoute("/newsletter/bestaetigen")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: NewsletterConfirmPage,
  errorComponent: () => <ConfirmShell status="error" />,
  notFoundComponent: () => <ConfirmShell status="invalid" />,
  head: () => ({
    meta: [
      { title: "Newsletter bestätigen – Auto Semmel" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function NewsletterConfirmPage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setStatus("invalid");
      return;
    }
    confirmNewsletter({ data: { token } })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) setStatus("invalid");
        else setStatus(res.alreadyConfirmed ? "already" : "success");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  return <ConfirmShell status={status} />;
}

function ConfirmShell({ status }: { status: Status }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-x flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
              <h1 className="font-display text-xl font-semibold">Bestätigung wird geprüft…</h1>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="font-display text-2xl font-bold">Anmeldung bestätigt 🎉</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Vielen Dank! Sie erhalten ab sofort exklusive Angebote und Einladungen aus dem Hause
                Auto Semmel in Langenselbold.
              </p>
            </>
          )}
          {status === "already" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="font-display text-2xl font-bold">Bereits bestätigt</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Diese E-Mail-Adresse ist bereits für unseren Newsletter freigeschaltet.
              </p>
            </>
          )}
          {(status === "invalid" || status === "error") && (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h1 className="font-display text-2xl font-bold">
                {status === "invalid" ? "Link ungültig" : "Etwas ist schiefgelaufen"}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Der Bestätigungslink ist abgelaufen oder bereits verwendet. Bitte melden Sie sich
                erneut an.
              </p>
            </>
          )}
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}

// Avoid unused-import warning in some setups
void useRouter;
