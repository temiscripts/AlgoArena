import { useEffect, useState } from 'react';
import { isMuted, setMuted as setMutedGlobal, subscribeMuted } from './sound';

export function useMuted(): [boolean, (next: boolean) => void] {
  const [muted, setLocal] = useState(isMuted());

  useEffect(() => {
    const unsubscribe = subscribeMuted(setLocal);
    return () => {
      unsubscribe();
    };
  }, []);

  return [muted, setMutedGlobal];
}
