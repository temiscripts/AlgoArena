import { ALL_ALGORITHMS } from '@/algorithms';
import { BeastCard } from '@/components/BeastCard';

export function HallOfBeasts() {
  const sorting = ALL_ALGORITHMS.filter((a) => a.category === 'sorting');
  const pathfinding = ALL_ALGORITHMS.filter((a) => a.category === 'pathfinding');

  return (
    <section className="flex flex-col gap-10">
      <header>
        <h2 className="font-display text-3xl tracking-widest uppercase text-parchment">
          Hall of Beasts
        </h2>
        <p className="text-sm text-parchment/60">
          Every creature in the arena, with their lore, their gifts, and the ground on which they fall.
        </p>
      </header>

      <div>
        <h3 className="mb-4 font-display text-sm tracking-[0.3em] uppercase text-gold">
          The Sorting Brood
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorting.map((a) => (
            <BeastCard key={a.id} beast={a.beast} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-sm tracking-[0.3em] uppercase text-teal">
          The Wayfinders
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pathfinding.map((a) => (
            <BeastCard key={a.id} beast={a.beast} />
          ))}
        </div>
      </div>
    </section>
  );
}
