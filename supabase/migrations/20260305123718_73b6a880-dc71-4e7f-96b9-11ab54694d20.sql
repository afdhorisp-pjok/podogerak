
-- consent_records table
CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  child_user_id uuid,
  consent_version text NOT NULL DEFAULT 'v1.0',
  consent_hash text NOT NULL,
  consent_audio boolean DEFAULT false,
  consent_sensor_data boolean DEFAULT false,
  consent_video_upload boolean DEFAULT false,
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consent" ON public.consent_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent" ON public.consent_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent" ON public.consent_records
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Researchers can read all consent" ON public.consent_records
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'researcher'));

-- consent_audit_log table
CREATE TABLE public.consent_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  consent_record_id uuid REFERENCES public.consent_records(id),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.consent_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert consent audit" ON public.consent_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Researchers can read consent audit" ON public.consent_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'researcher') OR public.has_role(auth.uid(), 'developer'));

-- data_retention_settings table
CREATE TABLE public.data_retention_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  child_user_id uuid,
  retention_days integer DEFAULT 365,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.data_retention_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own retention" ON public.data_retention_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- erase_child_pii RPC
CREATE OR REPLACE FUNCTION public.erase_child_pii(child_user_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  short_id text;
BEGIN
  short_id := substring(child_user_id_input::text from 1 for 8);

  UPDATE public.users_profile
  SET username = 'anon_' || short_id,
      email = NULL,
      age = NULL
  WHERE id = child_user_id_input;

  INSERT INTO public.consent_audit_log (user_id, action, metadata)
  VALUES (auth.uid(), 'erase_pii', jsonb_build_object('child_user_id', child_user_id_input));
END;
$$;

-- Assign 'parent' role on signup trigger
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();
