import { createContext, useContext, type ReactNode } from 'react';

import { useWalkStore } from '../lib/useWalkStore';

type WalkStore = ReturnType<typeof useWalkStore>;

const WalkContext = createContext<WalkStore | null>(null);

export function WalkProvider({ children }: { children: ReactNode }) {
  const store = useWalkStore();
  return <WalkContext.Provider value={store}>{children}</WalkContext.Provider>;
}

export function useWalk() {
  const value = useContext(WalkContext);
  if (!value) {
    throw new Error('useWalk must be used inside WalkProvider');
  }
  return value;
}
