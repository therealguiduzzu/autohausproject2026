# Übergabe & Betrieb

Die Seite besteht aus drei getrennten Teilen. Jeder Teil gehört am Ende dem Kunden:

| Teil | Wo | Wem gehört es bei Übergabe |
| --- | --- | --- |
| **Code** | GitHub-Repository | Repo an Kunden-GitHub übertragen (Transfer) oder Code als ZIP |
| **Daten** | Supabase-Projekt (Postgres, Auth, Storage) | Projekt in **Kunden-Organisation** anlegen bzw. übertragen |
| **Betrieb** | Hosting (Node-Server oder Docker) + Domain + E-Mail (SMTP) | Konten des Kunden; Sie erhalten nur Zugang zur Wartung |

Lovable wird nicht mehr benötigt. Die alte Lovable-Datenbank muss **nicht** übernommen werden: Alle Tabellen, Regeln und Rollen stehen in `supabase/migrations/` und werden in ein neues Projekt eingespielt (auf einer frischen Postgres-Datenbank geprüft).

## 1. Neues Supabase-Projekt

1. supabase.com → Organisation des Kunden (oder eigene, später übertragen) → *New project*, Region **Frankfurt (eu-central-1)**.
2. AVV/DPA in den Supabase-Organisationseinstellungen abschließen (DSGVO).
3. Lokal: `npx supabase login`, `npx supabase link --project-ref <ref>`, `npx supabase db push` (spielt alle Migrationen ein).
4. *Authentication → Providers → Email*: **„Allow new users to sign up“ ausschalten** (Personal wird eingeladen). Google-Login optional aktivieren.
5. *Authentication → URL Configuration*: Site URL = Produktiv-Domain, Redirect-URL `https://<domain>/**`.
6. *Authentication → SMTP*: eigenen SMTP-Anbieter eintragen (für Einladungs-/Reset-Mails).
7. Ersten Benutzer im Dashboard anlegen (*Authentication → Users → Add user*), auf `/auth` einloggen, im Admin **„Administrator übernehmen“** klicken. Danach ist die Funktion gesperrt.
8. Keys aus *Project Settings → API* in die Umgebungsvariablen (siehe `.env.example`). Der **service_role-Key gehört nur auf den Server**.

## 2. Hosting

`npm run build` erzeugt `.output/` (Node-Server). Varianten:

- **Docker** (`Dockerfile`): Railway, Render, Fly.io, eigener VPS (Hetzner) mit Caddy/Traefik. Empfohlen für DE-Datenschutz: Hetzner (Falkenstein) oder Railway/Render Region Frankfurt.
- **Vercel/Netlify/Cloudflare**: `NITRO_PRESET` setzen (z. B. `vercel`). SMTP-Versand braucht einen Node-Runtime (Vercel Node ok, Cloudflare Workers nicht).
- Umgebungsvariablen: `VITE_*` zur **Build-Zeit**, alle anderen zur **Laufzeit**.
- Domain: DNS `A`/`CNAME` auf das Hosting, TLS automatisch (Caddy/Anbieter).

## 3. E-Mail

Ohne SMTP werden **keine** Mails verschickt (Terminbestätigungen, Newsletter-Bestätigung, Lead-Benachrichtigung). Anbieter mit EU-Servern: Brevo, Mailjet, IONOS. Bei der Absender-Domain SPF, DKIM und DMARC einrichten. Protokoll: Admin → *E-Mail-Queue*.

## 4. Vor dem Livegang (Checkliste)

- [ ] Demo-Fahrzeuge/-Daten löschen, echten Bestand importieren (Admin → Import)
- [ ] Impressum/Datenschutz mit echten Daten füllen und rechtlich prüfen lassen
- [ ] Partner-Logos nur mit Genehmigung nach `public/partner/`
- [ ] Bewertungen nur echte erfassen (Admin → Kundenbewertungen)
- [ ] Öffnungszeiten (`src/lib/opening-hours.ts`), Werkstatt-Slots/Plätze (`src/lib/workshop.ts` **und** `workshop_capacity()` in der DB) prüfen
- [ ] Testbuchung, Testanfrage, Newsletter-Test, Terminabsage per Link, Ankauf mit Foto
- [ ] Backups: Supabase Pro (tägliche Backups/PITR) oder `pg_dump`-Cronjob
- [ ] `IMPORT_API_TOKEN`, `WORKSHOP_CALENDAR_TOKEN` neu erzeugen (`openssl rand -hex 32`)

## 5. Übergabe-Ablauf

1. Kunde legt GitHub-Organisation, Supabase-Organisation, Hosting- und SMTP-Konto an (oder Sie legen sie in **seinem** Namen mit seiner Rechnungsadresse an).
2. Repo transferieren, Supabase-Projekt übertragen (*Settings → General → Transfer project*), Umgebungsvariablen beim Hosting setzen.
3. Admin-Konto des Kunden anlegen, Ihr eigenes Konto auf Wunsch als `admin` belassen (Wartung) oder entfernen (Admin → Team & Rollen).
4. Schulung (1–2 h): Fahrzeuge/Import, Anfragen, Termine, Newsletter.
5. Übergabeprotokoll unterschreiben lassen (welche Zugänge, welcher Stand, Gewährleistung).
