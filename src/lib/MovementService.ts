import { supabase } from '@/integrations/supabase/client';

export interface Movement {
  id: string;
  name: string;
  description: string;
  animation_url: string | null;
  illustration: string;
  domain: string;
  difficulty_level: string;
  duration_seconds: number;
  equipment: string;
  parent_instruction: string | null;
  child_instruction: string | null;
  safety_note: string | null;
  motor_goal: string | null;
  week_introduced: number;
}

let cachedMovements: Movement[] | null = null;

export const fetchMovements = async (): Promise<Movement[]> => {
  if (cachedMovements) return cachedMovements;

  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .order('week_introduced', { ascending: true });

  if (error) {
    console.error('Error fetching movements:', error);
    return [];
  }

  cachedMovements = (data as any[]).map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    animation_url: m.animation_url,
    illustration: m.illustration || '🏃',
    domain: m.domain,
    difficulty_level: m.difficulty_level,
    duration_seconds: m.duration_seconds,
    equipment: m.equipment || 'none',
    parent_instruction: m.parent_instruction,
    child_instruction: m.child_instruction,
    safety_note: m.safety_note,
    motor_goal: m.motor_goal,
    week_introduced: m.week_introduced,
  }));

  return cachedMovements;
};

export const clearMovementCache = () => {
  cachedMovements = null;
};

/**
 * Get movements available for a given curriculum week.
 */
export const getMovementsForWeek = async (week: number): Promise<Movement[]> => {
  const all = await fetchMovements();
  return all.filter((m) => m.week_introduced <= week);
};

/**
 * Generate a session of 4 movements with domain diversity and no repeats.
 */
export const generateSessionMovements = async (
  week: number,
  excludeIds: string[] = []
): Promise<Movement[]> => {
  const available = await getMovementsForWeek(week);
  const filtered = available.filter((m) => !excludeIds.includes(m.id));
  const pool = filtered.length >= 4 ? filtered : available;

  if (pool.length <= 4) return shuffleArray([...pool]);

  // Group by domain for diversity
  const byDomain = new Map<string, Movement[]>();
  for (const m of pool) {
    const list = byDomain.get(m.domain) || [];
    list.push(m);
    byDomain.set(m.domain, list);
  }

  const selected: Movement[] = [];
  const domains = shuffleArray(Array.from(byDomain.keys()));

  // Pick one from each domain first
  for (const domain of domains) {
    if (selected.length >= 4) break;
    const exercises = byDomain.get(domain)!;
    const pick = exercises[Math.floor(Math.random() * exercises.length)];
    selected.push(pick);
  }

  // Fill remaining
  while (selected.length < 4) {
    const remaining = pool.filter((m) => !selected.some((s) => s.id === m.id));
    if (remaining.length === 0) break;
    selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return selected.slice(0, 4);
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const getDomainLabel = (domain: string): string => {
  const labels: Record<string, string> = {
    locomotor: 'Lokomotor',
    jumping: 'Lompat & Hop',
    balance: 'Keseimbangan',
    ball_skills: 'Keterampilan Bola',
    combined: 'Gabungan',
  };
  return labels[domain] || domain;
};
