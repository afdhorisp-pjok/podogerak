import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications, markNotificationRead } from '@/lib/ReportService';
import { getPendingConfirmations } from '@/lib/VerificationService';
import { ParentConfirmation } from './ParentConfirmation';
import { format } from 'date-fns';

interface NotificationBellProps {
  userId: string;
  onViewReport?: (reportId: string) => void;
  refreshKey?: number;
}

export const NotificationBell = ({ userId, onViewReport, refreshKey }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [notifs, confs] = await Promise.all([
      getNotifications(userId),
      getPendingConfirmations(userId),
    ]);
    setNotifications(notifs);
    setConfirmations(confs);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleClick = async (notification: any) => {
    await markNotificationRead(notification.id);
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    if (onViewReport && notification.report_id) {
      onViewReport(notification.report_id);
    }
    setOpen(false);
  };

  const totalCount = notifications.length + confirmations.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {totalCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold">Notifikasi</h4>
        </div>
        <ScrollArea className="max-h-80">
          {/* Parent Confirmations */}
          {confirmations.length > 0 && (
            <div className="p-2 space-y-2">
              {confirmations.map(c => (
                <ParentConfirmation
                  key={c.id}
                  confirmation={c}
                  userId={userId}
                  onConfirmed={loadData}
                />
              ))}
            </div>
          )}

          {/* Regular notifications */}
          {notifications.length > 0 && (
            <div>
              {confirmations.length > 0 && <div className="border-t" />}
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-0 transition-colors"
                >
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(n.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </button>
              ))}
            </div>
          )}

          {totalCount === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Tidak ada notifikasi baru
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
