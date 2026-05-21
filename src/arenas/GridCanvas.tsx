import { useEffect, useRef } from 'react';
import type { Grid, PathState } from '@/algorithms/pathfinding/types';

interface Props {
  grid: Grid;
  state: PathState;
  accent: 'crimson' | 'gold' | 'teal';
  cellPx?: number;
  onToggleWall?(cellIndex: number): void;
  editable?: boolean;
}

const ACCENTS = {
  crimson: { visited: '#5b1a17', frontier: '#c4322b', path: '#d4af37' },
  gold: { visited: '#3d3210', frontier: '#d4af37', path: '#e8e3d3' },
  teal: { visited: '#1f3d38', frontier: '#5fb3a1', path: '#d4af37' },
} as const;

const BG = '#0a0a0f';
const WALL = '#3a3a44';
const START = '#5fb3a1';
const GOAL = '#c4322b';

const FLASH_MS = 380;

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const k = (n: number) => n.toString(16).padStart(2, '0');
  return `#${k(Math.round(ar * (1 - t) + br * t))}${k(Math.round(ag * (1 - t) + bg * t))}${k(
    Math.round(ab * (1 - t) + bb * t),
  )}`;
}

export function GridCanvas({ grid, state, accent, cellPx = 16, onToggleWall, editable = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef<{ mode: 'add' | 'remove' } | null>(null);

  const prevVisitedRef = useRef<Uint8Array | null>(null);
  const flashMapRef = useRef<Map<number, number>>(new Map());
  const rafRef = useRef<number | null>(null);

  const w = grid.cols * cellPx;
  const h = grid.rows * cellPx;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Detect newly visited cells vs the previous render and stamp them for the
    // pulse — this is what makes BFS's wavefront and DFS's plunge visible.
    const prev = prevVisitedRef.current;
    if (prev && prev.length === state.visited.length) {
      const now = performance.now();
      for (let i = 0; i < state.visited.length; i++) {
        if (state.visited[i] && !prev[i]) flashMapRef.current.set(i, now);
      }
    } else if (state.visited.every((v) => !v)) {
      // Reset hook fired — clear any leftover flashes.
      flashMapRef.current.clear();
    }
    prevVisitedRef.current = state.visited.slice();

    const colors = ACCENTS[accent];
    const pathSet = new Set(state.path);

    const draw = () => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      const now = performance.now();

      for (let i = 0; i < grid.walls.length; i++) {
        const r = Math.floor(i / grid.cols);
        const c = i % grid.cols;
        const x = c * cellPx;
        const y = r * cellPx;

        if (grid.walls[i]) {
          ctx.fillStyle = WALL;
          ctx.fillRect(x, y, cellPx, cellPx);
          continue;
        }
        if (i === grid.start) {
          ctx.fillStyle = START;
          ctx.fillRect(x, y, cellPx, cellPx);
          continue;
        }
        if (i === grid.goal) {
          ctx.fillStyle = GOAL;
          ctx.fillRect(x, y, cellPx, cellPx);
          continue;
        }
        if (pathSet.has(i)) {
          ctx.fillStyle = colors.path;
          ctx.fillRect(x, y, cellPx, cellPx);
          continue;
        }
        if (state.frontier[i]) {
          ctx.fillStyle = colors.frontier;
          ctx.fillRect(x, y, cellPx, cellPx);
          continue;
        }
        if (state.visited[i]) {
          const flashedAt = flashMapRef.current.get(i);
          if (flashedAt != null) {
            const elapsed = now - flashedAt;
            if (elapsed < FLASH_MS) {
              const t = elapsed / FLASH_MS;
              ctx.fillStyle = lerpColor(colors.frontier, colors.visited, t);
            } else {
              flashMapRef.current.delete(i);
              ctx.fillStyle = colors.visited;
            }
          } else {
            ctx.fillStyle = colors.visited;
          }
          ctx.fillRect(x, y, cellPx, cellPx);
        }
      }

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(232,227,211,0.05)';
      ctx.lineWidth = 1;
      for (let rr = 1; rr < grid.rows; rr++) {
        ctx.beginPath();
        ctx.moveTo(0, rr * cellPx);
        ctx.lineTo(w, rr * cellPx);
        ctx.stroke();
      }
      for (let cc = 1; cc < grid.cols; cc++) {
        ctx.beginPath();
        ctx.moveTo(cc * cellPx, 0);
        ctx.lineTo(cc * cellPx, h);
        ctx.stroke();
      }
    };

    draw();

    // Keep redrawing while we still have active flashes — this is what gives
    // the wavefront its fade-out even when the stepper isn't advancing.
    const tick = () => {
      if (flashMapRef.current.size === 0) {
        rafRef.current = null;
        return;
      }
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    if (rafRef.current == null && flashMapRef.current.size > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [grid, state, accent, cellPx, w, h]);

  const cellAt = (ev: React.PointerEvent<HTMLCanvasElement>): number | null => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
    const c = Math.floor((x / rect.width) * grid.cols);
    const r = Math.floor((y / rect.height) * grid.rows);
    return r * grid.cols + c;
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}
      className="rounded-md"
      onPointerDown={(e) => {
        if (!editable || !onToggleWall) return;
        const i = cellAt(e);
        if (i == null) return;
        if (i === grid.start || i === grid.goal) return;
        draggingRef.current = { mode: grid.walls[i] ? 'remove' : 'add' };
        onToggleWall(i);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!editable || !onToggleWall || !draggingRef.current) return;
        const i = cellAt(e);
        if (i == null) return;
        if (i === grid.start || i === grid.goal) return;
        const wantWall = draggingRef.current.mode === 'add';
        if (grid.walls[i] !== wantWall) onToggleWall(i);
      }}
      onPointerUp={() => {
        draggingRef.current = null;
      }}
      onPointerCancel={() => {
        draggingRef.current = null;
      }}
    />
  );
}
