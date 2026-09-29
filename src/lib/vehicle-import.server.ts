import type { Database } from "@/integrations/supabase/types";
import { parseVehicleImport, vehicleSlug, type ImportRowError } from "./vehicle-import";

export interface ImportOptions {
  /** Nur prüfen, nichts schreiben */
  dryRun?: boolean;
  /** Fahrzeuge mit externer ID, die in der Datei fehlen, auf „Verkauft“ setzen */
  markMissingSold?: boolean;
  source: "admin" | "api";
}

export interface ImportSummary {
  dryRun: boolean;
  parsed: number;
  created: number;
  updated: number;
  markedSold: number;
  errors: ImportRowError[];
}

type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];

const MAX_BYTES = 2_000_000;

export async function runVehicleImport(text: string, opts: ImportOptions): Promise<ImportSummary> {
  if (text.length > MAX_BYTES) throw new Error("Datei zu groß (max. 2 MB).");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { vehicles, errors } = parseVehicleImport(text);
  const summary: ImportSummary = {
    dryRun: !!opts.dryRun,
    parsed: vehicles.length,
    created: 0,
    updated: 0,
    markedSold: 0,
    errors,
  };
  if (vehicles.length === 0) return summary;

  const ids = vehicles.map((v) => v.externalId);
  const { data: existing, error: exErr } = await supabaseAdmin
    .from("vehicles")
    .select("id, mobile_de_id, status")
    .in("mobile_de_id", ids);
  if (exErr) throw new Error(exErr.message);
  const byExternal = new Map((existing ?? []).map((r) => [r.mobile_de_id as string, r]));

  const toInsert = vehicles.filter((v) => !byExternal.has(v.externalId));
  const toUpdate = vehicles.filter((v) => byExternal.has(v.externalId));
  summary.created = toInsert.length;
  summary.updated = toUpdate.length;

  let missing: { id: string }[] = [];
  if (opts.markMissingSold) {
    const { data: managed, error: mErr } = await supabaseAdmin
      .from("vehicles")
      .select("id, mobile_de_id")
      .not("mobile_de_id", "is", null)
      .neq("status", "Verkauft");
    if (mErr) throw new Error(mErr.message);
    const present = new Set(ids);
    missing = (managed ?? []).filter((r) => !present.has(r.mobile_de_id as string));
    summary.markedSold = missing.length;
  }

  if (opts.dryRun) return summary;

  if (toInsert.length) {
    const { error } = await supabaseAdmin.from("vehicles").insert(
      toInsert.map((v) => ({
        slug: vehicleSlug(v),
        mobile_de_id: v.externalId,
        brand: v.brand,
        model: v.model,
        version: v.version,
        condition: v.condition,
        price: v.price,
        vat_deductible: v.vatDeductible,
        financing_monthly: null,
        mileage: v.mileage,
        first_registration: v.firstRegistration || null,
        power_hp: v.powerHp,
        fuel_type: v.fuelType,
        transmission: v.transmission,
        image_urls: v.images,
        image_keys: [],
        features: v.features,
        status: "Verfügbar" as const,
        co2_class: v.co2Class,
        consumption_combined: v.consumptionCombined,
        power_consumption: v.powerConsumption,
        co2_emissions: v.co2Emissions,
      })),
    );
    if (error) throw new Error(error.message);
  }

  // Aktualisierung: nur importgeführte Felder. Manuell gepflegtes (Status „Reserviert“,
  // Badge, Aktionspreis, Slug, Finanzierungsrate) bleibt unangetastet; Bilder/Ausstattung
  // werden nur überschrieben, wenn die Datei welche liefert.
  for (const v of toUpdate) {
    const row = byExternal.get(v.externalId)!;
    const patch: VehicleUpdate = {
      brand: v.brand,
      model: v.model,
      version: v.version,
      condition: v.condition,
      price: v.price,
      vat_deductible: v.vatDeductible,
      mileage: v.mileage,
      first_registration: v.firstRegistration || null,
      power_hp: v.powerHp,
      fuel_type: v.fuelType,
      transmission: v.transmission,
      co2_class: v.co2Class,
      consumption_combined: v.consumptionCombined,
      power_consumption: v.powerConsumption,
      co2_emissions: v.co2Emissions,
    };
    if (v.images.length) patch.image_urls = v.images;
    if (v.features.length) patch.features = v.features;
    // Zuvor als verkauft markiertes Fahrzeug taucht wieder im Feed auf → wieder verfügbar
    if (row.status === "Verkauft") patch.status = "Verfügbar";
    const { error } = await supabaseAdmin.from("vehicles").update(patch).eq("id", row.id);
    if (error) summary.errors.push({ row: 0, message: `${v.externalId}: ${error.message}` });
  }

  if (missing.length) {
    const { error } = await supabaseAdmin
      .from("vehicles")
      .update({ status: "Verkauft" })
      .in(
        "id",
        missing.map((m) => m.id),
      );
    if (error) throw new Error(error.message);
  }

  await supabaseAdmin.from("import_runs" as never).insert({
    source: opts.source,
    created_count: summary.created,
    updated_count: summary.updated,
    sold_count: summary.markedSold,
    error_count: summary.errors.length,
    errors: summary.errors.slice(0, 50),
  } as never);

  return summary;
}
