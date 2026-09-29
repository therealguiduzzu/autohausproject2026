# Fahrzeug-Import

Zwei Wege, gleiche Logik (`src/lib/vehicle-import*.ts`):

1. **Admin-Bereich** → Tab „API/Import“: Datei wählen → *Vorschau prüfen* → *Import durchführen*.
2. **API** (z. B. Cronjob des Händlersystems):

```sh
curl -X POST "https://www.auto-semmel.de/api/import/vehicles?markMissingSold=1" \
  -H "Authorization: Bearer $IMPORT_API_TOKEN" \
  -H "Content-Type: text/csv" \
  --data-binary @bestand.csv
```

`?dryRun=1` prüft nur. Token: `IMPORT_API_TOKEN` (mind. 24 Zeichen, z. B. `openssl rand -hex 32`).

## Spalten (Kopfzeile, Groß-/Kleinschreibung und Sonderzeichen egal)

| Feld | Erkannte Spaltennamen (Auswahl) | Pflicht |
| --- | --- | --- |
| ID | ID, Inserat-Nr, Fahrzeug-ID, mobile.de-ID | ja |
| Marke | Marke, Hersteller, Make | ja |
| Modell | Modell, Model, Modellreihe | ja |
| Variante | Variante, Version, Modellzusatz, Ausführung | – |
| Zustand | Zustand, Fahrzeugzustand (Neu, Tageszulassung/Vorführwagen, Gebraucht/Jahreswagen) | ja |
| Preis | Preis, Verkaufspreis, Bruttopreis (`38.900,00 €` oder `38900`) | ja |
| Leistung | Leistung (PS), PS oder Leistung (kW), kW | ja |
| Kraftstoff | Kraftstoff (Benzin/Super, Diesel, Hybrid inkl. Mild-/Plug-in, Elektro) | ja |
| Getriebe | Getriebe (Automatik/DCT/TCT, Schalt-/Manuell) | ja |
| MwSt | MwSt ausweisbar (ja/nein) | – |
| Kilometerstand | Kilometerstand, KM, Laufleistung | – |
| Erstzulassung | EZ (`03/2024`, `15.03.2024`, `2024-03-15`) | – |
| Bilder | Bilder, Fotos, Bild-URLs (mehrere URLs mit `\|` getrennt) | – |
| Ausstattung | Ausstattung, Extras (mit `\|` oder `;` getrennt) | – |
| CO₂/Verbrauch | CO2-Klasse (A–G), Verbrauch kombiniert, Stromverbrauch, CO2-Emissionen | – |

CSV: Trennzeichen `;`, `,` oder Tab (automatisch), UTF-8 oder Windows-1252. JSON: Array oder `{ "vehicles": [...] }` mit denselben Feldnamen.

## Verhalten

- **Neu** (unbekannte ID) → angelegt, Status „Verfügbar“, Slug automatisch.
- **Bekannt** → nur importgeführte Felder aktualisiert. Status „Reserviert“, Badge, Aktionspreis, Finanzierungsrate und Slug bleiben. Bilder/Ausstattung werden nur ersetzt, wenn die Datei welche enthält.
- **`markMissingSold`** → importierte Fahrzeuge, die in der Datei fehlen, werden „Verkauft“ (nie gelöscht). Tauchen sie später wieder auf, sind sie wieder „Verfügbar“.
- Ungültige Zeilen (z. B. Marke außerhalb Alfa Romeo/Fiat/Abarth/Fiat Professional) werden übersprungen und mit Zeilennummer gemeldet.
- Bilder werden als URL gespeichert (nicht kopiert): Die Quelle muss dauerhaft erreichbar sein und die Nutzung erlauben.
- Jeder Lauf wird in `import_runs` protokolliert.

Beispieldatei: [beispiel-fahrzeuge.csv](beispiel-fahrzeuge.csv)
