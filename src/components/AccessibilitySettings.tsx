import { useSLB } from '@/contexts/SLBContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface AccessibilitySettingsProps {
  onBack: () => void;
}

export const AccessibilitySettings = ({ onBack }: AccessibilitySettingsProps) => {
  const {
    textScale, setTextScale,
    speechRate, setSpeechRate,
    highContrast, setHighContrast,
    reduceMotion, setReduceMotion,
    narrationEnabled, setNarrationEnabled,
    resetDefaults,
  } = useSLB();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-fredoka font-bold">Aksesibilitas</h1>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Ukuran Teks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>A</span>
              <span className="text-xl font-bold">A</span>
            </div>
            <Slider
              value={[textScale]}
              onValueChange={([v]) => setTextScale(v)}
              min={1} max={2} step={0.1}
              aria-label="Ukuran teks"
            />
            <p className="text-sm text-muted-foreground text-center">{textScale.toFixed(1)}x</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Kecepatan Narasi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>🐢 Lambat</span>
              <span>Cepat 🐇</span>
            </div>
            <Slider
              value={[speechRate]}
              onValueChange={([v]) => setSpeechRate(v)}
              min={0.5} max={2} step={0.1}
              aria-label="Kecepatan narasi"
            />
            <p className="text-sm text-muted-foreground text-center">{speechRate.toFixed(1)}x</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="font-medium">Kontras Tinggi</Label>
              <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-motion" className="font-medium">Kurangi Animasi</Label>
              <Switch id="reduce-motion" checked={reduceMotion} onCheckedChange={setReduceMotion} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="narration" className="font-medium">Narasi Otomatis</Label>
              <Switch id="narration" checked={narrationEnabled} onCheckedChange={setNarrationEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-2 border-dashed">
          <CardContent className="py-4 text-center">
            <p className="text-muted-foreground text-sm mb-2">Pratinjau:</p>
            <p style={{ fontSize: `${textScale}rem` }} className="font-bold">
              Teks ini akan tampil sebesar ini
            </p>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={resetDefaults} className="w-full">
          <RotateCcw className="w-4 h-4" /> Reset ke Default
        </Button>
      </div>
    </div>
  );
};
