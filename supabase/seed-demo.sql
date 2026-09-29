-- Beispieldaten für Vorführungen (NICHT Teil der Migrationen, manuell einspielen):
--   psql "$DATABASE_URL" -f supabase/seed-demo.sql      bzw. im Supabase SQL-Editor ausführen
-- Alle Daten sind erfunden und erkennbar markiert (mobile_de_id 'DEMO-…', E-Mail '@demo.invalid').
-- Entfernen: supabase/remove-demo.sql. Bilder sind mitgelieferte Platzhalter (image_keys).
-- Hinweis: Verbrauchs-/CO₂-Werte sind Beispielwerte, keine Herstellerangaben.

-- Wiederholbar: alte Demo-Anfragen/-Termine zuerst entfernen (Fahrzeuge sind per ON CONFLICT geschützt)
DELETE FROM public.workshop_appointments WHERE customer_email LIKE '%@demo.invalid';
DELETE FROM public.leads WHERE email LIKE '%@demo.invalid';

INSERT INTO public.vehicles
  (slug, mobile_de_id, brand, model, version, condition, price, discount_price, vat_deductible,
   mileage, first_registration, power_hp, fuel_type, transmission, image_keys, features, badge,
   status, co2_class, consumption_combined, power_consumption, co2_emissions)
VALUES
  ('demo-alfa-romeo-tonale-veloce', 'DEMO-1001', 'Alfa Romeo', 'Tonale', '1.5 VGT MHEV TCT Veloce', 'Gebrauchtwagen',
   38900, 36900, true, 12500, '2024-03-01', 160, 'Hybrid', 'Automatik', ARRAY['car-tonale'],
   ARRAY['Navigation','LED-Matrix-Scheinwerfer','Sitzheizung','Rückfahrkamera','Adaptiver Tempomat'], 'Top Deal',
   'Verfügbar', 'C', 5.9, NULL, 134),
  ('demo-alfa-romeo-giulia-veloce', 'DEMO-1002', 'Alfa Romeo', 'Giulia', '2.0 Turbo 16V Veloce Q4', 'Gebrauchtwagen',
   39900, NULL, false, 23800, '2023-06-01', 280, 'Benzin', 'Automatik', ARRAY['car-giulia'],
   ARRAY['Allradantrieb Q4','Lederausstattung','Harman-Kardon-Sound','Head-up-Display'], NULL,
   'Verfügbar', 'E', 7.9, NULL, 179),
  ('demo-alfa-romeo-stelvio-veloce', 'DEMO-1003', 'Alfa Romeo', 'Stelvio', '2.2 Diesel Veloce Q4', 'Gebrauchtwagen',
   41500, NULL, false, 31200, '2023-01-01', 210, 'Diesel', 'Automatik', ARRAY['car-stelvio'],
   ARRAY['Allradantrieb Q4','Panorama-Schiebedach','Bi-Xenon','Elektrische Heckklappe'], NULL,
   'Reserviert', 'D', 5.7, NULL, 150),
  ('demo-fiat-500e-la-prima', 'DEMO-1004', 'Fiat', '500e', 'La Prima 42 kWh', 'Neuwagen',
   29900, NULL, false, 0, NULL, 118, 'Elektro', 'Automatik', ARRAY['hero-500e'],
   ARRAY['Panorama-Glasdach','Ledersitze','JBL-Soundsystem','Schnellladen'], 'Elektro',
   'Verfügbar', 'A', NULL, 14.9, 0),
  ('demo-fiat-500-hybrid-dolcevita', 'DEMO-1005', 'Fiat', '500', '1.0 GSE Hybrid Dolcevita', 'Tageszulassung',
   15990, NULL, false, 10, '2026-08-01', 70, 'Hybrid', 'Schaltgetriebe', ARRAY['car-fiat500'],
   ARRAY['Panorama-Glasdach','Klimaautomatik','Apple CarPlay','Parksensoren'], NULL,
   'Verfügbar', 'B', 4.9, NULL, 111),
  ('demo-fiat-panda-city-life', 'DEMO-1006', 'Fiat', 'Panda', '1.0 GSE Hybrid City Life', 'Neuwagen',
   14990, NULL, false, 0, NULL, 70, 'Hybrid', 'Schaltgetriebe', ARRAY['car-panda'],
   ARRAY['Klimaanlage','Bluetooth','Tempomat'], NULL,
   'Verfügbar', 'B', 5.0, NULL, 113),
  ('demo-abarth-595-turismo', 'DEMO-1007', 'Abarth', '595', 'Turismo 1.4 T-Jet', 'Gebrauchtwagen',
   21900, NULL, false, 8200, '2024-05-01', 165, 'Benzin', 'Schaltgetriebe', ARRAY['car-abarth'],
   ARRAY['Sportauspuff Record Monza','Sabelt-Sportsitze','Beats-Audio','Xenon'], NULL,
   'Verfügbar', 'F', 6.5, NULL, 148),
  ('demo-abarth-500e-turismo', 'DEMO-1008', 'Abarth', '500e', 'Turismo 42 kWh', 'Neuwagen',
   39900, NULL, false, 0, NULL, 155, 'Elektro', 'Automatik', ARRAY['car-abarth'],
   ARRAY['Sabelt-Sportsitze','Sound-Generator','Schnellladen'], 'Elektro',
   'Verfügbar', 'A', NULL, 15.9, 0),
  ('demo-fiat-professional-ducato-l2h2', 'DEMO-1009', 'Fiat Professional', 'Ducato', 'Kastenwagen L2H2 140 Multijet', 'Tageszulassung',
   36500, NULL, true, 10, '2026-07-01', 140, 'Diesel', 'Schaltgetriebe', ARRAY['car-ducato'],
   ARRAY['Klimaanlage','Trennwand','Rückfahrkamera','Radio mit Bluetooth'], 'MwSt. ausweisbar',
   'Verfügbar', 'D', 8.2, NULL, 216)
ON CONFLICT (mobile_de_id) DO NOTHING;

-- Anfragen (eine davon bewusst „überfällig“, um die Hervorhebung zu zeigen)
INSERT INTO public.leads (type, status, name, email, phone, subject, details, consent_given, created_at)
VALUES
  ('Probefahrt', 'Neu', 'Erika Musterfrau (Demo)', 'erika@demo.invalid', '0170 0000001',
   'Probefahrt · Alfa Romeo Tonale',
   '{"Fahrzeug":"Alfa Romeo Tonale","Wunsch-Termin":"Samstag Vormittag","Anmerkung":"Bitte mit Sitzheizung testen"}',
   true, now() - interval '2 hours'),
  ('Fahrzeugankauf', 'In Bearbeitung', 'Max Mustermann (Demo)', 'max@demo.invalid', '0170 0000002',
   'Ankaufsanfrage · Fiat Panda',
   '{"Marke":"Fiat","Modell":"Panda","Baujahr":"2018","Kilometerstand":"62.000 km","Unfallfrei":"Ja, unfallfrei","Wunschpreis":"7500 €"}',
   true, now() - interval '9 hours'),
  ('Kontakt', 'Neu', 'Sabine Beispiel (Demo)', 'sabine@demo.invalid', '0170 0000003',
   'Frage zur Finanzierung',
   '{"Nachricht":"Ist eine Finanzierung mit 3.000 € Anzahlung möglich?"}',
   true, now() - interval '30 hours');

-- Werkstatttermine an den nächsten Werktagen
WITH days AS (
  SELECT d::date AS day, row_number() OVER (ORDER BY d) AS rn
  FROM generate_series(current_date + 1, current_date + 10, interval '1 day') d
  WHERE extract(isodow FROM d) < 6
)
INSERT INTO public.workshop_appointments
  (slot_date, slot_time, service, category, vehicle, customer_name, customer_email, customer_phone, source, consent_given)
SELECT day, t.slot, t.service, t.cat, t.vehicle, t.name, t.email, t.phone, t.src, true
FROM days
JOIN (VALUES
  (1, '08:00', 'Inspektion',    'inspektion', 'Fiat 500 · MKK-AS 120',        'Erika Musterfrau (Demo)', 'erika@demo.invalid', '0170 0000001', 'website'),
  (1, '10:00', 'HU / AU',       'hu_au',      'Alfa Romeo Stelvio',            'Max Mustermann (Demo)',   'max@demo.invalid',   '0170 0000002', 'admin'),
  (2, '13:00', 'Reifenwechsel', 'reifen',     'Fiat Ducato',                   'Sabine Beispiel (Demo)',  'sabine@demo.invalid','0170 0000003', 'website'),
  (3, '15:00', 'Reparatur',     'sonstiges',  'Abarth 595 · Bremsen prüfen',   'Tim Test (Demo)',         'tim@demo.invalid',   '0170 0000004', 'website')
) AS t(rn, slot, service, cat, vehicle, name, email, phone, src) ON t.rn = days.rn;
