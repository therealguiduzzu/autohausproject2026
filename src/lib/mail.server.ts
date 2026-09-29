/**
 * E-Mail-Versand (nur Server) über beliebigen SMTP-Anbieter (Brevo, Mailjet, IONOS, Postfix …).
 *
 * Konfiguration per Umgebungsvariablen:
 *   SMTP_HOST, SMTP_PORT (587 = STARTTLS, 465 = TLS), SMTP_USER, SMTP_PASS,
 *   MAIL_FROM  z. B.  "Auto Semmel <info@auto-semmel.de>"
 * Ohne SMTP_HOST wird nicht gesendet (Entwicklung): die Mail wird in der Konsole ausgegeben.
 * Jeder Versuch wird in `email_send_log` protokolliert (Admin → E-Mail-Queue).
 */
import type { Transporter } from "nodemailer";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Empfänger für interne Benachrichtigungen (LEAD_NOTIFY_EMAIL, kommagetrennt). */
export function teamRecipients(): string[] {
  return (process.env.LEAD_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function mailLayout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #eee;margin:28px 0">
      <p style="font-size:12px;color:#888">Auto Semmel GmbH &amp; Co. Siegfried Polenz KG · Gelnhäuser Straße 40, 63505 Langenselbold · 06184 / 2633</p>
    </div>`;
}

export const isMailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);

let transporter: Transporter | undefined;
async function getTransporter(): Promise<Transporter> {
  if (!transporter) {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      pool: true,
      maxConnections: 5,
    });
  }
  return transporter;
}

async function logMail(row: {
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: "sent" | "failed";
  error_message: string | null;
  subject: string;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("email_send_log").insert({
      message_id: row.message_id,
      template_name: row.template_name,
      recipient_email: row.recipient_email,
      status: row.status,
      error_message: row.error_message,
      metadata: { subject: row.subject },
    });
  } catch {
    /* Protokoll ist Zusatz – Versand nie daran scheitern lassen */
  }
}

/**
 * Sendet eine Mail. Gibt true zurück, wenn der SMTP-Server sie angenommen hat.
 * (Name historisch: früher Queue-basiert; jetzt direkter Versand.)
 */
export async function enqueueEmail(mail: {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
}): Promise<boolean> {
  const messageId = crypto.randomUUID();
  if (!isMailConfigured()) {
    console.info(`[mail] SMTP nicht konfiguriert – nicht gesendet: ${mail.template} → ${mail.to}`);
    return false;
  }
  try {
    const t = await getTransporter();
    await t.sendMail({
      from: process.env.MAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    await logMail({
      message_id: messageId,
      template_name: mail.template,
      recipient_email: mail.to,
      status: "sent",
      error_message: null,
      subject: mail.subject,
    });
    return true;
  } catch (e) {
    console.error("[mail] Versand fehlgeschlagen:", e);
    await logMail({
      message_id: messageId,
      template_name: mail.template,
      recipient_email: mail.to,
      status: "failed",
      error_message: e instanceof Error ? e.message.slice(0, 500) : "unbekannter Fehler",
      subject: mail.subject,
    });
    return false;
  }
}
