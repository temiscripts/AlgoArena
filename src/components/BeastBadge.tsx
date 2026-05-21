import clsx from 'clsx';
import type { BeastMetadata } from '@/beasts/lore';

interface Props {
  beast: BeastMetadata;
  compact?: boolean;
}

const ACCENT_BORDER = {
  crimson: 'border-crimson/60',
  gold: 'border-gold/60',
  teal: 'border-teal/60',
} as const;

const ACCENT_TEXT = {
  crimson: 'text-crimson',
  gold: 'text-gold',
  teal: 'text-teal',
} as const;

export function BeastBadge({ beast, compact = false }: Props) {
  return (
    <div className={clsx('panel flex items-center gap-3 px-3 py-2', ACCENT_BORDER[beast.accent])}>
      <span
        className={clsx('font-display text-2xl leading-none', ACCENT_TEXT[beast.accent])}
        aria-hidden
      >
        {beast.sigil}
      </span>
      <div className="min-w-0">
        <div className="font-display text-sm tracking-widest uppercase">{beast.name}</div>
        {!compact && (
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-parchment/50">
            {beast.title}
          </div>
        )}
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-parchment/70">
          {beast.algoName}
        </div>
      </div>
    </div>
  );
}
