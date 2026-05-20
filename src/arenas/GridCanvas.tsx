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

export function GridCanvas({ grid, state, accent, cellPx = 16, onToggleWall, editable = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef<{ mode: 'add' | 'remove' } | null>(null);

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
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    const colors = ACCENTS[accent];
    const pathSet = new Set(state.path);

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
        ctx.fillStyle = colors.visited;
        ctx.fillRect(x, y, cellPx, cellPx);
      }
    }

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(232,227,211,0.05)';
    ctx.lineWidth = 1;
    for (let r = 1; r < grid.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellPx);
      ctx.lineTo(w, r * cellPx);
      ctx.stroke();
    }
    for (let c = 1; c < grid.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellPx, 0);
      ctx.lineTo(c * cellPx, h);
      ctx.stroke();
    }
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
