import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle, UserCheck } from 'lucide-react';

interface SLBSessionControlsProps {
  onNext: () => void;
  onDone: () => void;
  onTeacherOverride: () => void;
  isLastExercise: boolean;
}

export const SLBSessionControls = ({ onNext, onDone, onTeacherOverride, isLastExercise }: SLBSessionControlsProps) => {
  return (
    <div className="p-4 border-t bg-card space-y-3">
      {isLastExercise ? (
        <Button
          onClick={onDone}
          size="xl"
          className="w-full min-h-[64px] text-xl"
          aria-label="Selesai"
        >
          <CheckCircle className="w-6 h-6" />
          Selesai
        </Button>
      ) : (
        <Button
          onClick={onNext}
          size="xl"
          className="w-full min-h-[64px] text-xl"
          aria-label="Lanjut ke gerakan berikutnya"
        >
          <ChevronRight className="w-6 h-6" />
          Lanjut
        </Button>
      )}
      <Button
        onClick={onTeacherOverride}
        variant="secondary"
        size="lg"
        className="w-full min-h-[48px]"
        aria-label="Guru override: lewati gerakan"
      >
        <UserCheck className="w-5 h-5" />
        Guru Override
      </Button>
    </div>
  );
};
