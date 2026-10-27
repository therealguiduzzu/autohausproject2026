/**
 * Partner-Logos (FIAT SERVICE, ALFA ROMEO SERVICE, Stellantis).
 *
 * Die Bilddateien liegen NICHT im Repository, weil sie Marken des Herstellers sind
 * und nur mit Genehmigung/Händlervertrag verwendet werden dürfen. Sie werden aus
 * `public/partner/` geladen:
 *   public/partner/fiat-service.png
 *   public/partner/alfa-romeo-service.png
 *   public/partner/stellantis-logo.jpg
 * Fehlt eine Datei, wird ein neutrales Text-Badge angezeigt.
 */
import { useEffect, useRef, useState } from "react";

type LogoProps = {
  className?: string;
  title?: string;
};

function PartnerLogo({ src, title, className }: LogoProps & { src: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Der Ladefehler kann schon vor der Hydration passiert sein (SSR-HTML): beim Mounten prüfen.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={title}
        className="inline-flex max-w-full items-center rounded-md border border-border/70 bg-muted/40 px-2.5 py-1.5 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground"
      >
        {title}
      </span>
    );
  }
  return (
    <img
      ref={ref}
      src={src}
      alt={title}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function FiatServiceLogo({ className, title = "FIAT Service Partner" }: LogoProps) {
  return <PartnerLogo src="/partner/fiat-service.png" title={title} className={className} />;
}

export function AlfaRomeoServiceLogo({
  className,
  title = "Alfa Romeo Service Partner",
}: LogoProps) {
  return <PartnerLogo src="/partner/alfa-romeo-service.png" title={title} className={className} />;
}

export function StellantisLogo({ className, title = "Offizieller Stellantis-Partner" }: LogoProps) {
  return <PartnerLogo src="/partner/stellantis-logo.jpg" title={title} className={className} />;
}
