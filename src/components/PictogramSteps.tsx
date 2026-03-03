import { cn } from '@/lib/utils';

interface PictogramStepsProps {
  instruction: string;
  currentStep: number;
  illustration?: string | null;
}

const STEP_ICONS = ['🦶', '🏃', '💪', '🙌', '🎯', '✅'];

function splitIntoSteps(instruction: string): string[] {
  // Split by common delimiters
  const steps = instruction
    .split(/[.,;!]\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return steps.length > 0 ? steps : [instruction];
}

export const PictogramSteps = ({ instruction, currentStep, illustration }: PictogramStepsProps) => {
  const steps = splitIntoSteps(instruction);

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-none"
      role="list"
      aria-label="Langkah-langkah gerakan"
    >
      {steps.map((step, i) => (
        <div
          key={i}
          role="listitem"
          aria-current={i === currentStep ? 'step' : undefined}
          className={cn(
            'flex-shrink-0 flex flex-col items-center justify-center rounded-xl p-3 min-w-[80px] max-w-[100px] border-2 transition-all',
            i === currentStep
              ? 'border-primary bg-primary/10 scale-105 shadow-soft'
              : i < currentStep
              ? 'border-muted bg-muted/50 opacity-60'
              : 'border-border bg-card'
          )}
        >
          <span className="text-2xl mb-1">{STEP_ICONS[i % STEP_ICONS.length]}</span>
          <span className="text-[10px] text-center font-medium leading-tight line-clamp-2">
            {step.length > 20 ? step.slice(0, 18) + '…' : step}
          </span>
        </div>
      ))}
    </div>
  );
};
