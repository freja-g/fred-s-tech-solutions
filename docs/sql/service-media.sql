-- Run once on the database connected to GiCOFix and GiCOFix Staff.
-- This keeps existing services unchanged while allowing each service to have a photo or video.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS media_url text;

COMMENT ON COLUMN public.services.media_url IS
  'Accessible URL for the photo or looping video displayed with this service.';