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

export type SortAlgorithm = Algorithm<number[], SortState>;
