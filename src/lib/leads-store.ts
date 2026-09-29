import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getQueryClient } from "./query-client-ref";
import { isHoneypotFilled } from "./honeypot";
import type { Database } from "@/integrations/supabase/types";

export type LeadType = "Probefahrt" | "Werkstattermin" | "Fahrzeugankauf" | "Kontakt";
export type LeadStatus = "Neu" | "In Bearbeitung" | "Erledigt";

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  createdAt: number;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  details: Record<string, string>;
}

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

function mapLeadRow(row: LeadRow): Lead {
  const rawDetails = (row.details ?? {}) as Record<string, unknown>;
  const details: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawDetails)) {
    if (v == null) continue;
    details[k] = String(v);
  }
  return {
    id: row.id,
    type: row.type as LeadType,
    status: row.status as LeadStatus,
    createdAt: new Date(row.created_at).getTime(),
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    subject: row.subject,
    details,
  };
}

export const LEADS_QUERY_KEY = ["leads"] as const;

async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapLeadRow);
}

export function useLeads(): Lead[] {
  const { data } = useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: fetchLeads,
    staleTime: 15_000,
  });
  return data ?? [];
}

function invalidateLeads() {
  getQueryClient()?.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
}

export interface NewLeadInput {
  type: LeadType;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  details: Record<string, string>;
  vehicleId?: string;
}

const LEAD_COOLDOWN_KEY = "auto-semmel-last-lead";
const LEAD_COOLDOWN_MS = 15_000;

export const leadsStore = {
  add: async (input: NewLeadInput) => {
    if (typeof window !== "undefined") {
      // Spam-Schutz 1: Honeypot befüllt -> Bot. Stillschweigend "erfolgreich" beenden.
      if (isHoneypotFilled()) return;
      // Spam-Schutz 2: Abkühlzeit je Browser, gegen Doppelklicks und einfache Skripte.
      try {
        const last = Number(window.localStorage.getItem(LEAD_COOLDOWN_KEY) ?? 0);
        if (Date.now() - last < LEAD_COOLDOWN_MS) {
          throw new Error("Bitte warten Sie einen Moment, bevor Sie eine weitere Anfrage senden.");
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("Bitte warten")) throw e;
      }
    }
    const { submitLead } = await import("./leads.functions");
    const result = await submitLead({
      data: {
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        details: input.details,
        vehicleId: input.vehicleId,
        sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        consent: true,
      },
    });
    if (!result.ok) {
      throw new Error("Bitte warten Sie einen Moment, bevor Sie eine weitere Anfrage senden.");
    }
    try {
      window.localStorage.setItem(LEAD_COOLDOWN_KEY, String(Date.now()));
    } catch {
      /* localStorage nicht verfügbar – Server-Limit greift trotzdem */
    }
    invalidateLeads();
  },
  setStatus: async (id: string, status: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    invalidateLeads();
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    invalidateLeads();
    if (error) throw error;
  },
};

/** Bearbeitungsfrist für neue Anfragen (Stunden). */
export const LEAD_SLA_HOURS = 24;

/** Neue Anfrage, die länger als die Frist unbearbeitet ist. */
export function isLeadOverdue(lead: Pick<Lead, "status" | "createdAt">, now = Date.now()): boolean {
  return lead.status === "Neu" && now - lead.createdAt > LEAD_SLA_HOURS * 3_600_000;
}
