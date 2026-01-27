import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserData, getExerciseById, DAY_NAMES } from '@/lib/workoutData';
import { getRecentWorkouts } from '@/lib/storage';
import { Clock, Calendar } from 'lucide-react';

interface HistorySectionProps {
  user: UserData;
}

export const HistorySection = ({ user }: HistorySectionProps) => {
  const recentWorkouts = getRecentWorkouts(user, 7);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = DAY_NAMES[date.getDay()];
    const d = date.getDate();
    const m = date.getMonth() + 1;
    return `${day}, ${d}/${m}`;
  };

  if (recentWorkouts.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            Belum Ada Riwayat
          </h3>
          <p className="text-sm text-muted-foreground">
            Mulai latihan pertamamu untuk melihat riwayat di sini!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Riwayat Latihan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {workout.completed ? '✅' : '⏸️'}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {formatDate(workout.date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {workout.exercises.length} gerakan
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {workout.duration} menit
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
