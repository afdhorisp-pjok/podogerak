

# Research Consent Workflow

## Overview

Add a research consent system with three roles (teacher, parent, researcher), a parent consent modal during onboarding, child assent screen, data retention controls, and a consent audit log. All changes are additive modules.

---

## Database Changes (Migration)

### 1. Extend `app_role` enum
Add three new values: `'teacher'`, `'parent'`, `'researcher'`.

```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'researcher';
```

### 2. New table: `consent_records`
Stores hashed consent data -- no PII or uploaded documents.

```text
consent_records
- id (uuid PK)
- user_id (uuid, NOT NULL) -- parent who gave consent
- child_user_id (uuid) -- child account the consent is for
- consent_version (text, NOT NULL) -- e.g. "v1.0"
- consent_hash (text, NOT NULL) -- SHA-256 of consent payload
- consent_audio (boolean, default false)
- consent_sensor_data (boolean, default false)
- consent_video_upload (boolean, default false)
- granted_at (timestamptz, default now())
- revoked_at (timestamptz, nullable)
- created_at (timestamptz, default now())
```

RLS: Users can read/insert their own records. Researchers can read all (via `has_role`).

### 3. New table: `consent_audit_log`
Tracks all consent-related actions.

```text
consent_audit_log
- id (uuid PK)
- user_id (uuid, NOT NULL)
- action (text) -- 'grant', 'revoke', 'view', 'erase_pii'
- consent_record_id (uuid, nullable)
- metadata (jsonb, nullable)
- created_at (timestamptz, default now())
```

RLS: Insert for authenticated. Select for researcher/developer roles only.

### 4. New table: `data_retention_settings`
Per-child retention preferences.

```text
data_retention_settings
- id (uuid PK)
- user_id (uuid, NOT NULL) -- parent
- child_user_id (uuid)
- retention_days (integer, default 365)
- updated_at (timestamptz, default now())
```

RLS: Users manage their own.

### 5. RPC: `erase_child_pii(child_user_id_input uuid)`
Security definer function that:
- Nullifies PII in `users_profile` (username -> 'anon_' + short_id, email -> null, age -> null)
- Keeps de-identified IDs in `training_sessions`, `session_reports`, `user_progress`
- Logs action in `consent_audit_log`
- Does NOT delete the user account -- preserves anonymized research data

### 6. Assign default role on signup
Add to `handle_new_user` trigger or create a new trigger: insert `'parent'` role into `user_roles` for every new signup (default assumption: adults registering children).

---

## Frontend Changes

### New file: `src/lib/ConsentService.ts`
- `createConsentRecord(userId, childUserId, consents, version)` -- hashes payload, inserts record + audit
- `revokeConsent(consentId)` -- sets `revoked_at`, logs audit
- `getConsentStatus(childUserId)` -- checks if valid consent exists
- `eraseChildPII(childUserId)` -- calls RPC
- `updateRetention(childUserId, days)` -- updates retention settings
- Hash function uses `crypto.subtle.digest('SHA-256', ...)` (browser native)

### New file: `src/components/ParentConsentModal.tsx`
Shown after registration (step 3, after avatar selection):
- Embedded consent text (scrollable, styled as a document -- serves as PDF template)
- Three checkboxes: Audio recording, Sensor data, Video upload
- "Saya menyetujui" (I agree) button -- disabled until scrolled to bottom
- Stores hashed consent record, never stores uploaded docs
- "Unduh PDF" button to download consent text as PDF (using browser print/save)

### New file: `src/components/ChildAssent.tsx`
A 30-second visual/audio screen shown to the child before first session:
- Large friendly illustration with simple text: "Kita akan bermain dan belajar gerak! Mau ikut?" (We'll play and learn movement! Want to join?)
- Two large buttons: "Mau! 🎉" (Yes!) and "Tidak sekarang" (Not now)
- Uses `NarrationService` to auto-read the assent text
- Records assent in `consent_audit_log`

### New file: `src/components/DataRetentionSettings.tsx`
Accessible from Dashboard settings:
- Slider for retention period (30-730 days)
- Current retention display
- "Hapus Data Anak Saya" (Erase My Child's Data) button with confirmation dialog
- Shows what will be erased vs kept (PII removed, anonymized IDs retained)

### New file: `public/consent-template.md`
Markdown consent document template covering:
- Research purpose, data collected, rights, contact info
- Version number for tracking

### Modify: `src/components/LoginForm.tsx`
After successful registration, show `<ParentConsentModal>` before proceeding to dashboard. The modal is mandatory -- user cannot skip.

### Modify: `src/components/Dashboard.tsx`
- Add "Persetujuan & Data" (Consent & Data) button in quick actions
- Opens `<DataRetentionSettings>` view
- Before first session, check if child assent was given; if not, show `<ChildAssent>`

### Modify: `src/pages/Index.tsx`
Add consent check state: after login, verify consent exists. If not, show consent modal before dashboard.

---

## Role Enforcement

The existing `user_roles` table + `has_role()` function already supports this. New roles (teacher, parent, researcher) are added to the enum. RLS policies on consent tables use `has_role()` for researcher access. No changes to existing table policies.

---

## File Summary

| File | Action |
|------|--------|
| Migration SQL | Extend enum, 3 new tables, 1 RPC, trigger update |
| `src/lib/ConsentService.ts` | New: consent logic + hashing |
| `src/components/ParentConsentModal.tsx` | New: consent form |
| `src/components/ChildAssent.tsx` | New: child assent screen |
| `src/components/DataRetentionSettings.tsx` | New: retention + erase UI |
| `public/consent-template.md` | New: consent PDF template |
| `src/components/LoginForm.tsx` | Add consent modal after signup |
| `src/components/Dashboard.tsx` | Add consent button + assent check |
| `src/pages/Index.tsx` | Add consent status check |

