/** Werkstatt-Termine: Konstanten und reine Hilfsfunktionen (Client + Server). */

export const WORKSHOP_SLOTS = ["08:00", "10:00", "13:00", "15:00"] as const;
/** Werkstattplätze je Slot – muss zu public.workshop_capacity() in der Datenbank passen. */
export const WORKSHOP_CAPACITY_PER_SLOT = 2;
/** Wie weit im Voraus online gebucht werden kann (Tage). */
export const BOOKING_HORIZON_DAYS = 28;
/** Dauer eines Termins im Kalender-Export (Minuten). */
export const APPOINTMENT_MINUTES = 90;

export type WorkshopCategory = "inspektion" | "hu_au" | "reifen" | "sonstiges";

export const WORKSHOP_CATEGORIES: { value: WorkshopCategory; label: string }[] = [
  { value: "inspektion", label: "Inspektion" },
  { value: "hu_au", label: "HU / AU" },
  { value: "reifen", label: "Reifen" },
  { value: "sonstiges", label: "Sonstiges / Reparatur" },
];

export function categoryFromService(service: string): WorkshopCategory {
  const s = service.toLowerCase();
  if (s.includes("inspektion") || s.includes("wartung") || s.includes("öl")) return "inspektion";
  if (s.includes("hu") || s.includes("au") || s.includes("tüv")) return "hu_au";
  if (s.includes("reifen")) return "reifen";
  return "sonstiges";
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Heutiges Datum in Deutschland als YYYY-MM-DD (unabhängig von der Server-Zeitzone). */
export function berlinToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export function toIso(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseIso(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** 0 = Montag … 6 = Sonntag */
export function weekdayIndex(iso: string): number {
  return (parseIso(iso).getUTCDay() + 6) % 7;
}

export function mondayOf(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

/** Nächste `count` Werktage (Mo–Fr), frühestens ab morgen. */
export function nextWorkdays(count: number, today: string = berlinToday()): string[] {
  const out: string[] = [];
  let cursor = today;
  while (out.length < count) {
    cursor = addDays(cursor, 1);
    if (weekdayIndex(cursor) < 5) out.push(cursor);
  }
  return out;
}

export function isBookableDate(iso: string, today: string = berlinToday()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return weekdayIndex(iso) < 5 && iso > today && iso <= addDays(today, BOOKING_HORIZON_DAYS);
}

const DAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

/** "Mo 30.06." */
export function formatDayShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${DAY_SHORT[weekdayIndex(iso)]} ${d}.${m}.`;
}

/** "Montag, 30.06.2026" */
export function formatDayLong(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${DAY_LONG[weekdayIndex(iso)]}, ${d}.${m}.${y}`;
}

export interface CalendarAppointment {
  id: string;
  slot_date: string;
  slot_time: string;
  service: string;
  vehicle: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  status: string;
}

const icsEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const icsLocal = (iso: string, time: string) =>
  `${iso.replace(/-/g, "")}T${time.replace(":", "")}00`;

/** iCalendar-Feed (RFC 5545) aller bestätigten Termine; Zeiten in Europe/Berlin. */
export function buildIcs(appointments: CalendarAppointment[], stamp: Date = new Date()): string {
  const dtstamp = stamp
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Auto Semmel//Werkstatt//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Auto Semmel Werkstatt",
    "X-WR-TIMEZONE:Europe/Berlin",
  ];
  for (const a of appointments) {
    if (a.status !== "bestaetigt") continue;
    const [h, m] = a.slot_time.split(":").map(Number);
    const endTotal = h! * 60 + m! + APPOINTMENT_MINUTES;
    const end = `${pad(Math.floor(endTotal / 60))}:${pad(endTotal % 60)}`;
    const desc = [a.vehicle, `Kunde: ${a.customer_name}`, a.customer_phone, a.customer_email]
      .filter(Boolean)
      .join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}@auto-semmel.de`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=Europe/Berlin:${icsLocal(a.slot_date, a.slot_time)}`,
      `DTEND;TZID=Europe/Berlin:${icsLocal(a.slot_date, end)}`,
      `SUMMARY:${icsEscape(`${a.service} · ${a.customer_name}`)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      "LOCATION:Auto Semmel\\, Gelnhäuser Straße 40\\, 63505 Langenselbold",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
