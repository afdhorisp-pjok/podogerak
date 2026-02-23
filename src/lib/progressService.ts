import { supabase } from '@/integrations/supabase/client';
import { WorkoutSession } from './workoutData';

export const saveWorkoutSession = async (
  userId: string,
  session: { date: string; exercises: string[]; duration: number; completed: boolean }
): Promise<void> => {
  await supabase.from('workout_sessions').insert({
    user_id: userId,
    date: session.date,
    exercises: session.exercises,
    duration: session.duration,
    completed: session.completed,
  });
};

export const getWorkoutHistory = async (userId: string): Promise<WorkoutSession[]> => {
  const { data } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    date: row.date,
    exercises: row.exercises || [],
    duration: row.duration || 0,
    completed: row.completed ?? true,
  }));
};

export const calculateStreak = (sessions: WorkoutSession[]): number => {
  if (sessions.length === 0) return 0;

  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i - 1]);
    const prev = new Date(uniqueDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export const updateWeeklySchedule = async (
  userId: string,
  schedule: number[]
): Promise<void> => {
  await supabase
    .from('users_profile')
    .update({ weekly_schedule: schedule })
    .eq('id', userId);
};

export const saveProgressEntry = async (entry: {
  user_id: string;
  username: string;
  date: string;
  category: string;
  activity_name: string;
  score: number;
  notes?: string;
}): Promise<void> => {
  await supabase.from('user_progress').insert(entry);
};

export const getProgressEntries = async (userId: string) => {
  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
};

// Skill Assessment functions
export const saveSkillAssessment = async (entry: {
  user_id: string;
  skill_id: string;
  domain: string;
  rating: number;
  notes?: string;
}): Promise<void> => {
  await supabase.from('skill_assessments' as any).insert(entry);
};

export const getSkillAssessments = async (userId: string) => {
  const { data } = await supabase
    .from('skill_assessments' as any)
    .select('*')
    .eq('user_id', userId)
    .order('assessed_at', { ascending: false });
  return (data as any[]) || [];
};

export const updateCurriculumProgress = async (
  userId: string,
  currentWeek: number,
  currentLevel: number
): Promise<void> => {
  await supabase
    .from('users_profile')
    .update({ current_week: currentWeek, current_level: currentLevel } as any)
    .eq('id', userId);
};

export const toggleResearchMode = async (
  userId: string,
  enabled: boolean
): Promise<void> => {
  await supabase
    .from('users_profile')
    .update({ research_mode: enabled } as any)
    .eq('id', userId);
};

// Calculate adherence: sessions per week vs recommended 3-4
export const calculateAdherence = (sessions: WorkoutSession[], weeks: number = 4): { rate: number; sessionsPerWeek: number } => {
  if (weeks === 0) return { rate: 0, sessionsPerWeek: 0 };
  const totalSessions = sessions.length;
  const sessionsPerWeek = totalSessions / weeks;
  const targetPerWeek = 3.5;
  const rate = Math.min((sessionsPerWeek / targetPerWeek) * 100, 100);
  return { rate, sessionsPerWeek: Math.round(sessionsPerWeek * 10) / 10 };
};
