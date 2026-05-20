// Quick Sort — Lightning Adder, Strike of the Pivot.
// Average O(n log n); worst O(n²) when the pivot is consistently the min/max.
// Uses last-element pivot (Lomuto) to make the "already-sorted = worst case"
// demo work clearly. The Adversarial Mode exploits this directly.

import { beastFor } from '@/beasts/lore';
import type { SortAlgorithm, SortState } from '../types';
import { generateArray } from '@/lib/workloadGen';

function* quickSteps(input: number[]): Generator<SortState> {
  const arr = input.slice();
  const state: SortState = {
    array: arr.slice(),
    comparisons: 0,
    writes: 0,
    done: false,
    highlights: {},
  };

  function* partition(lo: number, hi: number): Generator<SortState, number> {
    const pivot = arr[hi];
    state.highlights = { pivot: [hi], 'partition-bounds': [lo, hi] };
    yield { ...state, array: arr.slice() };

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      state.comparisons++;
      state.highlights = { pivot: [hi], compare: [j, hi], 'partition-bounds': [lo, hi] };
      yield { ...state, array: arr.slice() };

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          state.writes += 2;
          state.highlights = { pivot: [hi], swap: [i, j], 'partition-bounds': [lo, hi] };
          yield { ...state, array: arr.slice() };
        }
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    state.writes += 2;
    state.highlights = { pivot: [i + 1], swap: [i + 1, hi] };
    yield { ...state, array: arr.slice() };
    return i + 1;
  }

  function* qs(lo: number, hi: number): Generator<SortState> {
    if (lo >= hi) {
      if (lo === hi) {
        state.highlights = { 'mark-sorted': [lo] };
        yield { ...state, array: arr.slice() };
      }
      return;
    }
    const p: number = yield* partition(lo, hi);
    state.highlights = { 'mark-sorted': [p] };
    yield { ...state, array: arr.slice() };
    yield* qs(lo, p - 1);
    yield* qs(p + 1, hi);
  }

  yield* qs(0, arr.length - 1);

  state.done = true;
  state.highlights = { 'mark-sorted': arr.map((_, i) => i) };
  yield { ...state, array: arr.slice() };
}

export const quickSort: SortAlgorithm = {
  id: 'quick',
  category: 'sorting',
  beast: beastFor('quick'),
  run(input) {
    let last: SortState | undefined;
    for (const s of quickSteps(input)) last = s;
    return last ?? { array: input.slice(), comparisons: 0, writes: 0, done: true, highlights: {} };
  },
  steps: quickSteps,
  // Lomuto with last-element pivot → already-sorted is the worst case.
  worstCaseInput: (size) => generateArray(size, 'sorted'),
  bestCaseInput: (size) => generateArray(size, 'random', 7),
};
