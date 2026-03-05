import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { UserData } from '@/lib/workoutData';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/authService';
import { getWorkoutHistory, calculateStreak } from '@/lib/progressService';
import { getConsentStatus } from '@/lib/ConsentService';
import { ParentConsentModal } from '@/components/ParentConsentModal';

const Index = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);

  const loadUserData = async (userId: string) => {
    const profile = await getUserProfile(userId);
    if (!profile) return null;

    const history = await getWorkoutHistory(userId);
    const streak = calculateStreak(history);
    const lastDate = history.length > 0 ? history[0].date : '';

    const userData: UserData = {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      avatar: profile.avatar,
      age: profile.age,
      totalSessions: history.length,
      streakDays: streak,
      lastActiveDate: lastDate,
      workoutHistory: history,
      weeklySchedule: profile.weekly_schedule,
      currentWeek: profile.current_week,
      currentLevel: profile.current_level,
      researchMode: profile.research_mode,
    };
    return userData;
  };

  const checkAndSetUser = async (userId: string) => {
    const userData = await loadUserData(userId);
    if (!userData) return;

    const hasConsent = await getConsentStatus(userId);
    setUser(userData);
    setNeedsConsent(!hasConsent);
    setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => checkAndSetUser(session.user.id), 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setNeedsConsent(false);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await checkAndSetUser(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await checkAndSetUser(session.user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce-soft mb-4">🏃‍♂️</div>
          <p className="text-lg text-muted-foreground">Memuat PodoGerak...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show consent modal if not yet consented
  if (needsConsent) {
    return (
      <>
        <Dashboard
          user={user}
          onLogout={() => setUser(null)}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />
        <ParentConsentModal
          open={true}
          userId={user.id}
          onConsented={() => setNeedsConsent(false)}
        />
      </>
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => setUser(null)}
      onUserUpdate={(updatedUser) => setUser(updatedUser)}
    />
  );
};

export default Index;
