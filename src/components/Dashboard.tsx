import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserData, AVATARS } from '@/lib/workoutData';
import { signOut } from '@/lib/authService';
import { saveWorkoutSession, getWorkoutHistory, calculateStreak, saveProgressEntry, toggleResearchMode, updateCurriculumProgress } from '@/lib/progressService';
import { getEarnedBadges, getNewlyEarnedBadges, Badge } from '@/lib/badgeData';
import { getCurriculumWeek } from '@/lib/curriculumData';
import { generateSessionMovements, Movement } from '@/lib/MovementService';
import { getWeeklySessionsRemaining, startSession, completeSession, cancelSession } from '@/lib/SessionService';
import { StatsCard } from './StatsCard';
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
import { NotificationBell } from './NotificationBell';
import { ReportHistory } from './ReportHistory';
import { AccessibilitySettings } from './AccessibilitySettings';
import { SLBToggle } from './SLBToggle';
import { DataRetentionSettings } from './DataRetentionSettings';
import { ChildAssent } from './ChildAssent';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, BookOpen, Users, BarChart3, ClipboardList, Database, ChevronRight, AlertCircle, FileText, Accessibility, Shield } from 'lucide-react';
import { useSLB } from '@/contexts/SLBContext';
import { generateReport } from '@/lib/ReportService';
import { getActiveSessionId } from '@/lib/SessionService';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { logConsentAudit } from '@/lib/ConsentService';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (user: UserData) => void;
}

export const Dashboard = ({ user, onLogout, onUserUpdate }: DashboardProps) => {
  const [showParentGuide, setShowParentGuide] = useState(false);
  const [activeSession, setActiveSession] = useState<Movement[] | null>(null);
  const [showEducation, setShowEducation] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [showReportHistory, setShowReportHistory] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showDataRetention, setShowDataRetention] = useState(false);
  const [showChildAssent, setShowChildAssent] = useState(false);
  const [childAssented, setChildAssented] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(false);
  const [previousBadgeIds, setPreviousBadgeIds] = useState<string[]>(() =>
    getEarnedBadges(user).map(b => b.id)
  );
  const [sessionsRemaining, setSessionsRemaining] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const { toast } = useToast();
  const { slbEnabled } = useSLB();

  const avatar = AVATARS.find(a => a.id === user.avatar);
  const curriculumWeek = getCurriculumWeek(user.currentWeek);

  // Load remaining sessions
  useEffect(() => {
    getWeeklySessionsRemaining(user.id).then(setSessionsRemaining);
  }, [user.id, user.totalSessions]);

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

  const handleStartSession = async () => {
    // Check child assent before first session
    if (!childAssented && user.totalSessions === 0) {
      setShowChildAssent(true);
      return;
    }
    setIsStarting(true);
    try {
      // Backend validates eligibility
      await startSession(user.id);
      const exercises = await generateSessionMovements(user.currentWeek);
      setActiveSession(exercises);
    } catch (err: any) {
      if (err.message === 'WEEKLY_LIMIT') {
        toast({
          title: 'Batas sesi tercapai',
          description: 'Kamu sudah menyelesaikan 3 sesi minggu ini. Coba lagi minggu depan!',
          variant: 'destructive',
        });
        setSessionsRemaining(0);
      } else if (err.message === 'ACTIVE_EXISTS') {
        toast({
          title: 'Sesi aktif',
          description: 'Ada sesi yang masih berjalan. Silakan selesaikan dulu.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Gagal memulai sesi',
          description: err.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleWorkoutComplete = async (exerciseIds: string[], duration: number, domain: string) => {
    // Capture session ID before completing
    const completedSessionId = getActiveSessionId();

    // Complete session in backend
    await completeSession();

    const session = {
      date: new Date().toISOString().split('T')[0],
      exercises: exerciseIds,
      duration,
      completed: true,
    };

    await saveWorkoutSession(user.id, session);

    for (const exerciseId of exerciseIds) {
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

    // Refresh remaining sessions
    getWeeklySessionsRemaining(user.id).then(setSessionsRemaining);

    // Generate session report (fire-and-forget with retry)
    if (completedSessionId) {
      generateReport(completedSessionId, user.id, user.username, exerciseIds, duration, domain)
        .then(() => setReportRefreshKey(k => k + 1))
        .catch(err => console.error('Report generation failed:', err));
    }

    setActiveSession(null);
  };

  const handleSessionClose = async () => {
    await cancelSession();
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
  if (showDataRetention) return <DataRetentionSettings userId={user.id} childName={user.username} onBack={() => setShowDataRetention(false)} />;
  if (showChildAssent) return (
    <ChildAssent
      userId={user.id}
      childName={user.username}
      onAssent={() => { setChildAssented(true); setShowChildAssent(false); }}
      onDecline={() => setShowChildAssent(false)}
    />
  );
  if (showReportHistory) return <ReportHistory userId={user.id} onBack={() => setShowReportHistory(false)} />;
  if (showAccessibility) return <AccessibilitySettings onBack={() => setShowAccessibility(false)} />;
  if (activeSession) {
    return (
      <SessionRunner
        exercises={activeSession}
        onComplete={handleWorkoutComplete}
        onClose={handleSessionClose}
      />
    );
  }

  const isBlocked = sessionsRemaining === 0;

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
          <div className="flex items-center gap-1">
            <SLBToggle />
            <NotificationBell userId={user.id} refreshKey={reportRefreshKey} />
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Keluar">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
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
          {isBlocked ? (
            <div className="w-full p-4 rounded-xl border-2 border-destructive/30 bg-destructive/5 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-bold text-destructive">Batas sesi minggu ini tercapai</p>
              <p className="text-xs text-muted-foreground mt-1">Kamu sudah menyelesaikan 3 sesi. Coba lagi minggu depan!</p>
            </div>
          ) : (
            <Button
              onClick={handleStartSession}
              size="lg"
              disabled={isStarting || isBlocked}
              className="w-full text-lg h-16 shadow-button animate-pulse-glow"
            >
              {isStarting ? 'Memulai...' : '▶️ Mulai Sesi Latihan'}
            </Button>
          )}
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              4 gerakan • Maks 3 menit
            </p>
            {sessionsRemaining !== null && (
              <span className="text-xs font-medium text-primary">
                • {sessionsRemaining}/3 sesi tersisa minggu ini
              </span>
            )}
            {sessionsRemaining === null && (
              <Skeleton className="h-4 w-24 inline-block" />
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className={`grid ${slbEnabled ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'} gap-3`}>
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
          <Button variant="outline" onClick={() => setShowReportHistory(true)} className="flex-col h-auto py-3 gap-1">
            <FileText className="w-5 h-5" />
            <span className="text-xs">Riwayat</span>
          </Button>
          <Button variant="outline" onClick={() => setShowAccessibility(true)} className="flex-col h-auto py-3 gap-1">
            <Accessibility className="w-5 h-5" />
            <span className="text-xs">Aksesibilitas</span>
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
