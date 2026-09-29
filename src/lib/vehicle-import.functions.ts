import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  text: z.string().min(1).max(2_000_000),
  dryRun: z.boolean().default(true),
  markMissingSold: z.boolean().default(false),
});

/** Import aus dem Admin-Bereich (Personal: admin oder staff). */
export const importVehiclesFromAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => Input.parse(raw))
  .handler(async ({ context, data }) => {
    const { data: roles, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    if (!(roles ?? []).some((r) => r.role === "admin" || r.role === "staff")) {
      throw new Error("Forbidden");
    }
    const { runVehicleImport } = await import("./vehicle-import.server");
    return runVehicleImport(data.text, { ...data, source: "admin" });
  });
