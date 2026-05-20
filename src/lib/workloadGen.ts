export type Workload = 'random' | 'sorted' | 'reversed' | 'nearly-sorted' | 'few-unique';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateArray(size: number, workload: Workload, seed = 1): number[] {
  const rng = mulberry32(seed);
  const max = Math.max(20, size * 2);

  switch (workload) {
    case 'sorted':
      return Array.from({ length: size }, (_, i) => Math.floor((i / size) * max) + 1);
    case 'reversed':
      return Array.from({ length: size }, (_, i) => Math.floor(((size - i - 1) / size) * max) + 1);
    case 'nearly-sorted': {
      const arr = Array.from({ length: size }, (_, i) => Math.floor((i / size) * max) + 1);
      const swaps = Math.max(1, Math.floor(size * 0.05));
      for (let s = 0; s < swaps; s++) {
        const i = Math.floor(rng() * size);
        const j = Math.floor(rng() * size);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    case 'few-unique': {
      const pool = [Math.floor(max * 0.2), Math.floor(max * 0.5), Math.floor(max * 0.8)];
      return Array.from({ length: size }, () => pool[Math.floor(rng() * pool.length)]);
    }
    case 'random':
    default:
      return Array.from({ length: size }, () => Math.floor(rng() * max) + 1);
  }
}
