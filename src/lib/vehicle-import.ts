/**
 * Fahrzeug-Import: CSV-/JSON-Parser und Normalisierung (rein, ohne I/O).
 *
 * Akzeptiert Exporte aus Händlerverwaltungssystemen sowie mobile.de-/AutoScout24-
 * ähnliche CSV-Dateien. Spaltennamen werden tolerant erkannt (siehe HEADER_ALIASES).
 * Pflichtspalten: Marke, Modell, Preis, Leistung, Kraftstoff, Getriebe, Zustand.
 * Die externe Inserat-ID (Spalte "ID"/"Inserat-Nr") macht den Import wiederholbar:
 * vorhandene Fahrzeuge werden aktualisiert statt doppelt angelegt.
 */
import type { Brand, Condition, FuelType, Transmission } from "./vehicles";

export interface ImportVehicle {
  externalId: string;
  brand: Brand;
  model: string;
  version: string;
  condition: Condition;
  price: number;
  vatDeductible: boolean;
  mileage: number;
  /** ISO-Datum (YYYY-MM-DD) oder leer */
  firstRegistration: string;
  powerHp: number;
  fuelType: FuelType;
  transmission: Transmission;
  images: string[];
  features: string[];
  co2Class: string | null;
  consumptionCombined: number | null;
  powerConsumption: number | null;
  co2Emissions: number | null;
}

export interface ImportRowError {
  /** 1-basierte Zeilennummer der Datendatei (Kopfzeile = 1) bzw. Index bei JSON */
  row: number;
  message: string;
}

export interface ParseResult {
  vehicles: ImportVehicle[];
  errors: ImportRowError[];
}

/* ------------------------------------------------------------------ CSV */

export function detectDelimiter(headerLine: string): string {
  const counts = [";", "\t", ","].map((d) => [d, headerLine.split(d).length - 1] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0]![1] > 0 ? counts[0]![0] : ";";
}

/** RFC-4180-nah: Anführungszeichen, verdoppelte Anführungszeichen, Zeilenumbrüche in Feldern. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

/* ------------------------------------------------------- Spaltenzuordnung */

type Field =
  | "externalId"
  | "brand"
  | "model"
  | "version"
  | "condition"
  | "price"
  | "vat"
  | "mileage"
  | "firstRegistration"
  | "powerHp"
  | "powerKw"
  | "fuelType"
  | "transmission"
  | "images"
  | "features"
  | "co2Class"
  | "consumptionCombined"
  | "powerConsumption"
  | "co2Emissions";

const HEADER_ALIASES: Record<Field, string[]> = {
  externalId: [
    "id",
    "externeid",
    "externalid",
    "inseratid",
    "inseratnr",
    "inseratsnummer",
    "fahrzeugid",
    "fahrzeugnr",
    "mobiledeid",
    "mobilenr",
    "kommissionsnr",
    "stocknumber",
  ],
  brand: ["marke", "hersteller", "make", "brand"],
  model: ["modell", "model", "modellreihe", "baureihe"],
  version: [
    "variante",
    "version",
    "modellzusatz",
    "ausfuehrung",
    "ausfuhrung",
    "trim",
    "beschreibung",
  ],
  condition: ["zustand", "fahrzeugzustand", "fahrzeugart", "condition", "kategorie"],
  price: ["preis", "verkaufspreis", "bruttopreis", "endpreis", "price", "preiseur"],
  vat: ["mwst", "mwstausweisbar", "mwstausweisbar", "vat", "vatdeductible"],
  mileage: ["kilometerstand", "km", "laufleistung", "kmstand", "mileage"],
  firstRegistration: ["erstzulassung", "ez", "firstregistration", "zulassung"],
  powerHp: ["leistungps", "ps", "leistung", "powerhp", "hp"],
  powerKw: ["leistungkw", "kw", "powerkw"],
  fuelType: ["kraftstoff", "kraftstoffart", "antrieb", "fuel", "fueltype"],
  transmission: ["getriebe", "getriebeart", "schaltung", "transmission", "gearbox"],
  images: [
    "bilder",
    "bild",
    "bildurls",
    "bildurl",
    "fotos",
    "images",
    "imageurls",
    "image",
    "fotourls",
  ],
  features: ["ausstattung", "extras", "ausstattungsmerkmale", "features", "equipment"],
  co2Class: ["co2klasse", "co2effizienzklasse", "effizienzklasse", "co2class"],
  consumptionCombined: [
    "verbrauchkombiniert",
    "kraftstoffverbrauchkombiniert",
    "verbrauch",
    "consumptioncombined",
  ],
  powerConsumption: ["stromverbrauch", "stromverbrauchkombiniert", "powerconsumption"],
  co2Emissions: ["co2emissionen", "co2", "co2gkm", "co2emissions"],
};

export function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

const ALIAS_LOOKUP: Map<string, Field> = (() => {
  const m = new Map<string, Field>();
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [Field, string[]][]) {
    for (const a of aliases) if (!m.has(normalizeHeader(a))) m.set(normalizeHeader(a), field);
  }
  return m;
})();

/* ---------------------------------------------------------- Wertumwandlung */

const clean = (v: unknown) => (v == null ? "" : String(v).trim());

/** "38.900,50 €" → 38900.5 ; "38900.5" → 38900.5 ; "" → null */
export function parseNumber(v: unknown): number | null {
  let s = clean(v).replace(/[^\d,.-]/g, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // Das rechte Trennzeichen ist das Dezimaltrennzeichen.
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = s.replace(",", ".");
  } else if (lastDot > -1 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, ""); // 38.900 → Tausendertrenner
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** MM/YYYY, MM.YYYY, DD.MM.YYYY, YYYY-MM-DD, YYYY → ISO-Datum */
export function parseDate(v: unknown): string {
  const s = clean(v);
  if (!s) return "";
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (m) return `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[./](\d{4})$/);
  if (m) return `${m[2]}-${m[1]!.padStart(2, "0")}-01`;
  m = s.match(/^(\d{4})$/);
  if (m) return `${m[1]}-01-01`;
  return "";
}

export function mapBrand(v: string): Brand | null {
  const s = normalizeHeader(v);
  if (s.startsWith("fiatprofessional") || s === "fiatpro") return "Fiat Professional";
  if (s.startsWith("alfa")) return "Alfa Romeo";
  if (s === "fiat") return "Fiat";
  if (s === "abarth") return "Abarth";
  return null;
}

export function mapCondition(v: string): Condition | null {
  const s = normalizeHeader(v);
  if (!s) return null;
  if (s.startsWith("neu")) return "Neuwagen";
  if (s.includes("tageszulassung") || s.includes("vorfuehr") || s.includes("kurzzulassung"))
    return "Tageszulassung";
  if (s.includes("gebraucht") || s.includes("jahreswagen") || s === "used") return "Gebrauchtwagen";
  return null;
}

export function mapFuel(v: string): FuelType | null {
  const s = normalizeHeader(v);
  if (!s) return null;
  if (s.includes("hybrid")) return "Hybrid";
  if (s.includes("elektro") || s === "electric" || s === "ev") return "Elektro";
  if (s.includes("diesel")) return "Diesel";
  if (s.includes("benzin") || s.includes("super") || s === "petrol" || s === "gasoline")
    return "Benzin";
  return null;
}

export function mapTransmission(v: string): Transmission | null {
  const s = normalizeHeader(v);
  if (!s) return null;
  if (s.includes("automat") || s.includes("dct") || s.includes("tct")) return "Automatik";
  if (s.includes("schalt") || s.includes("manuell") || s.includes("manual"))
    return "Schaltgetriebe";
  return null;
}

export function splitList(v: unknown, urls = false): string[] {
  const s = clean(v);
  if (!s) return [];
  if (urls) return Array.from(new Set(s.match(/https?:\/\/[^\s|,;"']+/g) ?? []));
  return s
    .split(/[|;\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function vehicleSlug(v: Pick<ImportVehicle, "brand" | "model" | "version" | "externalId">) {
  const suffix = slugify(v.externalId).slice(-8);
  return [slugify(`${v.brand} ${v.model} ${v.version}`), suffix].filter(Boolean).join("-");
}

/* ---------------------------------------------------- Zeile → Fahrzeug */

type RawRecord = Partial<Record<Field, unknown>>;

export function toImportVehicle(rec: RawRecord): { vehicle: ImportVehicle } | { error: string } {
  const externalId = clean(rec.externalId);
  if (!externalId) return { error: "Externe ID (Spalte „ID“ / „Inserat-Nr“) fehlt" };

  const brand = mapBrand(clean(rec.brand));
  if (!brand) return { error: `Marke nicht unterstützt: „${clean(rec.brand)}“` };

  const model = clean(rec.model);
  if (!model) return { error: "Modell fehlt" };

  const condition = mapCondition(clean(rec.condition));
  if (!condition) return { error: `Zustand unbekannt: „${clean(rec.condition)}“` };

  const price = parseNumber(rec.price);
  if (price == null || price < 0) return { error: "Preis fehlt oder ungültig" };

  let powerHp = parseNumber(rec.powerHp);
  if (powerHp == null) {
    const kw = parseNumber(rec.powerKw);
    if (kw != null) powerHp = Math.round(kw * 1.35962);
  }
  if (powerHp == null || powerHp < 0) return { error: "Leistung (PS/kW) fehlt oder ungültig" };

  const fuelType = mapFuel(clean(rec.fuelType));
  if (!fuelType) return { error: `Kraftstoff nicht unterstützt: „${clean(rec.fuelType)}“` };

  const transmission = mapTransmission(clean(rec.transmission));
  if (!transmission) return { error: `Getriebe unbekannt: „${clean(rec.transmission)}“` };

  const vatRaw = normalizeHeader(clean(rec.vat));
  const vatDeductible = ["1", "ja", "true", "x", "yes", "j", "mwstausweisbar"].includes(vatRaw);

  const co2Class = clean(rec.co2Class).toUpperCase().slice(0, 1);

  return {
    vehicle: {
      externalId,
      brand,
      model,
      version: clean(rec.version),
      condition,
      price,
      vatDeductible,
      mileage: Math.max(0, Math.round(parseNumber(rec.mileage) ?? 0)),
      firstRegistration: parseDate(rec.firstRegistration),
      powerHp: Math.round(powerHp),
      fuelType,
      transmission,
      images: Array.isArray(rec.images)
        ? (rec.images as unknown[]).map(clean).filter(Boolean)
        : splitList(rec.images, true),
      features: Array.isArray(rec.features)
        ? (rec.features as unknown[]).map(clean).filter(Boolean)
        : splitList(rec.features),
      co2Class: /^[A-G]$/.test(co2Class) ? co2Class : null,
      consumptionCombined: parseNumber(rec.consumptionCombined),
      powerConsumption: parseNumber(rec.powerConsumption),
      co2Emissions: (() => {
        const n = parseNumber(rec.co2Emissions);
        return n == null ? null : Math.round(n);
      })(),
    },
  };
}

/* ------------------------------------------------------------- Eingänge */

export function parseVehicleCsv(text: string): ParseResult {
  const table = parseCsv(text);
  const result: ParseResult = { vehicles: [], errors: [] };
  if (table.length < 2) {
    result.errors.push({ row: 1, message: "Die Datei enthält keine Datenzeilen." });
    return result;
  }
  const header = table[0]!.map((h) => ALIAS_LOOKUP.get(normalizeHeader(h)) ?? null);
  if (!header.includes("brand") || !header.includes("model")) {
    result.errors.push({
      row: 1,
      message: "Kopfzeile nicht erkannt: Spalten „Marke“ und „Modell“ sind erforderlich.",
    });
    return result;
  }
  const seen = new Set<string>();
  table.slice(1).forEach((cells, i) => {
    const rec: RawRecord = {};
    header.forEach((field, idx) => {
      // Erste Spalte gewinnt, wenn mehrere Spalten dasselbe Feld belegen
      if (field && rec[field] === undefined && cells[idx] !== undefined) rec[field] = cells[idx];
    });
    const r = toImportVehicle(rec);
    const row = i + 2;
    if ("error" in r) return result.errors.push({ row, message: r.error });
    if (seen.has(r.vehicle.externalId))
      return result.errors.push({
        row,
        message: `Doppelte ID „${r.vehicle.externalId}“ in der Datei`,
      });
    seen.add(r.vehicle.externalId);
    result.vehicles.push(r.vehicle);
  });
  return result;
}

/** JSON: Array oder { vehicles: [...] }; Feldnamen wie bei CSV (deutsch/englisch, beliebige Schreibweise). */
export function parseVehicleJson(text: string): ParseResult {
  const result: ParseResult = { vehicles: [], errors: [] };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    result.errors.push({ row: 1, message: "Ungültiges JSON." });
    return result;
  }
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { vehicles?: unknown }).vehicles)
      ? (data as { vehicles: unknown[] }).vehicles
      : null;
  if (!list) {
    result.errors.push({ row: 1, message: 'Erwartet ein Array oder { "vehicles": [...] }.' });
    return result;
  }
  const seen = new Set<string>();
  list.forEach((item, i) => {
    const rec: RawRecord = {};
    if (item && typeof item === "object") {
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        const f = ALIAS_LOOKUP.get(normalizeHeader(k));
        if (f && rec[f] === undefined) rec[f] = v;
      }
    }
    const r = toImportVehicle(rec);
    if ("error" in r) return result.errors.push({ row: i + 1, message: r.error });
    if (seen.has(r.vehicle.externalId))
      return result.errors.push({ row: i + 1, message: `Doppelte ID „${r.vehicle.externalId}“` });
    seen.add(r.vehicle.externalId);
    result.vehicles.push(r.vehicle);
  });
  return result;
}

export function parseVehicleImport(text: string): ParseResult {
  const t = text.trimStart();
  return t.startsWith("{") || t.startsWith("[") ? parseVehicleJson(text) : parseVehicleCsv(text);
}
