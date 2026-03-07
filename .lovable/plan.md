

# Multi-Tier Session Verification

## Overview

Add a post-session verification layer with three modes (checklist, photo, video), a parent confirmation flow, and an audit trail. Integrates after `SessionRunner` completion and before final report generation.

---

## Database Changes (1 migration)

### New table: `session_verifications`
- `id` uuid PK
- `session_id` uuid NOT NULL (FK → training_sessions)
- `user_id` uuid NOT NULL
- `verification_mode` text NOT NULL — 'checklist' | 'photo' | 'video'
- `checklist_data` jsonb — 8-item checklist with boolean values
- `media_metrics` jsonb — non-identifying metrics (pose keypoint counts, thumbnail dimensions)
- `media_consent_photo` boolean DEFAULT false
- `media_consent_video` boolean DEFAULT false
- `teacher_id` uuid — who verified
- `verified_at` timestamptz DEFAULT now()
- `created_at` timestamptz DEFAULT now()

RLS: Users can insert/read own. Teachers can read sessions they verified. Researchers can read all.

### New table: `parent_confirmations`
- `id` uuid PK
- `session_id` uuid NOT NULL
- `parent_user_id` uuid NOT NULL
- `confirmation_token` text NOT NULL UNIQUE — short token for one-click confirm
- `confirmed` boolean DEFAULT false
- `confirmed_at` timestamptz
- `created_at` timestamptz DEFAULT now()

RLS: Parents can read/update own.

### Storage bucket: `verification-media`
- Private bucket with RLS
- Only authenticated users can upload to their own folder
- Files auto-expire based on retention settings

### Teacher checklist schema (8 items, stored as jsonb):
```json
[
  { "key": "child_present", "label": "Anak hadir dan siap" },
  { "key": "warm_up_done", "label": "Pemanasan dilakukan" },
  { "key": "instructions_given", "label": "Instruksi diberikan dengan jelas" },
  { "key": "movements_performed", "label": "Gerakan dilakukan sesuai panduan" },
  { "key": "safety_observed", "label": "Keamanan diperhatikan" },
  { "key": "child_engaged", "label": "Anak berpartisipasi aktif" },
  { "key": "cool_down_done", "label": "Pendinginan dilakukan" },
  { "key": "session_completed", "label": "Sesi diselesaikan penuh" }
]
```

---

## New Files

### `src/lib/VerificationService.ts`
- `submitChecklist(sessionId, userId, checklistData)` — inserts verification record
- `submitMediaVerification(sessionId, userId, mode, file, consents)` — strips EXIF via canvas re-encode, generates thumbnail, computes metrics (dimensions, file size), uploads to private bucket, stores only metrics in DB
- `createParentConfirmation(sessionId, parentUserId)` — generates token, inserts record, creates notification
- `confirmParentReport(token)` — marks confirmed, logs audit
- `getVerificationStatus(sessionId)` — returns verification + parent confirmation status

**Media privacy pipeline (client-side):**
1. Take photo/video via `<input type="file" accept="image/*,video/*">`
2. For images: draw to canvas → re-export as JPEG (strips all EXIF/metadata)
3. Generate small thumbnail (max 120px)
4. Compute non-identifying metrics: `{ width, height, fileSize, timestamp }`
5. Upload stripped file to private bucket `verification-media/{userId}/{sessionId}/`
6. Store only metrics + thumbnail path in `session_verifications.media_metrics`

### `src/components/SessionVerification.tsx`
Shown after session completion (before final save). Three tabs:

**Tab 1: Checklist** — 8 toggle items, teacher checks each. "Verifikasi" button when ≥6 checked.

**Tab 2: Foto (Optional)** — Camera capture button, consent toggle "Saya setuju foto ini disimpan", preview of stripped image, upload button. Shows "Metadata dihapus ✓" badge.

**Tab 3: Video (Optional)** — Same as photo but for short video (max 30s). Consent toggle required.

Bottom: "Lewati Verifikasi" (Skip) option and "Simpan Verifikasi" button.

### `src/components/ParentConfirmation.tsx`
Small card shown in parent's notification bell:
- "Anak Anda telah menyelesaikan sesi latihan pada [date]. Konfirmasi?"
- One-click "Ya, Benar ✓" button
- Logs to `consent_audit_log`

---

## Modified Files

### `src/components/Dashboard.tsx`
- After `handleWorkoutComplete`, show `<SessionVerification>` modal before final save
- Add verification state management
- When verification submitted, also call `createParentConfirmation` to notify parent

### `src/components/SessionRunner.tsx`
- On session complete phase, pass session data up to trigger verification flow (no changes to SessionRunner itself, verification happens in Dashboard after `onComplete`)

### `src/components/NotificationBell.tsx`
- Show parent confirmation notifications alongside existing report notifications
- Add "Konfirmasi" action button inline

### `src/lib/ReportService.ts`
- Add `getParentConfirmations(userId)` for fetching pending confirmations
- Extend notification query to include parent confirmations

---

## Implementation Order

1. Database migration (2 tables + storage bucket + RLS)
2. `VerificationService.ts` (CRUD + media pipeline)
3. `SessionVerification.tsx` (3-tab verification UI)
4. `ParentConfirmation.tsx` (one-click confirm card)
5. Update `Dashboard.tsx` (verification flow after session)
6. Update `NotificationBell.tsx` (parent confirmation notifications)

