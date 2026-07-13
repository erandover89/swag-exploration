import { createContext, useContext, useState, useCallback } from 'react';
import type { DesignLayer } from '../pages/designTool/types';
import { LOOKBOOKS } from '../data/mockData';
import type { Lookbook } from '../data/mockData';

export type { Lookbook };

// ── Canvas design state (per product, scoped to a lookbook) ───────────────────
// This is the "printfile" data — what the user configured in the design tool.
// A product only has this if the user has actually opened and saved the editor.
// That's the "materialization" moment in the spec.

export interface CanvasDesignState {
  layers: DesignLayer[];
  canvasWidth: number;
  canvasHeight: number;
  recipientColorHexes?: string[];
  hasQualityIssue?: boolean;
  backgroundColor?: string | null;
  approved?: boolean;
  approvedAt?: string;
  editedAfterApproval?: boolean;
  savedAt: string;
}

// Keyed: lookbookId → productId → CanvasDesignState
// A product without an entry here is "preview only" — client-rendered with CSS overlay.
// A product WITH an entry is "materialized" — has real printfile data.
export type ProductDesigns = Record<string, Record<string, CanvasDesignState>>;

// ── Storage ───────────────────────────────────────────────────────────────────

const LOOKBOOKS_KEY = 'snappy_lookbooks';
const DESIGNS_KEY = 'snappy_product_designs';

function loadLookbooks(): Lookbook[] {
  try {
    // Fall back to old key for migration
    const raw = localStorage.getItem(LOOKBOOKS_KEY) ?? localStorage.getItem('snappy_user_designs');
    return raw ? (JSON.parse(raw) as Lookbook[]) : LOOKBOOKS;
  } catch {
    return LOOKBOOKS;
  }
}

function migrateProductDesigns(lookbooks: Lookbook[]): ProductDesigns {
  // Migrate from old flat snappy_saved_designs (productId → state)
  try {
    const oldRaw = localStorage.getItem('snappy_saved_designs');
    if (!oldRaw) return {};
    const oldFlat = JSON.parse(oldRaw) as Record<string, Omit<CanvasDesignState, 'savedAt'>>;
    const result: ProductDesigns = {};
    for (const [productId, state] of Object.entries(oldFlat)) {
      // Scope to the first lookbook that contains this product, or '__global__'
      const lookbook = lookbooks.find(l => l.productIds.includes(productId));
      const key = lookbook?.id ?? '__global__';
      if (!result[key]) result[key] = {};
      result[key][productId] = { ...state, savedAt: new Date().toISOString() };
    }
    return result;
  } catch {
    return {};
  }
}

function loadProductDesigns(lookbooks: Lookbook[]): ProductDesigns {
  try {
    const raw = localStorage.getItem(DESIGNS_KEY);
    if (raw) return JSON.parse(raw) as ProductDesigns;
    return migrateProductDesigns(lookbooks);
  } catch {
    return {};
  }
}

function persistLookbooks(lookbooks: Lookbook[]) {
  try { localStorage.setItem(LOOKBOOKS_KEY, JSON.stringify(lookbooks)); } catch {}
}

function persistProductDesigns(designs: ProductDesigns) {
  try { localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs)); } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId() {
  return `lookbook_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function autoName(existing: Lookbook[], themeName?: string): string {
  const base = themeName ?? 'My Design';
  if (!existing.some(l => l.name === base)) return base;
  let n = 2;
  while (existing.some(l => l.name === `${base} ${n}`)) n++;
  return `${base} ${n}`;
}

// ── Context interface ─────────────────────────────────────────────────────────

interface LookbookContextValue {
  lookbooks: Lookbook[];
  productDesigns: ProductDesigns;

  // Lookbook CRUD
  createLookbook(opts?: { name?: string; logoUrl?: string | null; productIds?: string[]; themeName?: string }): Lookbook;
  updateLookbook(id: string, patch: Partial<Omit<Lookbook, 'id' | 'createdAt'>>): void;
  deleteLookbook(id: string): void;
  getLookbook(id: string): Lookbook | undefined;
  addProducts(lookbookId: string, productIds: string[]): void;
  removeProduct(lookbookId: string, productId: string): void;

  // Canvas state — scoped to (lookbookId, productId)
  getProductDesign(lookbookId: string, productId: string): CanvasDesignState | null;
  saveProductDesign(lookbookId: string, productId: string, state: Omit<CanvasDesignState, 'savedAt'>): void;
  clearProductDesign(lookbookId: string, productId: string): void;
  approveProductDesign(lookbookId: string, productId: string): void;
  revokeProductDesignApproval(lookbookId: string, productId: string): void;

  // Derived
  isMaterialized(lookbookId: string, productId: string): boolean;
  // Searches all lookbooks — for read-only use cases (previews, product detail, etc.)
  getAnyProductDesign(productId: string): CanvasDesignState | null;
}

// ── Provider ──────────────────────────────────────────────────────────────────

const LookbookContext = createContext<LookbookContextValue>({
  lookbooks: [],
  productDesigns: {},
  createLookbook: () => { throw new Error('LookbookProvider missing'); },
  updateLookbook: () => {},
  deleteLookbook: () => {},
  getLookbook: () => undefined,
  addProducts: () => {},
  removeProduct: () => {},
  getProductDesign: () => null,
  saveProductDesign: () => {},
  clearProductDesign: () => {},
  approveProductDesign: () => {},
  revokeProductDesignApproval: () => {},
  isMaterialized: () => false,
  getAnyProductDesign: () => null,
});

export function LookbookProvider({ children }: { children: React.ReactNode }) {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>(loadLookbooks);
  const [productDesigns, setProductDesigns] = useState<ProductDesigns>(
    () => loadProductDesigns(loadLookbooks()),
  );

  function updateLookbookList(next: Lookbook[]) {
    setLookbooks(next);
    persistLookbooks(next);
  }

  function createLookbook(opts: { name?: string; logoUrl?: string | null; productIds?: string[]; themeName?: string } = {}): Lookbook {
    const now = new Date().toISOString();
    const lookbook: Lookbook = {
      id: generateId(),
      name: opts.name ?? autoName(lookbooks, opts.themeName),
      logoUrl: opts.logoUrl ?? null,
      productIds: opts.productIds ?? [],
      themeName: opts.themeName,
      createdAt: now,
      updatedAt: now,
    };
    updateLookbookList([lookbook, ...lookbooks]);
    return lookbook;
  }

  function updateLookbook(id: string, patch: Partial<Omit<Lookbook, 'id' | 'createdAt'>>) {
    updateLookbookList(lookbooks.map(l =>
      l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l,
    ));
  }

  function deleteLookbook(id: string) {
    updateLookbookList(lookbooks.filter(l => l.id !== id));
    setProductDesigns(prev => {
      const next = { ...prev };
      delete next[id];
      persistProductDesigns(next);
      return next;
    });
  }

  function getLookbook(id: string): Lookbook | undefined {
    return lookbooks.find(l => l.id === id);
  }

  function addProducts(lookbookId: string, productIds: string[]) {
    updateLookbookList(lookbooks.map(l => {
      if (l.id !== lookbookId) return l;
      const merged = Array.from(new Set([...l.productIds, ...productIds]));
      return { ...l, productIds: merged, updatedAt: new Date().toISOString() };
    }));
  }

  function removeProduct(lookbookId: string, productId: string) {
    updateLookbookList(lookbooks.map(l => {
      if (l.id !== lookbookId) return l;
      return { ...l, productIds: l.productIds.filter(id => id !== productId), updatedAt: new Date().toISOString() };
    }));
  }

  function getProductDesign(lookbookId: string, productId: string): CanvasDesignState | null {
    return productDesigns[lookbookId]?.[productId] ?? null;
  }

  const saveProductDesign = useCallback((
    lookbookId: string,
    productId: string,
    state: Omit<CanvasDesignState, 'savedAt'>,
  ) => {
    setProductDesigns(prev => {
      const existing = prev[lookbookId]?.[productId];
      const next: ProductDesigns = {
        ...prev,
        [lookbookId]: {
          ...prev[lookbookId],
          [productId]: {
            ...state,
            approved: existing?.approved ?? false,
            approvedAt: existing?.approvedAt,
            editedAfterApproval: existing?.approved ? true : false,
            savedAt: new Date().toISOString(),
          },
        },
      };
      persistProductDesigns(next);
      return next;
    });
  }, []);

  function clearProductDesign(lookbookId: string, productId: string) {
    setProductDesigns(prev => {
      const bucket = { ...(prev[lookbookId] ?? {}) };
      delete bucket[productId];
      const next = { ...prev, [lookbookId]: bucket };
      persistProductDesigns(next);
      return next;
    });
  }

  function approveProductDesign(lookbookId: string, productId: string) {
    setProductDesigns(prev => {
      const existing = prev[lookbookId]?.[productId];
      if (!existing) return prev;
      const next: ProductDesigns = {
        ...prev,
        [lookbookId]: {
          ...prev[lookbookId],
          [productId]: { ...existing, approved: true, approvedAt: new Date().toISOString(), editedAfterApproval: false },
        },
      };
      persistProductDesigns(next);
      return next;
    });
  }

  function revokeProductDesignApproval(lookbookId: string, productId: string) {
    setProductDesigns(prev => {
      const existing = prev[lookbookId]?.[productId];
      if (!existing) return prev;
      const next: ProductDesigns = {
        ...prev,
        [lookbookId]: {
          ...prev[lookbookId],
          [productId]: { ...existing, approved: false, approvedAt: undefined, editedAfterApproval: false },
        },
      };
      persistProductDesigns(next);
      return next;
    });
  }

  function isMaterialized(lookbookId: string, productId: string): boolean {
    return !!productDesigns[lookbookId]?.[productId];
  }

  function getAnyProductDesign(productId: string): CanvasDesignState | null {
    for (const bucket of Object.values(productDesigns)) {
      if (bucket[productId]) return bucket[productId];
    }
    return null;
  }

  return (
    <LookbookContext.Provider value={{
      lookbooks,
      productDesigns,
      createLookbook,
      updateLookbook,
      deleteLookbook,
      getLookbook,
      addProducts,
      removeProduct,
      getProductDesign,
      saveProductDesign,
      clearProductDesign,
      approveProductDesign,
      revokeProductDesignApproval,
      isMaterialized,
      getAnyProductDesign,
    }}>
      {children}
    </LookbookContext.Provider>
  );
}

export function useLookbooks() {
  return useContext(LookbookContext);
}
