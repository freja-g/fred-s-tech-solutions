-- ============================================================
-- WIGA STAFF — Technician app schema
-- Run this once in your Supabase SQL editor. Safe to re-run.
-- NOTE: run section 1 on its own first (Postgres requires new enum
-- values to be committed before they can be used).
-- ============================================================

-- 1. Extra job statuses -------------------------------------------------
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Job lifecycle + pricing columns ------------------------------------
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS accepted_at   timestamptz;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS started_at    timestamptz;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS resolved_at   timestamptz;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS price_amount  numeric(12,2);
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS reject_reason text;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS zone          text;

-- 3. Technician profiles -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline       text,
  bio            text,
  phone          text,
  specialties    text[] NOT NULL DEFAULT '{}',
  zones          text[] NOT NULL DEFAULT '{}',
  hourly_rate    numeric(12,2),
  is_online      boolean NOT NULL DEFAULT false,
  accepting_jobs boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
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

-- 4. Shifts --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_shifts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week   smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.technician_shifts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_shifts TO authenticated;
GRANT ALL ON public.technician_shifts TO service_role;
ALTER TABLE public.technician_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shifts" ON public.technician_shifts;
CREATE POLICY "Anyone can view shifts" ON public.technician_shifts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Technician manages own shifts" ON public.technician_shifts;
CREATE POLICY "Technician manages own shifts" ON public.technician_shifts
  FOR ALL TO authenticated
  USING (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'));

-- 5. Repair logs ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.repair_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  technician_id   uuid NOT NULL REFERENCES auth.users(id),
  diagnosis       text NOT NULL,
  work_done       text,
  parts_used      text,
  parts_cost      numeric(12,2) NOT NULL DEFAULT 0,
  labour_cost     numeric(12,2) NOT NULL DEFAULT 0,
  hours_spent     numeric(6,2) NOT NULL DEFAULT 0,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_logs TO authenticated;
GRANT ALL ON public.repair_logs TO service_role;
ALTER TABLE public.repair_logs ENABLE ROW LEVEL SECURITY;

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
  WITH CHECK (auth.uid() = technician_id
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician')));
DROP POLICY IF EXISTS "Staff update repair logs" ON public.repair_logs;
CREATE POLICY "Staff update repair logs" ON public.repair_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff delete repair logs" ON public.repair_logs;
CREATE POLICY "Staff delete repair logs" ON public.repair_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = technician_id OR public.has_role(auth.uid(), 'admin'));

-- 6. Job event timeline (powers live tracking) ---------------------------
CREATE TABLE IF NOT EXISTS public.job_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  actor_id        uuid REFERENCES auth.users(id),
  status          text NOT NULL,
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.job_events TO authenticated;
GRANT ALL ON public.job_events TO service_role;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

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

-- 7. Reviews tied to a technician / job ----------------------------------
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS technician_id   uuid REFERENCES auth.users(id);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS consultation_id uuid REFERENCES public.consultations(id);

-- 8. updated_at triggers --------------------------------------------------
DROP TRIGGER IF EXISTS trg_tech_profiles_updated ON public.technician_profiles;
CREATE TRIGGER trg_tech_profiles_updated BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_repair_logs_updated ON public.repair_logs;
CREATE TRIGGER trg_repair_logs_updated BEFORE UPDATE ON public.repair_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Indexes ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_consultations_technician ON public.consultations(technician_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status     ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_repair_logs_consultation ON public.repair_logs(consultation_id);
CREATE INDEX IF NOT EXISTS idx_job_events_consultation  ON public.job_events(consultation_id);
