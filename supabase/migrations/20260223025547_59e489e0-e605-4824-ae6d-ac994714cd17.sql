
-- Add new columns to users_profile for curriculum tracking
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS current_week integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_level integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS research_mode boolean NOT NULL DEFAULT false;

-- Create skill_assessments table for TGMD-3 parent-reported ratings
CREATE TABLE public.skill_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  domain text NOT NULL,
  rating integer NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 3),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for skill_assessments
CREATE POLICY "Users can view their own assessments"
ON public.skill_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
ON public.skill_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.skill_assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
ON public.skill_assessments FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_skill_domain ON public.skill_assessments(skill_id, domain);
