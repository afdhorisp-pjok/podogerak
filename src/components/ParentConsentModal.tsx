import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createConsentRecord, ConsentOptions } from '@/lib/ConsentService';
import { FileText, Download } from 'lucide-react';

interface ParentConsentModalProps {
  open: boolean;
  userId: string;
  onConsented: () => void;
}

const CONSENT_TEXT = `
FORMULIR PERSETUJUAN ORANG TUA
Versi: v1.0

JUDUL PENELITIAN
Intervensi Motorik Digital untuk Anak Usia 4-7 Tahun Menggunakan Platform PodoGerak

TUJUAN
Penelitian ini bertujuan untuk mengevaluasi efektivitas program latihan motorik digital berbasis kurikulum TGMD-3 dalam meningkatkan keterampilan motorik kasar anak.

DATA YANG DIKUMPULKAN
1. Data Aktivitas: Catatan sesi latihan, durasi, dan skor aktivitas anak.
2. Data Audio (opsional): Rekaman instruksi suara selama sesi latihan.
3. Data Sensor (opsional): Data gerakan dari perangkat selama latihan.
4. Data Video (opsional): Rekaman visual sesi latihan untuk analisis gerakan.

KERAHASIAAN DATA
- Semua data disimpan dengan enkripsi dan akses terbatas.
- Data identitas pribadi (nama, email) dapat dihapus kapan saja.
- Data yang sudah di-anonimkan dapat digunakan untuk analisis penelitian.
- Tidak ada dokumen identitas yang disimpan oleh sistem.

HAK ORANG TUA
- Anda berhak menarik persetujuan kapan saja.
- Anda berhak meminta penghapusan data pribadi anak.
- Anda berhak mengatur periode retensi data.
- Anda berhak mendapatkan salinan data anak Anda.

KONTAK PENELITI
Untuk pertanyaan, hubungi tim peneliti melalui platform PodoGerak.

Dengan mencentang kotak di bawah dan menekan "Saya Menyetujui", Anda menyatakan telah membaca, memahami, dan menyetujui ketentuan di atas.
`.trim();

export const ParentConsentModal = ({ open, userId, onConsented }: ParentConsentModalProps) => {
  const [consentAudio, setConsentAudio] = useState(false);
  const [consentSensorData, setConsentSensorData] = useState(false);
  const [consentVideoUpload, setConsentVideoUpload] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 30;
    if (atBottom) setHasScrolledToBottom(true);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const consents: ConsentOptions = { consentAudio, consentSensorData, consentVideoUpload };
    const result = await createConsentRecord(userId, userId, consents);
    setIsSubmitting(false);
    if (result) onConsented();
  };

  const handleDownloadPDF = () => {
    const blob = new Blob([CONSENT_TEXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'persetujuan-penelitian-podogerak.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Persetujuan Orang Tua
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[40vh] border rounded-lg p-4" onScrollCapture={handleScroll}>
          <div ref={scrollRef} className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {CONSENT_TEXT}
          </div>
        </ScrollArea>

        {!hasScrolledToBottom && (
          <p className="text-xs text-muted-foreground text-center animate-pulse">
            ↓ Gulir ke bawah untuk melanjutkan
          </p>
        )}

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <Checkbox id="consent-audio" checked={consentAudio} onCheckedChange={(v) => setConsentAudio(!!v)} />
            <Label htmlFor="consent-audio" className="text-sm">Saya mengizinkan perekaman audio</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="consent-sensor" checked={consentSensorData} onCheckedChange={(v) => setConsentSensorData(!!v)} />
            <Label htmlFor="consent-sensor" className="text-sm">Saya mengizinkan pengumpulan data sensor</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="consent-video" checked={consentVideoUpload} onCheckedChange={(v) => setConsentVideoUpload(!!v)} />
            <Label htmlFor="consent-video" className="text-sm">Saya mengizinkan unggah video latihan</Label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleDownloadPDF} className="flex-1">
            <Download className="w-4 h-4" /> Unduh PDF
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasScrolledToBottom || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Menyimpan...' : 'Saya Menyetujui ✓'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
