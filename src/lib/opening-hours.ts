/** Öffnungszeiten Verkauf (Europe/Berlin) inkl. hessischer Feiertage. Reine Funktionen. */

import { berlinToday, toIso, addDays, weekdayIndex } from "./workshop";

/** Index 0 = Montag … 6 = Sonntag; null = geschlossen. Minuten seit Mitternacht. */
export const OPENING_HOURS: ({ from: number; to: number } | null)[] = [
  { from: 7 * 60 + 30, to: 17 * 60 + 30 },
  { from: 7 * 60 + 30, to: 17 * 60 + 30 },
  { from: 7 * 60 + 30, to: 17 * 60 + 30 },
  { from: 7 * 60 + 30, to: 17 * 60 + 30 },
  { from: 7 * 60 + 30, to: 17 * 60 + 30 },
  { from: 9 * 60, to: 14 * 60 },
  null,
];

const DAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const fmt = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

/** Ostersonntag (Gauß/Meeus-Algorithmus) als ISO-Datum. */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toIso(new Date(Date.UTC(year, month - 1, day)));
}

/** Gesetzliche Feiertage in Hessen. */
export function hessenHolidays(year: number): Set<string> {
  const easter = easterSunday(year);
  return new Set([
    `${year}-01-01`,
    addDays(easter, -2), // Karfreitag
    addDays(easter, 1), // Ostermontag
    `${year}-05-01`,
    addDays(easter, 39), // Christi Himmelfahrt
    addDays(easter, 50), // Pfingstmontag
    addDays(easter, 60), // Fronleichnam
    `${year}-10-03`,
    `${year}-12-25`,
    `${year}-12-26`,
  ]);
}

export const isHoliday = (iso: string) => hessenHolidays(Number(iso.slice(0, 4))).has(iso);

function hoursOn(iso: string) {
  return isHoliday(iso) ? null : OPENING_HOURS[weekdayIndex(iso)]!;
}

export interface OpeningStatus {
  open: boolean;
  label: string;
}

/** Aktueller Status; `now` nur für Tests überschreibbar. */
export function getOpeningStatus(now: Date = new Date()): OpeningStatus {
  const today = berlinToday(now);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const minutes =
    Number(parts.find((p) => p.type === "hour")!.value) * 60 +
    Number(parts.find((p) => p.type === "minute")!.value);

  const h = hoursOn(today);
  if (h && minutes >= h.from && minutes < h.to) {
    return { open: true, label: `Jetzt geöffnet · bis ${fmt(h.to)} Uhr` };
  }
  if (h && minutes < h.from) {
    return { open: false, label: `Geschlossen · öffnet heute um ${fmt(h.from)} Uhr` };
  }
  for (let i = 1; i <= 10; i++) {
    const day = addDays(today, i);
    const next = hoursOn(day);
    if (next) {
      const name = i === 1 ? "morgen" : DAY_SHORT[weekdayIndex(day)]!;
      return { open: false, label: `Geschlossen · öffnet ${name} um ${fmt(next.from)} Uhr` };
    }
  }
  return { open: false, label: "Geschlossen" };
}
