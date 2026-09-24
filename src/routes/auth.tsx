import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, ArrowLeft, Mail, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Händler-Login — Auto Semmel" },
      { name: "description", content: "Geschützter Login-Bereich für Auto Semmel Mitarbeiter." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.navigate({ to: "/admin" });
    }
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.navigate({ to: "/admin" });
  }

  async function onGoogle() {
    setBusy(true);
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      setErr(result.error instanceof Error ? result.error.message : "Login fehlgeschlagen.");
      return;
    }
    if (result.redirected) return;
    router.navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(185,14,10,0.12),_transparent_55%)]" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </Link>

        <div className="glass rounded-2xl border border-border/60 p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <div className="tricolore-bar mb-6 h-[2px] w-12 opacity-80" />
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Auto Semmel
              </p>
              <h1 className="font-display text-2xl font-semibold">Händler-Login</h1>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                E-Mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="vorname.nachname@auto-semmel.de"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Passwort
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(185,14,10,0.6)] transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Mail className="h-4 w-4" /> {busy ? "Anmelden…" : "Mit E-Mail anmelden"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border/60" /> oder <span className="h-px flex-1 bg-border/60" />
          </div>

          <button
            onClick={onGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 bg-card/40 px-4 py-3 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted/30 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" /> Mit Google anmelden
          </button>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Zugang nur für Auto Semmel Mitarbeiter. Neue Accounts werden durch die
            Geschäftsführung freigegeben.
          </p>
        </div>
      </div>
    </div>
  );
}
