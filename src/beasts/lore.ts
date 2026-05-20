export interface BeastStats {
  speed: number;
  memory: number;
  stability: number;
  bestCase: string;
  worstCase: string;
}

export interface BeastMetadata {
  algorithmId: string;
  name: string;
  title: string;
  tagline: string;
  lore: string;
  stats: BeastStats;
  sigil: string;
  accent: 'crimson' | 'gold' | 'teal';
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  strongAgainst: string;
  weakAgainst: string;
}

export const BEASTS: Record<string, BeastMetadata> = {
  bubble: {
    algorithmId: 'bubble',
    name: 'Bubblesnail',
    title: 'The Plodder',
    tagline: 'Slow. Stubborn. Inevitable.',
    lore: 'Slow, simple, and stubbornly persistent. It compares every neighbour it passes. Strong against the small. Crushed by the many.',
    stats: { speed: 1, memory: 5, stability: 5, bestCase: 'sorted', worstCase: 'reversed' },
    sigil: '🐌',
    accent: 'teal',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    strongAgainst: 'already-sorted arrays',
    weakAgainst: 'large reversed inputs',
  },
  insertion: {
    algorithmId: 'insertion',
    name: 'Cardweaver',
    title: 'Hand of the Dealer',
    tagline: 'Each card finds its place.',
    lore: 'A patient dealer of fates. Slides each new arrival into the line where it belongs. Calm with the nearly-sorted. Broken by chaos.',
    stats: { speed: 2, memory: 5, stability: 5, bestCase: 'sorted', worstCase: 'reversed' },
    sigil: '🂠',
    accent: 'teal',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    strongAgainst: 'nearly-sorted arrays',
    weakAgainst: 'fully reversed inputs',
  },
  merge: {
    algorithmId: 'merge',
    name: 'The Twin Wyrms',
    title: 'Of Divided Skies',
    tagline: 'Two halves. One song.',
    lore: 'A pair of serpents that split the world in two, then bind it back stronger than it was. They never miss. They never falter. They never sleep.',
    stats: { speed: 4, memory: 2, stability: 5, bestCase: 'any', worstCase: 'any' },
    sigil: '⚯',
    accent: 'gold',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    strongAgainst: 'consistency on any input',
    weakAgainst: 'memory-constrained battlegrounds',
  },
  quick: {
    algorithmId: 'quick',
    name: 'Lightning Adder',
    title: 'Strike of the Pivot',
    tagline: 'Pick. Strike. Sunder.',
    lore: 'A blur. A flash. A choice. Cleaves the field in two with a single strike. Untouchable on the chaos of war — but show it order, and the snake eats its tail.',
    stats: { speed: 5, memory: 4, stability: 2, bestCase: 'random', worstCase: 'sorted' },
    sigil: '⚡',
    accent: 'crimson',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    strongAgainst: 'random inputs',
    weakAgainst: 'already-sorted inputs (worst-case ambush)',
  },
  heap: {
    algorithmId: 'heap',
    name: 'The Pyrelord',
    title: 'Crowned in Ash',
    tagline: 'The largest burns last.',
    lore: 'Every duel ends at the throne. Forges a pyramid of fire, then plucks the brightest ember from its peak — again, and again, and again — until only embers remain.',
    stats: { speed: 4, memory: 5, stability: 1, bestCase: 'any', worstCase: 'any' },
    sigil: '🜂',
    accent: 'crimson',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
    strongAgainst: 'guaranteed performance on any input',
    weakAgainst: 'cache-sensitive workloads',
  },
};

export const beastFor = (id: string): BeastMetadata => {
  const b = BEASTS[id];
  if (!b) throw new Error(`No beast metadata for algorithm "${id}"`);
  return b;
};
