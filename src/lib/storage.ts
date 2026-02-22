import { WorkoutSession } from './workoutData';

// Utility functions - localStorage dependencies removed, kept for backwards compatibility
// All data is now persisted via Supabase through authService and progressService

export const getRecentWorkouts = (workoutHistory: WorkoutSession[], count: number = 7): WorkoutSession[] => {
  return workoutHistory.slice(0, count);
};
