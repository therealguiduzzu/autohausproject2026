# Website-Status

Status: ✅ erledigt · 🔄 läuft · ⬜ offen · ➖ übersprungen (Bestand/Konzept)

| Phase | Name | Status | Datum |
|---|---|---|---|
| 0 | Einrichten | ➖ Projekt bestand schon | 2026-10-27 |
| 1 | Fundament | ➖ Marke aus Konzeptseite übernommen (PRODUCT.md, Entwurf) | 2026-10-27 |
| 2 | Recherche | ⬜ | |
| 3 | Texte | ⬜ (Texte stehen im Code, nicht in `texte.md`) | |
| 4 | Design-Richtung | ➖ Konzept-Design übernommen | |
| 5 | Bauen | ✅ als Konzept gebaut | |
| 6 | Prüfen und Feinschliff | 🔄 Prüfdurchgänge erledigt, Fehler behoben; unabhängiges Urteil „fix“, Design-Entscheidungen beim Auftraggeber | 2026-10-27 |
| 7 | Livegang | ⬜ | |
| 8 | Danach | ⬜ | |

## Ausgangslage
- Konzeptseite für ein Autohaus; noch kein Vertrag. Live-Seite des Autohauses nicht einsehbar (Netzwerksperre).
- Werkzeuge: impeccable ⬜ (nicht installiert) · Playwright ✅ (Chromium 1194) · DataForSEO ⬜ · Hosting-MCP ⬜

## Entscheidungen
- 2026-10-27: Prüfdurchgang mit Mock-Daten (lokaler Supabase-Mock), da keine Datenbank erreichbar.

## Offene Fragen an die Person
- Partner-Logos (FIAT Service, Alfa Romeo Service, Stellantis) vom Autohaus erhalten?
- Bestätigung der Aussagen: „über 40 Jahre", „offizieller Stellantis-Partner", Garantie, Ersatzwagen, Hol- und Bringservice, Festpreise.

## Phase 6 – Ergebnis (2026-10-27)
Behoben: Hero-Bild unsichtbar, mobile Seitenbreite 444–610 px (Logo-Fallback), Nav-Umbrüche, Schrift `font-serif`, „NaN“-Erstzulassung, Standard-Badge „Top Deal“, erfundener Ducato-Block, erfundene Kontakt-/Teamdaten, unlesbares CTA-Banner, doppelte ID `#ueber-uns`, Servicepartner-Karten, Mediävalziffern bei Preisen.
Offen (Entscheidung nötig): Hero-CTAs, Suchfilter, doppelte Bestandsanzeige, „Template-Look“, Mobil-Länge, unbelegte Aussagen. Siehe Bericht im Chat.

## Phase 6 – Umsetzung Punkte 2–5 (2026-10-27)
Hero mit drei Wegen (Fahrzeuge ansehen, Werkstatttermin, Auto verkaufen) statt Kennzahlenleiste; Suchfilter einzeilig; Highlights-Block und toter „Gesamten Bestand ansehen“-Button entfernt; Merken-Herz ohne Funktion entfernt; Eyebrows/Pillen/Häkchenlisten halbiert, Rot nur für Aktionen und Aktionspreise; Garantie-/Qualitäts-Pillen entfernt; Fahrzeuge mobil wischbar, Tippflächen 44 px; „Zurück“ erst ab Schritt 2.
Noch offen: Punkt 1 (unbelegte Aussagen), Regler-Panel, DESIGN.md.
