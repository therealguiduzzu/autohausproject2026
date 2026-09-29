import { describe, expect, it } from "vitest";
import { easterSunday, getOpeningStatus, isHoliday } from "./opening-hours";

// Sommerzeit: MESZ = UTC+2, Winterzeit: MEZ = UTC+1
describe("opening-hours", () => {
  it("berechnet Ostern", () => {
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
  });

  it("kennt hessische Feiertage", () => {
    expect(isHoliday("2026-04-03")).toBe(true); // Karfreitag
    expect(isHoliday("2026-06-04")).toBe(true); // Fronleichnam
    expect(isHoliday("2026-08-15")).toBe(false); // Mariä Himmelfahrt gilt in Hessen nicht
  });

  it("zeigt geöffnet an einem Werktag", () => {
    const s = getOpeningStatus(new Date("2026-07-01T08:00:00Z")); // Mi 10:00 Berlin
    expect(s).toEqual({ open: true, label: "Jetzt geöffnet · bis 17:30 Uhr" });
  });

  it("zeigt Öffnung am selben Tag vor Beginn", () => {
    const s = getOpeningStatus(new Date("2026-07-01T04:00:00Z")); // Mi 06:00
    expect(s.label).toBe("Geschlossen · öffnet heute um 7:30 Uhr");
  });

  it("springt nach Feierabend auf morgen, am Wochenende auf Montag", () => {
    expect(getOpeningStatus(new Date("2026-07-01T16:30:00Z")).label).toBe(
      "Geschlossen · öffnet morgen um 7:30 Uhr",
    );
    // Samstag 15:00 Berlin → Montag
    expect(getOpeningStatus(new Date("2026-07-04T13:00:00Z")).label).toBe(
      "Geschlossen · öffnet Mo um 7:30 Uhr",
    );
  });

  it("überspringt Feiertage", () => {
    // Mittwoch 2026-06-03, 18:00 Berlin; Donnerstag 04.06. ist Fronleichnam → Freitag 7:30
    expect(getOpeningStatus(new Date("2026-06-03T16:00:00Z")).label).toBe(
      "Geschlossen · öffnet Fr um 7:30 Uhr",
    );
  });
});
