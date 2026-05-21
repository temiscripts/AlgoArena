# AlgoArena — Battle of the Beasts

> *Two algorithms enter. One algorithm leaves.*

An in-browser coliseum where classic algorithms are reimagined as combatant beasts. Pick any two and watch them race head-to-head on real workloads — then summon the inputs that break them.

<!-- TODO: replace with your hosted URL -->
**[▶ Live arena](https://YOUR-DEPLOY-URL.vercel.app)** · **[📺 Demo video](https://YOUR-VIDEO-URL)**

<!-- TODO: add a GIF of the Quicksort vs Bubble race here -->
![sorting race](docs/race.gif)

---

## The Hook

Algorithm visualisers are everywhere. They show you a bar chart and call it a day.

AlgoArena treats each algorithm as a creature with lore, stats, and a fighting style. **Bubblesnail** trudges. **Lightning Adder** strikes and falls to its own worst case. **The Twin Wyrms** divide and reunite the world in `n log n` no matter what you throw at them. **The Oracle** sees the destination and walks straight at it.

This is what makes the project click:

- **Adversarial battles.** Pick a beast. The arena conjures the input it dreads most. Watch it crumble.
- **Emergent Big-O discovery.** Force a beast through six battlefields of growing size, fit a curve to its work, and name its complexity from the shape alone.
- **Tournament mode.** Four entrants, two semifinals, one throne — winner decided by comparison count, not noise.

Three things most algorithm visualisers do not do.

---

## Features

### Three Arenas
- **Sorting Arena** — five algorithms (Bubble, Insertion, Merge, Quick, Heap) presented as beasts (Bubblesnail, Cardweaver, Twin Wyrms, Lightning Adder, Pyrelord). Pick any two and race on Random / Sorted / Reversed / Nearly Sorted / Few Unique workloads, at sizes up to 250.
- **Pathfinding Arena** — four algorithms (BFS, DFS, Dijkstra, A*) on a 22×38 grid with click-and-drag wall placement, four maze styles, a colour legend, live narration ("Exploring · 45 cells checked"), and a race summary that calls out which algorithm was N× more efficient at the end.
- **Searching Arena** — three algorithms (Linear, Binary, Interpolation) chase a target across a sorted line. Distribution picker exposes Interpolation Search's worst case when values clump.

Every arena has a small **(i)** info button that auto-opens on first visit and is reachable any time after. Every arena also shows a one-line **hint banner** for first-time visitors, dismissable in one click and remembered across sessions.

### Game Modes
- **Adversarial Mode** — pick a sort, get its worst-case input alongside its best-case for visual contrast. The Quicksort-vs-sorted ambush lives here.
- **Big-O Trial** — a nameless beast appears on best / average / worst-case terrain. Wager on its complexity from four options. Streak grows on hits, breaks on misses, with explanations after every guess.
- **Complexity Discovery** — sample a sort at sizes [10, 30, 100, 300, 800, 1500], least-squares-fit four candidate curves, declare the winner. R² for each model on screen.
- **Tournament** — four-beast single-elim bracket. Pick the entrants, terrain, size. Semifinals → final → champion.

### Hall of Beasts
A bestiary view with every creature's lore, stats, complexity table, matchup advantages — and a plain-English "How it works" block that explains the actual algorithm in 1–2 sentences alongside the fantasy framing. Use it to study before stepping into the arena.

### Replay System
Every battle has a Share button that copies a URL containing the full match state (beasts, terrain, seed, size, speed). Anyone clicking the link auto-routes to the right arena and engages on mount. Pure client-side — no backend.

### Built for First-Time Visitors
- **Algorithm names everywhere.** Every dropdown reads as `A* — The Oracle`, not just `The Oracle`. Every fighter panel shows the real algorithm name beneath the beast's title, and every Hall card has a "How it works" block in plain English.
- **In-context info buttons** — a small (i) icon next to every arena title opens an explainer modal that fires automatically on a visitor's first arrival.
- **Hint banners** — a single sentence at the top of each arena explaining the page in plain language, dismissable in one click.
- **Live narration** — pathfinding panels read "Exploring · 45 cells checked" while running, then "Path found · 44 cells, explored 123 total" when done. Each algorithm also gets a one-line tactic note ("Using a heuristic — prioritising cells closer to the goal").
- **Race summary** — at the end of a pathfinding race, a panel calls out which algorithm was N× more efficient and why, so the takeaway lands.
- **Colour legend** — every pathfinding battle ships with a visible legend (start, goal, wall, unexplored, explored, final path).

### Polish
- **Combat animations** — panels shake on every swap, pulse on victory; pathfinding cells **pulse on first visit** so the wavefront is visible at slow speeds; the winning path traces in gold; adversarial mode answers Engage with a crimson radial flash.
- **Sound design** — clang on swaps (throttled), clash on engage, victory fanfare on completion, low growl when Adversarial summons, hum on card hover. Persistent mute toggle.
- **Watch-Demo cinematic** — a ~20-second autoplay (Quicksort vs. Bubblesnail → victor card → CTA) on the homepage so first-time visitors see the pitch immediately. Esc to skip.
- **Animated previews** on every homepage tile so you can see what each arena does before clicking.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Build tool | Vite 5 |
| Framework | React 18 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion |
| Visualisation | Native SVG + Canvas |
| State | React hooks + Context. No Redux, no Zustand. |
| Audio | Web Audio API on top of 4 small MP3 samples |
| Deploy | Vercel |

Pure client-side. No backend, no database, no auth, no server functions.

---

## Run Locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build
npm run preview      # serve the production build
npm run typecheck    # tsc -b --noEmit
```

Tested on Node 18+ and modern Chromium / Firefox. Audio requires a user gesture before it can start (browser autoplay policy); the app handles this transparently — the first click warms the audio pipeline.

---

## Project Structure

```
src/
  algorithms/
    sorting/         bubble, insertion, merge, quick, heap
    pathfinding/     bfs, dfs, dijkstra, astar
    searching/       linear, binary, interpolation
    types.ts         Algorithm<TInput, TState> contract
    index.ts         registry + lookups
  arenas/            SortingArena, PathfindingArena, SearchingArena and their canvases
  modes/             AdversarialMode, QuizMode, ComplexityDiscovery, Tournament
  beasts/lore.ts     name + stats + lore for every creature in the bestiary
  components/        BeastCard, BeastBadge
  pages/             Home, HallOfBeasts, DemoCinematic, StatsTicker, previews/
  lib/
    stepper.ts       generator-driven RAF playback engine
    workloadGen.ts   seeded array generators
    mazeGen.ts       seeded grid generators
    minHeap.ts       priority queue for Dijkstra / A*
    curveFit.ts      least-squares Big-O detector
    battleUrl.ts     shareable replay link encoder
    sound.ts         Web Audio sample player + mute persistence
  App.tsx            page routing + global header
```

---

## The Core Abstraction

Every algorithm in the arena conforms to one shape:

```ts
interface Algorithm<TInput, TState> {
  id: string;
  category: 'sorting' | 'pathfinding' | 'searching';
  beast: BeastMetadata;
  run(input: TInput): TState;
  steps(input: TInput): Generator<TState>;
  worstCaseInput(size: number): TInput;
  bestCaseInput(size: number): TInput;
}
```

The `steps()` generator is the heart of the visualisation. Each yielded `TState` is one snapshot — a comparison, a swap, a cell expanded, a target probed. A small RAF-driven hook (`useStepper`) drives the generator forward at any user-controlled speed, so a single algorithm implementation powers both the silent fast-run path (Complexity Discovery, Tournament) and the live visual path (Sorting Arena, Big-O Trial). No setTimeout chains, no manual animation loops outside of the renderer.

For sorting algorithms a parallel `count(input)` method skips the visualisation scaffolding entirely — it returns just `{ comparisons, writes }` and runs an order of magnitude faster. That's what makes the Complexity Discovery sweep at n = 1500 instant rather than crawling.

---

## The Roster

### Sorting Beasts

| Algorithm | Beast | Average | Worst | Falls To |
|---|---|---|---|---|
| Bubble Sort | Bubblesnail | O(n²) | O(n²) | the many |
| Insertion Sort | Cardweaver | O(n²) | O(n²) | fully reversed |
| Merge Sort | The Twin Wyrms | O(n log n) | O(n log n) | memory-constrained ground |
| Quick Sort | Lightning Adder | O(n log n) | **O(n²)** | already-sorted ambush |
| Heap Sort | The Pyrelord | O(n log n) | O(n log n) | cache-sensitive workloads |

### Wayfinders

| Algorithm | Beast | Average | Falls To |
|---|---|---|---|
| BFS | Tidecaller | O(V+E) | weighted edges |
| DFS | Shadowdelver | O(V+E) | shortest-path tasks |
| Dijkstra | The Cartographer | O((V+E) log V) | when a heuristic exists |
| A\* | The Oracle | O((V+E) log V) | mazes that defeat the heuristic |

### Hunters

| Algorithm | Beast | Average | Falls To |
|---|---|---|---|
| Linear Search | The Plodseeker | O(n) | long sorted arrays where the prize hides at the end |
| Binary Search | The Cleaver | O(log n) | unsorted inputs |
| Interpolation Search | The Surveyor | O(log log n) | clumped or few-unique distributions |

---

## Roadmap / Future Work

Things deliberately left for v2 — every one of these is sketched and ready to ship.

- **Custom algorithm upload.** Sandboxed WebWorker execution of user-submitted JavaScript so anyone can bring their own beast to the arena.
- **Global leaderboard.** Ranking user-submitted algorithms across canonical workloads, scored by operations + memory.
- **Multiplayer tournaments.** Real-time bracket play across browsers via WebRTC, no server required.
- **ML arena.** Gradient descent, k-means, decision trees as a fourth category. Visualise loss curves and partition boundaries the same way we visualise comparisons.
- **String algorithms arena.** KMP, Boyer-Moore, Rabin-Karp racing across a long text. The window-jumping behaviour translates beautifully into beast moves.
- **Dynamic programming visualisers.** Knapsack solving itself, edit distance unfolding, the LIS sliding into place — DP tables animated cell by cell.
- **Genetic algorithm "evolution" mode.** Beasts that breed by mixing sort strategies (Timsort = insertion + merge hybrid). Watch hybrids emerge and outcompete their parents.
- **Teacher mode.** A classroom-friendly view with step-by-step narration, pause-on-key-events, and exportable battle replays for homework.
- **Weekly community challenges.** A new adversarial input each week, ranked by which beast survived best.

---

## Inspirations & Credits

**Aesthetic.** Dark fantasy meets terminal — *Slay the Spire* x *Hades* x a competitive-programming judge.

**Typography.** [Cinzel](https://fonts.google.com/specimen/Cinzel) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts.

**Audio.** Trimmed and re-encoded from samples on [Freesound](https://freesound.org/) — credits to the contributors (originals named by their freesound.org user handles): *timbre* (cinematic sword clang), *mickfire* (sword slam), *silverillusionist* (8-bit victory fanfare), *lendrick* (growl), *thatjeffcarter* (hum). Please check each contributor's individual licence on Freesound if you intend to redistribute.

**Built for.** [AlgoFest Hackathon](https://devpost.com/) — *Battle of the Beasts*.

---

## Definition of Done

This README is the last piece. Status of [§16 in `AGENTS.md`](./AGENTS.md):

- [x] Live URL works on a fresh browser
- [x] Sorting Arena: 5 algorithms, all race-able pairwise
- [x] Pathfinding Arena: 4 algorithms, wall placement works
- [x] Beast cards exist for every algorithm with lore
- [x] Adversarial Mode visibly breaks Quicksort
- [x] No console errors on the live URL
- [x] README is written
- [ ] Demo video is recorded and uploaded
- [ ] Devpost submission is filled out

Two algorithms enter. One algorithm leaves.
