import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { SEED_STORES, initialsLogo, type DistributorStore } from '../data/storesData';

const LS_KEY = 'snappy_distributor_stores_v1';

interface StoresContextValue {
  stores: DistributorStore[];
  getStore: (idOrSlug: string) => DistributorStore | undefined;
  updateStore: (id: string, patch: Partial<DistributorStore> | ((s: DistributorStore) => Partial<DistributorStore>)) => void;
  addStore: (store: DistributorStore) => void;
  duplicateStore: (id: string) => DistributorStore | undefined;
  removeStore: (id: string) => void;
  resetStores: () => void;
}

const StoresContext = createContext<StoresContextValue | null>(null);

function load(): DistributorStore[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DistributorStore[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* fall through to seeds */ }
  return SEED_STORES;
}

export function StoresProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<DistributorStore[]>(load);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(stores)); } catch { /* quota — demo data only */ }
  }, [stores]);

  const getStore = useCallback(
    (idOrSlug: string) => stores.find(s => s.id === idOrSlug || s.slug === idOrSlug),
    [stores],
  );

  const updateStore = useCallback((id: string, patch: Partial<DistributorStore> | ((s: DistributorStore) => Partial<DistributorStore>)) => {
    setStores(prev => prev.map(s => {
      if (s.id !== id) return s;
      const p = typeof patch === 'function' ? patch(s) : patch;
      return { ...s, ...p, updatedAt: new Date().toISOString().slice(0, 10) };
    }));
  }, []);

  const addStore = useCallback((store: DistributorStore) => {
    setStores(prev => [store, ...prev]);
  }, []);

  const duplicateStore = useCallback((id: string): DistributorStore | undefined => {
    let copy: DistributorStore | undefined;
    setStores(prev => {
      const src = prev.find(s => s.id === id);
      if (!src) return prev;
      const stamp = Date.now().toString(36).slice(-5);
      copy = {
        ...JSON.parse(JSON.stringify(src)) as DistributorStore,
        id: `st-${stamp}`,
        slug: `${src.slug}-copy`,
        name: `${src.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        stats: { revenue30d: 0, orders30d: 0, visitors30d: 0, margin30d: 0 },
        orders: [],
      };
      return [copy, ...prev];
    });
    return copy;
  }, []);

  const removeStore = useCallback((id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
  }, []);

  const resetStores = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setStores(SEED_STORES);
  }, []);

  return (
    <StoresContext.Provider value={{ stores, getStore, updateStore, addStore, duplicateStore, removeStore, resetStores }}>
      {children}
    </StoresContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStores(): StoresContextValue {
  const ctx = useContext(StoresContext);
  if (!ctx) throw new Error('useStores must be used within StoresProvider');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function makeInitialsLogo(name: string, bg: string, fg: string): string {
  const text = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'S';
  return initialsLogo(text, bg, fg);
}
