import { useSLB } from '@/contexts/SLBContext';
import { Switch } from '@/components/ui/switch';
import { Accessibility } from 'lucide-react';

export const SLBToggle = () => {
  const { slbEnabled, setSlbEnabled } = useSLB();

  return (
    <button
      onClick={() => setSlbEnabled(!slbEnabled)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-colors hover:bg-muted"
      aria-label={slbEnabled ? 'Nonaktifkan Mode SLB' : 'Aktifkan Mode SLB'}
    >
      <Accessibility className="w-4 h-4" />
      <span className="hidden sm:inline">SLB</span>
      <Switch
        checked={slbEnabled}
        onCheckedChange={setSlbEnabled}
        aria-label="Mode SLB"
        className="pointer-events-none"
      />
    </button>
  );
};
