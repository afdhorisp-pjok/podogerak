export type ExerciseDomain = 'locomotor' | 'jumping' | 'balance' | 'ball_skills' | 'combined';
export type MotorGoal = 'balance' | 'locomotor' | 'coordination' | 'object_control';

export interface Exercise {
  id: string;
  name: string;
  domain: ExerciseDomain;
  duration: number; // 5-15 seconds
  equipment: string;
  parentInstruction: string;
  childInstruction: string;
  motorGoal: MotorGoal;
  safetyNote: string;
  illustration: string;
  weekIntroduced: number; // 1-8
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: string[];
  duration: number;
  completed: boolean;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  avatar: string;
  age: number;
  totalSessions: number;
  streakDays: number;
  lastActiveDate: string;
  workoutHistory: WorkoutSession[];
  weeklySchedule: number[];
  currentWeek: number;
  currentLevel: number;
  researchMode: boolean;
}

export const AVATARS = [
  { id: 'astronaut', emoji: '👨‍🚀', name: 'Astronot' },
  { id: 'superhero', emoji: '🦸', name: 'Superhero' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja' },
  { id: 'athlete', emoji: '🏃', name: 'Atlet' },
  { id: 'dancer', emoji: '💃', name: 'Penari' },
  { id: 'star', emoji: '⭐', name: 'Bintang' },
];

export const EXERCISES: Exercise[] = [
  // === LOCOMOTOR ===
  {
    id: 'animal-walk-forward',
    name: 'Animal Walk Forward',
    domain: 'locomotor',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Minta anak berjalan meniru gerakan binatang (beruang, kepiting) ke depan sejauh 2 meter.',
    childInstruction: 'Jalan seperti binatang ke depan! 🐻',
    motorGoal: 'locomotor',
    safetyNote: 'Pastikan lantai tidak licin dan area bebas hambatan.',
    illustration: '🐻',
    weekIntroduced: 1,
  },
  {
    id: 'line-walk',
    name: 'Line Walk',
    domain: 'locomotor',
    duration: 10,
    equipment: 'Selotip lantai',
    parentInstruction: 'Tempelkan selotip di lantai sepanjang 1-2 meter. Minta anak berjalan di atas garis.',
    childInstruction: 'Jalan di atas garis, jangan sampai keluar! 🎯',
    motorGoal: 'balance',
    safetyNote: 'Gunakan selotip yang tidak meninggalkan bekas di lantai.',
    illustration: '🎯',
    weekIntroduced: 1,
  },
  {
    id: 'run-in-place',
    name: 'Run in Place',
    domain: 'locomotor',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Minta anak berlari di tempat. Angkat lutut setinggi mungkin secara bergantian.',
    childInstruction: 'Lari di tempat, angkat kakimu tinggi-tinggi! 🏃',
    motorGoal: 'locomotor',
    safetyNote: 'Pastikan anak memakai alas kaki atau lantai empuk.',
    illustration: '🏃',
    weekIntroduced: 1,
  },
  {
    id: 'side-step',
    name: 'Side Step',
    domain: 'locomotor',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Minta anak melangkah ke samping kiri dan kanan secara bergantian, seperti kepiting.',
    childInstruction: 'Langkah ke samping seperti kepiting! 🦀',
    motorGoal: 'locomotor',
    safetyNote: 'Pastikan tidak ada benda di sekitar yang bisa tersenggol.',
    illustration: '🦀',
    weekIntroduced: 1,
  },
  {
    id: 'run-and-stop',
    name: 'Run and Stop',
    domain: 'locomotor',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Minta anak berlari pelan lalu berhenti saat orang tua bilang "STOP".',
    childInstruction: 'Lari pelan, berhenti kalau dengar STOP! 🛑',
    motorGoal: 'coordination',
    safetyNote: 'Area minimal 2 meter, bebas hambatan.',
    illustration: '🛑',
    weekIntroduced: 2,
  },
  {
    id: 'free-run-and-stop',
    name: 'Free Run and Stop',
    domain: 'locomotor',
    duration: 12,
    equipment: 'none',
    parentInstruction: 'Anak berlari bebas dalam area kecil, berhenti saat ada aba-aba. Variasikan aba-aba.',
    childInstruction: 'Lari bebas, freeze kalau ada aba-aba! ❄️',
    motorGoal: 'coordination',
    safetyNote: 'Batas area jelas agar anak tidak berlari terlalu jauh.',
    illustration: '❄️',
    weekIntroduced: 3,
  },
  {
    id: 'run-around-object',
    name: 'Run Around Object',
    domain: 'locomotor',
    duration: 10,
    equipment: 'Bantal atau boneka',
    parentInstruction: 'Letakkan bantal di lantai. Minta anak berlari mengelilingi bantal dalam lingkaran kecil.',
    childInstruction: 'Lari kelilingi bantal, jangan sentuh! 🔄',
    motorGoal: 'coordination',
    safetyNote: 'Gunakan objek lunak agar aman jika terinjak.',
    illustration: '🔄',
    weekIntroduced: 4,
  },
  {
    id: 'walk-and-stop-signal',
    name: 'Walk and Stop Signal',
    domain: 'locomotor',
    duration: 12,
    equipment: 'none',
    parentInstruction: 'Anak berjalan dan berhenti mengikuti sinyal verbal (jalan/stop). Latih kontrol gerakan.',
    childInstruction: 'Jalan pelan, dengarkan aba-aba mama/papa! 👂',
    motorGoal: 'coordination',
    safetyNote: 'Gunakan suara yang jelas dan konsisten.',
    illustration: '👂',
    weekIntroduced: 2,
  },

  // === JUMPING AND HOPPING ===
  {
    id: 'two-foot-small-jump',
    name: 'Two-Foot Small Jump',
    domain: 'jumping',
    duration: 8,
    equipment: 'none',
    parentInstruction: 'Minta anak melompat kecil dengan kedua kaki bersamaan. Mendarat dengan lutut sedikit ditekuk.',
    childInstruction: 'Lompat kecil pakai dua kaki! 🐰',
    motorGoal: 'locomotor',
    safetyNote: 'Lantai tidak licin, alas empuk lebih baik.',
    illustration: '🐰',
    weekIntroduced: 1,
  },
  {
    id: 'frog-jump',
    name: 'Frog Jump',
    domain: 'jumping',
    duration: 8,
    equipment: 'none',
    parentInstruction: 'Anak jongkok, lalu lompat ke depan pendek seperti katak. Jarak maksimal 50cm per lompatan.',
    childInstruction: 'Lompat seperti katak! Kwek kwek! 🐸',
    motorGoal: 'locomotor',
    safetyNote: 'Jarak lompatan pendek, pastikan mendarat stabil.',
    illustration: '🐸',
    weekIntroduced: 2,
  },
  {
    id: 'jump-forward-and-stop',
    name: 'Jump Forward and Stop',
    domain: 'jumping',
    duration: 8,
    equipment: 'none',
    parentInstruction: 'Anak melompat ke depan satu kali lalu berhenti dan berdiri tegak. Latih kontrol mendarat.',
    childInstruction: 'Lompat ke depan, lalu freeze! 🧊',
    motorGoal: 'coordination',
    safetyNote: 'Pastikan ruang mendarat aman dan stabil.',
    illustration: '🧊',
    weekIntroduced: 3,
  },
  {
    id: 'jump-over-line',
    name: 'Jump Over Line',
    domain: 'jumping',
    duration: 8,
    equipment: 'Selotip lantai',
    parentInstruction: 'Tempelkan selotip di lantai. Minta anak melompati garis dengan kedua kaki.',
    childInstruction: 'Lompati garisnya! Jangan injak! ⚡',
    motorGoal: 'locomotor',
    safetyNote: 'Garis di permukaan datar, tidak di dekat furniture.',
    illustration: '⚡',
    weekIntroduced: 3,
  },
  {
    id: 'forward-hop',
    name: 'Forward Hop',
    domain: 'jumping',
    duration: 8,
    equipment: 'none',
    parentInstruction: 'Minta anak melompat-lompat ke depan dengan satu kaki. Bergantian kaki kiri dan kanan.',
    childInstruction: 'Lompat-lompat satu kaki ke depan! 🦩',
    motorGoal: 'balance',
    safetyNote: 'Jarak pendek, pastikan keseimbangan terjaga.',
    illustration: '🦩',
    weekIntroduced: 4,
  },
  {
    id: 'hop-and-balance',
    name: 'Hop and Balance',
    domain: 'jumping',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Anak melompat satu kaki lalu berhenti dan bertahan selama 3 detik di satu kaki.',
    childInstruction: 'Lompat satu kaki, lalu tahan! Jangan goyang! 🌟',
    motorGoal: 'balance',
    safetyNote: 'Orang tua siap menopang jika anak kehilangan keseimbangan.',
    illustration: '🌟',
    weekIntroduced: 5,
  },

  // === BALANCE ===
  {
    id: 'one-foot-stand',
    name: 'One-Foot Stand',
    domain: 'balance',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Minta anak berdiri satu kaki selama 5-10 detik. Bantu anak fokus pada satu titik di depan.',
    childInstruction: 'Berdiri satu kaki seperti flamingo! 🦩',
    motorGoal: 'balance',
    safetyNote: 'Orang tua berada di dekat anak untuk menopang jika perlu.',
    illustration: '🦩',
    weekIntroduced: 1,
  },
  {
    id: 'one-foot-balance',
    name: 'One-Foot Balance',
    domain: 'balance',
    duration: 12,
    equipment: 'none',
    parentInstruction: 'Anak berdiri satu kaki dengan tangan direntangkan. Tahan lebih lama dari sebelumnya.',
    childInstruction: 'Rentangkan tangan, berdiri satu kaki! Tahan ya! 🦅',
    motorGoal: 'balance',
    safetyNote: 'Area sekitar harus bebas dari benda tajam.',
    illustration: '🦅',
    weekIntroduced: 3,
  },
  {
    id: 'balance-freeze',
    name: 'Balance Freeze',
    domain: 'balance',
    duration: 10,
    equipment: 'none',
    parentInstruction: 'Anak bergerak bebas, saat aba-aba "freeze" anak harus diam dalam posisi apapun dan tahan.',
    childInstruction: 'Bergerak bebas, freeze kalau aba-aba! Tahan posisimu! 🗽',
    motorGoal: 'balance',
    safetyNote: 'Pastikan area bergerak aman dan luas.',
    illustration: '🗽',
    weekIntroduced: 4,
  },
  {
    id: 'balance-challenge',
    name: 'Balance Challenge',
    domain: 'balance',
    duration: 15,
    equipment: 'Bantal',
    parentInstruction: 'Anak berdiri satu kaki di atas bantal selama yang bisa. Latih keseimbangan dinamis.',
    childInstruction: 'Berdiri satu kaki di atas bantal! Siapa yang paling lama? 🏔️',
    motorGoal: 'balance',
    safetyNote: 'Gunakan bantal yang stabil, orang tua siap menopang.',
    illustration: '🏔️',
    weekIntroduced: 6,
  },

  // === BALL SKILLS ===
  {
    id: 'ball-roll-forward',
    name: 'Ball Roll Forward',
    domain: 'ball_skills',
    duration: 8,
    equipment: 'Bola lembut atau kaos kaki gulung',
    parentInstruction: 'Anak duduk di lantai dan menggulingkan bola ke depan dengan kedua tangan.',
    childInstruction: 'Gulingkan bola ke depan! 🎱',
    motorGoal: 'object_control',
    safetyNote: 'Gunakan bola lembut yang aman.',
    illustration: '🎱',
    weekIntroduced: 1,
  },
  {
    id: 'ball-roll-and-chase',
    name: 'Ball Roll and Chase',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Bola lembut',
    parentInstruction: 'Anak menggulingkan bola lalu berlari mengejarnya. Latih koordinasi mata-tangan-kaki.',
    childInstruction: 'Gulingkan bola lalu kejar! 🏎️',
    motorGoal: 'coordination',
    safetyNote: 'Pastikan area bebas hambatan untuk berlari.',
    illustration: '🏎️',
    weekIntroduced: 2,
  },
  {
    id: 'ball-catch-short',
    name: 'Ball Catch Short Distance',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Bola lembut',
    parentInstruction: 'Lempar bola pelan dari jarak 1 meter ke anak. Minta anak menangkap dengan dua tangan.',
    childInstruction: 'Tangkap bolanya! Pakai dua tangan! 🤲',
    motorGoal: 'object_control',
    safetyNote: 'Lempar pelan dan rendah, gunakan bola lembut.',
    illustration: '🤲',
    weekIntroduced: 2,
  },
  {
    id: 'ball-catch-medium',
    name: 'Ball Catch Medium Distance',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Bola lembut',
    parentInstruction: 'Lempar bola dari jarak 1.5-2 meter. Anak menangkap dengan dua tangan.',
    childInstruction: 'Tangkap bola dari jauh! Kamu pasti bisa! 🌟',
    motorGoal: 'object_control',
    safetyNote: 'Tingkatkan jarak bertahap sesuai kemampuan anak.',
    illustration: '🌟',
    weekIntroduced: 4,
  },
  {
    id: 'gentle-overhand-throw',
    name: 'Gentle Overhand Throw',
    domain: 'ball_skills',
    duration: 8,
    equipment: 'Kaos kaki gulung',
    parentInstruction: 'Minta anak melempar kaos kaki gulung ke depan dengan satu tangan dari atas kepala.',
    childInstruction: 'Lempar dari atas kepala ke depan! 🎯',
    motorGoal: 'object_control',
    safetyNote: 'Gunakan kaos kaki gulung agar tidak merusak apapun.',
    illustration: '🎯',
    weekIntroduced: 2,
  },
  {
    id: 'ball-throw-downward',
    name: 'Ball Throw Downward',
    domain: 'ball_skills',
    duration: 8,
    equipment: 'Bola lembut',
    parentInstruction: 'Anak berdiri dan melempar bola ke lantai di depannya. Bola akan memantul.',
    childInstruction: 'Lempar bola ke lantai! Lihat dia memantul! 🏀',
    motorGoal: 'object_control',
    safetyNote: 'Gunakan bola yang bisa memantul tapi lembut.',
    illustration: '🏀',
    weekIntroduced: 3,
  },
  {
    id: 'throw-to-target',
    name: 'Throw to Target',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Kaos kaki gulung, bantal sebagai target',
    parentInstruction: 'Letakkan bantal 1-2 meter di depan anak. Minta anak melempar kaos kaki ke arah bantal.',
    childInstruction: 'Lempar ke bantal! Tepat sasaran! 🎯',
    motorGoal: 'object_control',
    safetyNote: 'Target menggunakan benda lunak.',
    illustration: '🎯',
    weekIntroduced: 4,
  },
  {
    id: 'throw-and-catch-self',
    name: 'Throw and Catch Self',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Kaos kaki gulung',
    parentInstruction: 'Anak melempar kaos kaki ke atas lalu menangkapnya sendiri.',
    childInstruction: 'Lempar ke atas, tangkap sendiri! 🤹',
    motorGoal: 'coordination',
    safetyNote: 'Lempar tidak terlalu tinggi, gunakan benda lunak.',
    illustration: '🤹',
    weekIntroduced: 5,
  },
  {
    id: 'ball-transfer',
    name: 'Ball Transfer Hand-to-Hand',
    domain: 'ball_skills',
    duration: 8,
    equipment: 'Bola lembut kecil',
    parentInstruction: 'Anak memindahkan bola dari tangan kiri ke tangan kanan bolak-balik.',
    childInstruction: 'Pindahkan bola dari kiri ke kanan! Cepat-cepat! 🔄',
    motorGoal: 'coordination',
    safetyNote: 'Gunakan bola kecil yang nyaman digenggam anak.',
    illustration: '🔄',
    weekIntroduced: 3,
  },
  {
    id: 'ball-kick-forward',
    name: 'Ball Kick Forward',
    domain: 'ball_skills',
    duration: 8,
    equipment: 'Bola lembut',
    parentInstruction: 'Letakkan bola di depan anak. Minta anak menendang pelan ke depan.',
    childInstruction: 'Tendang bola ke depan! Gol! ⚽',
    motorGoal: 'object_control',
    safetyNote: 'Gunakan bola lembut, pastikan tidak ada benda pecah belah di depan.',
    illustration: '⚽',
    weekIntroduced: 3,
  },
  {
    id: 'kick-and-stop-ball',
    name: 'Kick and Stop Ball',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Bola lembut',
    parentInstruction: 'Gulingkan bola ke arah anak, minta anak menghentikannya dengan kaki.',
    childInstruction: 'Hentikan bola pakai kaki! 🦶',
    motorGoal: 'object_control',
    safetyNote: 'Gulingkan pelan, bola lembut.',
    illustration: '🦶',
    weekIntroduced: 4,
  },
  {
    id: 'walk-and-carry-ball',
    name: 'Walk and Carry Ball',
    domain: 'ball_skills',
    duration: 10,
    equipment: 'Bola lembut',
    parentInstruction: 'Anak berjalan sambil membawa bola di tangan tanpa menjatuhkannya.',
    childInstruction: 'Jalan bawa bola, jangan sampai jatuh! 🚶',
    motorGoal: 'coordination',
    safetyNote: 'Jalan pelan, tidak perlu terburu-buru.',
    illustration: '🚶',
    weekIntroduced: 2,
  },
  {
    id: 'side-step-and-throw',
    name: 'Side Step and Throw',
    domain: 'ball_skills',
    duration: 12,
    equipment: 'Kaos kaki gulung',
    parentInstruction: 'Anak melangkah ke samping lalu melempar kaos kaki ke target. Kombinasi gerak dan lempar.',
    childInstruction: 'Langkah ke samping, lalu lempar! 🎪',
    motorGoal: 'coordination',
    safetyNote: 'Pastikan area samping dan depan bebas hambatan.',
    illustration: '🎪',
    weekIntroduced: 6,
  },

  // === COMBINED ===
  {
    id: 'jump-and-catch',
    name: 'Jump and Catch',
    domain: 'combined',
    duration: 10,
    equipment: 'Kaos kaki gulung',
    parentInstruction: 'Lempar kaos kaki pelan ke atas, anak melompat dan menangkapnya di udara.',
    childInstruction: 'Lompat dan tangkap! Seperti superhero! 🦸',
    motorGoal: 'coordination',
    safetyNote: 'Lempar rendah, anak tidak perlu melompat tinggi.',
    illustration: '🦸',
    weekIntroduced: 7,
  },
];

export const getDomainLabel = (domain: ExerciseDomain): string => {
  const labels: Record<ExerciseDomain, string> = {
    locomotor: 'Lokomotor',
    jumping: 'Lompat & Hop',
    balance: 'Keseimbangan',
    ball_skills: 'Keterampilan Bola',
    combined: 'Gabungan',
  };
  return labels[domain];
};

export const getDomainDescription = (domain: ExerciseDomain): string => {
  const desc: Record<ExerciseDomain, string> = {
    locomotor: 'Gerakan berpindah tempat: berjalan, berlari, melangkah',
    jumping: 'Gerakan melompat dan hop dengan kontrol mendarat',
    balance: 'Gerakan keseimbangan statis dan dinamis',
    ball_skills: 'Keterampilan menangkap, melempar, menendang bola',
    combined: 'Kombinasi lokomotor dan keterampilan bola',
  };
  return desc[domain];
};

export const getDomainIcon = (domain: ExerciseDomain): string => {
  const icons: Record<ExerciseDomain, string> = {
    locomotor: '🏃',
    jumping: '🐸',
    balance: '🧘',
    ball_skills: '⚽',
    combined: '🌟',
  };
  return icons[domain];
};

export const getExercisesByDomain = (domain: ExerciseDomain): Exercise[] => {
  return EXERCISES.filter(e => e.domain === domain);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return EXERCISES.find(e => e.id === id);
};

export const getExercisesForWeek = (week: number): Exercise[] => {
  return EXERCISES.filter(e => e.weekIntroduced <= week);
};

export const WEEKLY_PROGRAMS = [
  {
    id: 'beginner-3',
    name: 'Program Pemula (3 hari)',
    days: [1, 3, 5],
    description: 'Cocok untuk anak yang baru mulai',
  },
  {
    id: 'active-4',
    name: 'Program Aktif (4 hari)',
    days: [1, 2, 4, 5],
    description: 'Untuk anak yang sudah aktif',
  },
];

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ALL_DOMAINS: ExerciseDomain[] = ['locomotor', 'jumping', 'balance', 'ball_skills', 'combined'];
