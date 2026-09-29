-- Spam-/Missbrauchsschutz für öffentliche Anfragen (leads)

-- 1) Anonyme Besucher dürfen nur anlegen, nichts lesen/ändern/löschen
--    (RLS blockiert das bereits; hier zusätzlich auf Grant-Ebene = Defense in Depth)
REVOKE SELECT, UPDATE, DELETE ON public.leads FROM anon;
GRANT INSERT ON public.leads TO anon;

-- 2) Größenlimits für Freitextfelder
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_details_size_chk,
  ADD CONSTRAINT leads_details_size_chk CHECK (octet_length(details::text) <= 4000),
  DROP CONSTRAINT IF EXISTS leads_source_url_len_chk,
  ADD CONSTRAINT leads_source_url_len_chk CHECK (source_url IS NULL OR length(source_url) <= 2000);

-- 3) Rate-Limit per Trigger: je Kontakt max. 3 Anfragen / 10 Min., global max. 60 / Min.
CREATE OR REPLACE FUNCTION public.leads_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  per_contact integer;
  global_recent integer;
BEGIN
  IF NEW.email IS NOT NULL OR NEW.phone IS NOT NULL THEN
    SELECT count(*) INTO per_contact
    FROM public.leads
    WHERE created_at > now() - interval '10 minutes'
      AND ((NEW.email IS NOT NULL AND lower(email) = lower(NEW.email))
        OR (NEW.phone IS NOT NULL AND phone = NEW.phone));
    IF per_contact >= 3 THEN
      RAISE EXCEPTION 'rate_limit_contact' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  SELECT count(*) INTO global_recent
  FROM public.leads
  WHERE created_at > now() - interval '1 minute';
  IF global_recent >= 60 THEN
    RAISE EXCEPTION 'rate_limit_global' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.leads_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS leads_rate_limit_trg ON public.leads;
CREATE TRIGGER leads_rate_limit_trg
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.leads_rate_limit();
