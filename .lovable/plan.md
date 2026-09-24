## Ziel
Die offiziellen "FIAT SERVICE" und "ALFA ROMEO SERVICE" Logos als Trust-Signale an den zwei wirkungsvollsten Stellen platzieren.

## Asset-Vorbereitung
- Beide Logos vom Nutzer einholen (PNG mit transparentem Hintergrund, bevorzugt vektorartig hochauflösend) ODER stilgetreue SVG-Nachbauten im Repo erzeugen.
- Upload via `lovable-assets` → Pointer unter `src/assets/fiat-service.png.asset.json` und `src/assets/alfa-romeo-service.png.asset.json`.
- Zwei Varianten referenzieren: Standard (Farbe) für Werkstatt-Hub, optional gedämpft/monochrom für Trust-Bar (per CSS `filter` bei Bedarf).

## Platzierung 1 – Werkstatt & Service Hub (Primär, hohe Conversion-Wirkung)
Datei: `src/routes/index.tsx`, Sektion `WerkstattHub`.

- Direkt unter der Hub-Headline ein neuer Block "Autorisierter Servicepartner".
- Zwei Logo-Cards nebeneinander (auf Mobile gestapelt):
  - Weißer/heller Hintergrund-Container (`bg-surface`, dezenter Border, `shadow-soft`), Padding ~24px, Logo-Höhe ~56–64px.
  - Untertitel je Karte: "Original-Ersatzteile · Hersteller-Diagnose · Garantie-Erhalt".
- Spacing: `mt-4 mb-8`, Grid `grid-cols-1 sm:grid-cols-2 gap-4`.
- Alt-Texte: "Offizieller FIAT Service Partner – Auto Semmel Langenselbold" / analog Alfa Romeo.
- Hover: leichter Lift (`hover:-translate-y-0.5 transition`).

## Platzierung 2 – Trust-Bar (Sekundär, dauerhafte Sichtbarkeit)
Datei: `src/routes/index.tsx`, bestehende Trust-Bar-Sektion (40+ Jahre, Stellantis-Partner, 4.3★).

- Neue Spalte/Inline-Gruppe "Autorisierter Servicepartner" mit beiden Logos klein nebeneinander (Höhe ~28–32px).
- Auf Desktop in die bestehende Trust-Bar-Grid einreihen; auf Mobile als eigene Zeile darunter, zentriert.
- Visuell zurückhaltend: ggf. `opacity-90`, kein eigener Background-Container, damit die Bar ruhig bleibt.

## Technische Details
- Keine neuen Pakete, keine Datenmodell-/Backend-Änderungen.
- Logos als statische Imports der `.asset.json`-Pointer (`import fiatService from "@/assets/fiat-service.png.asset.json"` → `<img src={fiatService.url} … />`).
- Responsives Verhalten via Tailwind-Klassen; keine neuen Design-Tokens nötig.
- Accessibility: aussagekräftige `alt`-Texte, `loading="lazy"` für die Trust-Bar-Variante.

## Rückfrage
Hast du die offiziellen Logo-Dateien (PNG/SVG) zur Hand und lädst sie hoch, oder soll ich stilgetreue SVG-Nachbauten ("FIAT SERVICE" / "ALFA ROMEO SERVICE" Wortmarken im Markendesign) selbst anlegen?
