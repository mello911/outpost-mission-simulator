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

  /**
   * 3D Astronaut Footstep on regolith (dull, muffled low thump)
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90 + Math.random() * 20, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.07);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  /**
   * 3D Jetpack / RCS Thruster puff (filtered white noise burst)
   */
  public playJetpackBurst() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.15);
    } catch {
      // ignore
    }
  }

  /**
   * 3D Interaction affirmative chirp (cleaning, harvesting, patching)
   */
  public playInteract() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.setValueAtTime(1600, now + 0.07);
      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.setValueAtTime(1000, now + 0.07);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.16);
      osc2.stop(now + 0.16);
    } catch {
      // ignore
    }
  }

  /**
   * 3D Geological Drill sound (high tech vibratory pulse)
   */
  public playDrill() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.25);
      osc.frequency.linearRampToValueAtTime(180, now + 0.4);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  /**
   * 3D EVA Welding / Repair Sparks sound
   */
  public playWelding() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  /**
   * Game UI Button Hover Sound (Crisp, subtle sci-fi tick)
   */
  public playButtonHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, now);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // ignore
    }
  }

  /**
   * Game UI Button Click / Selection (Firm sci-fi arcade confirmation)
   */
  public playButtonClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  /**
   * Dramatic Expedition Launch Sound (Thruster ignition & ascending chord)
   */
  public playLaunchTone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [220, 277.18, 329.63, 440, 554.37]; // A major arpeggio
      freqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.06, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.5);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Ambient Space Theme Music (Subtle pulsing chords)
   */
  private bgmOscs: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;

  public toggleSpaceBgm(enable: boolean) {
    this.initContext();
    if (!this.ctx) return;

    if (!enable || this.isMuted) {
      this.bgmOscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.bgmOscs = [];
      this.isBgmPlaying = false;
      return;
    }

    if (this.isBgmPlaying) return;

    try {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.02, this.ctx.currentTime); // gentle background level

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const notes = [110, 164.81, 220, 329.63]; // A minor ambient drone
      this.bgmOscs = notes.map(freq => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx!.currentTime);
        osc.connect(filter);
        osc.start();
        return osc;
      });

      filter.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);
      this.isBgmPlaying = true;
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
