const MUTE_KEY = 'podogerak_audio_muted';

class AudioControllerClass {
  private audio: HTMLAudioElement | null = null;
  private _isMuted: boolean;

  constructor() {
    this._isMuted = localStorage.getItem(MUTE_KEY) === 'true';
  }

  start() {
    if (this.audio) this.stop();

    this.audio = new Audio('/audio/session-bgm.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3;
    this.audio.muted = this._isMuted;

    this.audio.play().catch(() => {
      // Autoplay blocked - will play on next user interaction
    });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  toggleMute(): boolean {
    this._isMuted = !this._isMuted;
    localStorage.setItem(MUTE_KEY, String(this._isMuted));
    if (this.audio) {
      this.audio.muted = this._isMuted;
    }
    return this._isMuted;
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
    localStorage.setItem(MUTE_KEY, String(muted));
    if (this.audio) {
      this.audio.muted = muted;
    }
  }
}

export const audioController = new AudioControllerClass();
