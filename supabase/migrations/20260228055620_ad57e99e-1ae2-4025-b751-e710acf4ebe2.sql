
-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'developer');

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users can read their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Session reports table
CREATE TABLE public.session_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.training_sessions(id),
  child_name text,
  session_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes integer,
  exercises_summary jsonb DEFAULT '[]'::jsonb,
  activity_score integer DEFAULT 0,
  verified boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
  ON public.session_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Report notifications table
CREATE TABLE public.report_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_id uuid REFERENCES public.session_reports(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.report_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.report_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.report_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Report audit log table
CREATE TABLE public.report_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  report_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.report_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert audit"
  ON public.report_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Developers can read audit"
  ON public.report_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'developer'));

-- RPC: generate_session_report
CREATE OR REPLACE FUNCTION public.generate_session_report(
  session_id_input uuid,
  user_id_input uuid,
  child_name_input text,
  exercises_input jsonb,
  duration_input integer,
  score_input integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_id uuid;
  sess record;
BEGIN
  -- Validate session exists and is completed
  SELECT * INTO sess FROM public.training_sessions
  WHERE id = session_id_input AND completed_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or not completed';
  END IF;

  -- Validate minimum duration (>= 1 minute)
  IF duration_input < 1 THEN
    RAISE EXCEPTION 'Session duration too short for report';
  END IF;

  -- Create report
  INSERT INTO public.session_reports (
    user_id, session_id, child_name, session_date,
    started_at, completed_at, duration_minutes,
    exercises_summary, activity_score, verified
  ) VALUES (
    user_id_input, session_id_input, child_name_input, now(),
    sess.started_at, sess.completed_at, duration_input,
    exercises_input, score_input, true
  ) RETURNING id INTO report_id;

  -- Create notification
  INSERT INTO public.report_notifications (user_id, report_id, message)
  VALUES (
    user_id_input,
    report_id,
    'Laporan sesi latihan ' || child_name_input || ' telah selesai. Durasi: ' || duration_input || ' menit, Skor: ' || score_input
  );

  RETURN report_id;
END;
$$;
