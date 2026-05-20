// URL-hash encoding for shareable battles. Hash form (no leading #):
//   mode=sort&l=quick&r=bubble&w=sorted&n=80&s=1&v=6
//   mode=path&l=astar&r=dijkstra&y=sparse-walls&s=3&v=5
// Pure key/value via URLSearchParams; future fields are additive.

import type { Workload } from './workloadGen';
import type { MazeStyle } from './mazeGen';

export interface SortBattle {
  mode: 'sort';
  left: string;
  right: string;
  workload: Workload;
  size: number;
  seed: number;
  speed: number;
}

export interface PathBattle {
  mode: 'path';
  left: string;
  right: string;
  style: MazeStyle;
  seed: number;
  speed: number;
}

export type BattleParams = SortBattle | PathBattle;

const VALID_WORKLOAD = new Set<Workload>(['random', 'sorted', 'reversed', 'nearly-sorted', 'few-unique']);
const VALID_STYLE = new Set<MazeStyle>(['open', 'sparse-walls', 'dense-walls', 'rooms']);

export function encodeBattle(p: BattleParams): string {
  const params = new URLSearchParams();
  params.set('mode', p.mode);
  params.set('l', p.left);
  params.set('r', p.right);
  params.set('s', String(p.seed));
  params.set('v', String(p.speed));
  if (p.mode === 'sort') {
    params.set('w', p.workload);
    params.set('n', String(p.size));
  } else {
    params.set('y', p.style);
  }
  return params.toString();
}

export function buildShareUrl(p: BattleParams): string {
  const hash = encodeBattle(p);
  const loc = window.location;
  return `${loc.origin}${loc.pathname}#${hash}`;
}

export function readBattleFromHash(): BattleParams | null {
  const raw = window.location.hash;
  if (!raw || raw.length < 2) return null;
  const params = new URLSearchParams(raw.slice(1));
  const mode = params.get('mode');
  if (mode !== 'sort' && mode !== 'path') return null;

  const left = params.get('l');
  const right = params.get('r');
  if (!left || !right) return null;

  const seed = clampInt(params.get('s'), 0, 1_000_000, 1);
  const speed = clampInt(params.get('v'), 1, 50, 6);

  if (mode === 'sort') {
    const workload = (params.get('w') ?? 'random') as Workload;
    if (!VALID_WORKLOAD.has(workload)) return null;
    const size = clampInt(params.get('n'), 10, 250, 80);
    return { mode: 'sort', left, right, workload, size, seed, speed };
  }

  const style = (params.get('y') ?? 'sparse-walls') as MazeStyle;
  if (!VALID_STYLE.has(style)) return null;
  return { mode: 'path', left, right, style, seed, speed };
}

export function clearHash() {
  if (!window.location.hash) return;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

function clampInt(raw: string | null, min: number, max: number, dflt: number): number {
  if (raw == null) return dflt;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(min, Math.min(max, n));
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure contexts: fall back to a transient textarea.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
