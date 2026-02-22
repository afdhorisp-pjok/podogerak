import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  age: number;
  weekly_schedule: number[];
}

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const { data } = await supabase
    .from('users_profile')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return !data;
};

export const signUp = async (
  email: string,
  password: string,
  username: string,
  avatar: string,
  age: number
): Promise<{ error: string | null }> => {
  // Check username uniqueness first
  const available = await checkUsernameAvailable(username);
  if (!available) {
    return { error: 'Username sudah digunakan. Silakan gunakan username lain.' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, avatar, age },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  return { error: null };
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    username: data.username,
    email: data.email || '',
    avatar: data.avatar || 'astronaut',
    age: data.age || 6,
    weekly_schedule: data.weekly_schedule || [1, 3, 5],
  };
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Pick<UserProfile, 'avatar' | 'age' | 'weekly_schedule'>>
): Promise<void> => {
  await supabase
    .from('users_profile')
    .update(updates)
    .eq('id', userId);
};
