import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getRetentionSettings, upsertRetentionSettings, eraseChildPII } from '@/lib/ConsentService';
import { ArrowLeft, Trash2, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataRetentionSettingsProps {
  userId: string;
  childName: string;
  onBack: () => void;
}

export const DataRetentionSettings = ({ userId, childName, onBack }: DataRetentionSettingsProps) => {
  const [retentionDays, setRetentionDays] = useState(365);
  const [isSaving, setIsSaving] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getRetentionSettings(userId).then(settings => {
      if (settings) setRetentionDays(settings.retention_days);
    });
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await upsertRetentionSettings(userId, userId, retentionDays);
    setIsSaving(false);
    toast({
      title: ok ? 'Tersimpan' : 'Gagal',
      description: ok ? 'Pengaturan retensi data diperbarui.' : 'Gagal menyimpan pengaturan.',
      variant: ok ? 'default' : 'destructive',
    });
  };

  const handleErase = async () => {
    setIsErasing(true);
    const ok = await eraseChildPII(userId);
    setIsErasing(false);
    toast({
      title: ok ? 'Data Dihapus' : 'Gagal',
      description: ok
        ? 'Data identitas anak telah dihapus. ID anonim dipertahankan untuk analisis.'
        : 'Gagal menghapus data. Silakan coba lagi.',
      variant: ok ? 'default' : 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-fredoka font-bold">Persetujuan & Data</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Retention Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-primary" />
              Retensi Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tentukan berapa lama data aktivitas {childName} disimpan sebelum dihapus otomatis.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Periode retensi</span>
                <span className="font-bold text-primary">{retentionDays} hari</span>
              </div>
              <Slider
                value={[retentionDays]}
                onValueChange={([v]) => setRetentionDays(v)}
                min={30}
                max={730}
                step={30}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30 hari</span>
                <span>2 tahun</span>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </CardContent>
        </Card>

        {/* Erase PII */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <Trash2 className="w-5 h-5" />
              Hapus Data Anak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Menghapus data identitas pribadi (nama, email, usia) anak dari sistem.
              ID anonim dipertahankan untuk keperluan analisis penelitian.
            </p>
            <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
              <p className="font-bold">Yang akan dihapus:</p>
              <p>• Nama anak → diganti ID anonim</p>
              <p>• Email → dihapus</p>
              <p>• Usia → dihapus</p>
              <p className="font-bold mt-2">Yang dipertahankan:</p>
              <p>• Data sesi latihan (tanpa identitas)</p>
              <p>• Skor dan progress (de-identifikasi)</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4" /> Hapus Data Anak Saya
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Penghapusan Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Data identitas pribadi {childName} akan
                    dihapus permanen. Data anonim untuk penelitian akan dipertahankan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleErase} disabled={isErasing}>
                    {isErasing ? 'Menghapus...' : 'Ya, Hapus Data'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">Tentang Keamanan Data</p>
                <p>Semua data disimpan terenkripsi dengan akses terbatas. Hanya Anda yang dapat mengelola data anak Anda. Persetujuan penelitian dapat ditarik kapan saja.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
