// Backward-compat shim — new code should import useLookbooks() from LookbookContext.
// This file maps the old useUserDesigns() API onto the unified LookbookContext.

import { useLookbooks } from './LookbookContext';
import type { Lookbook } from './LookbookContext';

// Re-export for any files still importing Design from this module
export type Design = Lookbook;

export function useUserDesigns() {
  const {
    lookbooks,
    createLookbook,
    updateLookbook,
    deleteLookbook,
    getLookbook,
    addProducts,
    removeProduct,
  } = useLookbooks();

  return {
    designs: lookbooks,
    createDesign: createLookbook,
    updateDesign: updateLookbook,
    deleteDesign: deleteLookbook,
    getDesign: getLookbook,
    addProducts,
    removeProduct,
  };
}

// No-op provider — LookbookProvider in App.tsx is the real one
export function UserDesignsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
