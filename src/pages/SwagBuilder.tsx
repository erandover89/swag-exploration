import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, X, Plus, ChevronDown, Search, Upload, Pencil } from 'lucide-react';
import { PRODUCTS, COLLECTION_THEMES, COUNTRIES, FEATURED_BRANDS, PRINT_TECHNIQUE_CHIPS, BUDGET_RANGES, type ProductCategory, type PrintTechnique } from '../data/mockData';
import { useCompanyLogo } from '../context/CompanyLogoContext';
import { useDesigns } from '../context/DesignsContext';

const CORE_PRODUCT_IDS = ['1', '2', '4', '6', '9'];
const SESSION_KEY = 'snp-swag-builder';

// ── Filters ──────────────────────────────────────────────────────────────────
const BUDGET_OPTIONS = [
  { label: 'All budgets', min: 0, max: Infinity },
  ...BUDGET_RANGES,
];

const ITEM_COUNTRIES: Record<string, string[]> = {
  '1': ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IL'],
  '2': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '3': ['US', 'GB', 'FR'],
  '4': ['US', 'GB', 'CA'],
  '5': ['US', 'GB'],
  '6': ['US', 'GB', 'DE'],
  '7': ['US'],
  '8': ['US', 'GB', 'DE', 'FR', 'CA'],
  '9': ['US', 'GB', 'DE', 'FR'],
  '10': ['US', 'GB'],
  '11': ['US'],
  '12': ['US', 'GB', 'CA'],
  '13': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '14': ['US', 'GB', 'DE', 'CA', 'AU'],
  '15': ['US', 'GB'],
  '16': ['US', 'CA'],
  '17': ['US'],
  '18': ['US', 'GB', 'DE', 'FR', 'CA'],
  '19': ['US', 'GB', 'CA'],
  '20': ['US', 'CA'],
  '21': ['US', 'GB', 'DE', 'FR', 'CA'],
  '22': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '23': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '24': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '25': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '26': ['US', 'GB', 'CA'],
  '27': ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
};

const SWAG_CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All',          value: 'All'          },
  { label: 'Apparel',      value: 'Apparel'      },
  { label: 'Drinkware',    value: 'Drinkware'    },
  { label: 'Bags',         value: 'Bags'         },
  { label: 'Electronics',  value: 'Electronics'  },
  { label: 'Home & Decor', value: 'Home & Decor' },
  { label: 'Accessories',  value: 'Accessories'  },
];

// ── PillDropdown ──────────────────────────────────────────────────────────────
function PillDropdown({
  label, open, onToggle, onClose, prefix, children, active = false,
}: {
  label: string; open: boolean; onToggle: () => void; onClose: () => void;
  prefix?: React.ReactNode; children: React.ReactNode; active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 border rounded-full px-4 py-2 text-[13px] font-medium transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)] ${
          active
            ? 'bg-snp-indigo-50 border-snp-indigo-600 text-snp-indigo-600'
            : 'bg-white border-snp-navy-200 text-snp-navy-950 hover:bg-snp-navy-50'
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {prefix}{label}
        <ChevronDown className="w-3.5 h-3.5 text-snp-navy-500" />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 bg-white border border-snp-navy-200 rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[180px] py-1.5">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 transition-colors flex items-center justify-between gap-3 ${active ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}

function CheckboxItem({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 transition-colors flex items-center gap-2.5"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'bg-white border-snp-navy-300'}`}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <span className={`${checked ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}>{children}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SwagBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: themeSlug } = useParams<{ theme?: string }>();
  function slugToTitle(slug: string) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  const { saveLogo, clearLogo, logoUrl: savedLogo, allBrandSets, activeBrandSet, activateBrandSet, addProductsToBrandSet } = useCompanyLogo();
  const { designs: savedDesigns } = useDesigns();

  const locationState = location.state as {
    logoUrl?: string;
    productIds?: string[];
    from?: string;
    reviewMode?: boolean;
    fromTheme?: boolean;
    themeName?: string;
  } | null;

  const fromTheme = locationState?.fromTheme ?? !!themeSlug;
  const collectionTheme = themeSlug ? COLLECTION_THEMES.find(t => t.id === themeSlug) : undefined;
  const themeName = locationState?.themeName ?? collectionTheme?.name ?? (themeSlug ? slugToTitle(themeSlug) : undefined);

  // ── Items in kit ────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (locationState?.productIds) return new Set(locationState.productIds);
    // Use theme's curated product list when navigating via slug
    if (collectionTheme) return new Set(collectionTheme.productIds);
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.productIds)) return new Set<string>(s.productIds);
      }
    } catch {}
    return new Set(CORE_PRODUCT_IDS);
  });

  // ── Review state: which items have been sent to the design tool ─────────────
  const [visited, setVisited] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.visited)) return new Set<string>(s.visited);
      }
    } catch {}
    return new Set();
  });

  // ── Logo state ──────────────────────────────────────────────────────────────
  const [sessionLogoUrl, setSessionLogoUrl] = useState<string | undefined>(() => {
    if (locationState?.fromTheme) return undefined;
    if (locationState?.logoUrl) return locationState.logoUrl;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        return s.logoUrl as string | undefined;
      }
    } catch {}
    return savedLogo ?? undefined;
  });

  const hasSavedRef = useRef(false);

  // ── Persist session ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        productIds: [...selected],
        logoUrl: sessionLogoUrl,
        visited: [...visited],
      }));
    } catch {}
  }, [selected, sessionLogoUrl, visited]);

  // ── Picker drawer state ─────────────────────────────────────────────────────
  const [showPicker, setShowPicker]                         = useState(false);
  const [pickerSearch, setPickerSearch]                     = useState('');
  const [swagCategory, setSwagCategory]                     = useState<ProductCategory | 'All'>('All');
  const [pickerBudgetIdx, setPickerBudgetIdx]               = useState(0);
  const [pickerCountry, setPickerCountry]                   = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands]                 = useState<Set<string>>(new Set());
  const [showPickerBudgetMenu, setShowPickerBudgetMenu]     = useState(false);
  const [showPickerCountryMenu, setShowPickerCountryMenu]   = useState(false);
  const [showBrandMenu, setShowBrandMenu]                   = useState(false);
  const [selectedTechniques, setSelectedTechniques]         = useState<Set<PrintTechnique>>(new Set());
  const [showTechMenu, setShowTechMenu]                     = useState(false);
  const [showCategoryMenu, setShowCategoryMenu]             = useState(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showSavedModal, setShowSavedModal]         = useState(false);
  const [showAddLogoModal, setShowAddLogoModal]     = useState(false);
  const addLogoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef    = useRef<HTMLInputElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const kitProducts   = PRODUCTS.filter(p => selected.has(p.id));
  const allReviewed   = kitProducts.length > 0 && kitProducts.every(p => !!savedDesigns[p.id]);
  const reviewedCount = kitProducts.filter(p => !!savedDesigns[p.id]).length;
  const totalCount    = kitProducts.length;
  const hasLogo       = !!sessionLogoUrl;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = showPicker ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showPicker]);

  function applyLogo(url: string) {
    saveLogo(url);
    setSessionLogoUrl(url);
  }

  function handleHeroFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => applyLogo(evt.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleAddLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => { applyLogo(evt.target?.result as string); setShowAddLogoModal(false); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleReviewDesign(productId: string) {
    // Mark as visited before navigating so the state is persisted immediately
    setVisited(prev => new Set([...prev, productId]));
    navigate(`/design/${productId}`, { state: { logoUrl: sessionLogoUrl, from: location.pathname } });
  }

  function removeItem(id: string) {
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    setVisited(prev => { const next = new Set(prev); next.delete(id); return next; });
  }

  function togglePickerItem(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setVisited(v => { const vn = new Set(v); vn.delete(id); return vn; }); }
      else next.add(id);
      return next;
    });
  }

  const [showPartialSaveConfirm, setShowPartialSaveConfirm] = useState(false);

  function handleSaveDesigns() {
    if (!allReviewed && reviewedCount < totalCount) {
      setShowPartialSaveConfirm(true);
    } else {
      commitSave();
    }
  }

  function commitSave() {
    // Persist all kit product IDs to the active brand set so they appear in My Designs
    const allProductIds = kitProducts.map(p => p.id);
    const targetBs = activeBrandSet ?? allBrandSets.find(bs => bs.logoUrl === sessionLogoUrl) ?? null;
    if (targetBs) {
      addProductsToBrandSet(allProductIds, targetBs.id);
    }
    hasSavedRef.current = true;
    setShowPartialSaveConfirm(false);
    setShowSavedModal(true);
  }

  function handleClose() {
    if (fromTheme && !hasSavedRef.current && sessionLogoUrl) {
      clearLogo();
      setSessionLogoUrl(undefined);
    }
    if (locationState?.from) navigate(locationState.from);
    else navigate(-1);
  }

  // ── Picker products ──────────────────────────────────────────────────────────
  const pickerBudget       = BUDGET_OPTIONS[pickerBudgetIdx];
  const pickerCountryLabel = pickerCountry
    ? (() => { const c = COUNTRIES.find(c => c.code === pickerCountry); return c ? `${c.flag} ${c.name}` : 'Country'; })()
    : 'All Countries';
  const categoryLabel  = swagCategory === 'All' ? 'Category' : swagCategory;
  const brandLabel     = selectedBrands.size === 0 ? 'Brand' : selectedBrands.size === 1 ? [...selectedBrands][0] : `${selectedBrands.size} brands`;
  const techLabel      = selectedTechniques.size === 0 ? 'Technique' : selectedTechniques.size === 1 ? PRINT_TECHNIQUE_CHIPS[[...selectedTechniques][0]].label : `${selectedTechniques.size} techniques`;
  const hasPickerFilters = pickerBudgetIdx > 0 || !!pickerCountry || swagCategory !== 'All' || selectedBrands.size > 0 || selectedTechniques.size > 0;
  const searchLower    = pickerSearch.toLowerCase();

  const swagPickerProducts = PRODUCTS
    .filter(p => swagCategory === 'All' || p.category === swagCategory)
    .filter(p => !searchLower || p.name.toLowerCase().includes(searchLower) || p.brand.toLowerCase().includes(searchLower))
    .filter(p => p.price >= pickerBudget.min && p.price <= pickerBudget.max)
    .filter(p => !pickerCountry || (ITEM_COUNTRIES[p.id] ?? ['US']).includes(pickerCountry))
    .filter(p => selectedBrands.size === 0 || selectedBrands.has(p.brand))
    .filter(p => selectedTechniques.size === 0 || selectedTechniques.has(p.printTechnique));

  function closePickerMenus() {
    setShowPickerBudgetMenu(false);
    setShowPickerCountryMenu(false);
    setShowBrandMenu(false);
    setShowTechMenu(false);
    setShowCategoryMenu(false);
  }

  // ── Decorative product thumbnails for brand banner ──────────────────────────
  const bannerProducts = kitProducts.slice(0, 3);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f5f8fc' }}>

      {/* Hidden file inputs */}
      <input ref={heroFileRef}    type="file" accept="image/*,image/svg+xml" className="hidden" onChange={handleHeroFile} />
      <input ref={addLogoFileRef} type="file" accept="image/*,image/svg+xml" className="hidden" onChange={handleAddLogoFile} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-snp-navy-200">
        {/* Mascot badge — centered, overlaps header bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
          <div
            className="w-[64px] h-[64px] rounded-full bg-white border border-snp-navy-200 flex items-center justify-center overflow-hidden"
            style={{ boxShadow: '0px 4px 16px rgba(1,39,84,0.10)' }}
          >
            <img src="/products/wink_1ba45b.png" alt="Snappy" className="w-[46px] h-[46px] object-contain" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-[64px]">
          {/* Close */}
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full border border-snp-navy-200 bg-white flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-snp-navy-600" />
          </button>

          {/* Spacer — mascot sits in absolute center */}
          <div className="flex-1" />

          {/* Save Items */}
          <div className="flex items-center gap-4 shrink-0">

            <button
              onClick={handleSaveDesigns}
              disabled={kitProducts.length === 0}
              className="flex items-center gap-2 h-[48px] px-6 rounded-[16px] text-white text-[14px] font-medium transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5L9.5 5.5H13.5L10.5 8L11.5 12L8 9.5L4.5 12L5.5 8L2.5 5.5H6.5L8 1.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(255,255,255,0.3)" />
              </svg>
              Save Items
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-[120px] pt-[80px] pb-20 flex flex-col gap-10">

        {/* ── Title ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className="text-[40px] leading-[1.3] font-medium"
            style={{ fontFamily: "'Clash Display Variable', 'Clash Display', sans-serif" }}
          >
            {themeName ? (
              <>
                <span style={{ color: '#8093a9' }}>Your </span>
                <span style={{ color: '#3077c9' }}>{themeName}</span>
                <span style={{ color: '#8093a9' }}> theme is almost ready.</span>
                <br />
                <span style={{ color: '#345276' }}>Design each item with your brand to continue</span>
              </>
            ) : (
              <>
                <span style={{ color: '#8093a9' }}>What a great brand!</span>
                <br />
                <span style={{ color: '#345276' }}>Design each item with your brand to continue</span>
              </>
            )}
          </p>
        </div>

        {/* ── Brand banner ───────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between overflow-hidden pl-6 pr-12 py-6 rounded-[32px] shrink-0 w-full relative"
          style={{ backgroundColor: '#f5f8fc', border: '1px solid #e0ebf7', minHeight: 133 }}
        >
          {/* Left: logo + brand info */}
          <div className="flex items-center gap-4 shrink-0">
            {hasLogo ? (
              <div className="flex items-center shrink-0 z-10" style={{ gap: 16 }}>
                <div
                  className="bg-white flex items-center justify-center shrink-0"
                  style={{
                    width: 85, height: 85,
                    borderRadius: 20.4,
                    border: '0.85px solid #eaf1fa',
                    filter: 'drop-shadow(0px 10.2px 6.8px rgba(125,146,169,0.08))',
                    padding: 13.6,
                  }}
                >
                  <img src={sessionLogoUrl} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                </div>
                <div className="flex flex-col shrink-0 whitespace-nowrap" style={{ gap: 4 }}>
                  <p className="text-[12px] font-bold uppercase leading-[1.3]" style={{ fontFamily: "'DM Sans', sans-serif", color: '#8093a9' }}>
                    BRANDING
                  </p>
                  <p className="text-[20px] font-bold not-italic leading-[1.3]" style={{ fontFamily: "'Inter', sans-serif", color: '#012754' }}>
                    Your Brand
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-[14px] font-semibold text-snp-navy-700">Add your logo to preview it on items</p>
                <p className="text-[13px] text-snp-navy-400">PNG · SVG · min 1500×1500px</p>
              </div>
            )}
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch bg-snp-navy-200 mx-6 shrink-0" />

          {/* Replace / Upload logo button */}
          {hasLogo ? (
            <button
              onClick={() => setShowAddLogoModal(true)}
              className="bg-white flex items-center rounded-full hover:bg-snp-navy-50 transition-colors whitespace-nowrap overflow-clip shrink-0"
              style={{ height: 52, paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, gap: 8, border: '1px solid #e0ebf7' }}
            >
              <img src="/products/ready-state/replace-icon.svg" alt="" className="w-5 h-5 shrink-0" />
              <span className="capitalize leading-[1.15]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, color: '#012754' }}>
                Replace Brand
              </span>
            </button>
          ) : (
            <button
              onClick={() => heroFileRef.current?.click()}
              className="flex items-center justify-center gap-2 h-[52px] px-8 rounded-[16px] text-white text-[14px] font-medium hover:opacity-90 transition-all shrink-0"
              style={{ background: 'linear-gradient(180deg, #6ba3e0 0%, #3077c9 100%)', boxShadow: '0px 4px 8px rgba(1,39,84,0.12)' }}
            >
              <Upload className="w-4 h-4" /> Upload Logo
            </button>
          )}

          {/* Right: decorative product thumbnails */}
          <div className="flex items-end gap-2 ml-auto pl-8 shrink-0 relative h-[133px]">
            {bannerProducts.map((p, i) => {
              const rotations = [-15, 30, 0];
              const opacities = [0.5, 0.5, 0.5];
              const sizes = [100, 120, 90];
              return (
                <div
                  key={p.id}
                  className="flex-none"
                  style={{
                    opacity: opacities[i],
                    transform: `rotate(${rotations[i]}deg)`,
                    width: sizes[i],
                    height: sizes[i],
                    position: 'relative',
                    top: i === 1 ? 12 : 0,
                  }}
                >
                  {p.image.startsWith('/') ? (
                    <img src={p.image} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                  ) : (
                    <span style={{ fontSize: sizes[i] * 0.7 }}>{p.image}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Product grid ────────────────────────────────────────────────────── */}
        {kitProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-5 text-center border-2 border-dashed border-snp-navy-200 rounded-[24px] cursor-pointer hover:border-snp-indigo-400 hover:bg-snp-indigo-50 transition-all group"
            onClick={() => setShowPicker(true)}
          >
            <div className="w-16 h-16 rounded-[20px] bg-snp-indigo-50 group-hover:bg-snp-indigo-100 flex items-center justify-center transition-colors">
              <Plus className="w-8 h-8 text-snp-indigo-600" />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-snp-navy-800 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                No items yet
              </p>
              <p className="text-[13px] text-snp-navy-400">Browse the catalog and add products to review</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kitProducts.map(product => {
              const isReviewed = !!savedDesigns[product.id];
              const hasBeenEdited = !!savedDesigns[product.id];
              const isPhoto = product.image.startsWith('/');
              return (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden pb-4 relative bg-white"
                  style={{
                    borderRadius: 16,
                    border: `2px solid ${isReviewed ? '#bbf7d0' : '#e0ebf7'}`,
                    boxShadow: '0px 2px 8px rgba(1,39,84,0.06)',
                    transition: 'border-color 0.25s ease',
                  }}
                >
                  {/* Remove button — top-right corner of the entire card */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white border border-snp-navy-200 flex items-center justify-center text-snp-navy-400 hover:bg-[#fee2e2] hover:border-[#fca5a5] hover:text-[#dc2626] transition-colors"
                    title="Remove from kit"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Image area */}
                  <div
                    className="relative flex flex-col items-center justify-center overflow-hidden rounded-[14px] shrink-0"
                    style={{ background: '#f5f8fc', paddingTop: 80, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, marginBottom: 16 }}
                  >
                    {/* Product image */}
                    <div className="h-[186px] w-[200px] relative flex items-center justify-center">
                      {isPhoto ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      ) : (
                        <span style={{ fontSize: 96 }}>{product.image}</span>
                      )}
                    </div>

                    {/* Reviewed checkmark badge */}
                    {isReviewed && (
                      <div
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: '#22c55e', boxShadow: '0 2px 8px rgba(34,197,94,0.35)' }}
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex flex-col gap-2 px-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-snp-navy-950 truncate">{product.brand}</p>
                      <p className="text-[14px] text-snp-navy-500 leading-snug line-clamp-2">{product.name}</p>
                      <p className="text-[14px] font-medium text-snp-navy-950">${product.price.toFixed(2)}</p>
                    </div>

                    {product.colors.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {product.colors.slice(0, 5).map(c => (
                          <div key={c.hex} className="w-3 h-3 rounded-full border-[1.5px] border-white" style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }} title={c.name} />
                        ))}
                        {product.colors.length > 5 && (
                          <span className="text-[9px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 5}</span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    {isReviewed ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#16a34a]">
                          <Check className="w-3.5 h-3.5" />
                          {hasBeenEdited ? 'Edited & Approved' : 'Reviewed'}
                        </div>
                        <button
                          onClick={() => handleReviewDesign(product.id)}
                          className="w-full h-9 rounded-[10px] border border-snp-navy-200 text-[13px] font-medium text-snp-navy-600 hover:border-snp-indigo-400 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Re-edit design
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReviewDesign(product.id)}
                        className="mt-1 w-full h-9 rounded-[10px] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Design product
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>


      {/* ══════════════════════════════════════════════════════════════════════
          PRODUCT PICKER — right-side curtain drawer
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${showPicker ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowPicker(false)}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-out ${showPicker ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '66vw', maxWidth: 900, minWidth: 360, boxShadow: '-24px 0px 60px 0px rgba(1,39,84,0.18)' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-snp-navy-200 shrink-0">
          <div>
            <h3 className="text-[17px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Add products
            </h3>
            <p className="text-[12px] text-snp-navy-500 mt-0.5">{selected.size} item{selected.size !== 1 ? 's' : ''} in kit</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPicker(false)}
              className="flex items-center gap-2 h-9 px-5 rounded-[12px] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#3077c9' }}
            >
              Done
            </button>
            <button
              onClick={() => setShowPicker(false)}
              className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center hover:bg-snp-navy-200 transition-colors"
            >
              <X className="w-4 h-4 text-snp-navy-600" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-snp-navy-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-500" />
            <input
              type="text"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full h-9 pl-9 pr-9 text-[13px] border border-snp-navy-200 rounded-[10px] focus:outline-none focus:border-snp-indigo-600 focus:ring-1 focus:ring-snp-indigo-600/15 text-snp-navy-950 placeholder:text-snp-navy-300 bg-snp-navy-50 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            {pickerSearch && (
              <button
                onClick={() => setPickerSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-snp-navy-500 hover:text-snp-navy-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills row */}
        <div className="px-6 py-2.5 border-b border-snp-navy-200 shrink-0 flex items-center gap-2 flex-wrap">
          <PillDropdown label={pickerBudgetIdx === 0 ? 'Budget' : pickerBudget.label} open={showPickerBudgetMenu} onToggle={() => { closePickerMenus(); setShowPickerBudgetMenu(v => !v); }} onClose={() => setShowPickerBudgetMenu(false)} active={pickerBudgetIdx > 0}>
            {BUDGET_OPTIONS.map((opt, i) => (
              <DropdownItem key={opt.label} active={i === pickerBudgetIdx} onClick={() => { setPickerBudgetIdx(i); setShowPickerBudgetMenu(false); }}>{opt.label}</DropdownItem>
            ))}
          </PillDropdown>
          <PillDropdown label={pickerCountryLabel} open={showPickerCountryMenu} onToggle={() => { closePickerMenus(); setShowPickerCountryMenu(v => !v); }} onClose={() => setShowPickerCountryMenu(false)} active={!!pickerCountry} prefix={pickerCountry ? (() => { const c = COUNTRIES.find(c => c.code === pickerCountry); return c ? <span className="text-[13px] leading-none mr-0.5">{c.flag}</span> : null; })() : undefined}>
            <DropdownItem active={pickerCountry === null} onClick={() => { setPickerCountry(null); setShowPickerCountryMenu(false); }}>All Countries</DropdownItem>
            {COUNTRIES.map(c => (
              <DropdownItem key={c.code} active={pickerCountry === c.code} onClick={() => { setPickerCountry(c.code); setShowPickerCountryMenu(false); }}>
                <span className="flex items-center gap-2.5"><span className="text-base leading-none">{c.flag}</span>{c.name}</span>
              </DropdownItem>
            ))}
          </PillDropdown>
          <PillDropdown label={categoryLabel} open={showCategoryMenu} onToggle={() => { closePickerMenus(); setShowCategoryMenu(v => !v); }} onClose={() => setShowCategoryMenu(false)} active={swagCategory !== 'All'}>
            {SWAG_CATEGORIES.map(cat => (
              <DropdownItem key={cat.value} active={swagCategory === cat.value} onClick={() => { setSwagCategory(cat.value); setShowCategoryMenu(false); }}>{cat.label}</DropdownItem>
            ))}
          </PillDropdown>
          <PillDropdown label={brandLabel} open={showBrandMenu} onToggle={() => { closePickerMenus(); setShowBrandMenu(v => !v); }} onClose={() => setShowBrandMenu(false)} active={selectedBrands.size > 0}>
            {FEATURED_BRANDS.map(brand => (
              <CheckboxItem key={brand} checked={selectedBrands.has(brand)} onToggle={() => setSelectedBrands(prev => { const n = new Set(prev); n.has(brand) ? n.delete(brand) : n.add(brand); return n; })}>{brand}</CheckboxItem>
            ))}
          </PillDropdown>
          <PillDropdown label={techLabel} open={showTechMenu} onToggle={() => { closePickerMenus(); setShowTechMenu(v => !v); }} onClose={() => setShowTechMenu(false)} active={selectedTechniques.size > 0}>
            {(Object.keys(PRINT_TECHNIQUE_CHIPS) as PrintTechnique[]).map(tech => (
              <CheckboxItem key={tech} checked={selectedTechniques.has(tech)} onToggle={() => setSelectedTechniques(prev => { const n = new Set(prev); n.has(tech) ? n.delete(tech) : n.add(tech); return n; })}>{PRINT_TECHNIQUE_CHIPS[tech].label}</CheckboxItem>
            ))}
          </PillDropdown>
          {hasPickerFilters && (
            <button onClick={() => { setPickerBudgetIdx(0); setPickerCountry(null); setSwagCategory('All'); setSelectedBrands(new Set()); setSelectedTechniques(new Set()); }} className="flex items-center gap-1 text-[12px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="px-6 pt-3 pb-1 shrink-0">
          <span className="text-[12px] text-snp-navy-400">{swagPickerProducts.length} product{swagPickerProducts.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Product grid — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-10">
            {swagPickerProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-8 h-8 text-[#c5d5e8] mb-3" />
                <p className="text-[14px] font-semibold text-snp-navy-700 mb-1">No products found</p>
                <p className="text-[12px] text-snp-navy-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {swagPickerProducts.map(product => {
                  const isSelected = selected.has(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => togglePickerItem(product.id)}
                      className="relative bg-white rounded-[16px] border-2 overflow-hidden cursor-pointer transition-all"
                      style={{ borderColor: isSelected ? 'var(--snp-indigo-600)' : 'var(--snp-navy-200)', boxShadow: isSelected ? '0px 4px 16px 0px rgba(48,119,201,0.16)' : 'none' }}
                    >
                      <div className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{ backgroundColor: isSelected ? 'var(--snp-indigo-600)' : 'rgba(255,255,255,0.92)', borderColor: isSelected ? 'var(--snp-indigo-600)' : '#d1dce8' }}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="bg-snp-navy-50 h-[140px] flex items-center justify-center overflow-hidden">
                        {product.image.startsWith('/') ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-3" style={{ mixBlendMode: 'multiply' }} />
                        ) : (
                          <span className="text-[44px]">{product.image}</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                        <p className="text-[11px] font-semibold text-snp-navy-950 leading-snug mb-1.5 line-clamp-2">{product.name}</p>
                        <p className="text-[11px] font-bold text-snp-indigo-600">From ${product.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Partial save confirmation ─────────────────────────────────────────── */}
      {showPartialSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowPartialSaveConfirm(false)}>
          <div
            className="relative bg-white rounded-[24px] shadow-[0px_24px_60px_0px_rgba(1,39,84,0.22)] w-full max-w-[400px] p-8 flex flex-col gap-5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px]" style={{ background: '#fff7ed' }}>
              ⚠️
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[20px] font-semibold text-snp-navy-950 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {totalCount - reviewedCount} item{totalCount - reviewedCount !== 1 ? 's' : ''} not yet designed
              </h2>
              <p className="text-[14px] text-snp-navy-500 leading-relaxed">
                {reviewedCount > 0
                  ? `${reviewedCount} of your ${totalCount} items have been designed with your logo. The remaining ${totalCount - reviewedCount} will be saved without a design — you can always go back and edit them.`
                  : `None of your ${totalCount} items have been designed yet. They'll be saved without a logo or design applied.`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={commitSave}
                className="w-full h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: '#3077c9' }}
              >
                Save anyway
              </button>
              <button
                onClick={() => setShowPartialSaveConfirm(false)}
                className="w-full h-11 rounded-[12px] border border-snp-navy-200 text-[14px] font-medium text-snp-navy-600 hover:bg-snp-navy-50 transition-colors"
              >
                Go back and design items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved modal ───────────────────────────────────────────────────────── */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowSavedModal(false)}>
          <div
            className="relative bg-white rounded-[24px] shadow-[0px_24px_60px_0px_rgba(1,39,84,0.22)] w-full max-w-[420px] p-8 flex flex-col gap-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-[16px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)' }}>
              <span className="text-[28px]">✅</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[22px] font-semibold text-snp-navy-950 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {selected.size} item{selected.size !== 1 ? 's' : ''} saved to My Logos
              </h2>
              <p className="text-[14px] text-snp-navy-500 leading-relaxed">
                You can come back to them any time and add them to a collection.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/collection/preview', { state: { productIds: [...selected], logoUrl: sessionLogoUrl } })}
                className="w-full h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ background: '#3077c9' }}
              >
                Send as a collection
              </button>
              <button
                onClick={() => navigate('/designs')}
                className="w-full h-11 rounded-[12px] border border-snp-navy-200 text-[14px] font-medium text-snp-navy-700 hover:bg-snp-navy-50 transition-colors"
              >
                View your designs
              </button>
              <button onClick={() => setShowSavedModal(false)} className="w-full h-11 text-[14px] font-medium text-snp-navy-500 hover:text-snp-navy-700 transition-colors">
                Design more
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Replace Brand modal ───────────────────────────────────────────────── */}
      {showAddLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddLogoModal(false)}>
          <div
            className="relative bg-white rounded-[24px] shadow-[0px_24px_60px_0px_rgba(1,39,84,0.18)] w-full max-w-[440px] mx-4 p-7 flex flex-col gap-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowAddLogoModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center hover:bg-snp-navy-100 transition-colors">
              <X className="w-4 h-4 text-snp-navy-600" />
            </button>

            <div className="flex flex-col gap-0.5">
              <h2 className="text-[18px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Replace brand</h2>
              <p className="text-[13px] text-snp-navy-500">Choose an existing logo or upload a new one.</p>
            </div>

            {/* Previously uploaded logos */}
            {allBrandSets.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Your logos</p>
                <div className="grid grid-cols-3 gap-2">
                  {allBrandSets.map(bs => {
                    const isActive = bs.logoUrl === sessionLogoUrl;
                    return (
                      <button
                        key={bs.id}
                        onClick={() => {
                          activateBrandSet(bs.id);
                          setSessionLogoUrl(bs.logoUrl);
                          setShowAddLogoModal(false);
                        }}
                        className="flex flex-col items-center gap-2 p-3 rounded-[14px] border-2 transition-all hover:border-snp-indigo-400"
                        style={{ borderColor: isActive ? 'var(--snp-indigo-600)' : '#e0ebf7', background: isActive ? '#f0f4ff' : '#f5f8fc' }}
                      >
                        <div
                          className="w-14 h-14 bg-white rounded-[10px] flex items-center justify-center"
                          style={{ border: '0.85px solid #eaf1fa', padding: 8 }}
                        >
                          <img src={bs.logoUrl} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                        </div>
                        <span className="text-[11px] font-medium text-snp-navy-600 truncate w-full text-center leading-tight">
                          {bs.companyName || 'Logo'}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-snp-indigo-600 uppercase tracking-wide">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload new logo */}
            {allBrandSets.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-snp-navy-200" />
                <span className="text-[11px] text-snp-navy-400">or upload a new one</span>
                <div className="flex-1 h-px bg-snp-navy-200" />
              </div>
            )}
            <button onClick={() => addLogoFileRef.current?.click()}
              className="w-full h-10 rounded-[10px] border border-dashed border-snp-navy-300 text-[13px] font-medium text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Upload PNG / SVG
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
