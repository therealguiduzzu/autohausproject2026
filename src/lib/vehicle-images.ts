import carTonale from "@/assets/car-tonale.jpg";
import carStelvio from "@/assets/car-stelvio.jpg";
import carFiat500 from "@/assets/car-fiat500.jpg";
import carAbarth from "@/assets/car-abarth.jpg";
import carDucato from "@/assets/car-ducato.jpg";
import heroGiulia from "@/assets/hero-giulia.jpg";
import carGiulia from "@/assets/car-giulia.jpg";
import carPanda from "@/assets/car-panda.jpg";
import hero500e from "@/assets/hero-500e.jpg";

/**
 * Maps `image_keys` stored in the DB to the bundled assets shipped with the
 * frontend. New uploads use `image_urls` (Supabase Storage) instead.
 */
export const BUNDLED_IMAGES: Record<string, string> = {
  "car-tonale": carTonale,
  "car-stelvio": carStelvio,
  "car-fiat500": carFiat500,
  "car-abarth": carAbarth,
  "car-ducato": carDucato,
  "hero-giulia": heroGiulia,
  "car-giulia": carGiulia,
  "car-panda": carPanda,
  "hero-500e": hero500e,
};

export function resolveVehicleImages(image_urls: string[], image_keys: string[]): string[] {
  const urls = (image_urls ?? []).filter(Boolean);
  const keyed = (image_keys ?? [])
    .map((k) => BUNDLED_IMAGES[k])
    .filter((v): v is string => Boolean(v));
  const all = [...urls, ...keyed];
  return all.length ? all : [];
}
