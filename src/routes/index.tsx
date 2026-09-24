import { createFileRoute, Link } from "@tanstack/react-router";
import { openCookieSettings } from "@/components/CookieBanner";
import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Clock,
  MapPin,
  Search,
  Gauge,
  Calendar,
  Fuel,
  Cog,
  Zap,
  ArrowRight,
  Heart,
  ChevronRight,
  Wrench,
  CalendarCheck,
  UserRound,
  Car,
  Euro,
  ShieldCheck,
  Menu,
  X,
  Check,
  Star,
  Award,
  Truck,
  Package,
  Users,

  Mail,
  Send,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import heroGiulia from "@/assets/hero-giulia.jpg";
import {
  MODELS_BY_BRAND,
  filterVehicles,
  type Vehicle,
  type Brand,
  type Condition,
  type VehicleFilters,
  type VehicleStatus,
} from "@/lib/vehicles";
import { useVehicles } from "@/lib/vehicles-store";
import { useVehiclesRealtime } from "@/hooks/use-vehicles-realtime";
import { FiatServiceLogo, AlfaRomeoServiceLogo, StellantisLogo } from "@/components/ServiceLogos";
import { leadsStore } from "@/lib/leads-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auto Semmel Langenselbold — Alfa Romeo · Fiat · Abarth · Fiat Professional" },
      {
        name: "description",
        content:
          "Auto Semmel in Langenselbold: Offizieller Stellantis-Partner für Alfa Romeo, Fiat, Abarth und Fiat Professional. Verkauf, Meisterwerkstatt, Fahrzeugankauf — seit über 40 Jahren.",
      },
      { property: "og:title", content: "Auto Semmel — Ihr Italien-Spezialist in Langenselbold" },
      {
        property: "og:description",
        content:
          "Tradition, Qualität & italienische Leidenschaft. Neuwagen, Tageszulassungen, Gebrauchtwagen & Nutzfahrzeuge direkt an der A66.",
      },
      { property: "og:url", content: "https://la-passione-digital.lovable.app/" },
      { property: "og:image", content: `https://la-passione-digital.lovable.app${heroGiulia}` },
      { property: "twitter:image", content: `https://la-passione-digital.lovable.app${heroGiulia}` },
    ],
    links: [{ rel: "canonical", href: "https://la-passione-digital.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Auto Semmel",
          url: "https://la-passione-digital.lovable.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://la-passione-digital.lovable.app/?condition={condition}&brand={brand}&price_max={price_max}&transmission={transmission}",
            },
            "query-input": [
              {
                "@type": "PropertyValueSpecification",
                valueName: "condition",
                valueRequired: false,
                description:
                  "Fahrzeugzustand: Neuwagen, Tageszulassung oder Gebrauchtwagen",
              },
              {
                "@type": "PropertyValueSpecification",
                valueName: "brand",
                valueRequired: false,
                description:
                  "Marke: Alfa Romeo, Fiat, Abarth oder Fiat Professional",
              },
              {
                "@type": "PropertyValueSpecification",
                valueName: "price_max",
                valueRequired: false,
                description: "Maximaler Preis in Euro",
              },
              {
                "@type": "PropertyValueSpecification",
                valueName: "transmission",
                valueRequired: false,
                description: "Getriebeart: Automatik oder Schaltgetriebe",
              },
            ],
          },
        }),
      },
    ],
  }),
  component: Index,
});

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function Index() {
  const allVehicles = useVehicles();
  useVehiclesRealtime();
  const availableVehicles = useMemo(
    () => allVehicles.filter((v) => v.status !== "Verkauft"),
    [allVehicles],
  );
  const [filters, setFilters] = useState<VehicleFilters>({
    condition: "Alle",
    brand: "Alle",
    model: "Alle Modelle",
    priceMax: 60000,
  });

  const results = useMemo(
    () => filterVehicles(availableVehicles, filters),
    [availableVehicles, filters],
  );

  const [testDriveVehicle, setTestDriveVehicle] = useState<Vehicle | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <Nav />
      <Hero />
      <SearchBar filters={filters} setFilters={setFilters} count={results.length} />
      <Highlights />
      <TrustBar />
      <VehicleGrid
        vehicles={results}
        totalCount={availableVehicles.length}
        onTestDrive={(v) => setTestDriveVehicle(v)}
      />
      <BrandSplitter />
      <FiatProfessionalSection />
      <WerkstattHub />
      <AnkaufSection />
      <AboutTeamSection />
      <NewsletterSection />
      <GoogleReviewsSection />
      <ServiceCtaBanner />
      <Footer />


      <TestDriveDialog
        vehicle={testDriveVehicle}
        onClose={() => setTestDriveVehicle(null)}
      />
      <VehicleItemListSchema vehicles={results} />
      <AutoDealerSchema vehicles={availableVehicles} />
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Top bar + Nav                                                        */
/* ------------------------------------------------------------------ */

function TopBar() {
  return (
    <div className="hidden border-b border-border/60 bg-surface/60 text-xs text-muted-foreground md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Gelnhäuser Straße 40 · 63505 Langenselbold
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Verkauf Mo.–Fr. 7:30-17:30 Uhr · Sa 9–14 Uhr
          </span>
        </div>
        <a href="tel:+4961842633" className="flex items-center gap-1.5 hover:text-foreground">
          <Phone className="h-3.5 w-3.5 text-primary" />06184 / 2633
        </a>
      </div>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3 lg:flex lg:justify-between">
        <a href="#" className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[color:var(--alfa-glow)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <span className="font-display text-lg font-bold italic">AS</span>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-lg font-semibold tracking-tight">
              Auto Semmel
            </div>
            <div className="hidden text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
              Langenselbold · Alfa Romeo · Fiat · Abarth
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
          <a href="#fahrzeuge" className="transition hover:text-foreground">Fahrzeugbestand</a>
          <a href="#service" className="transition hover:text-foreground">Werkstatt-Service</a>
          <a href="#ueber-uns" className="transition hover:text-foreground">Über uns</a>
          <Link to="/karriere" className="transition hover:text-foreground">Karriere</Link>
          <a href="#kontakt" className="transition hover:text-foreground">Kontakt</a>
          <a href="/admin" className="transition hover:text-primary">Händler-Login</a>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+4961842633"
            className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-foreground/90 transition hover:border-primary/60 hover:text-primary"
          >
            <Phone className="h-4 w-4" />06184 / 2633
          </a>
          <a
            href="#service"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            Termin buchen
          </a>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/60 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#fahrzeuge" onClick={() => setOpen(false)}>Fahrzeugbestand</a>
            <a href="#service" onClick={() => setOpen(false)}>Werkstatt-Service</a>
            <a href="#ueber-uns" onClick={() => setOpen(false)}>Über uns</a>
            <Link to="/karriere" onClick={() => setOpen(false)}>Karriere</Link>
            <a href="#kontakt" onClick={() => setOpen(false)}>Kontakt</a>
            <a href="tel:+4961842633" className="flex items-center gap-2 text-primary">
              <Phone className="h-4 w-4" />06184 / 2633
            </a>
          </nav>
        </div>
      )}
      <div className="tricolore-bar h-[2px] w-full opacity-50" />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroGiulia}
          alt="Alfa Romeo bei Nacht in Langenselbold"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 carbon-texture opacity-20 mix-blend-multiply" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-28 lg:pt-24 lg:pb-40">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Stellantis-Partner · Main-Kinzig-Kreis
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Tradition, Qualität & <span className="italic">italienische Leidenschaft</span>{" "}
            <span className="bg-gradient-to-r from-primary to-[color:var(--alfa-glow)] bg-clip-text text-transparent">
              in Langenselbold.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Seit über 40 Jahren Ihr offizieller Partner für Alfa Romeo, Fiat, Abarth und
            Fiat Professional — direkt an der A66, mit Meisterwerkstatt für alle Marken.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Stat n="40+" label="Jahre vor Ort" />
            <div className="h-8 w-px bg-border" />
            <Stat n="180+" label="Fahrzeuge auf Lager" />
            <div className="hidden h-8 w-px bg-border sm:block" />
            <Stat n="4.3★" label="Google Bewertung" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-foreground">{n}</div>
      <div className="text-xs uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Smart search                                                         */
/* ------------------------------------------------------------------ */

function SearchBar({
  filters,
  setFilters,
  count,
}: {
  filters: VehicleFilters;
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilters>>;
  count: number;
}) {
  const models = MODELS_BY_BRAND[filters.brand];

  const update = <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const scrollToGrid = () => {
    document.getElementById("fahrzeuge")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative z-10 -mt-20 px-6 lg:-mt-24">
      <div className="mx-auto max-w-6xl rounded-2xl border border-border/70 bg-surface-elevated/90 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-7">
        <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Search className="h-3.5 w-3.5 text-primary" /> Fahrzeugsuche · Langenselbold
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Zustand">
            <Select
              value={filters.condition}
              onChange={(v) => update("condition", v as Condition | "Alle")}
            >
              <option>Alle</option>
              <option>Neuwagen</option>
              <option>Tageszulassung</option>
              <option>Gebrauchtwagen</option>
            </Select>
          </Field>

          <Field label="Marke">
            <Select
              value={filters.brand}
              onChange={(v) => {
                setFilters((f) => ({
                  ...f,
                  brand: v as Brand | "Alle",
                  model: "Alle Modelle",
                }));
              }}
            >
              <option>Alle</option>
              <option>Alfa Romeo</option>
              <option>Fiat</option>
              <option>Abarth</option>
              <option>Fiat Professional</option>
            </Select>
          </Field>

          <Field label="Modell">
            <Select value={filters.model} onChange={(v) => update("model", v)}>
              {models.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>

          <Field label={`Max. Preis ${filters.priceMax.toLocaleString("de-DE")} €`}>
            <input
              type="range"
              min={5000}
              max={80000}
              step={1000}
              value={filters.priceMax}
              onChange={(e) => update("priceMax", Number(e.target.value))}
              className="h-10 w-full cursor-pointer accent-[color:var(--primary)]"
            />
          </Field>
        </div>

        <button
          onClick={scrollToGrid}
          className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-base font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <span className="tabular-nums">{count}</span>
          {count === 1 ? "Fahrzeug" : "Fahrzeuge"} gefunden
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full appearance-none rounded-lg border border-border bg-input px-3 text-sm text-foreground transition hover:border-primary/60 focus:border-primary focus:outline-none"
    >
      {children}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Trust bar                                                            */
/* ------------------------------------------------------------------ */

const TRUST_BADGES = [
  "Festpreise – keine Überraschungen",
  "Meistergeprüfte Qualität",
  "Inklusive 12 Monate Händlergarantie",
];

function TrustBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20">
      <div className="rounded-2xl border border-border/60 bg-surface p-5 shadow-[var(--shadow-soft)]">
        <div className="grid gap-3 sm:grid-cols-3">
          {TRUST_BADGES.map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--italian-green)]/25 bg-[color:var(--italian-green)]/8 px-4 py-3"
              style={{ backgroundColor: "color-mix(in oklab, #008c45 8%, transparent)" }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
                style={{ backgroundColor: "#008c45" }}
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <span
                className="min-w-0 text-sm font-semibold"
                style={{ color: "#006b35" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col items-center justify-center gap-4 border-t border-border/60 pt-5 sm:flex-row sm:gap-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Autorisierter Servicepartner
          </span>
          <div className="flex items-center gap-6 opacity-90">
            <FiatServiceLogo className="h-9 w-auto" />
            <AlfaRomeoServiceLogo className="h-9 w-auto" />
            <span className="hidden h-7 w-px bg-border sm:block" />
            <StellantisLogo className="h-5 w-auto text-foreground/75" />
          </div>
        </div>
      </div>
    </section>
  );
}


/* ------------------------------------------------------------------ */
/* Vehicle grid                                                         */
/* ------------------------------------------------------------------ */

function VehicleGrid({
  vehicles,
  totalCount,
  onTestDrive,
}: {
  vehicles: Vehicle[];
  totalCount: number;
  onTestDrive: (v: Vehicle) => void;
}) {
  return (
    <section id="fahrzeuge" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <SectionHeader
        eyebrow="Aktueller Fahrzeugbestand"
        title="Italienische Fahrzeuge mit Charakter."
        subtitle={
          vehicles.length === totalCount
            ? "Eine Auswahl aus unserem Bestand in Langenselbold — Pkw, Sportler und Nutzfahrzeuge. Täglich aktualisiert."
            : `${vehicles.length} von ${totalCount} Fahrzeugen passen zu Ihrer Suche.`
        }
      />

      {vehicles.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onTestDrive={() => onTestDrive(v)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-border/70 bg-surface/40 p-12 text-center">
          <Car className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-display text-xl font-semibold">Keine passenden Fahrzeuge</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Passen Sie Ihre Suchkriterien an oder rufen Sie uns an — wir finden Ihren Wagen.
          </p>
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <button className="group flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-primary hover:text-primary">
          Gesamten Fahrzeugbestand ansehen
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
        <span className="h-px w-8 bg-primary" /> {eyebrow}
      </div>
      <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function VehicleCard({
  vehicle: v,
  onTestDrive,
}: {
  vehicle: Vehicle;
  onTestDrive: () => void;
}) {
  const year = new Date(v.firstRegistration).getFullYear();
  const slugOrId = v.slug ?? v.id;
  return (
    <article className="brand-card group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        <img
          src={v.images[0]}
          alt={`${v.brand} ${v.model} ${v.version}`}
          loading="lazy"
          width={1024}
          height={720}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-2">
            {v.discountPrice != null && v.discountPrice < v.price && (
              <Badge tone="primary">SALE</Badge>
            )}
            <Badge tone={v.brand === "Fiat Professional" ? "outline" : "primary"}>
              {v.brand === "Fiat Professional" ? "Fiat Professional" : "Top Deal"}
            </Badge>
            {v.fuelType === "Elektro" && <Badge tone="green">Elektro</Badge>}
            {v.vatDeductible && <Badge tone="ghost">MwSt. ausweisbar</Badge>}
          </div>
          <button
            aria-label="Merken"
            className="grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground/80 backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur">
          {v.condition}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary">{v.brand}</div>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-snug">
          {v.model} {v.version}
        </h3>

        <div className="mt-4 grid grid-cols-5 gap-2 text-[11px] text-muted-foreground">
          <Spec icon={<Calendar className="h-4 w-4" />} v={`${year}`} />
          <Spec icon={<Gauge className="h-4 w-4" />} v={`${v.mileage.toLocaleString("de-DE")} km`} />
          <Spec icon={<Zap className="h-4 w-4" />} v={`${v.powerHp} PS`} />
          <Spec icon={<Fuel className="h-4 w-4" />} v={v.fuelType} />
          <Spec icon={<Cog className="h-4 w-4" />} v={v.transmission === "Automatik" ? "Aut." : "Schalt."} />
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-border/60 pt-4">
          <div>
            {v.discountPrice != null && v.discountPrice < v.price ? (
              <>
                <div className="text-xs text-muted-foreground line-through">
                  {v.price.toLocaleString("de-DE")} €
                </div>
                <div className="font-display text-2xl font-bold text-primary">
                  {v.discountPrice.toLocaleString("de-DE")} €
                </div>
              </>
            ) : (
              <div className="font-display text-2xl font-bold text-foreground">
                {v.price.toLocaleString("de-DE")} €
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              ab <span className="text-foreground">{v.financingMonthly} €</span> mtl.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTestDrive}
              aria-label="Probefahrt anfragen"
              title="Probefahrt anfragen"
              className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Car className="h-4 w-4" />
            </button>
            <Link
              to="/fahrzeug/$slug"
              params={{ slug: slugOrId }}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Spec({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md bg-background/60 py-2 text-center">
      <span className="text-primary/80">{icon}</span>
      <span className="truncate text-foreground/90">{v}</span>
    </div>
  );
}

type BadgeTone = "primary" | "green" | "ghost" | "outline";
function Badge({ tone = "primary", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  const styles: Record<BadgeTone, string> = {
    primary: "bg-primary text-primary-foreground",
    green: "bg-[color:var(--tricolore-green)] text-background",
    ghost: "bg-background/80 text-foreground border border-border backdrop-blur",
    outline: "bg-[color:var(--surface-elevated)] text-foreground border border-primary/60",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Vehicle Detail Dialog                                                */
/* ------------------------------------------------------------------ */

function ModalShell({
  open,
  onClose,
  children,
  maxWidth = "max-w-3xl",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/70 px-0 py-0 backdrop-blur-md sm:items-center sm:px-6 sm:py-10">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} overflow-hidden rounded-t-2xl border border-border/70 bg-surface-elevated shadow-[var(--shadow-card)] sm:rounded-2xl`}
      >
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground/80 backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function VehicleDetailDialog({
  vehicle,
  onClose,
  onTestDrive,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
  onTestDrive: (v: Vehicle) => void;
}) {
  if (!vehicle) return null;
  const v = vehicle;
  const year = new Date(v.firstRegistration).getFullYear();
  const specs = [
    { icon: Calendar, label: "Erstzulassung", value: new Date(v.firstRegistration).toLocaleDateString("de-DE") },
    { icon: Gauge, label: "Kilometerstand", value: `${v.mileage.toLocaleString("de-DE")} km` },
    { icon: Zap, label: "Leistung", value: `${v.powerHp} PS (${Math.round(v.powerHp * 0.7355)} kW)` },
    { icon: Fuel, label: "Kraftstoff", value: v.fuelType },
    { icon: Cog, label: "Getriebe", value: v.transmission },
    { icon: ShieldCheck, label: "Zustand", value: v.condition },
  ];

  return (
    <ModalShell open={!!vehicle} onClose={onClose} maxWidth="max-w-4xl">
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-background lg:aspect-auto">
          <img src={v.images[0]} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge tone="primary">{v.condition}</Badge>
            {v.fuelType === "Elektro" && <Badge tone="green">Elektro</Badge>}
            {v.vatDeductible && <Badge tone="ghost">MwSt. ausweisbar</Badge>}
          </div>
        </div>

        <div className="flex flex-col overflow-y-auto p-6 sm:p-8 lg:max-h-[80vh]">
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary">{v.brand} · {year}</div>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
            {v.model} <span className="text-foreground/80">{v.version}</span>
          </h3>

          <div className="mt-5 flex items-end gap-4 border-y border-border/60 py-4">
            <div>
              <div className="font-display text-3xl font-bold">{v.price.toLocaleString("de-DE")} €</div>
              <div className="text-xs text-muted-foreground">
                Finanzierung ab <span className="text-foreground">{v.financingMonthly} €</span> / Monat
              </div>
            </div>
            <div className="ml-auto rounded-md bg-background/60 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Mobile.de ID {v.mobileDeId}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                </div>
                <div className="mt-1 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

          {v.features.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ausstattung
              </div>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {v.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => onTestDrive(v)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
            >
              <Car className="h-4 w-4" /> Probefahrt für dieses Fahrzeug anfragen
            </button>
            <a
              href="tel:+4961842633"
              className="flex items-center justify-center gap-2 rounded-xl border border-border/70 px-5 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4" /> Beratung 06184 / 2633
            </a>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Test Drive Dialog                                                    */
/* ------------------------------------------------------------------ */

function TestDriveDialog({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setModel(`${vehicle.model} ${vehicle.version}`);
      setSent(false);
      setName(""); setPhone(""); setEmail(""); setDate(""); setNote("");
    }
  }, [vehicle]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;
    leadsStore.add({
      type: "Probefahrt",
      name: name || "Unbekannt",
      email,
      phone,
      subject: `Probefahrt · ${brand} ${model}`,
      details: {
        Fahrzeug: `${brand} ${model}`,
        "Wunsch-Termin": date || "Flexibel",
        Anmerkung: note || "—",
      },
    });
    setSent(true);
  }

  return (
    <ModalShell open={!!vehicle} onClose={onClose} maxWidth="max-w-xl">
      {!vehicle ? null : sent ? (
        <div className="p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold">Anfrage übermittelt</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Wir melden uns innerhalb von 24 Std. zur Terminbestätigung für Ihren{" "}
            <span className="text-foreground">{brand} {model}</span>.
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            Schließen
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary">Probefahrt anfragen</div>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {vehicle.version} · {vehicle.price.toLocaleString("de-DE")} €
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Marke">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} readOnly />
            </Field>
            <Field label="Modell">
              <Input value={model} onChange={(e) => setModel(e.target.value)} readOnly />
            </Field>
            <Field label="Ihr Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" required />
            </Field>
            <Field label="Telefon">
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 …" required />
            </Field>
            <Field label="E-Mail">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.de" required />
            </Field>
            <Field label="Wunsch-Termin">
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="z.B. Samstag vormittag" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Anmerkung (optional)">
                <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sonderwünsche, Routenfragen …" />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            <Send className="h-4 w-4" /> Probefahrt anfragen
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            DSGVO-konform. Keine Weitergabe an Dritte.
          </p>
        </form>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Werkstatt & Service hub — 4 Step booking                             */
/* ------------------------------------------------------------------ */

const SERVICES = [
  { id: "Inspektion", label: "Inspektion", icon: Wrench, desc: "Nach Herstellervorgabe" },
  { id: "Reifenwechsel", label: "Reifenwechsel", icon: Cog, desc: "Wechsel & Einlagerung" },
  { id: "HU/AU", label: "HU / AU", icon: ShieldCheck, desc: "TÜV-Abnahme im Haus" },
  { id: "Reparatur", label: "Reparatur", icon: Zap, desc: "Diagnose & Reparatur" },
];

const WERKSTATT_BRANDS = ["Fiat", "Alfa Romeo", "Abarth", "Fremdfabrikat"];

function WerkstattHub() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("Inspektion");
  const [brand, setBrand] = useState("Fiat");
  const [plate, setPlate] = useState("");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState("vormittags");
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [sent, setSent] = useState(false);

  const dates = ["Mo 30.06", "Di 01.07", "Mi 02.07", "Do 03.07", "Fr 04.07", "Sa 05.07"];
  const labels = ["Service", "Fahrzeug", "Termin", "Kontakt"];

  function submit() {
    leadsStore.add({
      type: "Werkstattermin",
      name: contact.name || "Unbekannt",
      email: contact.email,
      phone: contact.phone,
      subject: `Werkstattermin · ${brand} (${service})`,
      details: {
        Service: service,
        Marke: brand,
        Kennzeichen: plate || "—",
        Wunschtermin: `${date ?? "Flexibel"} · ${time}`,
      },
    });
    setSent(true);
  }

  function reset() {
    setStep(0); setService("Inspektion"); setBrand("Fiat"); setPlate("");
    setDate(null); setTime("vormittags"); setContact({ name: "", phone: "", email: "" });
    setSent(false);
  }

  const canNext =
    (step === 0 && !!service) ||
    (step === 1 && !!brand && plate.trim().length > 0) ||
    (step === 2 && !!date) ||
    (step === 3 && contact.name && contact.phone && contact.email);

  return (
    <section id="service" className="relative border-y border-border/60 bg-surface/60 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            eyebrow="Online-Werkstattermin"
            title="Werkstatt-Service bei Auto Semmel."
            subtitle="Unsere Meisterwerkstatt in Langenselbold betreut alle Marken — mit Originalteilen, Stellantis-Werksdiagnose und transparenten Festpreisen. In 4 Schritten gebucht."
          />
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Hol- und Bringservice in Langenselbold und Umgebung",
              "Kostenloser Ersatzwagen ab Inspektion",
              "Garantieerhalt durch Herstellerstandard",
              "Festpreise — keine Überraschungen",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-foreground/90">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Autorisierter Servicepartner
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  Logo: FiatServiceLogo,
                  alt: "Offizieller FIAT Service Partner – Auto Semmel Langenselbold",
                  sub: "Fiat · Abarth · Fiat Professional",
                },
                {
                  Logo: AlfaRomeoServiceLogo,
                  alt: "Offizieller Alfa Romeo Service Partner – Auto Semmel Langenselbold",
                  sub: "Original-Ersatzteile · Werksdiagnose",
                },
              ].map(({ Logo, alt, sub }) => (
                <div
                  key={alt}
                  className="group flex items-center gap-4 rounded-xl border border-border/70 bg-surface px-4 py-3 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-border"
                >
                  <Logo title={alt} className="h-14 w-auto shrink-0" />
                  <div className="min-w-0 text-xs leading-snug text-muted-foreground">
                    <div className="font-semibold text-foreground/90">
                      Garantie-Erhalt sichergestellt
                    </div>
                    <div>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Original-Ersatzteile · Hersteller-Diagnose · Werksgarantie bleibt erhalten
            </p>
          </div>
        </div>


        <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-[var(--shadow-card)] sm:p-8">
          {sent ? (
            <div className="grid place-items-center py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-display text-2xl font-semibold">Termin angefragt</h4>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Vielen Dank, {contact.name.split(" ")[0] || "danke"}! Unser Serviceteam meldet sich
                in Kürze zur Terminbestätigung.
              </p>
              <button
                onClick={reset}
                className="mt-6 rounded-full border border-border px-5 py-2 text-sm transition hover:border-primary hover:text-primary"
              >
                Weiteren Termin anfragen
              </button>
            </div>
          ) : (
            <>
              <Stepper step={step} labels={labels} />

              <div className="mt-8 min-h-[280px]">
                {step === 0 && (
                  <div>
                    <h4 className="font-display text-xl font-semibold">Welcher Service?</h4>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {SERVICES.map((s) => {
                        const Icon = s.icon;
                        const active = service === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setService(s.id)}
                            className={`rounded-xl border p-4 text-left transition ${
                              active
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="mt-2 text-sm font-semibold">{s.label}</div>
                            <div className="text-xs text-muted-foreground">{s.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h4 className="font-display text-xl font-semibold">Ihr Fahrzeug</h4>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {WERKSTATT_BRANDS.map((b) => {
                        const active = brand === b;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBrand(b)}
                            className={`rounded-lg border px-3 py-3 text-sm transition ${
                              active
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            }`}
                          >
                            {b}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-5">
                      <Field label="Kennzeichen">
                        <Input
                          value={plate}
                          onChange={(e) => setPlate(e.target.value.toUpperCase())}
                          placeholder="z.B. MKK-AS 1234"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h4 className="font-display text-xl font-semibold">Wann passt es Ihnen?</h4>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {dates.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDate(d)}
                          className={`rounded-lg border px-3 py-3 text-sm transition ${
                            date === d
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <div className="mt-5">
                      <Field label="Tageszeit">
                        <Select value={time} onChange={setTime}>
                          <option value="vormittags">Vormittags (8–12 Uhr)</option>
                          <option value="mittags">Mittags (12–14 Uhr)</option>
                          <option value="nachmittags">Nachmittags (14–17 Uhr)</option>
                        </Select>
                      </Field>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h4 className="font-display text-xl font-semibold">Ihre Kontaktdaten</h4>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Vor- und Nachname"
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        className="sm:col-span-2"
                      />
                      <Input
                        placeholder="Telefon"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      />
                      <Input
                        placeholder="E-Mail"
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      />
                    </div>
                    <div className="mt-5 rounded-lg border border-border/60 bg-surface/60 p-3 text-xs text-muted-foreground">
                      <div className="mb-1 font-medium text-foreground">Zusammenfassung</div>
                      {service} · {brand} {plate && `(${plate})`} · {date ?? "—"} · {time}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                >
                  Zurück
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setStep((s) => Math.min(3, s + 1))}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                  >
                    Weiter <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={submit}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Terminanfrage absenden
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  const icons = [Wrench, Car, CalendarCheck, UserRound];
  return (
    <ol className="flex items-center gap-2">
      {labels.map((l, i) => {
        const Icon = icons[i] ?? UserRound;
        const active = i === step;
        const done = i < step;
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <div
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-semibold transition ${
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : active
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span
              className={`hidden text-xs font-medium uppercase tracking-wider sm:inline ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {l}
            </span>
            {i < labels.length - 1 && (
              <span className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none ${className}`}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Fahrzeugankauf                                                       */
/* ------------------------------------------------------------------ */

interface AnkaufForm {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  fuel: string;
  gearbox: string;
  condition: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyAnkauf: AnkaufForm = {
  brand: "", model: "", year: "", mileage: "",
  fuel: "Benzin", gearbox: "Schaltgetriebe", condition: "",
  name: "", city: "", phone: "", email: "", notes: "",
};

function AnkaufSection() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<AnkaufForm>(emptyAnkauf);

  function update<K extends keyof AnkaufForm>(k: K, v: AnkaufForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const steps = [
    { label: "Fahrzeug", title: "Welches Auto fahren Sie?" },
    { label: "Zustand", title: "Details zum Zustand" },
    { label: "Wunschpreis", title: "Ihre Schätzung" },
    { label: "Kontakt", title: "Ihre Kontaktdaten" },
  ];
  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const canContinue = (() => {
    if (step === 0) return form.brand.trim() && form.model.trim() && form.year.trim();
    if (step === 1) return form.mileage.trim() && form.condition.trim();
    if (step === 2) return form.notes.trim(); // notes = Wunschpreis hier
    if (step === 3) return form.name.trim() && form.phone.trim();
    return false;
  })();

  function next() {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else submit();
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function submit() {
    setSubmitting(true);
    setTimeout(() => {
      leadsStore.add({
        type: "Fahrzeugankauf",
        name: form.name || "Unbekannt",
        email: form.email,
        phone: form.phone,
        subject: `Ankaufsanfrage · ${form.brand} ${form.model}`,
        details: {
          Marke: form.brand,
          Modell: form.model,
          Baujahr: form.year || "—",
          Kilometerstand: form.mileage ? `${form.mileage} km` : "—",
          Unfallfrei: form.condition,
          Wunschpreis: form.notes ? `${form.notes} €` : "—",
        },
      });
      setSubmitting(false);
      setSent(true);
    }, 1400);
  }

  function reset() {
    setForm(emptyAnkauf);
    setStep(0);
    setSent(false);
    setSubmitting(false);
  }

  return (
    <section id="ankauf" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 carbon-texture opacity-40" />
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/15 to-transparent blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Fahrzeugankauf"
            title="Wir kaufen Ihr Auto — fair & lokal."
            subtitle="Aus Langenselbold, Hanau, Gelnhausen oder dem ganzen Main-Kinzig-Kreis: Innerhalb von 24 Stunden erhalten Sie unsere unverbindliche Bewertung."
          />

          <div className="mt-10 grid gap-5">
            {[
              { icon: Euro, t: "Fairer Marktpreis", d: "Bewertung in 24 Std." },
              { icon: ShieldCheck, t: "Sichere Abwicklung", d: "Inkl. Abmeldung & Sofortzahlung" },
              { icon: Truck, t: "Alle Marken & Zustände", d: "Pkw, Nutzfahrzeuge, auch ohne TÜV" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-sm text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="brand-card rounded-2xl border border-border/70 bg-surface-elevated/80 p-6 shadow-[var(--shadow-card)] sm:p-8 min-h-[520px] flex flex-col">
            {sent ? (
              <div className="m-auto text-center animate-fade-in">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold">Vielen Dank!</h3>
                <p className="mt-3 max-w-md text-sm text-muted-foreground mx-auto">
                  Die Verkaufsleitung von Auto Semmel prüft Ihre Daten und meldet sich
                  innerhalb von 24 Stunden mit einem fairen Angebot für Ihren
                  {" "}{form.brand} {form.model}.
                </p>
                <button
                  onClick={reset}
                  className="mt-6 rounded-full border border-border px-5 py-2 text-sm transition hover:border-primary hover:text-primary"
                >
                  Weiteres Fahrzeug einreichen
                </button>
              </div>
            ) : submitting ? (
              <div className="m-auto text-center animate-fade-in">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 font-display text-lg">Anfrage wird übermittelt…</p>
                <p className="mt-1 text-sm text-muted-foreground">Wir bereiten Ihre Bewertung vor.</p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Schritt {step + 1} von {totalSteps}</span>
                    <span className="text-primary">{steps[step].label}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold">{steps[step].title}</h3>
                </div>

                {/* Step content */}
                <div key={step} className="mt-6 grid gap-4 sm:grid-cols-2 animate-fade-in">
                  {step === 0 && (
                    <>
                      <Field label="Marke">
                        <Input value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="z.B. Alfa Romeo" />
                      </Field>
                      <Field label="Modell">
                        <Input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="z.B. Giulia" />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Baujahr / Erstzulassung">
                          <Input value={form.year} onChange={(e) => update("year", e.target.value)} placeholder="MM / JJJJ" />
                        </Field>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Field label="Kilometerstand">
                        <Input value={form.mileage} onChange={(e) => update("mileage", e.target.value)} placeholder="z.B. 45.000" />
                      </Field>
                      <Field label="Unfallfrei?">
                        <Select value={form.condition} onChange={(v) => update("condition", v)}>
                          <option value="">Bitte wählen</option>
                          <option value="Ja, unfallfrei">Ja, unfallfrei</option>
                          <option value="Nein, Vorschäden">Nein, Vorschäden vorhanden</option>
                          <option value="Reparierter Unfallschaden">Reparierter Unfallschaden</option>
                        </Select>
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <div className="sm:col-span-2">
                      <Field label="Ihr Wunschpreis (in €)">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={form.notes}
                          onChange={(e) => update("notes", e.target.value)}
                          placeholder="z.B. 18500"
                        />
                      </Field>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Unverbindlich — wir vergleichen Ihren Wunsch mit dem aktuellen Marktwert.
                      </p>
                    </div>
                  )}

                  {step === 3 && (
                    <>
                      <Field label="Ihr Name">
                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Vor- und Nachname" />
                      </Field>
                      <Field label="Telefon">
                        <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+49 …" />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="E-Mail (optional)">
                          <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="ihre@email.de" />
                        </Field>
                      </div>
                    </>
                  )}
                </div>

                {/* Nav */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-8">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Zurück
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canContinue}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {step === totalSteps - 1 ? (
                      <>
                        <Send className="h-4 w-4" /> Bewertung anfordern
                      </>
                    ) : (
                      <>
                        Weiter <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 text-center text-[11px] text-muted-foreground">
                  Wir bearbeiten Ihre Anfrage DSGVO-konform. Keine Weitergabe an Dritte.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                               */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer id="kontakt" className="border-t border-border/70 bg-surface/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-[color:var(--alfa-glow)] text-primary-foreground">
              <span className="font-display text-lg font-bold italic">AS</span>
            </div>
            <div>
              <div className="font-display text-lg font-semibold">Auto Semmel</div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Langenselbold · Main-Kinzig-Kreis
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm text-muted-foreground">
            Ihr offizieller Stellantis-Partner für Alfa Romeo, Fiat, Abarth und
            Fiat Professional — seit über 40 Jahren in Langenselbold.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 shadow-[var(--shadow-soft)]">
            <iframe
              title="Auto Semmel · Gelnhäuser Str. 40, 63505 Langenselbold auf Google Maps"
              src="https://maps.google.com/maps?q=Gelnh%C3%A4user%20Str.%2040%2C%2063505%20Langenselbold&t=m&z=15&ie=UTF8&iwloc=B&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-64 w-full border-0"
              allowFullScreen
            />
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Gelnh%C3%A4user%20Str.%2040%2C%2063505%20Langenselbold"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" /> Route planen
          </a>
        </div>

        <div className="lg:col-span-3">
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
            Kontakt
          </h5>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Gelnhäuser Straße 40 · 63505 Langenselbold</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <a href="tel:+4961842633" className="hover:text-foreground">06184 / 2633</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:info@auto-semmel.de" className="hover:text-foreground">info@auto-semmel.de</a>
            </li>
          </ul>
        </div>

        <div id="ueber-uns" className="lg:col-span-2">
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
            Verkauf
          </h5>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex justify-between gap-3"><span>Mo–Fr</span><span className="text-foreground">7:30–17:30</span></li>
            <li className="flex justify-between gap-3"><span>Samstag</span><span className="text-foreground">9:00–14:00</span></li>
            <li className="flex justify-between gap-3"><span>Sonntag</span><span>geschlossen</span></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
            Werkstatt
          </h5>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex justify-between gap-3"><span>Mo–Fr</span><span className="text-foreground">7:30–17:00</span></li>
            <li className="flex justify-between gap-3"><span>Samstag</span><span>nach Termin</span></li>
            <li className="flex justify-between gap-3"><span>Sonntag</span><span>geschlossen</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-5 px-6 py-6 sm:flex-row sm:gap-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Offizieller Servicepartner
          </span>
          <div className="flex items-center gap-6 opacity-90">
            <FiatServiceLogo className="h-9 w-auto" />
            <AlfaRomeoServiceLogo className="h-9 w-auto" />
            <span className="hidden h-7 w-px bg-border sm:block" />
            <StellantisLogo className="h-5 w-auto text-foreground/70" />
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© 2026 Auto Semmel Langenselbold — Offizieller Stellantis-Partner für Alfa Romeo, Fiat &amp; Abarth</div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/karriere" className="transition-colors hover:text-foreground">Karriere</Link>
            <Link to="/impressum" className="transition-colors hover:text-foreground">Impressum</Link>
            <Link to="/datenschutz" className="transition-colors hover:text-foreground">Datenschutz</Link>
            <button onClick={openCookieSettings} className="transition-colors hover:text-foreground">Cookie-Einstellungen</button>
            <a href="#" className="transition-colors hover:text-foreground">AGB</a>
          </div>
        </div>
        <div className="tricolore-bar h-[2px] w-full opacity-50" />
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Highlights · Brand Splitter · Service CTA                          */
/* ------------------------------------------------------------------ */

/** Bevorzugte Highlight-Slugs in Reihenfolge — fallen auf die ersten verfügbaren Fahrzeuge zurück. */
const HIGHLIGHT_SLUGS = [
  "alfa-romeo-tonale-veloce-2025",
  "fiat-500e-la-prima-2025",
  "abarth-595-turismo-2023",
];

function pickHighlights(all: Vehicle[]): Vehicle[] {
  const available = all.filter((v) => v.status === "Verfügbar");
  const bySlug = new Map(available.map((v) => [v.slug ?? "", v] as const));
  const picked: Vehicle[] = [];
  for (const slug of HIGHLIGHT_SLUGS) {
    const v = bySlug.get(slug);
    if (v) picked.push(v);
  }
  for (const v of available) {
    if (picked.length >= 3) break;
    if (!picked.includes(v)) picked.push(v);
  }
  return picked.slice(0, 3);
}

function Highlights() {
  const vehicles = useVehicles();
  const highlights = useMemo(() => pickHighlights(vehicles), [vehicles]);

  if (highlights.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Showroom Langenselbold
            </div>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              Aktuelle Fahrzeug-Highlights in Langenselbold
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Drei handverlesene Empfehlungen unseres Verkaufsteams – sofort verfügbar,
              probefahrbereit und mit Stellantis Garantie.
            </p>
          </div>
          <a
            href="#fahrzeuge"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
          >
            Alle Fahrzeuge ansehen <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((v) => {
            const year = v.firstRegistration ? new Date(v.firstRegistration).getFullYear() : null;
            const slugOrId = v.slug ?? v.id;
            const isElectric = v.fuelType === "Elektro";
            const badge = isElectric
              ? "100% Elektrisch"
              : v.discountPrice && v.discountPrice < v.price
                ? "Top Deal"
                : "Sofort verfügbar";
            const badgeClass = isElectric
              ? "bg-[color:var(--tricolore-green)] text-white"
              : "bg-primary text-primary-foreground";
            const displayPrice = v.discountPrice ?? v.price;
            return (
              <article
                key={v.id}
                className="brand-card group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-background">
                  <img
                    src={v.images[0]}
                    alt={`${v.brand} ${v.model} ${v.version}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span
                    className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow ${badgeClass}`}
                  >
                    {badge}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-primary">{v.brand}</div>
                    <h3 className="mt-1 font-serif text-lg leading-tight">
                      {v.model} {v.version}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {year ? `EZ ${year} · ` : ""}
                      {v.powerHp} PS · {v.fuelType}
                    </p>
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-border/60 pt-4">
                    <div>
                      {v.discountPrice && v.discountPrice < v.price ? (
                        <>
                          <div className="text-xs text-muted-foreground line-through">
                            {v.price.toLocaleString("de-DE")} €
                          </div>
                          <div className="text-2xl font-semibold tracking-tight text-primary">
                            {displayPrice.toLocaleString("de-DE")} €
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-semibold tracking-tight">
                          {displayPrice.toLocaleString("de-DE")} €
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground">inkl. MwSt.</div>
                    </div>
                    <Link
                      to="/fahrzeug/$slug"
                      params={{ slug: slugOrId }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BrandSplitter() {
  return (
    <section className="border-y border-border/60">
      <div className="grid md:grid-cols-2">
        {/* Alfa Romeo */}
        <div
          className="relative overflow-hidden bg-[#0e0f12] px-8 py-20 text-white md:px-14 md:py-28"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(185,14,10,0.35), transparent 55%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 8px)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-transparent" />
          <div className="relative max-w-md">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              La Performance
            </div>
            <h3 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              Alfa Romeo – Die Symbiose aus Luxus und Performance.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Vom Giulia Quadrifoglio bis zum neuen Tonale Plug-in Hybrid:
              entdecken Sie die kompromisslose Ingenieurskunst aus Arese.
            </p>
            <a
              href="#fahrzeuge"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Modelle entdecken <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Fiat & Abarth */}
        <div
          className="relative overflow-hidden bg-[#f6f3ec] px-8 py-20 text-foreground md:px-14 md:py-28"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(0,140,69,0.18), transparent 55%), radial-gradient(circle at 20% 90%, rgba(185,14,10,0.10), transparent 60%)",
          }}
        >
          <div className="relative max-w-md">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#008C45]">
              La Dolce Vita
            </div>
            <h3 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              Fiat &amp; Abarth – Urbaner Fahrspaß und italienisches Lebensgefühl.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Vom elektrischen 500e bis zum kompromisslos sportlichen Abarth 595 –
              kleine Autos mit großem Charakter, gemacht für jeden Tag.
            </p>
            <a
              href="#fahrzeuge"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-[#008C45] hover:bg-[#008C45] hover:text-white"
            >
              Modelle entdecken <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCtaBanner() {
  return (
    <section className="bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-[#1a1b1f] via-[#222428] to-[#0e0f12] px-8 py-12 text-white shadow-xl md:px-14 md:py-16"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 10%, rgba(185,14,10,0.35), transparent 60%), radial-gradient(circle at 10% 90%, rgba(0,140,69,0.18), transparent 55%)",
          }}
        >
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                <Wrench className="h-3.5 w-3.5" /> Werkstatt &amp; Service
              </div>
              <h3 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                Ihr Partner für Service &amp; Werkstatt im Main-Kinzig-Kreis.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Jetzt online Termin vereinbaren – Inspektion, Reifenwechsel,
                HU/AU oder Reparatur. Stellantis-zertifiziert in Langenselbold.
              </p>
            </div>
            <a
              href="#service"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <CalendarCheck className="h-4 w-4" />
              Termin vereinbaren
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Fiat Professional — B2B Nutzfahrzeuge                              */
/* ------------------------------------------------------------------ */

function FiatProfessionalSection() {
  // Mock B2B vehicle (Netto/Brutto explizit)
  const grossPrice = 38_900;
  const netPrice = Math.round(grossPrice / 1.19);
  const specs = [
    { icon: <Package className="h-4 w-4" />, label: "Ladevolumen", value: "11,5 m³" },
    { icon: <Truck className="h-4 w-4" />, label: "Nutzlast", value: "1.485 kg" },
    { icon: <Cog className="h-4 w-4" />, label: "Getriebe", value: "9-Gang Automatik" },
    { icon: <Gauge className="h-4 w-4" />, label: "Leistung", value: "140 PS (103 kW)" },
  ];

  return (
    <section id="gewerbe" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Truck className="h-3.5 w-3.5" /> Fiat Professional · Gewerbe
            </div>
            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
              Fiat Professional — Starke Nutzfahrzeuge für Ihr Unternehmen.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Für Handwerk, Handel und Lieferdienste aus Langenselbold, Hanau und dem
              gesamten Main-Kinzig-Kreis. Persönliche Beratung, attraktives Gewerbe-Leasing
              und Service direkt vor Ort.
            </p>
          </div>
          <a
            href="#kontakt"
            className="hidden text-xs font-semibold uppercase tracking-wider text-primary hover:underline md:inline"
          >
            Komplette Nutzfahrzeug-Range ansehen →
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Vehicle card */}
          <article className="brand-card lg:col-span-3 overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-muted to-background">
              <div className="absolute inset-0 grid place-items-center text-muted-foreground/40">
                <Truck className="h-24 w-24" strokeWidth={1} />
              </div>
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                  Netto ausweisbar
                </span>
                <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                  Gewerbe-Leasing
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Fiat Professional
              </div>
              <h3 className="mt-1 font-display text-xl font-semibold">
                Fiat Ducato Kastenwagen L2H2 140 Multijet
              </h3>

              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border/60 bg-background/50 p-3"
                  >
                    <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.icon} {s.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-border/60 pt-5">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Netto-Preis (Gewerbe)
                  </div>
                  <div className="mt-0.5 font-display text-3xl font-bold text-primary">
                    {netPrice.toLocaleString("de-DE")} €
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Brutto {grossPrice.toLocaleString("de-DE")} € · zzgl. 19 % USt.
                  </div>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Details ansehen <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>

          {/* B2B benefits + CTA */}
          <aside className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold">
                Ihre Vorteile als Gewerbekunde
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Individuelle Leasing- & Finanzierungskonzepte",
                  "MwSt. ausweisbar — voll vorsteuerabzugsfähig",
                  "Persönlicher Gewerbekunden-Betreuer",
                  "Ersatzfahrzeug während Werkstattaufenthalt",
                  "Wartung & Service direkt in Langenselbold",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="text-[11px] font-medium uppercase tracking-wider text-primary/80">
                Maßgeschneidertes Angebot
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold">
                Gewerbliches Leasingangebot anfordern
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Wir kalkulieren Ihre Wunschrate auf Basis von Laufzeit und Laufleistung —
                inklusive Service-Paket auf Anfrage.
              </p>
              <a
                href="tel:+4961842633"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                Gewerbliches Leasingangebot anfordern
              </a>
              <a
                href="tel:+4961842633"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/70 bg-background px-5 py-3 text-xs font-semibold text-foreground transition hover:bg-surface"
              >
                <Phone className="h-3.5 w-3.5" /> Direkt anrufen · 06184 / 2633
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Über Uns & Team                                                    */
/* ------------------------------------------------------------------ */

function AboutTeamSection() {
  const team = [
    {
      name: "Siegfried Polenz",
      role: "Geschäftsführung",
      phone: "06184 / 2633",
      email: "s.polenz@auto-semmel.de",
      tone: "primary" as const,
    },
    {
      name: "Verkaufsteam Alfa Romeo & Fiat",
      role: "Neu- & Gebrauchtwagen",
      phone: "06184 / 2633 -10",
      email: "verkauf@auto-semmel.de",
      tone: "accent" as const,
    },
    {
      name: "Werkstattleitung",
      role: "Service · Stellantis-zertifiziert",
      phone: "06184 / 2633 -20",
      email: "werkstatt@auto-semmel.de",
      tone: "muted" as const,
    },
  ];

  return (
    <section id="ueber-uns" className="bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Award className="h-3.5 w-3.5 text-primary" /> Auto Semmel · seit 1982
            </div>
            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
              Über 40 Jahre Auto Semmel in Langenselbold.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Als inhabergeführtes Familienunternehmen aus dem Main-Kinzig-Kreis verbinden
              wir seit vier Jahrzehnten persönliche Beratung mit echter italienischer
              Auto-Leidenschaft. Als offizieller Stellantis-Partner für Alfa Romeo, Fiat,
              Abarth und Fiat Professional sind wir Ihr verlässlicher Ansprechpartner —
              vom ersten Probefahrt-Termin bis zur Werkstatt nach vielen treuen Jahren.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                "Offizieller Stellantis-Vertragspartner",
                "Eigene Meisterwerkstatt vor Ort",
                "Persönliche Betreuung — keine anonyme Kette",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {team.map((m) => (
              <article
                key={m.name}
                className="brand-card group flex flex-col rounded-2xl border border-border/70 bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`grid h-16 w-16 place-items-center rounded-full ${
                    m.tone === "primary"
                      ? "bg-primary/10 text-primary"
                      : m.tone === "accent"
                        ? "bg-foreground/5 text-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                  aria-hidden
                >
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold leading-tight">
                  {m.name}
                </h3>
                <div className="mt-0.5 text-xs text-muted-foreground">{m.role}</div>

                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                      {m.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <a href={`mailto:${m.email}`} className="truncate hover:underline">
                      {m.email}
                    </a>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) return setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    if (!consent) return setError("Bitte stimmen Sie den Datenschutzbestimmungen zu.");
    setLoading(true);
    try {
      const { subscribeNewsletter } = await import("@/lib/newsletter.functions");
      await subscribeNewsletter({
        data: {
          email: email.trim().toLowerCase(),
          consent: true,
          source: "landing-newsletter-banner",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 512) : undefined,
        },
      });
      setSubmitted(true);
      setCooldown(60);
    } catch (err) {
      console.error(err);
      setError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResendState({ status: "loading" });
    try {
      const { resendNewsletterConfirmation } = await import("@/lib/newsletter.functions");
      const res = await resendNewsletterConfirmation({
        data: { email: email.trim().toLowerCase() },
      });
      if (res.ok) {
        setResendState({ status: "success", message: "Bestätigungs-Mail wurde erneut versendet." });
        setCooldown(60);
      } else if (res.reason === "throttled") {
        setCooldown(res.retryAfterSeconds ?? 60);
        setResendState({
          status: "error",
          message: `Bitte warten Sie noch ${res.retryAfterSeconds ?? 60} Sekunden.`,
        });
      } else if (res.reason === "alreadyConfirmed") {
        setResendState({ status: "success", message: "Diese Adresse ist bereits bestätigt." });
      } else if (res.reason === "unsubscribed") {
        setResendState({
          status: "error",
          message: "Diese Adresse wurde abgemeldet. Bitte melden Sie sich erneut an.",
        });
      } else {
        setResendState({
          status: "error",
          message: "Adresse nicht gefunden. Bitte melden Sie sich erneut an.",
        });
      }
    } catch (err) {
      console.error(err);
      setResendState({ status: "error", message: "Erneutes Senden fehlgeschlagen." });
    }
  };

  return (
    <section className="border-y border-border/60 bg-gradient-to-br from-primary/10 via-card/40 to-primary/5 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-4xl rounded-3xl border border-primary/20 bg-card/80 p-8 shadow-xl backdrop-blur md:p-12">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Mail className="h-3.5 w-3.5" /> Newsletter · La Famiglia
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Bleiben Sie startklar — Der Auto Semmel Newsletter
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Erhalten Sie exklusive Angebote zu Werkstatt-Aktionen (z.B. Reifenwechsel),
                neuen Alfa Romeo & Fiat Modellen und Einladungen zu unseren Hof-Events in Langenselbold.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Maximal 1 E-Mail pro Monat</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Jederzeit per 1-Klick abbestellbar</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> DSGVO-konformes Double-Opt-In</li>
              </ul>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center animate-fade-in">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">Fast fertig!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Wir haben Ihnen eine Bestätigungs-E-Mail an <span className="font-semibold text-foreground">{email}</span> geschickt.
                  Bitte klicken Sie auf den Link, um Ihre Anmeldung abzuschließen.
                </p>
                <div className="mt-5 border-t border-primary/20 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner oder fordern Sie den Link erneut an.
                  </p>
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={resendState.status === "loading" || cooldown > 0}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-background/60 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendState.status === "loading"
                      ? "Wird gesendet…"
                      : cooldown > 0
                        ? `Erneut senden (${cooldown}s)`
                        : "Bestätigung erneut senden"}
                  </button>
                  {resendState.message && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        resendState.status === "success" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {resendState.message}
                    </p>
                  )}
                </div>
              </div>

            ) : (
              <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-background/60 p-6">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre.email@beispiel.de"
                    maxLength={255}
                    className="input w-full"
                    required
                  />
                </div>
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-primary"
                  />
                  <span>
                    Ich stimme den <a href="/datenschutz" className="font-semibold text-primary hover:underline">Datenschutzbestimmungen</a> zu (Double-Opt-In).
                  </span>
                </label>
                {error && <p className="text-xs font-semibold text-primary">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? "Wird gesendet…" : "Jetzt anmelden"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleReviewsSection() {
  const reviews = [
    {
      name: "Max M.",
      location: "Hanau",
      rating: 5,
      date: "Vor 2 Wochen",
      text: "Habe hier meinen neuen Alfa Romeo Tonale gekauft. Von der Beratung bis zur Übergabe absolut erstklassig und familiär. Sehr zu empfehlen!",
      guide: false,
    },
    {
      name: "Sabine S.",
      location: "Langenselbold",
      rating: 5,
      date: "Vor 1 Monat",
      text: "Seit Jahren Kundin mit meinem Fiat 500 in der Werkstatt. Ehrlich, fair, transparent. Hier wird einem nichts aufgeschwatzt.",
      guide: true,
    },
    {
      name: "Thomas K.",
      location: "",
      rating: 5,
      date: "Vor 3 Wochen",
      text: "Reibungsloser Ankauf meines Altfahrzeugs und faire Verrechnung. Sehr kompetentes Team!",
      guide: false,
    },
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-serif text-3xl leading-tight md:text-4xl">
            Das sagen unsere Kunden über Auto Semmel
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Über 300 positive Bewertungen auf Google
          </p>

          {/* Google Overview Badge */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/70 bg-surface px-5 py-2.5 shadow-[var(--shadow-soft)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="Google">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-500 text-amber-500"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              4.8 / 5 Sterne
            </span>
          </div>
        </div>

        {/* Review Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.name}
              className="flex flex-col rounded-2xl border border-border/70 bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-foreground/5 text-xs font-bold text-foreground">
                    {r.name.split(" ")[0][0]}
                    {r.name.split(" ")[1]?.[0] ?? ""}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      {r.name}
                      {r.guide && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          <MapPin className="h-2.5 w-2.5" /> Local Guide
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.location ? `${r.location} · ` : ""}{r.date}
                    </div>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 opacity-60" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>

              <div className="mt-3 flex items-center gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-500 text-amber-500"
                  />
                ))}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {r.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* JSON-LD ItemList — currently visible vehicles                      */
/* ------------------------------------------------------------------ */

const SITE = "https://la-passione-digital.lovable.app";

function buildItemListJsonLd(vehicles: Vehicle[]) {
  const conditionSchema: Record<Condition, string> = {
    Neuwagen: "https://schema.org/NewCondition",
    Tageszulassung: "https://schema.org/UsedCondition",
    Gebrauchtwagen: "https://schema.org/UsedCondition",
  };
  const availabilitySchema: Record<VehicleStatus, string> = {
    Verfügbar: "https://schema.org/InStock",
    Reserviert: "https://schema.org/InStock",
    Verkauft: "https://schema.org/OutOfStock",
  };

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: vehicles.map((v, i) => {
      const url = v.slug ? `${SITE}/fahrzeug/${v.slug}` : `${SITE}/fahrzeug/${v.id}`;
      const image = v.images[0]?.startsWith("http") ? v.images[0] : `${SITE}${v.images[0] ?? ""}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Vehicle",
          name: `${v.brand} ${v.model} ${v.version}`,
          brand: { "@type": "Brand", name: v.brand },
          model: v.model,
          vehicleTransmission: v.transmission,
          fuelType: v.fuelType,
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: v.mileage,
            unitCode: "KMT",
          },
          vehicleEngine: {
            "@type": "EngineSpecification",
            enginePower: {
              "@type": "QuantitativeValue",
              value: v.powerHp,
              unitCode: "BHP",
            },
          },
          image,
          offers: {
            "@type": "Offer",
            price: v.price,
            priceCurrency: "EUR",
            itemCondition: conditionSchema[v.condition],
            availability: availabilitySchema[v.status],
            url,
            seller: {
              "@type": "AutoDealer",
              name: "Auto Semmel GmbH & Co. Siegfried Polenz KG",
              url: SITE,
              telephone: "+49-6184-2633",
            },
          },
        },
      };
    }),
  };
}

function buildAutoDealerJsonLd(vehicles: Vehicle[]) {
  const conditionSchema: Record<Condition, string> = {
    Neuwagen: "https://schema.org/NewCondition",
    Tageszulassung: "https://schema.org/UsedCondition",
    Gebrauchtwagen: "https://schema.org/UsedCondition",
  };
  const availabilitySchema: Record<VehicleStatus, string> = {
    Verfügbar: "https://schema.org/InStock",
    Reserviert: "https://schema.org/InStock",
    Verkauft: "https://schema.org/OutOfStock",
  };

  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${SITE}#dealer`,
    name: "Auto Semmel GmbH & Co. Siegfried Polenz KG",
    image: `${SITE}${heroGiulia}`,
    url: SITE,
    telephone: "+49-6184-2633",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gelnhauser Straße 40",
      addressLocality: "Langenselbold",
      postalCode: "63505",
      addressCountry: "DE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "50.1765",
      longitude: "9.0296",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:30",
        closes: "17:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    makesOffer: vehicles.map((v) => {
      const url = v.slug ? `${SITE}/fahrzeug/${v.slug}` : `${SITE}/fahrzeug/${v.id}`;
      const image = v.images[0]?.startsWith("http") ? v.images[0] : `${SITE}${v.images[0] ?? ""}`;
      return {
        "@type": "Offer",
        price: v.price,
        priceCurrency: "EUR",
        itemCondition: conditionSchema[v.condition],
        availability: availabilitySchema[v.status],
        url,
        itemOffered: {
          "@type": "Vehicle",
          name: `${v.brand} ${v.model} ${v.version}`,
          brand: { "@type": "Brand", name: v.brand },
          model: v.model,
          vehicleTransmission: v.transmission,
          fuelType: v.fuelType,
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: v.mileage,
            unitCode: "KMT",
          },
          vehicleEngine: {
            "@type": "EngineSpecification",
            enginePower: {
              "@type": "QuantitativeValue",
              value: v.powerHp,
              unitCode: "BHP",
            },
          },
          image,
        },
      };
    }),
  };
}

function VehicleItemListSchema({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles.length) return null;
  const jsonLd = buildItemListJsonLd(vehicles);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function AutoDealerSchema({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles.length) return null;
  const jsonLd = buildAutoDealerJsonLd(vehicles);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
