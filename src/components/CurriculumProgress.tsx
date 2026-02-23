import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CURRICULUM_WEEKS, getPhaseColor } from '@/lib/curriculumData';
import { cn } from '@/lib/utils';

interface CurriculumProgressProps {
  currentWeek: number;
  totalSessions: number;
}

export const CurriculumProgress = ({ currentWeek, totalSessions }: CurriculumProgressProps) => {
  const overallProgress = Math.min((currentWeek / 8) * 100, 100);
  const currentCurriculum = CURRICULUM_WEEKS.find(w => w.week === currentWeek) || CURRICULUM_WEEKS[0];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>📚 Kurikulum 8 Minggu</span>
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold", getPhaseColor(currentCurriculum.phase))}>
            {currentCurriculum.phaseLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Minggu {currentWeek} dari 8</span>
            <span className="font-bold text-primary">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Fokus:</span> {currentCurriculum.focus}
        </p>
        <p className="text-xs text-muted-foreground">{currentCurriculum.description}</p>

        {/* Week indicators */}
        <div className="grid grid-cols-8 gap-1">
          {CURRICULUM_WEEKS.map(week => (
            <div
              key={week.week}
              className={cn(
                "h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all",
                week.week < currentWeek
                  ? "bg-success text-success-foreground"
                  : week.week === currentWeek
                  ? "bg-primary text-primary-foreground animate-pulse-glow"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {week.week}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
