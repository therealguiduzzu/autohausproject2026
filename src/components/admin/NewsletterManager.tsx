import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Send, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getNewsletterStats, sendNewsletterCampaign } from "@/lib/newsletter-campaign.functions";

const TEMPLATES = [
  {
    id: "reifen",
    title: "Reifenwechsel-Saison",
    subject: "Jetzt Reifenwechsel-Termin sichern – Auto Semmel Langenselbold",
    message:
      "Liebe Kundinnen und Kunden,\n\ndie Reifenwechsel-Saison beginnt. Sichern Sie sich online Ihren Wunschtermin in unserer Werkstatt in Langenselbold.\n\nIhr Team von Auto Semmel",
  },
  {
    id: "modell",
    title: "Neues Modell eingetroffen",
    subject: "Neu bei uns im Showroom",
    message:
      "Liebe Kundinnen und Kunden,\n\nneu bei uns eingetroffen: [Modell einsetzen]. Erleben Sie es live in Langenselbold – gern vereinbaren wir eine unverbindliche Probefahrt.\n\nIhr Team von Auto Semmel",
  },
  {
    id: "frei",
    title: "Freie Nachricht",
    subject: "",
    message: "",
  },
];

export default function NewsletterManager() {
  const qc = useQueryClient();
  const { data: stats } = useQuery({ queryKey: ["nl-stats"], queryFn: () => getNewsletterStats() });
  const [tplId, setTplId] = useState(TEMPLATES[0]!.id);
  const [subject, setSubject] = useState(TEMPLATES[0]!.subject);
  const [message, setMessage] = useState(TEMPLATES[0]!.message);
  const [testTo, setTestTo] = useState("");

  const send = useMutation({
    mutationFn: (test: boolean) =>
      sendNewsletterCampaign({
        data: { templateId: tplId, subject, message, testTo: test ? testTo : undefined },
      }),
    onSuccess: (res, test) => {
      if (!res.ok) return toast.error("Keine bestätigten Empfänger vorhanden.");
      toast.success(
        test
          ? `Testmail ${res.queued ? "gesendet" : "konnte nicht gesendet werden"}.`
          : `${res.queued} von ${res.recipients} Mails versendet.`,
        res.queued < res.recipients
          ? {
              description:
                "Ist SMTP eingerichtet (SMTP_HOST, MAIL_FROM)? Details unter „E-Mail-Queue“.",
            }
          : undefined,
      );
      qc.invalidateQueries({ queryKey: ["nl-stats"] });
    },
    onError: () => toast.error("Versand fehlgeschlagen."),
  });

  const valid = subject.trim().length >= 3 && message.trim().length >= 10;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" /> Bestätigte Abonnenten
          </div>
          <p className="mt-2 font-display text-3xl font-semibold">{stats?.confirmed ?? "–"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            +{stats?.confirmedLast30Days ?? 0} in 30 Tagen · {stats?.pending ?? 0} warten auf
            Bestätigung · {stats?.unsubscribed ?? 0} abgemeldet
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 md:col-span-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Letzte Kampagne
          </div>
          {stats?.lastCampaign ? (
            <>
              <p className="mt-2 font-display text-xl font-semibold">
                {stats.lastCampaign.subject}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(stats.lastCampaign.createdAt).toLocaleString("de-DE")} ·{" "}
                {stats.lastCampaign.queued}/{stats.lastCampaign.recipients} Mails versendet
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Noch keine Kampagne versendet.</p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Öffnungs- und Klickraten werden bewusst nicht erfasst (kein Tracking-Pixel, DSGVO).
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
        <h3 className="font-display text-lg font-semibold">Kampagne erstellen</h3>
        <p className="text-xs text-muted-foreground">
          Versand nur an bestätigte Abonnenten, jede Mail mit persönlichem Abmeldelink. Nur Aussagen
          verwenden, die für Ihr Angebot tatsächlich gelten.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-xs font-medium">
              Vorlage
              <select
                className="input mt-1 w-full"
                value={tplId}
                onChange={(e) => {
                  const t = TEMPLATES.find((x) => x.id === e.target.value)!;
                  setTplId(t.id);
                  setSubject(t.subject);
                  setMessage(t.message);
                }}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium">
              Betreff
              <input
                className="input mt-1 w-full"
                value={subject}
                maxLength={200}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium">
              Nachricht
              <textarea
                className="input mt-1 min-h-40 w-full"
                value={message}
                maxLength={4000}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-background/60 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Vorschau
              </p>
              <p className="mt-2 font-display text-base font-semibold">{subject || "–"}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {message || "–"}
              </p>
              <p className="mt-4 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
                Auto Semmel GmbH &amp; Co. Siegfried Polenz KG · Gelnhäuser Straße 40, 63505
                Langenselbold · <span className="underline">Abmelden</span>
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                className="input min-w-0 flex-1"
                placeholder="Testadresse (eigene E-Mail)"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
              />
              <button
                type="button"
                disabled={!valid || !testTo || send.isPending}
                onClick={() => send.mutate(true)}
                className="rounded-lg border border-border/70 px-4 py-2 text-sm font-semibold hover:border-primary/40 disabled:opacity-50"
              >
                Testmail
              </button>
            </div>

            <button
              type="button"
              disabled={!valid || send.isPending || !stats?.confirmed}
              onClick={() => {
                if (
                  confirm(`Newsletter jetzt an ${stats?.confirmed} bestätigte Abonnenten senden?`)
                )
                  send.mutate(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {send.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              An alle {stats?.confirmed ?? 0} Abonnenten senden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
