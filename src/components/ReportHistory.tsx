import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getReportHistory, logReportAccess } from '@/lib/ReportService';
import { SessionReportCard } from './SessionReportCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportHistoryProps {
  userId: string;
  onBack: () => void;
}

export const ReportHistory = ({ userId, onBack }: ReportHistoryProps) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getReportHistory(userId);
      setReports(data);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleViewReport = async (report: any) => {
    setSelectedReport(report);
    await logReportAccess(userId, report.id, 'view');
  };

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-fredoka font-bold">Detail Laporan</h1>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-6">
          <SessionReportCard report={selectedReport} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-fredoka font-bold">Riwayat Laporan Sesi</h1>
        </div>
      </header>
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada laporan sesi</p>
          </div>
        ) : (
          reports.map(r => (
            <div key={r.id} onClick={() => handleViewReport(r)} className="cursor-pointer">
              <SessionReportCard report={r} compact />
            </div>
          ))
        )}
      </main>
    </div>
  );
};
