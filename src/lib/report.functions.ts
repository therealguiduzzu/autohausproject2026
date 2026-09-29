import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "./auth-guards.server";
import { emptyMonths, type MonthRow } from "./report";

const monthOf = (iso: string) => Number(iso.slice(5, 7));

export const getYearReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ year: z.number().int().min(2020).max(2100) }).parse(raw))
  .handler(async ({ context, data }): Promise<MonthRow[]> => {
    await requireRole(context, ["admin", "staff"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = `${data.year}-01-01`;
    const to = `${data.year + 1}-01-01`;
    const rows = emptyMonths();
    const at = (iso: string) => rows[monthOf(iso) - 1]!;

    const [leads, appts, subs, unsubs] = await Promise.all([
      supabaseAdmin
        .from("leads")
        .select("type, created_at")
        .gte("created_at", from)
        .lt("created_at", to)
        .limit(20000),
      supabaseAdmin
        .from("workshop_appointments")
        .select("status, source, slot_date")
        .gte("slot_date", from)
        .lt("slot_date", to)
        .limit(20000),
      supabaseAdmin
        .from("newsletter_subscribers")
        .select("confirmed_at")
        .gte("confirmed_at", from)
        .lt("confirmed_at", to)
        .limit(20000),
      supabaseAdmin
        .from("newsletter_subscribers")
        .select("unsubscribed_at")
        .gte("unsubscribed_at", from)
        .lt("unsubscribed_at", to)
        .limit(20000),
    ]);
    for (const r of [leads, appts, subs, unsubs]) if (r.error) throw new Error(r.error.message);

    for (const l of leads.data ?? []) {
      const m = at(l.created_at);
      m.leads++;
      if (l.type === "Probefahrt") m.leadsProbefahrt++;
      else if (l.type === "Fahrzeugankauf") m.leadsAnkauf++;
      else m.leadsKontakt++;
    }
    for (const a of appts.data ?? []) {
      const m = at(a.slot_date);
      if (a.status === "bestaetigt") {
        m.termineBestaetigt++;
        if (a.source === "website") m.termineOnline++;
      } else m.termineAbgesagt++;
    }
    for (const s of subs.data ?? []) if (s.confirmed_at) at(s.confirmed_at).newsletterAnmeldungen++;
    for (const u of unsubs.data ?? [])
      if (u.unsubscribed_at) at(u.unsubscribed_at).newsletterAbmeldungen++;
    return rows;
  });
