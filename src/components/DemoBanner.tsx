import { DEMO_MODE } from "@/lib/site";

/** Schmaler Hinweis oben auf jeder Seite im Demo-Modus. */
export default function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div
      role="note"
      className="relative z-[60] bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-black"
    >
      Konzeptentwurf – nicht öffentlich · Alle Fahrzeuge, Anfragen und Termine sind Beispieldaten
    </div>
  );
}
