import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, Star, MessageCircle } from 'lucide-react';

interface ParentGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const ParentGuideModal = ({ open, onClose }: ParentGuideModalProps) => {
  const sections = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: 'Tips Keamanan',
      items: [
        'Pastikan area latihan cukup luas dan bebas hambatan',
        'Lakukan pemanasan ringan sebelum memulai latihan',
        'Gunakan alas kaki yang nyaman atau bertelanjang kaki di permukaan aman',
        'Selalu awasi anak selama latihan berlangsung',
        'Sediakan air minum untuk menghindari dehidrasi',
        'Hentikan latihan jika anak menunjukkan tanda kelelahan berlebihan',
      ],
    },
    {
      icon: <Heart className="w-6 h-6 text-secondary" />,
      title: 'Lingkungan Supportif',
      items: [
        'Berikan pujian positif untuk setiap usaha anak',
        'Jangan memaksa anak jika belum siap melakukan gerakan tertentu',
        'Adaptasi tingkat kesulitan sesuai kemampuan anak',
        'Ikut berlatih bersama anak untuk memberi contoh dan motivasi',
        'Jadikan latihan sebagai waktu bermain yang menyenangkan',
        'Rayakan pencapaian kecil untuk membangun kepercayaan diri',
      ],
    },
    {
      icon: <Star className="w-6 h-6 text-accent" />,
      title: 'Panduan Pengajaran',
      items: [
        'Jelaskan gerakan dengan bahasa sederhana sebelum memulai',
        'Demonstrasikan gerakan terlebih dahulu agar anak paham',
        'Beri koreksi lembut jika gerakan kurang tepat',
        'Fokus pada kesenangan, bukan kesempurnaan',
        'Sesuaikan repetisi dan durasi dengan kondisi anak',
        'Gunakan musik ceria untuk menambah semangat',
      ],
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-success" />,
      title: 'Contoh Kalimat Motivasi',
      items: [
        '"Wah, hebat sekali! Kamu sudah bisa lompat seperti katak!"',
        '"Ayo semangat, sedikit lagi selesai!"',
        '"Bagus! Coba lagi ya, pasti bisa lebih baik!"',
        '"Keren! Kamu sudah jadi seperti superhero!"',
        '"Tidak apa-apa kalau lelah, kita istirahat dulu ya."',
        '"Mama/Papa bangga sama kamu! Terus semangat!"',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fredoka flex items-center gap-2">
            👨‍👩‍👧 Panduan Orang Tua
          </DialogTitle>
          <DialogDescription>
            Tips dan panduan untuk mendampingi anak berlatih dengan aman dan menyenangkan
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
