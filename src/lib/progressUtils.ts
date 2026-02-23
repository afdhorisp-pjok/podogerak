import { UserData, ExerciseDomain, EXERCISES, getExerciseById } from './workoutData';
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
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
  jumping: number;
  balance: number;
  ballSkills: number;
  combined: number;
}

export interface CategoryStats {
  name: string;
  value: number;
  fill: string;
}

const DOMAIN_COLORS: Record<ExerciseDomain, string> = {
  locomotor: 'hsl(var(--primary))',
  jumping: 'hsl(var(--jumping))',
  balance: 'hsl(var(--balance))',
  ball_skills: 'hsl(var(--ball-skills))',
  combined: 'hsl(var(--combined))',
};

function getExerciseDomain(exerciseId: string): ExerciseDomain | null {
  const ex = getExerciseById(exerciseId);
  return ex ? ex.domain : null;
}

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

    let locomotor = 0, jumping = 0, balance = 0, ballSkills = 0, combined = 0;

    weekSessions.forEach(session => {
      session.exercises.forEach(exerciseId => {
        const domain = getExerciseDomain(exerciseId);
        if (domain === 'locomotor') locomotor++;
        else if (domain === 'jumping') jumping++;
        else if (domain === 'balance') balance++;
        else if (domain === 'ball_skills') ballSkills++;
        else if (domain === 'combined') combined++;
      });
    });

    result.push({
      week: format(weekStart, 'yyyy-MM-dd'),
      label: weekLabel,
      sessions: weekSessions.length,
      duration: totalDuration,
      locomotor,
      jumping,
      balance,
      ballSkills,
      combined,
    });
  }

  return result;
};

export const getCategoryDistribution = (user: UserData): CategoryStats[] => {
  let locomotor = 0, jumping = 0, balance = 0, ballSkills = 0, combined = 0;

  user.workoutHistory.forEach(session => {
    session.exercises.forEach(exerciseId => {
      const domain = getExerciseDomain(exerciseId);
      if (domain === 'locomotor') locomotor++;
      else if (domain === 'jumping') jumping++;
      else if (domain === 'balance') balance++;
      else if (domain === 'ball_skills') ballSkills++;
      else if (domain === 'combined') combined++;
    });
  });

  return [
    { name: 'Lokomotor', value: locomotor, fill: DOMAIN_COLORS.locomotor },
    { name: 'Lompat & Hop', value: jumping, fill: DOMAIN_COLORS.jumping },
    { name: 'Keseimbangan', value: balance, fill: DOMAIN_COLORS.balance },
    { name: 'Bola', value: ballSkills, fill: DOMAIN_COLORS.ball_skills },
    { name: 'Gabungan', value: combined, fill: DOMAIN_COLORS.combined },
  ].filter(c => c.value > 0);
};

export const getStreakHistory = (user: UserData) => {
  const activeDays = new Set(user.workoutHistory.map(s => s.date)).size;
  return {
    maxStreak: Math.max(user.streakDays, activeDays > 0 ? 1 : 0),
    currentStreak: user.streakDays,
    activeDays,
  };
};

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

export const getDomainExposure = (user: UserData): Record<ExerciseDomain, number> => {
  const exposure: Record<ExerciseDomain, number> = {
    locomotor: 0,
    jumping: 0,
    balance: 0,
    ball_skills: 0,
    combined: 0,
  };

  user.workoutHistory.forEach(session => {
    session.exercises.forEach(exerciseId => {
      const domain = getExerciseDomain(exerciseId);
      if (domain) exposure[domain]++;
    });
  });

  return exposure;
};
