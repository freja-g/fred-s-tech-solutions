-- ============================================================
-- WIGA TECH / WIGA STAFF — M-Pesa payments schema
-- Run this in your Supabase SQL editor (sections in order).
-- ============================================================

-- 1. Payment status enum ---------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Payments table --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL,
  technician_id UUID,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  phone TEXT NOT NULL,                     -- 2547XXXXXXXX
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'mpesa',
  merchant_request_id TEXT,                -- Daraja MerchantRequestID
  checkout_request_id TEXT,                -- Daraja CheckoutRequestID
  mpesa_receipt TEXT,                      -- e.g. QGR4XYZ123
  result_code INTEGER,
  result_desc TEXT,
  raw_callback JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_customer_idx ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS payments_consultation_idx ON public.payments(consultation_id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_checkout_idx ON public.payments(checkout_request_id) WHERE checkout_request_id IS NOT NULL;

-- 3. Grants (required — RLS alone is not enough) ---------------------------
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- 4. RLS -------------------------------------------------------------------
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

-- Only the edge function (service_role) may update payment state.

-- 5. updated_at trigger ----------------------------------------------------
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Invoice fields on consultations ---------------------------------------
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mpesa_receipt TEXT;

-- 7. Keep the consultation in sync when a payment succeeds -----------------
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
