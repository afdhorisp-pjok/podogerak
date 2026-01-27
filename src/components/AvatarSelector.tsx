import { AVATARS } from '@/lib/workoutData';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export const AvatarSelector = ({ selected, onSelect }: AvatarSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105",
            selected === avatar.id
              ? "border-primary bg-primary/10 shadow-soft"
              : "border-border bg-card hover:border-primary/50"
          )}
        >
          <span className="text-5xl animate-float" style={{ animationDelay: `${AVATARS.indexOf(avatar) * 100}ms` }}>
            {avatar.emoji}
          </span>
          <span className="text-sm font-semibold text-foreground">{avatar.name}</span>
        </button>
      ))}
    </div>
  );
};
