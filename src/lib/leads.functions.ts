import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LeadInput = z.object({
  type: z.enum(["Probefahrt", "Werkstattermin", "Fahrzeugankauf", "Kontakt"]),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional(),
  subject: z.string().trim().min(1).max(300),
  details: z.record(z.string().max(500)).refine((d) => Object.keys(d).length <= 30, "zu viele Felder"),
  vehicleId: z.string().uuid().optional(),
  sourceUrl: z.string().max(2000).optional(),
  consent: z.literal(true),
});

export type LeadSubmission = z.input<typeof LeadInput>;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Nimmt eine Kundenanfrage entgegen: validiert serverseitig, speichert sie
 * und benachrichtigt das Team per E-Mail (Empfänger: Umgebungsvariable
 * LEAD_NOTIFY_EMAIL, mehrere Adressen kommagetrennt). Die Benachrichtigung
 * ist "best effort" – die Anfrage geht auch ohne aktive Mail-Infrastruktur nicht verloren.
 */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((raw) => LeadInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("leads").insert({
      type: data.type,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      subject: data.subject,
      details: data.details,
      vehicle_id: data.vehicleId ?? null,
      source_url: data.sourceUrl ?? null,
      consent_given: true,
      status: "Neu",
    });
    if (error) {
      if (error.message.includes("rate_limit")) {
        return { ok: false, reason: "rateLimited" } as const;
      }
      throw new Error(error.message);
    }

    const recipients = (process.env.LEAD_NOTIFY_EMAIL ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let notified = false;
    if (recipients.length > 0) {
      const rows = Object.entries(data.details)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(v)}</td></tr>`)
        .join("");
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
          <h1 style="font-size:20px;margin:0 0 12px">Neue Anfrage: ${esc(data.type)}</h1>
          <p style="margin:0 0 16px"><strong>${esc(data.subject)}</strong></p>
          <p style="margin:0 0 16px">
            ${esc(data.name)}<br>
            ${data.phone ? `Tel.: ${esc(data.phone)}<br>` : ""}
            ${data.email ? `E-Mail: ${esc(data.email)}` : ""}
          </p>
          <table style="font-size:14px;border-collapse:collapse">${rows}</table>
        </div>`;
      const text = [
        `Neue Anfrage: ${data.type}`,
        data.subject,
        `${data.name} ${data.phone ?? ""} ${data.email ?? ""}`.trim(),
        ...Object.entries(data.details).map(([k, v]) => `${k}: ${v}`),
      ].join("\n");

      for (const to of recipients) {
        try {
          const { error: qErr } = await supabaseAdmin.rpc("enqueue_email" as never, {
            queue_name: "transactional_emails",
            payload: { to, subject: `Neue Anfrage: ${data.subject}`, html, text, template_name: "lead-notification" },
          } as never);
          if (!qErr) notified = true;
        } catch {
          /* Mail-Infrastruktur noch nicht aktiv – Anfrage bleibt im Admin-Bereich sichtbar. */
        }
      }
    }

    return { ok: true, notified } as const;
  });
