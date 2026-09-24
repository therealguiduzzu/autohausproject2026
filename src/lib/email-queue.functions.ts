import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EmailQueueItem = {
  source: "queue" | "log" | "newsletter";
  messageId: string;
  recipient: string | null;
  subject: string | null;
  templateName: string | null;
  status: "pending" | "sent" | "failed" | "dlq" | "suppressed" | "bounced" | "complained";
  error: string | null;
  createdAt: string;
  history?: Array<{ status: string; at: string; error: string | null }>;
};

export type EmailQueueOverview = {
  infraReady: boolean;
  stats: {
    pending: number;
    sent: number;
    failed: number;
    suppressed: number;
    total: number;
  };
  items: EmailQueueItem[];
  notice?: string;
};

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

export const getEmailQueueOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    if (!(await isAdmin(supabase, userId))) {
      throw new Error("Forbidden");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const overview: EmailQueueOverview = {
      infraReady: false,
      stats: { pending: 0, sent: 0, failed: 0, suppressed: 0, total: 0 },
      items: [],
    };

    // 1) email_send_log (Source of Truth, falls Email-Infrastruktur aktiv ist)
    let logRows:
      | Array<{
          message_id: string | null;
          template_name: string | null;
          recipient_email: string | null;
          status: string;
          error_message: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        }>
      | null = null;

    try {
      const { data, error } = await supabaseAdmin
        .from("email_send_log" as never)
        .select("message_id, template_name, recipient_email, status, error_message, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error && data) {
        overview.infraReady = true;
        logRows = data as unknown as Array<{
          message_id: string | null;
          template_name: string | null;
          recipient_email: string | null;
          status: string;
          error_message: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        }>;
      }
    } catch {
      /* Tabelle existiert nicht – Infrastruktur noch nicht initialisiert. */
    }

    type LogRow = {
      message_id: string | null;
      template_name: string | null;
      recipient_email: string | null;
      status: string;
      error_message: string | null;
      metadata: Record<string, unknown> | null;
      created_at: string;
    };

    if (logRows && logRows.length > 0) {
      const byMsg = new Map<string, LogRow[]>();
      for (const row of logRows as LogRow[]) {
        const key = row.message_id ?? `${row.recipient_email}-${row.created_at}`;
        const arr = byMsg.get(key) ?? [];
        arr.push(row);
        byMsg.set(key, arr);
      }

      for (const [msgId, rows] of byMsg) {
        const latest = rows[0]!;
        const subj =
          (latest.metadata && (latest.metadata as Record<string, unknown>).subject) as
            | string
            | undefined;
        const mapped: EmailQueueItem = {
          source: "log",
          messageId: msgId,
          recipient: latest.recipient_email,
          subject: subj ?? null,
          templateName: latest.template_name,
          status: normalizeStatus(latest.status),
          error: latest.error_message,
          createdAt: latest.created_at,
          history: rows
            .slice()
            .reverse()
            .map((r) => ({ status: r.status, at: r.created_at, error: r.error_message })),
        };
        overview.items.push(mapped);
        bumpStats(overview.stats, mapped.status);
      }
    }

    // 2) Pending Newsletter-Anmeldungen (immer verfügbar, eigener Workflow).
    const { data: pendingSubs } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email, status, confirmation_sent_at, confirmed_at, unsubscribed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (pendingSubs) {
      for (const s of pendingSubs) {
        const status: EmailQueueItem["status"] =
          s.status === "confirmed" ? "sent" : s.status === "unsubscribed" ? "suppressed" : "pending";
        overview.items.push({
          source: "newsletter",
          messageId: `nl-${s.id}`,
          recipient: s.email,
          subject:
            s.status === "confirmed"
              ? "Newsletter-Anmeldung bestätigt"
              : "Bitte bestätigen Sie Ihre Newsletter-Anmeldung",
          templateName: "newsletter-confirm",
          status,
          error: null,
          createdAt: s.confirmation_sent_at ?? s.created_at,
          history: [
            { status: "pending", at: s.confirmation_sent_at ?? s.created_at, error: null },
            ...(s.confirmed_at ? [{ status: "sent", at: s.confirmed_at, error: null }] : []),
            ...(s.unsubscribed_at
              ? [{ status: "suppressed", at: s.unsubscribed_at, error: null }]
              : []),
          ],
        });
        bumpStats(overview.stats, status);
      }
    }

    overview.items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    overview.stats.total = overview.items.length;

    if (!overview.infraReady) {
      overview.notice =
        "Die Lovable-E-Mail-Infrastruktur ist noch nicht aktiviert. Sobald die Sender-Domain eingerichtet ist, erscheinen hier alle ausgehenden Mails inkl. Statusverlauf aus email_send_log.";
    }

    return overview;
  });

function normalizeStatus(raw: string): EmailQueueItem["status"] {
  const s = raw.toLowerCase();
  if (["sent", "delivered"].includes(s)) return "sent";
  if (["dlq", "failed"].includes(s)) return "failed";
  if (s === "suppressed") return "suppressed";
  if (s === "bounced") return "bounced";
  if (s === "complained") return "complained";
  return "pending";
}

function bumpStats(stats: EmailQueueOverview["stats"], status: EmailQueueItem["status"]) {
  if (status === "sent") stats.sent++;
  else if (status === "failed" || status === "dlq" || status === "bounced") stats.failed++;
  else if (status === "suppressed" || status === "complained") stats.suppressed++;
  else stats.pending++;
}
