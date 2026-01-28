import { Badge } from '@/lib/badgeData';
import { UserData } from '@/lib/workoutData';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BadgeCardProps {
  badge: Badge;
  user: UserData;
  isEarned: boolean;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const BadgeCard = ({ 
  badge, 
  user, 
  isEarned, 
  size = 'md',
  showProgress = true 
}: BadgeCardProps) => {
  const progress = badge.progress(user);
  const progressPercent = (progress.current / progress.target) * 100;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const emojiSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300",
        isEarned 
          ? "bg-gradient-to-br from-primary/20 to-secondary/20" 
          : "bg-muted/50"
      )}
    >
      <div 
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          isEarned 
            ? "bg-gradient-to-br from-primary to-secondary shadow-lg animate-bounce-soft" 
            : "bg-muted grayscale opacity-50"
        )}
      >
        <span className={cn(emojiSizes[size], isEarned ? "" : "grayscale")}>
          {badge.emoji}
        </span>
      </div>
      
      <div className="text-center">
        <p className={cn(
          "font-fredoka font-bold text-sm",
          isEarned ? "text-foreground" : "text-muted-foreground"
        )}>
          {badge.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {badge.description}
        </p>
      </div>

      {showProgress && !isEarned && (
        <div className="w-full space-y-1">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress.current}/{progress.target}
          </p>
        </div>
      )}

      {isEarned && (
        <span className="text-xs font-medium text-primary">✓ Tercapai!</span>
      )}
    </div>
  );
};
