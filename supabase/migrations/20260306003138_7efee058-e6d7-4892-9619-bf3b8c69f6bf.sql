
-- Experiments table
CREATE TABLE public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  arms jsonb NOT NULL DEFAULT '["control","intervention_a","intervention_b"]'::jsonb,
  strata jsonb,
  seed integer NOT NULL DEFAULT floor(random() * 2147483647)::integer,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can read all experiments"
  ON public.experiments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'researcher'));

CREATE POLICY "Researchers can insert own experiments"
  ON public.experiments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = researcher_id AND public.has_role(auth.uid(), 'researcher'));

CREATE POLICY "Researchers can update own experiments"
  ON public.experiments FOR UPDATE TO authenticated
  USING (auth.uid() = researcher_id AND public.has_role(auth.uid(), 'researcher'));

-- Experiment participants table (locked after insert)
CREATE TABLE public.experiment_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  stratum text,
  arm text NOT NULL,
  allocation_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.experiment_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can read experiment participants"
  ON public.experiment_participants FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'researcher'));

-- No UPDATE/DELETE policies = locked

-- Experiment session logs table
CREATE TABLE public.experiment_session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.experiment_participants(id),
  session_id uuid,
  arm text NOT NULL,
  start_timestamp timestamptz NOT NULL,
  end_timestamp timestamptz,
  duration_seconds integer,
  teacher_rating integer,
  completion_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.experiment_session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can read experiment logs"
  ON public.experiment_session_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'researcher'));

CREATE POLICY "Researchers can insert experiment logs"
  ON public.experiment_session_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'researcher'));

-- Validation trigger for teacher_rating 0-5
CREATE OR REPLACE FUNCTION public.validate_teacher_rating()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.teacher_rating IS NOT NULL AND (NEW.teacher_rating < 0 OR NEW.teacher_rating > 5) THEN
    RAISE EXCEPTION 'teacher_rating must be between 0 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_teacher_rating
  BEFORE INSERT OR UPDATE ON public.experiment_session_logs
  FOR EACH ROW EXECUTE FUNCTION public.validate_teacher_rating();

-- RPC: randomize_participant
CREATE OR REPLACE FUNCTION public.randomize_participant(
  experiment_id_input uuid,
  user_id_input uuid DEFAULT NULL,
  stratum_input text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exp record;
  arms_array jsonb;
  arm_counts jsonb DEFAULT '{}'::jsonb;
  arm_text text;
  min_count integer;
  tied_arms text[];
  chosen_arm text;
  total_participants integer;
  new_participant_id uuid;
  alloc_code text;
  result_record record;
BEGIN
  -- Load experiment
  SELECT * INTO exp FROM public.experiments WHERE id = experiment_id_input;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Experiment not found';
  END IF;

  arms_array := exp.arms;

  -- Count per arm within stratum
  FOR arm_text IN SELECT jsonb_array_elements_text(arms_array)
  LOOP
    SELECT count(*) INTO min_count
    FROM public.experiment_participants
    WHERE experiment_id = experiment_id_input
      AND arm = arm_text
      AND (stratum_input IS NULL OR stratum = stratum_input);
    arm_counts := arm_counts || jsonb_build_object(arm_text, min_count);
  END LOOP;

  -- Find minimum count
  SELECT min(value::integer) INTO min_count
  FROM jsonb_each_text(arm_counts);

  -- Find tied arms
  tied_arms := ARRAY(
    SELECT key FROM jsonb_each_text(arm_counts) WHERE value::integer = min_count
  );

  -- Total participants for deterministic tie-breaking
  SELECT count(*) INTO total_participants FROM public.experiment_participants WHERE experiment_id = experiment_id_input;

  -- Deterministic tie-break
  chosen_arm := tied_arms[1 + ((exp.seed * 31 + total_participants) % array_length(tied_arms, 1))];

  -- Generate IDs
  new_participant_id := gen_random_uuid();
  alloc_code := 'EXP-' || upper(substring(md5(new_participant_id::text) from 1 for 4));

  -- Insert
  INSERT INTO public.experiment_participants (experiment_id, participant_id, user_id, stratum, arm, allocation_code)
  VALUES (experiment_id_input, new_participant_id, user_id_input, stratum_input, chosen_arm, alloc_code)
  RETURNING * INTO result_record;

  RETURN jsonb_build_object(
    'id', result_record.id,
    'participant_id', result_record.participant_id,
    'arm', result_record.arm,
    'allocation_code', result_record.allocation_code,
    'stratum', result_record.stratum
  );
END;
$$;
