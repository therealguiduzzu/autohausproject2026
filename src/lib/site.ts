/**
 * Zentrale Basis-URL der Website. Für die Produktiv-Domain im Hosting die
 * Umgebungsvariable VITE_SITE_URL setzen (z. B. https://www.auto-semmel.de).
 */
const rawSiteUrl =
  (import.meta.env?.VITE_SITE_URL as string | undefined) ?? "http://localhost:3000";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const siteUrl = (path = ""): string =>
  `${SITE_URL}${path && !path.startsWith("/") ? "/" : ""}${path}`;

/**
 * Demo-/Konzeptmodus (Build-Variable VITE_DEMO_MODE=1): sperrt Suchmaschinen komplett
 * (noindex, robots.txt, leere Sitemap) und blendet einen Hinweis „Konzeptentwurf“ ein.
 * Für Vorführungen beim Kunden, solange die Seite nicht öffentlich sein darf.
 */
export const DEMO_MODE = ["1", "true"].includes(
  String(import.meta.env?.VITE_DEMO_MODE ?? "").toLowerCase(),
);
