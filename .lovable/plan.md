

# Migrasi PodoGerak ke Supabase: Auth + Database

## Ringkasan

Migrasi sistem autentikasi dan penyimpanan data dari localStorage ke Supabase, tanpa mengubah UI, styling, atau layout yang sudah ada. Pengguna akan bisa login dari perangkat manapun dan data progress tetap tersinkronisasi.

## Langkah-langkah Implementasi

### 1. Setup Koneksi Supabase

Aktifkan Supabase Cloud dan buat file `src/integrations/supabase/client.ts` untuk koneksi Supabase menggunakan environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

### 2. Buat Tabel Database (Migrasi SQL)

**Tabel `users_profile`:**
- `id` (uuid, primary key, referensi ke `auth.users.id`)
- `username` (text, UNIQUE, NOT NULL)
- `email` (text)
- `avatar` (text)
- `age` (integer)
- `weekly_schedule` (integer array, default `{1,3,5}`)
- `created_at` (timestamptz)

**Tabel `workout_sessions`:**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key ke `users_profile.id`)
- `date` (date)
- `exercises` (text array)
- `duration` (integer, menit)
- `completed` (boolean)
- `created_at` (timestamptz)

**Tabel `user_progress`** (untuk ekspor riset):
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `username` (text)
- `date` (date)
- `category` (text)
- `activity_name` (text)
- `score` (numeric)
- `notes` (text)
- `created_at` (timestamptz)

**Trigger auto-create profile** saat user sign up + **RLS policies** agar user hanya bisa akses data mereka sendiri.

### 3. Buat Service Files Baru

**`src/lib/supabaseClient.ts`** - Koneksi Supabase client (jika belum ada dari Cloud setup).

**`src/lib/authService.ts`** - Fungsi-fungsi:
- `signUp(email, password, username, avatar, age)` - Registrasi dengan pengecekan username unik
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getSession()` - Ambil sesi aktif
- `getUserProfile(userId)` - Ambil profil dari Supabase
- `onAuthStateChange(callback)` - Listener perubahan sesi

**`src/lib/progressService.ts`** - Fungsi-fungsi:
- `saveWorkoutSession(userId, session)` - Simpan sesi latihan
- `getWorkoutHistory(userId)` - Ambil riwayat latihan
- `getUserStats(userId)` - Hitung total sesi, streak, dll dari database
- `updateWeeklySchedule(userId, schedule)` - Update jadwal
- `saveProgressEntry(entry)` - Simpan data progress untuk riset
- `getProgressEntries(userId)` - Ambil semua data progress

### 4. Modifikasi File yang Ada

**`src/components/LoginForm.tsx`** - Ubah form:
- Tambah field email dan password
- Tambah mode "Daftar" dan "Masuk" (toggle)
- Validasi username unik via Supabase query sebelum registrasi
- Tampilkan error "Username sudah digunakan" jika duplikat
- Panggil `authService.signUp()` atau `authService.signIn()`
- Tetap gunakan AvatarSelector dan UI yang sama

**`src/pages/Index.tsx`** - Ubah logika:
- Ganti `getUser()` localStorage dengan `supabase.auth.getSession()` dan `onAuthStateChange`
- Load `UserData` dari Supabase (profil + workout history) setelah auth berhasil
- Hapus dependensi ke `getUser`/`saveUser` dari localStorage

**`src/components/Dashboard.tsx`** - Ubah:
- `handleLogout` panggil `authService.signOut()` bukan `logoutUser()`
- `handleWorkoutComplete` simpan ke Supabase via `progressService`

**`src/components/WorkoutTimer.tsx`** - Ubah:
- `handleComplete` simpan sesi ke Supabase bukan localStorage
- Juga simpan ke tabel `user_progress` untuk riset

**`src/components/ScheduleSection.tsx`** - Ubah:
- `saveSchedule` update ke Supabase bukan localStorage

**`src/components/HistorySection.tsx`** - Ubah:
- Data riwayat berasal dari UserData yang sudah di-load dari Supabase

**`src/lib/storage.ts`** - Refaktor:
- Pertahankan fungsi utilitas yang dibutuhkan (kalkulasi streak, dll)
- Hapus fungsi localStorage yang sudah digantikan Supabase
- Fungsi `updateStreak` diadaptasi untuk bekerja dengan data dari Supabase

### 5. Kalkulasi Data yang Tetap di Client

Beberapa data dihitung dari `workout_sessions` yang di-fetch dari Supabase:
- `totalSessions` = jumlah baris di `workout_sessions`
- `streakDays` = dihitung dari tanggal-tanggal berturut-turut
- `workoutHistory` = array dari `workout_sessions`
- Badge, progress chart, dan statistik tetap dihitung di client dari data yang sama

Ini berarti interface `UserData` tetap sama, hanya sumber datanya yang berubah dari localStorage ke Supabase.

### 6. Ekspor Data untuk Riset

Tabel `user_progress` dirancang agar bisa langsung di-ekspor dari Supabase Dashboard:
- Buka Supabase Dashboard > Table Editor > user_progress
- Klik "Export to CSV"
- Buka CSV di Excel

Setiap record berisi `user_id`, `username`, `date`, `category`, `activity_name`, `score`, `notes` - siap untuk analisis longitudinal.

## Detail Teknis

### Perubahan pada `UserData` Interface

Interface `UserData` tidak berubah strukturnya. Field tambahan `id` (uuid) dan `email` ditambahkan untuk kebutuhan Supabase, tapi semua komponen tetap menerima data yang sama.

### RLS (Row Level Security)

Semua tabel akan menggunakan RLS:
- Users hanya bisa membaca dan menulis data mereka sendiri
- Kebijakan berdasarkan `auth.uid() = user_id`

### Pengecekan Username Unik

1. **Database level**: Constraint `UNIQUE` pada kolom `username`
2. **Frontend level**: Query ke `users_profile` sebelum registrasi untuk memberikan feedback instan

### Session Persistence

Supabase Auth secara default menyimpan token di localStorage browser dan otomatis me-refresh token. Ini memberikan "remember login" tanpa konfigurasi tambahan. Data progress selalu di-load dari server, jadi bisa diakses dari perangkat manapun.

## File yang Akan Dibuat

| File | Deskripsi |
|------|-----------|
| `src/lib/authService.ts` | Fungsi auth (signup, signin, signout, session) |
| `src/lib/progressService.ts` | Fungsi CRUD workout & progress ke Supabase |
| Migrasi SQL (3 tabel + trigger + RLS) | Schema database |

## File yang Akan Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/components/LoginForm.tsx` | Tambah email/password, mode daftar/masuk, validasi username |
| `src/pages/Index.tsx` | Ganti localStorage auth dengan Supabase session |
| `src/components/Dashboard.tsx` | Logout via Supabase, save data via progressService |
| `src/components/WorkoutTimer.tsx` | Simpan sesi ke Supabase |
| `src/components/ScheduleSection.tsx` | Update jadwal ke Supabase |
| `src/lib/storage.ts` | Refaktor - hapus fungsi localStorage, pertahankan utilitas |
| `src/lib/workoutData.ts` | Tambah field `id` dan `email` ke interface UserData |

## Prasyarat

Sebelum implementasi, perlu mengaktifkan Supabase Cloud agar tabel dan auth bisa dibuat.

