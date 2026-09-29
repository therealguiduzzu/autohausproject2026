/**
 * Zentrale Basis-URL der Website. Für die Produktiv-Domain im Hosting die
 * Umgebungsvariable VITE_SITE_URL setzen (z. B. https://www.auto-semmel.de).
 */
const rawSiteUrl =
  (import.meta.env?.VITE_SITE_URL as string | undefined) ??
  "http://localhost:3000";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const siteUrl = (path = ""): string =>
  `${SITE_URL}${path && !path.startsWith("/") ? "/" : ""}${path}`;
