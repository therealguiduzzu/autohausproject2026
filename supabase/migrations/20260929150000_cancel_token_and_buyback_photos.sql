-- Selbst-Absage von Werkstattterminen per geheimem Link
ALTER TABLE public.workshop_appointments
  ADD COLUMN IF NOT EXISTS cancel_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
CREATE UNIQUE INDEX IF NOT EXISTS workshop_appointments_cancel_token_key
  ON public.workshop_appointments (cancel_token);

-- Fotos für Ankaufsanfragen: privater Bucket, Upload nur über serverseitig signierte URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('buyback-photos', 'buyback-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];
-- Bewusst keine storage.objects-Policies: Zugriff nur mit Service-Role (Server-Funktionen).
