CREATE OR REPLACE FUNCTION public.check_username_available(username_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.users_profile WHERE username = username_input
  );
END;
$$;