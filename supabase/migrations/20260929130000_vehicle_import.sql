-- Fahrzeug-Import: externe Inserat-ID eindeutig (NULL bleibt mehrfach erlaubt)
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_mobile_de_id_key ON public.vehicles (mobile_de_id);

-- Protokoll der Importläufe (nur Personal)
CREATE TABLE IF NOT EXISTS public.import_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL,            -- 'admin' | 'api'
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.import_runs TO authenticated;
GRANT ALL ON public.import_runs TO service_role;

CREATE POLICY "Staff read import runs" ON public.import_runs
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'staff'::app_role));
