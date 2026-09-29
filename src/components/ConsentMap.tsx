import { useState } from "react";
import { MapPin } from "lucide-react";

const MAP_SRC =
  "https://maps.google.com/maps?q=Gelnh%C3%A4user%20Str.%2040%2C%2063505%20Langenselbold&t=m&z=15&ie=UTF8&iwloc=B&output=embed";

/**
 * Zwei-Klick-Lösung: Google Maps wird erst nach ausdrücklichem Klick geladen,
 * vorher findet keine Datenübertragung an Google statt.
 */
export default function ConsentMap() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title="Auto Semmel · Gelnhäuser Str. 40, 63505 Langenselbold auf Google Maps"
        src={MAP_SRC}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-64 w-full border-0"
        allowFullScreen
      />
    );
  }

  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-muted/30 px-6 text-center">
      <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
      <p className="max-w-sm text-xs text-muted-foreground">
        Mit dem Laden der Karte werden Daten (z. B. Ihre IP-Adresse) an Google übertragen.
      </p>
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/40"
      >
        Google-Karte laden
      </button>
    </div>
  );
}
