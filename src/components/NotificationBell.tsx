import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications, markNotificationRead } from '@/lib/ReportService';
import { format } from 'date-fns';

interface NotificationBellProps {
  userId: string;
  onViewReport?: (reportId: string) => void;
  refreshKey?: number;
}

export const NotificationBell = ({ userId, onViewReport, refreshKey }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    const data = await getNotifications(userId);
    setNotifications(data);
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, refreshKey]);

  const handleClick = async (notification: any) => {
    await markNotificationRead(notification.id);
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    if (onViewReport && notification.report_id) {
      onViewReport(notification.report_id);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold">Notifikasi</h4>
        </div>
        <ScrollArea className="max-h-64">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Tidak ada notifikasi baru
            </p>
          ) : (
            notifications.map(n => (
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
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
