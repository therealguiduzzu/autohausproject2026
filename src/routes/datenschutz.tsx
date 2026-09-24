import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Settings2 } from "lucide-react";
import { openCookieSettings } from "@/components/CookieBanner";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Auto Semmel Langenselbold" },
      { name: "description", content: "Datenschutzerklärung der Auto Semmel GmbH & Co. Siegfried Polenz KG gemäß DSGVO." },
      { property: "og:title", content: "Datenschutz — Auto Semmel" },
      { property: "og:url", content: "https://la-passione-digital.lovable.app/datenschutz" },
    ],
    links: [{ rel: "canonical", href: "https://la-passione-digital.lovable.app/datenschutz" }],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </Link>

        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">
          Datenschutzerklärung
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informationen gemäß Art. 13 / 14 DSGVO
        </p>

        <Section title="1. Verantwortlicher">
          <p>
            Auto Semmel GmbH & Co. Siegfried Polenz KG
            <br />
            Gelnhäuser Straße 40, 63505 Langenselbold
            <br />
            Telefon: <a href="tel:+4961842633" className="hover:text-primary transition-colors">06184 / 2633</a> · E-Mail: <a href="mailto:datenschutz@auto-semmel.de" className="hover:text-primary transition-colors">datenschutz@auto-semmel.de</a>
          </p>
        </Section>

        <Section title="2. Erhebung und Speicherung personenbezogener Daten">
          <p>
            Beim Besuch unserer Website werden automatisch Informationen vom Browser an unseren
            Server übermittelt (IP-Adresse, Datum, Uhrzeit, aufgerufene Seite, Referrer-URL,
            verwendeter Browser). Diese Daten werden zur Sicherstellung eines störungsfreien
            Betriebs der Website sowie zur Verbesserung unseres Angebots ausgewertet.
          </p>
        </Section>

        <Section title="3. Kontaktformulare & Fahrzeuganfragen">
          <p>
            Bei Probefahrt-Anfragen, Werkstattterminen und Ankaufanfragen verarbeiten wir Ihre
            Angaben (Name, E-Mail, Telefon, Fahrzeugdaten) zur Bearbeitung Ihrer Anfrage auf
            Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden gelöscht, sobald sie für
            den Zweck der Verarbeitung nicht mehr erforderlich sind.
          </p>
        </Section>

        <Section title="4. Cookies & Einwilligungen">
          <p>
            Wir verwenden technisch notwendige Cookies sowie — mit Ihrer Einwilligung — Cookies
            zur Reichweitenmessung und Marketing. Sie können Ihre Auswahl jederzeit ändern:
          </p>
          <button
            onClick={openCookieSettings}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted/30"
          >
            <Settings2 className="h-4 w-4" /> Cookie-Einstellungen öffnen
          </button>
        </Section>

        <Section title="5. Empfänger und Auftragsverarbeiter">
          <p>
            Wir geben Daten an Auftragsverarbeiter (z.B. Hosting, Kfz-Bewertungsdienste, CRM)
            ausschließlich im Rahmen von Verträgen nach Art. 28 DSGVO weiter.
          </p>
        </Section>

        <Section title="6. Ihre Rechte">
          <p>
            Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
            Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21)
            gegen die Verarbeitung Ihrer personenbezogenen Daten. Beschwerden können Sie bei der
            zuständigen Aufsichtsbehörde (Hessischer Beauftragter für Datenschutz und
            Informationsfreiheit) einreichen.
          </p>
        </Section>

        <Section title="7. Kontakt zum Datenschutz">
          <p>
            Bei Fragen zum Datenschutz erreichen Sie uns unter datenschutz@auto-semmel.de oder
            postalisch unter der oben genannten Adresse.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
