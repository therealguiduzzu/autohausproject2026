import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  mapVehicleRow,
  type Vehicle,
  type Brand,
  type Condition,
  type FuelType,
  type Transmission,
  type VehicleStatus,
} from "./vehicles";
import { getQueryClient } from "./query-client-ref";
import type { Database } from "@/integrations/supabase/types";

/** Re-export for callers that previously imported the status type from here. */
export type { VehicleStatus };

/** Backwards-compat: existing code refers to `AdminVehicle` — now identical to `Vehicle`. */
export type AdminVehicle = Vehicle;

export const VEHICLES_QUERY_KEY = ["vehicles"] as const;

async function fetchVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVehicleRow);
}

export function useVehicles(): Vehicle[] {
  const { data } = useQuery({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: fetchVehicles,
    staleTime: 30_000,
  });
  return data ?? [];
}

function invalidateVehicles() {
  getQueryClient()?.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
}

export interface NewVehicleInput {
  brand: Brand;
  model: string;
  version: string;
  condition: Condition;
  price: number;
  vatDeductible: boolean;
  financingMonthly: number;
  mileage: number;
  firstRegistration: string;
  powerHp: number;
  fuelType: FuelType;
  transmission: Transmission;
  imageUrls?: string[];
  features: string[];
  badge?: string | null;
  co2Class?: string | null;
  consumptionCombined?: number | null;
  powerConsumption?: number | null;
  co2Emissions?: number | null;
}

export interface VehiclePatch {
  status?: VehicleStatus;
  discountPrice?: number | null;
}

export const vehiclesStore = {
  add: async (input: NewVehicleInput) => {
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        brand: input.brand,
        model: input.model,
        version: input.version,
        condition: input.condition,
        price: input.price,
        vat_deductible: input.vatDeductible,
        financing_monthly: input.financingMonthly,
        mileage: input.mileage,
        first_registration: input.firstRegistration || null,
        power_hp: input.powerHp,
        fuel_type: input.fuelType,
        transmission: input.transmission,
        image_urls: input.imageUrls ?? [],
        image_keys: [],
        features: input.features,
        badge: input.badge ?? null,
        status: "Verfügbar" as const,
        co2_class: input.co2Class ?? null,
        consumption_combined: input.consumptionCombined ?? null,
        power_consumption: input.powerConsumption ?? null,
        co2_emissions: input.co2Emissions ?? null,
      })
      .select()
      .single();
    invalidateVehicles();
    if (error) throw error;
    return data ? mapVehicleRow(data) : null;
  },
  update: async (id: string, patch: VehiclePatch) => {
    const payload: Database["public"]["Tables"]["vehicles"]["Update"] = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.discountPrice !== undefined) payload.discount_price = patch.discountPrice;
    const { error } = await supabase.from("vehicles").update(payload).eq("id", id);
    invalidateVehicles();
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    invalidateVehicles();
    if (error) throw error;
  },
  markSold: async (id: string) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ status: "Verkauft" as const })
      .eq("id", id);
    invalidateVehicles();
    if (error) throw error;
  },
};

import { queryOptions } from "@tanstack/react-query";

async function fetchVehicleBySlugOrId(slugOrId: string): Promise<Vehicle | null> {
  // Try slug first
  const { data: bySlug } = await supabase
    .from("vehicles")
    .select("*")
    .eq("slug", slugOrId)
    .maybeSingle();
  if (bySlug) return mapVehicleRow(bySlug);
  // UUID fallback
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (!isUuid) return null;
  const { data: byId } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", slugOrId)
    .maybeSingle();
  return byId ? mapVehicleRow(byId) : null;
}

export const vehicleBySlugQueryOptions = (slugOrId: string) =>
  queryOptions({
    queryKey: ["vehicle", slugOrId],
    queryFn: () => fetchVehicleBySlugOrId(slugOrId),
    staleTime: 30_000,
  });
