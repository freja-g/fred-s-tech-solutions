-- ============================================================
-- GiCOFix / GiCOFix Staff — schema sync
-- Adds everything the apps expect that is missing from THIS
-- (connected) database. Verified gaps: consultations columns,
-- profiles.phone/location, reviews.technician_id/consultation_id,
-- and the payments + technician_profiles tables.
-- Run PART 1 first, then PART 2. Safe to re-run.
-- ============================================================

-- =========================== PART 1 ==========================
-- Payment status enum (must be committed before PART 2 uses it)
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','processing','paid','failed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================== PART 2 ==========================

-- 1. Consultations: job lifecycle + pricing + payment columns
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS delivery_method text,
  ADD COLUMN IF NOT EXISTS price          numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_amount   numeric(12,2),
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paid_at        timestamptz,
  ADD COLUMN IF NOT EXISTS mpesa_receipt  text,
  ADD COLUMN IF NOT EXISTS accepted_at    timestamptz,
  ADD COLUMN IF NOT EXISTS started_at     timestamptz,
  ADD COLUMN IF NOT EXISTS reject_reason  text,
  ADD COLUMN IF NOT EXISTS zone           text;

-- 2. Profiles extras
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone    text,
  ADD COLUMN IF NOT EXISTS location text;

-- 3. Reviews: tie a review to a technician / job
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS technician_id   uuid,
  ADD COLUMN IF NOT EXISTS consultation_id uuid;

-- 4. Payments table (M-Pesa)
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

-- updated_at helper + trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

-- 5. Technician profiles (staff signup + admin approval)
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  headline text,
  bio text,
  phone text,
  national_id text,
  approval_status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
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

-- 6. Profiles trigger for technician_profiles.updated_at
DROP TRIGGER IF EXISTS trg_tech_profiles_updated ON public.technician_profiles;
CREATE TRIGGER trg_tech_profiles_updated BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
