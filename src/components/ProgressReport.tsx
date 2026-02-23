import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData, AVATARS } from '@/lib/workoutData';
import {
  getDailyProgress,
  getWeeklyProgress,
  getCategoryDistribution,
  getSummaryStats,
  getDomainExposure,
} from '@/lib/progressUtils';
import { calculateAdherence } from '@/lib/progressService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { ArrowLeft, Calendar, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface ProgressReportProps {
  user: UserData;
  onBack: () => void;
}

export const ProgressReport = ({ user, onBack }: ProgressReportProps) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const avatar = AVATARS.find(a => a.id === user.avatar);
  const dailyData = getDailyProgress(user, 7);
  const weeklyData = getWeeklyProgress(user, 4);
  const categoryData = getCategoryDistribution(user);
  const stats = getSummaryStats(user);
  const adherence = calculateAdherence(user.workoutHistory, Math.max(user.currentWeek, 1));
  const exposure = getDomainExposure(user);

  const chartData = period === 'weekly' ? dailyData : weeklyData;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
              {avatar?.emoji}
            </div>
            <div>
              <h1 className="text-lg font-fredoka font-bold text-foreground">Laporan Perkembangan</h1>
              <p className="text-sm text-muted-foreground">{user.username} • Minggu {user.currentWeek}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-primary">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Total Sesi</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-secondary-foreground">{adherence.sessionsPerWeek}</div>
              <div className="text-sm text-muted-foreground">Sesi/Minggu</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/20 to-accent/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-foreground">{Math.round(adherence.rate)}%</div>
              <div className="text-sm text-muted-foreground">Adherence</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/20 to-destructive/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-foreground">🔥 {stats.streakDays}</div>
              <div className="text-sm text-muted-foreground">Hari Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <Button variant={period === 'weekly' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('weekly')} className="rounded-md">
              <Calendar className="w-4 h-4 mr-2" /> Mingguan
            </Button>
            <Button variant={period === 'monthly' ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod('monthly')} className="rounded-md">
              <TrendingUp className="w-4 h-4 mr-2" /> Bulanan
            </Button>
          </div>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" /> Aktivitas Latihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value} sesi`, 'Latihan']}
                  />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Domain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5 text-accent" /> Distribusi Domain Motorik
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [`${value} gerakan`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-4xl mb-2">📊</p>
                  <p>Belum ada data latihan</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {period === 'monthly' && weeklyData.some(w => w.locomotor + w.jumping + w.balance + w.ballSkills + w.combined > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Perkembangan per Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="locomotor" name="Lokomotor" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="jumping" name="Lompat" stroke="hsl(var(--jumping))" strokeWidth={2} />
                    <Line type="monotone" dataKey="balance" name="Keseimbangan" stroke="hsl(var(--balance))" strokeWidth={2} />
                    <Line type="monotone" dataKey="ballSkills" name="Bola" stroke="hsl(var(--ball-skills))" strokeWidth={2} />
                    <Line type="monotone" dataKey="combined" name="Gabungan" stroke="hsl(var(--combined))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">💡 Rekomendasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-medium text-foreground">Frekuensi Optimal</p>
                <p className="text-sm text-muted-foreground">3-4 sesi per minggu adalah frekuensi yang direkomendasikan untuk perkembangan motorik optimal.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌈</span>
              <div>
                <p className="font-medium text-foreground">Variasi Domain</p>
                <p className="text-sm text-muted-foreground">Pastikan anak terpapar semua domain motorik untuk perkembangan yang seimbang.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">PodoGerak — Laporan Perkembangan {user.username}</p>
        </footer>
      </main>
    </div>
  );
};
