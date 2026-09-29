import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteTeamMember, listTeam, setUserRole } from "@/lib/team.functions";

const ROLE_LABEL = { admin: "Administrator", staff: "Mitarbeiter/in" } as const;

export default function TeamManager({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const {
    data: team = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["team"],
    queryFn: () => listTeam(),
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  const toggle = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "staff"; enabled: boolean }) =>
      setUserRole({ data: v }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "lastAdmin"
            ? "Der letzte Administrator kann nicht entfernt werden."
            : "Sie können sich nicht selbst die Administratorrolle entziehen.",
        );
      }
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: () => toast.error("Änderung fehlgeschlagen."),
  });

  const invite = useMutation({
    mutationFn: () => inviteTeamMember({ data: { email, role } }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(`Einladung fehlgeschlagen: ${res.reason}`);
      toast.success(
        res.invited
          ? "Einladung per E-Mail gesendet."
          : "Konto existierte bereits – Rolle wurde zugewiesen.",
      );
      setEmail("");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: () => toast.error("Einladung fehlgeschlagen."),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">Mitarbeitende einladen</h3>
            <p className="text-xs text-muted-foreground">
              <strong>Mitarbeiter/in:</strong> Fahrzeuge, Anfragen, Termine, Bewertungen.{" "}
              <strong>Administrator:</strong> zusätzlich Team, Newsletter-Versand, Stellen.
            </p>
          </div>
        </div>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
        >
          <label className="min-w-64 flex-1 text-xs font-medium">
            E-Mail
            <input
              type="email"
              required
              className="input mt-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@auto-semmel.de"
            />
          </label>
          <label className="text-xs font-medium">
            Rolle
            <select
              className="input mt-1"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "staff")}
            >
              <option value="staff">Mitarbeiter/in</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          <button
            disabled={invite.isPending || !email}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Mail className="h-4 w-4" /> Einladen
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
        <div className="border-b border-border/60 px-6 py-4">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" /> Konten &amp; Rollen
          </h3>
        </div>
        {isLoading && <p className="px-6 py-4 text-sm text-muted-foreground">Lade …</p>}
        {error && (
          <p className="px-6 py-4 text-sm text-red-700">Konten konnten nicht geladen werden.</p>
        )}
        <ul className="divide-y divide-border/40">
          {team.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {m.email}
                  {m.id === currentUserId && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Sie
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Letzter Login:{" "}
                  {m.lastSignInAt ? new Date(m.lastSignInAt).toLocaleString("de-DE") : "noch nie"}
                </p>
              </div>
              <div className="flex gap-4">
                {(["staff", "admin"] as const).map((r) => (
                  <label key={r} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--primary)]"
                      checked={m.roles.includes(r)}
                      disabled={toggle.isPending}
                      onChange={(e) =>
                        toggle.mutate({ userId: m.id, role: r, enabled: e.target.checked })
                      }
                    />
                    {ROLE_LABEL[r]}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="border-t border-border/60 px-6 py-3 text-[11px] text-muted-foreground">
          Konten ohne Rolle (z. B. Selbstregistrierungen) haben keinen Zugriff auf den
          Verwaltungsbereich.
        </p>
      </div>
    </div>
  );
}
