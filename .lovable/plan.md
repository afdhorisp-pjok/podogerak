

# Researcher Analytics Module

## Overview

Add a comprehensive analytics dashboard for researchers with real-time metrics, auto-flagging for at-risk participants, raw/aggregated data export, and admin consent log management. Builds on top of the existing ExperimentToolkit and ExperimentService.

---

## No Database Changes Required

All data needed (experiments, participants, session logs, verifications, consent records/audit) already exists. The analytics are computed client-side from existing tables. No new tables or migrations needed.

However, we need one RLS policy addition: allow `admin` role to read `consent_records` and `consent_audit_log` (currently only `researcher` can read consent records).

**Migration (small):**
```sql
-- Admin can read consent records
CREATE POLICY "Admins can read all consent"
ON public.consent_records FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can read consent audit
CREATE POLICY "Admins can read consent audit"
ON public.consent_audit_log FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin to app_role enum if not exists
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
```

Wait -- `admin` already exists in the enum. So just the two policies.

---

## New Files

### `src/lib/AnalyticsService.ts`
Utility functions that compute analytics from already-fetched data (no new DB queries beyond what ExperimentService provides):

- `getParticipantsByArm(participants)` -- groups count by arm
- `getWeeklyCompletionRate(logs)` -- completion % per ISO week
- `getAverageDuration(logs)` -- mean duration in seconds
- `getTeacherFidelityScore(logs)` -- avg teacher_rating across all logs (proxy for checklist fidelity)
- `getFollowUpList(participants, logs, config)` -- identifies participants with 3+ consecutive missed sessions or fidelity < threshold
- `generateAggregatedReport(participants, logs)` -- produces per-arm stats: N, mean±SD duration, completion rate, with t-test placeholder columns
- `exportRawCSV(logs, participants)` -- reuses existing `exportCSV` from ExperimentService
- `exportAggregatedCSV(report)` -- downloads aggregated summary
- `exportConsentLogsCSV(consentRecords, auditLogs)` -- admin-only consent log export

### `src/components/ResearchAnalytics.tsx`
Full-page analytics module accessible from ExperimentToolkit (new tab) or ResearchDashboard. Takes an experiment as prop.

**Sections:**

1. **Summary Cards (top row):** N per arm, total completed, avg duration, fidelity score
2. **Charts:**
   - Bar chart: participants by arm
   - Line chart: weekly completion rate over time
   - Gauge/number: teacher fidelity score
3. **Follow-Up List:** Table of flagged participants (3+ missed sessions or fidelity < threshold). Threshold configurable via input (default 3.0).
4. **Export Panel:**
   - "Export Raw CSV" button (all session logs)
   - "Export Aggregated Report" button (pre/post template with N, mean±SD, t-test placeholder)
5. **Admin Section (conditional on admin role):**
   - "Download Consent Logs" button
   - "Revoke User Access" placeholder (UI only, logs action)

### `public/variable-definitions.md`
Documentation file with variable definitions for statistical analysis:
- participant_id, allocation_code, arm, stratum
- start_timestamp, end_timestamp, duration_seconds
- teacher_rating (0-5 scale), completion_flag
- fidelity_score definition
- Aggregated report column definitions (N, M, SD, t-test placeholder)

---

## Modified Files

### `src/components/ExperimentToolkit.tsx`
- Add a 4th tab "Analitik" (Analytics) that renders `<ResearchAnalytics>` for the selected experiment
- Add to TabsList: `<TabsTrigger value="analytics">📊 Analitik</TabsTrigger>`

### `src/components/ResearchDashboard.tsx`
- Add "Analitik Penelitian" button alongside "Experiment Toolkit" button
- When clicked, shows a experiment selector then navigates to ResearchAnalytics

### `src/lib/ExperimentService.ts`
- Add `getConsentRecords()` and `getConsentAuditLogs()` functions for admin export
- Add `getSessionVerifications(experimentId)` for fidelity score computation from checklist data

---

## Implementation Details

### Follow-Up Auto-Flagging Algorithm
For each participant:
1. Get their session logs sorted by date
2. Calculate expected session dates (weekly cadence from first session)
3. Count consecutive gaps where no session exists
4. If consecutive misses >= 3, flag as "missed_sessions"
5. Calculate per-participant avg teacher_rating; if < threshold, flag as "low_fidelity"

### Aggregated Report Template
```
arm | N | sessions_completed | mean_duration | sd_duration | mean_rating | sd_rating | t_stat | p_value
control | 15 | 42 | 845.2 | 120.3 | 4.1 | 0.8 | — | —
intervention_a | 14 | 38 | 920.1 | 98.7 | 4.3 | 0.6 | 1.82* | .07
```
*t-test placeholder: computed as `(M1-M2)/sqrt(SD1²/N1 + SD2²/N2)` for duration, comparing each arm vs control.

---

## File Summary

| File | Action |
|------|--------|
| Migration SQL | 2 RLS policies for admin consent access |
| `src/lib/AnalyticsService.ts` | New: all analytics computations + exports |
| `src/components/ResearchAnalytics.tsx` | New: analytics dashboard UI |
| `public/variable-definitions.md` | New: statistical variable documentation |
| `src/components/ExperimentToolkit.tsx` | Add Analytics tab |
| `src/components/ResearchDashboard.tsx` | Add analytics button |
| `src/lib/ExperimentService.ts` | Add consent/verification query functions |

