import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserData, AVATARS } from '@/lib/workoutData';
import {
  getDailyProgress,
  getWeeklyProgress,
  getCategoryDistribution,
  getSummaryStats,
} from '@/lib/progressUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
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

  const chartData = period === 'weekly' ? dailyData : weeklyData;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
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
              <h1 className="text-lg font-fredoka font-bold text-foreground">
                Laporan Perkembangan
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.username}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-primary">
                {stats.totalSessions}
              </div>
              <div className="text-sm text-muted-foreground">Total Sesi</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-secondary-foreground">
                {stats.totalDuration}
              </div>
              <div className="text-sm text-muted-foreground">Total Menit</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/20 to-accent/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-foreground">
                {stats.totalExercises}
              </div>
              <div className="text-sm text-muted-foreground">Total Gerakan</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/20 to-destructive/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-fredoka font-bold text-foreground">
                🔥 {stats.streakDays}
              </div>
              <div className="text-sm text-muted-foreground">Hari Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <Button
              variant={period === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('weekly')}
              className="rounded-md"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Mingguan
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('monthly')}
              className="rounded-md"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Bulanan
            </Button>
          </div>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Aktivitas Latihan
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
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} sesi`, 'Latihan']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorSessions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Duration Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              ⏱️ Durasi Latihan (menit)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} menit`, 'Durasi']}
                  />
                  <Bar
                    dataKey="duration"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5 text-accent" />
              Distribusi Kategori Latihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
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
                  <p className="text-sm">Mulai berlatih untuk melihat statistik!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown (Monthly only) */}
        {period === 'monthly' && weeklyData.some(w => w.locomotor + w.nonLocomotor + w.manipulative > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                📈 Perkembangan per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="locomotor"
                      name="Lokomotor"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nonLocomotor"
                      name="Non-Lokomotor"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="manipulative"
                      name="Manipulatif"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--accent))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips for Parents */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              💡 Tips untuk Orang Tua
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-medium text-foreground">Konsistensi Lebih Penting</p>
                <p className="text-sm text-muted-foreground">
                  Latihan rutin 15-20 menit setiap hari lebih baik dari sesi panjang sesekali.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌈</span>
              <div>
                <p className="font-medium text-foreground">Variasi Kategori</p>
                <p className="text-sm text-muted-foreground">
                  Pastikan anak mencoba semua kategori untuk perkembangan motorik yang seimbang.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⭐</span>
              <div>
                <p className="font-medium text-foreground">Rayakan Pencapaian</p>
                <p className="text-sm text-muted-foreground">
                  Berikan pujian dan apresiasi untuk setiap usaha anak, bukan hanya hasil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">
            PodoGerak - Laporan Perkembangan {user.username}
          </p>
        </footer>
      </main>
    </div>
  );
};
