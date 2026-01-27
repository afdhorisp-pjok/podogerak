import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseCategory, getCategoryLabel, getCategoryDescription, getExercisesByCategory } from '@/lib/workoutData';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface CategoryCardProps {
  category: ExerciseCategory;
  onStart: (category: ExerciseCategory) => void;
  delay?: number;
}

export const CategoryCard = ({ category, onStart, delay = 0 }: CategoryCardProps) => {
  const exercises = getExercisesByCategory(category);
  
  const categoryStyles = {
    'locomotor': {
      bg: 'bg-primary/5 hover:bg-primary/10',
      border: 'border-primary/20',
      badge: 'category-locomotor',
      icon: '🏃',
    },
    'non-locomotor': {
      bg: 'bg-secondary/5 hover:bg-secondary/10',
      border: 'border-secondary/20',
      badge: 'category-non-locomotor',
      icon: '🧘',
    },
    'manipulative': {
      bg: 'bg-manipulative/5 hover:bg-manipulative/10',
      border: 'border-manipulative/20',
      badge: 'category-manipulative',
      icon: '🎾',
    },
  };

  const style = categoryStyles[category];

  return (
    <Card 
      className={cn(
        "border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer animate-slide-up opacity-0",
        style.bg,
        style.border
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
      onClick={() => onStart(category)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="text-4xl animate-wiggle" style={{ animationDelay: `${delay + 200}ms` }}>
            {style.icon}
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            style.badge
          )}>
            {exercises.length} Gerakan
          </span>
        </div>
        <CardTitle className="text-xl mt-2">
          {getCategoryLabel(category)}
        </CardTitle>
        <CardDescription className="text-sm">
          {getCategoryDescription(category)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {exercises.slice(0, 3).map((ex) => (
            <span 
              key={ex.id}
              className="text-xs bg-background/80 px-2 py-1 rounded-lg"
            >
              {ex.illustration} {ex.name}
            </span>
          ))}
          {exercises.length > 3 && (
            <span className="text-xs text-muted-foreground px-2 py-1">
              +{exercises.length - 3} lagi
            </span>
          )}
        </div>
        <Button 
          variant={category === 'locomotor' ? 'default' : category === 'non-locomotor' ? 'secondary' : 'default'}
          className={cn(
            "w-full",
            category === 'manipulative' && 'bg-manipulative hover:bg-manipulative/90'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onStart(category);
          }}
        >
          <Play className="w-4 h-4" />
          Mulai Latihan
        </Button>
      </CardContent>
    </Card>
  );
};
