import { describe, expect, it } from "vitest";
import {
  parseNumber,
  parseDate,
  parseVehicleCsv,
  parseVehicleJson,
  parseVehicleImport,
  vehicleSlug,
} from "./vehicle-import";

const CSV = [
  "ID;Marke;Modell;Variante;Zustand;Preis;MwSt ausweisbar;Kilometerstand;Erstzulassung;Leistung (PS);Kraftstoff;Getriebe;Bilder;Ausstattung;CO2-Klasse",
  '4711;Alfa Romeo;Tonale;1.5 VGT MHEV TCT Veloce;Gebraucht;"38.900,00 €";ja;12.500;03/2024;160;Benzin (Mild-Hybrid);Automatik (DCT);https://x.de/a.jpg | https://x.de/b.jpg;Navi|LED-Scheinwerfer;C',
  "4712;Fiat;500e;La Prima;Neuwagen;29900;nein;0;;118;Elektro;Automatik;;;",
  "4713;Ferrari;Roma;;Neu;200000;nein;0;;620;Benzin;Automatik;;;",
  "4711;Fiat;Panda;;Gebraucht;9000;nein;50000;2019;70;Benzin;Schaltgetriebe;;;",
].join("\n");

describe("vehicle-import", () => {
  it("parst deutsche Zahlen und Datumsformate", () => {
    expect(parseNumber("38.900,50 €")).toBe(38900.5);
    expect(parseNumber("38.900")).toBe(38900);
    expect(parseNumber("12.5")).toBe(12.5);
    expect(parseNumber("")).toBeNull();
    expect(parseDate("03/2024")).toBe("2024-03-01");
    expect(parseDate("15.03.2024")).toBe("2024-03-15");
    expect(parseDate("2024-03-15")).toBe("2024-03-15");
  });

  it("importiert gültige Zeilen und meldet Fehler je Zeile", () => {
    const { vehicles, errors } = parseVehicleCsv(CSV);
    expect(vehicles).toHaveLength(2);
    const [tonale, fiat] = vehicles;
    expect(tonale).toMatchObject({
      externalId: "4711",
      brand: "Alfa Romeo",
      condition: "Gebrauchtwagen",
      price: 38900,
      vatDeductible: true,
      mileage: 12500,
      firstRegistration: "2024-03-01",
      powerHp: 160,
      fuelType: "Hybrid",
      transmission: "Automatik",
      co2Class: "C",
    });
    expect(tonale!.images).toEqual(["https://x.de/a.jpg", "https://x.de/b.jpg"]);
    expect(tonale!.features).toEqual(["Navi", "LED-Scheinwerfer"]);
    expect(fiat).toMatchObject({ brand: "Fiat", fuelType: "Elektro", condition: "Neuwagen" });
    expect(errors.map((e) => e.row)).toEqual([4, 5]);
    expect(errors[0]!.message).toContain("Marke nicht unterstützt");
    expect(errors[1]!.message).toContain("Doppelte ID");
  });

  it("rechnet kW in PS um und erkennt JSON", () => {
    const { vehicles } = parseVehicleImport(
      JSON.stringify({
        vehicles: [
          {
            id: "1",
            make: "Abarth",
            model: "595",
            condition: "Tageszulassung",
            price: 25000,
            kw: 132,
            fuel: "Super",
            transmission: "manual",
          },
        ],
      }),
    );
    expect(vehicles[0]).toMatchObject({
      brand: "Abarth",
      powerHp: 179,
      fuelType: "Benzin",
      transmission: "Schaltgetriebe",
    });
    expect(parseVehicleJson("kein json").errors[0]!.message).toBe("Ungültiges JSON.");
  });

  it("verlangt erkennbare Kopfzeile", () => {
    expect(parseVehicleCsv("a;b\n1;2").errors[0]!.message).toContain("Kopfzeile");
  });

  it("erzeugt stabile Slugs", () => {
    expect(
      vehicleSlug({
        brand: "Alfa Romeo",
        model: "Tonale",
        version: "1.5 Veloce",
        externalId: "MD-4711",
      }),
    ).toBe("alfa-romeo-tonale-1-5-veloce-md-4711");
  });
});
