import { Exercise, ExerciseDomain, getExercisesForWeek, EXERCISES } from './workoutData';

export interface CurriculumWeek {
  week: number;
  phase: string;
  phaseLabel: string;
  focus: string;
  domains: ExerciseDomain[];
  description: string;
}

export const CURRICULUM_WEEKS: CurriculumWeek[] = [
  {
    week: 1,
    phase: 'fundamental',
    phaseLabel: 'Fundamental',
    focus: 'Pengenalan gerakan dasar',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills'],
    description: 'Perkenalan gerakan dasar di setiap domain motorik.',
  },
  {
    week: 2,
    phase: 'fundamental',
    phaseLabel: 'Fundamental',
    focus: 'Penguatan gerakan dasar',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills'],
    description: 'Mengulang dan memperkuat gerakan dasar dengan variasi.',
  },
  {
    week: 3,
    phase: 'development',
    phaseLabel: 'Development',
    focus: 'Kombinasi sederhana',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills'],
    description: 'Menambah latihan baru dan mulai kombinasi antar domain.',
  },
  {
    week: 4,
    phase: 'development',
    phaseLabel: 'Development',
    focus: 'Peningkatan koordinasi',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills'],
    description: 'Meningkatkan kompleksitas koordinasi gerakan.',
  },
  {
    week: 5,
    phase: 'integration',
    phaseLabel: 'Integration',
    focus: 'Integrasi cross-domain',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills'],
    description: 'Mengintegrasikan gerakan dari berbagai domain.',
  },
  {
    week: 6,
    phase: 'integration',
    phaseLabel: 'Integration',
    focus: 'Keseimbangan dan bola lanjutan',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills'],
    description: 'Latihan keseimbangan dan bola yang lebih kompleks.',
  },
  {
    week: 7,
    phase: 'mastery',
    phaseLabel: 'Mastery',
    focus: 'Latihan gabungan',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills', 'combined'],
    description: 'Memperkenalkan latihan gabungan lokomotor + bola.',
  },
  {
    week: 8,
    phase: 'mastery',
    phaseLabel: 'Mastery',
    focus: 'Penguasaan semua domain',
    domains: ['locomotor', 'jumping', 'balance', 'ball_skills', 'combined'],
    description: 'Seluruh latihan tersedia, fokus penguasaan.',
  },
];

/**
 * Generate a session of 4 exercises from the available exercises for the given week.
 * Ensures domain diversity: picks from different domains as much as possible.
 */
export const generateSessionExercises = (week: number, completedExerciseIds: string[] = []): Exercise[] => {
  const available = getExercisesForWeek(week);
  if (available.length <= 4) return available;

  // Group by domain
  const byDomain = new Map<ExerciseDomain, Exercise[]>();
  for (const ex of available) {
    const list = byDomain.get(ex.domain) || [];
    list.push(ex);
    byDomain.set(ex.domain, list);
  }

  const selected: Exercise[] = [];
  const domains = Array.from(byDomain.keys());

  // First pass: pick one from each domain (prioritize less practiced)
  for (const domain of domains) {
    if (selected.length >= 4) break;
    const exercises = byDomain.get(domain)!;
    // Prefer exercises not yet completed today
    const unpracticed = exercises.filter(e => !completedExerciseIds.includes(e.id));
    const pool = unpracticed.length > 0 ? unpracticed : exercises;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    selected.push(pick);
  }

  // If we still need more, pick randomly from remaining
  while (selected.length < 4) {
    const remaining = available.filter(e => !selected.includes(e));
    if (remaining.length === 0) break;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    selected.push(pick);
  }

  return selected.slice(0, 4);
};

export const getCurriculumWeek = (week: number): CurriculumWeek => {
  return CURRICULUM_WEEKS.find(w => w.week === week) || CURRICULUM_WEEKS[0];
};

export const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'fundamental': return 'bg-primary/10 text-primary';
    case 'development': return 'bg-secondary/10 text-secondary';
    case 'integration': return 'bg-accent/10 text-accent-foreground';
    case 'mastery': return 'bg-success/10 text-success';
    default: return 'bg-muted text-muted-foreground';
  }
};
