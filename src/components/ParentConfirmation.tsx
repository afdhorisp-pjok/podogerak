import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { confirmParentReport } from '@/lib/VerificationService';
import { CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ParentConfirmationProps {
  confirmation: {
    id: string;
    child_name: string;
    session_date: string;
    confirmed: boolean;
  };
  userId: string;
  onConfirmed: () => void;
}

export const ParentConfirmation = ({ confirmation, userId, onConfirmed }: ParentConfirmationProps) => {
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmParentReport(confirmation.id, userId);
      toast({ title: 'Konfirmasi berhasil ✓' });
      onConfirmed();
    } catch (err: any) {
      toast({ title: 'Gagal konfirmasi', description: err.message, variant: 'destructive' });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Card className="p-3 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Anak Anda ({confirmation.child_name}) telah menyelesaikan sesi latihan.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(confirmation.session_date), 'dd/MM/yyyy HH:mm')}
          </p>
          <Button
            size="sm"
            className="mt-2"
            onClick={handleConfirm}
            disabled={confirming}
          >
            <CheckCircle className="w-3 h-3" />
            {confirming ? 'Mengkonfirmasi...' : 'Ya, Benar ✓'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
