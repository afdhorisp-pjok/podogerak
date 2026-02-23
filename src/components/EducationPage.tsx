import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Heart, Users, Sparkles, Target } from 'lucide-react';

interface EducationPageProps {
  onBack: () => void;
}

export const EducationPage = ({ onBack }: EducationPageProps) => {
  const sections = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Apa itu TGMD-3?',
      content: `Test of Gross Motor Development (TGMD-3) adalah instrumen penilaian standar yang digunakan secara luas dalam penelitian perkembangan motorik anak. TGMD-3 mengukur dua domain utama:\n\n🏃 **Keterampilan Lokomotor** — gerakan berpindah tempat (berlari, melompat, hop, gallop)\n\n⚽ **Keterampilan Bola (Object Control)** — gerakan mengontrol objek (melempar, menangkap, menendang)`,
      emoji: '🧠',
    },
    {
      icon: <Target className="w-8 h-8 text-secondary" />,
      title: 'Tujuan Intervensi PodoGerak',
      content: `PodoGerak dirancang sebagai platform intervensi motorik digital untuk mendukung perkembangan keterampilan motorik kasar anak usia 4-7 tahun melalui:\n\n• Kurikulum terstruktur 8 minggu\n• Latihan yang selaras dengan domain TGMD-3\n• Progresi bertahap dari fundamental ke mastery\n• Lingkungan rumah yang aman\n• Bimbingan orang tua sebagai fasilitator`,
      emoji: '🎯',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-accent" />,
      title: 'Domain Motorik dalam PodoGerak',
      content: `Latihan di PodoGerak mencakup 5 domain:\n\n🏃 **Lokomotor** — Berjalan, berlari, melangkah\n🐸 **Lompat & Hop** — Melompat dua kaki, hop satu kaki\n🧘 **Keseimbangan** — Berdiri satu kaki, freeze\n⚽ **Keterampilan Bola** — Melempar, menangkap, menendang\n🌟 **Gabungan** — Integrasi lokomotor + bola\n\nSetiap domain penting untuk perkembangan motorik yang seimbang.`,
      emoji: '✨',
    },
    {
      icon: <Heart className="w-8 h-8 text-secondary" />,
      title: 'Prinsip Keamanan Perkembangan',
      content: `Semua latihan di PodoGerak dirancang dengan prinsip keamanan perkembangan:\n\n• Sesuai usia 4-7 tahun (developmentally appropriate)\n• Durasi pendek (5-15 detik per gerakan)\n• Ruang maksimal 2 meter\n• Equipment rumah tangga yang aman\n• TIDAK termasuk latihan kekuatan, daya tahan, atau kondisi fisik atletik\n\nIni adalah program pengembangan motorik, bukan program kebugaran.`,
      emoji: '❤️',
    },
    {
      icon: <Users className="w-8 h-8 text-success" />,
      title: 'Peran Orang Tua sebagai Fasilitator',
      content: `Orang tua berperan sebagai fasilitator intervensi:\n\n• **Konsistensi** — Lakukan 3-4 sesi per minggu\n• **Dorongan positif** — Pujian untuk setiap usaha, bukan hasil\n• **Pengulangan** — Repetisi membangun keterampilan motorik\n• **Keamanan** — Pastikan lingkungan aman sebelum memulai\n• **Observasi** — Perhatikan perkembangan anak dan lakukan penilaian berkala\n• **Bermain** — Jadikan setiap sesi sebagai waktu bermain yang menyenangkan`,
      emoji: '👨‍👩‍👧',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-fredoka font-bold">Edukasi & Informasi Ilmiah</h1>
            <p className="text-sm text-muted-foreground">TGMD-3 Aligned Motor Development</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card className="bg-gradient-primary text-primary-foreground border-0 overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-soft">🏃‍♂️</div>
              <h2 className="text-2xl font-fredoka font-bold mb-2">PodoGerak</h2>
              <p className="opacity-90">Platform Intervensi Motorik Digital untuk Anak Usia 4-7 Tahun</p>
            </CardContent>
          </Card>

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

          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                PodoGerak dikembangkan berdasarkan kerangka TGMD-3 dan prinsip intervensi motorik berbasis bukti.
              </p>
              <p className="text-xs text-muted-foreground">Dibuat oleh Afdhoris Pradana Putra</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
