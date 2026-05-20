// Least-squares curve fitting for Big-O detection.
// For each candidate complexity class, fit y = a · g(n) + b, then score by
// the coefficient of determination R². The candidate with the highest R²
// wins. We deliberately allow an intercept term to soak up constant-factor
// overhead and small-input noise — the *shape* matters, not the offset.

export type ComplexityClass = 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)';

const CANDIDATES: { label: ComplexityClass; g: (n: number) => number }[] = [
  { label: 'O(log n)', g: (n) => Math.log2(Math.max(2, n)) },
  { label: 'O(n)', g: (n) => n },
  { label: 'O(n log n)', g: (n) => n * Math.log2(Math.max(2, n)) },
  { label: 'O(n²)', g: (n) => n * n },
];

export interface Fit {
  label: ComplexityClass;
  a: number;
  b: number;
  r2: number;
  predict(n: number): number;
}

export interface FitResult {
  best: Fit;
  all: Fit[];
}

function linearRegression(xs: number[], ys: number[]): { a: number; b: number; r2: number } {
  const n = xs.length;
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const a = den === 0 ? 0 : num / den;
  const b = meanY - a * meanX;

  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const pred = a * xs[i] + b;
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - meanY) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { a, b, r2 };
}

export function fitComplexity(sizes: number[], ops: number[]): FitResult {
  if (sizes.length !== ops.length || sizes.length < 2) {
    throw new Error('fitComplexity requires matched, ≥2-length sample arrays');
  }
  const all: Fit[] = CANDIDATES.map(({ label, g }) => {
    const xs = sizes.map(g);
    const { a, b, r2 } = linearRegression(xs, ops);
    return {
      label,
      a,
      b,
      r2,
      predict: (n: number) => a * g(n) + b,
    };
  });
  const best = all.reduce((acc, f) => (f.r2 > acc.r2 ? f : acc));
  return { best, all };
}
