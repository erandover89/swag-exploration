// Backward-compat shim — new code should import useLookbooks() from LookbookContext.
// This file maps the old useDesigns() API onto the unified LookbookContext.
// Only read operations are mapped here; writes go through useLookbooks() directly.

import { useLookbooks, type CanvasDesignState } from './LookbookContext';

// Re-export for files that import SavedDesign from here
export type SavedDesign = CanvasDesignState & { productId: string };

export function useDesigns() {
  const { productDesigns } = useLookbooks();

  // Flatten all lookbook buckets into a productId → state map.
  // First encountered entry per product wins (no cross-lookbook conflicts in prototype).
  const designs: Record<string, SavedDesign> = {};
  for (const bucket of Object.values(productDesigns)) {
    for (const [productId, state] of Object.entries(bucket)) {
      if (!designs[productId]) {
        designs[productId] = { ...state, productId };
      }
    }
  }

  return {
    designs,
    // Write stubs — these paths are handled by useLookbooks() in the updated files.
    saveDesign: () => {},
    approveDesign: () => {},
    revokeApproval: () => {},
    clearDesign: () => {},
  };
}

// No-op provider — LookbookProvider in App.tsx is the real one
export function DesignsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
