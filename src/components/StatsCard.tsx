import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  delay?: number;
}

export const StatsCard = ({ icon, value, label, variant = 'primary', delay = 0 }: StatsCardProps) => {
  const bgClasses = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    accent: 'bg-accent/20',
  };

  const iconBgClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
  };

  return (
    <Card 
      className={cn(
        "p-4 border-0 animate-slide-up opacity-0",
        bgClasses[variant]
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
          iconBgClasses[variant]
        )}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold font-fredoka text-foreground">
            {value}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
};
