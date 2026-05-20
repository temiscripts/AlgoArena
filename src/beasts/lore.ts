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
  bfs: {
    algorithmId: 'bfs',
    name: 'Tidecaller',
    title: 'Of the Hundred Mouths',
    tagline: 'Floods every passage at once.',
    lore: 'Releases a wave that spreads outward in equal measure, swallowing the map in concentric rings. Finds the shortest path because it cannot do otherwise — the tide reaches everywhere at once.',
    stats: { speed: 3, memory: 2, stability: 5, bestCase: 'unweighted', worstCase: 'sparse target' },
    sigil: '🌊',
    accent: 'teal',
    complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
    strongAgainst: 'shortest paths on unweighted grids',
    weakAgainst: 'weighted edges (use Dijkstra instead)',
  },
  dfs: {
    algorithmId: 'dfs',
    name: 'Shadowdelver',
    title: 'Of the Long Corridor',
    tagline: 'Plunges. Retreats. Plunges again.',
    lore: 'Drives into the dark until it strikes stone, then crawls back to the last fork and tries the next door. Reckless. Stubborn. Sometimes lucky. Almost never optimal.',
    stats: { speed: 3, memory: 4, stability: 1, bestCase: 'lucky path', worstCase: 'wrong direction' },
    sigil: '🕳',
    accent: 'crimson',
    complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
    strongAgainst: 'maze topology, cycle detection',
    weakAgainst: 'shortest-path problems (no guarantee)',
  },
  dijkstra: {
    algorithmId: 'dijkstra',
    name: 'The Cartographer',
    title: 'Keeper of Distances',
    tagline: 'Measures every road before walking it.',
    lore: 'Carries a ledger of every cost. Never assumes; always weighs. Slow to commit, impossible to fool. Will find the cheapest path even if it has to weigh the whole world.',
    stats: { speed: 2, memory: 2, stability: 5, bestCase: 'sparse graph', worstCase: 'dense graph' },
    sigil: '🗺',
    accent: 'gold',
    complexity: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)', space: 'O(V)' },
    strongAgainst: 'weighted graphs with no negative edges',
    weakAgainst: 'when you already have a heuristic (A* dominates)',
  },
  astar: {
    algorithmId: 'astar',
    name: 'The Oracle',
    title: 'Whose Eyes See the End',
    tagline: 'Sees the destination. Walks toward it.',
    lore: 'Born with a vision of the goal, the Oracle weighs each step against the road remaining. Wastes no breath on dead ends. Where Dijkstra ponders, the Oracle strides.',
    stats: { speed: 5, memory: 3, stability: 4, bestCase: 'good heuristic', worstCase: 'pathological maze' },
    sigil: '✦',
    accent: 'gold',
    complexity: { best: 'O(E)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)', space: 'O(V)' },
    strongAgainst: 'navigating large open spaces',
    weakAgainst: 'mazes that defeat the heuristic',
  },
  linear: {
    algorithmId: 'linear',
    name: 'The Plodseeker',
    title: 'Tracker of Footsteps',
    tagline: 'One door at a time.',
    lore: 'Walks the line, knocking on every door in turn. Slow, untiring, unblinking. Will find anything — given enough doors.',
    stats: { speed: 1, memory: 5, stability: 5, bestCase: 'first match', worstCase: 'last or missing' },
    sigil: '🚶',
    accent: 'teal',
    complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    strongAgainst: 'unsorted inputs',
    weakAgainst: 'long sorted arrays where the prize hides at the end',
  },
  binary: {
    algorithmId: 'binary',
    name: 'The Cleaver',
    title: 'Halver of Worlds',
    tagline: 'Above. Below. Choose.',
    lore: "Steps to the middle and asks one question: is the prize above or below? Cleaves the world in two, then cleaves again, and again. There is no place to hide for long.",
    stats: { speed: 5, memory: 5, stability: 5, bestCase: 'middle match', worstCase: 'edge match' },
    sigil: '⚔',
    accent: 'gold',
    complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    strongAgainst: 'large sorted arrays',
    weakAgainst: 'unsorted inputs (cannot operate)',
  },
  interpolation: {
    algorithmId: 'interpolation',
    name: 'The Surveyor',
    title: 'Reader of Distances',
    tagline: 'Guess from the gap.',
    lore: "Looks at the lowest and the highest, and the prize sought, and reckons where the prize must lie. Lands close on the first leap when the numbers are even. Stumbles when the field is clumped.",
    stats: { speed: 5, memory: 5, stability: 3, bestCase: 'uniform distribution', worstCase: 'clumped values' },
    sigil: '◈',
    accent: 'crimson',
    complexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)', space: 'O(1)' },
    strongAgainst: 'large sorted arrays with even spacing',
    weakAgainst: 'few-unique or skewed value distributions',
  },
};

export const beastFor = (id: string): BeastMetadata => {
  const b = BEASTS[id];
  if (!b) throw new Error(`No beast metadata for algorithm "${id}"`);
  return b;
};
