/**
 * Partner-Logos (FIAT SERVICE, ALFA ROMEO SERVICE, Stellantis).
 *
 * Die Bilddateien liegen NICHT im Repository, weil sie Marken des Herstellers sind
 * und nur mit Genehmigung/Händlervertrag verwendet werden dürfen. Sie werden aus
 * `public/partner/` geladen:
 *   public/partner/fiat-service.png
 *   public/partner/alfa-romeo-service.png
 *   public/partner/stellantis-logo.jpg
 * Fehlt eine Datei, wird ein Text-Badge angezeigt.
 */
import { useState } from "react";

type LogoProps = {
  className?: string;
  title?: string;
};

function PartnerLogo({ src, title, className }: LogoProps & { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        role="img"
        aria-label={title}
        className={`inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider ${className ?? ""}`}
      >
        {title}
      </span>
    );
  }
  return (
    <img
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
