import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "./auth-guards.server";

const Role = z.enum(["admin", "staff"]);

export interface TeamMember {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  roles: ("admin" | "staff")[];
}

/** Alle Konten mit ihren Rollen (nur Administratoren). */
export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    await requireRole(context, ["admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: usersData, error: uErr }, { data: roles, error: rErr }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    if (uErr) throw new Error(uErr.message);
    if (rErr) throw new Error(rErr.message);
    const byUser = new Map<string, ("admin" | "staff")[]>();
    for (const r of roles ?? []) {
      if (r.role === "admin" || r.role === "staff") {
        byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role]);
      }
    }
    return usersData.users
      .map((u) => ({
        id: u.id,
        email: u.email ?? "(ohne E-Mail)",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        roles: byUser.get(u.id) ?? [],
      }))
      .sort(
        (a, b) =>
          Number(b.roles.length > 0) - Number(a.roles.length > 0) || a.email.localeCompare(b.email),
      );
  });

/** Rolle vergeben oder entziehen. Der letzte Administrator kann sich nicht selbst entmachten. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ userId: z.string().uuid(), role: Role, enabled: z.boolean() }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.enabled && data.role === "admin") {
      const { count, error } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if (error) throw new Error(error.message);
      if ((count ?? 0) <= 1) return { ok: false, reason: "lastAdmin" } as const;
      if (data.userId === context.userId) return { ok: false, reason: "self" } as const;
    }

    if (data.enabled) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true } as const;
  });

/** Mitarbeitende per E-Mail einladen (Supabase-Einladungsmail) und Rolle zuweisen. */
export const inviteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255), role: Role }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    await requireRole(context, ["admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const site = (process.env.VITE_SITE_URL ?? process.env.SITE_URL ?? "").replace(/\/+$/, "");

    let userId: string | null = null;
    let invited = false;
    const { data: inv, error: invErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      site ? { redirectTo: `${site}/auth` } : undefined,
    );
    if (!invErr && inv.user) {
      userId = inv.user.id;
      invited = true;
    } else {
      // Konto existiert evtl. schon → nur Rolle zuweisen
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      userId = list?.users.find((u) => u.email?.toLowerCase() === data.email)?.id ?? null;
      if (!userId)
        return { ok: false, reason: invErr?.message ?? "Einladung fehlgeschlagen" } as const;
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true, invited } as const;
  });
