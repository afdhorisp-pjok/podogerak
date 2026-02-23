import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EXERCISES, ExerciseDomain, getDomainLabel, getDomainIcon, ALL_DOMAINS } from '@/lib/workoutData';
import { saveSkillAssessment, getSkillAssessments } from '@/lib/progressService';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssessmentModuleProps {
  userId: string;
  onBack: () => void;
}

const RATING_LABELS = [
  { value: 0, label: 'Belum Bisa', color: 'bg-muted text-muted-foreground' },
  { value: 1, label: 'Mulai Muncul', color: 'bg-accent/20 text-accent-foreground' },
  { value: 2, label: 'Berkembang', color: 'bg-secondary/20 text-secondary' },
  { value: 3, label: 'Kompeten', color: 'bg-success/20 text-success' },
];

export const AssessmentModule = ({ userId, onBack }: AssessmentModuleProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [existingRatings, setExistingRatings] = useState<Record<string, number>>({});
  const [activeDomain, setActiveDomain] = useState<ExerciseDomain>('locomotor');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadAssessments = async () => {
      const data = await getSkillAssessments(userId);
      const latest: Record<string, number> = {};
      // Get most recent rating for each skill
      for (const entry of data) {
        if (!latest[entry.skill_id]) {
          latest[entry.skill_id] = entry.rating;
        }
      }
      setExistingRatings(latest);
      setRatings(latest);
    };
    loadAssessments();
  }, [userId]);

  const setRating = (skillId: string, value: number) => {
    setRatings(prev => ({ ...prev, [skillId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const changed = Object.entries(ratings).filter(
      ([id, rating]) => existingRatings[id] !== rating
    );

    for (const [skillId, rating] of changed) {
      const exercise = EXERCISES.find(e => e.id === skillId);
      if (!exercise) continue;
      await saveSkillAssessment({
        user_id: userId,
        skill_id: skillId,
        domain: exercise.domain,
        rating,
      });
    }

    setExistingRatings({ ...ratings });
    setIsSaving(false);
    toast.success('Penilaian berhasil disimpan!');
  };

  const domainExercises = EXERCISES.filter(e => e.domain === activeDomain);
  const assessmentDomains: ExerciseDomain[] = ['locomotor', 'jumping', 'balance', 'ball_skills'];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-fredoka font-bold text-foreground">
              Penilaian Keterampilan Motorik
            </h1>
            <p className="text-sm text-muted-foreground">TGMD-3 Aligned Assessment</p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Rating Scale Legend */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm font-bold mb-2">Skala Penilaian:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RATING_LABELS.map(r => (
                <div key={r.value} className={cn("px-3 py-2 rounded-lg text-xs text-center font-medium", r.color)}>
                  {r.value} - {r.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domain Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {assessmentDomains.map(domain => (
            <Button
              key={domain}
              variant={activeDomain === domain ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDomain(domain)}
              className="whitespace-nowrap"
            >
              {getDomainIcon(domain)} {getDomainLabel(domain)}
            </Button>
          ))}
        </div>

        {/* Exercise Ratings */}
        <ScrollArea className="h-[50vh]">
          <div className="space-y-3">
            {domainExercises.map(exercise => (
              <Card key={exercise.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{exercise.illustration}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">{exercise.childInstruction}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {RATING_LABELS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setRating(exercise.id, r.value)}
                        className={cn(
                          "px-2 py-2 rounded-lg text-xs font-medium transition-all border-2",
                          ratings[exercise.id] === r.value
                            ? "border-primary ring-2 ring-primary/30 " + r.color
                            : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {r.value}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Save Button */}
        <div className="sticky bottom-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
            <Save className="w-5 h-5" />
            {isSaving ? 'Menyimpan...' : 'Simpan Penilaian'}
          </Button>
        </div>
      </main>
    </div>
  );
};
