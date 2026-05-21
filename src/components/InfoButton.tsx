import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  /** Stable id — also used to auto-open on first visit. */
  id: string;
  /** Modal title. */
  title: string;
  /** Modal body — string or rich content. */
  children: React.ReactNode;
}

const STORAGE_PREFIX = 'algoarena.info.';

function hasSeen(id: string): boolean {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + id) === '1';
  } catch {
    return true;
  }
}

function markSeen(id: string) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + id, '1');
  } catch {
    /* private mode */
  }
}

export function InfoButton({ id, title, children }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  // Auto-open the first time a visitor reaches this arena, so they always see
  // the explainer at least once. Subsequent opens are user-triggered only.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasSeen(id)) {
      setOpen(true);
      markSeen(id);
    }
  }, [id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="What am I seeing?"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-bone/60 font-display text-xs text-parchment/70 transition hover:border-gold/60 hover:text-gold"
        title="What am I seeing?"
      >
        i
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4 py-8 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="panel max-w-xl border-gold/50 p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl tracking-[0.25em] uppercase text-gold">
                  {title}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded border border-bone/50 px-2 py-0.5 font-display text-[0.6rem] uppercase tracking-[0.25em] text-parchment/70 hover:border-gold/60 hover:text-gold"
                >
                  Close · Esc
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-parchment/80">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
