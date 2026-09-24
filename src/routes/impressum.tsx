import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Auto Semmel Langenselbold" },
      { name: "description", content: "Impressum und rechtliche Angaben der Auto Semmel GmbH & Co. Siegfried Polenz KG in Langenselbold." },
      { property: "og:title", content: "Impressum — Auto Semmel" },
      { property: "og:url", content: "https://la-passione-digital.lovable.app/impressum" },
    ],
    links: [{ rel: "canonical", href: "https://la-passione-digital.lovable.app/impressum" }],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </Link>

        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">Impressum</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
        </p>

        <Section title="Anbieter">
          <p>
            Auto Semmel GmbH & Co. Siegfried Polenz KG
            <br />
            Gelnhäuser Straße 40
            <br />
            63505 Langenselbold
            <br />
            Deutschland
          </p>
        </Section>

        <Section title="Kontakt">
          <p>
            Telefon: <a href="tel:+4961842633" className="hover:text-primary transition-colors">06184 / 2633</a>
            <br />
            E-Mail: info@auto-semmel.de
            <br />
            Web: www.auto-semmel.de
          </p>
        </Section>

        <Section title="Vertretungsberechtigte">
          <p>
            Persönlich haftende Gesellschafterin: Auto Semmel Verwaltungs GmbH
            <br />
            Geschäftsführer: [Platzhalter Geschäftsführung]
          </p>
        </Section>

        <Section title="Registereintrag">
          <p>
            Handelsregister: Amtsgericht Hanau
            <br />
            Registernummer: HRA [Platzhalter]
            <br />
            Umsatzsteuer-ID gem. § 27a UStG: DE [Platzhalter]
          </p>
        </Section>

        <Section title="Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)">
          <p>
            [Platzhalter Verantwortlicher]
            <br />
            Gelnhäuser Straße 40, 63505 Langenselbold
          </p>
        </Section>

        <Section title="EU-Streitschlichtung">
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            <br />
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </Section>

        <Section title="Haftungsausschluss">
          <p>
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte
            externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren
            Betreiber verantwortlich.
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
