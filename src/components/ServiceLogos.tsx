/**
 * Official "FIAT SERVICE" and "ALFA ROMEO SERVICE" partner badges,
 * provided by the dealership and served 1:1 via Lovable Assets CDN.
 *
 * StellantisLogo now uses the official brand asset for maximum trust
 * and recognition across the site.
 */
import fiatServiceAsset from "@/assets/fiat-service.png.asset.json";
import alfaRomeoServiceAsset from "@/assets/alfa-romeo-service.png.asset.json";
import stellantisLogoAsset from "@/assets/stellantis-logo.jpg.asset.json";

type LogoProps = {
  className?: string;
  title?: string;
};

export function FiatServiceLogo({ className, title = "FIAT Service Partner" }: LogoProps) {
  return (
    <img
      src={fiatServiceAsset.url}
      alt={title}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export function AlfaRomeoServiceLogo({
  className,
  title = "Alfa Romeo Service Partner",
}: LogoProps) {
  return (
    <img
      src={alfaRomeoServiceAsset.url}
      alt={title}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export function StellantisLogo({
  className,
  title = "Offizieller Stellantis-Partner",
}: LogoProps) {
  return (
    <img
      src={stellantisLogoAsset.url}
      alt={title}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
