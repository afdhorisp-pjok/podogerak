import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { UserData } from '@/lib/workoutData';
import { getUser, saveUser } from '@/lib/storage';

const Index = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newUser: UserData) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUserUpdate = (updatedUser: UserData) => {
    setUser(updatedUser);
    saveUser(updatedUser);
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
