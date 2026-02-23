import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserData, ExerciseDomain, AVATARS, getExercisesForWeek } from '@/lib/workoutData';
import { signOut } from '@/lib/authService';
import { saveWorkoutSession, getWorkoutHistory, calculateStreak, saveProgressEntry, toggleResearchMode, updateCurriculumProgress } from '@/lib/progressService';
import { getEarnedBadges, getNewlyEarnedBadges, Badge } from '@/lib/badgeData';
import { generateSessionExercises, getCurriculumWeek } from '@/lib/curriculumData';
import { StatsCard } from './StatsCard';
import { CategoryCard } from './CategoryCard';
import { ParentGuideModal } from './ParentGuideModal';
import { SessionRunner } from './SessionRunner';
import { HistorySection } from './HistorySection';
import { ScheduleSection } from './ScheduleSection';
import { EducationPage } from './EducationPage';
import { BadgesSection } from './BadgesSection';
import { NewBadgeModal } from './NewBadgeModal';
import { ProgressReport } from './ProgressReport';
import { CurriculumProgress } from './CurriculumProgress';
import { AssessmentModule } from './AssessmentModule';
import { ResearchDashboard } from './ResearchDashboard';
import { LogOut, BookOpen, Users, BarChart3, ClipboardList, Database, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (user: UserData) => void;
}

export const Dashboard = ({ user, onLogout, onUserUpdate }: DashboardProps) => {
  const [showParentGuide, setShowParentGuide] = useState(false);
  const [activeSession, setActiveSession] = useState<ReturnType<typeof generateSessionExercises> | null>(null);
  const [showEducation, setShowEducation] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(false);
  const [previousBadgeIds, setPreviousBadgeIds] = useState<string[]>(() =>
    getEarnedBadges(user).map(b => b.id)
  );

  const avatar = AVATARS.find(a => a.id === user.avatar);
  const curriculumWeek = getCurriculumWeek(user.currentWeek);

  useEffect(() => {
    const newlyEarned = getNewlyEarnedBadges(previousBadgeIds, user);
    if (newlyEarned.length > 0) {
      setNewBadges(newlyEarned);
      setShowNewBadgeModal(true);
      setPreviousBadgeIds(getEarnedBadges(user).map(b => b.id));
    }
  }, [user.totalSessions, user.streakDays, user.workoutHistory.length]);

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const handleStartSession = () => {
    const exercises = generateSessionExercises(user.currentWeek);
    setActiveSession(exercises);
  };

  const handleWorkoutComplete = async (exercises: string[], duration: number, domain: string) => {
    const session = {
      date: new Date().toISOString().split('T')[0],
      exercises,
      duration,
      completed: true,
    };

    await saveWorkoutSession(user.id, session);

    for (const exerciseId of exercises) {
      await saveProgressEntry({
        user_id: user.id,
        username: user.username,
        date: session.date,
        category: domain,
        activity_name: exerciseId,
        score: 1,
        notes: `Minggu ${user.currentWeek}, Durasi: ${duration} menit`,
      });
    }

    // Auto-advance week after every 3 sessions in current week
    const history = await getWorkoutHistory(user.id);
    const streak = calculateStreak(history);
    const sessionsThisWeek = history.filter(s => {
      const d = new Date(s.date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      return d >= weekStart;
    }).length;

    let newWeek = user.currentWeek;
    if (sessionsThisWeek >= 3 && user.currentWeek < 8) {
      newWeek = user.currentWeek + 1;
      await updateCurriculumProgress(user.id, newWeek, user.currentLevel);
    }

    onUserUpdate({
      ...user,
      totalSessions: history.length,
      streakDays: streak,
      workoutHistory: history,
      lastActiveDate: session.date,
      currentWeek: newWeek,
    });

    setActiveSession(null);
  };

  const handleToggleResearch = async (enabled: boolean) => {
    await toggleResearchMode(user.id, enabled);
    onUserUpdate({ ...user, researchMode: enabled });
  };

  if (showEducation) return <EducationPage onBack={() => setShowEducation(false)} />;
  if (showProgressReport) return <ProgressReport user={user} onBack={() => setShowProgressReport(false)} />;
  if (showAssessment) return <AssessmentModule userId={user.id} onBack={() => setShowAssessment(false)} />;
  if (showResearch) return <ResearchDashboard user={user} onBack={() => setShowResearch(false)} />;
  if (activeSession) {
    return (
      <SessionRunner
        exercises={activeSession}
        onComplete={handleWorkoutComplete}
        onClose={() => setActiveSession(null)}
      />
    );
  }

  const availableExercises = getExercisesForWeek(user.currentWeek);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
              {avatar?.emoji}
            </div>
            <div>
              <h1 className="text-lg font-fredoka font-bold text-foreground">
                Halo, {user.username}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Minggu {user.currentWeek} • {curriculumWeek.phaseLabel}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Curriculum Progress */}
        <CurriculumProgress currentWeek={user.currentWeek} totalSessions={user.totalSessions} />

        {/* Stats */}
        <section>
          <h2 className="text-lg font-fredoka font-bold text-foreground mb-4">Progressmu 📊</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard icon="🔥" value={user.streakDays} label="Hari Berturut" variant="primary" delay={0} />
            <StatsCard icon="🎯" value={user.totalSessions} label="Total Sesi" variant="secondary" delay={100} />
            <StatsCard icon="📅" value={`W${user.currentWeek}`} label="Minggu Ke" variant="accent" delay={200} />
          </div>
        </section>

        {/* Start Session Button */}
        <section>
          <Button onClick={handleStartSession} size="lg" className="w-full text-lg h-16 shadow-button animate-pulse-glow">
            ▶️ Mulai Sesi Latihan ({availableExercises.length} gerakan tersedia)
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            4 gerakan • Maks 3 menit • Dipilih otomatis dari kurikulum
          </p>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => setShowParentGuide(true)} className="flex-col h-auto py-3 gap-1">
            <Users className="w-5 h-5" />
            <span className="text-xs">Panduan</span>
          </Button>
          <Button variant="outline" onClick={() => setShowEducation(true)} className="flex-col h-auto py-3 gap-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Edukasi</span>
          </Button>
          <Button variant="outline" onClick={() => setShowAssessment(true)} className="flex-col h-auto py-3 gap-1">
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs">Penilaian</span>
          </Button>
          <Button variant="outline" onClick={() => setShowProgressReport(true)} className="flex-col h-auto py-3 gap-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Laporan</span>
          </Button>
        </section>

        {/* Research Mode Toggle */}
        <section className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Research Mode</p>
              <p className="text-xs text-muted-foreground">Aktifkan untuk tracking data riset</p>
            </div>
          </div>
          <Switch checked={user.researchMode} onCheckedChange={handleToggleResearch} />
        </section>

        {user.researchMode && (
          <Button variant="outline" onClick={() => setShowResearch(true)} className="w-full">
            <Database className="w-4 h-4" /> Buka Research Dashboard <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Badges Section */}
        <BadgesSection user={user} />

        {/* Schedule & History */}
        <div className="grid md:grid-cols-2 gap-6">
          <ScheduleSection user={user} onUpdate={onUserUpdate} />
          <HistorySection user={user} />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">PodoGerak - Platform Intervensi Motorik Digital</p>
          <p className="text-xs text-muted-foreground mt-1">TGMD-3 Aligned • Anak Usia 4-7 Tahun</p>
          <p className="text-xs text-muted-foreground mt-1">Dibuat oleh Afdhoris Pradana Putra</p>
        </footer>
      </main>

      <ParentGuideModal open={showParentGuide} onClose={() => setShowParentGuide(false)} />
      <NewBadgeModal badges={newBadges} open={showNewBadgeModal} onClose={() => setShowNewBadgeModal(false)} />
    </div>
  );
};
