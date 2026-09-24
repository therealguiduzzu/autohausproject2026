ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS co2_class text,
  ADD COLUMN IF NOT EXISTS consumption_combined numeric,
  ADD COLUMN IF NOT EXISTS power_consumption numeric,
  ADD COLUMN IF NOT EXISTS co2_emissions integer,
  ADD COLUMN IF NOT EXISTS discount_price numeric;