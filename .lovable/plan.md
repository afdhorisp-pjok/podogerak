

# Perbaiki Verifikasi Pembuatan Akun

## Masalah

Ada dua masalah utama yang menyebabkan pembuatan akun tidak berjalan dengan benar:

1. **Trigger `handle_new_user` tidak terpasang** - Fungsi `handle_new_user()` sudah ada di database, tapi tidak ada trigger yang menghubungkannya ke tabel `auth.users`. Akibatnya, saat user mendaftar, profil tidak otomatis dibuat di tabel `users_profile`. Ini juga menyebabkan `check_username_available` selalu mengembalikan `true` karena tabel `users_profile` kosong.

2. **Fungsi `handle_new_user` tidak menyimpan avatar dan age** - Fungsi hanya menyimpan `id`, `email`, dan `username`, padahal saat signup juga dikirimkan data `avatar` dan `age` di metadata.

## Solusi

### 1. Buat Migration: Pasang Trigger + Update Fungsi

Satu migration SQL yang akan:
- Update fungsi `handle_new_user()` agar juga menyimpan `avatar` dan `age` dari `raw_user_meta_data`
- Buat trigger `on_auth_user_created` pada tabel `auth.users` yang memanggil fungsi ini setiap ada user baru

### Detail Teknis

**Migration SQL:**

```sql
-- Update function to include avatar and age
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, username, avatar, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'astronaut'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 6)
  );
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### File yang Dimodifikasi

Tidak ada perubahan kode frontend -- hanya migration database.

| Perubahan | Deskripsi |
|-----------|-----------|
| Migration SQL | Update fungsi + pasang trigger pada `auth.users` |

