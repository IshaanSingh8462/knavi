// Lightweight synthesized sound effects for Knavi — no audio files to fetch
// or host, everything below is generated with the Web Audio API. Kept as a
// plain singleton (not React state) since sound is fire-and-forget; any
// component that needs to reflect the on/off state locally reads
// sound.isEnabled() once and updates its own local state on toggle.
//
// Browsers require a user gesture before audio will actually play, which is
// naturally satisfied here since every call site is inside a click handler.

type ToneOptions = {
  ctx: AudioContext;
  type?: OscillatorType;
  gain?: number;
};

const STORAGE_KEY = 'knavi_sound_enabled';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = SoundManager.readPref();
  }

  private static readPref(): boolean {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      return v === null ? true : v === '1';
    } catch {
      return true;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // localStorage can fail in private-browsing contexts; not fatal here.
    }
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private run(fn: (ctx: AudioContext, now: number) => void) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      fn(ctx, ctx.currentTime);
    } catch {
      // Sound is a nice-to-have — never let it break the interaction it's
      // attached to.
    }
  }

  private tone(freq: number, startTime: number, duration: number, opts: ToneOptions) {
    const { ctx, type = 'sine', gain = 0.12 } = opts;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  private noiseBurst(startTime: number, duration: number, ctx: AudioContext, opts: { from: number; to: number; gain: number }) {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(opts.from, startTime);
    filter.frequency.exponentialRampToValueAtTime(opts.to, startTime + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.gain, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    noise.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    noise.start(startTime);
    noise.stop(startTime + duration + 0.02);
  }

  /** Generic soft tick — the default for any ordinary button press. */
  click() {
    this.run((ctx, now) => this.tone(720, now, 0.05, { ctx, type: 'triangle', gain: 0.07 }));
  }

  /** A touch softer than click() — used for small additive actions (add a row, etc). */
  pop() {
    this.run((ctx, now) => {
      this.tone(600, now, 0.05, { ctx, type: 'sine', gain: 0.09 });
      this.tone(920, now + 0.02, 0.06, { ctx, type: 'sine', gain: 0.07 });
    });
  }

  /** Toggle switches (public/private, etc). */
  toggleSwitch() {
    this.run((ctx, now) => this.tone(660, now, 0.045, { ctx, type: 'square', gain: 0.05 }));
  }

  /** Marking a node complete / skip — the core "reward" moment. */
  complete() {
    this.run((ctx, now) => {
      this.tone(523.25, now, 0.12, { ctx, type: 'sine', gain: 0.11 }); // C5
      this.tone(659.25, now + 0.07, 0.12, { ctx, type: 'sine', gain: 0.11 }); // E5
      this.tone(783.99, now + 0.14, 0.2, { ctx, type: 'sine', gain: 0.12 }); // G5
    });
  }

  /** The next node unlocking, or a breakdown successfully adding sub-steps. */
  unlock() {
    this.run((ctx, now) => {
      this.tone(440, now, 0.08, { ctx, type: 'triangle', gain: 0.09 });
      this.tone(880, now + 0.06, 0.16, { ctx, type: 'triangle', gain: 0.1 });
    });
  }

  /** Kicking off "Break Down Further" — a quick descending split sound. */
  breakdown() {
    this.run((ctx, now) => {
      this.tone(700, now, 0.05, { ctx, type: 'sawtooth', gain: 0.045 });
      this.tone(560, now + 0.05, 0.05, { ctx, type: 'sawtooth', gain: 0.045 });
      this.tone(420, now + 0.1, 0.08, { ctx, type: 'sawtooth', gain: 0.045 });
    });
  }

  /** Undoing a completion. */
  undo() {
    this.run((ctx, now) => {
      this.tone(500, now, 0.06, { ctx, type: 'sine', gain: 0.08 });
      this.tone(360, now + 0.05, 0.09, { ctx, type: 'sine', gain: 0.08 });
    });
  }

  /** A soft negative cue — "can't go further", rate-limited, failed request. */
  denied() {
    this.run((ctx, now) => {
      this.tone(220, now, 0.11, { ctx, type: 'square', gain: 0.045 });
      this.tone(180, now + 0.09, 0.14, { ctx, type: 'square', gain: 0.045 });
    });
  }

  /** Kicking off an AI generation (weekly plan, new task decomposition). */
  generating() {
    this.run((ctx, now) => this.noiseBurst(now, 0.4, ctx, { from: 400, to: 1800, gain: 0.1 }));
  }

  /** Deleting a trail — a quick descending sweep, distinct from denied(). */
  discard() {
    this.run((ctx, now) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.1, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  /** Summit reached / trail fully complete. */
  fanfare() {
    this.run((ctx, now) => {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((f, i) => this.tone(f, now + i * 0.1, 0.28, { ctx, type: 'triangle', gain: 0.11 }));
    });
  }
}

export const sound = new SoundManager();
