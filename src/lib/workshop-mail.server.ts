import { enqueueEmail, escapeHtml, mailLayout, teamRecipients } from "./mail.server";
import { formatDayLong } from "./workshop";

export type AppointmentMailKind =
  "created" | "rescheduled" | "updated" | "cancelled" | "reactivated" | "deleted";

export interface AppointmentMailData {
  slot_date: string;
  slot_time: string;
  service: string;
  vehicle: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
}

const ADDRESS = "Auto Semmel · Gelnhäuser Straße 40 · 63505 Langenselbold";

/**
 * Benachrichtigt Kunde (falls E-Mail vorhanden) und – bei Online-Buchungen – das Team.
 * Gibt zurück, ob die Kundenmail in die Queue gestellt wurde.
 */
export async function sendAppointmentMails(
  kind: AppointmentMailKind,
  a: AppointmentMailData,
  opts: { team?: boolean; previous?: string } = {},
): Promise<boolean> {
  const slot = `${formatDayLong(a.slot_date)}, ${a.slot_time} Uhr`;
  const first = a.customer_name.split(" ")[0] || "Kunde";
  const lead: Record<AppointmentMailKind, string> = {
    created: `wir bestätigen Ihren Werkstatttermin am ${slot}.`,
    rescheduled: `Ihr Werkstatttermin wurde verschoben${opts.previous ? ` (vorher: ${opts.previous})` : ""}. Neuer Termin: ${slot}.`,
    updated: `wir haben Details zu Ihrem Werkstatttermin am ${slot} aktualisiert.`,
    cancelled: `leider müssen wir Ihren Termin am ${slot} absagen. Wir melden uns für einen Ersatztermin.`,
    reactivated: `Ihr Termin am ${slot} ist wieder bestätigt.`,
    deleted: `Ihr Termin am ${slot} wurde storniert.`,
  };
  const subject: Record<AppointmentMailKind, string> = {
    created: `Terminbestätigung: ${a.service} – ${slot}`,
    rescheduled: `Ihr Werkstatttermin wurde verschoben – jetzt ${slot}`,
    updated: `Aktualisierung zu Ihrem Werkstatttermin (${slot})`,
    cancelled: `Absage: ${a.service} (${slot})`,
    reactivated: `Termin wieder bestätigt – ${slot}`,
    deleted: `Stornierung: ${a.service} (${slot})`,
  };

  let customerQueued = false;
  if (a.customer_email) {
    const body = `
      <p>Guten Tag ${escapeHtml(first)},</p>
      <p>${escapeHtml(lead[kind])}</p>
      <table style="font-size:14px;border-collapse:collapse">
        <tr><td style="padding:2px 12px 2px 0;color:#666">Service</td><td>${escapeHtml(a.service)}</td></tr>
        ${a.vehicle ? `<tr><td style="padding:2px 12px 2px 0;color:#666">Fahrzeug</td><td>${escapeHtml(a.vehicle)}</td></tr>` : ""}
        <tr><td style="padding:2px 12px 2px 0;color:#666">Ort</td><td>${escapeHtml(ADDRESS)}</td></tr>
      </table>
      <p style="margin-top:16px">Fragen? Rufen Sie uns an: 06184 / 2633.</p>`;
    customerQueued = await enqueueEmail({
      to: a.customer_email,
      subject: subject[kind],
      html: mailLayout(subject[kind], body),
      text: `Guten Tag ${first}, ${lead[kind]}\nService: ${a.service}\n${ADDRESS}\nTelefon: 06184 / 2633`,
      template: `appointment-${kind}`,
    });
  }

  if (opts.team !== false && kind === "created") {
    for (const to of teamRecipients()) {
      const body = `<p><strong>${escapeHtml(a.customer_name)}</strong> · ${escapeHtml(a.customer_phone ?? "")} · ${escapeHtml(a.customer_email ?? "")}</p>
        <p>${escapeHtml(slot)} · ${escapeHtml(a.service)}${a.vehicle ? ` · ${escapeHtml(a.vehicle)}` : ""}</p>`;
      await enqueueEmail({
        to,
        subject: `Neuer Online-Termin: ${a.service} – ${slot}`,
        html: mailLayout("Neuer Online-Werkstatttermin", body),
        text: `Neuer Online-Termin: ${a.service}, ${slot}\n${a.customer_name} ${a.customer_phone ?? ""} ${a.customer_email ?? ""}\n${a.vehicle}`,
        template: "appointment-team",
      });
    }
  }
  return customerQueued;
}
