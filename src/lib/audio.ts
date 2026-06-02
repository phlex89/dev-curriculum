// Opt-in, era-appropriate sound cues, synthesised on the fly with the Web Audio
// API (no audio assets to download). Muted by default; the preference is
// persisted. A short cue plays when the visitor travels to a new era.

import { writable } from 'svelte/store';
import type { Theme } from './store';

const KEY = 'cv_audio';

/** Reactive on/off flag so the toggle button can reflect the current state. */
export const audioEnabled = writable(false);

let enabled = false;
audioEnabled.subscribe((v) => (enabled = v));

let ctx: AudioContext | null = null;

/** Lazily create / resume the AudioContext (must follow a user gesture). */
function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function initAudio() {
  try {
    if (localStorage.getItem(KEY) === '1') audioEnabled.set(true);
  } catch {
    /* storage blocked */
  }
}

/** Flip the preference. Returns the new state so the caller can play a confirmation cue. */
export function toggleAudio(): boolean {
  const next = !enabled;
  audioEnabled.set(next);
  try {
    localStorage.setItem(KEY, next ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (next) ensureCtx(); // warm up on the enabling gesture
  return next;
}

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  start?: number; // seconds, relative to now
  dur?: number;
  gain?: number;
  slideTo?: number; // exponential glide target freq
}

function tone(c: AudioContext, dest: AudioNode, o: ToneOpts) {
  const { freq, type = 'sine', start = 0, dur = 0.2, gain = 0.15, slideTo } = o;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  // Quick attack, smooth exponential decay — avoids clicks.
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** A short band-limited noise burst — the rasping "carrier" of a dial-up handshake.
 *  Uses a one-shot buffer so we never leave an oscillator ringing. */
function noiseBurst(c: AudioContext, dest: AudioNode, start: number, dur: number, gain: number, filterHz: number) {
  const t0 = c.currentTime + start;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = filterHz;
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(dest);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** The unmistakable 56k dial-up handshake: dial tone → a few touch-tone digits →
 *  the warbling carrier screech. Synthesised on the fly; reuses the shared ctx. */
function modemHandshake(c: AudioContext, dest: AudioNode) {
  // 1. Dial tone (350 Hz + 440 Hz, the North-American "ready to dial" pair).
  tone(c, dest, { freq: 350, type: 'sine', dur: 0.32, gain: 0.05 });
  tone(c, dest, { freq: 440, type: 'sine', dur: 0.32, gain: 0.05 });
  // 2. Three DTMF "dialing" digits (dual-tone, low+high group).
  const dtmf: [number, number, number][] = [
    [697, 1209, 0.4], // "1"
    [770, 1336, 0.56], // "5"
    [852, 1477, 0.72] // "9"
  ];
  for (const [lo, hi, at] of dtmf) {
    tone(c, dest, { freq: lo, type: 'sine', start: at, dur: 0.1, gain: 0.05 });
    tone(c, dest, { freq: hi, type: 'sine', start: at, dur: 0.1, gain: 0.05 });
  }
  // 3. Carrier handshake — answer tone + warbling FSK over a noisy hiss.
  tone(c, dest, { freq: 2100, type: 'sine', start: 0.92, dur: 0.42, gain: 0.045 }); // answer tone
  tone(c, dest, { freq: 1180, type: 'sawtooth', start: 1.0, dur: 0.16, gain: 0.03, slideTo: 1650 });
  tone(c, dest, { freq: 1650, type: 'sawtooth', start: 1.18, dur: 0.16, gain: 0.03, slideTo: 1080 });
  noiseBurst(c, dest, 1.0, 0.5, 0.035, 1800); // the "kshhhh" screech
  noiseBurst(c, dest, 1.34, 0.34, 0.028, 3200);
}

/** Standalone modem cue (used by Web1.svelte's Netscape throbber). */
export function web1Modem() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.5;
  master.connect(c.destination);
  modemHandshake(c, master);
}

/** Play the cue for an era. No-op while audio is disabled. */
export function playEra(theme: Theme) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;

  // Master gain keeps everything gentle.
  const master = c.createGain();
  master.gain.value = 0.6;
  master.connect(c.destination);

  switch (theme) {
    case 'terminal':
      // Curt CRT beep — two short square blips.
      tone(c, master, { freq: 660, type: 'square', dur: 0.08, gain: 0.1 });
      tone(c, master, { freq: 880, type: 'square', start: 0.1, dur: 0.07, gain: 0.08 });
      break;
    case 'winxp': {
      // Nostalgic four-note start-up chime (evocative, not the original).
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => tone(c, master, { freq: f, type: 'sine', start: i * 0.12, dur: 0.5, gain: 0.13 }));
      break;
    }
    case 'skeuo': {
      // Warm "tri-tone" notification chime of the late-2000s/iOS-6 era —
      // two rising marimba-like notes with a soft tail (triangle waves).
      tone(c, master, { freq: 587.33, type: 'triangle', dur: 0.18, gain: 0.12 });
      tone(c, master, { freq: 880, type: 'triangle', start: 0.12, dur: 0.28, gain: 0.12 });
      tone(c, master, { freq: 1174.66, type: 'sine', start: 0.12, dur: 0.32, gain: 0.05 });
      break;
    }
    case 'material': {
      // Clean, restrained Material "tap" — a crisp sine pop answered by a higher
      // confirmation note. Polished and quiet, the opposite of skeuo's warm marimba.
      tone(c, master, { freq: 587.33, type: 'sine', dur: 0.11, gain: 0.13 }); // D5
      tone(c, master, { freq: 987.77, type: 'sine', start: 0.075, dur: 0.18, gain: 0.1 }); // B5
      break;
    }
    case 'brutalism': {
      // Blunt, raw buzzer — a dissonant square-wave clash with a gritty saw stab.
      // No politeness: it's meant to feel like a fire-door honk.
      tone(c, master, { freq: 146.83, type: 'square', dur: 0.22, gain: 0.1 });
      tone(c, master, { freq: 155.56, type: 'sawtooth', dur: 0.22, gain: 0.06 }); // detuned clash
      tone(c, master, { freq: 98, type: 'square', start: 0.16, dur: 0.18, gain: 0.1 });
      break;
    }
    case 'pixel': {
      // Cheerful 8-bit "console power-on" — a rising square-wave arpeggio (C-E-G-C).
      const arp = [523.25, 659.25, 783.99, 1046.5];
      arp.forEach((f, i) => tone(c, master, { freq: f, type: 'square', start: i * 0.07, dur: 0.09, gain: 0.07 }));
      break;
    }
    case 'web1':
      // The sound of getting online in 1996: a 56k dial-up handshake.
      modemHandshake(c, master);
      break;
    case 'bento':
      // Soft, modern "pop" that lifts in pitch.
      tone(c, master, { freq: 420, type: 'sine', dur: 0.16, gain: 0.16, slideTo: 720 });
      break;
    case 'glass': {
      // Crystalline glass chime — bright, airy, shimmering. A soft high triangle
      // arpeggio with a sine "halo" on top. The luminous, weightless opposite of
      // threed's low sci-fi drone.
      const chime = [659.25, 987.77, 1318.51]; // E5 · B5 · E6
      chime.forEach((f, i) => tone(c, master, { freq: f, type: 'triangle', start: i * 0.07, dur: 0.5, gain: 0.07 }));
      tone(c, master, { freq: 1975.53, type: 'sine', start: 0.16, dur: 0.6, gain: 0.03 }); // high shimmer halo
      break;
    }
    case 'threed': {
      // Suspended sci-fi swell — a low detuned drone that rises.
      tone(c, master, { freq: 110, type: 'sawtooth', dur: 0.7, gain: 0.05, slideTo: 220 });
      tone(c, master, { freq: 138.6, type: 'sine', dur: 0.7, gain: 0.07, slideTo: 277 });
      tone(c, master, { freq: 880, type: 'triangle', start: 0.18, dur: 0.5, gain: 0.04, slideTo: 1320 });
      break;
    }
  }
}

// ── Pixel-Art era chiptune cues (used by PixelArt.svelte) ────────────────────
// All are no-ops unless the visitor opted into audio, and reuse the shared
// AudioContext so we never spin up a second one.

/** A short square "blip" — opening a zone's dialog box. */
export function pixelBlip() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.5;
  master.connect(c.destination);
  tone(c, master, { freq: 880, type: 'square', dur: 0.05, gain: 0.05 });
  tone(c, master, { freq: 1320, type: 'square', start: 0.05, dur: 0.05, gain: 0.04 });
}

/** A bright two-note jingle — discovering a new zone for the first time. */
export function pixelDiscover() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.5;
  master.connect(c.destination);
  tone(c, master, { freq: 783.99, type: 'square', dur: 0.08, gain: 0.06 });
  tone(c, master, { freq: 1046.5, type: 'square', start: 0.09, dur: 0.14, gain: 0.06 });
}

/** Victory fanfare — all zones explored (QUEST COMPLETE). */
export function pixelFanfare() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.6;
  master.connect(c.destination);
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) => tone(c, master, { freq: f, type: 'square', start: i * 0.1, dur: 0.13, gain: 0.06 }));
}

/** Classic "coin pickup" — a quick two-note up (B5 → E6). */
export function pixelCoin() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.5;
  master.connect(c.destination);
  tone(c, master, { freq: 987.77, type: 'square', dur: 0.06, gain: 0.05 });
  tone(c, master, { freq: 1318.5, type: 'square', start: 0.06, dur: 0.12, gain: 0.05 });
}

/** A blunt low "thud" — bumping into a wall, tree or water. */
export function pixelBump() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.45;
  master.connect(c.destination);
  tone(c, master, { freq: 130.81, type: 'square', dur: 0.07, gain: 0.06, slideTo: 82.41 });
}

/** A mysterious shimmering reveal — unlocking the secret zone / cheat code. */
export function pixelSecret() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.55;
  master.connect(c.destination);
  const notes = [659.25, 880, 1174.66, 1567.98];
  notes.forEach((f, i) => tone(c, master, { freq: f, type: 'triangle', start: i * 0.09, dur: 0.22, gain: 0.05 }));
}
