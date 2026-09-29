import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { allReviewsQuery, reviewsStore } from "@/lib/reviews-store";

export default function ReviewsManager() {
  const { data: reviews = [] } = useQuery(allReviewsQuery);
  const [draft, setDraft] = useState({
    author: "",
    rating: 5,
    text: "",
    source: "Google",
    source_url: "",
    review_date: "",
  });
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.author.trim() || !draft.text.trim()) return;
    setBusy(true);
    try {
      await reviewsStore.add({
        author: draft.author.trim(),
        rating: draft.rating,
        text: draft.text.trim(),
        source: draft.source.trim() || "Kundenmeinung",
        source_url: draft.source_url.trim() || null,
        review_date: draft.review_date || null,
        published: false,
      });
      setDraft({ ...draft, author: "", text: "", source_url: "", review_date: "" });
      toast.success("Gespeichert (noch nicht veröffentlicht).");
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 animate-fade-in lg:grid-cols-[1fr_1.5fr]">
      <form
        onSubmit={add}
        className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Kuratieren</p>
          <h3 className="font-display text-lg font-semibold">Bewertung erfassen</h3>
        </div>
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900">
          Nur <strong>echte</strong> Bewertungen eintragen, die Sie eindeutig einem Kunden zuordnen
          können (z. B. Google-Rezension) – erfundene oder stark bearbeitete Bewertungen sind
          wettbewerbswidrig (UWG). Namen am besten gekürzt („Max M.“).
        </p>
        <label className="block text-xs font-medium">
          Name
          <input
            className="input mt-1 w-full"
            value={draft.author}
            maxLength={100}
            onChange={(e) => setDraft({ ...draft, author: e.target.value })}
            placeholder="z. B. Max M."
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium">
            Sterne
            <select
              className="input mt-1 w-full"
              value={draft.rating}
              onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium">
            Datum
            <input
              type="date"
              className="input mt-1 w-full"
              value={draft.review_date}
              onChange={(e) => setDraft({ ...draft, review_date: e.target.value })}
            />
          </label>
        </div>
        <label className="block text-xs font-medium">
          Text (Originalwortlaut)
          <textarea
            className="input mt-1 min-h-24 w-full"
            value={draft.text}
            maxLength={1500}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium">
            Quelle
            <input
              className="input mt-1 w-full"
              value={draft.source}
              maxLength={40}
              onChange={(e) => setDraft({ ...draft, source: e.target.value })}
            />
          </label>
          <label className="block text-xs font-medium">
            Link zur Quelle (optional)
            <input
              type="url"
              className="input mt-1 w-full"
              value={draft.source_url}
              onChange={(e) => setDraft({ ...draft, source_url: e.target.value })}
            />
          </label>
        </div>
        <button
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          Speichern
        </button>
      </form>

      <div className="space-y-3">
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Noch keine Bewertungen. Solange keine veröffentlicht ist, bleibt der Bereich auf der
            Website ausgeblendet.
          </p>
        )}
        {reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {r.author} <span className="font-normal text-muted-foreground">· {r.source}</span>
                </p>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={r.published ? "Verbergen" : "Veröffentlichen"}
                  title={
                    r.published
                      ? "Veröffentlicht – klicken zum Verbergen"
                      : "Verborgen – klicken zum Veröffentlichen"
                  }
                  onClick={() =>
                    reviewsStore
                      .setPublished(r.id, !r.published)
                      .catch(() => toast.error("Fehlgeschlagen."))
                  }
                  className={`rounded-lg border p-2 ${r.published ? "border-emerald-500/40 text-emerald-700" : "border-border/70 text-muted-foreground"}`}
                >
                  {r.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  aria-label="Löschen"
                  onClick={() =>
                    confirm("Bewertung löschen?") &&
                    reviewsStore.remove(r.id).catch(() => toast.error("Fehlgeschlagen."))
                  }
                  className="rounded-lg border border-border/70 p-2 text-muted-foreground hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{r.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
