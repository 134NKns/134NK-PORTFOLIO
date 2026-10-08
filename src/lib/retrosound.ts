// Procedural retro 8-bit sound effects using Web Audio API (Zero external assets)
let audioCtx: AudioContext | null = null;
let muted = true;

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('retro_sound_enabled');
  muted = saved !== 'true'; // muted by default for good UX
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return !muted;
}

export function toggleSound(): boolean {
  muted = !muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('retro_sound_enabled', String(!muted));
    if (!muted) {
      getContext();
      playBeep(523.25, 'sine', 0.1, 0.08); // Friendly feedback tone
    }
  }
  return !muted;
}

export function playBeep(frequency = 440, type: OscillatorType = 'square', duration = 0.05, volume = 0.04) {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio playback errors if blocked by browser policy
  }
}

export function playClick() {
  if (muted) return;
  playBeep(880, 'triangle', 0.03, 0.03);
}

export function playKeypress() {
  if (muted) return;
  // Subtle mechanical switch noise
  const freqs = [350, 420, 500, 380];
  const freq = freqs[Math.floor(Math.random() * freqs.length)];
  playBeep(freq, 'square', 0.02, 0.02);
}

export function playWindowOpen() {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [392, 523.25, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.04, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.13);
    });
  } catch {}
}

export function playBoot() {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Classic triad major chord
    [261.63, 329.63, 392.00, 523.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    });
  } catch {}
}
