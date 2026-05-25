
-- 1. Services Table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT, -- Lucide icon name
  price_estimate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT USING (true);

CREATE POLICY "Staff can manage services"
  ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

-- 2. Get Smart Content Table
CREATE TABLE public.get_smart_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.get_smart_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view smart content"
  ON public.get_smart_content FOR SELECT USING (true);

CREATE POLICY "Staff can manage smart content"
  ON public.get_smart_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

-- 3. Consultations Table
CREATE TYPE public.consultation_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');

CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  technician_id UUID REFERENCES auth.users(id),
  service_id UUID REFERENCES public.services(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status consultation_status NOT NULL DEFAULT 'pending',
  attachment_urls TEXT[], -- Array of image URLs
  preferred_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON public.consultations FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

CREATE POLICY "Users can book consultations"
  ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can update consultations (accept/complete)"
  ON public.consultations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

-- 4. Storage Buckets
-- Note: These usually need to be created via UI or a separate script,
-- but we define the RLS here assuming they exist as 'avatars' and 'attachments'

-- 5. Profile Picture Column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 6. Trigger for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_smart_content_updated_at BEFORE UPDATE ON public.get_smart_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
