import { useEffect, useState } from "react";
import { getOpeningStatus, type OpeningStatus as Status } from "@/lib/opening-hours";

/** Live-Status „Jetzt geöffnet / öffnet um …“. Erst nach dem Mounten berechnet (kein Hydration-Mismatch). */
export default function OpeningStatus({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const update = () => setStatus(getOpeningStatus());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="status">
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${status.open ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {status.label}
    </span>
  );
}
