import type { Algorithm } from '../types';

export interface SearchInput {
  array: number[];
  target: number;
}

export interface SearchState {
  arrayLength: number;
  current: number | null;
  lo: number | null;
  hi: number | null;
  visited: Uint8Array;
  comparisons: number;
  done: boolean;
  found: boolean;
  foundIndex: number | null;
}

export type SearchAlgorithm = Algorithm<SearchInput, SearchState>;

export function makeInitialSearchState(arrayLength: number): SearchState {
  return {
    arrayLength,
    current: null,
    lo: 0,
    hi: Math.max(0, arrayLength - 1),
    visited: new Uint8Array(arrayLength),
    comparisons: 0,
    done: false,
    found: false,
    foundIndex: null,
  };
}

export function cloneSearchState(s: SearchState): SearchState {
  return {
    arrayLength: s.arrayLength,
    current: s.current,
    lo: s.lo,
    hi: s.hi,
    visited: s.visited.slice(),
    comparisons: s.comparisons,
    done: s.done,
    found: s.found,
    foundIndex: s.foundIndex,
  };
}
