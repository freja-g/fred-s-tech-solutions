
-- Update messages SELECT policy
DROP POLICY IF EXISTS "Customers see own thread, admins see all" ON public.messages;
CREATE POLICY "Customers see own thread, admins and technicians see all"
  ON public.messages FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'technician')
  );

-- Update messages INSERT policy
DROP POLICY IF EXISTS "Customers send to own thread, admins send to any" ON public.messages;
CREATE POLICY "Customers send to own thread, admins and technicians send to any"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND (
      (sender_role = 'customer' AND customer_id = auth.uid())
      OR (sender_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
      OR (sender_role = 'technician' AND public.has_role(auth.uid(), 'technician'))
    )
  );

-- Update reviews SELECT policy
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public view approved, owners/admins/technicians view all"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'technician')
  );

-- Update reviews UPDATE policy
DROP POLICY IF EXISTS "Admins update reviews" ON public.reviews;
CREATE POLICY "Admins and technicians update reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'technician')
  );

-- Update reviews DELETE policy
DROP POLICY IF EXISTS "Authors or admins delete reviews" ON public.reviews;
CREATE POLICY "Authors, admins or technicians delete reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'technician')
  );
