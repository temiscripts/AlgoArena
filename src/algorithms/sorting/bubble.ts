// Bubble Sort — Bubblesnail, the Plodder.
// Best O(n) on a sorted array (early exit), worst O(n²) on reverse-sorted.
// Use case: tiny inputs, classroom demos, and humbling other algorithms.

import { beastFor } from '@/beasts/lore';
import type { SortAlgorithm, SortState } from '../types';
import { generateArray } from '@/lib/workloadGen';

function* bubbleSteps(input: number[]): Generator<SortState> {
  const arr = input.slice();
  const state: SortState = {
    array: arr.slice(),
    comparisons: 0,
    writes: 0,
    done: false,
    highlights: {},
  };

  let n = arr.length;
  for (let pass = 0; pass < arr.length - 1; pass++) {
    let swappedThisPass = false;
    for (let i = 0; i < n - 1; i++) {
      state.comparisons++;
      state.highlights = { compare: [i, i + 1] };
      yield { ...state, array: arr.slice() };

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        state.writes += 2;
        swappedThisPass = true;
        state.highlights = { swap: [i, i + 1] };
        yield { ...state, array: arr.slice() };
      }
    }
    n--;
    state.highlights = { 'mark-sorted': [n] };
    yield { ...state, array: arr.slice() };
    if (!swappedThisPass) break;
  }

  state.done = true;
  state.highlights = { 'mark-sorted': arr.map((_, i) => i) };
  yield { ...state, array: arr.slice() };
}

export const bubbleSort: SortAlgorithm = {
  id: 'bubble',
  category: 'sorting',
  beast: beastFor('bubble'),
  run(input) {
    let last: SortState | undefined;
    for (const s of bubbleSteps(input)) last = s;
    return last ?? { array: input.slice(), comparisons: 0, writes: 0, done: true, highlights: {} };
  },
  steps: bubbleSteps,
  worstCaseInput: (size) => generateArray(size, 'reversed'),
  bestCaseInput: (size) => generateArray(size, 'sorted'),
};
