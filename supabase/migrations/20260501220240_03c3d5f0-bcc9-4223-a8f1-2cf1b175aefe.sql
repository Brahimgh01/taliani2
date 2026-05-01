
-- Restrict SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- Replace permissive contact_requests INSERT with explicit roles
DROP POLICY IF EXISTS "Anyone can submit a request" ON public.contact_requests;
CREATE POLICY "Anon can submit a request" ON public.contact_requests
  FOR INSERT TO anon WITH CHECK (
    length(name) > 0 AND length(name) <= 200
    AND length(email) > 0 AND length(email) <= 320
    AND length(message) > 0 AND length(message) <= 5000
  );
CREATE POLICY "Authed can submit a request" ON public.contact_requests
  FOR INSERT TO authenticated WITH CHECK (
    length(name) > 0 AND length(name) <= 200
    AND length(email) > 0 AND length(email) <= 320
    AND length(message) > 0 AND length(message) <= 5000
  );

-- Tighten storage: drop broad read, allow only direct object reads (no listing)
DROP POLICY IF EXISTS "Public read taliani assets" ON storage.objects;
CREATE POLICY "Public direct read taliani" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'taliani' AND (storage.foldername(name))[1] IS NOT NULL);
