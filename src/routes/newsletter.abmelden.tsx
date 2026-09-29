import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";
import { unsubscribeNewsletter } from "@/lib/newsletter.functions";

type Status = "loading" | "success" | "already" | "invalid" | "error";

export const Route = createFileRoute("/newsletter/abmelden")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: NewsletterUnsubscribePage,
  errorComponent: () => <UnsubShell status="error" />,
  notFoundComponent: () => <UnsubShell status="invalid" />,
  head: () => ({
    meta: [
      { title: "Newsletter abmelden – Auto Semmel" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function NewsletterUnsubscribePage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setStatus("invalid");
      return;
    }
    unsubscribeNewsletter({ data: { token } })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        setEmail(res.email ?? null);
        setStatus(res.alreadyUnsubscribed ? "already" : "success");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  return <UnsubShell status={status} email={email} />;
}

function UnsubShell({ status, email }: { status: Status; email?: string | null }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-x flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
              <h1 className="font-display text-xl font-semibold">Abmeldung wird verarbeitet…</h1>
            </>
          )}
          {status === "success" && (
            <>
              <MailX className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="font-display text-2xl font-bold">Abmeldung erfolgreich</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {email ? (
                  <>
                    <strong>{email}</strong> wurde{" "}
                  </>
                ) : (
                  "Ihre E-Mail-Adresse wurde "
                )}
                aus unserem Newsletter-Verteiler entfernt. Sie erhalten keine weiteren E-Mails.
              </p>
            </>
          )}
          {status === "already" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="font-display text-2xl font-bold">Bereits abgemeldet</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Diese E-Mail-Adresse ist bereits aus unserem Verteiler entfernt.
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
                Der Abmelde-Link ist ungültig oder abgelaufen. Bitte kontaktieren Sie uns unter{" "}
                <a href="mailto:info@auto-semmel.de" className="text-primary underline">
                  info@auto-semmel.de
                </a>
                , damit wir Sie manuell austragen.
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
