

# Refactor & Extend PodoGerak Motor Skill Training App

## Overview

A comprehensive upgrade covering 9 areas: training UI, movement database, audio, anti-cheating, session lifecycle, auth simplification, frontend architecture, user feedback, and performance.

---

## A. Fix Training Screen Layout (TrainingPlayer.tsx)

Create a new `TrainingPlayer.tsx` component used inside `SessionRunner.tsx` to display movement content in a responsive 16:9 aspect-ratio container.

- Use Radix `AspectRatio` (already installed) with ratio 16/9
- Content centered with `object-fit: contain` and `flex items-center justify-center`
- Replace the inline emoji/illustration display in `SessionRunner.tsx` exercise and countdown phases with `<TrainingPlayer>`
- Prevent layout shift with min-height and skeleton placeholder during load

**Files:**
| File | Change |
|------|--------|
| `src/components/TrainingPlayer.tsx` | New component |
| `src/components/SessionRunner.tsx` | Use TrainingPlayer for movement display |

---

## B. Expand Movement Database

Create a `movements` table in the database and a `MovementService.ts` to load movements dynamically.

**Database migration:**
```sql
CREATE TABLE public.movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  animation_url text,
  illustration text DEFAULT '🏃',
  domain text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'easy',
  duration_seconds integer NOT NULL DEFAULT 10,
  equipment text DEFAULT 'none',
  parent_instruction text,
  child_instruction text,
  safety_note text,
  motor_goal text,
  week_introduced integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read movements" ON public.movements FOR SELECT USING (true);
```

Seed the table with all 30+ existing exercises from `workoutData.ts` plus additional entries to reach 12+ across difficulty levels.

**Files:**
| File | Change |
|------|--------|
| Migration SQL | Create table + seed data |
| `src/lib/MovementService.ts` | New: fetch movements, shuffle, deduplicate per session |
| `src/lib/curriculumData.ts` | Update `generateSessionExercises` to use MovementService |
| `src/components/Dashboard.tsx` | Use MovementService for session start |

---

## C. Background Audio System

Create `AudioController.ts` module for background music during sessions.

- Use a royalty-free instrumental loop stored in `/public/audio/session-bgm.mp3` (placeholder; user can replace)
- `AudioController` class: `start()`, `stop()`, `toggleMute()`, `isMuted()`
- Persist mute preference in `localStorage`
- Integrate into `SessionRunner.tsx`: start on exercise phase, stop on session complete/close

**Files:**
| File | Change |
|------|--------|
| `src/lib/AudioController.ts` | New module |
| `src/components/SessionRunner.tsx` | Integrate audio start/stop/mute |

---

## D. Backend-Validated Weekly Session Limit (Anti-Cheating)

Create `training_sessions` table and an RPC function for server-side validation.

**Database migration:**
```sql
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.training_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_weekly_session_limit(user_id_input uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  session_count integer;
  week_start timestamptz;
BEGIN
  week_start := date_trunc('week', now());
  SELECT count(*) INTO session_count
  FROM public.training_sessions
  WHERE user_id = user_id_input
    AND completed_at IS NOT NULL
    AND completed_at >= week_start;
  RETURN session_count < 3;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_training_session(user_id_input uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  active_count integer;
  new_id uuid;
BEGIN
  -- Check weekly limit
  IF NOT check_weekly_session_limit(user_id_input) THEN
    RAISE EXCEPTION 'Weekly session limit reached';
  END IF;
  -- Check no active session
  SELECT count(*) INTO active_count
  FROM public.training_sessions
  WHERE user_id = user_id_input AND completed_at IS NULL;
  IF active_count > 0 THEN
    RAISE EXCEPTION 'Active session already exists';
  END IF;
  INSERT INTO public.training_sessions (user_id)
  VALUES (user_id_input)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_training_session(session_id_input uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.training_sessions
  SET completed_at = now()
  WHERE id = session_id_input AND completed_at IS NULL;
END;
$$;
```

**Files:**
| File | Change |
|------|--------|
| Migration SQL | Create table, RLS, 3 RPC functions |
| `src/lib/SessionService.ts` | New: checkEligibility, startSession, completeSession |
| `src/components/Dashboard.tsx` | Check eligibility before session start, show remaining count |

---

## E. Session Lifecycle Integrity

Implement session state machine in `SessionService.ts`:

States: `idle` -> `active` -> `completed` or `blocked`

- `startSession()`: calls `start_training_session` RPC, returns session ID or throws
- `completeSession()`: calls `complete_training_session` RPC with session ID
- Track active session ID in state; prevent duplicate submissions
- If RPC throws "limit reached", set state to `blocked`

Integrated into `SessionRunner.tsx` and `Dashboard.tsx`.

---

## F. Remove Email Verification

- Use the configure-auth tool to enable auto-confirm for email signups
- Update `LoginForm.tsx`: remove the success message about email verification; after signup, call `onLogin()` directly
- Remove `emailRedirectTo` from signup options (no longer needed)

---

## G. Frontend Architecture

New files following separation of concerns:

| File | Purpose |
|------|---------|
| `src/components/TrainingPlayer.tsx` | Movement display UI |
| `src/lib/MovementService.ts` | Movement data fetching & selection |
| `src/lib/SessionService.ts` | Session lifecycle & anti-cheat |
| `src/lib/AudioController.ts` | Background audio management |

Existing auth flow stays in `authService.ts` (no separate AuthProvider needed since Supabase session is already managed in `Index.tsx`).

---

## H. User Feedback & Transparency

- Add loading skeleton in `Dashboard.tsx` when movements are being fetched
- Show remaining weekly sessions count (e.g., "2/3 sesi tersisa minggu ini") near the start button
- Show "Batas sesi minggu ini tercapai" message and disable button when blocked
- Session progress bar already exists in `SessionRunner.tsx`; ensure it updates correctly

---

## I. Performance

- Use `react-query` for caching movement data fetches
- Avoid refetching movements on every render
- Lazy-load audio file
- Minimize RPC calls: check eligibility once when dashboard mounts, cache result

---

## Implementation Order

1. Database migrations (movements table + training_sessions table + RPC functions)
2. Configure auth auto-confirm
3. Create `MovementService.ts`, `SessionService.ts`, `AudioController.ts`
4. Create `TrainingPlayer.tsx`
5. Update `SessionRunner.tsx` (TrainingPlayer + audio + session lifecycle)
6. Update `Dashboard.tsx` (eligibility check, remaining sessions, movement loading)
7. Update `LoginForm.tsx` (remove email verification messaging)
8. Add placeholder audio file

