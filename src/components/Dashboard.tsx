import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserData, ExerciseCategory, AVATARS } from '@/lib/workoutData';
import { logoutUser } from '@/lib/storage';
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
import { LogOut, BookOpen, Users } from 'lucide-react';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (user: UserData) => void;
}

export const Dashboard = ({ user, onLogout, onUserUpdate }: DashboardProps) => {
  const [showParentGuide, setShowParentGuide] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<ExerciseCategory | null>(null);
  const [showEducation, setShowEducation] = useState(false);
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

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const handleWorkoutComplete = () => {
    setActiveWorkout(null);
    // Refresh user data
    const updatedUser = { ...user, totalSessions: user.totalSessions + 1 };
    onUserUpdate(updatedUser);
  };

  if (showEducation) {
    return <EducationPage onBack={() => setShowEducation(false)} />;
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
            <StatsCard
              icon="🔥"
              value={user.streakDays}
              label="Hari Berturut"
              variant="primary"
              delay={0}
            />
            <StatsCard
              icon="🎯"
              value={user.totalSessions}
              label="Total Sesi"
              variant="secondary"
              delay={100}
            />
            <StatsCard
              icon="⭐"
              value={`${user.age} thn`}
              label="Usia Jagoan"
              variant="accent"
              delay={200}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowParentGuide(true)}
            className="flex-1"
          >
            <Users className="w-4 h-4" />
            Panduan Orang Tua
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEducation(true)}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4" />
            Edukasi
          </Button>
        </section>

        {/* Workout Categories */}
        <section>
          <h2 className="text-lg font-fredoka font-bold text-foreground mb-4">
            Pilih Latihan 💪
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <CategoryCard
              category="locomotor"
              onStart={setActiveWorkout}
              delay={0}
            />
            <CategoryCard
              category="non-locomotor"
              onStart={setActiveWorkout}
              delay={100}
            />
            <CategoryCard
              category="manipulative"
              onStart={setActiveWorkout}
              delay={200}
            />
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
          <p className="text-sm text-muted-foreground">
            PodoGerak - Dibuat oleh Afdhoris Pradana Putra
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Aplikasi Latihan Motorik Kasar untuk Anak
          </p>
        </footer>
      </main>

      {/* Parent Guide Modal */}
      <ParentGuideModal
        open={showParentGuide}
        onClose={() => setShowParentGuide(false)}
      />

      {/* New Badge Modal */}
      <NewBadgeModal
        badges={newBadges}
        open={showNewBadgeModal}
        onClose={() => setShowNewBadgeModal(false)}
      />
    </div>
  );
};
