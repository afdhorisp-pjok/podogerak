

# Perbaiki Error Signup "Database error saving new user"

## Masalah

Saat mendaftar dengan username yang sudah ada, fungsi `checkUsernameAvailable` gagal mendeteksi duplikat karena tabel `users_profile` dilindungi RLS -- pengguna yang belum login tidak bisa membaca data dari tabel tersebut. Akibatnya, pengecekan selalu menganggap username tersedia, lalu trigger `handle_new_user` gagal karena constraint UNIQUE pada kolom username, menghasilkan error teknis "Database error saving new user".

## Solusi

### 1. Buat Database Function `check_username_available`

Buat fungsi database dengan `SECURITY DEFINER` yang bisa mengecek ketersediaan username tanpa terkena batasan RLS. Fungsi ini menerima parameter username dan mengembalikan boolean.

### 2. Update `src/lib/authService.ts`

- Ganti `checkUsernameAvailable` agar memanggil `supabase.rpc('check_username_available', { username_input })` 
- Tambahkan penanganan error yang lebih baik di fungsi `signUp`: jika error message mengandung "already registered" atau "duplicate", tampilkan pesan bahasa Indonesia yang ramah

### 3. Update `src/components/LoginForm.tsx`

- Tambahkan pengecekan username di step 1 sebelum lanjut ke step 2, sehingga error terdeteksi lebih awal
- Jika username sudah dipakai, tampilkan pesan error langsung di step 1

## Detail Teknis

### Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.check_username_available(username_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.users_profile WHERE username = username_input
  );
END;
$$;
```

### File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/lib/authService.ts` | Ganti `checkUsernameAvailable` ke `supabase.rpc()`, tambah error mapping di `signUp` |
| `src/components/LoginForm.tsx` | Cek username availability saat klik "Lanjut Pilih Avatar" |

