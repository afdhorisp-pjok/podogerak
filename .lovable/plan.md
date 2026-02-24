

# Fitur Lupa Password

## Ringkasan

Menambahkan fitur "Lupa Password" yang memungkinkan pengguna mereset password melalui email. Terdiri dari 2 bagian: link di halaman login untuk mengirim email reset, dan halaman `/reset-password` untuk memasukkan password baru.

## Perubahan

### 1. Update `src/lib/authService.ts`
Tambah fungsi `resetPassword(email)` yang memanggil `supabase.auth.resetPasswordForEmail()` dengan redirect ke `/reset-password`.

### 2. Update `src/components/LoginForm.tsx`
- Tambah mode `'forgot'` pada state `mode`
- Tampilkan form input email + tombol "Kirim Link Reset" saat mode `'forgot'`
- Tambah link "Lupa password?" di bawah form login

### 3. Buat `src/pages/ResetPassword.tsx`
- Halaman baru di route `/reset-password`
- Deteksi `type=recovery` dari URL hash (otomatis dari link email)
- Form input password baru + konfirmasi password
- Panggil `supabase.auth.updateUser({ password })` untuk update password
- Setelah berhasil, redirect ke halaman utama

### 4. Update `src/App.tsx`
- Tambah route `/reset-password` yang mengarah ke komponen `ResetPassword`

## Detail Teknis

### Flow Reset Password
1. User klik "Lupa password?" di halaman login
2. User masukkan email, klik "Kirim Link Reset"
3. Email dikirim otomatis oleh sistem auth (email bawaan)
4. User klik link di email, diarahkan ke `/reset-password`
5. User masukkan password baru, klik "Simpan Password Baru"
6. Password di-update, user diarahkan ke halaman utama

### File yang Dibuat
| File | Deskripsi |
|------|-----------|
| `src/pages/ResetPassword.tsx` | Halaman reset password dengan form password baru |

### File yang Dimodifikasi
| File | Perubahan |
|------|-----------|
| `src/lib/authService.ts` | Tambah fungsi `resetPassword()` |
| `src/components/LoginForm.tsx` | Tambah mode forgot password + link "Lupa password?" |
| `src/App.tsx` | Tambah route `/reset-password` |

