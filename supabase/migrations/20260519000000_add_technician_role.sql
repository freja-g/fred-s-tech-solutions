
-- Add 'technician' to app_role enum
ALTER TYPE public.app_role ADD VALUE 'technician';

-- Update handle_new_user to assign role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  initial_role public.app_role;
BEGIN
  -- Determine role from metadata, default to 'customer'
  initial_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'customer');

  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, initial_role);

  RETURN NEW;
END; $$;
