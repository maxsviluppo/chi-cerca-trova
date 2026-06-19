// Web Audio API Sound Effects Synthesizer
// Generates beautiful cartoon/retro sounds programmatically on user interaction.

let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Avoid crashing if Web Audio isn't supported in browser/iframe frame permissions
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  
  // Resume context if suspended (browser security autoplays blockers)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  return audioCtx;
}

export function toggleMuteSilently(): boolean {
  isMutedGlobal = !isMutedGlobal;
  return isMutedGlobal;
}

export function isAudioMuted(): boolean {
  return isMutedGlobal;
}

/**
 * Play a standard subtle navigation/click button sound
 */
export function playBtnClick() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(350, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

/**
 * Play a magical retro discovery sound when an object is successfully found!
 */
export function playObjectFound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Double bell harmony synth (primary chime and higher harmonic)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(523.25, now); // C5
  osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // Sliders up to C6

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(659.25, now); // E5
  osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // Sliders up to E6

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);

  osc1.stop(now + 0.35);
  osc2.stop(now + 0.35);
}

/**
 * Play an absolute celebratory arpeggio sound upon level completion victory!
 */
export function playLevelCompleteSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Happy chord sequence notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const duration = 0.12;

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    const noteStart = now + index * 0.09;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, noteStart);

    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(freq / 2, noteStart); // Warm base octave support

    gain.gain.setValueAtTime(0, now);
    gain.gain.setValueAtTime(0.10, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    subOsc.start(noteStart);

    osc.stop(noteStart + 0.4);
    subOsc.stop(noteStart + 0.4);
  });
}

/**
 * Play a beautiful, shimmering fairy harp arpeggio when triggering magical highlights
 */
export function playFairyMagicSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Pentatonic scale starting high for sweet glint shimmer sound
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];
  
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteStart = now + index * 0.055; // Fast, shimmering sweep

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, noteStart);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.03, noteStart + 0.35); // Slight shimmer/vibrato slide

    gain.gain.setValueAtTime(0, now);
    gain.gain.setValueAtTime(0.06, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.4);
  });
}

