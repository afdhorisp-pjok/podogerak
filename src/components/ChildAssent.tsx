import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { narrationService } from '@/lib/NarrationService';
import { logConsentAudit } from '@/lib/ConsentService';
import { useSLB } from '@/contexts/SLBContext';

interface ChildAssentProps {
  userId: string;
  childName: string;
  onAssent: () => void;
  onDecline: () => void;
}

export const ChildAssent = ({ userId, childName, onAssent, onDecline }: ChildAssentProps) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const { narrationEnabled, speechRate } = useSLB();

  useEffect(() => {
    if (narrationEnabled) {
      narrationService.speak(
        `Hai ${childName}! Kita akan bermain dan belajar gerak bersama! Mau ikut?`,
        speechRate
      );
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAssent = async () => {
    await logConsentAudit(userId, 'child_assent', { child_name: childName });
    narrationService.stop();
    onAssent();
  };

  const handleDecline = () => {
    narrationService.stop();
    onDecline();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center animate-scale-in">
        <div className="text-8xl mb-6 animate-bounce-soft">🤸‍♂️</div>

        <h2 className="text-2xl font-fredoka font-bold text-foreground mb-4">
          Hai, {childName}! 👋
        </h2>

        <p className="text-lg text-muted-foreground mb-2 leading-relaxed" aria-live="polite">
          Kita akan bermain dan belajar gerak bersama!
        </p>
        <p className="text-xl font-bold text-primary mb-8">
          Mau ikut? 🎯
        </p>

        {timeLeft > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            ⏱️ Dengarkan dulu ya... ({timeLeft} detik)
          </p>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDecline}
            className="flex-1 h-16 text-lg"
          >
            Tidak sekarang 😊
          </Button>
          <Button
            size="lg"
            onClick={handleAssent}
            disabled={timeLeft > 25}
            className="flex-1 h-16 text-lg"
          >
            Mau! 🎉
          </Button>
        </div>
      </Card>
    </div>
  );
};
