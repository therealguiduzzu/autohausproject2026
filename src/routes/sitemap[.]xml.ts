import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL, DEMO_MODE } from "@/lib/site";

const BASE_URL = SITE_URL;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        if (DEMO_MODE) {
          return new Response(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
            { headers: { "Content-Type": "application/xml" } },
          );
        }
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/impressum", changefreq: "yearly", priority: "0.3" },
          { path: "/datenschutz", changefreq: "yearly", priority: "0.3" },
        ];

        // Fetch published vehicles from DB (best-effort — sitemap should never fail the build).
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data } = await supabaseAdmin
            .from("vehicles")
            .select("id, slug, status, updated_at")
            .neq("status", "Verkauft");
          for (const v of data ?? []) {
            const slugOrId = v.slug ?? v.id;
            entries.push({
              path: `/fahrzeug/${slugOrId}`,
              lastmod: v.updated_at ? new Date(v.updated_at).toISOString().slice(0, 10) : undefined,
              changefreq: "weekly",
              priority: "0.8",
            });
          }
        } catch {
          // ignore — return the static entries
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
