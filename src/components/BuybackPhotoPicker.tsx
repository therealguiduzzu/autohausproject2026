import { useEffect, useMemo, useRef } from "react";
import { Camera, X } from "lucide-react";
import { MAX_BUYBACK_PHOTOS } from "@/lib/buyback-photos";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

/** Optionale Fotoauswahl (bis 4 Bilder). Upload erfolgt erst beim Absenden. */
export default function BuybackPhotoPicker({ files, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  return (
    <div className="sm:col-span-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Fotos (optional, bis zu {MAX_BUYBACK_PHOTOS})
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Außen vorne/hinten, Innenraum, Tacho. Hilft uns, Ihr Angebot genauer zu machen.
        Standortdaten der Bilder werden vor dem Upload entfernt; bitte keine Personen aufnehmen.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {previews.map((src, i) => (
          <div
            key={src}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
          >
            <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`Foto ${i + 1} entfernen`}
              onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {files.length < MAX_BUYBACK_PHOTOS && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <span className="flex flex-col items-center gap-1 text-[10px]">
              <Camera className="h-5 w-5" /> Foto
            </span>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []).filter((f) =>
            f.type.startsWith("image/"),
          );
          onChange([...files, ...picked].slice(0, MAX_BUYBACK_PHOTOS));
          e.target.value = "";
        }}
      />
    </div>
  );
}
