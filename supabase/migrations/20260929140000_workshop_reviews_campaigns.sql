-- 1) Werkstatt-Termine ------------------------------------------------------
CREATE TABLE public.workshop_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL CHECK (slot_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  service TEXT NOT NULL CHECK (length(service) BETWEEN 1 AND 120),
  category TEXT NOT NULL DEFAULT 'sonstiges' CHECK (category IN ('inspektion', 'hu_au', 'reifen', 'sonstiges')),
  vehicle TEXT NOT NULL DEFAULT '' CHECK (length(vehicle) <= 200),
  customer_name TEXT NOT NULL CHECK (length(customer_name) BETWEEN 1 AND 200),
  customer_email TEXT CHECK (customer_email IS NULL OR length(customer_email) <= 255),
  customer_phone TEXT CHECK (customer_phone IS NULL OR length(customer_phone) <= 50),
  status TEXT NOT NULL DEFAULT 'bestaetigt' CHECK (status IN ('bestaetigt', 'abgesagt')),
  source TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'admin')),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX workshop_appointments_slot_idx ON public.workshop_appointments (slot_date, slot_time);

-- Anzahl gleichzeitiger Termine je Slot (Werkstattplätze). Muss zu WORKSHOP_CAPACITY_PER_SLOT
-- in src/lib/workshop.ts passen.
CREATE OR REPLACE FUNCTION public.workshop_capacity()
RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 2 $$;

-- Kapazität atomar erzwingen (Advisory-Lock verhindert Doppelbuchung bei Gleichzeitigkeit)
CREATE OR REPLACE FUNCTION public.workshop_enforce_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  taken integer;
BEGIN
  IF NEW.status <> 'bestaetigt' THEN
    RETURN NEW;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(NEW.slot_date::text || NEW.slot_time));
  SELECT count(*) INTO taken
  FROM public.workshop_appointments
  WHERE slot_date = NEW.slot_date
    AND slot_time = NEW.slot_time
    AND status = 'bestaetigt'
    AND id <> NEW.id;
  IF taken >= public.workshop_capacity() THEN
    RAISE EXCEPTION 'slot_full' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.workshop_enforce_capacity() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER workshop_capacity_trg
  BEFORE INSERT OR UPDATE OF slot_date, slot_time, status ON public.workshop_appointments
  FOR EACH ROW EXECUTE FUNCTION public.workshop_enforce_capacity();

CREATE TRIGGER workshop_appointments_touch_updated_at
  BEFORE UPDATE ON public.workshop_appointments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.workshop_appointments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_appointments TO authenticated;
GRANT ALL ON public.workshop_appointments TO service_role;
-- Besucher greifen nie direkt zu: Buchung/Verfügbarkeit laufen über Server-Funktionen.

CREATE POLICY "Staff manage appointments" ON public.workshop_appointments
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'staff'::app_role));

-- 2) Kundenbewertungen (nur echte, vom Personal freigegebene) ---------------
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL CHECK (length(author) BETWEEN 1 AND 100),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 1500),
  source TEXT NOT NULL DEFAULT 'Google' CHECK (length(source) <= 40),
  source_url TEXT CHECK (source_url IS NULL OR length(source_url) <= 500),
  review_date DATE,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

CREATE POLICY "Public read published reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'staff'::app_role));

-- 3) Newsletter-Kampagnen (Protokoll) -----------------------------------------
CREATE TABLE public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (length(subject) <= 300),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  queued_count INTEGER NOT NULL DEFAULT 0,
  sent_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.newsletter_campaigns TO authenticated;
GRANT ALL ON public.newsletter_campaigns TO service_role;
CREATE POLICY "Admins read campaigns" ON public.newsletter_campaigns
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
