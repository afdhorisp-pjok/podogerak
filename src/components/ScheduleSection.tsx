import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserData, WEEKLY_PROGRAMS, DAY_NAMES } from '@/lib/workoutData';
import { updateWeeklySchedule } from '@/lib/progressService';
import { cn } from '@/lib/utils';
import { CalendarDays, Check } from 'lucide-react';

interface ScheduleSectionProps {
  user: UserData;
  onUpdate: (user: UserData) => void;
}

export const ScheduleSection = ({ user, onUpdate }: ScheduleSectionProps) => {
  const [selectedDays, setSelectedDays] = useState<number[]>(user.weeklySchedule);

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();
    setSelectedDays(newDays);
  };

  const applyProgram = async (days: number[]) => {
    setSelectedDays(days);
    await updateWeeklySchedule(user.id, days);
    onUpdate({ ...user, weeklySchedule: days });
  };

  const saveSchedule = async () => {
    await updateWeeklySchedule(user.id, selectedDays);
    onUpdate({ ...user, weeklySchedule: selectedDays });
  };

  const today = new Date().getDay();
  const isWorkoutDay = selectedDays.includes(today);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-secondary" />
          Jadwal Mingguan
        </CardTitle>
        <CardDescription>Pilih hari-hari untuk berlatih</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Program Cepat:</p>
          <div className="flex flex-wrap gap-2">
            {WEEKLY_PROGRAMS.map((program) => (
              <Button
                key={program.id}
                variant="outline"
                size="sm"
                onClick={() => applyProgram(program.days)}
                className={cn(
                  "text-xs",
                  JSON.stringify(selectedDays) === JSON.stringify(program.days) && "border-primary bg-primary/10"
                )}
              >
                {program.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((day, index) => (
            <button
              key={day}
              onClick={() => toggleDay(index)}
              className={cn(
                "p-2 rounded-lg text-xs font-medium transition-all duration-200",
                selectedDays.includes(index) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
                index === today && "ring-2 ring-accent ring-offset-2"
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className={cn(
          "p-3 rounded-xl text-center text-sm",
          isWorkoutDay ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        )}>
          {isWorkoutDay ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Hari ini jadwal latihan!
            </span>
          ) : (
            <span>Hari ini hari istirahat</span>
          )}
        </div>

        <Button onClick={saveSchedule} className="w-full" variant="secondary">
          Simpan Jadwal
        </Button>
      </CardContent>
    </Card>
  );
};
