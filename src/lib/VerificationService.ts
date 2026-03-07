import { supabase } from '@/integrations/supabase/client';

export interface ChecklistItem {
  key: string;
  label: string;
  checked: boolean;
}

export const TEACHER_CHECKLIST: Omit<ChecklistItem, 'checked'>[] = [
  { key: 'child_present', label: 'Anak hadir dan siap' },
  { key: 'warm_up_done', label: 'Pemanasan dilakukan' },
  { key: 'instructions_given', label: 'Instruksi diberikan dengan jelas' },
  { key: 'movements_performed', label: 'Gerakan dilakukan sesuai panduan' },
  { key: 'safety_observed', label: 'Keamanan diperhatikan' },
  { key: 'child_engaged', label: 'Anak berpartisipasi aktif' },
  { key: 'cool_down_done', label: 'Pendinginan dilakukan' },
  { key: 'session_completed', label: 'Sesi diselesaikan penuh' },
];

/**
 * Strip EXIF metadata by re-encoding image through canvas.
 */
export const stripImageMetadata = (file: File): Promise<{ blob: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error('Failed to encode')); return; }
        resolve({ blob, width: img.width, height: img.height });
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
};

/**
 * Generate a small thumbnail (max 120px).
 */
export const generateThumbnail = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxDim = 120;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error('Failed')); return; }
        resolve(blob);
      }, 'image/jpeg', 0.7);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed')); };
    img.src = url;
  });
};

/**
 * Submit a checklist verification.
 */
export const submitChecklist = async (
  sessionId: string,
  userId: string,
  checklistData: ChecklistItem[]
) => {
  const { error } = await supabase.from('session_verifications').insert({
    session_id: sessionId,
    user_id: userId,
    verification_mode: 'checklist',
    checklist_data: checklistData as any,
    teacher_id: userId,
  } as any);
  if (error) throw error;
};

/**
 * Submit photo/video verification with metadata stripping.
 */
export const submitMediaVerification = async (
  sessionId: string,
  userId: string,
  mode: 'photo' | 'video',
  file: File,
  consents: { photo: boolean; video: boolean }
) => {
  let metrics: Record<string, any> = {
    originalSize: file.size,
    type: file.type,
    timestamp: new Date().toISOString(),
  };
  let uploadBlob: Blob = file;
  const filePath = `${userId}/${sessionId}/${mode}-${Date.now()}`;

  if (mode === 'photo') {
    const { blob, width, height } = await stripImageMetadata(file);
    uploadBlob = blob;
    metrics = { ...metrics, width, height, strippedSize: blob.size };

    // Upload thumbnail
    const thumb = await generateThumbnail(file);
    await supabase.storage.from('verification-media').upload(`${filePath}-thumb.jpg`, thumb, {
      contentType: 'image/jpeg',
    });
    metrics.thumbnailPath = `${filePath}-thumb.jpg`;
  }

  // Upload main file
  const ext = mode === 'photo' ? 'jpg' : file.name.split('.').pop() || 'mp4';
  await supabase.storage.from('verification-media').upload(`${filePath}.${ext}`, uploadBlob, {
    contentType: mode === 'photo' ? 'image/jpeg' : file.type,
  });

  const { error } = await supabase.from('session_verifications').insert({
    session_id: sessionId,
    user_id: userId,
    verification_mode: mode,
    media_metrics: metrics as any,
    media_consent_photo: consents.photo,
    media_consent_video: consents.video,
    teacher_id: userId,
  } as any);
  if (error) throw error;
};

/**
 * Create a parent confirmation request + notification.
 */
export const createParentConfirmation = async (
  sessionId: string,
  parentUserId: string,
  childName: string
) => {
  const { data, error } = await supabase.from('parent_confirmations').insert({
    session_id: sessionId,
    parent_user_id: parentUserId,
    child_name: childName,
    session_date: new Date().toISOString(),
  } as any).select().single();
  if (error) throw error;

  // Create notification for parent
  await supabase.from('report_notifications').insert({
    user_id: parentUserId,
    message: `Anak Anda (${childName}) telah menyelesaikan sesi latihan. Konfirmasi?`,
    report_id: null,
  } as any);

  return data;
};

/**
 * Get pending parent confirmations.
 */
export const getPendingConfirmations = async (userId: string) => {
  const { data, error } = await supabase
    .from('parent_confirmations')
    .select('*')
    .eq('parent_user_id', userId)
    .eq('confirmed', false)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
};

/**
 * Confirm a parent report.
 */
export const confirmParentReport = async (confirmationId: string, userId: string) => {
  const { error } = await supabase
    .from('parent_confirmations')
    .update({ confirmed: true, confirmed_at: new Date().toISOString() } as any)
    .eq('id', confirmationId);
  if (error) throw error;

  // Log audit
  await supabase.from('consent_audit_log').insert({
    user_id: userId,
    action: 'parent_confirmation',
    metadata: { confirmation_id: confirmationId } as any,
  });
};

/**
 * Get verification status for a session.
 */
export const getVerificationStatus = async (sessionId: string) => {
  const { data: verifications } = await supabase
    .from('session_verifications')
    .select('*')
    .eq('session_id', sessionId);

  const { data: confirmations } = await supabase
    .from('parent_confirmations')
    .select('*')
    .eq('session_id', sessionId);

  return {
    verifications: verifications ?? [],
    confirmations: confirmations ?? [],
  };
};
