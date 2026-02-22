export type ExerciseCategory = 'locomotor' | 'non-locomotor' | 'manipulative';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  repetitions: number;
  sets: number;
  durationPerRep: number; // in seconds
  restTime: number; // in seconds
  illustration: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: string[];
  duration: number; // in minutes
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
  weeklySchedule: number[]; // days of week (0-6, Sunday-Saturday)
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
  // Locomotor exercises
  {
    id: 'lari-kecil',
    name: 'Lari Kecil di Tempat',
    description: 'Lari pelan-pelan di tempat seperti kelinci yang senang! Angkat kakimu tinggi-tinggi ya! 🐰',
    category: 'locomotor',
    repetitions: 20,
    sets: 2,
    durationPerRep: 1,
    restTime: 15,
    illustration: '🏃',
  },
  {
    id: 'lompat-katak',
    name: 'Lompat Katak',
    description: 'Jongkok seperti katak, lalu lompat ke depan! Kwek kwek! 🐸',
    category: 'locomotor',
    repetitions: 8,
    sets: 2,
    durationPerRep: 3,
    restTime: 20,
    illustration: '🐸',
  },
  {
    id: 'lompat-satu-kaki',
    name: 'Lompat Satu Kaki',
    description: 'Angkat satu kaki dan lompat-lompat seperti flamingo! 🦩',
    category: 'locomotor',
    repetitions: 10,
    sets: 2,
    durationPerRep: 2,
    restTime: 15,
    illustration: '🦩',
  },
  {
    id: 'skipping',
    name: 'Skipping Imajiner',
    description: 'Berjalan sambil mengangkat lutut tinggi-tinggi secara bergantian! Seperti tentara yang gagah! 💪',
    category: 'locomotor',
    repetitions: 16,
    sets: 2,
    durationPerRep: 2,
    restTime: 15,
    illustration: '🎖️',
  },
  {
    id: 'jalan-zigzag',
    name: 'Jalan Zig-Zag',
    description: 'Berjalan berkelok-kelok seperti ular yang menari! 🐍',
    category: 'locomotor',
    repetitions: 10,
    sets: 2,
    durationPerRep: 3,
    restTime: 15,
    illustration: '🐍',
  },
  {
    id: 'galloping',
    name: 'Berlari Kuda',
    description: 'Berlari seperti kuda dengan satu kaki memimpin! Igogo! 🐴',
    category: 'locomotor',
    repetitions: 12,
    sets: 2,
    durationPerRep: 2,
    restTime: 15,
    illustration: '🐴',
  },
  {
    id: 'side-step',
    name: 'Langkah Kepiting',
    description: 'Berjalan ke samping seperti kepiting yang lucu! 🦀',
    category: 'locomotor',
    repetitions: 10,
    sets: 2,
    durationPerRep: 2,
    restTime: 15,
    illustration: '🦀',
  },

  // Non-locomotor exercises
  {
    id: 'membungkuk',
    name: 'Membungkuk Menyentuh Jari Kaki',
    description: 'Berdiri tegak, lalu bungkukkan badan dan coba sentuh jari kakimu! 🙆',
    category: 'non-locomotor',
    repetitions: 8,
    sets: 2,
    durationPerRep: 4,
    restTime: 15,
    illustration: '🙆',
  },
  {
    id: 'memutar-badan',
    name: 'Memutar Badan',
    description: 'Letakkan tangan di pinggang, putar badanmu ke kiri dan kanan! Seperti mesin cuci! 🌀',
    category: 'non-locomotor',
    repetitions: 10,
    sets: 2,
    durationPerRep: 3,
    restTime: 15,
    illustration: '🌀',
  },
  {
    id: 'keseimbangan-satu-kaki',
    name: 'Berdiri Satu Kaki',
    description: 'Angkat satu kaki dan tahan! Kamu bisa seperti burung bangau! 🦢',
    category: 'non-locomotor',
    repetitions: 4,
    sets: 2,
    durationPerRep: 10,
    restTime: 15,
    illustration: '🦢',
  },
  {
    id: 'stretching-kupu',
    name: 'Peregangan Kupu-Kupu',
    description: 'Duduk dengan telapak kaki menempel, gerakkan lutut seperti sayap kupu-kupu! 🦋',
    category: 'non-locomotor',
    repetitions: 12,
    sets: 2,
    durationPerRep: 3,
    restTime: 15,
    illustration: '🦋',
  },
  {
    id: 'twist',
    name: 'Twist Pinggang',
    description: 'Berdiri dengan kaki terbuka, putar pinggangmu ke kiri dan kanan! 💫',
    category: 'non-locomotor',
    repetitions: 12,
    sets: 2,
    durationPerRep: 2,
    restTime: 15,
    illustration: '💫',
  },
  {
    id: 'reach-up',
    name: 'Tangan ke Langit',
    description: 'Angkat kedua tangan tinggi-tinggi ke atas! Coba raih bintang! ⭐',
    category: 'non-locomotor',
    repetitions: 10,
    sets: 2,
    durationPerRep: 3,
    restTime: 15,
    illustration: '⭐',
  },

  // Manipulative exercises
  {
    id: 'lempar-tangkap',
    name: 'Lempar Tangkap Bola Imajiner',
    description: 'Bayangkan kamu punya bola, lempar ke atas dan tangkap! 🎾',
    category: 'manipulative',
    repetitions: 10,
    sets: 2,
    durationPerRep: 3,
    restTime: 15,
    illustration: '🎾',
  },
  {
    id: 'dorong-bola',
    name: 'Dorong Bola',
    description: 'Dorong bola imajiner dengan kedua tangan ke depan! Seperti mendorong mobil! 🚗',
    category: 'manipulative',
    repetitions: 8,
    sets: 2,
    durationPerRep: 3,
    restTime: 15,
    illustration: '🚗',
  },
  {
    id: 'gulir-bola',
    name: 'Gulir Bola',
    description: 'Duduk dan gulirkan bola imajiner ke depan dengan tanganmu! 🎱',
    category: 'manipulative',
    repetitions: 8,
    sets: 2,
    durationPerRep: 4,
    restTime: 15,
    illustration: '🎱',
  },
  {
    id: 'pukul-balon',
    name: 'Pukul Balon',
    description: 'Bayangkan ada balon di depanmu, pukul ke atas agar tidak jatuh! 🎈',
    category: 'manipulative',
    repetitions: 15,
    sets: 2,
    durationPerRep: 2,
    restTime: 15,
    illustration: '🎈',
  },
  {
    id: 'lempar-sasaran',
    name: 'Lempar ke Sasaran',
    description: 'Lempar bola imajiner ke sasaran di depanmu! Kamu pasti bisa mengenai sasaran! 🎯',
    category: 'manipulative',
    repetitions: 8,
    sets: 2,
    durationPerRep: 4,
    restTime: 15,
    illustration: '🎯',
  },
];

export const getCategoryLabel = (category: ExerciseCategory): string => {
  const labels: Record<ExerciseCategory, string> = {
    'locomotor': 'Lokomotor',
    'non-locomotor': 'Non-Lokomotor',
    'manipulative': 'Manipulatif',
  };
  return labels[category];
};

export const getCategoryDescription = (category: ExerciseCategory): string => {
  const descriptions: Record<ExerciseCategory, string> = {
    'locomotor': 'Gerakan berpindah tempat seperti lari, lompat, dan jalan',
    'non-locomotor': 'Gerakan di tempat seperti memutar, membungkuk, dan menyeimbangkan',
    'manipulative': 'Gerakan dengan objek seperti melempar, menangkap, dan mendorong',
  };
  return descriptions[category];
};

export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return EXERCISES.filter(e => e.category === category);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return EXERCISES.find(e => e.id === id);
};

export const WEEKLY_PROGRAMS = [
  {
    id: 'beginner-3',
    name: 'Program Pemula (3 hari)',
    days: [1, 3, 5],
    exercisesPerDay: 4,
    description: 'Cocok untuk anak yang baru mulai berolahraga',
  },
  {
    id: 'active-4',
    name: 'Program Aktif (4 hari)',
    days: [1, 2, 4, 5],
    exercisesPerDay: 5,
    description: 'Untuk anak yang sudah aktif bergerak',
  },
  {
    id: 'champion-5',
    name: 'Program Juara (5 hari)',
    days: [1, 2, 3, 4, 5],
    exercisesPerDay: 6,
    description: 'Tantangan untuk anak yang sangat aktif!',
  },
];

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
