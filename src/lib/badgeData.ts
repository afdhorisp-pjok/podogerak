import { UserData } from './workoutData';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'session' | 'streak' | 'category' | 'special';
  requirement: (user: UserData) => boolean;
  progress: (user: UserData) => { current: number; target: number };
}

export const BADGES: Badge[] = [
  // Session badges
  {
    id: 'first-step',
    name: 'Langkah Pertama',
    description: 'Menyelesaikan latihan pertamamu!',
    emoji: '🌟',
    category: 'session',
    requirement: (user) => user.totalSessions >= 1,
    progress: (user) => ({ current: Math.min(user.totalSessions, 1), target: 1 }),
  },
  {
    id: 'active-kid',
    name: 'Anak Aktif',
    description: 'Menyelesaikan 5 sesi latihan',
    emoji: '🏃',
    category: 'session',
    requirement: (user) => user.totalSessions >= 5,
    progress: (user) => ({ current: Math.min(user.totalSessions, 5), target: 5 }),
  },
  {
    id: 'super-athlete',
    name: 'Atlet Super',
    description: 'Menyelesaikan 10 sesi latihan',
    emoji: '🦸',
    category: 'session',
    requirement: (user) => user.totalSessions >= 10,
    progress: (user) => ({ current: Math.min(user.totalSessions, 10), target: 10 }),
  },
  {
    id: 'workout-master',
    name: 'Master Latihan',
    description: 'Menyelesaikan 25 sesi latihan',
    emoji: '👑',
    category: 'session',
    requirement: (user) => user.totalSessions >= 25,
    progress: (user) => ({ current: Math.min(user.totalSessions, 25), target: 25 }),
  },
  {
    id: 'legend',
    name: 'Legenda PodoGerak',
    description: 'Menyelesaikan 50 sesi latihan',
    emoji: '🏆',
    category: 'session',
    requirement: (user) => user.totalSessions >= 50,
    progress: (user) => ({ current: Math.min(user.totalSessions, 50), target: 50 }),
  },

  // Streak badges
  {
    id: 'consistent-3',
    name: 'Konsisten',
    description: '3 hari berturut-turut berolahraga',
    emoji: '🔥',
    category: 'streak',
    requirement: (user) => user.streakDays >= 3,
    progress: (user) => ({ current: Math.min(user.streakDays, 3), target: 3 }),
  },
  {
    id: 'week-warrior',
    name: 'Pejuang Mingguan',
    description: '7 hari berturut-turut berolahraga',
    emoji: '⚡',
    category: 'streak',
    requirement: (user) => user.streakDays >= 7,
    progress: (user) => ({ current: Math.min(user.streakDays, 7), target: 7 }),
  },
  {
    id: 'streak-champion',
    name: 'Juara Streak',
    description: '14 hari berturut-turut berolahraga',
    emoji: '💎',
    category: 'streak',
    requirement: (user) => user.streakDays >= 14,
    progress: (user) => ({ current: Math.min(user.streakDays, 14), target: 14 }),
  },
  {
    id: 'unstoppable',
    name: 'Tak Terhentikan',
    description: '30 hari berturut-turut berolahraga',
    emoji: '🚀',
    category: 'streak',
    requirement: (user) => user.streakDays >= 30,
    progress: (user) => ({ current: Math.min(user.streakDays, 30), target: 30 }),
  },

  // Category badges
  {
    id: 'locomotor-explorer',
    name: 'Penjelajah Lokomotor',
    description: 'Mencoba latihan Lokomotor',
    emoji: '🐸',
    category: 'category',
    requirement: (user) => hasTriedCategory(user, 'locomotor'),
    progress: (user) => ({ current: hasTriedCategory(user, 'locomotor') ? 1 : 0, target: 1 }),
  },
  {
    id: 'balance-master',
    name: 'Master Keseimbangan',
    description: 'Mencoba latihan Non-Lokomotor',
    emoji: '🦢',
    category: 'category',
    requirement: (user) => hasTriedCategory(user, 'non-locomotor'),
    progress: (user) => ({ current: hasTriedCategory(user, 'non-locomotor') ? 1 : 0, target: 1 }),
  },
  {
    id: 'ball-handler',
    name: 'Jagoan Bola',
    description: 'Mencoba latihan Manipulatif',
    emoji: '🎾',
    category: 'category',
    requirement: (user) => hasTriedCategory(user, 'manipulative'),
    progress: (user) => ({ current: hasTriedCategory(user, 'manipulative') ? 1 : 0, target: 1 }),
  },
  {
    id: 'all-rounder',
    name: 'Serba Bisa',
    description: 'Mencoba semua kategori latihan',
    emoji: '🌈',
    category: 'category',
    requirement: (user) => 
      hasTriedCategory(user, 'locomotor') && 
      hasTriedCategory(user, 'non-locomotor') && 
      hasTriedCategory(user, 'manipulative'),
    progress: (user) => ({
      current: [
        hasTriedCategory(user, 'locomotor'),
        hasTriedCategory(user, 'non-locomotor'),
        hasTriedCategory(user, 'manipulative'),
      ].filter(Boolean).length,
      target: 3,
    }),
  },

  // Special badges
  {
    id: 'early-bird',
    name: 'Rajin Pagi',
    description: 'Latihan di pagi hari (sebelum jam 9)',
    emoji: '🌅',
    category: 'special',
    requirement: (user) => hasEarlyMorningWorkout(user),
    progress: (user) => ({ current: hasEarlyMorningWorkout(user) ? 1 : 0, target: 1 }),
  },
];

// Helper functions
function hasTriedCategory(user: UserData, category: string): boolean {
  return user.workoutHistory.some(session => 
    session.exercises.some(exerciseId => {
      // Check if exercise belongs to category based on naming convention
      if (category === 'locomotor') {
        return ['lari-kecil', 'lompat-katak', 'lompat-satu-kaki', 'skipping', 'jalan-zigzag', 'galloping', 'side-step'].includes(exerciseId);
      }
      if (category === 'non-locomotor') {
        return ['membungkuk', 'memutar-badan', 'keseimbangan-satu-kaki', 'stretching-kupu', 'twist', 'reach-up'].includes(exerciseId);
      }
      if (category === 'manipulative') {
        return ['lempar-tangkap', 'dorong-bola', 'gulir-bola', 'pukul-balon', 'lempar-sasaran'].includes(exerciseId);
      }
      return false;
    })
  );
}

function hasEarlyMorningWorkout(user: UserData): boolean {
  // Check if any workout was done before 9 AM
  // Since we only store date, we'll check based on current session time
  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toISOString().split('T')[0];
  
  // If user has a workout today and it's currently before 9 AM, they get the badge
  const hasTodayWorkout = user.workoutHistory.some(s => s.date === today);
  return hasTodayWorkout && currentHour < 9;
}

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
    category: 'Kategori',
    special: 'Spesial',
  };
  return labels[category];
};
