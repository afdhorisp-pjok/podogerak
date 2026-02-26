import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Movement, getDomainLabel } from '@/lib/MovementService';
import { audioController } from '@/lib/AudioController';
import { TrainingPlayer } from './TrainingPlayer';
import { Play, Pause, SkipForward, X, Volume2, VolumeX, CheckCircle, Info, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionRunnerProps {
  exercises: Movement[];
  onComplete: (exerciseIds: string[], duration: number, domain: string) => void;
  onClose: () => void;
}

type SessionPhase = 'parent-prep' | 'countdown' | 'exercise' | 'exercise-complete' | 'session-complete';

export const SessionRunner = ({ exercises, onComplete, onClose }: SessionRunnerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('parent-prep');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicMuted, setMusicMuted] = useState(audioController.isMuted);
  const [startTime] = useState(Date.now());

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex) / exercises.length) * 100;

  // Start background music when session begins
  useEffect(() => {
    audioController.start();
    return () => {
      audioController.stop();
    };
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
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
    } catch {}
  }, [soundEnabled]);

  const startExercise = () => {
    setPhase('countdown');
    setTimeLeft(3);
  };

  const handleExerciseComplete = () => {
    if (currentIndex < exercises.length - 1) {
      setPhase('exercise-complete');
    } else {
      setPhase('session-complete');
    }
  };

  const goToNextExercise = () => {
    setCurrentIndex(prev => prev + 1);
    setPhase('parent-prep');
  };

  const handleSessionComplete = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    const domains = [...new Set(exercises.map(e => e.domain))].join(', ');
    onComplete(exercises.map(e => e.id), Math.max(duration, 1), domains);
  };

  const handleClose = () => {
    audioController.stop();
    onClose();
  };

  const toggleMusic = () => {
    const muted = audioController.toggleMute();
    setMusicMuted(muted);
  };

  // Timer logic
  useEffect(() => {
    if (isPaused || phase === 'parent-prep' || phase === 'exercise-complete' || phase === 'session-complete') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (phase === 'countdown') {
            setPhase('exercise');
            return currentExercise.duration_seconds;
          }
          if (phase === 'exercise') {
            playBeep();
            setTimeout(handleExerciseComplete, 100);
            return 0;
          }
          return 0;
        }
        if (prev <= 4 && phase === 'countdown') playBeep();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, phase, currentExercise, playBeep]);

  // Header bar (shared across phases)
  const HeaderBar = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <Button variant="ghost" size="icon" onClick={handleClose}><X className="w-6 h-6" /></Button>
      <div className="text-center">
        <div className="text-sm text-muted-foreground">Gerakan {currentIndex + 1} dari {exercises.length}</div>
        <Progress value={progress} className="w-32 h-2 mt-1" />
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={toggleMusic}>
          {musicMuted ? <VolumeX className="w-5 h-5" /> : <Music className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );

  // Session Complete screen
  if (phase === 'session-complete') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center animate-scale-in">
          <div className="text-8xl mb-6 animate-bounce-soft">🎉</div>
          <h2 className="text-3xl font-fredoka font-bold text-foreground mb-2">Sesi Selesai!</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Hebat sekali! Kamu sudah berlatih {exercises.length} gerakan!
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Progress telah diperbarui.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1" size="lg">Kembali</Button>
            <Button onClick={handleSessionComplete} className="flex-1" size="lg">
              <CheckCircle className="w-5 h-5" />
              Simpan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Exercise complete (transition to next)
  if (phase === 'exercise-complete') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center animate-scale-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-fredoka font-bold text-foreground mb-2">Bagus!</h2>
          <p className="text-muted-foreground mb-6">
            Gerakan {currentIndex + 1} dari {exercises.length} selesai!
          </p>
          <Button onClick={goToNextExercise} className="w-full" size="lg">
            Gerakan Berikutnya →
          </Button>
        </Card>
      </div>
    );
  }

  // Parent Prep screen
  if (phase === 'parent-prep') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <HeaderBar />

        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <TrainingPlayer
            illustration={currentExercise.illustration}
            animationUrl={currentExercise.animation_url}
            name={currentExercise.name}
            className="mb-4"
          />
          <h2 className="text-2xl font-fredoka font-bold text-foreground mb-2 text-center">{currentExercise.name}</h2>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-4">
            {getDomainLabel(currentExercise.domain)} • {currentExercise.duration_seconds} detik
          </span>

          <Card className="w-full max-w-md p-4 mb-4 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Instruksi Orang Tua:</p>
                <p className="text-sm text-muted-foreground">{currentExercise.parent_instruction}</p>
              </div>
            </div>
          </Card>

          {currentExercise.equipment !== 'none' && (
            <Card className="w-full max-w-md p-3 mb-4 bg-accent/10 border-accent/20">
              <p className="text-sm text-center">
                🧰 Alat: <span className="font-medium">{currentExercise.equipment}</span>
              </p>
            </Card>
          )}

          {currentExercise.safety_note && (
            <Card className="w-full max-w-md p-3 mb-6 bg-muted/50 border-muted">
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ {currentExercise.safety_note}
              </p>
            </Card>
          )}
        </div>

        <div className="p-6 border-t bg-card">
          <Button size="lg" onClick={startExercise} className="w-full text-lg">
            <Play className="w-5 h-5" /> Mulai Gerakan
          </Button>
        </div>
      </div>
    );
  }

  // Countdown & Exercise phase
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <HeaderBar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-bold text-white mb-4",
          phase === 'countdown' ? 'bg-accent text-accent-foreground' : 'bg-primary'
        )}>
          {phase === 'countdown' ? 'Bersiap...' : 'Ayo Gerak!'}
        </div>

        <div className={cn(
          "w-48 h-48 rounded-full flex items-center justify-center mb-6",
          phase === 'countdown' ? 'bg-accent animate-countdown-pulse' : 'bg-primary'
        )}>
          <span className="text-7xl font-fredoka font-bold text-white">{timeLeft}</span>
        </div>

        <TrainingPlayer
          illustration={currentExercise.illustration}
          animationUrl={currentExercise.animation_url}
          name={currentExercise.name}
          isCountdown={phase === 'countdown'}
          className="mb-4"
        />

        <div className="text-center mb-4">
          <h2 className="text-2xl font-fredoka font-bold text-foreground mb-2">{currentExercise.name}</h2>
          {phase === 'exercise' && (
            <p className="text-lg text-primary font-bold">{currentExercise.child_instruction}</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t bg-card">
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => {
            if (currentIndex < exercises.length - 1) {
              setCurrentIndex(prev => prev + 1);
              setPhase('parent-prep');
            } else {
              setPhase('session-complete');
            }
          }} className="w-32">
            <SkipForward className="w-5 h-5" /> Lewati
          </Button>
          <Button size="lg" onClick={() => setIsPaused(!isPaused)} className="w-40">
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            {isPaused ? 'Lanjut' : 'Jeda'}
          </Button>
        </div>
      </div>
    </div>
  );
};
