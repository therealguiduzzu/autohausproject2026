import type { SupabaseClient } from "@supabase/supabase-js";

/** Wirft "Forbidden", wenn der Benutzer keine der Rollen hat. Nur mit requireSupabaseAuth verwenden. */
export async function requireRole(
  ctx: { supabase: SupabaseClient; userId: string },
  allowed: ("admin" | "staff")[],
): Promise<void> {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  if (!(data ?? []).some((r) => (allowed as string[]).includes(r.role))) {
    throw new Error("Forbidden");
  }
}
