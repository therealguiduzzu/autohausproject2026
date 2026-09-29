import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SubscribeInput = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  consent: z.literal(true),
  source: z.string().max(64).optional(),
  userAgent: z.string().max(512).optional(),
});

const ConfirmInput = z.object({
  token: z.string().min(16).max(128),
});

const UnsubscribeInput = z.object({
  token: z.string().min(16).max(128),
});

const ResendInput = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function siteOrigin(headers: Headers): string {
  const envSite = process.env.SITE_URL ?? process.env.VITE_SITE_URL;
  if (envSite) return envSite.replace(/\/$/, "");
  const forwardedHost = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${proto}://${forwardedHost}`;
  return "http://localhost:3000";
}

/**
 * Newsletter-Anmeldung (Double-Opt-In, Schritt 1).
 * Erstellt oder reaktiviert einen Eintrag mit Status "pending",
 * generiert einen Bestätigungs-Token und stellt — sofern die
 * E-Mail-Infrastruktur aktiv ist — eine Bestätigungs-Mail in die Queue.
 */
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((raw) => SubscribeInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const headers =
      typeof globalThis !== "undefined" && "Headers" in globalThis ? new Headers() : new Headers();
    // Note: TanStack server fns don't expose req headers by default; we use env/default site URL.
    const origin = siteOrigin(headers);

    const token = randomToken();
    const now = new Date().toISOString();

    // Upsert: schon vorhandene Adresse → Token erneuern, Status zurück auf pending,
    // bereits bestätigte Adressen bleiben confirmed (kein Token-Reset).
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", data.email)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);

    if (existing?.status === "confirmed") {
      return { ok: true, alreadyConfirmed: true } as const;
    }

    let unsubToken: string | null = null;
    if (existing) {
      const { data: upd, error: updErr } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update({
          status: "pending",
          confirmation_token: token,
          confirmation_sent_at: now,
          consent_user_agent: data.userAgent ?? null,
          source: data.source ?? "website",
        })
        .eq("id", existing.id)
        .select("unsubscribe_token")
        .single();
      if (updErr) throw new Error(updErr.message);
      unsubToken = (upd as { unsubscribe_token: string } | null)?.unsubscribe_token ?? null;
    } else {
      const { data: ins, error: insErr } = await supabaseAdmin
        .from("newsletter_subscribers")
        .insert({
          email: data.email,
          status: "pending",
          confirmation_token: token,
          confirmation_sent_at: now,
          consent_user_agent: data.userAgent ?? null,
          source: data.source ?? "website",
        })
        .select("unsubscribe_token")
        .single();
      if (insErr) throw new Error(insErr.message);
      unsubToken = (ins as { unsubscribe_token: string } | null)?.unsubscribe_token ?? null;
    }

    const confirmUrl = `${origin}/newsletter/bestaetigen?token=${token}`;
    const unsubscribeUrl = unsubToken ? `${origin}/newsletter/abmelden?token=${unsubToken}` : null;

    // Bestätigungs-Mail in pgmq-Queue stellen, sofern Email-Infrastruktur aktiv ist.

    let queued = false;
    try {
      const subject = "Bitte bestätigen Sie Ihre Newsletter-Anmeldung";
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
          <h1 style="font-size:22px;margin:0 0 16px">Willkommen bei Auto Semmel</h1>
          <p>Vielen Dank für Ihr Interesse am Auto Semmel Newsletter. Bitte bestätigen Sie Ihre E-Mail-Adresse mit einem Klick:</p>
          <p style="margin:28px 0">
            <a href="${confirmUrl}"
               style="background:#B90E0A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
              Anmeldung bestätigen
            </a>
          </p>
          <p style="font-size:13px;color:#555">Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
            <span style="word-break:break-all">${confirmUrl}</span>
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:28px 0">
          <p style="font-size:12px;color:#888">Sie erhalten diese E-Mail, weil sich jemand mit dieser Adresse für den Newsletter angemeldet hat. Falls Sie das nicht waren, ignorieren Sie diese Nachricht einfach.</p>
          ${unsubscribeUrl ? `<p style="font-size:12px;color:#888">Sie möchten keine E-Mails mehr erhalten? <a href="${unsubscribeUrl}" style="color:#555">Hier abmelden</a>.</p>` : ""}
        </div>`;
      const text = `Bitte bestätigen Sie Ihre Newsletter-Anmeldung: ${confirmUrl}${unsubscribeUrl ? `\n\nAbmelden: ${unsubscribeUrl}` : ""}`;

      const { error: queueErr } = await supabaseAdmin.rpc(
        "enqueue_email" as never,
        {
          queue_name: "transactional_emails",
          payload: {
            to: data.email,
            subject,
            html,
            text,
            template_name: "newsletter-confirm",
          },
        } as never,
      );
      if (!queueErr) queued = true;
    } catch {
      // Email-Infrastruktur (noch) nicht eingerichtet – Anmeldung bleibt pending,
      // Admin kann sie in der Inbox sehen und manuell anstoßen.
    }

    if (!queued) {
      // Hilfreich für Entwickler-Logs solange noch keine Domain aktiv ist.
      console.info("[newsletter] confirmation pending →", data.email, confirmUrl);
    }

    // Der Bestätigungslink darf NIE an den Browser zurück, sonst ließe sich das
    // Double-Opt-In für fremde Adressen umgehen. Nur in der Entwicklung sichtbar.
    const exposeLink = !queued && process.env.NODE_ENV !== "production";
    return { ok: true, queued, confirmUrl: exposeLink ? confirmUrl : undefined } as const;
  });

/**
 * Newsletter-Bestätigung (Double-Opt-In, Schritt 2).
 */
export const confirmNewsletter = createServerFn({ method: "POST" })
  .inputValidator((raw) => ConfirmInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: selErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("confirmation_token", data.token)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);
    if (!row) return { ok: false, reason: "invalid" } as const;
    if (row.status === "confirmed") return { ok: true, alreadyConfirmed: true } as const;

    const { error: updErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmation_token: null,
      })
      .eq("id", row.id);

    if (updErr) throw new Error(updErr.message);
    return { ok: true, alreadyConfirmed: false } as const;
  });

/**
 * Newsletter-Abmeldung (1-Klick, tokenbasiert).
 * Setzt den Status auf "unsubscribed" und protokolliert den Zeitpunkt.
 */
export const unsubscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((raw) => UnsubscribeInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: selErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email, status")
      .eq("unsubscribe_token", data.token)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);
    if (!row) return { ok: false, reason: "invalid" } as const;
    if (row.status === "unsubscribed") {
      return { ok: true, alreadyUnsubscribed: true, email: row.email } as const;
    }

    const { error: updErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updErr) throw new Error(updErr.message);
    return { ok: true, alreadyUnsubscribed: false, email: row.email } as const;
  });

/**
 * Bestätigungs-Mail erneut versenden (für `pending`-Abonnenten).
 * - Liefert `notFound`, wenn die Adresse unbekannt ist.
 * - Liefert `alreadyConfirmed`, wenn der Abonnent schon bestätigt hat.
 * - Liefert `unsubscribed`, wenn die Adresse aktiv abgemeldet wurde.
 * - Andernfalls: neuer Token + neue Mail in die Queue.
 * - Throttling: max. 1 Resend pro 60 Sekunden je Adresse.
 */
export const resendNewsletterConfirmation = createServerFn({ method: "POST" })
  .inputValidator((raw) => ResendInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: selErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, status, confirmation_sent_at, unsubscribe_token")
      .eq("email", data.email)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);
    if (!row) return { ok: false, reason: "notFound" } as const;
    if (row.status === "confirmed") return { ok: false, reason: "alreadyConfirmed" } as const;
    if (row.status === "unsubscribed") return { ok: false, reason: "unsubscribed" } as const;

    // Throttling: kein neuer Versand innerhalb 60 s
    if (row.confirmation_sent_at) {
      const last = new Date(row.confirmation_sent_at).getTime();
      const secs = Math.round((Date.now() - last) / 1000);
      if (secs < 60) {
        return { ok: false, reason: "throttled", retryAfterSeconds: 60 - secs } as const;
      }
    }

    const token = randomToken();
    const now = new Date().toISOString();

    const { error: updErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        confirmation_token: token,
        confirmation_sent_at: now,
      })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);

    const headers = new Headers();
    const origin = siteOrigin(headers);
    const confirmUrl = `${origin}/newsletter/bestaetigen?token=${token}`;
    const unsubToken = (row as { unsubscribe_token: string | null }).unsubscribe_token;
    const unsubscribeUrl = unsubToken ? `${origin}/newsletter/abmelden?token=${unsubToken}` : null;

    let queued = false;
    try {
      const subject = "Erinnerung: Bitte bestätigen Sie Ihre Newsletter-Anmeldung";
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
          <h1 style="font-size:22px;margin:0 0 16px">Nur noch ein Klick zum Auto Semmel Newsletter</h1>
          <p>Sie haben uns gebeten, Ihren Bestätigungs-Link erneut zu senden. Bitte bestätigen Sie Ihre Adresse:</p>
          <p style="margin:28px 0">
            <a href="${confirmUrl}" style="background:#B90E0A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
              Anmeldung bestätigen
            </a>
          </p>
          <p style="font-size:13px;color:#555">Oder kopieren Sie diesen Link in Ihren Browser:<br>
            <span style="word-break:break-all">${confirmUrl}</span>
          </p>
          ${unsubscribeUrl ? `<hr style="border:none;border-top:1px solid #eee;margin:28px 0"><p style="font-size:12px;color:#888">Doch kein Interesse? <a href="${unsubscribeUrl}" style="color:#555">Hier abmelden</a>.</p>` : ""}
        </div>`;
      const text = `Bestätigen Sie Ihre Newsletter-Anmeldung: ${confirmUrl}${unsubscribeUrl ? `\n\nAbmelden: ${unsubscribeUrl}` : ""}`;

      const { error: queueErr } = await supabaseAdmin.rpc(
        "enqueue_email" as never,
        {
          queue_name: "transactional_emails",
          payload: {
            to: data.email,
            subject,
            html,
            text,
            template_name: "newsletter-confirm-resend",
          },
        } as never,
      );
      if (!queueErr) queued = true;
    } catch {
      // Email-Infrastruktur (noch) nicht aktiv – Token ist trotzdem erneuert.
    }

    if (!queued) {
      console.info("[newsletter] resend pending →", data.email, confirmUrl);
    }

    // Der Bestätigungslink darf NIE an den Browser zurück, sonst ließe sich das
    // Double-Opt-In für fremde Adressen umgehen. Nur in der Entwicklung sichtbar.
    const exposeLink = !queued && process.env.NODE_ENV !== "production";
    return { ok: true, queued, confirmUrl: exposeLink ? confirmUrl : undefined } as const;
  });
