-- Protokoll ausgehender E-Mails (SMTP-Versand aus src/lib/mail.server.ts)
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT,
  recipient_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_send_log_created_idx ON public.email_send_log (created_at DESC);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.email_send_log TO authenticated;
GRANT ALL ON public.email_send_log TO service_role;

CREATE POLICY "Admins read email log" ON public.email_send_log
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
