import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/lib/badgeData';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface NewBadgeModalProps {
  badges: Badge[];
  open: boolean;
  onClose: () => void;
}

export const NewBadgeModal = ({ badges, open, onClose }: NewBadgeModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open && badges.length > 0) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B35', '#14B8A6', '#FFD700', '#FF69B4'],
      });
    }
  }, [open, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [badges]);

  if (badges.length === 0) return null;

  const currentBadge = badges[currentIndex];
  const hasMore = currentIndex < badges.length - 1;

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center font-fredoka text-2xl">
            🎉 Badge Baru! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          <div 
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary to-secondary shadow-xl",
              "animate-bounce-soft"
            )}
          >
            <span className="text-6xl">{currentBadge.emoji}</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-fredoka font-bold text-foreground">
              {currentBadge.name}
            </h3>
            <p className="text-muted-foreground">
              {currentBadge.description}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-primary/10 rounded-full">
              {currentIndex + 1} dari {badges.length}
            </span>
          </div>
        </div>

        <Button 
          onClick={handleNext}
          className="w-full font-fredoka text-lg"
          size="lg"
        >
          {hasMore ? 'Badge Berikutnya →' : 'Keren! 🎊'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
