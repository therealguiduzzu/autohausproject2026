import { MessageCircle } from "lucide-react";
import type { CSSProperties } from "react";

const WHATSAPP_URL =
  "https://wa.me/4961842633?text=" +
  encodeURIComponent("Hallo Auto Semmel, ich habe eine Frage zu einem Fahrzeug:");

const NO_MOTION_STYLE: CSSProperties = {
  animation: "none",
  transition: "none",
};

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Jetzt live über WhatsApp chatten"
      className="whatsapp-static fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-sm font-semibold text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60 sm:bottom-7 sm:right-7"
      style={NO_MOTION_STYLE}
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-full bg-white/15 backdrop-blur-sm"
        style={NO_MOTION_STYLE}
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2.5} style={NO_MOTION_STYLE} />
      </span>
      <span className="hidden whitespace-nowrap sm:inline" style={NO_MOTION_STYLE}>
        Jetzt live chatten
      </span>
    </a>
  );
}
