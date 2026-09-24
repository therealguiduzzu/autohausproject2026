import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type JobType = "Vollzeit" | "Teilzeit" | "Ausbildung";
export type JobContract = "Unbefristet" | "Befristet";

export interface JobPosting {
  id: string;
  title: string;
  department: "Werkstatt" | "Verkauf" | "Verwaltung";
  type: JobType;
  contract: JobContract;
  shortPitch: string;
  highlights: string[];
  active: boolean;
  createdAt: number;
}

export type ApplicantStatus = "Neu" | "Eingeladen" | "Abgesagt" | "Eingestellt";

export interface Applicant {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  cvFileName?: string;
  status: ApplicantStatus;
  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

let jobs: JobPosting[] = [
  {
    id: "job-mech",
    title: "Kfz-Mechatroniker (m/w/d)",
    department: "Werkstatt",
    type: "Vollzeit",
    contract: "Unbefristet",
    shortPitch:
      "Verstärken Sie unser Werkstatt-Team und betreuen Sie modernste Fahrzeuge der Marken Alfa Romeo, Fiat & Abarth.",
    highlights: [
      "Moderne, klimatisierte Werkstatt",
      "Alfa Romeo & Fiat Hersteller-Schulungen",
      "Attraktive Vergütung + Urlaubs-/Weihnachtsgeld",
      "Familiäres Team seit über 40 Jahren",
    ],
    active: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    id: "job-sales",
    title: "Automobilkaufmann / Verkaufsberater (m/w/d)",
    department: "Verkauf",
    type: "Vollzeit",
    contract: "Unbefristet",
    shortPitch:
      "Beraten Sie Kundinnen und Kunden rund um unsere italienischen Premium-Marken und gestalten Sie deren Kauferlebnis.",
    highlights: [
      "Premium-Markenbetreuung (Stellantis)",
      "Starkes Provisionsmodell + Dienstwagen",
      "Familiäres Team & flache Hierarchien",
      "Eigene Kundenpflege & Fahrzeugübergaben",
    ],
    active: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
];

let applicants: Applicant[] = [
  {
    id: "ap-1",
    jobId: "job-mech",
    jobTitle: "Kfz-Mechatroniker (m/w/d)",
    name: "Max Mustermann",
    email: "max.mustermann@example.de",
    phone: "0177 1234567",
    message:
      "Sehr geehrtes Team, ich bringe 6 Jahre Erfahrung in einer Markenwerkstatt mit und würde gern bei Auto Semmel anfangen.",
    cvFileName: "Lebenslauf_Mustermann.pdf",
    status: "Neu",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "ap-2",
    jobId: "job-sales",
    jobTitle: "Automobilkaufmann / Verkaufsberater (m/w/d)",
    name: "Laura Bianchi",
    email: "l.bianchi@example.de",
    phone: "0151 9876543",
    message: "Italienischsprachig, 4 Jahre Vertriebserfahrung im Premium-Segment.",
    cvFileName: "CV_Bianchi_2026.pdf",
    status: "Eingeladen",
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
  },
];

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

const jobsSnapshot = () => jobs;
const applicantsSnapshot = () => applicants;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useJobs(): JobPosting[] {
  return useSyncExternalStore(subscribe, jobsSnapshot, jobsSnapshot);
}

export function useActiveJobs(): JobPosting[] {
  return useJobs().filter((j) => j.active);
}

export function useApplicants(): Applicant[] {
  return useSyncExternalStore(subscribe, applicantsSnapshot, applicantsSnapshot);
}

export const careersStore = {
  /* jobs */
  addJob(input: Omit<JobPosting, "id" | "createdAt" | "active"> & { active?: boolean }) {
    const job: JobPosting = {
      ...input,
      id: `job-${Date.now()}`,
      active: input.active ?? true,
      createdAt: Date.now(),
    };
    jobs = [job, ...jobs];
    emit();
    return job;
  },
  updateJob(id: string, patch: Partial<Omit<JobPosting, "id">>) {
    jobs = jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
    emit();
  },
  toggleActive(id: string) {
    jobs = jobs.map((j) => (j.id === id ? { ...j, active: !j.active } : j));
    emit();
  },
  removeJob(id: string) {
    jobs = jobs.filter((j) => j.id !== id);
    emit();
  },
  /* applicants */
  addApplicant(
    input: Omit<Applicant, "id" | "createdAt" | "status" | "jobTitle"> & {
      status?: ApplicantStatus;
    }
  ) {
    const job = jobs.find((j) => j.id === input.jobId);
    const applicant: Applicant = {
      ...input,
      id: `ap-${Date.now()}`,
      jobTitle: job?.title ?? "Initiativbewerbung",
      status: input.status ?? "Neu",
      createdAt: Date.now(),
    };
    applicants = [applicant, ...applicants];
    emit();
    return applicant;
  },
  setApplicantStatus(id: string, status: ApplicantStatus) {
    applicants = applicants.map((a) => (a.id === id ? { ...a, status } : a));
    emit();
  },
  removeApplicant(id: string) {
    applicants = applicants.filter((a) => a.id !== id);
    emit();
  },
};
