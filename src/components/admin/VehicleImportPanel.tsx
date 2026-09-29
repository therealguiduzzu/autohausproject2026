import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { importVehiclesFromAdmin } from "@/lib/vehicle-import.functions";
import { getQueryClient } from "@/lib/query-client-ref";
import { VEHICLES_QUERY_KEY } from "@/lib/vehicles-store";

type Summary = Awaited<ReturnType<typeof importVehiclesFromAdmin>>;

const MAX_BYTES = 2_000_000;

export default function VehicleImportPanel() {
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [markMissingSold, setMarkMissingSold] = useState(false);
  const [busy, setBusy] = useState<"preview" | "import" | null>(null);
  const [preview, setPreview] = useState<Summary | null>(null);
  const [result, setResult] = useState<Summary | null>(null);

  async function onFile(file: File | undefined) {
    setPreview(null);
    setResult(null);
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("Datei zu groß (max. 2 MB).");
      return;
    }
    // Windows-Exporte sind oft ISO-8859-1/Windows-1252; UTF-8 wird bevorzugt.
    const buf = await file.arrayBuffer();
    let content = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    if (content.includes("�")) content = new TextDecoder("windows-1252").decode(buf);
    setFileName(file.name);
    setText(content);
  }

  async function run(dryRun: boolean) {
    setBusy(dryRun ? "preview" : "import");
    try {
      const summary = await importVehiclesFromAdmin({ data: { text, dryRun, markMissingSold } });
      if (dryRun) setPreview(summary);
      else {
        setResult(summary);
        setPreview(null);
        getQueryClient()?.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
        toast.success(
          `Import abgeschlossen: ${summary.created} neu, ${summary.updated} aktualisiert.`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  }

  const shown = result ?? preview;

  return (
    <section className="space-y-5 rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
      <header className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <FileUp className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Fahrzeugbestand
          </p>
          <h3 className="font-display text-xl font-semibold">Fahrzeug-Import (CSV / JSON)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bestandsexport aus dem Händlersystem, mobile.de oder AutoScout24 hochladen. Bereits
            importierte Fahrzeuge werden über die ID aktualisiert; Reservierungen, Badges und
            Aktionspreise bleiben erhalten.
          </p>
        </div>
      </header>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 px-6 py-8 text-center transition hover:border-primary/50">
        <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">
          {fileName || "Datei auswählen (.csv, .json, max. 2 MB)"}
        </span>
        <input
          type="file"
          accept=".csv,.json,.txt,text/csv,application/json"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={markMissingSold}
          onChange={(e) => {
            setMarkMissingSold(e.target.checked);
            setPreview(null);
          }}
          className="mt-1 h-4 w-4 accent-[var(--primary)]"
        />
        <span>
          Fahrzeuge, die nicht mehr in der Datei stehen, als <strong>„Verkauft“</strong> markieren
          <span className="block text-xs text-muted-foreground">
            Betrifft nur Fahrzeuge mit importierter ID; manuell angelegte bleiben unberührt. Nur
            aktivieren, wenn die Datei den kompletten Bestand enthält.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!text || busy !== null}
          onClick={() => run(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-4 py-2.5 text-sm font-semibold transition hover:border-primary/60 disabled:opacity-50"
        >
          {busy === "preview" && <Loader2 className="h-4 w-4 animate-spin" />} Vorschau prüfen
        </button>
        <button
          type="button"
          disabled={!preview || preview.parsed === 0 || busy !== null}
          onClick={() => run(false)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
        >
          {busy === "import" && <Loader2 className="h-4 w-4 animate-spin" />} Import durchführen
        </button>
      </div>

      {shown && (
        <div
          className="space-y-4 rounded-xl border border-border/60 bg-background/40 p-5"
          role="status"
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {result ? "Import abgeschlossen" : "Vorschau (es wurde noch nichts gespeichert)"}
          </p>
          <dl className="grid gap-3 sm:grid-cols-4">
            {[
              ["Erkannt", shown.parsed],
              ["Neu", shown.created],
              ["Aktualisiert", shown.updated],
              ["Als verkauft", shown.markedSold],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg border border-border/60 p-3">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="font-display text-2xl font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {shown.errors.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" /> {shown.errors.length} Zeile(n) übersprungen
              </p>
              <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-auto pl-5 text-xs">
                {shown.errors.slice(0, 100).map((er, i) => (
                  <li key={i}>
                    {er.row > 0 ? `Zeile ${er.row}: ` : ""}
                    {er.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <details className="rounded-xl border border-border/60 bg-background/30 p-4 text-sm">
        <summary className="cursor-pointer font-medium">
          Format &amp; automatischer Import per API
        </summary>
        <div className="mt-3 space-y-2 text-muted-foreground">
          <p>
            <strong className="text-foreground">Pflichtspalten:</strong> ID, Marke, Modell, Zustand,
            Preis, Leistung (PS oder kW), Kraftstoff, Getriebe. Optional: Variante, Kilometerstand,
            Erstzulassung, MwSt ausweisbar, Bilder (URLs, getrennt mit „|“), Ausstattung,
            CO₂-Klasse, Verbrauch, CO₂-Emissionen.
          </p>
          <p>
            <strong className="text-foreground">Automatisch:</strong>{" "}
            <code className="rounded bg-muted px-1">POST /api/import/vehicles</code> mit Header{" "}
            <code className="rounded bg-muted px-1">
              Authorization: Bearer &lt;IMPORT_API_TOKEN&gt;
            </code>{" "}
            (z. B. nächtlicher Cronjob des Händlersystems). Optionen:{" "}
            <code className="rounded bg-muted px-1">?dryRun=1</code>,{" "}
            <code className="rounded bg-muted px-1">?markMissingSold=1</code>.
          </p>
          <p>Unterstützte Marken: Alfa Romeo, Fiat, Abarth, Fiat Professional.</p>
        </div>
      </details>
    </section>
  );
}
