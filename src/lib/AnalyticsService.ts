import { supabase } from '@/integrations/supabase/client';
import type { ExperimentParticipant, ExperimentSessionLog } from './ExperimentService';

// ── Arm distribution ──
export function getParticipantsByArm(participants: ExperimentParticipant[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of participants) {
    counts[p.arm] = (counts[p.arm] || 0) + 1;
  }
  return counts;
}

// ── Weekly completion rate ──
export function getWeeklyCompletionRate(logs: ExperimentSessionLog[]): { week: string; rate: number; total: number; completed: number }[] {
  const weeks: Record<string, { total: number; completed: number }> = {};
  for (const l of logs) {
    const d = new Date(l.start_timestamp);
    const year = d.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    const key = `${year}-W${String(weekNum).padStart(2, '0')}`;
    if (!weeks[key]) weeks[key] = { total: 0, completed: 0 };
    weeks[key].total++;
    if (l.completion_flag) weeks[key].completed++;
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, d]) => ({ week, rate: d.total > 0 ? (d.completed / d.total) * 100 : 0, ...d }));
}

// ── Average duration ──
export function getAverageDuration(logs: ExperimentSessionLog[]): number {
  const durations = logs.filter(l => l.duration_seconds != null).map(l => l.duration_seconds!);
  return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
}

// ── Teacher fidelity score ──
export function getTeacherFidelityScore(logs: ExperimentSessionLog[]): number {
  const ratings = logs.filter(l => l.teacher_rating != null).map(l => l.teacher_rating!);
  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
}

// ── Follow-up flagging ──
export interface FlaggedParticipant {
  participant: ExperimentParticipant;
  reason: 'missed_sessions' | 'low_fidelity' | 'both';
  consecutiveMisses: number;
  avgRating: number | null;
}

export function getFollowUpList(
  participants: ExperimentParticipant[],
  logs: ExperimentSessionLog[],
  config: { missThreshold: number; fidelityThreshold: number } = { missThreshold: 3, fidelityThreshold: 3.0 }
): FlaggedParticipant[] {
  const flagged: FlaggedParticipant[] = [];

  for (const p of participants) {
    const pLogs = logs
      .filter(l => l.participant_id === p.id)
      .sort((a, b) => new Date(a.start_timestamp).getTime() - new Date(b.start_timestamp).getTime());

    // Calculate consecutive missed weeks from the end
    let consecutiveMisses = 0;
    if (pLogs.length > 0) {
      const lastSession = new Date(pLogs[pLogs.length - 1].start_timestamp);
      const now = new Date();
      const weeksSinceLast = Math.floor((now.getTime() - lastSession.getTime()) / (7 * 86400000));
      consecutiveMisses = weeksSinceLast;
    } else {
      // Participant enrolled but never had a session
      const enrolled = new Date(p.created_at);
      const now = new Date();
      consecutiveMisses = Math.floor((now.getTime() - enrolled.getTime()) / (7 * 86400000));
    }

    // Average rating
    const ratings = pLogs.filter(l => l.teacher_rating != null).map(l => l.teacher_rating!);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    const missFlag = consecutiveMisses >= config.missThreshold;
    const fidelityFlag = avgRating !== null && avgRating < config.fidelityThreshold;

    if (missFlag || fidelityFlag) {
      flagged.push({
        participant: p,
        reason: missFlag && fidelityFlag ? 'both' : missFlag ? 'missed_sessions' : 'low_fidelity',
        consecutiveMisses,
        avgRating,
      });
    }
  }

  return flagged;
}

// ── Aggregated report ──
export interface ArmStats {
  arm: string;
  n: number;
  sessionsCompleted: number;
  meanDuration: number;
  sdDuration: number;
  meanRating: number;
  sdRating: number;
  tStat: string;
  pValue: string;
}

function stddev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const sq = values.reduce((s, v) => s + (v - mean) ** 2, 0);
  return Math.sqrt(sq / (values.length - 1));
}

export function generateAggregatedReport(
  participants: ExperimentParticipant[],
  logs: ExperimentSessionLog[]
): ArmStats[] {
  const arms = [...new Set(participants.map(p => p.arm))];
  const controlArm = arms.find(a => a.toLowerCase().includes('control')) || arms[0];
  const armStats: ArmStats[] = [];

  let controlMeanDur = 0;
  let controlSdDur = 0;
  let controlN = 0;

  for (const arm of arms) {
    const armParticipants = participants.filter(p => p.arm === arm);
    const armIds = new Set(armParticipants.map(p => p.id));
    const armLogs = logs.filter(l => armIds.has(l.participant_id));
    const completed = armLogs.filter(l => l.completion_flag).length;
    const durations = armLogs.filter(l => l.duration_seconds != null).map(l => l.duration_seconds!);
    const ratings = armLogs.filter(l => l.teacher_rating != null).map(l => l.teacher_rating!);

    const meanDur = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const sdDur = stddev(durations, meanDur);
    const meanRat = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const sdRat = stddev(ratings, meanRat);

    if (arm === controlArm) {
      controlMeanDur = meanDur;
      controlSdDur = sdDur;
      controlN = durations.length;
    }

    armStats.push({
      arm,
      n: armParticipants.length,
      sessionsCompleted: completed,
      meanDuration: meanDur,
      sdDuration: sdDur,
      meanRating: meanRat,
      sdRating: sdRat,
      tStat: '—',
      pValue: '—',
    });
  }

  // Compute t-stat placeholders for non-control arms
  for (const stat of armStats) {
    if (stat.arm !== controlArm && controlN > 1 && stat.n > 0) {
      const armDurations = logs
        .filter(l => {
          const pIds = new Set(participants.filter(p => p.arm === stat.arm).map(p => p.id));
          return pIds.has(l.participant_id) && l.duration_seconds != null;
        })
        .map(l => l.duration_seconds!);

      if (armDurations.length > 1) {
        const denom = Math.sqrt((controlSdDur ** 2 / controlN) + (stat.sdDuration ** 2 / armDurations.length));
        if (denom > 0) {
          const t = (stat.meanDuration - controlMeanDur) / denom;
          stat.tStat = t.toFixed(2);
          stat.pValue = 'placeholder';
        }
      }
    }
  }

  return armStats;
}

// ── CSV exports ──
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAggregatedCSV(report: ArmStats[]) {
  const headers = ['arm', 'n', 'sessions_completed', 'mean_duration', 'sd_duration', 'mean_rating', 'sd_rating', 't_stat', 'p_value'];
  const rows = report.map(r => [
    r.arm, r.n, r.sessionsCompleted,
    r.meanDuration.toFixed(1), r.sdDuration.toFixed(1),
    r.meanRating.toFixed(2), r.sdRating.toFixed(2),
    r.tStat, r.pValue,
  ].join(','));
  downloadCSV([headers.join(','), ...rows].join('\n'), `aggregated_report_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportConsentLogsCSV(consentRecords: any[], auditLogs: any[]) {
  // Consent records
  const cHeaders = ['id', 'user_id', 'child_user_id', 'consent_version', 'consent_hash', 'granted_at', 'revoked_at', 'consent_audio', 'consent_video_upload', 'consent_sensor_data'];
  const cRows = consentRecords.map(r => [
    r.id, r.user_id, r.child_user_id || '', r.consent_version, r.consent_hash,
    r.granted_at || '', r.revoked_at || '',
    r.consent_audio ? '1' : '0', r.consent_video_upload ? '1' : '0', r.consent_sensor_data ? '1' : '0',
  ].join(','));
  downloadCSV([cHeaders.join(','), ...cRows].join('\n'), `consent_records_${new Date().toISOString().slice(0, 10)}.csv`);

  // Audit logs
  const aHeaders = ['id', 'user_id', 'action', 'consent_record_id', 'metadata', 'created_at'];
  const aRows = auditLogs.map(r => [
    r.id, r.user_id, r.action, r.consent_record_id || '', JSON.stringify(r.metadata || {}), r.created_at || '',
  ].join(','));
  downloadCSV([aHeaders.join(','), ...aRows].join('\n'), `consent_audit_${new Date().toISOString().slice(0, 10)}.csv`);
}
