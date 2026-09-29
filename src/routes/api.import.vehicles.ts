import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/** Konstantzeit-Vergleich gegen Timing-Angriffe. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

/**
 * POST /api/import/vehicles
 *   Authorization: Bearer <IMPORT_API_TOKEN>
 *   Body: CSV (text/csv) oder JSON ({ "vehicles": [...] })
 *   Query: ?dryRun=1  ?markMissingSold=1
 */
export const Route = createFileRoute("/api/import/vehicles")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.IMPORT_API_TOKEN;
        if (!token || token.length < 24) {
          return json({ error: "Import-API nicht konfiguriert (IMPORT_API_TOKEN)." }, 503);
        }
        const auth = request.headers.get("authorization") ?? "";
        const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!safeEqual(given, token)) return json({ error: "Unauthorized" }, 401);

        const url = new URL(request.url);
        const flag = (k: string) => ["1", "true"].includes(url.searchParams.get(k) ?? "");
        try {
          const { runVehicleImport } = await import("@/lib/vehicle-import.server");
          const summary = await runVehicleImport(await request.text(), {
            dryRun: flag("dryRun"),
            markMissingSold: flag("markMissingSold"),
            source: "api",
          });
          return json(summary);
        } catch (e) {
          console.error("[vehicle-import]", e);
          return json({ error: e instanceof Error ? e.message : "Import fehlgeschlagen" }, 400);
        }
      },
    },
  },
});
