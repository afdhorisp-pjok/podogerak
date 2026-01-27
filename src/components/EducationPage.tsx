import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Brain, Heart, Users, Sparkles } from 'lucide-react';

interface EducationPageProps {
  onBack: () => void;
}

export const EducationPage = ({ onBack }: EducationPageProps) => {
  const sections = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Apa itu Motorik Kasar?',
      content: `Motorik kasar adalah kemampuan menggunakan otot-otot besar tubuh untuk melakukan gerakan seperti berlari, melompat, melempar, dan menjaga keseimbangan. Kemampuan ini sangat penting untuk perkembangan fisik dan kognitif anak.`,
      emoji: '🧠',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-accent" />,
      title: 'Mengapa Penting?',
      content: `Perkembangan motorik kasar yang baik membantu anak:
      
• Membangun kekuatan dan ketahanan otot
• Meningkatkan koordinasi dan keseimbangan
• Mengembangkan kepercayaan diri
• Mendukung kemampuan belajar di sekolah
• Mempersiapkan keterampilan olahraga
• Meningkatkan kesehatan jantung dan paru-paru`,
      emoji: '✨',
    },
    {
      icon: <Heart className="w-8 h-8 text-secondary" />,
      title: 'Jenis Gerakan Motorik Kasar',
      content: `Ada tiga jenis utama gerakan motorik kasar:

🏃 **Lokomotor** - Gerakan berpindah tempat
Contoh: berjalan, berlari, melompat, skipping

🧘 **Non-Lokomotor** - Gerakan di tempat
Contoh: membungkuk, memutar, menyeimbangkan, stretching

🎾 **Manipulatif** - Gerakan dengan objek
Contoh: melempar, menangkap, mendorong, menendang`,
      emoji: '❤️',
    },
    {
      icon: <Users className="w-8 h-8 text-success" />,
      title: 'Peran Orang Tua',
      content: `Orang tua memiliki peran penting dalam mendukung perkembangan motorik kasar anak:

• Berikan kesempatan bermain aktif setiap hari
• Jadilah contoh dengan ikut bergerak bersama anak
• Berikan pujian untuk setiap usaha anak
• Sesuaikan aktivitas dengan usia dan kemampuan
• Ciptakan lingkungan yang aman untuk bergerak
• Jadikan olahraga sebagai kegiatan menyenangkan`,
      emoji: '👨‍👩‍👧',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-fredoka font-bold">Edukasi Motorik Kasar</h1>
            <p className="text-sm text-muted-foreground">Kenali pentingnya gerakan untuk anak</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Hero */}
          <Card className="bg-gradient-primary text-primary-foreground border-0 overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-soft">🏃‍♂️</div>
              <h2 className="text-2xl font-fredoka font-bold mb-2">
                Gerak Sehat, Anak Hebat!
              </h2>
              <p className="opacity-90">
                Mari pelajari pentingnya pengembangan motorik kasar untuk tumbuh kembang anak
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          {sections.map((section, index) => (
            <Card 
              key={section.title}
              className="animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Footer */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                PodoGerak dikembangkan berdasarkan prinsip-prinsip pendidikan jasmani anak usia dini
              </p>
              <p className="text-xs text-muted-foreground">
                Dibuat dengan ❤️ oleh Afdhoris Pradana Putra
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
