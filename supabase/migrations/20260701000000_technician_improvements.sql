
-- 1. Enhance Consultations for Repair Logging and Job Management
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'rejected';

ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS diagnostics TEXT,
ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS job_notes TEXT,
ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Enhance Profiles for Availability
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS coverage_zones TEXT[] DEFAULT '{}';

-- 3. RLS for new columns (usually handled by existing policies, but ensuring staff can update)
-- Existing policy "Staff update consultations" already covers UPDATE for technicians.

-- 4. Analytics Helper View (Optional but useful for the frontend)
CREATE OR REPLACE VIEW public.technician_stats AS
SELECT
    technician_id,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    SUM(cost) FILTER (WHERE status = 'completed') as total_earnings,
    AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at))/3600) FILTER (WHERE status = 'completed') as avg_completion_hours
FROM public.consultations
WHERE technician_id IS NOT NULL
GROUP BY technician_id;
