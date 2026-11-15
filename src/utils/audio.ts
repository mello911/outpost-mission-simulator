/**
 * OUTPOST Web Audio Synthesizer
 * Generates authentic NASA Mission Control Quindar tones, alarm klaxons, and telemetry beeps
 * using native Web Audio API oscillators (no external media files required).
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private isHumPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    } else if (!muted && this.ambientGain && this.isHumPlaying) {
      this.ambientGain.gain.setValueAtTime(0.04, this.ctx?.currentTime || 0);
    }
  }

  /**
   * NASA Quindar Tone (The classic Apollo/Shuttle capsule communicator intro beep: 2524 Hz for 250ms)
   */
  public playQuindarTone(isIntro = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = isIntro ? 2524 : 2475; // 2524 Hz intro, 2475 Hz outro tone

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.22);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * UI Click / Interactive Button Confirmation
   */
  public playBeep(freq = 880, duration = 0.06, type: OscillatorType = 'sine') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay fallback
    }
  }

  /**
   * Master Caution Alert (Dual-frequency pulsed warble)
   */
  public playCautionAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.18].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now + offset);
        osc.frequency.exponentialRampToValueAtTime(650, now + offset + 0.14);

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.linearRampToValueAtTime(0.01, now + offset + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch {
      // Audio autoplay fallback
    }
  }

  /**
   * Master Warning Emergency Klaxon (Apollo / Orion style alert)
   */
  public playEmergencyKlaxon() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const startTime = now + (i * 0.22);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1020, startTime);
        osc.frequency.linearRampToValueAtTime(740, startTime + 0.16);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.19);
      }
    } catch {
      // Audio autoplay fallback
    }
  }

  /**
   * Outpost Environmental Life Support Hum (Continuous low frequency background drone)
   */
  public toggleLifeSupportHum(enable: boolean) {
    this.initContext();
    if (!this.ctx) return;

    if (!enable) {
      if (this.ambientOsc) {
        try {
          this.ambientOsc.stop();
          this.ambientOsc.disconnect();
        } catch {
          // ignore
        }
        this.ambientOsc = null;
      }
      this.isHumPlaying = false;
      return;
    }

    if (this.isHumPlaying) return;

    try {
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.ambientOsc.type = 'sawtooth';
      this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz low A hum

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime); // muffled cabin drone

      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.035, this.ctx.currentTime);

      this.ambientOsc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start();
      this.isHumPlaying = true;
    } catch {
      // ignore
    }
  }

  /**
   * Sol Transition Telemetry Chime
   */
  public playSolDayChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
