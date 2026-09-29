/** Gemeinsame E-Mail-Helfer (nur Server). Versand läuft über die pgmq-Queue `transactional_emails`. */

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

/** Stellt eine Mail in die Queue. Gibt false zurück, wenn die Mail-Infrastruktur (noch) fehlt. */
export async function enqueueEmail(mail: {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
}): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
        queue_name: "transactional_emails",
        payload: {
          to: mail.to,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          template_name: mail.template,
        },
      } as never,
    );
    return !error;
  } catch {
    return false;
  }
}
