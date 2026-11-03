-- ============================================================
-- GiCOFix / GiCOFix Staff — core schema rebuild
-- Brings the database up to what both apps expect.
-- Run PART 1 first, then PART 2 (new enum values must be
-- committed before policies may reference them).
-- Safe to re-run.
-- ============================================================

-- =========================== PART 1 ==========================

-- 0. updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- 1. Enums
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'technician';

DO $$ BEGIN
  CREATE TYPE public.consultation_status AS ENUM ('pending','accepted','in_progress','completed','cancelled','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'rejected';

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','processing','paid','failed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Profiles extras
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS coverage_zones text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_profiles_user_id ON public.profiles(user_id);

-- 3. Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'Briefcase',
  media_url text,
  price_estimate text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Get Smart content
CREATE TABLE IF NOT EXISTS public.get_smart_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'Tech Tip',
  image_url text,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.get_smart_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.get_smart_content TO authenticated;
GRANT ALL ON public.get_smart_content TO service_role;
ALTER TABLE public.get_smart_content ENABLE ROW LEVEL SECURITY;

-- 5. Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  technician_id uuid,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status public.consultation_status NOT NULL DEFAULT 'pending',
  attachment_urls text[] DEFAULT '{}',
  preferred_date timestamptz,
  delivery_method text,
  price numeric(12,2),
  price_amount numeric(12,2),
  cost numeric(12,2),
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  mpesa_receipt text,
  assigned_at timestamptz,
  accepted_at timestamptz,
  started_at timestamptz,
  resolved_at timestamptz,
  completed_at timestamptz,
  rejected_reason text,
  reject_reason text,
  diagnostics text,
  job_notes text,
  zone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 6. Technician profiles
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  headline text,
  bio text,
  phone text,
  national_id text,
  approval_status text NOT NULL DEFAULT 'pending',
  specialties text[] NOT NULL DEFAULT '{}',
  zones text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric(12,2),
  is_online boolean NOT NULL DEFAULT false,
  accepting_jobs boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.technician_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_profiles TO authenticated;
GRANT ALL ON public.technician_profiles TO service_role;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Technician shifts
CREATE TABLE IF NOT EXISTS public.technician_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.technician_shifts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_shifts TO authenticated;
GRANT ALL ON public.technician_shifts TO service_role;
ALTER TABLE public.technician_shifts ENABLE ROW LEVEL SECURITY;

-- 8. Repair logs
CREATE TABLE IF NOT EXISTS public.repair_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL,
  diagnosis text NOT NULL,
  work_done text,
  parts_used text,
  parts_cost numeric(12,2) NOT NULL DEFAULT 0,
  labour_cost numeric(12,2) NOT NULL DEFAULT 0,
  hours_spent numeric(6,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_logs TO authenticated;
GRANT ALL ON public.repair_logs TO service_role;
ALTER TABLE public.repair_logs ENABLE ROW LEVEL SECURITY;

-- 9. Job events
CREATE TABLE IF NOT EXISTS public.job_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  actor_id uuid,
  status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.job_events TO authenticated;
GRANT ALL ON public.job_events TO service_role;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

-- 10. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL,
  technician_id uuid,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'KES',
  phone text NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'mpesa',
  merchant_request_id text,
  checkout_request_id text,
  mpesa_receipt text,
  result_code integer,
  result_desc text,
  raw_callback jsonb,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_customer_idx ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS payments_consultation_idx ON public.payments(consultation_id);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 11. Reviews extras
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS technician_id uuid,
  ADD COLUMN IF NOT EXISTS consultation_id uuid;

-- 12. updated_at triggers
DROP TRIGGER IF EXISTS trg_services_updated ON public.services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_smart_updated ON public.get_smart_content;
CREATE TRIGGER trg_smart_updated BEFORE UPDATE ON public.get_smart_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_consultations_updated ON public.consultations;
CREATE TRIGGER trg_consultations_updated BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_tech_profiles_updated ON public.technician_profiles;
CREATE TRIGGER trg_tech_profiles_updated BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_repair_logs_updated ON public.repair_logs;
CREATE TRIGGER trg_repair_logs_updated BEFORE UPDATE ON public.repair_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Indexes
CREATE INDEX IF NOT EXISTS idx_consultations_technician ON public.consultations(technician_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_customer ON public.consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_logs_consultation ON public.repair_logs(consultation_id);
CREATE INDEX IF NOT EXISTS idx_job_events_consultation ON public.job_events(consultation_id);

-- 14. Storage policies for the attachments bucket
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

-- =========================== PART 2 ==========================
-- Row-level security policies (safe to reference the new
-- 'technician' role value now that Part 1 is committed).

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

DROP POLICY IF EXISTS "View own or staff" ON public.consultations;
CREATE POLICY "View own or staff" ON public.consultations FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Customers book" ON public.consultations;
CREATE POLICY "Customers book" ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Update own or staff" ON public.consultations;
CREATE POLICY "Update own or staff" ON public.consultations FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

DROP POLICY IF EXISTS "Anyone can view technician profiles" ON public.technician_profiles;
CREATE POLICY "Anyone can view technician profiles" ON public.technician_profiles
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Technician manages own profile" ON public.technician_profiles;
CREATE POLICY "Technician manages own profile" ON public.technician_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Technician updates own profile" ON public.technician_profiles;
CREATE POLICY "Technician updates own profile" ON public.technician_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete technician profiles" ON public.technician_profiles;
CREATE POLICY "Admins delete technician profiles" ON public.technician_profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can view shifts" ON public.technician_shifts;
CREATE POLICY "Anyone can view shifts" ON public.technician_shifts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Technician manages own shifts" ON public.technician_shifts;
CREATE POLICY "Technician manages own shifts" ON public.technician_shifts
  FOR ALL TO authenticated
  USING (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff and job owner view repair logs" ON public.repair_logs;
CREATE POLICY "Staff and job owner view repair logs" ON public.repair_logs
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'technician')
    OR EXISTS (SELECT 1 FROM public.consultations c
               WHERE c.id = consultation_id AND c.customer_id = auth.uid())
  );
DROP POLICY IF EXISTS "Staff write repair logs" ON public.repair_logs;
CREATE POLICY "Staff write repair logs" ON public.repair_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
DROP POLICY IF EXISTS "Staff update repair logs" ON public.repair_logs;
CREATE POLICY "Staff update repair logs" ON public.repair_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff delete repair logs" ON public.repair_logs;
CREATE POLICY "Staff delete repair logs" ON public.repair_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff and job owner view events" ON public.job_events;
CREATE POLICY "Staff and job owner view events" ON public.job_events
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'technician')
    OR EXISTS (SELECT 1 FROM public.consultations c
               WHERE c.id = consultation_id AND c.customer_id = auth.uid())
  );
DROP POLICY IF EXISTS "Staff write events" ON public.job_events;
CREATE POLICY "Staff write events" ON public.job_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Customers see own payments, staff see all" ON public.payments;
CREATE POLICY "Customers see own payments, staff see all"
ON public.payments FOR SELECT TO authenticated
USING (
  auth.uid() = customer_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'technician')
);
DROP POLICY IF EXISTS "Customers create own payments" ON public.payments;
CREATE POLICY "Customers create own payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Keep the consultation in sync when a payment succeeds
CREATE OR REPLACE FUNCTION public.sync_consultation_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.consultation_id IS NOT NULL AND NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.consultations
       SET payment_status = NEW.status,
           paid_at        = CASE WHEN NEW.status = 'paid' THEN NEW.paid_at ELSE paid_at END,
           mpesa_receipt  = COALESCE(NEW.mpesa_receipt, mpesa_receipt)
     WHERE id = NEW.consultation_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS payments_sync_consultation ON public.payments;
CREATE TRIGGER payments_sync_consultation
AFTER UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.sync_consultation_payment();
