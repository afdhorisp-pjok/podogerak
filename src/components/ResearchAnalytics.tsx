import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, AlertTriangle, BarChart3, TrendingUp, Users, Shield, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  getParticipants, getSessionLogs, exportCSV,
  getConsentRecords, getConsentAuditLogs,
  type Experiment, type ExperimentParticipant, type ExperimentSessionLog,
} from '@/lib/ExperimentService';
import {
  getParticipantsByArm, getWeeklyCompletionRate, getAverageDuration,
  getTeacherFidelityScore, getFollowUpList, generateAggregatedReport,
  exportAggregatedCSV, exportConsentLogsCSV,
} from '@/lib/AnalyticsService';

interface ResearchAnalyticsProps {
  experiment: Experiment;
  onBack: () => void;
}

export const ResearchAnalytics = ({ experiment, onBack }: ResearchAnalyticsProps) => {
  const [participants, setParticipants] = useState<ExperimentParticipant[]>([]);
  const [logs, setLogs] = useState<ExperimentSessionLog[]>([]);
  const [fidelityThreshold, setFidelityThreshold] = useState(3.0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, l] = await Promise.all([
        getParticipants(experiment.id),
        getSessionLogs(experiment.id),
      ]);
      setParticipants(p);
      setLogs(l);

      // Check admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');
        setIsAdmin(!!(data && data.length > 0));
      }
      setLoading(false);
    };
    load();
  }, [experiment.id]);

  const armDistribution = useMemo(() => getParticipantsByArm(participants), [participants]);
  const weeklyRates = useMemo(() => getWeeklyCompletionRate(logs), [logs]);
  const avgDuration = useMemo(() => getAverageDuration(logs), [logs]);
  const fidelityScore = useMemo(() => getTeacherFidelityScore(logs), [logs]);
  const followUpList = useMemo(() => getFollowUpList(participants, logs, { missThreshold: 3, fidelityThreshold }), [participants, logs, fidelityThreshold]);
  const aggregatedReport = useMemo(() => generateAggregatedReport(participants, logs), [participants, logs]);

  const armChartData = Object.entries(armDistribution).map(([arm, count]) => ({ arm, count }));
  const completedSessions = logs.filter(l => l.completion_flag).length;

  const handleExportRaw = () => {
    exportCSV(logs, participants);
    toast.success('Raw CSV diekspor');
  };

  const handleExportAggregated = () => {
    exportAggregatedCSV(aggregatedReport);
    toast.success('Aggregated report diekspor');
  };

  const handleExportConsent = async () => {
    try {
      const [records, auditLogs] = await Promise.all([
        getConsentRecords(),
        getConsentAuditLogs(),
      ]);
      exportConsentLogsCSV(records, auditLogs);
      toast.success('Consent logs diekspor');
    } catch {
      toast.error('Gagal mengekspor consent logs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">Memuat data analitik...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-fredoka font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Analitik Penelitian
            </h1>
            <p className="text-sm text-muted-foreground">{experiment.name}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-fredoka font-bold text-primary">{participants.length}</div>
              <div className="text-xs text-muted-foreground">Total Partisipan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-secondary" />
              <div className="text-2xl font-fredoka font-bold text-secondary">{completedSessions}</div>
              <div className="text-xs text-muted-foreground">Sesi Selesai</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-foreground" />
              <div className="text-2xl font-fredoka font-bold text-foreground">{avgDuration > 0 ? `${avgDuration.toFixed(0)}s` : '—'}</div>
              <div className="text-xs text-muted-foreground">Rata-rata Durasi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-5 h-5 mx-auto mb-1 text-accent-foreground" />
              <div className="text-2xl font-fredoka font-bold text-accent-foreground">{fidelityScore > 0 ? fidelityScore.toFixed(1) : '—'}/5</div>
              <div className="text-xs text-muted-foreground">Fidelity Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi per Arm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={armChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="arm" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completion Rate per Minggu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {weeklyRates.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyRates}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Rate']} />
                      <Line type="monotone" dataKey="rate" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: 'hsl(var(--secondary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Belum ada data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-Up List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Follow-Up List
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Label className="text-xs">Fidelity Threshold:</Label>
              <Input
                type="number" step="0.1" min="0" max="5"
                value={fidelityThreshold}
                onChange={e => setFidelityThreshold(parseFloat(e.target.value) || 0)}
                className="w-20 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {followUpList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Arm</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Missed Weeks</TableHead>
                    <TableHead>Avg Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUpList.map(f => (
                    <TableRow key={f.participant.id}>
                      <TableCell className="font-mono text-sm">{f.participant.allocation_code}</TableCell>
                      <TableCell>{f.participant.arm}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          f.reason === 'both' ? 'bg-destructive/20 text-destructive' :
                          f.reason === 'missed_sessions' ? 'bg-destructive/10 text-destructive' :
                          'bg-accent/20 text-accent-foreground'
                        }`}>
                          {f.reason === 'missed_sessions' ? 'Absen ≥3x' : f.reason === 'low_fidelity' ? 'Low Fidelity' : 'Absen + Low Fidelity'}
                        </span>
                      </TableCell>
                      <TableCell>{f.consecutiveMisses}</TableCell>
                      <TableCell>{f.avgRating !== null ? f.avgRating.toFixed(1) : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ada partisipan yang memerlukan follow-up 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Aggregated Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aggregated Report (Pre/Post Template)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arm</TableHead>
                    <TableHead>N</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>M Duration</TableHead>
                    <TableHead>SD Duration</TableHead>
                    <TableHead>M Rating</TableHead>
                    <TableHead>SD Rating</TableHead>
                    <TableHead>t</TableHead>
                    <TableHead>p</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedReport.map(r => (
                    <TableRow key={r.arm}>
                      <TableCell className="font-medium">{r.arm}</TableCell>
                      <TableCell>{r.n}</TableCell>
                      <TableCell>{r.sessionsCompleted}</TableCell>
                      <TableCell>{r.meanDuration.toFixed(1)}</TableCell>
                      <TableCell>{r.sdDuration.toFixed(1)}</TableCell>
                      <TableCell>{r.meanRating.toFixed(2)}</TableCell>
                      <TableCell>{r.sdRating.toFixed(2)}</TableCell>
                      <TableCell>{r.tStat}</TableCell>
                      <TableCell>{r.pValue}</TableCell>
                    </TableRow>
                  ))}
                  {aggregatedReport.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Export Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-5 h-5" /> Ekspor Data
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportRaw} disabled={logs.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Export Raw CSV
            </Button>
            <Button variant="outline" onClick={handleExportAggregated} disabled={aggregatedReport.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Export Aggregated Report
            </Button>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {isAdmin && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" /> Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={handleExportConsent}>
                <Download className="w-4 h-4 mr-1" /> Download Consent Logs
              </Button>
              <p className="text-xs text-muted-foreground">
                Hanya admin yang dapat mengunduh log persetujuan dan audit.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};
