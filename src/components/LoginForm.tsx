import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarSelector } from './AvatarSelector';
import { signUp, signIn, resetPassword, checkUsernameAvailable } from '@/lib/authService';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('astronaut');
  const [age, setAge] = useState('');
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>('register');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !email || !password || !age) return;
    setIsSubmitting(true);
    setError('');

    const { error: err } = await signUp(email, password, username.trim(), avatar, parseInt(age));
    setIsSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccessMessage('Akun berhasil dibuat! Silakan cek email untuk verifikasi, lalu masuk.');
    setMode('login');
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    setIsSubmitting(true);
    setError('');
    const { error: err } = await resetPassword(email);
    setIsSubmitting(false);
    if (err) { setError(err); return; }
    setSuccessMessage('Link reset password telah dikirim ke email kamu. Silakan cek inbox.');
    setMode('login');
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsSubmitting(true);
    setError('');

    const { error: err } = await signIn(email, password);
    setIsSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    onLogin();
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
              {mode === 'forgot'
                ? 'Lupa Password'
                : mode === 'login'
                ? 'Masuk'
                : step === 1
                ? 'Siapa nama jagoan kita?'
                : 'Pilih avatarmu!'}
            </CardTitle>
            <CardDescription>
              {mode === 'forgot'
                ? 'Masukkan email untuk menerima link reset password'
                : mode === 'login'
                ? 'Masuk dengan email dan password'
                : step === 1
                ? 'Masukkan data untuk mendaftar'
                : 'Pilih karakter favoritmu untuk petualangan olahraga!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {successMessage && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {mode === 'forgot' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={handleForgotPassword}
                  disabled={!email || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset 📧'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Ingat password?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              </>
            ) : mode === 'login' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={!email || !password || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? 'Memproses...' : 'Masuk 🚀'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <button
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Lupa password?
                  </button>
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Belum punya akun?{' '}
                  <button
                    onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Daftar di sini
                  </button>
                </p>
              </>
            ) : step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base font-semibold">Nama Anak</Label>
                  <Input
                    id="username"
                    placeholder="Contoh: Budi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-base font-semibold">Usia (tahun)</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-base font-semibold">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={async () => {
                    setError('');
                    setIsSubmitting(true);
                    const available = await checkUsernameAvailable(username.trim());
                    setIsSubmitting(false);
                    if (!available) {
                      setError('Username sudah digunakan. Silakan gunakan username lain.');
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={!username.trim() || !age || !email || !password || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? 'Mengecek...' : 'Lanjut Pilih Avatar →'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
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
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="lg"
                  >
                    {isSubmitting ? 'Mendaftar...' : 'Daftar! 🎉'}
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
