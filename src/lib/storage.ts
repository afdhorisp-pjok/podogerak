import { UserData, WorkoutSession } from './workoutData';

const STORAGE_KEY = 'podogerak_user';

export const getUser = (): UserData | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as UserData;
  } catch {
    return null;
  }
};

export const saveUser = (user: UserData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const createUser = (username: string, avatar: string, age: number): UserData => {
  const user: UserData = {
    username,
    avatar,
    age,
    totalSessions: 0,
    streakDays: 0,
    lastActiveDate: '',
    workoutHistory: [],
    weeklySchedule: [1, 3, 5], // Default: Senin, Rabu, Jumat
  };
  saveUser(user);
  return user;
};

export const updateStreak = (user: UserData): UserData => {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.lastActiveDate;

  if (lastActive === today) {
    // Already active today, no change
    return user;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = user.streakDays;
  
  if (lastActive === yesterdayStr) {
    // Consecutive day, increase streak
    newStreak += 1;
  } else if (lastActive !== today) {
    // Streak broken, reset to 1
    newStreak = 1;
  }

  const updatedUser = {
    ...user,
    streakDays: newStreak,
    lastActiveDate: today,
  };
  saveUser(updatedUser);
  return updatedUser;
};

export const addWorkoutSession = (user: UserData, session: WorkoutSession): UserData => {
  const updatedUser = {
    ...user,
    totalSessions: user.totalSessions + 1,
    workoutHistory: [...user.workoutHistory, session],
  };
  saveUser(updatedUser);
  return updateStreak(updatedUser);
};

export const updateWeeklySchedule = (user: UserData, schedule: number[]): UserData => {
  const updatedUser = {
    ...user,
    weeklySchedule: schedule,
  };
  saveUser(updatedUser);
  return updatedUser;
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getTodayWorkout = (user: UserData): WorkoutSession | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return user.workoutHistory.find(s => s.date === today);
};

export const getRecentWorkouts = (user: UserData, count: number = 7): WorkoutSession[] => {
  return user.workoutHistory.slice(-count).reverse();
};
