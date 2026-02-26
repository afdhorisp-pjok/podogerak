import { supabase } from '@/integrations/supabase/client';

export type SessionState = 'idle' | 'active' | 'completed' | 'blocked';

let activeSessionId: string | null = null;

/**
 * Check how many sessions remain this week (server-validated).
 */
export const getWeeklySessionsRemaining = async (userId: string): Promise<number> => {
  const { data, error } = await supabase.rpc('get_weekly_sessions_remaining', {
    user_id_input: userId,
  } as any);

  if (error) {
    console.error('Error checking weekly sessions:', error);
    return 0;
  }

  return (data as number) ?? 0;
};

/**
 * Check if user can start a session.
 */
export const checkEligibility = async (userId: string): Promise<boolean> => {
  const remaining = await getWeeklySessionsRemaining(userId);
  return remaining > 0;
};

/**
 * Start a training session (server-validated).
 * Returns session ID or throws.
 */
export const startSession = async (userId: string): Promise<string> => {
  if (activeSessionId) {
    throw new Error('Active session already exists');
  }

  const { data, error } = await supabase.rpc('start_training_session', {
    user_id_input: userId,
  } as any);

  if (error) {
    if (error.message.includes('Weekly session limit reached')) {
      throw new Error('WEEKLY_LIMIT');
    }
    if (error.message.includes('Active session already exists')) {
      throw new Error('ACTIVE_EXISTS');
    }
    throw new Error(error.message);
  }

  activeSessionId = data as string;
  return activeSessionId;
};

/**
 * Complete the current training session.
 */
export const completeSession = async (): Promise<void> => {
  if (!activeSessionId) return;

  const { error } = await supabase.rpc('complete_training_session', {
    session_id_input: activeSessionId,
  } as any);

  if (error) {
    console.error('Error completing session:', error);
  }

  activeSessionId = null;
};

/**
 * Cancel active session (cleanup incomplete sessions).
 */
export const cancelSession = async (): Promise<void> => {
  if (!activeSessionId) return;

  // Delete the incomplete session
  await supabase
    .from('training_sessions')
    .delete()
    .eq('id', activeSessionId);

  activeSessionId = null;
};

export const getActiveSessionId = (): string | null => activeSessionId;
