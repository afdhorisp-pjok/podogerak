import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserData, ExerciseCategory, AVATARS } from '@/lib/workoutData';
import { signOut } from '@/lib/authService';
import { saveWorkoutSession, getWorkoutHistory, calculateStreak, saveProgressEntry } from '@/lib/progressService';
import { getEarnedBadges, getNewlyEarnedBadges, Badge } from '@/lib/badgeData';
import { StatsCard } from './StatsCard';
import { CategoryCard } from './CategoryCard';
import { ParentGuideModal } from './ParentGuideModal';
import { WorkoutTimer } from './WorkoutTimer';
import { HistorySection } from './HistorySection';
import { ScheduleSection } from './ScheduleSection';
import { EducationPage } from './EducationPage';
import { BadgesSection } from './BadgesSection';
import { NewBadgeModal } from './NewBadgeModal';
import { ProgressReport } from './ProgressReport';
import { LogOut, BookOpen, Users, BarChart3 } from 'lucide-react';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (user: UserData) => void;
}

export const Dashboard = ({ user, onLogout, onUserUpdate }: DashboardProps) => {
  const [showParentGuide, setShowParentGuide] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<ExerciseCategory | null>(null);
  const [showEducation, setShowEducation] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(false);
  const [previousBadgeIds, setPreviousBadgeIds] = useState<string[]>(() =>
    getEarnedBadges(user).map(b => b.id)
  );

  const avatar = AVATARS.find(a => a.id === user.avatar);

  // Check for newly earned badges when user data changes
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

  const handleWorkoutComplete = async (exercises: string[], duration: number, category: string) => {
    const session = {
      date: new Date().toISOString().split('T')[0],
      exercises,
      duration,
      completed: true,
    };

    await saveWorkoutSession(user.id, session);

    // Save to user_progress for research
    for (const exerciseId of exercises) {
      await saveProgressEntry({
        user_id: user.id,
        username: user.username,
        date: session.date,
        category,
        activity_name: exerciseId,
        score: 1,
        notes: `Durasi: ${duration} menit`,
      });
    }

    // Reload workout history
    const history = await getWorkoutHistory(user.id);
    const streak = calculateStreak(history);
    onUserUpdate({
      ...user,
      totalSessions: history.length,
      streakDays: streak,
      workoutHistory: history,
      lastActiveDate: session.date,
    });
  };

  if (showEducation) {
    return <EducationPage onBack={() => setShowEducation(false)} />;
  }

  if (showProgressReport) {
    return <ProgressReport user={user} onBack={() => setShowProgressReport(false)} />;
  }

  if (activeWorkout) {
    return (
      <WorkoutTimer
        category={activeWorkout}
        onComplete={handleWorkoutComplete}
        onClose={() => setActiveWorkout(null)}
      />
    );
  }

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
                Siap berolahraga hari ini?
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Stats */}
        <section>
          <h2 className="text-lg font-fredoka font-bold text-foreground mb-4">
            Progressmu 📊
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard icon="🔥" value={user.streakDays} label="Hari Berturut" variant="primary" delay={0} />
            <StatsCard icon="🎯" value={user.totalSessions} label="Total Sesi" variant="secondary" delay={100} />
            <StatsCard icon="⭐" value={`${user.age} thn`} label="Usia Jagoan" variant="accent" delay={200} />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => setShowParentGuide(true)} className="flex-col h-auto py-3 gap-1">
            <Users className="w-5 h-5" />
            <span className="text-xs">Panduan</span>
          </Button>
          <Button variant="outline" onClick={() => setShowEducation(true)} className="flex-col h-auto py-3 gap-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Edukasi</span>
          </Button>
          <Button variant="outline" onClick={() => setShowProgressReport(true)} className="flex-col h-auto py-3 gap-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Laporan</span>
          </Button>
        </section>

        {/* Workout Categories */}
        <section>
          <h2 className="text-lg font-fredoka font-bold text-foreground mb-4">Pilih Latihan 💪</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <CategoryCard category="locomotor" onStart={setActiveWorkout} delay={0} />
            <CategoryCard category="non-locomotor" onStart={setActiveWorkout} delay={100} />
            <CategoryCard category="manipulative" onStart={setActiveWorkout} delay={200} />
          </div>
        </section>

        {/* Badges Section */}
        <BadgesSection user={user} />

        {/* Schedule & History */}
        <div className="grid md:grid-cols-2 gap-6">
          <ScheduleSection user={user} onUpdate={onUserUpdate} />
          <HistorySection user={user} />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">PodoGerak - Dibuat oleh Afdhoris Pradana Putra</p>
          <p className="text-xs text-muted-foreground mt-1">Aplikasi Latihan Motorik Kasar untuk Anak</p>
        </footer>
      </main>

      <ParentGuideModal open={showParentGuide} onClose={() => setShowParentGuide(false)} />
      <NewBadgeModal badges={newBadges} open={showNewBadgeModal} onClose={() => setShowNewBadgeModal(false)} />
    </div>
  );
};
