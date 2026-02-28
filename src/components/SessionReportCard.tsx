import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle, Clock, Calendar, Activity } from 'lucide-react';

interface SessionReport {
  id: string;
  child_name: string | null;
  session_date: string;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  exercises_summary: any;
  activity_score: number | null;
  verified: boolean;
  created_at: string;
}

interface SessionReportCardProps {
  report: SessionReport;
  compact?: boolean;
}

export const SessionReportCard = ({ report, compact }: SessionReportCardProps) => {
  const exercises = Array.isArray(report.exercises_summary) ? report.exercises_summary : [];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{report.child_name || 'Anak'}</p>
            {report.verified && (
              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(report.session_date), 'dd/MM/yyyy')} • {report.duration_minutes} menit
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Skor: {report.activity_score}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{report.child_name || 'Anak'}</CardTitle>
          {report.verified && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="w-3 h-3 mr-1" /> Terverifikasi
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(report.session_date), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{report.duration_minutes} menit</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>Skor: {report.activity_score}</span>
          </div>
        </div>

        {exercises.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Gerakan:</p>
            <div className="flex flex-wrap gap-1">
              {exercises.map((ex: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {ex.id || ex.name || `Gerakan ${i + 1}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Dibuat: {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm:ss')}
        </p>
      </CardContent>
    </Card>
  );
};
