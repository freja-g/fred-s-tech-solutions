-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'Briefcase',
  price_estimate text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff insert services" ON public.services;
CREATE POLICY "Staff insert services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Staff update services" ON public.services;
CREATE POLICY "Staff update services" ON public.services FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Staff delete services" ON public.services;
CREATE POLICY "Staff delete services" ON public.services FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

-- Get Smart Content
CREATE TABLE IF NOT EXISTS public.get_smart_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'Tech Tip',
  image_url text,
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.get_smart_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.get_smart_content TO authenticated;
GRANT ALL ON public.get_smart_content TO service_role;
ALTER TABLE public.get_smart_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view smart content" ON public.get_smart_content;
CREATE POLICY "Anyone can view smart content" ON public.get_smart_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff insert smart" ON public.get_smart_content;
CREATE POLICY "Staff insert smart" ON public.get_smart_content FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Staff update smart" ON public.get_smart_content;
CREATE POLICY "Staff update smart" ON public.get_smart_content FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Staff delete smart" ON public.get_smart_content;
CREATE POLICY "Staff delete smart" ON public.get_smart_content FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

-- Consultations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultation_status') THEN
    CREATE TYPE public.consultation_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id),
  technician_id uuid REFERENCES auth.users(id),
  service_id uuid REFERENCES public.services(id),
  subject text NOT NULL,
  description text NOT NULL,
  status public.consultation_status NOT NULL DEFAULT 'pending',
  attachment_urls text[] DEFAULT '{}',
  preferred_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View own or staff" ON public.consultations;
CREATE POLICY "View own or staff" ON public.consultations FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Customers book" ON public.consultations;
CREATE POLICY "Customers book" ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Staff update consultations" ON public.consultations;
CREATE POLICY "Staff update consultations" ON public.consultations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

-- Profile avatar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_services_updated ON public.services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_smart_updated ON public.get_smart_content;
CREATE TRIGGER trg_smart_updated BEFORE UPDATE ON public.get_smart_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_consultations_updated ON public.consultations;
CREATE TRIGGER trg_consultations_updated BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for 'attachments' bucket (public read, authenticated write)
DROP POLICY IF EXISTS "Public read attachments" ON storage.objects;
CREATE POLICY "Public read attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');
DROP POLICY IF EXISTS "Authenticated upload attachments" ON storage.objects;
CREATE POLICY "Authenticated upload attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments');
DROP POLICY IF EXISTS "Owners update attachments" ON storage.objects;
CREATE POLICY "Owners update attachments" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments' AND owner = auth.uid());
DROP POLICY IF EXISTS "Owners delete attachments" ON storage.objects;
CREATE POLICY "Owners delete attachments" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND owner = auth.uid());
