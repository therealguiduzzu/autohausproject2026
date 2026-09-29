import { describe, expect, it } from "vitest";
import {
  addDays,
  buildIcs,
  categoryFromService,
  formatDayLong,
  formatDayShort,
  isBookableDate,
  mondayOf,
  nextWorkdays,
  weekdayIndex,
} from "./workshop";

describe("workshop", () => {
  it("rechnet mit Datumsstrings", () => {
    expect(weekdayIndex("2026-06-29")).toBe(0); // Montag
    expect(mondayOf("2026-07-03")).toBe("2026-06-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(formatDayShort("2026-06-30")).toBe("Di 30.06.");
    expect(formatDayLong("2026-06-29")).toBe("Montag, 29.06.2026");
  });

  it("liefert nur Werktage ab morgen", () => {
    // Freitag 2026-07-03 → nächste Werktage: Mo, Di, Mi
    expect(nextWorkdays(3, "2026-07-03")).toEqual(["2026-07-06", "2026-07-07", "2026-07-08"]);
  });

  it("prüft Buchbarkeit", () => {
    const today = "2026-07-01"; // Mittwoch
    expect(isBookableDate("2026-07-01", today)).toBe(false); // heute
    expect(isBookableDate("2026-07-02", today)).toBe(true);
    expect(isBookableDate("2026-07-04", today)).toBe(false); // Samstag
    expect(isBookableDate("2026-09-30", today)).toBe(false); // zu weit
    expect(isBookableDate("morgen", today)).toBe(false);
  });

  it("ordnet Kategorien zu", () => {
    expect(categoryFromService("Inspektion")).toBe("inspektion");
    expect(categoryFromService("HU/AU")).toBe("hu_au");
    expect(categoryFromService("Reifenwechsel")).toBe("reifen");
    expect(categoryFromService("Reparatur")).toBe("sonstiges");
  });

  it("erzeugt gültigen ICS-Feed nur mit bestätigten Terminen", () => {
    const ics = buildIcs(
      [
        {
          id: "1",
          slot_date: "2026-07-02",
          slot_time: "10:00",
          service: "Inspektion",
          vehicle: "Fiat 500, MKK-AS 1",
          customer_name: "A; B",
          customer_phone: "0123",
          customer_email: null,
          status: "bestaetigt",
        },
        {
          id: "2",
          slot_date: "2026-07-02",
          slot_time: "13:00",
          service: "HU",
          vehicle: "",
          customer_name: "C",
          customer_phone: null,
          customer_email: null,
          status: "abgesagt",
        },
      ],
      new Date("2026-06-30T10:00:00Z"),
    );
    expect(ics).toContain("DTSTART;TZID=Europe/Berlin:20260702T100000");
    expect(ics).toContain("DTEND;TZID=Europe/Berlin:20260702T113000");
    expect(ics).toContain("SUMMARY:Inspektion · A\; B");
    expect(ics).not.toContain("UID:2@");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
