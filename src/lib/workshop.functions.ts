import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "./auth-guards.server";
import { SITE_URL } from "./site";
import {
  WORKSHOP_CAPACITY_PER_SLOT,
  WORKSHOP_SLOTS,
  berlinToday,
  categoryFromService,
  formatDayLong,
  isBookableDate,
  type WorkshopCategory,
} from "./workshop";

const cancelUrl = (token: string) => `${SITE_URL}/termin/absagen?token=${token}`;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const slotTime = z.enum(WORKSHOP_SLOTS);
const category = z.enum(["inspektion", "hu_au", "reifen", "sonstiges"]);
const optionalEmail = z.string().trim().email().max(255).optional().or(z.literal(""));

/* ------------------------------------------------ öffentlich: Verfügbarkeit */

export type WorkshopAvailability = Record<string, Record<string, number>>;

export const getWorkshopAvailability = createServerFn({ method: "GET" })
  .inputValidator((raw) => z.object({ dates: z.array(isoDate).min(1).max(30) }).parse(raw))
  .handler(async ({ data }): Promise<WorkshopAvailability> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("workshop_appointments")
      .select("slot_date, slot_time")
      .in("slot_date", data.dates)
      .eq("status", "bestaetigt");
    if (error) throw new Error(error.message);

    const result: WorkshopAvailability = {};
    for (const d of data.dates) {
      result[d] = {};
      for (const t of WORKSHOP_SLOTS) result[d]![t] = WORKSHOP_CAPACITY_PER_SLOT;
    }
    for (const r of rows ?? []) {
      const day = result[r.slot_date];
      if (day && r.slot_time in day) day[r.slot_time] = Math.max(0, day[r.slot_time]! - 1);
    }
    return result;
  });

/* ---------------------------------------------------- öffentlich: Buchung */

const BookInput = z.object({
  date: isoDate,
  time: slotTime,
  service: z.string().trim().min(1).max(120),
  vehicle: z.string().trim().max(200).default(""),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(50),
  consent: z.literal(true),
});

export const bookWorkshopAppointment = createServerFn({ method: "POST" })
  .inputValidator((raw) => BookInput.parse(raw))
  .handler(async ({ data }) => {
    if (!isBookableDate(data.date)) return { ok: false, reason: "invalidDate" } as const;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Missbrauchsschutz: max. 3 Online-Buchungen je Kontakt in 10 Minuten
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const recent = (col: "customer_email" | "customer_phone", value: string) =>
      supabaseAdmin
        .from("workshop_appointments")
        .select("id", { count: "exact", head: true })
        .eq("source", "website")
        .gte("created_at", since)
        .eq(col, value);
    const [byEmail, byPhone] = await Promise.all([
      recent("customer_email", data.email),
      recent("customer_phone", data.phone),
    ]);
    const count = Math.max(byEmail.count ?? 0, byPhone.count ?? 0);
    if (count >= 3) return { ok: false, reason: "rateLimited" } as const;

    const { data: created, error } = await supabaseAdmin
      .from("workshop_appointments")
      .insert({
        slot_date: data.date,
        slot_time: data.time,
        service: data.service,
        category: categoryFromService(data.service),
        vehicle: data.vehicle,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        status: "bestaetigt",
        source: "website",
        consent_given: true,
      })
      .select("cancel_token")
      .single();
    if (error) {
      if (error.message.includes("slot_full")) return { ok: false, reason: "slotFull" } as const;
      throw new Error(error.message);
    }

    const { sendAppointmentMails } = await import("./workshop-mail.server");
    await sendAppointmentMails(
      "created",
      {
        slot_date: data.date,
        slot_time: data.time,
        service: data.service,
        vehicle: data.vehicle,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
      },
      { cancelUrl: cancelUrl(created.cancel_token) },
    );
    return { ok: true } as const;
  });

/* ------------------------------------------------------- Admin (Personal) */

const SaveInput = z.object({
  id: z.string().uuid().optional(),
  date: isoDate,
  time: slotTime,
  service: z.string().trim().min(1).max(120),
  category,
  vehicle: z.string().trim().max(200).default(""),
  name: z.string().trim().min(1).max(200),
  email: optionalEmail,
  phone: z.string().trim().max(50).optional(),
});

export const adminSaveAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => SaveInput.parse(raw))
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin", "staff"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAppointmentMails } = await import("./workshop-mail.server");

    const fields = {
      slot_date: data.date,
      slot_time: data.time,
      service: data.service,
      category: data.category as WorkshopCategory,
      vehicle: data.vehicle,
      customer_name: data.name,
      customer_email: data.email || null,
      customer_phone: data.phone || null,
    };
    const mailData = {
      slot_date: data.date,
      slot_time: data.time,
      service: data.service,
      vehicle: data.vehicle,
      customer_name: data.name,
      customer_email: data.email || null,
      customer_phone: data.phone || null,
    };

    if (!data.id) {
      const { data: created, error } = await supabaseAdmin
        .from("workshop_appointments")
        .insert({ ...fields, status: "bestaetigt", source: "admin", consent_given: !!data.email })
        .select("cancel_token")
        .single();
      if (error)
        return {
          ok: false,
          reason: error.message.includes("slot_full") ? "slotFull" : error.message,
        } as const;
      const mailed = await sendAppointmentMails("created", mailData, {
        team: false,
        cancelUrl: cancelUrl(created.cancel_token),
      });
      return { ok: true, mailed } as const;
    }

    const { data: prev, error: pErr } = await supabaseAdmin
      .from("workshop_appointments")
      .select("slot_date, slot_time, cancel_token")
      .eq("id", data.id)
      .single();
    if (pErr) throw new Error(pErr.message);
    const { error } = await supabaseAdmin
      .from("workshop_appointments")
      .update(fields)
      .eq("id", data.id);
    if (error)
      return {
        ok: false,
        reason: error.message.includes("slot_full") ? "slotFull" : error.message,
      } as const;
    const moved = prev.slot_date !== data.date || prev.slot_time !== data.time;
    const mailed = await sendAppointmentMails(moved ? "rescheduled" : "updated", mailData, {
      team: false,
      cancelUrl: cancelUrl(prev.cancel_token),
      previous: moved ? `${formatDayLong(prev.slot_date)}, ${prev.slot_time} Uhr` : undefined,
    });
    return { ok: true, mailed } as const;
  });

export const adminSetAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ id: z.string().uuid(), status: z.enum(["bestaetigt", "abgesagt"]) }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin", "staff"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("workshop_appointments")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) {
      return {
        ok: false,
        reason: error.message.includes("slot_full") ? "slotFull" : error.message,
      } as const;
    }
    const { sendAppointmentMails } = await import("./workshop-mail.server");
    const mailed = await sendAppointmentMails(
      data.status === "abgesagt" ? "cancelled" : "reactivated",
      row,
      { team: false, cancelUrl: cancelUrl(row.cancel_token) },
    );
    return { ok: true, mailed } as const;
  });

export const adminDeleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin", "staff"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("workshop_appointments")
      .delete()
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { sendAppointmentMails } = await import("./workshop-mail.server");
    const mailed = await sendAppointmentMails("deleted", row, { team: false });
    return { ok: true, mailed } as const;
  });

/** Abo-URL des Kalender-Feeds (enthält das geheime Token, daher nur für Personal). */
export const getCalendarFeedUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context, ["admin", "staff"]);
    const token = process.env.WORKSHOP_CALENDAR_TOKEN;
    if (!token || token.length < 24) return { url: null } as const;
    const base = (process.env.VITE_SITE_URL ?? process.env.SITE_URL ?? "").replace(/\/+$/, "");
    return { url: `${base}/api/calendar/werkstatt.ics?token=${token}` } as const;
  });

/* ------------------------------------------- öffentlich: Absage per Link */

const TokenInput = z.object({ token: z.string().min(32).max(128) });

export const getAppointmentByToken = createServerFn({ method: "GET" })
  .inputValidator((raw) => TokenInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("workshop_appointments")
      .select("service, slot_date, slot_time, status")
      .eq("cancel_token", data.token)
      .maybeSingle();
    if (!row) return { found: false } as const;
    return {
      found: true,
      service: row.service,
      date: row.slot_date,
      time: row.slot_time,
      status: row.status,
      // Absage online bis zum Vortag; danach bitte telefonisch
      canCancel: row.status === "bestaetigt" && row.slot_date > berlinToday(),
    } as const;
  });

export const cancelAppointmentByToken = createServerFn({ method: "POST" })
  .inputValidator((raw) => TokenInput.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("workshop_appointments")
      .select("*")
      .eq("cancel_token", data.token)
      .maybeSingle();
    if (!row) return { ok: false, reason: "notFound" } as const;
    if (row.status !== "bestaetigt") return { ok: false, reason: "alreadyCancelled" } as const;
    if (row.slot_date <= berlinToday()) return { ok: false, reason: "tooLate" } as const;

    const { error } = await supabaseAdmin
      .from("workshop_appointments")
      .update({ status: "abgesagt" })
      .eq("id", row.id);
    if (error) throw new Error(error.message);

    const { sendAppointmentMails } = await import("./workshop-mail.server");
    await sendAppointmentMails("cancelledByCustomer", row);
    return { ok: true } as const;
  });
