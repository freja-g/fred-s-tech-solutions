-- Adds how the customer wants their service delivered
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS delivery_method text
  CHECK (delivery_method IN ('doorstep', 'pick_up', 'drop_off', 'remote'));
