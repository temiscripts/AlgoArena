import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Four entrants → two semifinal winners → one champion. We loop through
// four "frames" so the bracket fills, the champion crowns, and the cycle restarts.
const FRAMES = 4;

const ENTRANTS = ['⚡', '🜂', '⚯', '🐌'];
const SEMI_WINNERS = ['⚡', '⚯'];
const CHAMPION = '⚡';

export function TournamentPreview() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setFrame((f) => (f + 1) % FRAMES), 900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid h-full w-full grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 px-2 text-parchment">
      <div className="flex flex-col items-center gap-2">
        {ENTRANTS.slice(0, 2).map((sigil, i) => (
          <BracketCell key={i} active={frame >= 1} won={frame >= 1 && sigil === SEMI_WINNERS[0]} sigil={sigil} />
        ))}
      </div>
      <Arrow visible={frame >= 1} />
      <div className="flex flex-col items-center justify-around gap-6">
        <BracketCell active={frame >= 2} won={frame >= 3 && SEMI_WINNERS[0] === CHAMPION} sigil={frame >= 1 ? SEMI_WINNERS[0] : '?'} />
        <BracketCell active={frame >= 2} won={frame >= 3 && SEMI_WINNERS[1] === CHAMPION} sigil={frame >= 2 ? SEMI_WINNERS[1] : '?'} />
      </div>
      <Arrow visible={frame >= 3} />
      <motion.div
        initial={false}
        animate={frame >= 3 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.3 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-1"
      >
        <div className="font-display text-3xl text-gold">{frame >= 3 ? CHAMPION : '?'}</div>
        <div className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-gold">Champion</div>
      </motion.div>
      <div className="col-span-5 flex flex-col items-center gap-2">
        {frame === 0 && (
          <div className="flex justify-center gap-2 pt-1">
            {ENTRANTS.slice(2, 4).map((sigil, i) => (
              <BracketCell key={i} active={false} won={false} sigil={sigil} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BracketCell({ sigil, active, won }: { sigil: string; active: boolean; won: boolean }) {
  return (
    <div
      className={
        'flex h-7 w-7 items-center justify-center rounded border text-base transition ' +
        (won
          ? 'border-gold/80 bg-gold/15 text-gold'
          : active
            ? 'border-crimson/70 text-crimson'
            : 'border-bone/40 text-parchment/60')
      }
    >
      {sigil}
    </div>
  );
}

function Arrow({ visible }: { visible: boolean }) {
  return (
    <motion.span
      animate={{ opacity: visible ? 1 : 0.2 }}
      className="font-mono text-xs text-parchment/40"
    >
      ▸
    </motion.span>
  );
}
