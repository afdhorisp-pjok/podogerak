import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TrainingPlayerProps {
  illustration: string;
  animationUrl?: string | null;
  name: string;
  isCountdown?: boolean;
  className?: string;
}

export const TrainingPlayer = ({
  illustration,
  animationUrl,
  name,
  isCountdown = false,
  className,
}: TrainingPlayerProps) => {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full flex items-center justify-center rounded-2xl bg-muted/30 border overflow-hidden">
          {animationUrl ? (
            <video
              src={animationUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
              aria-label={name}
            />
          ) : (
            <div
              className={cn(
                'text-[5rem] sm:text-[6rem] transition-transform duration-300',
                isCountdown && 'animate-bounce-soft'
              )}
              role="img"
              aria-label={name}
            >
              {illustration}
            </div>
          )}
        </div>
      </AspectRatio>
    </div>
  );
};

export const TrainingPlayerSkeleton = () => (
  <div className="w-full max-w-md mx-auto">
    <AspectRatio ratio={16 / 9}>
      <Skeleton className="w-full h-full rounded-2xl" />
    </AspectRatio>
  </div>
);
