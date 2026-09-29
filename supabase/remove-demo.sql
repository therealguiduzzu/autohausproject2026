-- Entfernt alle Beispieldaten aus supabase/seed-demo.sql (vor dem Livegang ausführen).
DELETE FROM public.workshop_appointments WHERE customer_email LIKE '%@demo.invalid';
DELETE FROM public.leads WHERE email LIKE '%@demo.invalid';
DELETE FROM public.vehicles WHERE mobile_de_id LIKE 'DEMO-%';
