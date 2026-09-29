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

## Partner-Logos

Marken-Logos liegen nicht im Repo. Dateien nach `public/partner/` legen (siehe dortige README).
