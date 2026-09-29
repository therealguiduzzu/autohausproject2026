import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "./auth-guards.server";
import { BUYBACK_BUCKET, BUYBACK_PATH_RE, MAX_BUYBACK_PHOTOS } from "./buyback-photos";

/** Öffentlich: liefert kurzlebige, signierte Upload-Ziele (Bucket ist privat, 5 MB, nur Bilder). */
export const createBuybackUploadUrls = createServerFn({ method: "POST" })
  .inputValidator((raw) =>
    z.object({ count: z.number().int().min(1).max(MAX_BUYBACK_PHOTOS) }).parse(raw),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const targets: { path: string; token: string }[] = [];
    for (let i = 0; i < data.count; i++) {
      const path = `pending/${crypto.randomUUID().replace(/-/g, "")}.jpg`;
      const { data: signed, error } = await supabaseAdmin.storage
        .from(BUYBACK_BUCKET)
        .createSignedUploadUrl(path);
      if (error || !signed) throw new Error(error?.message ?? "Upload-URL fehlgeschlagen");
      targets.push({ path, token: signed.token });
    }
    return targets;
  });

const Paths = z.object({
  paths: z.array(z.string().regex(BUYBACK_PATH_RE)).max(MAX_BUYBACK_PHOTOS),
});

/** Personal: temporäre Anzeige-Links (1 Stunde gültig). */
export const getBuybackPhotoUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => Paths.parse(raw))
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin", "staff"]);
    if (data.paths.length === 0) return [] as string[];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUYBACK_BUCKET)
      .createSignedUrls(data.paths, 3600);
    if (error) throw new Error(error.message);
    return (signed ?? []).map((s) => s.signedUrl).filter(Boolean) as string[];
  });

/** Personal: Fotos löschen (beim Löschen einer Anfrage – Datensparsamkeit). */
export const deleteBuybackPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => Paths.parse(raw))
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin", "staff"]);
    if (data.paths.length === 0) return { ok: true } as const;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from(BUYBACK_BUCKET).remove(data.paths);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });
