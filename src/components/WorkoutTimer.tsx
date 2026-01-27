import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Exercise, ExerciseCategory, getExercisesByCategory, getCategoryLabel } from '@/lib/workoutData';
import { addWorkoutSession, getUser, saveUser } from '@/lib/storage';
import { Play, Pause, SkipForward, X, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTimerProps {
  category: ExerciseCategory;
  onComplete: () => void;
  onClose: () => void;
}

type WorkoutPhase = 'ready' | 'exercise' | 'rest' | 'completed';

export const WorkoutTimer = ({ category, onComplete, onClose }: WorkoutTimerProps) => {
  const exercises = getExercisesByCategory(category);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [phase, setPhase] = useState<WorkoutPhase>('ready');
  const [timeLeft, setTimeLeft] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [startTime] = useState(Date.now());

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex + (currentSet - 1) / currentExercise.sets) / totalExercises) * 100;

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, [soundEnabled]);

  const moveToNextPhase = useCallback(() => {
    if (phase === 'ready') {
      setPhase('exercise');
      setTimeLeft(currentExercise.durationPerRep);
    } else if (phase === 'exercise') {
      if (currentRep < currentExercise.repetitions) {
        setCurrentRep(prev => prev + 1);
        setTimeLeft(currentExercise.durationPerRep);
      } else if (currentSet < currentExercise.sets) {
        setPhase('rest');
        setTimeLeft(currentExercise.restTime);
        setCurrentRep(1);
      } else if (currentExerciseIndex < totalExercises - 1) {
        setPhase('rest');
        setTimeLeft(currentExercise.restTime);
        setCurrentSet(1);
        setCurrentRep(1);
      } else {
        setPhase('completed');
      }
    } else if (phase === 'rest') {
      if (currentSet < currentExercise.sets) {
        setCurrentSet(prev => prev + 1);
      } else {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
      }
      setPhase('exercise');
      const nextExercise = currentSet < currentExercise.sets 
        ? currentExercise 
        : exercises[currentExerciseIndex + 1];
      setTimeLeft(nextExercise?.durationPerRep || 0);
    }
  }, [phase, currentExercise, currentRep, currentSet, currentExerciseIndex, totalExercises, exercises]);

  useEffect(() => {
    if (isPaused || phase === 'completed') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playBeep();
          setTimeout(moveToNextPhase, 100);
          return 0;
        }
        if (prev <= 4) playBeep();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, phase, moveToNextPhase, playBeep]);

  const handleComplete = () => {
    const user = getUser();
    if (user) {
      const duration = Math.round((Date.now() - startTime) / 60000);
      const session = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        exercises: exercises.map(e => e.id),
        duration,
        completed: true,
      };
      addWorkoutSession(user, session);
    }
    onComplete();
  };

  const skipToNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setCurrentRep(1);
      setPhase('exercise');
      setTimeLeft(exercises[currentExerciseIndex + 1].durationPerRep);
    } else {
      setPhase('completed');
    }
  };

  const phaseColors = {
    ready: 'bg-accent',
    exercise: 'bg-primary',
    rest: 'bg-secondary',
    completed: 'bg-success',
  };

  const phaseLabels = {
    ready: 'Bersiap...',
    exercise: 'Ayo Gerak!',
    rest: 'Istirahat',
    completed: 'Selesai! 🎉',
  };

  if (phase === 'completed') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center animate-scale-in">
          <div className="text-8xl mb-6 animate-bounce-soft">🏆</div>
          <h2 className="text-3xl font-fredoka font-bold text-foreground mb-2">
            Hebat Sekali!
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Kamu sudah menyelesaikan latihan {getCategoryLabel(category)}!
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" size="lg">
              Kembali
            </Button>
            <Button onClick={handleComplete} className="flex-1" size="lg">
              <CheckCircle className="w-5 h-5" />
              Simpan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Latihan {currentExerciseIndex + 1} dari {totalExercises}
          </div>
          <Progress value={progress} className="w-32 h-2 mt-1" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Phase Badge */}
        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-bold text-white mb-4",
          phaseColors[phase]
        )}>
          {phaseLabels[phase]}
        </div>

        {/* Timer */}
        <div className={cn(
          "w-48 h-48 rounded-full flex items-center justify-center mb-6",
          phase === 'ready' && 'animate-countdown-pulse',
          phaseColors[phase]
        )}>
          <span className="text-7xl font-fredoka font-bold text-white">
            {timeLeft}
          </span>
        </div>

        {/* Exercise Info */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{currentExercise.illustration}</div>
          <h2 className="text-2xl font-fredoka font-bold text-foreground mb-2">
            {currentExercise.name}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {currentExercise.description}
          </p>
        </div>

        {/* Set & Rep Info */}
        {phase === 'exercise' && (
          <div className="flex gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{currentRep}</div>
              <div className="text-sm text-muted-foreground">dari {currentExercise.repetitions} repetisi</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{currentSet}</div>
              <div className="text-sm text-muted-foreground">dari {currentExercise.sets} set</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 border-t bg-card">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={skipToNext}
            className="w-32"
          >
            <SkipForward className="w-5 h-5" />
            Lewati
          </Button>
          <Button
            size="xl"
            onClick={() => setIsPaused(!isPaused)}
            className="w-40"
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            {isPaused ? 'Lanjut' : 'Jeda'}
          </Button>
        </div>
      </div>
    </div>
  );
};
