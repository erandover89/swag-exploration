import { createContext, useContext, useState, useRef } from 'react';

const LOGO_KEY            = 'snappy_company_logo';
const BRAND_SETS_KEY      = 'snappy_brand_sets';
const ACTIVE_BS_KEY       = 'snappy_active_brand_set_id';

export interface BrandSet {
  id: string;
  logoUrl: string;
  companyName: string;
  createdAt: string;
  savedProductIds: string[];
}

interface CompanyLogoContextValue {
  logoUrl: string | null;
  /** Increments each time a NEW logo url is saved — used to trigger the branding overlay */
  uploadCount: number;
  /** True while product cards are doing their skeleton "applying" animation */
  isApplying: boolean;
  /** The brand set that was created/activated by the last logo upload */
  activeBrandSet: BrandSet | null;
  allBrandSets: BrandSet[];
  saveLogo: (url: string, companyName?: string, silent?: boolean) => string;
  /** Switch to an existing brand set and trigger the applying animation */
  activateBrandSet: (id: string) => void;
  renameBrandSet: (id: string, name: string) => void;
  deleteBrandSet: (id: string) => void;
  clearLogo: () => void;
  /** Merge these productIds into the active brand set (deduped). Pass brandSetId to target a specific set. */
  addProductsToBrandSet: (productIds: string[], brandSetId?: string) => void;
}

function loadBrandSets(): BrandSet[] {
  try {
    const raw = localStorage.getItem(BRAND_SETS_KEY);
    return raw ? (JSON.parse(raw) as BrandSet[]) : [];
  } catch { return []; }
}

function persistBrandSets(sets: BrandSet[]) {
  try { localStorage.setItem(BRAND_SETS_KEY, JSON.stringify(sets)); } catch {}
}

const CompanyLogoContext = createContext<CompanyLogoContextValue>({
  logoUrl: null,
  uploadCount: 0,
  isApplying: false,
  activeBrandSet: null,
  allBrandSets: [],
  saveLogo: () => '',
  activateBrandSet: () => {},
  renameBrandSet: () => {},
  deleteBrandSet: () => {},
  clearLogo: () => {},
  addProductsToBrandSet: () => {},
});

export function CompanyLogoProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(LOGO_KEY); } catch { return null; }
  });
  const [uploadCount, setUploadCount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [allBrandSets, setAllBrandSets] = useState<BrandSet[]>(loadBrandSets);
  const [activeBrandSetId, setActiveBrandSetId] = useState<string | null>(() => {
    try { return localStorage.getItem(ACTIVE_BS_KEY); } catch { return null; }
  });

  const activeBrandSet = allBrandSets.find(bs => bs.id === activeBrandSetId) ?? null;

  function updateSets(next: BrandSet[]) {
    setAllBrandSets(next);
    persistBrandSets(next);
  }

  function saveLogo(url: string, companyName?: string, silent?: boolean): string {
    const isNew = url !== logoUrl;
    setLogoUrl(url);
    try { localStorage.setItem(LOGO_KEY, url); } catch {}

    if (isNew) {
      if (!silent) setUploadCount(n => n + 1);
      // Clear any in-flight timer
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
      setIsApplying(true);
      applyTimerRef.current = setTimeout(() => {
        setIsApplying(false);
        applyTimerRef.current = null;
      }, 2000);

      // Create a new brand set
      const newSet: BrandSet = {
        id: `bs_${Date.now()}`,
        logoUrl: url,
        companyName: companyName ?? '',
        createdAt: new Date().toISOString(),
        savedProductIds: [],
      };
      const next = [newSet, ...allBrandSets];
      updateSets(next);
      setActiveBrandSetId(newSet.id);
      try { localStorage.setItem(ACTIVE_BS_KEY, newSet.id); } catch {}
      return newSet.id;
    } else if (companyName && activeBrandSetId) {
      // Update company name on the existing active brand set
      const next = allBrandSets.map(bs =>
        bs.id === activeBrandSetId ? { ...bs, companyName } : bs
      );
      updateSets(next);
    }
    return activeBrandSetId ?? '';
  }

  function activateBrandSet(id: string) {
    const bs = allBrandSets.find(x => x.id === id);
    if (!bs) return;
    setLogoUrl(bs.logoUrl);
    try { localStorage.setItem(LOGO_KEY, bs.logoUrl); } catch {}
    setActiveBrandSetId(id);
    try { localStorage.setItem(ACTIVE_BS_KEY, id); } catch {}
    // Always trigger the applying animation so product cards re-position the logo
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    setIsApplying(true);
    applyTimerRef.current = setTimeout(() => {
      setIsApplying(false);
      applyTimerRef.current = null;
    }, 2000);
  }

  function renameBrandSet(id: string, name: string) {
    const next = allBrandSets.map(bs => bs.id === id ? { ...bs, companyName: name } : bs);
    updateSets(next);
  }

  function deleteBrandSet(id: string) {
    const next = allBrandSets.filter(bs => bs.id !== id);
    updateSets(next);
    if (activeBrandSetId === id) {
      const newActive = next[0]?.id ?? null;
      setActiveBrandSetId(newActive);
      setLogoUrl(next[0]?.logoUrl ?? null);
      try {
        if (newActive) localStorage.setItem(ACTIVE_BS_KEY, newActive);
        else localStorage.removeItem(ACTIVE_BS_KEY);
        if (next[0]?.logoUrl) localStorage.setItem(LOGO_KEY, next[0].logoUrl);
        else localStorage.removeItem(LOGO_KEY);
      } catch {}
    }
  }

  function clearLogo() {
    setLogoUrl(null);
    setIsApplying(false);
    if (applyTimerRef.current) { clearTimeout(applyTimerRef.current); applyTimerRef.current = null; }
    try { localStorage.removeItem(LOGO_KEY); } catch {}
    // Note: we keep brand sets in storage — clearing logo doesn't delete history
    setActiveBrandSetId(null);
    try { localStorage.removeItem(ACTIVE_BS_KEY); } catch {}
  }

  function addProductsToBrandSet(productIds: string[], brandSetId?: string) {
    const targetId = brandSetId ?? activeBrandSetId;
    if (!targetId) return;
    setAllBrandSets(prev => {
      const next = prev.map(bs => {
        if (bs.id !== targetId) return bs;
        const merged = Array.from(new Set([...bs.savedProductIds, ...productIds]));
        return { ...bs, savedProductIds: merged };
      });
      persistBrandSets(next);
      return next;
    });
  }

  return (
    <CompanyLogoContext.Provider value={{
      logoUrl, uploadCount, isApplying,
      activeBrandSet, allBrandSets,
      saveLogo, activateBrandSet, renameBrandSet, deleteBrandSet, clearLogo, addProductsToBrandSet,
    }}>
      {children}
    </CompanyLogoContext.Provider>
  );
}

export function useCompanyLogo() {
  return useContext(CompanyLogoContext);
}
