# Auto Semmel – Website

Website mit Fahrzeugbörse, Werkstatt-/Ankauf-Anfragen, Newsletter (Double-Opt-In), Karriere-Seite und Admin-Bereich für Autohaus Auto Semmel.

**Stack:** TanStack Start (React 19, SSR) · Vite · Tailwind CSS 4 · shadcn/ui · Supabase (Postgres, Auth, Storage) · Zod

## Lokal starten

```sh
cp .env.example .env   # Werte eintragen
npm install
npm run dev            # http://localhost:3000
```

| Befehl | Zweck |
| --- | --- |
| `npm run build` / `npm start` | Produktions-Build / Node-Server (`.output/`) |
| `npm run test` | Unit-Tests (Vitest) |
| `npm run typecheck` · `npm run lint` | Typprüfung · Linting |

## Datenbank

1. Eigenes Supabase-Projekt anlegen, Zugangsdaten in `.env` eintragen.
2. Migrationen aus `supabase/migrations/` der Reihe nach einspielen (`supabase db push` mit der Supabase-CLI).
3. Ersten Benutzer registrieren und im Admin-Bereich `/admin` als Administrator übernehmen.
4. Optional: Google-Login im Supabase-Dashboard unter *Authentication → Providers* aktivieren.

## Fahrzeug-Import

Im Admin-Bereich unter *Fahrzeuge → Import* CSV/JSON hochladen, oder automatisiert per `POST /api/import/vehicles` (Header `Authorization: Bearer $IMPORT_API_TOKEN`). Details: [docs/fahrzeug-import.md](docs/fahrzeug-import.md).

## Funktionen im Admin-Bereich (`/admin`)

| Bereich | Beschreibung |
| --- | --- |
| Fahrzeuge / Import | Bestand pflegen, CSV/JSON-Import, API-Import |
| Anfragen | Leads (Probefahrt, Ankauf, Kontakt) mit Status |
| Werkstatt | Wochenkalender; Kunden buchen online freie Slots (`src/lib/workshop.ts`: Slots, Kapazität), E-Mails bei Buchung/Änderung, abonnierbarer iCal-Feed |
| Kundenbewertungen | Echte Bewertungen erfassen und veröffentlichen (Abschnitt bleibt ohne Bewertungen ausgeblendet) |
| Newsletter | Double-Opt-In, Versand an bestätigte Abonnenten mit Abmeldelink (kein Tracking) |
| Team & Rollen | Einladen, `admin`/`staff` vergeben (nur Administratoren) |

E-Mails laufen über die Queue `transactional_emails` (pgmq). Ohne eingerichtete Absender-Domain bleiben Mails aus; Daten gehen nie verloren.

## Demo-/Konzeptmodus (Vorführung beim Kunden)

1. Build mit `VITE_DEMO_MODE=1`: `noindex`, `robots.txt` sperrt alles, leere Sitemap, Banner „Konzeptentwurf – nicht öffentlich“.
2. Beispieldaten einspielen: `supabase/seed-demo.sql` (9 Fahrzeuge, 3 Anfragen, 4 Termine; alle erfunden, Platzhalterbilder). Entfernen: `supabase/remove-demo.sql`.
3. Zusätzlich Zugriff beschränken (Passwortschutz des Hosters oder nicht verlinkte URL), solange kein Vertrag besteht.
4. Vor dem Livegang: Demo-Modus aus (`VITE_DEMO_MODE=0`), `remove-demo.sql` ausführen.

## Partner-Logos

Marken-Logos liegen nicht im Repo. Dateien nach `public/partner/` legen (siehe dortige README).
