import type { Database } from "@/integrations/supabase/types";
import { resolveVehicleImages } from "./vehicle-images";

/**
 * Vehicle domain model — UI-facing shape.
 * Database row shape lives in src/integrations/supabase/types.ts.
 */
export type Brand = "Alfa Romeo" | "Fiat" | "Abarth" | "Fiat Professional";
export type Condition = "Neuwagen" | "Tageszulassung" | "Gebrauchtwagen";
export type Transmission = "Automatik" | "Schaltgetriebe";
export type FuelType = "Benzin" | "Diesel" | "Hybrid" | "Elektro";
export type VehicleStatus = "Verfügbar" | "Reserviert" | "Verkauft";

export interface Vehicle {
  id: string;
  slug: string | null;
  brand: Brand;
  model: string;
  version: string;
  condition: Condition;
  price: number;
  discountPrice: number | null;
  vatDeductible: boolean;
  financingMonthly: number;
  mileage: number;
  firstRegistration: string;
  powerHp: number;
  fuelType: FuelType;
  transmission: Transmission;
  images: string[];
  features: string[];
  mobileDeId: string;
  status: VehicleStatus;
  badge: string | null;
  /** Pkw-EnVKV / WLTP */
  co2Class: string | null;
  consumptionCombined: number | null;
  powerConsumption: number | null;
  co2Emissions: number | null;
}

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

export function mapVehicleRow(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand as Brand,
    model: row.model,
    version: row.version ?? "",
    condition: row.condition as Condition,
    price: Number(row.price),
    discountPrice: row.discount_price == null ? null : Number(row.discount_price),
    vatDeductible: row.vat_deductible,
    financingMonthly: row.financing_monthly == null ? 0 : Number(row.financing_monthly),
    mileage: row.mileage,
    firstRegistration: row.first_registration ?? "",
    powerHp: row.power_hp,
    fuelType: row.fuel_type as FuelType,
    transmission: row.transmission as Transmission,
    images: resolveVehicleImages(row.image_urls ?? [], row.image_keys ?? []),
    features: row.features ?? [],
    mobileDeId: row.mobile_de_id ?? "",
    status: row.status as VehicleStatus,
    badge: row.badge,
    co2Class: row.co2_class ?? null,
    consumptionCombined: row.consumption_combined == null ? null : Number(row.consumption_combined),
    powerConsumption: row.power_consumption == null ? null : Number(row.power_consumption),
    co2Emissions: row.co2_emissions ?? null,
  };
}

export const MODELS_BY_BRAND: Record<Brand | "Alle", string[]> = {
  Alle: ["Alle Modelle"],
  "Alfa Romeo": ["Alle Modelle", "Giulia", "Stelvio", "Tonale", "Junior"],
  Fiat: ["Alle Modelle", "500", "500e", "Panda", "600", "Tipo"],
  Abarth: ["Alle Modelle", "595", "695", "500e"],
  "Fiat Professional": ["Alle Modelle", "Ducato", "Scudo", "Doblò", "Fiorino"],
};

export interface VehicleFilters {
  condition: Condition | "Alle";
  brand: Brand | "Alle";
  model: string;
  priceMax: number;
}

export function filterVehicles(vehicles: Vehicle[], f: VehicleFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (f.condition !== "Alle" && v.condition !== f.condition) return false;
    if (f.brand !== "Alle" && v.brand !== f.brand) return false;
    if (f.model !== "Alle Modelle" && v.model !== f.model) return false;
    if (v.price > f.priceMax) return false;
    return true;
  });
}
