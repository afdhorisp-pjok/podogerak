import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { UserData } from '@/lib/workoutData';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/authService';
import { getWorkoutHistory, calculateStreak } from '@/lib/progressService';

const Index = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    };
    return userData;
  };

  useEffect(() => {
    // Set up auth listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const userData = await loadUserData(session.user.id);
            setUser(userData);
            setIsLoading(false);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await loadUserData(session.user.id);
        setUser(userData);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userData = await loadUserData(session.user.id);
      setUser(userData);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUserUpdate = (updatedUser: UserData) => {
    setUser(updatedUser);
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

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      onUserUpdate={handleUserUpdate}
    />
  );
};

export default Index;
