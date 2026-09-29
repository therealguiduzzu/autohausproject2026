import { useEffect, useState } from "react";
import { Cookie, ShieldCheck, BarChart3, Megaphone, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "auto-semmel-cookie-consent-v1";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auto-semmel:open-cookie-settings"));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setVisible(true);
    const onOpen = () => {
      const c = readConsent();
      if (c) {
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
      }
      setCustomize(true);
      setVisible(true);
    };
    window.addEventListener("auto-semmel:open-cookie-settings", onOpen);
    return () => window.removeEventListener("auto-semmel:open-cookie-settings", onOpen);
  }, []);

  if (!visible) return null;

  const save = (a: boolean, m: boolean) => {
    writeConsent({
      essential: true,
      analytics: a,
      marketing: m,
      decidedAt: new Date().toISOString(),
    });
    setVisible(false);
    setCustomize(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie-Einstellungen"
        className="glass relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="tricolore-bar h-[2px] w-full opacity-70" />
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary sm:grid">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                Wir respektieren Ihre Privatsphäre
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Wir verwenden Cookies, um Ihr Erlebnis auf unserer Website zu verbessern, den
                Datenverkehr zu analysieren und unsere Angebote individuell auf Sie zuzuschneiden.
                Sie können selbst entscheiden, welche Kategorien Sie zulassen. Weitere Informationen
                finden Sie in unserer{" "}
                <Link to="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <button
              onClick={() => save(false, false)}
              aria-label="Schließen"
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {customize && (
            <div className="mt-5 grid gap-3 rounded-xl border border-border/60 bg-card/40 p-4 sm:grid-cols-3">
              <CategoryRow
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Essenziell"
                desc="Erforderlich für den Betrieb der Website."
                checked
                disabled
                onChange={() => {}}
              />
              <CategoryRow
                icon={<BarChart3 className="h-4 w-4" />}
                title="Statistik"
                desc="Anonyme Nutzungsanalyse zur Verbesserung."
                checked={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                icon={<Megaphone className="h-4 w-4" />}
                title="Marketing"
                desc="Personalisierte Fahrzeug-Empfehlungen."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            {!customize ? (
              <button
                onClick={() => setCustomize(true)}
                className="rounded-lg border border-border/70 bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted/30"
              >
                Anpassen
              </button>
            ) : (
              <button
                onClick={() => save(analytics, marketing)}
                className="rounded-lg border border-border/70 bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted/30"
              >
                Auswahl speichern
              </button>
            )}
            <button
              onClick={() => save(false, false)}
              className="rounded-lg border border-border/70 bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted/30"
            >
              Nur essenzielle akzeptieren
            </button>
            <button
              onClick={() => save(true, true)}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(185,14,10,0.6)] transition hover:bg-primary/90"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  icon,
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted/40 text-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <Toggle checked={checked} disabled={disabled} onChange={onChange} />
        </div>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        checked ? "bg-primary" : "bg-muted/60"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
