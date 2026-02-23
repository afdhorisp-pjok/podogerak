import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, Star, MessageCircle, Target } from 'lucide-react';

interface ParentGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const ParentGuideModal = ({ open, onClose }: ParentGuideModalProps) => {
  const sections = [
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: 'Tujuan Program',
      items: [
        'PodoGerak adalah program intervensi motorik 8 minggu untuk anak usia 4-7 tahun',
        'Membantu mengembangkan keterampilan lokomotor dan keterampilan bola',
        'Selaras dengan kerangka penilaian TGMD-3 (Test of Gross Motor Development)',
        'Target: 3-4 sesi per minggu, masing-masing maksimal 3 menit',
        'Progresi bertahap: fundamental → development → integration → mastery',
      ],
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: 'Keamanan di Rumah',
      items: [
        'Pastikan area latihan minimal 2 meter, bebas dari benda tajam dan furniture',
        'Gunakan hanya equipment rumah tangga yang aman: bola lembut, kaos kaki gulung, bantal',
        'Lantai harus tidak licin — gunakan karpet atau alas jika perlu',
        'Selalu awasi anak selama latihan berlangsung',
        'Hentikan latihan jika anak menunjukkan tanda kelelahan atau ketidaknyamanan',
        'Ini BUKAN latihan kebugaran atau kekuatan — ini adalah pengembangan motorik',
      ],
    },
    {
      icon: <Heart className="w-6 h-6 text-secondary" />,
      title: 'Prinsip Dorongan Positif',
      items: [
        'Berikan pujian untuk setiap USAHA, bukan hanya hasil',
        'Jangan memaksa anak menyelesaikan gerakan yang belum mampu',
        'Gunakan bahasa yang playful dan menyenangkan',
        'Jadikan setiap sesi sebagai waktu bermain bersama',
        'Hindari tekanan performa — fokus pada kesenangan bergerak',
        'Rayakan setiap pencapaian kecil',
      ],
    },
    {
      icon: <Star className="w-6 h-6 text-accent" />,
      title: 'Pentingnya Pengulangan',
      items: [
        'Pengulangan adalah kunci pembentukan pola motorik pada anak',
        'Tidak perlu sempurna — proses belajar lebih penting dari hasil',
        'Setiap sesi mengulang dan membangun dari sesi sebelumnya',
        'Konsistensi 3-4x per minggu lebih efektif dari sesi panjang sesekali',
        'Kurikulum 8 minggu dirancang untuk progresi bertahap dan aman',
      ],
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-success" />,
      title: 'Contoh Instruksi yang Baik',
      items: [
        '"Coba lompat seperti katak! Kwek kwek!" — gunakan analogi binatang',
        '"Wah, kamu sudah bisa berdiri satu kaki! Hebat!" — pujian spesifik',
        '"Ayo kita tangkap bola bersama!" — ikut berpartisipasi',
        '"Tidak apa-apa, kita coba lagi pelan-pelan ya" — normalisasi kegagalan',
        '"Kamu sudah selesai satu sesi! Progress updated!" — feedback penyelesaian',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fredoka flex items-center gap-2">
            👨‍👩‍👧 Panduan Orang Tua — Fasilitator Intervensi
          </DialogTitle>
          <DialogDescription>
            Panduan ilmiah untuk mendampingi anak dalam program intervensi motorik PodoGerak
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card
                key={section.title}
                className="border-2 animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
