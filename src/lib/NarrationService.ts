class NarrationService {
  private synth: SpeechSynthesis | null = null;

  private getSynth(): SpeechSynthesis | null {
    if (!this.synth && typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
    return this.synth;
  }

  speak(text: string, rate: number = 1.0): void {
    const synth = this.getSynth();
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = rate;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    synth.speak(utterance);
  }

  stop(): void {
    this.getSynth()?.cancel();
  }

  isSpeaking(): boolean {
    return this.getSynth()?.speaking ?? false;
  }
}

export const narrationService = new NarrationService();
