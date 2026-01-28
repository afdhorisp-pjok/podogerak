import { UserData, WorkoutSession, getCategoryLabel } from './workoutData';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, startOfMonth, endOfMonth, eachWeekOfInterval, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

export interface DailyProgress {
  date: string;
  label: string;
  sessions: number;
  duration: number;
}

export interface WeeklyProgress {
  week: string;
  label: string;
  sessions: number;
  duration: number;
  locomotor: number;
  nonLocomotor: number;
  manipulative: number;
}

export interface CategoryStats {
  name: string;
  value: number;
  fill: string;
}

// Get daily progress for the last N days
export const getDailyProgress = (user: UserData, days: number = 7): DailyProgress[] => {
  const today = new Date();
  const result: DailyProgress[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'EEE', { locale: id });

    const daySessions = user.workoutHistory.filter(s => s.date === dateStr);
    const totalDuration = daySessions.reduce((sum, s) => sum + s.duration, 0);

    result.push({
      date: dateStr,
      label: dayLabel,
      sessions: daySessions.length,
      duration: totalDuration,
    });
  }

  return result;
};

// Get weekly progress for the last N weeks
export const getWeeklyProgress = (user: UserData, weeks: number = 4): WeeklyProgress[] => {
  const today = new Date();
  const result: WeeklyProgress[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekLabel = `${format(weekStart, 'd MMM', { locale: id })}`;

    const weekSessions = user.workoutHistory.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const totalDuration = weekSessions.reduce((sum, s) => sum + s.duration, 0);

    // Count exercises by category
    let locomotor = 0;
    let nonLocomotor = 0;
    let manipulative = 0;

    weekSessions.forEach(session => {
      session.exercises.forEach(exerciseId => {
        if (['lari-kecil', 'lompat-katak', 'lompat-satu-kaki', 'skipping', 'jalan-zigzag', 'galloping', 'side-step'].includes(exerciseId)) {
          locomotor++;
        } else if (['membungkuk', 'memutar-badan', 'keseimbangan-satu-kaki', 'stretching-kupu', 'twist', 'reach-up'].includes(exerciseId)) {
          nonLocomotor++;
        } else if (['lempar-tangkap', 'dorong-bola', 'gulir-bola', 'pukul-balon', 'lempar-sasaran'].includes(exerciseId)) {
          manipulative++;
        }
      });
    });

    result.push({
      week: format(weekStart, 'yyyy-MM-dd'),
      label: weekLabel,
      sessions: weekSessions.length,
      duration: totalDuration,
      locomotor,
      nonLocomotor,
      manipulative,
    });
  }

  return result;
};

// Get category distribution
export const getCategoryDistribution = (user: UserData): CategoryStats[] => {
  let locomotor = 0;
  let nonLocomotor = 0;
  let manipulative = 0;

  user.workoutHistory.forEach(session => {
    session.exercises.forEach(exerciseId => {
      if (['lari-kecil', 'lompat-katak', 'lompat-satu-kaki', 'skipping', 'jalan-zigzag', 'galloping', 'side-step'].includes(exerciseId)) {
        locomotor++;
      } else if (['membungkuk', 'memutar-badan', 'keseimbangan-satu-kaki', 'stretching-kupu', 'twist', 'reach-up'].includes(exerciseId)) {
        nonLocomotor++;
      } else if (['lempar-tangkap', 'dorong-bola', 'gulir-bola', 'pukul-balon', 'lempar-sasaran'].includes(exerciseId)) {
        manipulative++;
      }
    });
  });

  return [
    { name: 'Lokomotor', value: locomotor, fill: 'hsl(var(--primary))' },
    { name: 'Non-Lokomotor', value: nonLocomotor, fill: 'hsl(var(--secondary))' },
    { name: 'Manipulatif', value: manipulative, fill: 'hsl(var(--accent))' },
  ].filter(c => c.value > 0);
};

// Get streak history
export const getStreakHistory = (user: UserData): { maxStreak: number; currentStreak: number; activeDays: number } => {
  const activeDays = new Set(user.workoutHistory.map(s => s.date)).size;
  
  return {
    maxStreak: Math.max(user.streakDays, activeDays > 0 ? 1 : 0),
    currentStreak: user.streakDays,
    activeDays,
  };
};

// Get summary stats
export const getSummaryStats = (user: UserData) => {
  const totalDuration = user.workoutHistory.reduce((sum, s) => sum + s.duration, 0);
  const totalExercises = user.workoutHistory.reduce((sum, s) => sum + s.exercises.length, 0);
  const avgDuration = user.totalSessions > 0 ? Math.round(totalDuration / user.totalSessions) : 0;

  return {
    totalSessions: user.totalSessions,
    totalDuration,
    totalExercises,
    avgDuration,
    streakDays: user.streakDays,
  };
};
