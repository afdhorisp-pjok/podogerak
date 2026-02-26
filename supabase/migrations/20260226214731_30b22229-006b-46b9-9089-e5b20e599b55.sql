
-- =============================================
-- B. Movements table with seed data
-- =============================================
CREATE TABLE public.movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  animation_url text,
  illustration text DEFAULT '🏃',
  domain text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'easy',
  duration_seconds integer NOT NULL DEFAULT 10,
  equipment text DEFAULT 'none',
  parent_instruction text,
  child_instruction text,
  safety_note text,
  motor_goal text,
  week_introduced integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read movements" ON public.movements FOR SELECT USING (true);

-- Seed 32 movements from existing workoutData
INSERT INTO public.movements (name, description, illustration, domain, difficulty_level, duration_seconds, equipment, parent_instruction, child_instruction, safety_note, motor_goal, week_introduced) VALUES
('Animal Walk Forward', 'Berjalan meniru gerakan binatang ke depan', '🐻', 'locomotor', 'easy', 10, 'none', 'Minta anak berjalan meniru gerakan binatang (beruang, kepiting) ke depan sejauh 2 meter.', 'Jalan seperti binatang ke depan! 🐻', 'Pastikan lantai tidak licin dan area bebas hambatan.', 'locomotor', 1),
('Line Walk', 'Berjalan di atas garis selotip', '🎯', 'locomotor', 'easy', 10, 'Selotip lantai', 'Tempelkan selotip di lantai sepanjang 1-2 meter. Minta anak berjalan di atas garis.', 'Jalan di atas garis, jangan sampai keluar! 🎯', 'Gunakan selotip yang tidak meninggalkan bekas di lantai.', 'balance', 1),
('Run in Place', 'Berlari di tempat dengan lutut tinggi', '🏃', 'locomotor', 'easy', 10, 'none', 'Minta anak berlari di tempat. Angkat lutut setinggi mungkin secara bergantian.', 'Lari di tempat, angkat kakimu tinggi-tinggi! 🏃', 'Pastikan anak memakai alas kaki atau lantai empuk.', 'locomotor', 1),
('Side Step', 'Melangkah ke samping seperti kepiting', '🦀', 'locomotor', 'easy', 10, 'none', 'Minta anak melangkah ke samping kiri dan kanan secara bergantian, seperti kepiting.', 'Langkah ke samping seperti kepiting! 🦀', 'Pastikan tidak ada benda di sekitar yang bisa tersenggol.', 'locomotor', 1),
('Run and Stop', 'Berlari dan berhenti saat aba-aba', '🛑', 'locomotor', 'easy', 10, 'none', 'Minta anak berlari pelan lalu berhenti saat orang tua bilang "STOP".', 'Lari pelan, berhenti kalau dengar STOP! 🛑', 'Area minimal 2 meter, bebas hambatan.', 'coordination', 2),
('Free Run and Stop', 'Berlari bebas dengan freeze', '❄️', 'locomotor', 'medium', 12, 'none', 'Anak berlari bebas dalam area kecil, berhenti saat ada aba-aba. Variasikan aba-aba.', 'Lari bebas, freeze kalau ada aba-aba! ❄️', 'Batas area jelas agar anak tidak berlari terlalu jauh.', 'coordination', 3),
('Run Around Object', 'Berlari mengelilingi benda', '🔄', 'locomotor', 'medium', 10, 'Bantal atau boneka', 'Letakkan bantal di lantai. Minta anak berlari mengelilingi bantal dalam lingkaran kecil.', 'Lari kelilingi bantal, jangan sentuh! 🔄', 'Gunakan objek lunak agar aman jika terinjak.', 'coordination', 4),
('Walk and Stop Signal', 'Berjalan dan berhenti mengikuti sinyal', '👂', 'locomotor', 'easy', 12, 'none', 'Anak berjalan dan berhenti mengikuti sinyal verbal (jalan/stop). Latih kontrol gerakan.', 'Jalan pelan, dengarkan aba-aba mama/papa! 👂', 'Gunakan suara yang jelas dan konsisten.', 'coordination', 2),
('Two-Foot Small Jump', 'Melompat kecil dengan dua kaki', '🐰', 'jumping', 'easy', 8, 'none', 'Minta anak melompat kecil dengan kedua kaki bersamaan. Mendarat dengan lutut sedikit ditekuk.', 'Lompat kecil pakai dua kaki! 🐰', 'Lantai tidak licin, alas empuk lebih baik.', 'locomotor', 1),
('Frog Jump', 'Melompat seperti katak', '🐸', 'jumping', 'easy', 8, 'none', 'Anak jongkok, lalu lompat ke depan pendek seperti katak. Jarak maksimal 50cm per lompatan.', 'Lompat seperti katak! Kwek kwek! 🐸', 'Jarak lompatan pendek, pastikan mendarat stabil.', 'locomotor', 2),
('Jump Forward and Stop', 'Lompat ke depan lalu berhenti', '🧊', 'jumping', 'medium', 8, 'none', 'Anak melompat ke depan satu kali lalu berhenti dan berdiri tegak. Latih kontrol mendarat.', 'Lompat ke depan, lalu freeze! 🧊', 'Pastikan ruang mendarat aman dan stabil.', 'coordination', 3),
('Jump Over Line', 'Melompati garis selotip', '⚡', 'jumping', 'medium', 8, 'Selotip lantai', 'Tempelkan selotip di lantai. Minta anak melompati garis dengan kedua kaki.', 'Lompati garisnya! Jangan injak! ⚡', 'Garis di permukaan datar, tidak di dekat furniture.', 'locomotor', 3),
('Forward Hop', 'Melompat satu kaki ke depan', '🦩', 'jumping', 'medium', 8, 'none', 'Minta anak melompat-lompat ke depan dengan satu kaki. Bergantian kaki kiri dan kanan.', 'Lompat-lompat satu kaki ke depan! 🦩', 'Jarak pendek, pastikan keseimbangan terjaga.', 'balance', 4),
('Hop and Balance', 'Lompat satu kaki lalu tahan', '🌟', 'jumping', 'hard', 10, 'none', 'Anak melompat satu kaki lalu berhenti dan bertahan selama 3 detik di satu kaki.', 'Lompat satu kaki, lalu tahan! Jangan goyang! 🌟', 'Orang tua siap menopang jika anak kehilangan keseimbangan.', 'balance', 5),
('One-Foot Stand', 'Berdiri satu kaki seperti flamingo', '🦩', 'balance', 'easy', 10, 'none', 'Minta anak berdiri satu kaki selama 5-10 detik. Bantu anak fokus pada satu titik di depan.', 'Berdiri satu kaki seperti flamingo! 🦩', 'Orang tua berada di dekat anak untuk menopang jika perlu.', 'balance', 1),
('One-Foot Balance', 'Berdiri satu kaki tangan direntangkan', '🦅', 'balance', 'medium', 12, 'none', 'Anak berdiri satu kaki dengan tangan direntangkan. Tahan lebih lama dari sebelumnya.', 'Rentangkan tangan, berdiri satu kaki! Tahan ya! 🦅', 'Area sekitar harus bebas dari benda tajam.', 'balance', 3),
('Balance Freeze', 'Bergerak bebas lalu freeze', '🗽', 'balance', 'medium', 10, 'none', 'Anak bergerak bebas, saat aba-aba "freeze" anak harus diam dalam posisi apapun dan tahan.', 'Bergerak bebas, freeze kalau aba-aba! Tahan posisimu! 🗽', 'Pastikan area bergerak aman dan luas.', 'balance', 4),
('Balance Challenge', 'Berdiri satu kaki di atas bantal', '🏔️', 'balance', 'hard', 15, 'Bantal', 'Anak berdiri satu kaki di atas bantal selama yang bisa. Latih keseimbangan dinamis.', 'Berdiri satu kaki di atas bantal! Siapa yang paling lama? 🏔️', 'Gunakan bantal yang stabil, orang tua siap menopang.', 'balance', 6),
('Ball Roll Forward', 'Menggulingkan bola ke depan', '🎱', 'ball_skills', 'easy', 8, 'Bola lembut atau kaos kaki gulung', 'Anak duduk di lantai dan menggulingkan bola ke depan dengan kedua tangan.', 'Gulingkan bola ke depan! 🎱', 'Gunakan bola lembut yang aman.', 'object_control', 1),
('Ball Roll and Chase', 'Menggulingkan bola lalu mengejar', '🏎️', 'ball_skills', 'easy', 10, 'Bola lembut', 'Anak menggulingkan bola lalu berlari mengejarnya. Latih koordinasi mata-tangan-kaki.', 'Gulingkan bola lalu kejar! 🏎️', 'Pastikan area bebas hambatan untuk berlari.', 'coordination', 2),
('Ball Catch Short Distance', 'Menangkap bola jarak dekat', '🤲', 'ball_skills', 'easy', 10, 'Bola lembut', 'Lempar bola pelan dari jarak 1 meter ke anak. Minta anak menangkap dengan dua tangan.', 'Tangkap bolanya! Pakai dua tangan! 🤲', 'Lempar pelan dan rendah, gunakan bola lembut.', 'object_control', 2),
('Ball Catch Medium Distance', 'Menangkap bola jarak menengah', '🌟', 'ball_skills', 'medium', 10, 'Bola lembut', 'Lempar bola dari jarak 1.5-2 meter. Anak menangkap dengan dua tangan.', 'Tangkap bola dari jauh! Kamu pasti bisa! 🌟', 'Tingkatkan jarak bertahap sesuai kemampuan anak.', 'object_control', 4),
('Gentle Overhand Throw', 'Melempar dari atas kepala', '🎯', 'ball_skills', 'easy', 8, 'Kaos kaki gulung', 'Minta anak melempar kaos kaki gulung ke depan dengan satu tangan dari atas kepala.', 'Lempar dari atas kepala ke depan! 🎯', 'Gunakan kaos kaki gulung agar tidak merusak apapun.', 'object_control', 2),
('Ball Throw Downward', 'Melempar bola ke lantai', '🏀', 'ball_skills', 'easy', 8, 'Bola lembut', 'Anak berdiri dan melempar bola ke lantai di depannya. Bola akan memantul.', 'Lempar bola ke lantai! Lihat dia memantul! 🏀', 'Gunakan bola yang bisa memantul tapi lembut.', 'object_control', 3),
('Throw to Target', 'Melempar ke target', '🎯', 'ball_skills', 'medium', 10, 'Kaos kaki gulung, bantal sebagai target', 'Letakkan bantal 1-2 meter di depan anak. Minta anak melempar kaos kaki ke arah bantal.', 'Lempar ke bantal! Tepat sasaran! 🎯', 'Target menggunakan benda lunak.', 'object_control', 4),
('Throw and Catch Self', 'Lempar dan tangkap sendiri', '🤹', 'ball_skills', 'hard', 10, 'Kaos kaki gulung', 'Anak melempar kaos kaki ke atas lalu menangkapnya sendiri.', 'Lempar ke atas, tangkap sendiri! 🤹', 'Lempar tidak terlalu tinggi, gunakan benda lunak.', 'coordination', 5),
('Ball Transfer Hand-to-Hand', 'Pindahkan bola antar tangan', '🔄', 'ball_skills', 'easy', 8, 'Bola lembut kecil', 'Anak memindahkan bola dari tangan kiri ke tangan kanan bolak-balik.', 'Pindahkan bola dari kiri ke kanan! Cepat-cepat! 🔄', 'Gunakan bola kecil yang nyaman digenggam anak.', 'coordination', 3),
('Ball Kick Forward', 'Menendang bola ke depan', '⚽', 'ball_skills', 'easy', 8, 'Bola lembut', 'Letakkan bola di depan anak. Minta anak menendang pelan ke depan.', 'Tendang bola ke depan! Gol! ⚽', 'Gunakan bola lembut, pastikan tidak ada benda pecah belah di depan.', 'object_control', 3),
('Kick and Stop Ball', 'Menghentikan bola dengan kaki', '🦶', 'ball_skills', 'medium', 10, 'Bola lembut', 'Gulingkan bola ke arah anak, minta anak menghentikannya dengan kaki.', 'Hentikan bola pakai kaki! 🦶', 'Gulingkan pelan, bola lembut.', 'object_control', 4),
('Walk and Carry Ball', 'Berjalan sambil membawa bola', '🚶', 'ball_skills', 'easy', 10, 'Bola lembut', 'Anak berjalan sambil membawa bola di tangan tanpa menjatuhkannya.', 'Jalan bawa bola, jangan sampai jatuh! 🚶', 'Jalan pelan, tidak perlu terburu-buru.', 'coordination', 2),
('Side Step and Throw', 'Langkah samping dan lempar', '🎪', 'ball_skills', 'hard', 12, 'Kaos kaki gulung', 'Anak melangkah ke samping lalu melempar kaos kaki ke target. Kombinasi gerak dan lempar.', 'Langkah ke samping, lalu lempar! 🎪', 'Pastikan area samping dan depan bebas hambatan.', 'coordination', 6),
('Jump and Catch', 'Lompat dan tangkap', '🦸', 'combined', 'hard', 10, 'Kaos kaki gulung', 'Lempar kaos kaki pelan ke atas, anak melompat dan menangkapnya di udara.', 'Lompat dan tangkap! Seperti superhero! 🦸', 'Lempar rendah, anak tidak perlu melompat tinggi.', 'coordination', 7);

-- =============================================
-- D. Training sessions table + RPC functions
-- =============================================
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.training_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Check weekly session limit (server-side, uses server timestamp)
CREATE OR REPLACE FUNCTION public.check_weekly_session_limit(user_id_input uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  session_count integer;
  week_start timestamptz;
BEGIN
  week_start := date_trunc('week', now());
  SELECT count(*) INTO session_count
  FROM public.training_sessions
  WHERE user_id = user_id_input
    AND completed_at IS NOT NULL
    AND completed_at >= week_start;
  RETURN session_count < 3;
END;
$$;

-- Get remaining sessions this week
CREATE OR REPLACE FUNCTION public.get_weekly_sessions_remaining(user_id_input uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  session_count integer;
  week_start timestamptz;
BEGIN
  week_start := date_trunc('week', now());
  SELECT count(*) INTO session_count
  FROM public.training_sessions
  WHERE user_id = user_id_input
    AND completed_at IS NOT NULL
    AND completed_at >= week_start;
  RETURN GREATEST(3 - session_count, 0);
END;
$$;

-- Start a training session (validates limit + no active session)
CREATE OR REPLACE FUNCTION public.start_training_session(user_id_input uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  active_count integer;
  new_id uuid;
BEGIN
  IF NOT check_weekly_session_limit(user_id_input) THEN
    RAISE EXCEPTION 'Weekly session limit reached';
  END IF;
  SELECT count(*) INTO active_count
  FROM public.training_sessions
  WHERE user_id = user_id_input AND completed_at IS NULL;
  IF active_count > 0 THEN
    RAISE EXCEPTION 'Active session already exists';
  END IF;
  INSERT INTO public.training_sessions (user_id)
  VALUES (user_id_input)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Complete a training session
CREATE OR REPLACE FUNCTION public.complete_training_session(session_id_input uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.training_sessions
  SET completed_at = now()
  WHERE id = session_id_input AND completed_at IS NULL;
END;
$$;
