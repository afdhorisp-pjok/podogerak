

# Experiment Toolkit Module

## Overview

Add a complete experiment management system for researchers: create experiments with arms, randomize participants with stratification, log sessions, and export data as CSV. Accessible from the Research Dashboard when user has the `researcher` role.

---

## Database Changes (1 migration)

### New tables

**`experiments`** — experiment definitions (researcher-owned)
- `id` uuid PK
- `researcher_id` uuid NOT NULL (creator)
- `name` text NOT NULL
- `description` text
- `arms` jsonb NOT NULL — e.g. `["control","intervention_a","intervention_b"]`
- `strata` jsonb — e.g. `["school_a/class_1","school_a/class_2"]`
- `seed` integer NOT NULL — deterministic randomization seed
- `status` text DEFAULT 'active' — active/archived
- `created_at` timestamptz DEFAULT now()

RLS: Researchers can CRUD own experiments. Other researchers can SELECT all.

**`experiment_participants`** — allocation records (readonly after insert)
- `id` uuid PK
- `experiment_id` uuid FK → experiments
- `participant_id` uuid NOT NULL — generated UUID for de-identification
- `user_id` uuid — optional link to real user
- `stratum` text — school/class label
- `arm` text NOT NULL — assigned arm
- `allocation_code` text NOT NULL — short code e.g. "EXP-A3F2"
- `created_at` timestamptz DEFAULT now()

RLS: Researcher who owns the experiment can read. Insert via RPC only. No UPDATE/DELETE (locked).

**`experiment_session_logs`** — per-session data capture
- `id` uuid PK
- `experiment_id` uuid FK → experiments
- `participant_id` uuid FK → experiment_participants
- `session_id` uuid — optional link to training_sessions
- `arm` text NOT NULL
- `start_timestamp` timestamptz NOT NULL
- `end_timestamp` timestamptz
- `duration_seconds` integer
- `teacher_rating` integer CHECK 0-5 (via trigger)
- `completion_flag` boolean DEFAULT false
- `created_at` timestamptz DEFAULT now()

RLS: Researcher who owns the experiment can read/insert.

### RPC: `randomize_participant`

Security definer function that:
1. Takes `experiment_id`, `user_id` (optional), `stratum`
2. Loads experiment arms and seed
3. Counts existing allocations per arm within the stratum for balance
4. Assigns to the arm with fewest participants (ties broken by deterministic hash of seed + participant count)
5. Generates `participant_id` (UUID) and `allocation_code` (prefix + 4-char hex)
6. Inserts into `experiment_participants` and returns the record

---

## Frontend Changes

### New: `src/lib/ExperimentService.ts`
- `createExperiment(name, description, arms, strata, seed)`
- `getExperiments(researcherId)`
- `addParticipant(experimentId, userId, stratum)` — calls RPC
- `getParticipants(experimentId)`
- `logSession(data)` — insert into experiment_session_logs
- `getSessionLogs(experimentId)`
- `exportCSV(experimentId)` — fetches logs, converts to CSV, triggers download

### New: `src/components/ExperimentToolkit.tsx`
Full-page module (accessed from Research Dashboard) with tabs:

**Tab 1: Experiments** — list + create form
- Name, description, arms (dynamic add/remove), strata (comma-separated), seed (auto-generated with override)
- List of existing experiments with status

**Tab 2: Participants** — for selected experiment
- Table: participant_id, stratum, arm, allocation_code, created_at
- "Add Participant" button with stratum selector
- All allocations displayed as readonly

**Tab 3: Session Logs** — for selected experiment
- Table: session_id, participant, arm, timestamps, duration, rating, completion
- "Log Session" form for manual entry
- Summary cards: N participants, completed sessions, mean duration

**Tab 4: Export**
- "Export CSV" button that downloads all session logs
- Summary statistics displayed

### Modify: `src/components/ResearchDashboard.tsx`
- Add "Experiment Toolkit" button that navigates to the new module
- Check researcher role via `has_role` before showing

### Modify: `src/components/Dashboard.tsx`
- No changes needed (Research Dashboard already accessible via research mode toggle)

---

## Randomization Algorithm

Deterministic stratified block randomization:
1. For each stratum, count current allocations per arm
2. Find arm(s) with minimum count
3. If tie, use hash: `(seed * 31 + totalParticipants) % tiedArms.length`
4. This ensures reproducible allocation given the same seed and insertion order

---

## CSV Export

Client-side generation (no edge function needed):
- Fetch all `experiment_session_logs` for the experiment
- Join with `experiment_participants` for arm/stratum
- Convert to CSV string with headers
- Trigger browser download via Blob URL

---

## File Summary

| File | Action |
|------|--------|
| Migration SQL | 3 tables + RPC + RLS |
| `src/lib/ExperimentService.ts` | New |
| `src/components/ExperimentToolkit.tsx` | New |
| `src/components/ResearchDashboard.tsx` | Add toolkit button |

