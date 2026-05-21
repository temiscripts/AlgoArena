import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  /** Stable identifier for this hint — used as a localStorage key so it stays dismissed. */
  id: string;
  /** The hint copy. Single sentence preferred. */
  message: string;
  /** External trigger to force-dismiss the hint (e.g. when a race starts). */
  externalDismissCount?: number;
}

const STORAGE_PREFIX = 'algoarena.hint.';

function readDismissed(id: string): boolean {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + id) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(id: string) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + id, '1');
  } catch {
    /* private mode */
  }
}

export function ArenaHint({ id, message, externalDismissCount }: Props) {
  const [dismissed, setDismissed] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : readDismissed(id),
  );

  const dismiss = () => {
    writeDismissed(id);
    setDismissed(true);
  };

  useEffect(() => {
    if (externalDismissCount && externalDismissCount > 0 && !dismissed) {
      dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalDismissCount]);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between gap-3 rounded-md border border-gold/50 bg-gold/5 px-3 py-2 text-xs text-parchment/80"
          role="status"
        >
          <span>
            <span className="mr-2 font-display tracking-[0.25em] uppercase text-gold">Tip</span>
            {message}
          </span>
          <button
            onClick={dismiss}
            className="rounded border border-gold/40 px-2 py-0.5 font-display text-[0.6rem] uppercase tracking-[0.25em] text-gold hover:bg-gold/10"
            aria-label="Dismiss tip"
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
