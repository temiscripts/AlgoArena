import type { BeastMetadata } from '@/beasts/lore';

export type Category = 'sorting' | 'pathfinding' | 'searching';

export interface Algorithm<TInput, TState> {
  id: string;
  category: Category;
  beast: BeastMetadata;
  run(input: TInput): TState;
  steps(input: TInput): Generator<TState>;
  worstCaseInput(size: number): TInput;
  bestCaseInput(size: number): TInput;
}

export interface OpCounts {
  comparisons: number;
  writes: number;
}

export type SortEventKind =
  | 'compare'
  | 'swap'
  | 'overwrite'
  | 'mark-sorted'
  | 'pivot'
  | 'partition-bounds'
  | 'merge-copy';

export interface SortState {
  array: number[];
  comparisons: number;
  writes: number;
  done: boolean;
  highlights: Partial<Record<SortEventKind, number[]>>;
  message?: string;
}

export interface SortAlgorithm extends Algorithm<number[], SortState> {
  /** Non-yielding op counter for Complexity Discovery; an order of magnitude
   *  faster than draining the visualization generator. */
  count(input: number[]): OpCounts;
}
