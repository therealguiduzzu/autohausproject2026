import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const db = {
  vehicles: [] as Row[],
  inserted: [] as Row[],
  updates: [] as { patch: Row; where: string }[],
  runs: [] as Row[],
};

function builder(table: string) {
  const state: { filter?: (r: Row) => boolean; mode?: string; patch?: Row } = {};
  const api: Record<string, unknown> = {
    select: () => api,
    in: (col: string, vals: unknown[]) => {
      if (state.mode === "update") {
        db.updates.push({ patch: state.patch!, where: `in:${vals.join(",")}` });
        return Promise.resolve({ error: null });
      }
      state.filter = (r) => vals.includes(r[col]);
      return api;
    },
    not: () => api,
    neq: () => api,
    eq: (_c: string, v: unknown) => {
      db.updates.push({ patch: state.patch!, where: `eq:${v}` });
      return Promise.resolve({ error: null });
    },
    insert: (rows: Row | Row[]) => {
      const list = Array.isArray(rows) ? rows : [rows];
      if (table === "import_runs") db.runs.push(...list);
      else db.inserted.push(...list);
      return Promise.resolve({ error: null });
    },
    update: (patch: Row) => {
      state.mode = "update";
      state.patch = patch;
      return api;
    },
    then: (resolve: (v: unknown) => void) =>
      resolve({ data: db.vehicles.filter(state.filter ?? (() => true)), error: null }),
  };
  return api;
}

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: (t: string) => builder(t) },
}));

import { runVehicleImport } from "./vehicle-import.server";

const CSV = [
  "ID;Marke;Modell;Zustand;Preis;Leistung;Kraftstoff;Getriebe",
  "A1;Fiat;500e;Neuwagen;29900;118;Elektro;Automatik",
  "A2;Fiat;Panda;Gebraucht;9000;70;Benzin;Schaltgetriebe",
].join("\n");

describe("runVehicleImport", () => {
  beforeEach(() => {
    db.vehicles = [
      { id: "u1", mobile_de_id: "A1", status: "Reserviert" },
      { id: "u9", mobile_de_id: "GONE", status: "Verfügbar" },
    ];
    db.inserted = [];
    db.updates = [];
    db.runs = [];
  });

  it("Dry-Run schreibt nichts", async () => {
    const s = await runVehicleImport(CSV, { dryRun: true, markMissingSold: true, source: "admin" });
    expect(s).toMatchObject({ dryRun: true, parsed: 2, created: 1, updated: 1, markedSold: 1 });
    expect(db.inserted).toHaveLength(0);
    expect(db.updates).toHaveLength(0);
  });

  it("legt neu an, aktualisiert, ohne Reservierung zu überschreiben, und markiert Fehlende als verkauft", async () => {
    const s = await runVehicleImport(CSV, { markMissingSold: true, source: "api" });
    expect(s).toMatchObject({ created: 1, updated: 1, markedSold: 1 });
    expect(db.inserted[0]).toMatchObject({
      mobile_de_id: "A2",
      financing_monthly: null,
      status: "Verfügbar",
    });
    const upd = db.updates.find((u) => u.where === "eq:u1")!;
    expect(upd.patch).not.toHaveProperty("status");
    expect(upd.patch).not.toHaveProperty("financing_monthly");
    expect(db.updates.find((u) => u.where === "in:u9")!.patch).toEqual({ status: "Verkauft" });
    expect(db.runs).toHaveLength(1);
  });
});
