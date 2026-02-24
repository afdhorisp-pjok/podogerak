import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const { error: err } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (err) {
      setError(err.message);
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-fredoka font-bold text-foreground mb-2">Reset Password</h1>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Password Baru</CardTitle>
            <CardDescription>
              {isRecovery
                ? 'Masukkan password baru untuk akunmu'
                : 'Menunggu verifikasi dari link email...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {isRecovery ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-base font-semibold">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-base font-semibold">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={handleReset}
                  disabled={!password || !confirmPassword || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru ✅'}
                </Button>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Jika kamu membuka halaman ini tanpa link dari email, silakan kembali ke{' '}
                <button onClick={() => navigate('/')} className="text-primary font-semibold hover:underline">
                  halaman utama
                </button>.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
