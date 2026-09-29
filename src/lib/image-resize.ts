/**
 * Verkleinert ein Bild auf max. `maxDim` Pixel und kodiert es als JPEG.
 * Nebeneffekt (gewollt): Metadaten wie EXIF/GPS-Standort werden entfernt.
 */
export async function resizeToJpeg(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Kodierung fehlgeschlagen"))),
      "image/jpeg",
      quality,
    ),
  );
}
