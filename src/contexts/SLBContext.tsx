import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SLBSettings {
  slbEnabled: boolean;
  textScale: number;
  speechRate: number;
  highContrast: boolean;
  reduceMotion: boolean;
  narrationEnabled: boolean;
}

interface SLBContextType extends SLBSettings {
  setSlbEnabled: (v: boolean) => void;
  setTextScale: (v: number) => void;
  setSpeechRate: (v: number) => void;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setNarrationEnabled: (v: boolean) => void;
  resetDefaults: () => void;
}

const DEFAULTS: SLBSettings = {
  slbEnabled: false,
  textScale: 1.0,
  speechRate: 1.0,
  highContrast: false,
  reduceMotion: false,
  narrationEnabled: true,
};

const STORAGE_KEY = 'podogerak_slb_settings';

const SLBContext = createContext<SLBContextType | undefined>(undefined);

function loadSettings(): SLBSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

export function SLBProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SLBSettings>(loadSettings);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply body classes & CSS variable
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('slb-mode', settings.slbEnabled);
    body.classList.toggle('slb-high-contrast', settings.slbEnabled && settings.highContrast);
    body.classList.toggle('slb-reduce-motion', settings.slbEnabled && settings.reduceMotion);
    document.documentElement.style.setProperty('--slb-text-scale', String(settings.textScale));

    return () => {
      body.classList.remove('slb-mode', 'slb-high-contrast', 'slb-reduce-motion');
      document.documentElement.style.removeProperty('--slb-text-scale');
    };
  }, [settings.slbEnabled, settings.highContrast, settings.reduceMotion, settings.textScale]);

  const update = (partial: Partial<SLBSettings>) => setSettings(prev => ({ ...prev, ...partial }));

  const ctx: SLBContextType = {
    ...settings,
    setSlbEnabled: (v) => update({ slbEnabled: v }),
    setTextScale: (v) => update({ textScale: v }),
    setSpeechRate: (v) => update({ speechRate: v }),
    setHighContrast: (v) => update({ highContrast: v }),
    setReduceMotion: (v) => update({ reduceMotion: v }),
    setNarrationEnabled: (v) => update({ narrationEnabled: v }),
    resetDefaults: () => setSettings({ ...DEFAULTS }),
  };

  return <SLBContext.Provider value={ctx}>{children}</SLBContext.Provider>;
}

export function useSLB() {
  const ctx = useContext(SLBContext);
  if (!ctx) throw new Error('useSLB must be used within SLBProvider');
  return ctx;
}
