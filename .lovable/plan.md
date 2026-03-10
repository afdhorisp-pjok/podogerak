

# Add Consent Variables to Documentation and CSV Export

## Overview

Add the 8 consent-related variables to `variable-definitions.md` as a new section and update the consent CSV export to include them. Some variables map directly to existing DB columns; `school` comes from `experiment_participants.stratum`; `device_type` is captured at export time via `navigator.userAgent`.

## Changes

### 1. `public/variable-definitions.md`
Add a new **Consent Record Variables** section after the existing tables:

| Variable | Type | Description |
|----------|------|-------------|
| `participant_id` | UUID | Links consent to experiment participant |
| `school` | String | School/class stratum from experiment enrollment |
| `timestamp` | ISO 8601 | When consent was granted (`granted_at`) |
| `consent_version` | String | Version of consent form (e.g., v1.0) |
| `sensor_permission` | Boolean (0/1) | Whether sensor data collection was permitted |
| `video_permission` | Boolean (0/1) | Whether video upload was permitted |
| `audio_permission` | Boolean (0/1) | Whether audio recording was permitted |
| `device_type` | String | Device/browser user agent at time of consent |

### 2. `src/lib/AnalyticsService.ts` — `exportConsentLogsCSV`
Update the consent records CSV export to include the new columns:
- Add `participant_id` by cross-referencing `child_user_id` with experiment participants
- Add `school` from participant's `stratum`
- Rename existing columns to match the variable definitions (e.g., `consent_audio` → `audio_permission`)
- Add `device_type` column (populated from `navigator.userAgent` for current export, or from metadata if stored)
- Accept optional `participants` parameter to enable the cross-reference

### 3. `src/components/ResearchAnalytics.tsx`
Pass participants data to `exportConsentLogsCSV` call so it can resolve participant_id and school.

## File Summary

| File | Action |
|------|--------|
| `public/variable-definitions.md` | Add Consent Record Variables section |
| `src/lib/AnalyticsService.ts` | Update `exportConsentLogsCSV` with new columns |
| `src/components/ResearchAnalytics.tsx` | Pass participants to consent export |

