import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useAuth, useMyRoles } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import {
  Lock,
  LayoutDashboard,
  Car,
  PlusCircle,
  Plug,
  LogOut,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Activity,
  KeyRound,
  Database,
  Inbox,
  Wrench,
  Euro,
  Phone,
  Mail,
  Sparkles,
  Loader2,
  Copy,
  Check,
  CalendarDays,
  Star,
  TrendingUp,
  Plus,
  Link2,
  Bell,
  Send,
  Download,
  Briefcase,
  Users,
  Power,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import VehicleImportPanel from "@/components/admin/VehicleImportPanel";
import WerkstattPlaner from "@/components/admin/WerkstattPlaner";
import ReviewsManager from "@/components/admin/ReviewsManager";
import { getBuybackPhotoUrls, deleteBuybackPhotos } from "@/lib/buyback-photos.functions";
import { PHOTO_DETAIL_KEY, photoPathsFromDetails } from "@/lib/buyback-photos";
import NewsletterManager from "@/components/admin/NewsletterManager";
import TeamManager from "@/components/admin/TeamManager";
import {
  MODELS_BY_BRAND,
  type Brand,
  type Condition,
  type FuelType,
  type Transmission,
} from "@/lib/vehicles";
import { useVehicles, vehiclesStore, type AdminVehicle } from "@/lib/vehicles-store";
import { leadsStore, useLeads, type Lead, type LeadStatus } from "@/lib/leads-store";
import {
  careersStore,
  useApplicants,
  useJobs,
  type Applicant,
  type ApplicantStatus,
  type JobPosting,
} from "@/lib/careers-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Auto Semmel — Händler-Dashboard" },
      { name: "description", content: "Internes Verwaltungs-Dashboard für Auto Semmel." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const { isStaff, isAdmin } = useMyRoles(user);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Lade…
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  if (!isStaff) {
    return <NoAccessScreen email={user.email ?? ""} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard
        onLogout={handleLogout}
        userEmail={user.email ?? ""}
        userId={user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6 text-foreground">
      <div className="absolute inset-0 carbon-texture opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(185,14,10,0.18),_transparent_60%)]" />
      <div className="relative w-full max-w-md text-center">
        <div className="tricolore-bar mx-auto mb-6 h-[3px] w-24 opacity-80" />
        <div className="glass rounded-2xl border border-border/60 p-8 shadow-2xl">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Auto Semmel</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Händler-Dashboard</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bitte melden Sie sich an, um auf den geschützten Bereich zuzugreifen.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(185,14,10,0.6)] transition hover:bg-primary/90"
          >
            <Lock className="h-4 w-4" /> Zum Login
          </Link>
          <Link
            to="/"
            className="mt-4 inline-flex items-center justify-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück zur Website
          </Link>
        </div>
      </div>
    </div>
  );
}

function NoAccessScreen({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function claim() {
    setBusy(true);
    setMsg(null);
    try {
      const { claimFirstAdmin } = await import("@/lib/admin-bootstrap.functions");
      const result = await claimFirstAdmin();
      if (result.granted) {
        setMsg("Admin-Rechte erteilt. Lade Dashboard…");
        router.invalidate();
      } else {
        setMsg(result.reason);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Bootstrap fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-amber-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-semibold">Kein Zugriff</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ihr Konto <span className="text-foreground">{email}</span> hat keine Berechtigung für das
          Händler-Dashboard.
        </p>
        <button
          onClick={claim}
          disabled={busy}
          className="mt-5 w-full rounded-lg border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-60"
        >
          {busy ? "Prüfe…" : "Als ersten Administrator einrichten"}
        </button>
        {msg && (
          <p className="mt-3 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            {msg}
          </p>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          Funktioniert nur einmalig, solange noch kein Administrator existiert. Weitere Mitarbeiter
          werden anschließend über das Backend angelegt.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={onLogout}
            className="rounded-lg border border-border/70 bg-card/40 px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted/30"
          >
            Abmelden
          </button>
          <Link
            to="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Zur Website
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

type Tab =
  | "list"
  | "new"
  | "leads"
  | "api"
  | "calendar"
  | "reviews"
  | "newsletter"
  | "emailq"
  | "careers"
  | "team";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Dashboard({
  onLogout,
  userEmail,
  userId,
  isAdmin,
}: {
  onLogout: () => void;
  userEmail: string;
  userId: string;
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<Tab>("list");
  const vehicles = useVehicles();
  const leads = useLeads();
  const newLeadCount = leads.filter((l) => l.status === "Neu").length;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="border-b border-border/60 bg-card/40 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-sm font-bold">AS</span>
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-tight">Auto Semmel</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Dashboard
              </p>
            </div>
          </Link>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            title="Abmelden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-1 lg:px-3 lg:pb-6">
          <NavBtn
            icon={<Car className="h-4 w-4" />}
            active={tab === "list"}
            onClick={() => setTab("list")}
          >
            Fahrzeugliste
            <span className="ml-auto rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px]">
              {vehicles.length}
            </span>
          </NavBtn>
          <NavBtn
            icon={<PlusCircle className="h-4 w-4" />}
            active={tab === "new"}
            onClick={() => setTab("new")}
          >
            Neues Fahrzeug
          </NavBtn>
          <NavBtn
            icon={<Inbox className="h-4 w-4" />}
            active={tab === "leads"}
            onClick={() => setTab("leads")}
          >
            Posteingang / Leads
            {newLeadCount > 0 && (
              <span className="relative ml-auto inline-flex">
                <span className="absolute inset-0 animate-ping rounded-md bg-primary/60" />
                <span className="relative rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                  {newLeadCount}
                </span>
              </span>
            )}
          </NavBtn>
          <NavBtn
            icon={<CalendarDays className="h-4 w-4" />}
            active={tab === "calendar"}
            onClick={() => setTab("calendar")}
          >
            Werkstatt-Planer
          </NavBtn>
          <NavBtn
            icon={<Star className="h-4 w-4" />}
            active={tab === "reviews"}
            onClick={() => setTab("reviews")}
          >
            Kundenbewertungen
          </NavBtn>
          <NavBtn
            icon={<Mail className="h-4 w-4" />}
            active={tab === "newsletter"}
            onClick={() => setTab("newsletter")}
          >
            Newsletter & Marketing
          </NavBtn>
          <NavBtn
            icon={<Inbox className="h-4 w-4" />}
            active={tab === "emailq"}
            onClick={() => setTab("emailq")}
          >
            E-Mail-Queue
          </NavBtn>
          <NavBtn
            icon={<Briefcase className="h-4 w-4" />}
            active={tab === "careers"}
            onClick={() => setTab("careers")}
          >
            Stellen & Bewerber
          </NavBtn>
          <NavBtn
            icon={<Plug className="h-4 w-4" />}
            active={tab === "api"}
            onClick={() => setTab("api")}
          >
            Import & Schnittstellen
          </NavBtn>
          {isAdmin && (
            <NavBtn
              icon={<ShieldCheck className="h-4 w-4" />}
              active={tab === "team"}
              onClick={() => setTab("team")}
            >
              Team & Rollen
            </NavBtn>
          )}
        </nav>

        <div className="hidden border-t border-border/60 p-6 lg:block">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              System Online
            </div>
            <p className="text-xs text-muted-foreground">Letzter Sync · gerade eben</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-8 lg:px-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {tab === "list" && "Bestand verwalten"}
              {tab === "new" && "Neuen Eintrag erstellen"}
              {tab === "leads" && "Kundenanfragen"}
              {tab === "calendar" && "Werkstatt-Planer"}
              {tab === "reviews" && "Reputation"}
              {tab === "newsletter" && "Marketing & CRM"}
              {tab === "emailq" && "Zustellung & Monitoring"}
              {tab === "careers" && "Personal & Bewerbungen"}
              {tab === "api" && "Integrationen"}
              {tab === "team" && "Zugänge & Berechtigungen"}
            </p>
            <h1 className="font-display text-3xl font-semibold">
              {tab === "list" && "Fahrzeugliste"}
              {tab === "new" && "Neues Fahrzeug anlegen"}
              {tab === "leads" && "Posteingang / Leads"}
              {tab === "calendar" && "Werkstatt-Kalender"}
              {tab === "reviews" && "Kundenbewertungen"}
              {tab === "newsletter" && "Newsletter & Marketing"}
              {tab === "emailq" && "Transaktionale E-Mail-Queue"}
              {tab === "careers" && "Stellen & Bewerber"}
              {tab === "api" && "Import & Schnittstellen"}
              {tab === "team" && "Team & Rollen"}
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <LayoutDashboard className="h-3.5 w-3.5" /> {userEmail || "Admin"} · Langenselbold
          </div>
        </header>

        <KpiHeader vehicles={vehicles} openLeads={newLeadCount} />

        {tab === "list" && <VehicleList vehicles={vehicles} />}
        {tab === "new" && <NewVehicleForm onCreated={() => setTab("list")} />}
        {tab === "leads" && <LeadsInbox leads={leads} />}
        {tab === "calendar" && <WerkstattPlaner />}
        {tab === "reviews" && <ReviewsManager />}
        {tab === "newsletter" && <NewsletterManager />}
        {tab === "emailq" && <EmailQueueView />}
        {tab === "careers" && <CareersManager />}
        {tab === "api" && <ApiStatus />}
        {tab === "team" && isAdmin && <TeamManager currentUserId={userId} />}

        <footer className="mt-12 border-t border-border/60 pt-5 text-[11px] text-muted-foreground">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              © 2026 Auto Semmel Langenselbold — Offizieller Stellantis-Partner für Alfa Romeo, Fiat
              &amp; Abarth
            </div>
            <div>Gelnhäuser Straße 40 · 63505 Langenselbold</div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavBtn({
  icon,
  active,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------- Vehicle list ---------------- */

function VehicleList({ vehicles }: { vehicles: AdminVehicle[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
      {vehicles.length === 0 && (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Keine Fahrzeuge im Bestand.
        </div>
      )}

      <ul className="divide-y divide-border/40">
        {vehicles.map((v) => (
          <VehicleListRow key={v.id} v={v} />
        ))}
      </ul>
    </div>
  );
}

function VehicleListRow({ v }: { v: AdminVehicle }) {
  const [showDiscount, setShowDiscount] = useState(v.discountPrice != null);
  const [draft, setDraft] = useState<string>(
    v.discountPrice != null ? String(v.discountPrice) : "",
  );

  const isReduced = v.discountPrice != null;

  async function setStatus(status: AdminVehicle["status"]) {
    await vehiclesStore.update(v.id, { status });
  }
  async function toggleReduced() {
    if (isReduced) {
      setShowDiscount(false);
      setDraft("");
      await vehiclesStore.update(v.id, { discountPrice: null });
    } else {
      setShowDiscount(true);
    }
  }
  async function saveDiscount() {
    const n = Number(draft);
    if (!n || n <= 0 || n >= v.price) return;
    await vehiclesStore.update(v.id, { discountPrice: n });
  }

  return (
    <li className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[80px_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.4fr)_120px] md:items-center">
      <div className="h-14 w-20 overflow-hidden rounded-lg bg-muted">
        {v.images[0] ? (
          <img src={v.images[0]} alt={v.model} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.brand}</p>
        <p className="truncate font-medium">
          {v.model} <span className="text-muted-foreground">{v.version}</span>
        </p>
      </div>
      <div>
        {isReduced ? (
          <>
            <div className="text-xs text-muted-foreground line-through">
              {v.price.toLocaleString("de-DE")} €
            </div>
            <div className="font-display text-lg font-semibold text-primary">
              {v.discountPrice!.toLocaleString("de-DE")} €
            </div>
          </>
        ) : (
          <div className="font-display text-lg font-semibold">
            {v.price.toLocaleString("de-DE")} €
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <QuickToggle
          active={v.status === "Verfügbar"}
          tone="green"
          onClick={() => setStatus("Verfügbar")}
        >
          Verfügbar
        </QuickToggle>
        <QuickToggle
          active={v.status === "Reserviert"}
          tone="amber"
          onClick={() => setStatus("Reserviert")}
        >
          Reserviert
        </QuickToggle>
        <QuickToggle active={isReduced} tone="red" onClick={toggleReduced}>
          Preis reduziert
        </QuickToggle>
        {showDiscount && !isReduced && (
          <div className="flex w-full items-center gap-1.5 pt-1">
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`< ${v.price.toLocaleString("de-DE")} €`}
              className="h-8 w-32 rounded-md border border-border bg-input px-2 text-xs focus:border-primary focus:outline-none"
            />
            <button
              onClick={saveDiscount}
              className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
            >
              Speichern
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-start gap-2 md:justify-end">
        {v.status === "Verfügbar" && (
          <button
            onClick={() => vehiclesStore.markSold(v.id)}
            className="rounded-lg border border-border/60 p-2 text-emerald-700 transition hover:border-emerald-500/60 hover:bg-emerald-500/10"
            title="Als verkauft markieren"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(`"${v.brand} ${v.model}" wirklich löschen?`)) vehiclesStore.remove(v.id);
          }}
          className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
          title="Löschen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function QuickToggle({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: "green" | "amber" | "red";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const toneCls: Record<typeof tone, string> = {
    green: active
      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/50"
      : "border-border/60 text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-700",
    amber: active
      ? "bg-amber-500/15 text-amber-700 border-amber-500/50"
      : "border-border/60 text-muted-foreground hover:border-amber-500/40 hover:text-amber-700",
    red: active
      ? "bg-primary/15 text-primary border-primary/50"
      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${toneCls[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? tone === "green"
              ? "bg-emerald-500"
              : tone === "amber"
                ? "bg-amber-500"
                : "bg-primary"
            : "bg-muted-foreground/40"
        }`}
      />
      {children}
    </button>
  );
}

/* ---------------- New vehicle form ---------------- */

const BRANDS: Brand[] = ["Alfa Romeo", "Fiat", "Abarth", "Fiat Professional"];
const CONDITIONS: Condition[] = ["Neuwagen", "Tageszulassung", "Gebrauchtwagen"];
const FUELS: FuelType[] = ["Benzin", "Diesel", "Hybrid", "Elektro"];
const GEARS: Transmission[] = ["Automatik", "Schaltgetriebe"];

interface FormState {
  brand: Brand;
  model: string;
  version: string;
  condition: Condition;
  price: string;
  vatDeductible: boolean;
  financingMonthly: string;
  mileage: string;
  firstRegistration: string;
  powerHp: string;
  fuelType: FuelType;
  transmission: Transmission;
  features: string;
  co2Class: string;
  consumptionCombined: string;
  powerConsumption: string;
  co2Emissions: string;
}

const initialForm: FormState = {
  brand: "Alfa Romeo",
  model: "",
  version: "",
  condition: "Neuwagen",
  price: "",
  vatDeductible: true,
  financingMonthly: "",
  mileage: "",
  firstRegistration: new Date().toISOString().slice(0, 10),
  powerHp: "",
  fuelType: "Benzin",
  transmission: "Automatik",
  features: "",
  co2Class: "B",
  consumptionCombined: "",
  powerConsumption: "",
  co2Emissions: "",
};

function NewVehicleForm({ onCreated }: { onCreated: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<string[]>([]);

  const models = useMemo(
    () => MODELS_BY_BRAND[form.brand].filter((m) => m !== "Alle Modelle"),
    [form.brand],
  );

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((f) => urls.push(URL.createObjectURL(f)));
    setImages((prev) => [...prev, ...urls]);
  }

  function submit() {
    const price = Number(form.price) || 0;
    const isElectric = form.fuelType === "Elektro";
    void vehiclesStore.add({
      brand: form.brand,
      model: form.model || "Modell",
      version: form.version,
      condition: form.condition,
      price,
      vatDeductible: form.vatDeductible,
      financingMonthly: Number(form.financingMonthly) || 0,
      mileage: Number(form.mileage) || 0,
      firstRegistration: form.firstRegistration,
      powerHp: Number(form.powerHp) || 0,
      fuelType: form.fuelType,
      transmission: form.transmission,
      imageUrls: images,
      features: form.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      badge: null,
      co2Class: form.co2Class || null,
      consumptionCombined:
        !isElectric && form.consumptionCombined ? Number(form.consumptionCombined) : null,
      powerConsumption:
        (isElectric || form.fuelType === "Hybrid") && form.powerConsumption
          ? Number(form.powerConsumption)
          : null,
      co2Emissions: form.co2Emissions ? Number(form.co2Emissions) : null,
    });
    setForm(initialForm);
    setImages([]);
    setStep(0);
    onCreated();
  }

  const steps = ["Marke & Modell", "Technische Daten", "Preis & Medien"];

  return (
    <div className="mx-auto max-w-4xl">
      <Stepper step={step} labels={steps} />

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 md:p-8">
        {step === 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Marke">
              <select
                className="input"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value as Brand)}
              >
                {BRANDS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Modell">
              <input
                list="model-options"
                className="input"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="z.B. Tonale"
              />
              <datalist id="model-options">
                {models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field label="Version / Ausstattung">
              <input
                className="input"
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
                placeholder="z.B. 1.5 VGT MHEV TCT Veloce"
              />
            </Field>
            <Field label="Zustand">
              <select
                className="input"
                value={form.condition}
                onChange={(e) => set("condition", e.target.value as Condition)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Erstzulassung">
              <input
                type="date"
                className="input"
                value={form.firstRegistration}
                onChange={(e) => set("firstRegistration", e.target.value)}
              />
            </Field>
            <Field label="Kilometerstand (km)">
              <input
                type="number"
                className="input"
                value={form.mileage}
                onChange={(e) => set("mileage", e.target.value)}
                placeholder="z.B. 24300"
              />
            </Field>
            <Field label="Leistung (PS)">
              <input
                type="number"
                className="input"
                value={form.powerHp}
                onChange={(e) => set("powerHp", e.target.value)}
                placeholder="z.B. 160"
              />
            </Field>
            <Field label="Kraftstoff">
              <select
                className="input"
                value={form.fuelType}
                onChange={(e) => set("fuelType", e.target.value as FuelType)}
              >
                {FUELS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Getriebe">
              <select
                className="input"
                value={form.transmission}
                onChange={(e) => set("transmission", e.target.value as Transmission)}
              >
                {GEARS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Ausstattung (kommagetrennt)">
              <input
                className="input"
                value={form.features}
                onChange={(e) => set("features", e.target.value)}
                placeholder="Panoramadach, Lederausstattung, …"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 grid gap-5 rounded-xl border border-border/60 bg-background/40 p-5 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Pflichtangaben gemäß Pkw-EnVKV (WLTP)
            </div>
            <Field label="CO₂-Effizienzklasse">
              <select
                className="input"
                value={form.co2Class}
                onChange={(e) => set("co2Class", e.target.value)}
              >
                <option value="">— bitte wählen —</option>
                {["A", "B", "C", "D", "E", "F", "G"].map((c) => (
                  <option key={c} value={c}>
                    Klasse {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="CO₂-Emissionen komb. (g/km)">
              <input
                type="number"
                className="input"
                value={form.co2Emissions}
                onChange={(e) => set("co2Emissions", e.target.value)}
                placeholder="z.B. 142"
              />
            </Field>
            {form.fuelType !== "Elektro" && (
              <Field label="Kraftstoffverbrauch komb. (l/100 km)">
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={form.consumptionCombined}
                  onChange={(e) => set("consumptionCombined", e.target.value)}
                  placeholder="z.B. 6.2"
                />
              </Field>
            )}
            {(form.fuelType === "Elektro" || form.fuelType === "Hybrid") && (
              <Field label="Stromverbrauch komb. (kWh/100 km)">
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={form.powerConsumption}
                  onChange={(e) => set("powerConsumption", e.target.value)}
                  placeholder="z.B. 17.5"
                />
              </Field>
            )}
          </div>
        )}

        {step === 1 && <AiInseratAssistant form={form} />}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Preis (€)">
                <input
                  type="number"
                  className="input"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="34890"
                />
              </Field>
              <Field label="Finanzierung ab (€/Monat)">
                <input
                  type="number"
                  className="input"
                  value={form.financingMonthly}
                  onChange={(e) => set("financingMonthly", e.target.value)}
                  placeholder="249"
                />
              </Field>
              <label className="flex cursor-pointer items-end gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.vatDeductible}
                  onChange={(e) => set("vatDeductible", e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">MwSt. ausweisbar</span>
              </label>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Fahrzeugbilder
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-background/40 px-6 py-10 text-center transition hover:border-primary/60 hover:bg-primary/5">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Bilder hochladen</span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG bis 10 MB · Mehrfachauswahl möglich
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
                  {images.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border/60"
                    >
                      <img
                        src={src}
                        alt={`Vorschau Fahrzeugbild ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/80 text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border/60 pt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
            >
              Weiter <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
            >
              <CheckCircle2 className="h-4 w-4" /> Fahrzeug veröffentlichen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- AI Inserat-Assistent ---------------- */

function AiInseratAssistant({ form }: { form: FormState }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setLoading(true);
    setText("");
    setCopied(false);
    setTimeout(() => {
      setText(buildInseratText(form));
      setLoading(false);
    }, 2000);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-semibold">KI-Inserats-Assistent</h3>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Beta
              </span>
            </div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Emotionalen, suchmaschinenoptimierten deutschen Verkaufstext aus den Fahrzeugdaten
              erzeugen.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          style={{ minWidth: "22rem" }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "KI generiert…" : "Verkaufstext generieren"}
        </button>
      </div>

      <div className="relative mt-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Hier erscheint der von der KI generierte Verkaufstext – feinjustierbar, bevor Sie ihn übernehmen."
          className="input min-h-[180px] resize-y leading-relaxed"
        />
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-full border border-primary/30 bg-background/90 px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              KI generiert Text für Auto Semmel…
            </div>
          </div>
        )}
      </div>

      {text && !loading && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Tipp: Bitte vor Veröffentlichung kurz prüfen – die KI generiert auf Basis Ihrer
            Eingaben.
          </p>
          <button
            type="button"
            onClick={copyText}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Kopiert" : "Text kopieren"}
          </button>
        </div>
      )}
    </div>
  );
}

function buildInseratText(f: FormState): string {
  const brand = f.brand || "Italiener";
  const model = f.model || "Modell";
  const version = f.version ? ` ${f.version}` : "";
  const ps = f.powerHp ? `${f.powerHp} PS` : "kraftvoller Motorisierung";
  const km = f.mileage
    ? `${Number(f.mileage).toLocaleString("de-DE")} km`
    : "geringer Laufleistung";
  const fuel = f.fuelType;
  const gear = f.transmission;
  const features = f.features
    ? f.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(", ")
    : "Matrix-LED, edle Alufelgen und ein Interieur, das Luxus neu definiert";

  if (brand === "Alfa Romeo") {
    return `Erleben Sie echte italienische Passion! Dieser wunderschöne ${brand} ${model}${version} vereint bahnbrechende ${fuel}-Technologie (${ps}, ${gear}) mit der unvergleichlichen Dynamik der Traditionsmarke aus Mailand. Perfekt gepflegt, nur ${km} – sofort verfügbar in Langenselbold. Highlights: ${features}. Vereinbaren Sie jetzt Ihre persönliche Probefahrt bei Auto Semmel – Ihrem Stellantis-Partner im Main-Kinzig-Kreis. La Passione wartet auf Sie!`;
  }
  if (brand === "Abarth") {
    return `Adrenalin in Reinkultur: Der ${brand} ${model}${version} ist kein Auto – er ist ein Statement. ${ps}, ${gear}, kompromisslose Performance und der unverwechselbare Skorpion-Sound. Mit nur ${km} und ${fuel}-Antrieb ist dieses Sammlerstück sofort fahrbereit. Ausstattung der Extraklasse: ${features}. Erleben Sie italienische Rennsport-DNA live in Langenselbold – jetzt Probefahrt bei Auto Semmel sichern!`;
  }
  if (brand === "Fiat Professional") {
    return `Ihr zuverlässiger Partner für jedes Projekt: Der ${brand} ${model}${version} überzeugt mit ${ps} ${fuel}, ${gear} und nur ${km} – wirtschaftlich, robust und sofort einsatzbereit. Ausstattung: ${features}. Profitieren Sie von 40+ Jahren Stellantis-Kompetenz bei Auto Semmel in Langenselbold. Vereinbaren Sie jetzt einen Beratungstermin – wir konfigurieren Ihre Mobilität.`;
  }
  return `Pure italienische Lebensfreude: Der ${brand} ${model}${version} bringt mediterranen Charme auf deutsche Straßen. ${ps} ${fuel}, ${gear}, gepflegte ${km} – ein echtes Lifestyle-Statement aus Turin. Highlights: ${features}. Jetzt entdecken bei Auto Semmel in Langenselbold – Ihrem Partner für italienische Automobil-Kultur im Main-Kinzig-Kreis. Vereinbaren Sie heute Ihre Probefahrt!`;
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="flex items-center gap-3">
      {labels.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={label} className="flex flex-1 items-center gap-3">
            <div
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : done
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700"
                    : "border-border/60 bg-card text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden text-sm md:inline ${active ? "text-foreground" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {i < labels.length - 1 && <div className="h-px flex-1 bg-border/60" />}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- API status ---------------- */

function ApiStatus() {
  return (
    <div className="space-y-6">
      <VehicleImportPanel />
      <div className="grid gap-4 lg:grid-cols-3">
        <StatusCard
          title="Datenbank"
          subtitle="Fahrzeugbestand"
          icon={<Database className="h-5 w-5" />}
          status="ready"
          statusLabel="Bereit"
          desc="Fahrzeuge, Anfragen und Newsletter werden in der Datenbank gespeichert."
        />
        <StatusCard
          title="mobile.de / AutoScout24"
          subtitle="Direktanbindung"
          icon={<Activity className="h-5 w-5" />}
          status="standby"
          statusLabel="Nicht angebunden"
          desc="Import aktuell per Datei oder API-Endpunkt. Direkte Schnittstelle auf Anfrage."
        />
        <StatusCard
          title="DAT / Schwacke Bewertung"
          subtitle="Ankauf-Modul"
          icon={<ShieldCheck className="h-5 w-5" />}
          status="standby"
          statusLabel="Geplant"
          desc="Automatische Fahrzeugbewertung für Ankaufsanfragen."
        />
      </div>
    </div>
  );
}

function StatusCard({
  title,
  subtitle,
  icon,
  status,
  statusLabel,
  desc,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: "ready" | "standby";
  statusLabel: string;
  desc: string;
}) {
  const cls =
    status === "ready" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700";
  const dot = status === "ready" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted/50 text-foreground">
            {icon}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {subtitle}
            </p>
            <p className="font-medium">{title}</p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {statusLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ---------------- Leads inbox ---------------- */

const LEAD_TYPE_META: Record<Lead["type"], { icon: typeof Car; tint: string; label: string }> = {
  Probefahrt: { icon: Car, tint: "bg-primary/15 text-primary", label: "Probefahrt" },
  Werkstattermin: { icon: Wrench, tint: "bg-blue-500/15 text-blue-400", label: "Werkstatt" },
  Fahrzeugankauf: { icon: Euro, tint: "bg-emerald-500/15 text-emerald-700", label: "Ankauf" },
  Kontakt: { icon: Mail, tint: "bg-muted/40 text-foreground", label: "Kontakt" },
};

const STATUS_META: Record<LeadStatus, string> = {
  Neu: "bg-primary/15 text-primary",
  "In Bearbeitung": "bg-amber-500/15 text-amber-700",
  Erledigt: "bg-emerald-500/15 text-emerald-700",
};

function formatAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "gerade eben";
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std`;
  return `vor ${Math.floor(diff / 86400)} Tagen`;
}

function LeadsInbox({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<"Alle" | LeadStatus>("Alle");
  const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id ?? null);

  const filtered = useMemo(
    () => (filter === "Alle" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );
  const selected = filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;

  const counts = {
    Alle: leads.length,
    Neu: leads.filter((l) => l.status === "Neu").length,
    "In Bearbeitung": leads.filter((l) => l.status === "In Bearbeitung").length,
    Erledigt: leads.filter((l) => l.status === "Erledigt").length,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(["Alle", "Neu", "In Bearbeitung", "Erledigt"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f} <span className="ml-1 text-muted-foreground">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">Keine Anfragen.</div>
          )}
          <ul className="divide-y divide-border/40">
            {filtered.map((l) => {
              const meta = LEAD_TYPE_META[l.type];
              const Icon = meta.icon;
              const active = selected?.id === l.id;
              const isTopNew =
                l.status === "Neu" && filtered.find((x) => x.status === "Neu")?.id === l.id;
              return (
                <li
                  key={l.id}
                  className={
                    isTopNew
                      ? "relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent ring-1 ring-inset ring-primary/30 animate-fade-in"
                      : ""
                  }
                >
                  {isTopNew && (
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary" />
                  )}
                  <button
                    onClick={() => setSelectedId(l.id)}
                    className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-200 ${
                      active && !isTopNew
                        ? "bg-primary/5"
                        : !isTopNew
                          ? "hover:bg-muted/30"
                          : "hover:bg-primary/10"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${meta.tint}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {isTopNew && (
                            <span className="mr-1.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                              Neu
                            </span>
                          )}
                          {l.name}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatAgo(l.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 truncate text-xs ${isTopNew ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}
                      >
                        {l.subject}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_META[l.status]}`}
                        >
                          {l.status}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {selected ? (
        <LeadDetail lead={selected} />
      ) : (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center text-sm text-muted-foreground">
          Wählen Sie eine Anfrage links aus.
        </div>
      )}
    </div>
  );
}

function LeadPhotos({ paths }: { paths: string[] }) {
  const { data: urls = [], isLoading } = useQuery({
    queryKey: ["lead-photos", paths.join("|")],
    queryFn: () => getBuybackPhotoUrls({ data: { paths } }),
    staleTime: 30 * 60_000,
  });
  if (paths.length === 0) return null;
  return (
    <div className="mt-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Fotos vom Kunden
      </div>
      {isLoading && <p className="text-xs text-muted-foreground">Lade Fotos …</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {urls.map((u, i) => (
          <a key={u} href={u} target="_blank" rel="noopener noreferrer">
            <img
              src={u}
              alt={`Kundenfoto ${i + 1}`}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-lg border border-border/60 object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function LeadDetail({ lead }: { lead: Lead }) {
  const meta = LEAD_TYPE_META[lead.type];
  const Icon = meta.icon;
  const photoPaths = photoPathsFromDetails(lead.details);
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-start gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl ${meta.tint}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {meta.label} · {formatAgo(lead.createdAt)}
            </p>
            <h3 className="font-display text-xl font-semibold">{lead.subject}</h3>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_META[lead.status]}`}
        >
          {lead.status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Kunde</div>
          <div className="mt-1 font-medium">{lead.name}</div>
        </div>
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 p-3 transition hover:border-primary/60"
          >
            <Phone className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Telefon
              </div>
              <div className="text-sm font-medium">{lead.phone}</div>
            </div>
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 p-3 transition hover:border-primary/60 sm:col-span-2"
          >
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                E-Mail
              </div>
              <div className="text-sm font-medium">{lead.email}</div>
            </div>
          </a>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Details
        </div>
        <dl className="overflow-hidden rounded-lg border border-border/60 bg-background/40 text-sm">
          {Object.entries(lead.details)
            .filter(([k]) => k !== PHOTO_DETAIL_KEY)
            .map(([k, v], i, arr) => (
              <div
                key={k}
                className={`grid grid-cols-[140px_1fr] gap-2 px-4 py-2.5 ${
                  i < arr.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
        </dl>
      </div>

      <LeadPhotos paths={photoPaths} />

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/60 pt-5">
        <span className="text-xs text-muted-foreground">Status ändern:</span>
        {(["Neu", "In Bearbeitung", "Erledigt"] as LeadStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => leadsStore.setStatus(lead.id, s)}
            disabled={lead.status === s}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              lead.status === s
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => {
            if (!confirm("Anfrage wirklich löschen?")) return;
            if (photoPaths.length)
              deleteBuybackPhotos({ data: { paths: photoPaths } }).catch(() => {});
            leadsStore.remove(lead.id);
          }}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-primary"
        >
          <Trash2 className="h-3.5 w-3.5" /> Löschen
        </button>
      </div>
    </div>
  );
}

/* ---------------- KPI Header ---------------- */

function KpiHeader({ vehicles, openLeads }: { vehicles: AdminVehicle[]; openLeads: number }) {
  const active = vehicles.filter((v) => v.status !== "Verkauft");
  const total = active.reduce((sum, v) => sum + (v.discountPrice ?? v.price), 0);
  const avg = active.length ? Math.round(total / active.length) : 0;
  const eur = (n: number) => `${n.toLocaleString("de-DE")} €`;
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <KpiCard
        icon={<Car className="h-4 w-4" />}
        label="Fahrzeug-Bestand"
        value={`${active.length} Fahrzeuge`}
        sub={`${vehicles.length - active.length} verkauft`}
      />
      <KpiCard
        icon={<Inbox className="h-4 w-4" />}
        label="Aktive Kundenanfragen"
        value={`${openLeads} ${openLeads === 1 ? "Anfrage" : "Anfragen"} offen`}
        sub="Status „Neu“"
        pulse={openLeads > 0}
      />
      <KpiCard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Bestandswert (Brutto)"
        value={eur(total)}
        sub={`Durchschnittspreis: ${eur(avg)}`}
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  pulse?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-muted/60 text-foreground/80">
            {icon}
          </span>
          {label}
        </span>
        {pulse && (
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-semibold leading-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ---------------- E-Mail-Queue Monitor ---------------- */

type EQStatus = "all" | "pending" | "sent" | "failed" | "suppressed";

function EmailQueueView() {
  const [data, setData] = useState<import("@/lib/email-queue.functions").EmailQueueOverview | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<EQStatus>("all");
  const [query, setQuery] = useState("");
  const [openMsg, setOpenMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { getEmailQueueOverview } = await import("@/lib/email-queue.functions");
      const res = await getEmailQueueOverview();
      setData(res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Konnte E-Mail-Queue nicht laden.");
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => {
    load();
  }, []);

  const items = (data?.items ?? []).filter((it) => {
    if (filter !== "all") {
      const map: Record<string, EQStatus> = {
        pending: "pending",
        sent: "sent",
        failed: "failed",
        dlq: "failed",
        bounced: "failed",
        suppressed: "suppressed",
        complained: "suppressed",
      };
      if (map[it.status] !== filter) return false;
    }
    if (query) {
      const q = query.toLowerCase();
      if (!(
        (it.recipient ?? "").toLowerCase().includes(q) ||
        (it.subject ?? "").toLowerCase().includes(q) ||
        (it.templateName ?? "").toLowerCase().includes(q)
      ))
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI-Karten */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Pending" value={data?.stats.pending ?? 0} tone="amber" />
        <StatCard label="Versendet" value={data?.stats.sent ?? 0} tone="emerald" />
        <StatCard label="Fehler / DLQ" value={data?.stats.failed ?? 0} tone="red" />
        <StatCard label="Unterdrückt" value={data?.stats.suppressed ?? 0} tone="slate" />
      </div>

      {data?.notice && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">E-Mail-Infrastruktur noch nicht aktiv</p>
              <p className="mt-1 text-xs leading-relaxed">{data.notice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "pending", "sent", "failed", "suppressed"] as EQStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {s === "all" ? "Alle" : labelFor(s)}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Empfänger, Betreff oder Template suchen…"
          className="input ml-auto w-full max-w-xs"
        />
        <button
          onClick={load}
          className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold hover:bg-muted"
        >
          {loading ? "Lade…" : "Aktualisieren"}
        </button>
      </div>

      {err && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {err}
        </div>
      )}

      {/* Tabelle */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Betreff</th>
                <th className="px-4 py-3">Empfänger</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Zeit</th>
                <th className="px-4 py-3 text-right">Verlauf</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Keine E-Mails im aktuellen Filter.
                  </td>
                </tr>
              )}
              {items.map((it) => (
                <FragmentRow
                  key={it.messageId}
                  item={it}
                  expanded={openMsg === it.messageId}
                  onToggle={() => setOpenMsg(openMsg === it.messageId ? null : it.messageId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Quelle: <code className="rounded bg-muted/60 px-1">email_send_log</code> (dedupliziert nach{" "}
        <code className="rounded bg-muted/60 px-1">message_id</code>) + pending
        Newsletter-Anmeldungen aus{" "}
        <code className="rounded bg-muted/60 px-1">newsletter_subscribers</code>.
      </p>
    </div>
  );
}

function FragmentRow({
  item,
  expanded,
  onToggle,
}: {
  item: import("@/lib/email-queue.functions").EmailQueueItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-t border-border/40 hover:bg-muted/30">
        <td className="px-4 py-3">
          <EQStatusBadge status={item.status} />
        </td>
        <td className="px-4 py-3">
          <div className="font-medium text-foreground line-clamp-1">{item.subject ?? "—"}</div>
          {item.error && (
            <div className="mt-0.5 text-[11px] text-red-700 line-clamp-1">{item.error}</div>
          )}
        </td>
        <td className="px-4 py-3 text-muted-foreground">{item.recipient ?? "—"}</td>
        <td className="px-4 py-3">
          <code className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px]">
            {item.templateName ?? "—"}
          </code>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleString("de-DE")}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={onToggle}
            className="rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] font-semibold hover:bg-muted"
          >
            {expanded ? "Verbergen" : "Verlauf"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-border/40 bg-muted/20">
          <td colSpan={6} className="px-4 py-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Statusverlauf
            </p>
            <ol className="space-y-1.5">
              {(item.history ?? []).map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-xs">
                  <EQStatusBadge
                    status={
                      h.status as import("@/lib/email-queue.functions").EmailQueueItem["status"]
                    }
                  />
                  <span className="text-muted-foreground">
                    {new Date(h.at).toLocaleString("de-DE")}
                  </span>
                  {h.error && <span className="text-red-700">· {h.error}</span>}
                </li>
              ))}
              {(!item.history || item.history.length === 0) && (
                <li className="text-xs text-muted-foreground">Kein Verlauf verfügbar.</li>
              )}
            </ol>
            <p className="mt-3 text-[11px] text-muted-foreground">
              message_id: <code className="rounded bg-muted/60 px-1">{item.messageId}</code>
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

function EQStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-100 text-amber-900 border-amber-300" },
    sent: { label: "Versendet", cls: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    delivered: { label: "Zugestellt", cls: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    failed: { label: "Fehler", cls: "bg-red-100 text-red-900 border-red-300" },
    dlq: { label: "DLQ", cls: "bg-red-100 text-red-900 border-red-300" },
    bounced: { label: "Bounce", cls: "bg-red-100 text-red-900 border-red-300" },
    suppressed: { label: "Unterdrückt", cls: "bg-slate-200 text-slate-800 border-slate-300" },
    complained: { label: "Beschwerde", cls: "bg-slate-200 text-slate-800 border-slate-300" },
  };
  const m = map[s] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function labelFor(s: EQStatus): string {
  return s === "pending"
    ? "Pending"
    : s === "sent"
      ? "Versendet"
      : s === "failed"
        ? "Fehler"
        : "Unterdrückt";
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "red" | "slate";
}) {
  const tones = {
    amber: "border-amber-300/60 bg-amber-50 text-amber-900",
    emerald: "border-emerald-300/60 bg-emerald-50 text-emerald-900",
    red: "border-red-300/60 bg-red-50 text-red-900",
    slate: "border-slate-300/60 bg-slate-50 text-slate-900",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

/* ---------------- Careers Manager ---------------- */

const APPLICANT_STATUSES: ApplicantStatus[] = ["Neu", "Eingeladen", "Eingestellt", "Abgesagt"];

function CareersManager() {
  const jobs = useJobs();
  const applicants = useApplicants();
  const [sub, setSub] = useState<"jobs" | "applicants">("jobs");
  const [editJob, setEditJob] = useState<JobPosting | "new" | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const newCount = applicants.filter((a) => a.status === "Neu").length;
  const activeJobs = jobs.filter((j) => j.active).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiTile label="Aktive Stellen" value={String(activeJobs)} />
        <KpiTile label="Bewerbungen gesamt" value={String(applicants.length)} />
        <KpiTile label="Neue Bewerbungen" value={String(newCount)} accent />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-1.5">
        <SubTab
          active={sub === "jobs"}
          onClick={() => setSub("jobs")}
          icon={<Briefcase className="h-4 w-4" />}
        >
          Aktive Stellenausschreibungen
          <span className="ml-1.5 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px]">
            {jobs.length}
          </span>
        </SubTab>
        <SubTab
          active={sub === "applicants"}
          onClick={() => setSub("applicants")}
          icon={<Users className="h-4 w-4" />}
        >
          Eingegangene Bewerbungen
          {newCount > 0 && (
            <span className="ml-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {newCount}
            </span>
          )}
        </SubTab>
      </div>

      {sub === "jobs" && (
        <JobsTable jobs={jobs} onCreate={() => setEditJob("new")} onEdit={(j) => setEditJob(j)} />
      )}
      {sub === "applicants" && (
        <ApplicantsPanel
          applicants={applicants}
          selected={selectedApplicant}
          onSelect={setSelectedApplicant}
        />
      )}

      {editJob && (
        <JobEditorDialog
          initial={editJob === "new" ? null : editJob}
          onClose={() => setEditJob(null)}
        />
      )}
    </div>
  );
}

function SubTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function KpiTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent ? "border-primary/40 bg-primary/10" : "border-border/60 bg-card/60"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

/* ---------------- Jobs table ---------------- */

function JobsTable({
  jobs,
  onCreate,
  onEdit,
}: {
  jobs: JobPosting[];
  onCreate: () => void;
  onEdit: (j: JobPosting) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-card/60 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Stellenausschreibungen
          </p>
          <h3 className="font-display text-lg font-semibold">Aktuelle Positionen verwalten</h3>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Neue Stelle ausschreiben
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Noch keine Stellen angelegt. Klicken Sie auf „Neue Stelle ausschreiben".
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Position</th>
                <th className="px-5 py-3 text-left">Bereich</th>
                <th className="px-5 py-3 text-left">Anstellung</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{j.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {j.shortPitch.slice(0, 80)}…
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{j.department}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {j.type} · {j.contract}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        j.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${j.active ? "bg-emerald-500" : "bg-muted-foreground/60"}`}
                      />
                      {j.active ? "Aktiv (online)" : "Deaktiviert"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(j)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs transition hover:border-primary/60 hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                      </button>
                      <button
                        onClick={() => {
                          careersStore.toggleActive(j.id);
                          toast.success(j.active ? "Stelle deaktiviert" : "Stelle aktiviert");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs transition hover:border-primary/60 hover:text-primary"
                      >
                        <Power className="h-3.5 w-3.5" />
                        {j.active ? "Deaktivieren" : "Aktivieren"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Stelle „${j.title}" wirklich löschen?`)) {
                            careersStore.removeJob(j.id);
                            toast.success("Stelle gelöscht");
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Job editor ---------------- */

function JobEditorDialog({
  initial,
  onClose,
}: {
  initial: JobPosting | null;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [department, setDepartment] = useState<JobPosting["department"]>(
    initial?.department ?? "Werkstatt",
  );
  const [type, setType] = useState<JobPosting["type"]>(initial?.type ?? "Vollzeit");
  const [contract, setContract] = useState<JobPosting["contract"]>(
    initial?.contract ?? "Unbefristet",
  );
  const [pitch, setPitch] = useState(initial?.shortPitch ?? "");
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join("\n"));
  const [active, setActive] = useState(initial?.active ?? true);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !pitch.trim()) {
      toast.error("Titel und Kurzbeschreibung sind erforderlich.");
      return;
    }
    const payload = {
      title: title.trim(),
      department,
      type,
      contract,
      shortPitch: pitch.trim(),
      highlights: highlights
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      active,
    };
    if (isNew) {
      careersStore.addJob(payload);
      toast.success("Stelle erstellt");
    } else if (initial) {
      careersStore.updateJob(initial.id, payload);
      toast.success("Stelle aktualisiert");
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {isNew ? "Neue Stelle" : "Stelle bearbeiten"}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">
            {isNew ? "Neue Stelle ausschreiben" : title || "Stelle bearbeiten"}
          </h3>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          <Field label="Titel der Stelle">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Kfz-Mechatroniker (m/w/d)"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Bereich">
              <select
                className="input"
                value={department}
                onChange={(e) => setDepartment(e.target.value as JobPosting["department"])}
              >
                <option>Werkstatt</option>
                <option>Verkauf</option>
                <option>Verwaltung</option>
              </select>
            </Field>
            <Field label="Anstellungsart">
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value as JobPosting["type"])}
              >
                <option>Vollzeit</option>
                <option>Teilzeit</option>
                <option>Ausbildung</option>
              </select>
            </Field>
            <Field label="Vertrag">
              <select
                className="input"
                value={contract}
                onChange={(e) => setContract(e.target.value as JobPosting["contract"])}
              >
                <option>Unbefristet</option>
                <option>Befristet</option>
              </select>
            </Field>
          </div>

          <Field label="Kurzbeschreibung">
            <textarea
              className="input min-h-[80px] resize-y"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="In 1–2 Sätzen die Position beschreiben."
              required
            />
          </Field>

          <Field label="Highlights (eines pro Zeile)">
            <textarea
              className="input min-h-[110px] resize-y"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder={"Moderne Werkstatt\nAttraktive Vergütung\nHersteller-Schulungen"}
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span>
              <span className="font-medium text-foreground">Stelle aktiv anzeigen</span>
              <span className="ml-2 text-xs text-muted-foreground">
                (öffentlich auf /karriere sichtbar)
              </span>
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card/60 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            {isNew ? "Stelle veröffentlichen" : "Änderungen speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Applicants ---------------- */

function statusBadgeClasses(s: ApplicantStatus) {
  switch (s) {
    case "Neu":
      return "bg-primary/15 text-primary border-primary/30";
    case "Eingeladen":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Eingestellt":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Abgesagt":
      return "bg-muted text-muted-foreground border-border/60";
  }
}

function ApplicantsPanel({
  applicants,
  selected,
  onSelect,
}: {
  applicants: Applicant[];
  selected: Applicant | null;
  onSelect: (a: Applicant | null) => void;
}) {
  const liveSelected = selected ? (applicants.find((a) => a.id === selected.id) ?? null) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 lg:col-span-7">
        <div className="border-b border-border/60 bg-card/60 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Eingegangene Bewerbungen
          </p>
          <h3 className="font-display text-lg font-semibold">{applicants.length} Bewerber</h3>
        </div>
        {applicants.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Noch keine Bewerbungen eingegangen.
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {applicants.map((a) => {
              const isActive = liveSelected?.id === a.id;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => onSelect(a)}
                    className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition ${
                      isActive ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{a.name}</span>
                        <span className="text-xs text-muted-foreground">
                          · {new Date(a.createdAt).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {a.jobTitle}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClasses(
                        a.status,
                      )}`}
                    >
                      {a.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="lg:col-span-5">
        {liveSelected ? (
          <ApplicantDetail applicant={liveSelected} onClose={() => onSelect(null)} />
        ) : (
          <div className="grid h-full min-h-[280px] place-items-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center text-sm text-muted-foreground">
            Wählen Sie eine Bewerbung links aus, um Details und die Status-Pipeline zu sehen.
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantDetail({ applicant, onClose }: { applicant: Applicant; onClose: () => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Bewerbungsdetails
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{applicant.name}</h3>
          <p className="text-sm text-muted-foreground">{applicant.jobTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-2 rounded-lg border border-border/60 bg-background/40 p-4 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <a href={`mailto:${applicant.email}`} className="hover:underline">
            {applicant.email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <a href={`tel:${applicant.phone}`} className="hover:underline">
            {applicant.phone}
          </a>
        </div>
        {applicant.cvFileName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Download className="h-4 w-4 text-primary" />
            <span>{applicant.cvFileName}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Eingegangen: {new Date(applicant.createdAt).toLocaleString("de-DE")}
        </div>
      </div>

      {applicant.message && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nachricht
          </p>
          <p className="mt-2 whitespace-pre-line rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-foreground/90">
            {applicant.message}
          </p>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Approval-Pipeline
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {APPLICANT_STATUSES.map((s) => {
            const active = applicant.status === s;
            return (
              <button
                key={s}
                onClick={() => {
                  careersStore.setApplicantStatus(applicant.id, s);
                  toast.success(`Status: ${s}`);
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? statusBadgeClasses(s)
                    : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
        <button
          onClick={() => {
            if (confirm("Bewerbung wirklich aus dem Posteingang entfernen?")) {
              careersStore.removeApplicant(applicant.id);
              toast.success("Bewerbung entfernt");
              onClose();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Löschen
        </button>
        <a
          href={`mailto:${applicant.email}?subject=Ihre Bewerbung bei Auto Semmel`}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <Send className="h-3.5 w-3.5" /> E-Mail an Bewerber
        </a>
      </div>
    </div>
  );
}
