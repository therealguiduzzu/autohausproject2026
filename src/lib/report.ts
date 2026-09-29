/** Jahresbericht: Zeilenmodell und CSV-Erzeugung (rein, testbar). */

export interface MonthRow {
  month: number; // 1–12
  leads: number;
  leadsProbefahrt: number;
  leadsAnkauf: number;
  leadsKontakt: number;
  termineBestaetigt: number;
  termineOnline: number;
  termineAbgesagt: number;
  newsletterAnmeldungen: number;
  newsletterAbmeldungen: number;
}

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export const emptyMonths = (): MonthRow[] =>
  MONTHS.map((_, i) => ({
    month: i + 1,
    leads: 0,
    leadsProbefahrt: 0,
    leadsAnkauf: 0,
    leadsKontakt: 0,
    termineBestaetigt: 0,
    termineOnline: 0,
    termineAbgesagt: 0,
    newsletterAnmeldungen: 0,
    newsletterAbmeldungen: 0,
  }));

const HEADER = [
  "Monat",
  "Anfragen gesamt",
  "davon Probefahrt",
  "davon Ankauf",
  "davon Kontakt/Sonstige",
  "Werkstatttermine (bestätigt)",
  "davon online gebucht",
  "Werkstatttermine (abgesagt)",
  "Newsletter-Anmeldungen (bestätigt)",
  "Newsletter-Abmeldungen",
];

/** CSV für Excel (Semikolon, UTF-8 mit BOM), inkl. Summenzeile. */
export function buildReportCsv(year: number, rows: MonthRow[]): string {
  const num = (r: MonthRow) => [
    r.leads,
    r.leadsProbefahrt,
    r.leadsAnkauf,
    r.leadsKontakt,
    r.termineBestaetigt,
    r.termineOnline,
    r.termineAbgesagt,
    r.newsletterAnmeldungen,
    r.newsletterAbmeldungen,
  ];
  const lines = [HEADER.join(";")];
  const totals = new Array(9).fill(0) as number[];
  for (const r of rows) {
    const n = num(r);
    n.forEach((v, i) => (totals[i]! += v));
    lines.push([`${MONTHS[r.month - 1]} ${year}`, ...n].join(";"));
  }
  lines.push([`Summe ${year}`, ...totals].join(";"));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
