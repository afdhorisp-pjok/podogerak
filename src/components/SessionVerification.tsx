import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { TEACHER_CHECKLIST, ChecklistItem, submitChecklist, submitMediaVerification } from '@/lib/VerificationService';
import { CheckCircle, Camera, Video, ShieldCheck, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionVerificationProps {
  sessionId: string;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const SessionVerification = ({ sessionId, userId, onComplete, onSkip }: SessionVerificationProps) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    TEACHER_CHECKLIST.map(item => ({ ...item, checked: false }))
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [consentPhoto, setConsentPhoto] = useState(false);
  const [consentVideo, setConsentVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');
  const { toast } = useToast();

  const checkedCount = checklist.filter(i => i.checked).length;
  const canSubmitChecklist = checkedCount >= 6;

  const toggleChecklist = (key: string) => {
    setChecklist(prev => prev.map(item =>
      item.key === key ? { ...item, checked: !item.checked } : item
    ));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Video terlalu besar', description: 'Maksimal 10MB', variant: 'destructive' });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Submit checklist if items are checked
      if (checkedCount > 0) {
        await submitChecklist(sessionId, userId, checklist);
      }

      // Submit photo if provided and consented
      if (photoFile && consentPhoto) {
        await submitMediaVerification(sessionId, userId, 'photo', photoFile, {
          photo: consentPhoto,
          video: consentVideo,
        });
      }

      // Submit video if provided and consented
      if (videoFile && consentVideo) {
        await submitMediaVerification(sessionId, userId, 'video', videoFile, {
          photo: consentPhoto,
          video: consentVideo,
        });
      }

      toast({ title: 'Verifikasi disimpan ✓' });
      onComplete();
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-0 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-fredoka font-bold text-foreground">Verifikasi Sesi</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="checklist" className="flex-1 text-xs">
              ✅ Checklist
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex-1 text-xs">
              📷 Foto
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 text-xs">
              🎥 Video
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-2">
              Centang minimal 6 dari 8 item untuk verifikasi.
            </p>
            {checklist.map(item => (
              <div key={item.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={item.key}
                  checked={item.checked}
                  onCheckedChange={() => toggleChecklist(item.key)}
                />
                <Label htmlFor={item.key} className="text-sm cursor-pointer flex-1">
                  {item.label}
                </Label>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <Badge variant={canSubmitChecklist ? 'default' : 'secondary'}>
                {checkedCount}/8 item
              </Badge>
              {canSubmitChecklist && (
                <span className="text-xs text-primary font-medium">✓ Siap verifikasi</span>
              )}
            </div>
          </TabsContent>

          {/* Photo Tab */}
          <TabsContent value="photo" className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Opsional: Ambil foto sebagai bukti sesi. Metadata akan dihapus otomatis.
            </p>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
              <Switch checked={consentPhoto} onCheckedChange={setConsentPhoto} id="consent-photo" />
              <Label htmlFor="consent-photo" className="text-sm cursor-pointer">
                Saya setuju foto ini disimpan untuk verifikasi
              </Label>
            </div>

            {consentPhoto && (
              <>
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {photoFile ? photoFile.name : 'Tap untuk ambil foto'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary/90">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Metadata dihapus ✓
                    </Badge>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Opsional: Rekam video singkat (maks 30 detik, 10MB). Metadata akan dihapus.
            </p>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
              <Switch checked={consentVideo} onCheckedChange={setConsentVideo} id="consent-video" />
              <Label htmlFor="consent-video" className="text-sm cursor-pointer">
                Saya setuju video ini disimpan untuk verifikasi
              </Label>
            </div>

            {consentVideo && (
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors">
                <Video className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {videoFile ? videoFile.name : 'Tap untuk rekam video'}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" onClick={onSkip} className="flex-1" disabled={submitting}>
            Lewati
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={submitting || (checkedCount === 0 && !photoFile && !videoFile)}
          >
            {submitting ? 'Menyimpan...' : (
              <>
                <CheckCircle className="w-4 h-4" /> Simpan Verifikasi
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
