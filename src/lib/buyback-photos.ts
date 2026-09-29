/** Gemeinsame Konstanten für Ankauf-Fotos (Client + Server). */
export const BUYBACK_BUCKET = "buyback-photos";
export const MAX_BUYBACK_PHOTOS = 4;
/** Erlaubte Objektpfade im Bucket: pending/<uuid>.jpg (Client re-kodiert immer als JPEG). */
export const BUYBACK_PATH_RE = /^pending\/[0-9a-f]{32}\.jpg$/;
export const PHOTO_DETAIL_KEY = "Foto-Pfade";

export function photoPathsFromDetails(details: Record<string, string>): string[] {
  return (details[PHOTO_DETAIL_KEY] ?? "")
    .split("|")
    .map((p) => p.trim())
    .filter((p) => BUYBACK_PATH_RE.test(p));
}
