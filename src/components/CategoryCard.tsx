import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseDomain, getDomainLabel, getDomainDescription, getDomainIcon, getExercisesByDomain } from '@/lib/workoutData';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface CategoryCardProps {
  domain: ExerciseDomain;
  onStart: (domain: ExerciseDomain) => void;
  delay?: number;
  exerciseCount?: number;
}

const domainStyles: Record<ExerciseDomain, { bg: string; border: string; btnClass: string }> = {
  locomotor: { bg: 'bg-primary/5 hover:bg-primary/10', border: 'border-primary/20', btnClass: '' },
  jumping: { bg: 'bg-jumping/5 hover:bg-jumping/10', border: 'border-jumping/20', btnClass: 'bg-jumping hover:bg-jumping/90' },
  balance: { bg: 'bg-balance/5 hover:bg-balance/10', border: 'border-balance/20', btnClass: 'bg-balance hover:bg-balance/90' },
  ball_skills: { bg: 'bg-ball-skills/5 hover:bg-ball-skills/10', border: 'border-ball-skills/20', btnClass: 'bg-ball-skills hover:bg-ball-skills/90' },
  combined: { bg: 'bg-combined/5 hover:bg-combined/10', border: 'border-combined/20', btnClass: 'bg-combined hover:bg-combined/90' },
};

export const CategoryCard = ({ domain, onStart, delay = 0, exerciseCount }: CategoryCardProps) => {
  const exercises = getExercisesByDomain(domain);
  const style = domainStyles[domain];
  const count = exerciseCount ?? exercises.length;

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer animate-slide-up opacity-0",
        style.bg, style.border
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
      onClick={() => onStart(domain)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="text-4xl animate-wiggle" style={{ animationDelay: `${delay + 200}ms` }}>
            {getDomainIcon(domain)}
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-foreground/10 text-foreground">
            {count} Gerakan
          </span>
        </div>
        <CardTitle className="text-lg mt-2">{getDomainLabel(domain)}</CardTitle>
        <CardDescription className="text-xs">{getDomainDescription(domain)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className={cn("w-full text-white", style.btnClass || '')}
          variant={domain === 'locomotor' ? 'default' : 'default'}
          onClick={(e) => { e.stopPropagation(); onStart(domain); }}
        >
          <Play className="w-4 h-4" /> Mulai
        </Button>
      </CardContent>
    </Card>
  );
};
