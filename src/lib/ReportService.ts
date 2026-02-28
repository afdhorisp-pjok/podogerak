import { supabase } from '@/integrations/supabase/client';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a verified session report via RPC with retry mechanism.
 */
export const generateReport = async (
  sessionId: string,
  userId: string,
  childName: string,
  exerciseIds: string[],
  duration: number,
  domain: string
): Promise<string | null> => {
  const exercisesSummary = exerciseIds.map(id => ({ id, domain }));
  const score = Math.min(100, exerciseIds.length * 25);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase.rpc('generate_session_report', {
        session_id_input: sessionId,
        user_id_input: userId,
        child_name_input: childName,
        exercises_input: exercisesSummary,
        duration_input: duration,
        score_input: score,
      } as any);

      if (error) throw error;
      return data as string;
    } catch (err) {
      console.error(`Report generation attempt ${attempt} failed:`, err);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY * attempt);
      }
    }
  }
  console.error('All report generation attempts failed');
  return null;
};

/**
 * Get unread notifications for a user.
 */
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('report_notifications')
    .select('*, session_reports(*)')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data ?? [];
};

/**
 * Mark a notification as read.
 */
export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('report_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) console.error('Error marking notification read:', error);
};

/**
 * Get all report history for a user.
 */
export const getReportHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('session_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching report history:', error);
    return [];
  }
  return data ?? [];
};

/**
 * Log report access in audit log.
 */
export const logReportAccess = async (userId: string, reportId: string, action: string) => {
  const { error } = await supabase
    .from('report_audit_log')
    .insert({ user_id: userId, report_id: reportId, action });

  if (error) console.error('Error logging report access:', error);
};
