
# PodoGerak: Transformasi ke Platform Intervensi Motorik Digital Berbasis Riset

## Ringkasan

Transformasi total PodoGerak dari aplikasi latihan motorik kasar sederhana menjadi platform intervensi motorik digital kelas riset yang selaras dengan TGMD-3, untuk anak usia 4-7 tahun. Semua fitur yang sudah ada (auth, dashboard, progress, chart, badge) akan dipertahankan dan ditingkatkan kualitasnya.

**Catatan penting:** Mengingat besarnya skala perubahan ini, implementasi akan dibagi menjadi **3 fase** yang berurutan. Setiap fase akan menghasilkan sistem yang fungsional. Rencana ini mencakup seluruh fase.

---

## FASE 1: Fondasi Data dan Library Latihan TGMD-3

### 1.1 Database: Tabel Baru

**Tabel `skill_assessments`** (Penilaian TGMD-3 oleh orang tua):
- `id` (uuid, PK)
- `user_id` (uuid, FK ke users_profile)
- `skill_id` (text) - ID latihan yang dinilai
- `domain` (text) - locomotor / ball_skills / combined
- `rating` (integer) - 0-3 (not able / emerging / developing / competent)
- `assessed_at` (timestamptz)
- `notes` (text, nullable)

**Kolom baru di `users_profile`**:
- `current_week` (integer, default 1) - minggu ke-berapa dalam kurikulum 8 minggu
- `current_level` (integer, default 1) - level progresif
- `research_mode` (boolean, default false) - aktifkan mode riset

RLS: user hanya bisa akses data sendiri.

### 1.2 Library Latihan Baru (TGMD-3 Aligned)

Mengganti seluruh konten `src/lib/workoutData.ts` dengan library latihan yang disetujui. Domain berubah dari 3 kategori menjadi 5:

| Domain Lama | Domain Baru |
|---|---|
| Lokomotor | Locomotor |
| Non-Lokomotor | Jumping & Hopping, Balance |
| Manipulatif | Ball Skills |
| - | Combined |

**34 latihan** dari daftar yang disetujui, masing-masing dengan format:
- Exercise Name, Domain, Duration (5-15 detik), Equipment
- Parent Instruction, Child Instruction
- Motor Goal, Safety Note

### 1.3 File Baru: `src/lib/curriculumData.ts`

Kurikulum 8 minggu terstruktur:
- Minggu 1-2: Fundamental (latihan dasar per domain)
- Minggu 3-4: Development (kombinasi sederhana)
- Minggu 5-6: Integration (cross-domain)
- Minggu 7-8: Mastery (latihan gabungan)

Progresi hanya meningkatkan:
- Kompleksitas koordinasi
- Durasi keseimbangan
- Integrasi lokomotor + ball skills

TIDAK meningkatkan beban fisik atau intensitas.

---

## FASE 2: Sistem Sesi, Penilaian, dan Coaching

### 2.1 Sesi Latihan Baru

Struktur sesi baru (mengganti WorkoutTimer):
- Tepat 4 latihan per sesi
- Total durasi maksimal 3 menit
- Flow: Start -> Exercise 1 -> Complete -> Exercise 2 -> Complete -> Exercise 3 -> Complete -> Exercise 4 -> Complete -> Session Complete -> Progress Updated
- Instruksi orang tua ditampilkan sebelum setiap latihan
- Instruksi anak ditampilkan selama latihan (playful, sangat sederhana)
- Safety note ditampilkan

### 2.2 Modul Penilaian TGMD-3

Komponen baru `AssessmentModule.tsx`:
- Parent-reported rating per skill
- Skala: 0 (belum bisa) / 1 (mulai muncul) / 2 (berkembang) / 3 (kompeten)
- Tracking perkembangan skill over time
- Disimpan ke tabel `skill_assessments`

### 2.3 Parent Coaching yang Ditingkatkan

Mengganti `EducationPage.tsx` dan `ParentGuideModal.tsx` dengan konten research-credible:
- Tujuan intervensi
- Cara membimbing anak dengan aman
- Pentingnya pengulangan
- Prinsip dorongan positif
- Frekuensi yang direkomendasikan (3-4 sesi per minggu)
- Bahasa profesional dan kredibel

### 2.4 Behavioral Adherence System

- Completion feedback: "Great job!", "Session complete!", "Progress updated!"
- Progress indicators visual
- Motivational messages tanpa tekanan performa
- Tidak ada leaderboard atau kompetisi

---

## FASE 3: Dashboard Riset, Monitoring, dan UI Refinement

### 3.1 Research Mode Dashboard

Komponen baru `ResearchDashboard.tsx`:
- Aktifkan via toggle di profil
- Menampilkan:
  - Session timestamps
  - Exercise exposure (frekuensi setiap latihan)
  - Session completion rate
  - Adherence frequency
  - Progression data per minggu
- Data terstruktur untuk ekspor

### 3.2 Progress Monitoring Dashboard yang Ditingkatkan

Update `Dashboard.tsx` dan `ProgressReport.tsx`:
- Total sessions completed
- Adherence frequency (sesi/minggu vs target 3-4x)
- Current level dan week
- Progression status
- Locomotor skill exposure
- Ball skill exposure
- Completion consistency
- Visual progress indicators

### 3.3 Update Chart dan Statistik

Update `progressUtils.ts` untuk domain baru:
- Locomotor, Jumping & Hopping, Balance, Ball Skills, Combined
- Distribution pie chart dengan 5 domain
- Weekly/monthly trends per domain

### 3.4 UI Refinement

Upgrade tampilan menjadi "digital therapeutic platform":
- Clean, calm, minimal, professional
- Large buttons
- Clear hierarchy
- Mobile-first
- Parent-trustworthy appearance
- Tidak clutter

---

## Detail Teknis

### File yang Akan Dibuat

| File | Deskripsi |
|---|---|
| `src/lib/curriculumData.ts` | Kurikulum 8 minggu + approved exercise library (34 latihan) |
| `src/components/SessionRunner.tsx` | Sistem eksekusi sesi baru (4 latihan, 3 menit maks) |
| `src/components/AssessmentModule.tsx` | Modul penilaian TGMD-3 (parent-reported) |
| `src/components/ResearchDashboard.tsx` | Dashboard mode riset |
| `src/components/ParentCoachingPage.tsx` | Halaman coaching orang tua yang ditingkatkan |
| `src/components/SessionComplete.tsx` | Layar penyelesaian sesi dengan feedback |
| `src/components/ExerciseDetail.tsx` | Detail latihan dengan instruksi orang tua dan anak |
| `src/components/CurriculumProgress.tsx` | Visualisasi progres kurikulum 8 minggu |
| `src/components/SkillRatingCard.tsx` | Kartu penilaian per skill |
| Migrasi SQL | Tabel skill_assessments + kolom baru di users_profile |

### File yang Akan Dimodifikasi

| File | Perubahan |
|---|---|
| `src/lib/workoutData.ts` | Ganti seluruh exercise library dengan 34 latihan TGMD-3, update types dan domains |
| `src/lib/progressUtils.ts` | Update untuk 5 domain baru, kalkulasi adherence, exposure |
| `src/lib/progressService.ts` | Tambah fungsi untuk skill_assessments, curriculum tracking |
| `src/lib/badgeData.ts` | Update exercise ID references untuk library baru |
| `src/lib/authService.ts` | Tambah current_week, current_level, research_mode ke UserProfile |
| `src/components/Dashboard.tsx` | Tambah curriculum progress, level indicator, research mode toggle, navigasi ke assessment |
| `src/components/WorkoutTimer.tsx` | Refaktor menjadi 4-exercise session flow dengan parent/child instructions |
| `src/components/CategoryCard.tsx` | Update untuk 5 domain baru (Locomotor, Jumping, Balance, Ball Skills, Combined) |
| `src/components/ProgressReport.tsx` | Update charts untuk 5 domain, tambah adherence metrics |
| `src/components/EducationPage.tsx` | Konten TGMD-3 aligned, research-credible language |
| `src/components/ParentGuideModal.tsx` | Konten coaching yang ditingkatkan |
| `src/components/HistorySection.tsx` | Tampilkan domain exercises per sesi |
| `src/components/StatsCard.tsx` | Tambah variant untuk domain baru |
| `src/components/BadgesSection.tsx` | Update untuk domain baru |
| `src/pages/Index.tsx` | Load current_week dan level dari profil |
| `src/index.css` | Tambah warna domain baru (jumping, balance, ballskills) |
| `tailwind.config.ts` | Tambah warna domain baru |

### Perubahan pada Exercise Type

```text
Sebelum:
  Exercise {
    id, name, description, category (3 tipe),
    repetitions, sets, durationPerRep, restTime,
    illustration
  }

Sesudah:
  Exercise {
    id, name,
    domain: locomotor | jumping | balance | ball_skills | combined,
    duration: 5-15 (detik),
    equipment: string (household item atau "none"),
    parentInstruction: string,
    childInstruction: string,
    motorGoal: balance | locomotor | coordination | object_control,
    safetyNote: string,
    illustration: string (emoji),
    weekIntroduced: 1-8
  }
```

### Perubahan pada UserData

```text
Tambahan field:
  currentWeek: number (1-8)
  currentLevel: number
  researchMode: boolean
```

### Perubahan pada Session Flow

```text
Sebelum:
  Pilih kategori -> Jalankan semua latihan di kategori
  (bisa 5-7 latihan, durasi tak terbatas)

Sesudah:
  Sistem memilih 4 latihan dari kurikulum minggu ini ->
  Exercise 1 (5-15 detik) -> Complete ->
  Exercise 2 (5-15 detik) -> Complete ->
  Exercise 3 (5-15 detik) -> Complete ->
  Exercise 4 (5-15 detik) -> Complete ->
  Session Complete (total maks 3 menit)
```

### Skema Penilaian TGMD-3

```text
Per skill:
  0 = Belum bisa (not able)
  1 = Mulai muncul (emerging)
  2 = Berkembang (developing)
  3 = Kompeten (competent)

Domain yang dinilai:
  - Locomotor skills
  - Ball skills (Object Control)
```

### Developmental Safety Constraints

Semua latihan dijamin:
- Developmentally appropriate untuk usia 4-7
- Sederhana dan bisa dipahami langsung
- Durasi pendek (5-15 detik per latihan)
- Instruksi playful
- Aman di dalam rumah
- Ruang maksimal 2 meter
- Equipment: bola lembut, kaos kaki gulung, bantal, boneka, selotip lantai

TIDAK termasuk: strength training, endurance, fitness drill, muscle training, athletic conditioning.

### Research Data Export

Tabel `user_progress` dan `skill_assessments` mendukung ekspor CSV/Excel langsung dari Lovable Cloud untuk analisis longitudinal. Setiap record berisi konteks lengkap (user_id, username, date, domain, exercise, score/rating).

---

## Urutan Implementasi

Karena skala perubahan sangat besar, implementasi dilakukan dalam urutan:

1. **Database migration** - tabel baru + kolom baru
2. **Exercise library** - workoutData.ts dengan 34 latihan TGMD-3
3. **Curriculum system** - curriculumData.ts
4. **Session runner** - flow sesi 4 latihan
5. **Dashboard update** - domain baru, level, curriculum progress
6. **Assessment module** - penilaian TGMD-3
7. **Parent coaching** - konten ditingkatkan
8. **Research dashboard** - mode riset
9. **Progress charts update** - 5 domain baru
10. **Badge system update** - exercise ID baru
11. **UI polish** - tampilan digital therapeutic

Setiap langkah menghasilkan sistem yang fungsional sehingga bisa diuji bertahap.
