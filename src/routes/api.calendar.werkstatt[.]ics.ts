import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { addDays, berlinToday, buildIcs } from "@/lib/workshop";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Abonnierbarer Kalender (Google/Apple/Outlook): /api/calendar/werkstatt.ics?token=…
 * Token = Umgebungsvariable WORKSHOP_CALENDAR_TOKEN (mind. 24 Zeichen).
 */
export const Route = createFileRoute("/api/calendar/werkstatt.ics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env.WORKSHOP_CALENDAR_TOKEN;
        if (!expected || expected.length < 24) {
          return new Response("Kalender-Feed nicht konfiguriert.", { status: 503 });
        }
        const token = new URL(request.url).searchParams.get("token") ?? "";
        if (!safeEqual(token, expected)) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const today = berlinToday();
        const { data, error } = await supabaseAdmin
          .from("workshop_appointments")
          .select("*")
          .gte("slot_date", addDays(today, -30))
          .lte("slot_date", addDays(today, 180))
          .eq("status", "bestaetigt");
        if (error) return new Response("Fehler", { status: 500 });

        return new Response(buildIcs(data ?? []), {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "private, max-age=300",
          },
        });
      },
    },
  },
});
