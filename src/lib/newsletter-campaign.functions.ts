import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "./auth-guards.server";

export interface NewsletterStats {
  confirmed: number;
  pending: number;
  unsubscribed: number;
  confirmedLast30Days: number;
  lastCampaign: { subject: string; createdAt: string; queued: number; recipients: number } | null;
}

export const getNewsletterStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsletterStats> => {
    await requireRole(context, ["admin", "staff"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const count = async (status: string, since?: string) => {
      let q = supabaseAdmin
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (since) q = q.gte("confirmed_at", since);
      const { count: c, error } = await q;
      if (error) throw new Error(error.message);
      return c ?? 0;
    };
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const [confirmed, pending, unsubscribed, recent, last] = await Promise.all([
      count("confirmed"),
      count("pending"),
      count("unsubscribed"),
      count("confirmed", since),
      supabaseAdmin
        .from("newsletter_campaigns")
        .select("subject, created_at, queued_count, recipient_count")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      confirmed,
      pending,
      unsubscribed,
      confirmedLast30Days: recent,
      lastCampaign: last.data
        ? {
            subject: last.data.subject,
            createdAt: last.data.created_at,
            queued: last.data.queued_count,
            recipients: last.data.recipient_count,
          }
        : null,
    };
  });

const CampaignInput = z.object({
  templateId: z.string().max(40),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(4000),
  /** Nur an diese Adresse senden (Testversand) */
  testTo: z.string().trim().email().optional(),
});

const MAX_RECIPIENTS = 1000;
const CONCURRENCY = 8;

/**
 * Newsletter versenden: nur an bestätigte Abonnenten (Double-Opt-In), jede Mail mit
 * persönlichem Abmeldelink. Versand über die E-Mail-Queue; Öffnungs-/Klickraten werden
 * bewusst NICHT getrackt (DSGVO/TTDSG).
 */
export const sendNewsletterCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => CampaignInput.parse(raw))
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { enqueueEmail, escapeHtml, mailLayout } = await import("./mail.server");
    const site = (process.env.VITE_SITE_URL ?? process.env.SITE_URL ?? "").replace(/\/+$/, "");

    let recipients: { email: string; unsubscribe_token: string }[];
    if (data.testTo) {
      recipients = [{ email: data.testTo, unsubscribe_token: "test" }];
    } else {
      const { data: rows, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("email, unsubscribe_token")
        .eq("status", "confirmed")
        .limit(MAX_RECIPIENTS);
      if (error) throw new Error(error.message);
      recipients = rows ?? [];
    }
    if (recipients.length === 0) return { ok: false, reason: "noRecipients" } as const;

    const paragraphs = data.message
      .split(/\n{2,}/)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join("");

    let queued = 0;
    const sendOne = async (r: { email: string; unsubscribe_token: string }) => {
      const unsub = `${site}/newsletter/abmelden?token=${r.unsubscribe_token}`;
      const html = mailLayout(
        data.subject,
        `${paragraphs}
         <p style="margin:24px 0"><a href="${site || "#"}" style="background:#B90E0A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">Zur Website</a></p>
         <p style="font-size:12px;color:#888">Sie erhalten diese E-Mail, weil Sie sich für den Auto-Semmel-Newsletter angemeldet haben. <a href="${unsub}" style="color:#555">Hier abmelden</a>.</p>`,
      );
      const ok = await enqueueEmail({
        to: r.email,
        subject: data.subject,
        html,
        text: `${data.message}\n\nAbmelden: ${unsub}`,
        template: "newsletter-campaign",
      });
      if (ok) queued++;
    };
    // Begrenzte Parallelität, damit der SMTP-Server nicht überlastet wird
    for (let i = 0; i < recipients.length; i += CONCURRENCY) {
      await Promise.all(recipients.slice(i, i + CONCURRENCY).map(sendOne));
    }

    if (!data.testTo) {
      await supabaseAdmin.from("newsletter_campaigns").insert({
        template_id: data.templateId,
        subject: data.subject,
        recipient_count: recipients.length,
        queued_count: queued,
        sent_by: context.userId,
      });
    }
    return { ok: true, recipients: recipients.length, queued } as const;
  });
