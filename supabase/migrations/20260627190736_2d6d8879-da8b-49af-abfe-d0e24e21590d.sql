
CREATE POLICY "Public read vehicle images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Staff upload vehicle images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  );

CREATE POLICY "Staff update vehicle images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  );

CREATE POLICY "Staff delete vehicle images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  );
