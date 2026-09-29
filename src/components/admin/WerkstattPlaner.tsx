import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteAppointment,
  adminSaveAppointment,
  adminSetAppointmentStatus,
  getCalendarFeedUrl,
} from "@/lib/workshop.functions";
import {
  WORKSHOP_CAPACITY_PER_SLOT,
  WORKSHOP_CATEGORIES,
  WORKSHOP_SLOTS,
  addDays,
  berlinToday,
  formatDayLong,
  formatDayShort,
  mondayOf,
  type WorkshopCategory,
} from "@/lib/workshop";
import type { Database } from "@/integrations/supabase/types";

type Appointment = Database["public"]["Tables"]["workshop_appointments"]["Row"];

interface Draft {
  id?: string;
  date: string;
  time: string;
  service: string;
  category: WorkshopCategory;
  vehicle: string;
  name: string;
  email: string;
  phone: string;
  status?: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  inspektion: "border-sky-200 bg-sky-50 text-sky-900",
  hu_au: "border-violet-200 bg-violet-50 text-violet-900",
  reifen: "border-emerald-200 bg-emerald-50 text-emerald-900",
  sonstiges: "border-amber-200 bg-amber-50 text-amber-900",
};

const SLOT_ERRORS: Record<string, string> = {
  slotFull: "Dieser Slot ist bereits voll belegt.",
};

function notifyResult(res: { mailed: boolean }, hasEmail: boolean) {
  if (res.mailed) toast.success("Gespeichert – Kunde per E-Mail informiert.");
  else if (!hasEmail) toast.success("Gespeichert (keine Kunden-E-Mail hinterlegt).");
  else
    toast.warning("Gespeichert, aber die E-Mail konnte nicht gesendet werden.", {
      description: "Ist SMTP eingerichtet? (siehe „E-Mail-Queue“)",
    });
}

export default function WerkstattPlaner() {
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => mondayOf(berlinToday()));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const days = [0, 1, 2, 3, 4].map((i) => addDays(weekStart, i));

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["workshop", weekStart],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("workshop_appointments")
        .select("*")
        .gte("slot_date", weekStart)
        .lte("slot_date", addDays(weekStart, 4))
        .order("slot_time");
      if (err) throw err;
      return data as Appointment[];
    },
  });

  const { data: feed } = useQuery({
    queryKey: ["workshop-feed"],
    queryFn: () => getCalendarFeedUrl(),
    staleTime: Infinity,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["workshop"] });

  const save = useMutation({
    mutationFn: (d: Draft) =>
      adminSaveAppointment({
        data: {
          id: d.id,
          date: d.date,
          time: d.time as (typeof WORKSHOP_SLOTS)[number],
          service: d.service,
          category: d.category,
          vehicle: d.vehicle,
          name: d.name,
          email: d.email,
          phone: d.phone,
        },
      }),
    onSuccess: (res, d) => {
      if (!res.ok) return setError(SLOT_ERRORS[res.reason] ?? res.reason);
      notifyResult(res, !!d.email);
      setDraft(null);
      refresh();
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen."),
  });

  const setStatus = useMutation({
    mutationFn: (v: { a: Appointment; status: "bestaetigt" | "abgesagt" }) =>
      adminSetAppointmentStatus({ data: { id: v.a.id, status: v.status } }),
    onSuccess: (res, v) => {
      if (!res.ok) return setError(SLOT_ERRORS[res.reason] ?? res.reason);
      notifyResult(res, !!v.a.customer_email);
      setDraft(null);
      refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (a: Appointment) => adminDeleteAppointment({ data: { id: a.id } }),
    onSuccess: (res, a) => {
      notifyResult(res, !!a.customer_email);
      setDraft(null);
      refresh();
    },
  });

  const active = appointments.filter((a) => a.status === "bestaetigt");
  const at = (date: string, time: string) =>
    appointments.filter((a) => a.slot_date === date && a.slot_time === time);

  const openCreate = (date: string, time: string) => {
    setError(null);
    setDraft({
      date,
      time,
      service: "",
      category: "sonstiges",
      vehicle: "",
      name: "",
      email: "",
      phone: "",
    });
  };
  const openEdit = (a: Appointment) => {
    setError(null);
    setDraft({
      id: a.id,
      date: a.slot_date,
      time: a.slot_time,
      service: a.service,
      category: a.category as WorkshopCategory,
      vehicle: a.vehicle,
      name: a.customer_name,
      email: a.customer_email ?? "",
      phone: a.customer_phone ?? "",
      status: a.status,
    });
  };

  const submit = () => {
    if (!draft) return;
    if (!draft.service.trim() || !draft.name.trim()) {
      return setError("Bitte Service und Kundenname eintragen.");
    }
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      return setError("Bitte eine gültige E-Mail eintragen (oder leer lassen).");
    }
    setError(null);
    save.mutate({ ...draft, email: draft.email.trim() });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Vorherige Woche"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="rounded-lg border border-border/70 p-2 hover:border-primary/40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDayShort(days[0]!)} – {formatDayShort(days[4]!)} ·{" "}
            <span className="font-semibold text-foreground">{active.length}</span> Termine
          </div>
          <button
            type="button"
            aria-label="Nächste Woche"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="rounded-lg border border-border/70 p-2 hover:border-primary/40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(mondayOf(berlinToday()))}
            className="text-xs text-primary underline"
          >
            Heute
          </button>
        </div>
        <button
          type="button"
          onClick={() => openCreate(days[0]!, WORKSHOP_SLOTS[0])}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Termin eintragen
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/50">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="w-20 px-3 py-3">Zeit</th>
              {days.map((d) => (
                <th key={d} className="px-3 py-3">
                  {formatDayShort(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WORKSHOP_SLOTS.map((t) => (
              <tr key={t} className="border-b border-border/40 align-top last:border-0">
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{t}</td>
                {days.map((d) => {
                  const list = at(d, t);
                  const taken = list.filter((a) => a.status === "bestaetigt").length;
                  return (
                    <td key={d} className="px-2 py-2">
                      <div className="space-y-1.5">
                        {list.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => openEdit(a)}
                            className={`block w-full rounded-lg border px-2.5 py-2 text-left text-xs transition hover:shadow ${
                              a.status === "abgesagt"
                                ? "border-border bg-muted/40 text-muted-foreground line-through"
                                : CATEGORY_STYLE[a.category]
                            }`}
                          >
                            <span className="block font-semibold">{a.service}</span>
                            <span className="block truncate">
                              {a.customer_name}
                              {a.vehicle ? ` · ${a.vehicle}` : ""}
                            </span>
                            {a.source === "website" && (
                              <span className="text-[10px] uppercase tracking-wider opacity-70">
                                online gebucht
                              </span>
                            )}
                          </button>
                        ))}
                        {taken < WORKSHOP_CAPACITY_PER_SLOT && (
                          <button
                            type="button"
                            onClick={() => openCreate(d, t)}
                            className="w-full rounded-lg border border-dashed border-border/60 py-1.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary"
                          >
                            + frei ({WORKSHOP_CAPACITY_PER_SLOT - taken})
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <p className="px-4 py-3 text-xs text-muted-foreground">Lade Termine …</p>}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/50 p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <Link2 className="h-4 w-4 text-primary" /> Kalender abonnieren (Google / Apple / Outlook)
        </p>
        {feed?.url ? (
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-muted/60 px-2 py-1 text-xs">
              {feed.url}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(feed.url!);
                toast.success("Link kopiert.");
              }}
              className="rounded-lg border border-border/70 p-2 hover:border-primary/40"
              aria-label="Link kopieren"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Nicht eingerichtet. Zum Aktivieren die Umgebungsvariable{" "}
            <code className="rounded bg-muted/60 px-1">WORKSHOP_CALENDAR_TOKEN</code> (mind. 24
            Zeichen) setzen. Der Link ist geheim: Wer ihn kennt, sieht die Termine.
          </p>
        )}
      </div>

      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setDraft(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Termin bearbeiten"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {draft.id ? "Termin bearbeiten" : "Neuer Termin"}
                </p>
                <h3 className="font-display text-lg font-semibold">
                  {formatDayLong(draft.date)}, {draft.time} Uhr
                </h3>
              </div>
              <button type="button" onClick={() => setDraft(null)} aria-label="Schließen">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium">
                Datum
                <input
                  type="date"
                  className="input mt-1 w-full"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <label className="text-xs font-medium">
                Uhrzeit
                <select
                  className="input mt-1 w-full"
                  value={draft.time}
                  onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                >
                  {WORKSHOP_SLOTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium">
                Service
                <input
                  className="input mt-1 w-full"
                  value={draft.service}
                  onChange={(e) => setDraft({ ...draft, service: e.target.value })}
                  placeholder="z. B. Inspektion"
                />
              </label>
              <label className="text-xs font-medium">
                Kategorie
                <select
                  className="input mt-1 w-full"
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value as WorkshopCategory })
                  }
                >
                  {WORKSHOP_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium sm:col-span-2">
                Fahrzeug / Kennzeichen
                <input
                  className="input mt-1 w-full"
                  value={draft.vehicle}
                  onChange={(e) => setDraft({ ...draft, vehicle: e.target.value })}
                />
              </label>
              <label className="text-xs font-medium">
                Kunde
                <input
                  className="input mt-1 w-full"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label className="text-xs font-medium">
                Telefon
                <input
                  className="input mt-1 w-full"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                />
              </label>
              <label className="text-xs font-medium sm:col-span-2">
                E-Mail (für Benachrichtigung)
                <input
                  type="email"
                  className="input mt-1 w-full"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </label>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              Bei Speichern, Verschieben, Absagen und Löschen erhält der Kunde eine E-Mail (sofern
              hinterlegt).
            </p>
            {error && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                {draft.id && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const a = appointments.find((x) => x.id === draft.id)!;
                        setStatus.mutate({
                          a,
                          status: a.status === "abgesagt" ? "bestaetigt" : "abgesagt",
                        });
                      }}
                      className="rounded-lg border border-border/70 px-3 py-2 text-xs font-semibold hover:border-primary/40"
                    >
                      {draft.status === "abgesagt" ? "Reaktivieren" : "Absagen"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Termin endgültig löschen?")) {
                          remove.mutate(appointments.find((x) => x.id === draft.id)!);
                        }
                      }}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Löschen
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={save.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {save.isPending ? "Speichern …" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
