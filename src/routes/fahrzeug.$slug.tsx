import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cog,
  Euro,
  Fuel,
  Gauge,
  Mail,
  Palette,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import { vehicleBySlugQueryOptions } from "@/lib/vehicles-store";
import { leadsStore } from "@/lib/leads-store";
import { SITE_URL } from "@/lib/site";
import { toast } from "sonner";
import HoneypotField from "@/components/HoneypotField";
import OpeningStatus from "@/components/OpeningStatus";
import { useVehicles } from "@/lib/vehicles-store";
import type { Vehicle, Condition, VehicleStatus } from "@/lib/vehicles";

const SITE = SITE_URL;

export const Route = createFileRoute("/fahrzeug/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(vehicleBySlugQueryOptions(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const v = loaderData;
    if (!v) {
      return {
        meta: [{ title: "Fahrzeug nicht gefunden — Auto Semmel" }],
      };
    }
    const title = `${v.brand} ${v.model} ${v.version} — Auto Semmel Langenselbold`;
    const description = `${v.brand} ${v.model} ${v.version}, ${v.condition}, ${v.mileage.toLocaleString(
      "de-DE",
    )} km, ${v.powerHp} PS, ${v.fuelType}, ${v.transmission}. Preis ${v.price.toLocaleString("de-DE")} €.`;
    const image = v.images[0]?.startsWith("http") ? v.images[0] : `${SITE}${v.images[0] ?? ""}`;
    const url = `${SITE}/fahrzeug/${params.slug}`;
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
    const allImages = v.images.map((img) => (img.startsWith("http") ? img : `${SITE}${img}`));
    const firstRegIso = v.firstRegistration
      ? new Date(v.firstRegistration).toISOString().split("T")[0]
      : undefined;
    const color = inferExteriorColor(v);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      "@id": `${url}#vehicle`,
      name: `${v.brand} ${v.model} ${v.version}`,
      description: `${v.condition} ${v.brand} ${v.model} ${v.version} — ${v.mileage.toLocaleString("de-DE")} km, ${v.powerHp} PS, ${v.fuelType}, ${v.transmission}. Verfügbar bei Auto Semmel in Langenselbold.`,
      brand: { "@type": "Brand", name: v.brand },
      manufacturer: { "@type": "Organization", name: v.brand },
      model: v.model,
      sku: v.mobileDeId || v.id.slice(0, 8).toUpperCase(),
      color,
      vehicleModelDate: v.firstRegistration
        ? new Date(v.firstRegistration).getFullYear()
        : undefined,
      dateVehicleFirstRegistered: firstRegIso,
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: v.mileage,
        unitCode: "KMT",
      },
      vehicleTransmission: v.transmission,
      fuelType: v.fuelType,
      vehicleEngine: {
        "@type": "EngineSpecification",
        enginePower: {
          "@type": "QuantitativeValue",
          value: v.powerHp,
          unitCode: "BHP",
        },
      },
      image: allImages.length ? allImages : [image],
      offers: {
        "@type": "Offer",
        "@id": `${url}#offer`,
        price: v.price,
        priceCurrency: "EUR",
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        itemCondition: conditionSchema[v.condition],
        availability: availabilitySchema[v.status],
        url,
        eligibleRegion: "DE",
        businessFunction: "http://purl.org/goodrelations/v1#Sell",
        seller: {
          "@type": "AutoDealer",
          name: "Auto Semmel GmbH & Co. Siegfried Polenz KG",
          url: SITE,
          telephone: "+49-6184-2633",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Gelnhäuser Straße 40",
            addressLocality: "Langenselbold",
            postalCode: "63505",
            addressCountry: "DE",
          },
        },
      },
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { property: "og:image", content: image },
        { property: "product:price:amount", content: String(v.price) },
        { property: "product:price:currency", content: "EUR" },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: VehicleDetailPage,
  notFoundComponent: NotFoundFahrzeug,
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Fehler beim Laden</h1>
      <p className="mt-3 text-muted-foreground">
        Das Fahrzeug konnte gerade nicht geladen werden. Bitte versuchen Sie es später erneut.
      </p>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Zurück zur Startseite
      </Link>
    </div>
  ),
});

function NotFoundFahrzeug() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.3em] text-primary">404</div>
      <h1 className="mt-3 font-display text-4xl font-semibold">Fahrzeug nicht gefunden</h1>
      <p className="mt-3 text-muted-foreground">
        Dieses Fahrzeug ist möglicherweise bereits verkauft oder offline genommen worden.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zum Fahrzeugbestand
      </Link>
    </div>
  );
}

function inferExteriorColor(v: Vehicle): string {
  const hay = `${v.version} ${v.features.join(" ")}`.toLowerCase();
  if (v.brand === "Alfa Romeo") return "Rosso Alfa (Rot)";
  if (hay.includes("ocean") || hay.includes("grün") || hay.includes("green")) return "Ocean Green";
  if (
    hay.includes("scorpion") ||
    hay.includes("grau") ||
    hay.includes("grey") ||
    hay.includes("gray")
  )
    return "Scorpion Grey";
  if (hay.includes("bianco") || hay.includes("weiß") || hay.includes("white"))
    return "Bianco Gelato";
  if (hay.includes("nero") || hay.includes("schwarz") || hay.includes("black"))
    return "Nero Vulcano";
  return "Auf Anfrage";
}

// Crisp, copyright-free placeholder photography (Unsplash) used when a
// vehicle has no images attached yet. Picks brand-appropriate shots so
// the gallery always looks like a real showroom.
const FALLBACK_GALLERY: Record<string, string[]> = {
  "Fiat 500": [
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85",
  ],
  "Fiat 124 Spider": [
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1800&q=85",
  ],
  default: [
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1800&q=85",
  ],
};

function resolveGallery(v: Vehicle): string[] {
  if (v.images && v.images.length > 0) return v.images;
  const key = `${v.brand} ${v.model}`.trim();
  return FALLBACK_GALLERY[key] ?? FALLBACK_GALLERY.default;
}

function VehicleDetailPage() {
  const { slug } = Route.useParams();
  const { data: v } = useSuspenseQuery(vehicleBySlugQueryOptions(slug));
  const [activeImage, setActiveImage] = useState(0);
  if (!v) return <NotFoundFahrzeug />;

  const year = v.firstRegistration ? new Date(v.firstRegistration).getFullYear() : "—";
  const kw = Math.round(v.powerHp * 0.7355);
  const color = inferExteriorColor(v);

  const ezDisplay =
    v.condition === "Neuwagen"
      ? "Neuwagen"
      : v.firstRegistration
        ? new Date(v.firstRegistration).toLocaleDateString("de-DE", {
            month: "2-digit",
            year: "numeric",
          })
        : "—";

  const specRows: { icon: typeof Calendar; label: string; value: string }[] = [
    { icon: Calendar, label: "Erstzulassung", value: ezDisplay },
    { icon: Gauge, label: "Kilometerstand", value: `${v.mileage.toLocaleString("de-DE")} km` },
    { icon: Zap, label: "Leistung", value: `${v.powerHp} PS (${kw} kW)` },
    { icon: Fuel, label: "Kraftstoffart", value: v.fuelType },
    { icon: Cog, label: "Getriebe", value: v.transmission },
    { icon: Palette, label: "Außenfarbe", value: color },
    { icon: ShieldCheck, label: "Zustand", value: v.condition },
    { icon: Car, label: "Fahrzeug-Nr.", value: v.mobileDeId || v.id.slice(0, 8).toUpperCase() },
  ];

  const gallery = resolveGallery(v);
  const safeIndex = Math.min(activeImage, gallery.length - 1);
  const heroImg = gallery[safeIndex];
  const goPrev = () => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setActiveImage((i) => (i + 1) % gallery.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Zurück zum Fahrzeugbestand</span>
            <span className="sm:hidden">Zurück</span>
          </Link>
          <a
            href="tel:+4961842633"
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            <Phone className="h-4 w-4" /> 06184 / 2633
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:py-14">
        {/* Title */}
        <div className="mb-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            <span>{v.brand}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>{year}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>{v.condition}</span>
            {v.badge && (
              <span className="ml-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] text-primary-foreground">
                {v.badge}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {v.brand} {v.model}
            <span className="block text-foreground/70 sm:inline sm:text-foreground/70">
              {" "}
              {v.version}
            </span>
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.55fr,1fr]">
          {/* Left: Gallery + specs + features */}
          <div>
            {/* Premium edge-to-edge image slider */}
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-[#f4f3f0] shadow-sm">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  key={heroImg}
                  src={heroImg}
                  alt={`${v.brand} ${v.model} ${v.version}`}
                  className="h-full w-full animate-fade-in object-cover"
                  loading="eager"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Vorheriges Bild"
                      className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Nächstes Bild"
                      className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Bild ${i + 1} anzeigen`}
                    aria-current={i === safeIndex}
                    className={`group relative overflow-hidden rounded-lg border transition ${
                      i === safeIndex
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/60 hover:border-primary/60"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Service & ownership essentials — clean typography, no overlays */}
            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Leasing",
                  body: "Individuelle Raten ab 0 € Anzahlung — wir rechnen Ihr Wunsch-Paket.",
                },
                {
                  title: "Service",
                  body: "Inklusive 12 Monate Händlergarantie & Stellantis-Werksdiagnose.",
                },
                {
                  title: "Reifenservice",
                  body: "Reifenwechsel, Einlagerung und Auswuchten direkt vor Ort.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-surface px-4 py-4"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    {item.title}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{item.body}</p>
                </div>
              ))}
            </section>

            {/* Technical specifications table */}
            <section className="mt-12">
              <div className="flex items-baseline justify-between border-b border-border/60 pb-3">
                <h2 className="font-display text-2xl font-semibold">Technische Daten</h2>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Strukturierte Daten
                </span>
              </div>
              <dl className="mt-2 divide-y divide-border/60 rounded-xl border border-border/60 bg-surface/60 sm:grid sm:grid-cols-2 sm:divide-y-0">
                {specRows.map(({ icon: Icon, label, value }, idx) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between gap-4 px-5 py-4 sm:border-border/60 ${
                      idx % 2 === 0 ? "sm:border-r" : ""
                    } ${idx >= 2 ? "sm:border-t" : ""}`}
                  >
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </dt>
                    <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Ausstattung */}
            {v.features.length > 0 && (
              <section className="mt-12">
                <div className="flex items-baseline justify-between border-b border-border/60 pb-3">
                  <h2 className="font-display text-2xl font-semibold">
                    Ausstattung &amp; Highlights
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Sonderausstattung
                  </span>
                </div>
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {v.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 rounded-lg border border-border/50 bg-surface/40 p-3 text-sm"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right: sticky sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Master pricing */}
            <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Kaufpreis
              </div>
              {v.discountPrice != null && v.discountPrice < v.price ? (
                <>
                  <div className="mt-1 flex flex-wrap items-baseline gap-3">
                    <div className="font-display text-4xl font-bold text-primary sm:text-5xl">
                      {v.discountPrice.toLocaleString("de-DE")} €
                    </div>
                    <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Sale
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground line-through">
                    statt {v.price.toLocaleString("de-DE")} €
                  </div>
                </>
              ) : (
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="font-display text-4xl font-bold text-primary sm:text-5xl">
                    {v.price.toLocaleString("de-DE")} €
                  </div>
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                inkl. MwSt. {v.vatDeductible && "· MwSt. ausweisbar"}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Angaben gemäß Pkw-EnVKV. Weitere Informationen zum offiziellen Kraftstoffverbrauch
                und den offiziellen spezifischen CO₂-Emissionen neuer Personenkraftwagen können dem
                „Leitfaden über den Kraftstoffverbrauch, die CO₂-Emissionen und den Stromverbrauch
                neuer Personenkraftwagen" entnommen werden.
              </p>

              {/* Interactive financing slider */}
              {/* Direkte Handlungsaufforderung statt erfundener Ratenrechnung */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a
                  href="#probefahrt-form"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  <Car className="h-4 w-4" /> Probefahrt anfragen
                </a>
                <a
                  href="tel:+4961842633"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/70 px-3 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
                >
                  <PhoneCall className="h-4 w-4" /> Anrufen
                </a>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Euro className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Finanzierung oder Inzahlungnahme? Wir erstellen Ihnen gern ein individuelles,
                unverbindliches Angebot.
              </p>

              <TestDriveForm vehicle={v} />
            </div>

            {/* Pkw-EnVKV / WLTP energy label */}
            <EnergyLabel vehicle={v} />

            {/* Ansprechpartner */}
            <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ihr Verkaufsteam in Langenselbold
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href="tel:+4961842633"
                  className="flex items-center gap-2 text-foreground transition hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-primary" /> 06184 / 2633
                </a>
                <a
                  href="mailto:info@auto-semmel.de"
                  className="flex items-center gap-2 break-all text-foreground transition hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-primary" /> info@auto-semmel.de
                </a>
                <OpeningStatus className="text-xs text-muted-foreground" />
              </div>
            </div>
          </aside>
        </div>
        <SimilarVehicles current={v} />
      </main>
    </div>
  );
}

function TestDriveForm({ vehicle }: { vehicle: Vehicle }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [vehicle.id]);

  if (sent) {
    return (
      <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <div className="mt-2 font-display text-lg font-semibold">Anfrage übermittelt</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Wir melden uns innerhalb von 24 Std. zur Terminbestätigung.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await leadsStore.add({
            type: "Probefahrt",
            name: name || "Unbekannt",
            email,
            phone,
            subject: `Probefahrt · ${vehicle.brand} ${vehicle.model} ${vehicle.version}`,
            details: {
              Fahrzeug: `${vehicle.brand} ${vehicle.model} ${vehicle.version}`,
              "Wunsch-Termin": date || "Flexibel",
              Anmerkung: note || "—",
            },
            vehicleId: vehicle.id,
          });
          setSent(true);
        } catch (err) {
          toast.error(
            err instanceof Error && err.message.startsWith("Bitte warten")
              ? err.message
              : "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an: 06184 / 2633.",
          );
        }
      }}
      className="relative mt-5 space-y-3"
    >
      <HoneypotField />
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Car className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
        Probefahrt anfragen
      </div>
      <input
        className="input"
        placeholder="Ihr Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="input"
        type="tel"
        placeholder="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        className="input"
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Wunsch-Termin (z.B. Samstag vormittag)"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <textarea
        className="input"
        rows={3}
        placeholder="Anmerkung (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
      >
        <Send className="h-4 w-4" /> Probefahrt anfragen
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        DSGVO-konform. Keine Weitergabe an Dritte.
      </p>
    </form>
  );
}

/* ---------------- Interactive Financing Slider ---------------- */

/* ---------------- Pkw-EnVKV Energy Label (WLTP) ---------------- */

const CO2_CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;
const CO2_COLORS: Record<(typeof CO2_CLASSES)[number], string> = {
  A: "bg-[#00a651] text-white",
  B: "bg-[#52b747] text-white",
  C: "bg-[#bbd432] text-foreground",
  D: "bg-[#fff200] text-foreground",
  E: "bg-[#fdb913] text-foreground",
  F: "bg-[#f37021] text-white",
  G: "bg-[#ed1c24] text-white",
};

function EnergyLabel({ vehicle: v }: { vehicle: Vehicle }) {
  const raw = (v.co2Class ?? "").trim().toUpperCase();
  const cls = (CO2_CLASSES as readonly string[]).includes(raw)
    ? (raw as (typeof CO2_CLASSES)[number])
    : "";

  // Welche Verbrauchswerte sind je Antriebsart fachlich relevant?
  const fuel = v.fuelType;
  const showLiters =
    (fuel === "Benzin" || fuel === "Diesel" || fuel === "Hybrid") && v.consumptionCombined != null;
  const showKwh = (fuel === "Elektro" || fuel === "Hybrid") && v.powerConsumption != null;
  const showCo2 = v.co2Emissions != null;

  const hasAny = cls || showLiters || showKwh || showCo2;
  if (!hasAny) return null;

  const fmt = (n: number) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Energieverbrauch & CO₂
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold">CO₂-Klasse (WLTP)</h3>
        </div>
        {cls && (
          <span
            className={`grid h-12 w-12 place-items-center rounded-lg text-2xl font-bold ${CO2_COLORS[cls]}`}
            aria-label={`CO₂-Klasse ${cls}`}
          >
            {cls}
          </span>
        )}
      </div>

      {/* A–G scale: A schmal/grün → G breit/rot */}
      <div className="mt-4 space-y-1" role="img" aria-label="CO₂-Effizienzskala A bis G">
        {CO2_CLASSES.map((c, i) => {
          const active = c === cls;
          // 42% (A) → 96% (G), monoton steigend
          const width = 42 + (i / (CO2_CLASSES.length - 1)) * 54;
          return (
            <div key={c} className="flex items-center gap-2">
              <div
                className={`flex h-6 items-center rounded-r-md px-3 text-xs font-bold transition ${
                  CO2_COLORS[c]
                } ${active ? "ring-2 ring-foreground ring-offset-1 ring-offset-surface" : "opacity-55"}`}
                style={{ width: `${width}%` }}
              >
                {c}
              </div>
              {active && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Dieses Fahrzeug
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Verbrauchskacheln — nur antriebsartrelevante Werte */}
      <dl className="mt-5 grid grid-cols-1 gap-2 text-sm">
        {showLiters && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <dt className="text-muted-foreground">Kraftstoffverbrauch komb.</dt>
            <dd className="font-semibold tabular-nums">{fmt(v.consumptionCombined!)} l/100 km</dd>
          </div>
        )}
        {showKwh && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <dt className="text-muted-foreground">Stromverbrauch komb.</dt>
            <dd className="font-semibold tabular-nums">{fmt(v.powerConsumption!)} kWh/100 km</dd>
          </div>
        )}
        {showCo2 && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <dt className="text-muted-foreground">CO₂-Emissionen komb.</dt>
            <dd className="font-semibold tabular-nums">{v.co2Emissions} g/km</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Verbrauchs- und CO₂-Werte ermittelt nach WLTP. Angaben gemäß Pkw-EnVKV in der jeweils
        geltenden Fassung.
      </p>
    </div>
  );
}

/** 3 ähnliche Fahrzeuge: gleiche Marke bevorzugt, sonst nach Preisnähe. */
function SimilarVehicles({ current }: { current: Vehicle }) {
  const all = useVehicles();
  const similar = all
    .filter((x) => x.id !== current.id && x.status !== "Verkauft")
    .map((x) => ({
      x,
      score:
        Math.abs(x.price - current.price) / Math.max(current.price, 1) +
        (x.brand === current.brand ? 0 : 0.5) +
        (x.condition === current.condition ? 0 : 0.2),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((r) => r.x);
  if (similar.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16" aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="font-display text-2xl font-semibold">
        Das könnte Sie auch interessieren
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((x) => (
          <Link
            key={x.id}
            to="/fahrzeug/$slug"
            params={{ slug: x.slug ?? x.id }}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="aspect-[16/10] overflow-hidden bg-background">
              <img
                src={x.images[0]}
                alt={`${x.brand} ${x.model} ${x.version}`}
                loading="lazy"
                decoding="async"
                width={640}
                height={400}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="text-sm font-semibold">
                {x.brand} {x.model}
              </div>
              <div className="truncate text-xs text-muted-foreground">{x.version}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-lg font-bold text-primary">
                  {(x.discountPrice ?? x.price).toLocaleString("de-DE")} €
                </span>
                <span className="text-xs text-muted-foreground">
                  {x.mileage.toLocaleString("de-DE")} km
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
