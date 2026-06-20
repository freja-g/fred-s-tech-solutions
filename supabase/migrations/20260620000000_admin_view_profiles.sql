-- Allow admins and technicians to view all profiles (needed for admin inbox to show real customer names)
DROP POLICY IF EXISTS "Admins and technicians view all profiles" ON public.profiles;
CREATE POLICY "Admins and technicians view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'technician'::app_role)
);
