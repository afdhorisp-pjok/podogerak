

# Sistem Laporan Sesi Otomatis (Session Report System)

## Ringkasan

Menambahkan sistem laporan otomatis yang dihasilkan setiap kali sesi latihan selesai dan terverifikasi. Laporan dikirim sebagai notifikasi dalam aplikasi dan disimpan di database untuk pengelolaan. Semua perubahan dilakukan sebagai modul terpisah tanpa mengubah sistem yang sudah ada.

---

## Perubahan Database

### Tabel Baru: `session_reports`

Menyimpan laporan sesi yang sudah terverifikasi.

```text
session_reports
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- session_id (uuid, FK -> training_sessions.id)
- child_name (text)
- session_date (timestamptz)
- started_at (timestamptz)
- completed_at (timestamptz)
- duration_minutes (integer)
- exercises_summary (jsonb) -- array of exercise names/domains
- activity_score (integer)
- verified (boolean, default true)
- created_at (timestamptz, default now())
```

RLS: Users can read their own reports. Insert via SECURITY DEFINER function only.

### Tabel Baru: `report_notifications`

Notifikasi in-app untuk orang tua.

```text
report_notifications
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- report_id (uuid, FK -> session_reports.id)
- message (text)
- read (boolean, default false)
- created_at (timestamptz, default now())
```

RLS: Users can read/update their own notifications.

### Tabel Baru: `report_audit_log`

Mencatat setiap akses laporan.

```text
report_audit_log
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- action (text) -- 'view', 'export', etc.
- report_id (uuid)
- created_at (timestamptz, default now())
```

RLS: Insert only for authenticated users. Select restricted to developer role (via `user_roles` table and `has_role` function).

### Tabel Baru: `user_roles`

Mengikuti best practice keamanan -- role disimpan di tabel terpisah.

```text
user_roles
- id (uuid, PK)
- user_id (uuid, FK -> auth.users, ON DELETE CASCADE)
- role (app_role enum: 'admin', 'moderator', 'user', 'developer')
- UNIQUE (user_id, role)
```

Fungsi `has_role(user_id, role)` sebagai SECURITY DEFINER untuk cek role tanpa rekursi RLS.

### RPC Function: `generate_session_report`

Fungsi SECURITY DEFINER yang dipanggil setelah sesi selesai:
- Memvalidasi bahwa sesi benar-benar completed (completed_at IS NOT NULL)
- Memvalidasi durasi minimal (>= 1 menit)
- Membuat record di `session_reports`
- Membuat notifikasi di `report_notifications`
- Mengembalikan report ID

---

## Perubahan Frontend

### File Baru: `src/lib/ReportService.ts`

Modul terpisah untuk semua logika laporan:
- `generateReport(sessionId, userId, exerciseIds, duration, domain)` -- memanggil RPC
- `getNotifications(userId)` -- fetch notifikasi belum dibaca
- `markNotificationRead(notificationId)` -- tandai sudah dibaca
- `getReportHistory(userId)` -- ambil semua laporan user
- `logReportAccess(userId, reportId, action)` -- catat audit

### File Baru: `src/components/NotificationBell.tsx`

Komponen notifikasi di header Dashboard:
- Icon lonceng dengan badge jumlah notifikasi belum dibaca
- Dropdown/popover menampilkan daftar notifikasi
- Klik notifikasi membuka detail laporan
- Tandai sebagai dibaca saat diklik

### File Baru: `src/components/SessionReportCard.tsx`

Kartu laporan sesi yang menampilkan:
- Nama anak, tanggal, durasi
- Daftar gerakan yang diselesaikan
- Skor aktivitas
- Status verifikasi (badge hijau)
- Timestamp pembuatan

### File Baru: `src/components/ReportHistory.tsx`

Halaman daftar semua laporan sesi (diakses dari Dashboard):
- List laporan dengan filter tanggal
- Klik untuk lihat detail

### Modifikasi: `src/components/Dashboard.tsx`

Perubahan minimal:
- Tambahkan `<NotificationBell />` di header
- Tambahkan tombol "Riwayat Laporan" di quick actions
- Di `handleWorkoutComplete`: panggil `ReportService.generateReport()` setelah `completeSession()` berhasil, dengan retry mechanism (max 3 attempts)

### Modifikasi: `src/components/SessionRunner.tsx`

Tidak ada perubahan -- laporan dihasilkan di Dashboard setelah callback `onComplete`.

---

## Alur Kerja (Flow)

```text
Sesi selesai (semua gerakan) 
  -> User klik "Simpan" 
  -> Dashboard.handleWorkoutComplete() 
  -> completeSession() [backend marks completed_at] 
  -> ReportService.generateReport() [RPC validates & creates report + notification]
  -> Retry up to 3x if RPC fails
  -> NotificationBell updates count
  -> User sees notification with report summary
```

---

## Keamanan

- Laporan hanya dibuat melalui SECURITY DEFINER function yang memvalidasi sesi benar-benar selesai
- User hanya bisa melihat laporan dan notifikasi milik sendiri (RLS)
- Audit log mencatat setiap akses laporan
- Role developer menggunakan tabel `user_roles` terpisah dan fungsi `has_role()`
- Audit log SELECT hanya untuk role developer

---

## File yang Dibuat/Dimodifikasi

| File | Perubahan |
|------|-----------|
| Migration SQL | 4 tabel baru + enum + RPC function + RLS policies |
| `src/lib/ReportService.ts` | Baru: modul laporan |
| `src/components/NotificationBell.tsx` | Baru: komponen notifikasi |
| `src/components/SessionReportCard.tsx` | Baru: kartu detail laporan |
| `src/components/ReportHistory.tsx` | Baru: halaman riwayat laporan |
| `src/components/Dashboard.tsx` | Tambah NotificationBell + tombol laporan + panggil generateReport |

