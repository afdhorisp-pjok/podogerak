import { supabase } from '@/integrations/supabase/client';

export interface Experiment {
  id: string;
  researcher_id: string;
  name: string;
  description: string | null;
  arms: string[];
  strata: string[] | null;
  seed: number;
  status: string;
  created_at: string;
}

export interface ExperimentParticipant {
  id: string;
  experiment_id: string;
  participant_id: string;
  user_id: string | null;
  stratum: string | null;
  arm: string;
  allocation_code: string;
  created_at: string;
}

export interface ExperimentSessionLog {
  id: string;
  experiment_id: string;
  participant_id: string;
  session_id: string | null;
  arm: string;
  start_timestamp: string;
  end_timestamp: string | null;
  duration_seconds: number | null;
  teacher_rating: number | null;
  completion_flag: boolean;
  created_at: string;
}

export async function createExperiment(
  name: string,
  description: string,
  arms: string[],
  strata: string[] | null,
  seed: number
): Promise<Experiment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('experiments')
    .insert({
      researcher_id: user.id,
      name,
      description: description || null,
      arms: arms as any,
      strata: strata as any,
      seed,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating experiment:', error);
    return null;
  }
  return data as unknown as Experiment;
}

export async function getExperiments(): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching experiments:', error);
    return [];
  }
  return (data || []) as unknown as Experiment[];
}

export async function addParticipant(
  experimentId: string,
  userId: string | null,
  stratum: string | null
): Promise<any> {
  const { data, error } = await supabase.rpc('randomize_participant', {
    experiment_id_input: experimentId,
    user_id_input: userId,
    stratum_input: stratum,
  });

  if (error) {
    console.error('Error randomizing participant:', error);
    return null;
  }
  return data;
}

export async function getParticipants(experimentId: string): Promise<ExperimentParticipant[]> {
  const { data, error } = await supabase
    .from('experiment_participants')
    .select('*')
    .eq('experiment_id', experimentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
  return (data || []) as unknown as ExperimentParticipant[];
}

export async function logSession(log: {
  experiment_id: string;
  participant_id: string;
  arm: string;
  start_timestamp: string;
  end_timestamp?: string;
  duration_seconds?: number;
  teacher_rating?: number;
  completion_flag?: boolean;
  session_id?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('experiment_session_logs')
    .insert({
      experiment_id: log.experiment_id,
      participant_id: log.participant_id,
      arm: log.arm,
      start_timestamp: log.start_timestamp,
      end_timestamp: log.end_timestamp || null,
      duration_seconds: log.duration_seconds || null,
      teacher_rating: log.teacher_rating ?? null,
      completion_flag: log.completion_flag ?? false,
      session_id: log.session_id || null,
    });

  if (error) {
    console.error('Error logging session:', error);
    return false;
  }
  return true;
}

export async function getSessionLogs(experimentId: string): Promise<ExperimentSessionLog[]> {
  const { data, error } = await supabase
    .from('experiment_session_logs')
    .select('*')
    .eq('experiment_id', experimentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching session logs:', error);
    return [];
  }
  return (data || []) as unknown as ExperimentSessionLog[];
}

export function exportCSV(logs: ExperimentSessionLog[], participants: ExperimentParticipant[]) {
  const participantMap = new Map(participants.map(p => [p.id, p]));

  const headers = [
    'session_log_id', 'participant_id', 'allocation_code', 'stratum', 'arm',
    'start_timestamp', 'end_timestamp', 'duration_seconds',
    'teacher_rating', 'completion_flag'
  ];

  const rows = logs.map(log => {
    const p = participantMap.get(log.participant_id);
    return [
      log.id,
      p?.participant_id || '',
      p?.allocation_code || '',
      p?.stratum || '',
      log.arm,
      log.start_timestamp,
      log.end_timestamp || '',
      log.duration_seconds?.toString() || '',
      log.teacher_rating?.toString() || '',
      log.completion_flag ? '1' : '0',
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `experiment_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getConsentRecords(): Promise<any[]> {
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching consent records:', error);
    return [];
  }
  return data || [];
}

export async function getConsentAuditLogs(): Promise<any[]> {
  const { data, error } = await supabase
    .from('consent_audit_log')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching consent audit logs:', error);
    return [];
  }
  return data || [];
}
