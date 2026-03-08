import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData, EXERCISES, getDomainLabel, ALL_DOMAINS, ExerciseDomain } from '@/lib/workoutData';
import { getSkillAssessments } from '@/lib/progressService';
import { getDomainExposure, getSummaryStats } from '@/lib/progressUtils';
import { ArrowLeft, Database, BarChart3, Activity, TrendingUp, FlaskConical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExperimentToolkit } from '@/components/ExperimentToolkit';
import { ResearchAnalytics } from '@/components/ResearchAnalytics';
import { getExperiments, type Experiment } from '@/lib/ExperimentService';

interface ResearchDashboardProps {
  user: UserData;
  onBack: () => void;
}

export const ResearchDashboard = ({ user, onBack }: ResearchDashboardProps) => {
  const [showToolkit, setShowToolkit] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<Experiment | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [data, exps] = await Promise.all([
        getSkillAssessments(user.id),
        getExperiments(),
      ]);
      setAssessments(data);
      setExperiments(exps);
    };
    load();
  }, [user.id]);

  const stats = getSummaryStats(user);
  const exposure = getDomainExposure(user);

  // Calculate adherence
  const uniqueWeeks = new Set(user.workoutHistory.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
  }));
  const weeksActive = Math.max(uniqueWeeks.size, 1);
  const sessionsPerWeek = (user.totalSessions / weeksActive).toFixed(1);

  // Exposure chart data
  const exposureData = ALL_DOMAINS.map(d => ({
    name: getDomainLabel(d),
    value: exposure[d],
  }));

  // Session timeline data (last 14 days)
  const timelineData: { date: string; sessions: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = user.workoutHistory.filter(s => s.date === dateStr).length;
    timelineData.push({ date: dateStr.slice(5), sessions: count });
  }

  // Assessment summary
  const latestRatings: Record<string, { rating: number; date: string }> = {};
  for (const a of assessments) {
    if (!latestRatings[a.skill_id] || a.assessed_at > latestRatings[a.skill_id].date) {
      latestRatings[a.skill_id] = { rating: a.rating, date: a.assessed_at };
    }
  }
  const avgRating = Object.values(latestRatings).length > 0
    ? (Object.values(latestRatings).reduce((s, r) => s + r.rating, 0) / Object.values(latestRatings).length).toFixed(1)
    : '—';

  if (showAnalytics) {
    return <ResearchAnalytics experiment={showAnalytics} onBack={() => setShowAnalytics(null)} />;
  }

  if (showToolkit) {
    return <ExperimentToolkit onBack={() => setShowToolkit(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-fredoka font-bold text-foreground flex items-center gap-2">
              <Database className="w-5 h-5" /> Research Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">{user.username} • ID: {user.id.slice(0, 8)}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setShowToolkit(true)}>
            <FlaskConical className="w-4 h-4 mr-1" /> Experiment Toolkit
          </Button>
          {experiments.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowAnalytics(experiments[0])}>
              <TrendingUp className="w-4 h-4 mr-1" /> Analitik
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-fredoka font-bold text-primary">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sesi</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-fredoka font-bold text-secondary">{sessionsPerWeek}</div>
            <div className="text-xs text-muted-foreground">Sesi/Minggu</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-fredoka font-bold text-foreground">Minggu {user.currentWeek}</div>
            <div className="text-xs text-muted-foreground">Kurikulum</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-fredoka font-bold text-accent-foreground">{avgRating}</div>
            <div className="text-xs text-muted-foreground">Rata-rata TGMD-3</div>
          </CardContent></Card>
        </div>

        {/* Session Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Session Timeline (14 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v} sesi`, 'Sesi']}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Domain Exposure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Domain Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Ratings */}
        {Object.keys(latestRatings).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
                Skill Ratings (Latest)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(latestRatings).map(([skillId, data]) => {
                  const ex = EXERCISES.find(e => e.id === skillId);
                  return (
                    <div key={skillId} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ex?.illustration}</span>
                        <span className="text-sm font-medium">{ex?.name || skillId}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{data.rating}/3</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Note */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Data tersimpan di database dan dapat diekspor untuk analisis penelitian melalui Lovable Cloud.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
