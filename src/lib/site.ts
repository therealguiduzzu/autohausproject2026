/**
 * Zentrale Basis-URL der Website. Für die Produktiv-Domain im Hosting die
 * Umgebungsvariable VITE_SITE_URL setzen (z. B. https://www.auto-semmel.de).
 */
const rawSiteUrl =
  (import.meta.env?.VITE_SITE_URL as string | undefined) ??
  "https://la-passione-digital.lovable.app";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const siteUrl = (path = ""): string =>
  `${SITE_URL}${path && !path.startsWith("/") ? "/" : ""}${path}`;
