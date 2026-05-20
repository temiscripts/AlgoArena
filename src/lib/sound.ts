// Single AudioContext, lazily created on first user gesture. Browsers refuse
// to run an AudioContext that was started before any interaction, so we
// instantiate inside play() rather than at module load.

import clangUrl from '@/assets/sounds/clang.mp3';
import clashUrl from '@/assets/sounds/clash.mp3';
import victoryUrl from '@/assets/sounds/victory.mp3';
import growlUrl from '@/assets/sounds/growl.mp3';
import hoverUrl from '@/assets/sounds/hover.mp3';

export type SoundName = 'clang' | 'clash' | 'victory' | 'growl' | 'hover';

interface SoundDef {
  url: string;
  defaultVolume: number;
  throttleMs: number;
}

const SOUNDS: Record<SoundName, SoundDef> = {
  clang: { url: clangUrl, defaultVolume: 0.18, throttleMs: 90 },
  clash: { url: clashUrl, defaultVolume: 0.45, throttleMs: 200 },
  // Throttled so two panels finishing back-to-back don't overlap fanfares.
  victory: { url: victoryUrl, defaultVolume: 0.5, throttleMs: 1500 },
  growl: { url: growlUrl, defaultVolume: 0.55, throttleMs: 300 },
  // Hover plays often; keep volume low and throttle hard so rapid mouse sweeps don't roar.
  hover: { url: hoverUrl, defaultVolume: 0.12, throttleMs: 220 },
};

let ctx: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
const inflight = new Map<SoundName, Promise<AudioBuffer>>();
const lastPlayedAt = new Map<SoundName, number>();

let muted = false;
const mutedListeners = new Set<(v: boolean) => void>();

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem('algoarena.muted', next ? '1' : '0');
  } catch {
    /* private mode */
  }
  mutedListeners.forEach((cb) => cb(next));
}

export function subscribeMuted(cb: (v: boolean) => void) {
  mutedListeners.add(cb);
  return () => mutedListeners.delete(cb);
}

// Restore persisted mute preference once at module load.
try {
  muted = window.localStorage.getItem('algoarena.muted') === '1';
} catch {
  /* SSR / private mode */
}

function getCtx(): AudioContext {
  if (!ctx) {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Cls = window.AudioContext || W.webkitAudioContext;
    ctx = new Cls!();
  }
  return ctx;
}

async function loadBuffer(name: SoundName): Promise<AudioBuffer> {
  const cached = buffers.get(name);
  if (cached) return cached;
  const pending = inflight.get(name);
  if (pending) return pending;

  const def = SOUNDS[name];
  const p = fetch(def.url)
    .then((r) => r.arrayBuffer())
    .then((arr) => getCtx().decodeAudioData(arr))
    .then((buf) => {
      buffers.set(name, buf);
      inflight.delete(name);
      return buf;
    });
  inflight.set(name, p);
  return p;
}

export interface PlayOptions {
  volume?: number;
}

export function play(name: SoundName, opts: PlayOptions = {}): void {
  if (muted) return;
  const def = SOUNDS[name];
  const now = performance.now();
  const last = lastPlayedAt.get(name) ?? 0;
  if (def.throttleMs && now - last < def.throttleMs) return;
  lastPlayedAt.set(name, now);

  loadBuffer(name)
    .then((buf) => {
      const c = getCtx();
      if (c.state === 'suspended') c.resume();
      const src = c.createBufferSource();
      src.buffer = buf;
      const gain = c.createGain();
      gain.gain.value = opts.volume ?? def.defaultVolume;
      src.connect(gain).connect(c.destination);
      src.start(0);
    })
    .catch(() => {
      // best-effort: a missing or undecoded asset shouldn't break the UI
    });
}

/** Best-effort warm preload after first user interaction. */
export function preloadAll() {
  if (muted) return;
  (Object.keys(SOUNDS) as SoundName[]).forEach((name) => {
    loadBuffer(name).catch(() => {});
  });
}
