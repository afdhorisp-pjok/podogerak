import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarSelector } from './AvatarSelector';
import { createUser } from '@/lib/storage';
import { UserData } from '@/lib/workoutData';

interface LoginFormProps {
  onLogin: (user: UserData) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('astronaut');
  const [age, setAge] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (!username.trim() || !age) return;
    const user = createUser(username.trim(), avatar, parseInt(age));
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4 animate-bounce-soft">🏃‍♂️</div>
          <h1 className="text-4xl font-fredoka font-bold text-foreground mb-2">
            PodoGerak
          </h1>
          <p className="text-muted-foreground text-lg">
            Yuk berolahraga bersama! 💪
          </p>
        </div>

        <Card className="animate-scale-in shadow-card border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 1 ? 'Siapa nama jagoan kita?' : 'Pilih avatarmu!'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Masukkan nama dan usia anak' 
                : 'Pilih karakter favoritmu untuk petualangan olahraga!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base font-semibold">
                    Nama Anak
                  </Label>
                  <Input
                    id="username"
                    placeholder="Contoh: Budi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-base font-semibold">
                    Usia (tahun)
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="3"
                    max="12"
                    placeholder="Contoh: 6"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!username.trim() || !age}
                  className="w-full"
                  size="lg"
                >
                  Lanjut Pilih Avatar →
                </Button>
              </>
            ) : (
              <>
                <AvatarSelector selected={avatar} onSelect={setAvatar} />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    size="lg"
                  >
                    ← Kembali
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    size="lg"
                  >
                    Mulai! 🎉
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Dibuat oleh Afdhoris Pradana Putra
        </p>
      </div>
    </div>
  );
};
