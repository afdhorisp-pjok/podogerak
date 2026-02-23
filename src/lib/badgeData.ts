import { UserData, ExerciseDomain, getExerciseById } from './workoutData';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'session' | 'streak' | 'domain' | 'special';
  requirement: (user: UserData) => boolean;
  progress: (user: UserData) => { current: number; target: number };
}

function hasTriedDomain(user: UserData, domain: ExerciseDomain): boolean {
  return user.workoutHistory.some(session =>
    session.exercises.some(exerciseId => {
      const ex = getExerciseById(exerciseId);
      return ex?.domain === domain;
    })
  );
}

function hasEarlyMorningWorkout(user: UserData): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toISOString().split('T')[0];
  const hasTodayWorkout = user.workoutHistory.some(s => s.date === today);
  return hasTodayWorkout && currentHour < 9;
}

export const BADGES: Badge[] = [
  // Session badges
  {
    id: 'first-step',
    name: 'Langkah Pertama',
    description: 'Menyelesaikan sesi pertama!',
    emoji: '🌟',
    category: 'session',
    requirement: (user) => user.totalSessions >= 1,
    progress: (user) => ({ current: Math.min(user.totalSessions, 1), target: 1 }),
  },
  {
    id: 'active-kid',
    name: 'Anak Aktif',
    description: 'Menyelesaikan 5 sesi',
    emoji: '🏃',
    category: 'session',
    requirement: (user) => user.totalSessions >= 5,
    progress: (user) => ({ current: Math.min(user.totalSessions, 5), target: 5 }),
  },
  {
    id: 'super-athlete',
    name: 'Jagoan Motorik',
    description: 'Menyelesaikan 10 sesi',
    emoji: '🦸',
    category: 'session',
    requirement: (user) => user.totalSessions >= 10,
    progress: (user) => ({ current: Math.min(user.totalSessions, 10), target: 10 }),
  },
  {
    id: 'workout-master',
    name: 'Master Latihan',
    description: 'Menyelesaikan 25 sesi',
    emoji: '👑',
    category: 'session',
    requirement: (user) => user.totalSessions >= 25,
    progress: (user) => ({ current: Math.min(user.totalSessions, 25), target: 25 }),
  },

  // Streak badges
  {
    id: 'consistent-3',
    name: 'Konsisten',
    description: '3 hari berturut-turut',
    emoji: '🔥',
    category: 'streak',
    requirement: (user) => user.streakDays >= 3,
    progress: (user) => ({ current: Math.min(user.streakDays, 3), target: 3 }),
  },
  {
    id: 'week-warrior',
    name: 'Pejuang Mingguan',
    description: '7 hari berturut-turut',
    emoji: '⚡',
    category: 'streak',
    requirement: (user) => user.streakDays >= 7,
    progress: (user) => ({ current: Math.min(user.streakDays, 7), target: 7 }),
  },
  {
    id: 'streak-champion',
    name: 'Juara Streak',
    description: '14 hari berturut-turut',
    emoji: '💎',
    category: 'streak',
    requirement: (user) => user.streakDays >= 14,
    progress: (user) => ({ current: Math.min(user.streakDays, 14), target: 14 }),
  },

  // Domain badges
  {
    id: 'locomotor-explorer',
    name: 'Penjelajah Lokomotor',
    description: 'Mencoba latihan Lokomotor',
    emoji: '🏃',
    category: 'domain',
    requirement: (user) => hasTriedDomain(user, 'locomotor'),
    progress: (user) => ({ current: hasTriedDomain(user, 'locomotor') ? 1 : 0, target: 1 }),
  },
  {
    id: 'jumper',
    name: 'Si Pelompat',
    description: 'Mencoba latihan Lompat & Hop',
    emoji: '🐸',
    category: 'domain',
    requirement: (user) => hasTriedDomain(user, 'jumping'),
    progress: (user) => ({ current: hasTriedDomain(user, 'jumping') ? 1 : 0, target: 1 }),
  },
  {
    id: 'balance-master',
    name: 'Master Keseimbangan',
    description: 'Mencoba latihan Keseimbangan',
    emoji: '🧘',
    category: 'domain',
    requirement: (user) => hasTriedDomain(user, 'balance'),
    progress: (user) => ({ current: hasTriedDomain(user, 'balance') ? 1 : 0, target: 1 }),
  },
  {
    id: 'ball-handler',
    name: 'Jagoan Bola',
    description: 'Mencoba latihan Keterampilan Bola',
    emoji: '⚽',
    category: 'domain',
    requirement: (user) => hasTriedDomain(user, 'ball_skills'),
    progress: (user) => ({ current: hasTriedDomain(user, 'ball_skills') ? 1 : 0, target: 1 }),
  },
  {
    id: 'all-rounder',
    name: 'Serba Bisa',
    description: 'Mencoba semua domain latihan',
    emoji: '🌈',
    category: 'domain',
    requirement: (user) =>
      hasTriedDomain(user, 'locomotor') &&
      hasTriedDomain(user, 'jumping') &&
      hasTriedDomain(user, 'balance') &&
      hasTriedDomain(user, 'ball_skills'),
    progress: (user) => ({
      current: [
        hasTriedDomain(user, 'locomotor'),
        hasTriedDomain(user, 'jumping'),
        hasTriedDomain(user, 'balance'),
        hasTriedDomain(user, 'ball_skills'),
      ].filter(Boolean).length,
      target: 4,
    }),
  },

  // Special badges
  {
    id: 'early-bird',
    name: 'Rajin Pagi',
    description: 'Latihan sebelum jam 9 pagi',
    emoji: '🌅',
    category: 'special',
    requirement: (user) => hasEarlyMorningWorkout(user),
    progress: (user) => ({ current: hasEarlyMorningWorkout(user) ? 1 : 0, target: 1 }),
  },
  {
    id: 'curriculum-complete',
    name: 'Lulus Kurikulum',
    description: 'Menyelesaikan minggu ke-8',
    emoji: '🎓',
    category: 'special',
    requirement: (user) => user.currentWeek > 8 || (user.currentWeek === 8 && user.totalSessions >= 24),
    progress: (user) => ({ current: Math.min(user.currentWeek, 8), target: 8 }),
  },
];

export const getEarnedBadges = (user: UserData): Badge[] => {
  return BADGES.filter(badge => badge.requirement(user));
};

export const getNewlyEarnedBadges = (
  previousBadges: string[],
  user: UserData
): Badge[] => {
  const currentBadges = getEarnedBadges(user);
  return currentBadges.filter(badge => !previousBadges.includes(badge.id));
};

export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return BADGES.filter(badge => badge.category === category);
};

export const getCategoryLabel = (category: Badge['category']): string => {
  const labels: Record<Badge['category'], string> = {
    session: 'Sesi Latihan',
    streak: 'Streak Harian',
    domain: 'Domain Motorik',
    special: 'Spesial',
  };
  return labels[category];
};
