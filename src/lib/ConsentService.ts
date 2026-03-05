import { supabase } from '@/integrations/supabase/client';

const CONSENT_VERSION = 'v1.0';

async function hashPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface ConsentOptions {
  consentAudio: boolean;
  consentSensorData: boolean;
  consentVideoUpload: boolean;
}

export const createConsentRecord = async (
  userId: string,
  childUserId: string,
  consents: ConsentOptions
): Promise<string | null> => {
  const payload = JSON.stringify({
    userId,
    childUserId,
    ...consents,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  });

  const consentHash = await hashPayload(payload);

  const { data, error } = await supabase
    .from('consent_records' as any)
    .insert({
      user_id: userId,
      child_user_id: childUserId,
      consent_version: CONSENT_VERSION,
      consent_hash: consentHash,
      consent_audio: consents.consentAudio,
      consent_sensor_data: consents.consentSensorData,
      consent_video_upload: consents.consentVideoUpload,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create consent record:', error);
    return null;
  }

  // Audit log
  await supabase.from('consent_audit_log' as any).insert({
    user_id: userId,
    action: 'grant',
    consent_record_id: (data as any).id,
    metadata: { version: CONSENT_VERSION, consents },
  });

  return (data as any).id;
};

export const revokeConsent = async (userId: string, consentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('consent_records' as any)
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', consentId)
    .eq('user_id', userId);

  if (error) return false;

  await supabase.from('consent_audit_log' as any).insert({
    user_id: userId,
    action: 'revoke',
    consent_record_id: consentId,
  });

  return true;
};

export const getConsentStatus = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('consent_records' as any)
    .select('id')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .limit(1);

  if (error || !data) return false;
  return (data as any[]).length > 0;
};

export const logConsentAudit = async (
  userId: string,
  action: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await supabase.from('consent_audit_log' as any).insert({
    user_id: userId,
    action,
    metadata: metadata || null,
  });
};

export const eraseChildPII = async (childUserId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('erase_child_pii', {
    child_user_id_input: childUserId,
  } as any);

  if (error) {
    console.error('Failed to erase PII:', error);
    return false;
  }
  return true;
};

export const getRetentionSettings = async (userId: string) => {
  const { data } = await (supabase
    .from('data_retention_settings' as any)
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle() as any);

  return data as { id: string; retention_days: number; child_user_id: string } | null;
};

export const upsertRetentionSettings = async (
  userId: string,
  childUserId: string,
  retentionDays: number
): Promise<boolean> => {
  // Check existing
  const existing = await getRetentionSettings(userId);

  if (existing) {
    const { error } = await supabase
      .from('data_retention_settings' as any)
      .update({ retention_days: retentionDays, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return !error;
  }

  const { error } = await supabase
    .from('data_retention_settings' as any)
    .insert({
      user_id: userId,
      child_user_id: childUserId,
      retention_days: retentionDays,
    });
  return !error;
};
