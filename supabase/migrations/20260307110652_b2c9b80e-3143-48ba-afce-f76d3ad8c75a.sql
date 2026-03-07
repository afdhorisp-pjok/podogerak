
-- session_verifications table
CREATE TABLE public.session_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  verification_mode text NOT NULL,
  checklist_data jsonb,
  media_metrics jsonb,
  media_consent_photo boolean DEFAULT false,
  media_consent_video boolean DEFAULT false,
  teacher_id uuid,
  verified_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.session_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own verifications"
  ON public.session_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own verifications"
  ON public.session_verifications FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = teacher_id OR has_role(auth.uid(), 'researcher'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- parent_confirmations table
CREATE TABLE public.parent_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  parent_user_id uuid NOT NULL,
  child_name text,
  session_date timestamptz,
  confirmation_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  confirmed boolean DEFAULT false,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.parent_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read own confirmations"
  ON public.parent_confirmations FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update own confirmations"
  ON public.parent_confirmations FOR UPDATE
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Authenticated can insert confirmations"
  ON public.parent_confirmations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Storage bucket for verification media (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('verification-media', 'verification-media', false, 10485760);

-- Storage RLS: users can upload to their own folder
CREATE POLICY "Users upload own verification media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verification-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own verification media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own verification media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'verification-media' AND (storage.foldername(name))[1] = auth.uid()::text);
