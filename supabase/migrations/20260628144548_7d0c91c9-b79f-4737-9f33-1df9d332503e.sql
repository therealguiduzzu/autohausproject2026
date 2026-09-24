
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex');

UPDATE public.newsletter_subscribers
   SET unsubscribe_token = encode(gen_random_bytes(24), 'hex')
 WHERE unsubscribe_token IS NULL;

ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN unsubscribe_token SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_unsub_token
  ON public.newsletter_subscribers(unsubscribe_token);
