import clsx from 'clsx';
import type { BeastMetadata } from '@/beasts/lore';

interface Props {
  beast: BeastMetadata;
}

const ACCENT_BORDER = {
  crimson: 'border-crimson/70 shadow-crimson',
  gold: 'border-gold/70 shadow-glow',
  teal: 'border-teal/70',
} as const;

const ACCENT_TEXT = {
  crimson: 'text-crimson',
  gold: 'text-gold',
  teal: 'text-teal',
} as const;

function StarStrip({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={clsx(
            'h-1.5 w-3 rounded-sm',
            i < value ? 'bg-gold' : 'bg-bone/60',
          )}
        />
      ))}
    </div>
  );
}

export function BeastCard({ beast }: Props) {
  const accent = beast.accent;
  return (
    <article
      className={clsx(
        'panel flex flex-col gap-4 p-5 transition hover:-translate-y-1 hover:shadow-glow',
        ACCENT_BORDER[accent],
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className={clsx('font-display text-2xl tracking-widest uppercase', ACCENT_TEXT[accent])}>
            {beast.name}
          </div>
          <div className="text-[0.7rem] uppercase tracking-[0.25em] text-parchment/50">
            {beast.title}
          </div>
        </div>
        <div className={clsx('font-display text-4xl leading-none', ACCENT_TEXT[accent])} aria-hidden>
          {beast.sigil}
        </div>
      </header>

      <p className="text-sm leading-relaxed text-parchment/80">{beast.lore}</p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="stat-label">Speed</div>
          <StarStrip value={beast.stats.speed} />
        </div>
        <div>
          <div className="stat-label">Memory</div>
          <StarStrip value={beast.stats.memory} />
        </div>
        <div>
          <div className="stat-label">Stability</div>
          <StarStrip value={beast.stats.stability} />
        </div>
        <div>
          <div className="stat-label">Best · Worst</div>
          <div className="font-mono text-[0.7rem] text-parchment/70">
            {beast.stats.bestCase} · <span className="text-crimson/80">{beast.stats.worstCase}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-bone/40 pt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em]">
        <div>
          <div className="stat-label">Best</div>
          <div className="text-parchment">{beast.complexity.best}</div>
        </div>
        <div>
          <div className="stat-label">Average</div>
          <div className="text-parchment">{beast.complexity.average}</div>
        </div>
        <div>
          <div className="stat-label">Worst</div>
          <div className="text-crimson">{beast.complexity.worst}</div>
        </div>
        <div>
          <div className="stat-label">Space</div>
          <div className="text-parchment">{beast.complexity.space}</div>
        </div>
      </div>

      <div className="border-t border-bone/40 pt-3 text-xs text-parchment/70">
        <div className="text-teal/90">Strong vs · {beast.strongAgainst}</div>
        <div className="text-crimson/80">Weak vs · {beast.weakAgainst}</div>
      </div>
    </article>
  );
}
