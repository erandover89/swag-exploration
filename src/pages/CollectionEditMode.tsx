import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X, Plus, ChevronDown, Pencil, Search, HelpCircle, Settings, Upload } from 'lucide-react';
import { PRODUCTS, PRINT_TECHNIQUE_CHIPS, MY_BULK_ORDERS, BUDGET_RANGES, type ProductCategory, type PrintTechnique } from '../data/mockData';
import { useCompanyLogo } from '../context/CompanyLogoContext';

const CORE_PRODUCT_IDS = ['1', '2', '4', '6', '9'];

// ── Filters ──────────────────────────────────────────────────────────────────
const BUDGET_OPTIONS = [
  { label: 'All Budgets', min: 0, max: Infinity },
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
};
function itemCountries(id: string) { return ITEM_COUNTRIES[id] ?? ['US']; }

const SWAG_CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All',          value: 'All'          },
  { label: 'Apparel',      value: 'Apparel'      },
  { label: 'Drinkware',    value: 'Drinkware'    },
  { label: 'Bags',         value: 'Bags'         },
  { label: 'Electronics',  value: 'Electronics'  },
  { label: 'Home & Decor', value: 'Home & Decor' },
  { label: 'Accessories',  value: 'Accessories'  },
];

const SHIPPING_REGIONS = [
  { code: 'US',   label: 'United States', short: 'US',   flag: '🇺🇸', countries: ['US']              },
  { code: 'EU',   label: 'Europe',        short: 'EU',   flag: '🇪🇺', countries: ['GB', 'DE', 'FR', 'IL'] },
  { code: 'CA',   label: 'Canada',        short: 'CA',   flag: '🇨🇦', countries: ['CA']              },
  { code: 'APAC', label: 'Asia Pacific',  short: 'APAC', flag: '🌏',  countries: ['AU']              },
];



// Derived picker filter options (on-demand products only)
const PICKER_BRANDS = [...new Set(PRODUCTS.filter(p => p.type === 'on-demand').map(p => p.brand))].sort();
const PICKER_TECHNIQUES = [...new Set(PRODUCTS.filter(p => p.type === 'on-demand').map(p => p.printTechnique))] as PrintTechnique[];
const PICKER_COLORS: { hex: string; name: string }[] = (() => {
  const map = new Map<string, string>();
  PRODUCTS.filter(p => p.type === 'on-demand').forEach(p =>
    p.colors.forEach(c => { if (!map.has(c.hex)) map.set(c.hex, c.name); })
  );
  return [...map.entries()].map(([hex, name]) => ({ hex, name }));
})();


// Badge color map
const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  POPULAR:     { bg: 'var(--snp-indigo-50)',  text: 'var(--snp-indigo-600)' },
  PREMIUM:     { bg: 'var(--snp-purple-100)', text: 'var(--snp-purple-700)' },
  SUSTAINABLE: { bg: '#f0fdf4', text: '#16a34a' },
};


// ── PillDropdown ─────────────────────────────────────────────────────────────
function PillDropdown({
  label, open, onToggle, onClose, prefix, children, variant = 'pill',
}: {
  label: string; open: boolean; onToggle: () => void; onClose: () => void;
  prefix?: React.ReactNode; children: React.ReactNode;
  variant?: 'pill' | 'outlined';
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

  const btnClass = variant === 'outlined'
    ? 'flex items-center gap-2 bg-white border border-[#d1dce8] rounded-[10px] px-4 h-10 text-[13px] font-medium text-snp-navy-950 hover:border-snp-indigo-600 transition-colors'
    : 'flex items-center gap-2 bg-white border border-snp-navy-200 rounded-full px-4 py-2 text-[13px] font-medium text-snp-navy-950 hover:bg-snp-navy-50 transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]';

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={onToggle}
        className={btnClass}
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


// ── Main component ────────────────────────────────────────────────────────────
export function CollectionEditMode() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { state }   = location;
  const { logoUrl: contextLogo, isApplying, allBrandSets, saveLogo, clearLogo } = useCompanyLogo();
  const locationState = state as { logoUrl?: string; productIds?: string[]; themeName?: string; newCollection?: boolean; from?: string } | null;

  const isNewCollection = !!locationState?.newCollection;
  const fromReview = locationState?.from === '/collection/preview';

  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(
    locationState?.logoUrl ?? contextLogo ?? undefined
  );
  const [showLogoModal, setShowLogoModal] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    saveLogo(url, file.name.replace(/\.[^.]+$/, ''));
    setCurrentLogoUrl(url);
    setShowLogoModal(false);
    e.target.value = '';
  }


  // Collection name — when fromReview the themeName is already the full name
  const initialName = locationState?.themeName
    ? (fromReview ? locationState.themeName : `${locationState.themeName} Collection`)
    : 'My Collection';
  const [collectionName, setCollectionName] = useState(initialName);
  const [isEditingName, setIsEditingName]   = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Selected items — when coming from "new collection" context, use only the passed IDs (no fallback)
  const [selected, setSelected] = useState<Set<string>>(
    new Set(isNewCollection ? (locationState?.productIds ?? []) : (locationState?.productIds ?? CORE_PRODUCT_IDS))
  );

  // Budget & region (header dropdowns)
  const [budgetIdx, setBudgetIdx]               = useState(0);
  const [selectedRegions, setSelectedRegions]   = useState<Set<string>>(new Set(['US']));
  const [activeRegion, setActiveRegion]         = useState<string | null>('US');
  const [showBudgetMenu, setShowBudgetMenu]     = useState(false);
  const [showCountryMenu, setShowCountryMenu]   = useState(false);
  const addRegionRef = useRef<HTMLDivElement>(null);

  // Picker drawer
  const [showPicker, setShowPicker]                       = useState(false);
  const [pickerTab, setPickerTab]                         = useState<'catalog' | 'inventory'>('catalog');
  const [pickerSearch, setPickerSearch]                   = useState('');
  const [swagCategory, setSwagCategory]                   = useState<ProductCategory | 'All'>('All');
  const [filterBrands, setFilterBrands]                   = useState<Set<string>>(new Set());
  const [filterTechniques, setFilterTechniques]           = useState<Set<PrintTechnique>>(new Set());
  const [filterColorHexes, setFilterColorHexes]           = useState<Set<string>>(new Set());

  function toggleSet<T>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    return next;
  }

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const codes = [...selectedRegions];
    if (codes.length === 0) { setActiveRegion(null); return; }
    if (!activeRegion || !selectedRegions.has(activeRegion)) setActiveRegion(codes[0]);
  }, [selectedRegions]);

  useEffect(() => {
    if (!showCountryMenu) return;
    function handle(e: MouseEvent) {
      if (addRegionRef.current && !addRegionRef.current.contains(e.target as Node)) setShowCountryMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showCountryMenu]);

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  useEffect(() => {
    document.body.style.overflow = showPicker ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showPicker]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const budget = BUDGET_OPTIONS[budgetIdx];

  function passesFilters(price: number, id: string) {
    const inBudget = price >= budget.min && price <= budget.max;
    const regionDef = SHIPPING_REGIONS.find(r => r.code === activeRegion);
    const inRegion = !activeRegion || !regionDef || regionDef.countries.some(c => itemCountries(id).includes(c));
    return inBudget && inRegion;
  }

  function toggleRegion(code: string) {
    setSelectedRegions(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  const selectedSwag     = PRODUCTS.filter(p => selected.has(p.id));
  const filteredSelected = selectedSwag.filter(p => passesFilters(p.price, p.id));

  function removeItem(id: string) {
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
  }

  function togglePickerItem(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ── Picker products ───────────────────────────────────────────────────────
  const searchLower = pickerSearch.toLowerCase();

  const swagPickerProducts = PRODUCTS
    .filter(p => p.type === 'on-demand')
    .filter(p => swagCategory === 'All' || p.category === swagCategory)
    .filter(p => !searchLower || p.name.toLowerCase().includes(searchLower) || p.brand.toLowerCase().includes(searchLower))
    .filter(p => filterBrands.size === 0 || filterBrands.has(p.brand))
    .filter(p => filterTechniques.size === 0 || filterTechniques.has(p.printTechnique))
    .filter(p => filterColorHexes.size === 0 || p.colors.some(c => filterColorHexes.has(c.hex)));

  // ── Inventory picker items ────────────────────────────────────────────────
  const inventoryItems = MY_BULK_ORDERS
    .filter(o => o.status === 'in-warehouse' || o.status === 'partially-sent')
    .map(o => ({ order: o, product: PRODUCTS.find(p => p.id === o.productId) }))
    .filter((x): x is { order: typeof MY_BULK_ORDERS[0]; product: typeof PRODUCTS[0] } => !!x.product);

  // ── Save ──────────────────────────────────────────────────────────────────
  function doSave() {
    // Saving after editing persists to My Collections + any designed items to My Logos
    const existing = JSON.parse(localStorage.getItem('snappy_my_collections') ?? '[]') as unknown[];
    const entry = { id: Date.now().toString(), name: collectionName, productIds: [...selected], logoUrl: currentLogoUrl, savedAt: new Date().toISOString() };
    localStorage.setItem('snappy_my_collections', JSON.stringify([entry, ...existing]));
    localStorage.setItem('snappy_has_collections', 'true');
    navigate('/collection/preview', {
      state: { logoUrl: currentLogoUrl, productIds: [...selected], collectionName, from: '/collection/edit' },
    });
  }


  return (
    <>
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: 'var(--snp-navy-50)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-200 sticky top-0 z-20 shadow-[0px_1px_0px_0px_var(--snp-navy-200)]">
        <div className="max-w-[1440px] mx-auto px-6 h-[60px] flex items-center">

          {/* Left: quit */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[13px] font-semibold text-snp-navy-500 hover:text-snp-navy-900 transition-colors"
          >
            <X className="w-4 h-4" />
            Quit without saving
          </button>

          {/* Center: name + saved badge */}
          <div className="flex-1 flex justify-center items-center gap-2">
            <span className="text-[15px] font-semibold text-snp-navy-900">{collectionName}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] inline-block" />
              SAVED
            </span>
          </div>

          {/* Right: save */}
          <button
            onClick={doSave}
            disabled={selected.size === 0}
            className="flex items-center gap-2 h-10 px-5 rounded-[10px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#3077c9' }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Hero: editable collection title ─────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-100" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)' }}>
        <div className="max-w-[1440px] mx-auto px-[120px] py-10">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={collectionName}
              onChange={e => setCollectionName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingName(false); }}
              className="text-[40px] font-bold text-snp-navy-950 bg-transparent border-b-2 border-snp-indigo-600 outline-none w-full"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            />
          ) : (
            <button onClick={() => setIsEditingName(true)} className="flex items-center gap-3 group text-left">
              <h1
                className="text-[40px] font-bold text-snp-navy-950 leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {collectionName}
              </h1>
              <Pencil className="w-5 h-5 text-snp-navy-300 group-hover:text-snp-indigo-600 transition-colors shrink-0 mt-2" />
            </button>
          )}
          <p className="text-[14px] text-snp-navy-500 mt-2">A custom gifts &amp; swag collection</p>
        </div>
      </div>

      {/* ── Collection Preview toolbar ───────────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-200">
        <div className="max-w-[1440px] mx-auto px-[120px] py-5 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Collection Preview
            </h2>
            <p className="text-[13px] text-snp-navy-500 mt-0.5">Recipients can choose one gift from the following options</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-[10px] border border-snp-navy-200 flex items-center justify-center hover:bg-snp-navy-50 transition-colors">
              <Settings className="w-4 h-4 text-snp-navy-500" />
            </button>
            <button className="w-9 h-9 rounded-[10px] border border-snp-navy-200 flex items-center justify-center hover:bg-snp-navy-50 transition-colors">
              <HelpCircle className="w-4 h-4 text-snp-navy-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Country tabs + Budget row ────────────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-200">
        <div className="max-w-[1440px] mx-auto px-[120px] flex items-center justify-between h-14">

          {/* Region tabs */}
          <div className="flex items-center h-full gap-0.5">
            {[...selectedRegions].map(code => {
              const region = SHIPPING_REGIONS.find(r => r.code === code);
              if (!region) return null;
              const active = activeRegion === code;
              const count = PRODUCTS.filter(p => selected.has(p.id) && region.countries.some(c => itemCountries(p.id).includes(c))).length;
              return (
                <button
                  key={code}
                  onClick={() => setActiveRegion(code)}
                  className={`flex items-center gap-1.5 h-full px-5 text-[13px] border-b-2 -mb-px transition-all whitespace-nowrap ${
                    active ? 'border-snp-indigo-600 text-snp-navy-950 font-semibold' : 'border-transparent text-snp-navy-600 hover:text-snp-navy-700'
                  }`}
                >
                  <span className="text-base leading-none">{region.flag}</span>
                  <span>{region.short}</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ml-0.5 ${active ? 'bg-snp-indigo-100 text-snp-indigo-700' : 'bg-snp-navy-100 text-snp-navy-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Subtle add-region button */}
            <div ref={addRegionRef} className="relative ml-1 flex items-center">
              <button
                onClick={() => { setShowCountryMenu(v => !v); setShowBudgetMenu(false); }}
                title="Add region"
                className="w-6 h-6 rounded-full border border-dashed border-snp-navy-300 flex items-center justify-center text-snp-navy-400 hover:border-snp-navy-500 hover:text-snp-navy-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
              {showCountryMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-snp-navy-200 rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[180px] py-1.5">
                  {SHIPPING_REGIONS.map(region => (
                    <DropdownItem key={region.code} active={selectedRegions.has(region.code)} onClick={() => toggleRegion(region.code)}>
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{region.flag}</span>
                        {region.label}
                      </span>
                    </DropdownItem>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Budget dropdown */}
          <PillDropdown
            label={budgetIdx === 0 ? '$20–$300' : budget.label}
            open={showBudgetMenu}
            onToggle={() => { setShowBudgetMenu(v => !v); setShowCountryMenu(false); }}
            onClose={() => setShowBudgetMenu(false)}
            variant="outlined"
          >
            {BUDGET_OPTIONS.map((opt, i) => (
              <DropdownItem key={opt.label} active={i === budgetIdx} onClick={() => { setBudgetIdx(i); setShowBudgetMenu(false); }}>
                {opt.label}
              </DropdownItem>
            ))}
          </PillDropdown>
        </div>
      </div>


      {/* ── Products area ────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-[120px] py-8 pb-20">

        {/* Toolbar: Add Products + Gift count */}
        <div className="flex items-center justify-between mb-7">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors shadow-[0px_2px_6px_0px_rgba(1,39,84,0.06)]"
          >
            <Plus className="w-4 h-4" />
            Add Products
          </button>
          <div className="text-right">
            <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
              Gift Options Count <HelpCircle className="w-3 h-3 text-snp-navy-300" />
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-snp-navy-200 bg-white shadow-[0px_2px_6px_0px_rgba(1,39,84,0.06)]">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] inline-block" />
              <span className="text-[15px] font-bold text-snp-navy-950">
                {filteredSelected.length}<span className="text-snp-navy-400">/{selectedSwag.length * 5}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredSelected.map((product, idx) => {
            const badge = product.tags[0];
            const badgeStyle = badge ? BADGE_STYLE[badge] : null;
            const isPinned = idx === 0;

            return (
              <div key={product.id} className="flex flex-col gap-2">
                <div
                  className="group relative bg-white rounded-[16px] overflow-hidden cursor-pointer"
                  style={{
                    border: '1px solid var(--snp-navy-200)',
                    boxShadow: '0px 2px 8px 0px rgba(1,39,84,0.06)',
                    minHeight: 220,
                  }}
                  onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location } })}
                >
                  {/* Hover delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); removeItem(product.id); }}
                    className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white border border-snp-navy-200 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </button>

                  {/* Badge */}
                  {badgeStyle && (
                    <div
                      className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                      style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                    >
                      {badge}
                    </div>
                  )}

                  {/* Pinned tag */}
                  {isPinned && (
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="text-[10px] font-bold text-snp-navy-500 bg-white/90 border border-snp-navy-200 rounded-full px-2 py-0.5 shadow-sm">
                        📌 Pinned
                      </span>
                    </div>
                  )}

                  {/* Product image */}
                  <div className="h-[200px] flex items-center justify-center overflow-hidden p-4 relative">
                    {product.image.startsWith('/') ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                    ) : (
                      <span className="text-[60px]">{product.image}</span>
                    )}
                    {currentLogoUrl && !isApplying && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                          src={currentLogoUrl}
                          alt=""
                          className="w-16 h-16 object-contain"
                          style={{ mixBlendMode: 'multiply', opacity: 0.85 }}
                        />
                      </div>
                    )}
                    {isApplying && (
                      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-[#eef4ff]" />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'product-card-shimmer 1.2s ease-in-out infinite',
                          }}
                        />
                      </div>
                    )}
                  </div>

                </div>

                {/* Product info below card */}
                <div className="px-0.5">
                  <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-wide">{product.brand}</p>
                  <p className="text-[13px] font-semibold text-snp-navy-950 leading-snug line-clamp-2">{product.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[12px] text-snp-navy-500">${product.price}</p>
                    {product.colors.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {product.colors.slice(0, 4).map(c => (
                          <div key={c.hex} className="w-3 h-3 rounded-full border-[1.5px] border-white" style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }} title={c.name} />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-[9px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSelected.length === 0 && selectedSwag.length > 0 && (
            <div className="col-span-full py-12 flex flex-col items-center gap-2 text-center">
              <p className="text-[15px] font-semibold text-snp-navy-700">No items match these filters</p>
              <p className="text-[13px] text-snp-navy-500">
                Your {selectedSwag.length} selected item{selectedSwag.length !== 1 ? 's' : ''} don't ship to this country or are outside the budget range
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PRODUCT PICKER — 75% drawer / curtain
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${showPicker ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowPicker(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col shadow-[-24px_0_60px_rgba(1,39,84,0.18)] transition-transform duration-300 ease-out ${showPicker ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '75%', maxWidth: 1100, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-5 px-7 h-[64px] border-b border-snp-navy-100 shrink-0 bg-white">
          <button
            onClick={() => setShowPicker(false)}
            className="w-8 h-8 rounded-full border border-snp-navy-200 flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-snp-navy-600" />
          </button>
          <h3 className="text-[17px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Add Products
          </h3>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-snp-navy-100 rounded-[10px] p-1 ml-2">
            {(['catalog', 'inventory'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPickerTab(tab)}
                className={`h-7 px-4 rounded-[8px] text-[12px] font-semibold transition-all ${
                  pickerTab === tab
                    ? 'bg-white text-snp-navy-950 shadow-sm'
                    : 'text-snp-navy-500 hover:text-snp-navy-800'
                }`}
              >
                {tab === 'catalog' ? 'Swag Catalog' : 'Your Inventory'}
              </button>
            ))}
          </div>

          {/* Active filter chips (catalog only) */}
          {pickerTab === 'catalog' && (
            <div className="flex items-center gap-2">
              {filterBrands.size > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-snp-indigo-50 text-snp-indigo-700 border border-snp-indigo-200 rounded-full px-3 py-1">
                  {filterBrands.size} brand{filterBrands.size > 1 ? 's' : ''}
                  <button onClick={() => setFilterBrands(new Set())}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterTechniques.size > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-snp-indigo-50 text-snp-indigo-700 border border-snp-indigo-200 rounded-full px-3 py-1">
                  {filterTechniques.size} method{filterTechniques.size > 1 ? 's' : ''}
                  <button onClick={() => setFilterTechniques(new Set())}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterColorHexes.size > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-snp-indigo-50 text-snp-indigo-700 border border-snp-indigo-200 rounded-full px-3 py-1">
                  {filterColorHexes.size} color{filterColorHexes.size > 1 ? 's' : ''}
                  <button onClick={() => setFilterColorHexes(new Set())}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          <div className="flex-1" />
          <button
            onClick={() => setShowPicker(false)}
            className="flex items-center gap-2 h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shrink-0"
            style={{ background: '#3077c9' }}
          >
            Done · {selected.size} selected
          </button>
        </div>

        {/* Body: sidebar + main — split only for catalog tab */}
        <div className="flex flex-1 overflow-hidden">

          {pickerTab === 'inventory' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Warning banner */}
              <div className="flex items-start gap-3 px-6 py-3.5 bg-amber-50 border-b border-amber-200 shrink-0">
                <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                <p className="text-[13px] text-amber-800 font-medium">
                  Items that run out of inventory won't appear in this collection when sent to recipients.
                  Keep an eye on remaining quantities.
                </p>
              </div>
              {/* Inventory grid */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {inventoryItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-[15px] font-semibold text-snp-navy-700 mb-1">No warehouse inventory</p>
                    <p className="text-[13px] text-snp-navy-500">Order bulk items to stock your inventory</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                    {inventoryItems.map(({ order, product }) => {
                      const isSelected = selected.has(product.id);
                      const statusLabel = order.status === 'in-warehouse' ? 'In Warehouse' : 'Partially Sent';
                      const statusColor = order.status === 'in-warehouse' ? { bg: '#dcfce7', text: '#16a34a' } : { bg: '#fef9c3', text: '#92400e' };
                      return (
                        <div
                          key={order.id}
                          onClick={() => togglePickerItem(product.id)}
                          className="relative bg-white rounded-[16px] border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md"
                          style={{
                            borderColor: isSelected ? 'var(--snp-indigo-600)' : 'var(--snp-navy-200)',
                            boxShadow: isSelected ? '0px 4px 16px 0px rgba(48,119,201,0.16)' : undefined,
                          }}
                        >
                          {/* Checkbox */}
                          <div className={`absolute top-3 right-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'bg-white/90 border-snp-navy-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          {/* Status badge */}
                          <div
                            className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase"
                            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                          >
                            {statusLabel}
                          </div>
                          {/* Product image + logo overlay */}
                          <div className="relative h-[160px] bg-[#f8fafc] flex items-center justify-center overflow-hidden p-4">
                            {product.image.startsWith('/') ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                            ) : (
                              <span className="text-[48px]">{product.image}</span>
                            )}
                            {currentLogoUrl && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <img src={currentLogoUrl} alt="" className="w-12 h-12 object-contain" style={{ mixBlendMode: 'multiply', opacity: 0.85 }} />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-3 border-t border-snp-navy-100">
                            <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                            <p className="text-[12px] font-semibold text-snp-navy-950 leading-snug mb-1 line-clamp-2">{product.name}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-snp-navy-500">{order.quantity} units</p>
                              <p className="text-[11px] text-snp-navy-400 truncate max-w-[100px]">{order.name}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {pickerTab === 'catalog' && <>

          {/* Left sidebar — filters */}
          <div className="w-[220px] shrink-0 border-r border-snp-navy-200 overflow-y-auto py-5 px-4 bg-[#fafcff] flex flex-col gap-6">

            {/* Category */}
            <div>
              <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Category</p>
              <div className="flex flex-col gap-0.5">
                {SWAG_CATEGORIES.map(cat => {
                  const active = swagCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSwagCategory(cat.value)}
                      className={`flex items-center gap-2.5 h-8 px-2.5 rounded-[8px] text-[13px] font-medium text-left transition-colors ${
                        active ? 'bg-snp-indigo-50 text-snp-indigo-700' : 'text-snp-navy-700 hover:bg-snp-navy-100'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'border-snp-navy-300 bg-white'
                      }`}>
                        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                      </div>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand */}
            <div>
              <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Brand</p>
              <div className="flex flex-col gap-0.5">
                {PICKER_BRANDS.map(brand => {
                  const active = filterBrands.has(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => setFilterBrands(prev => toggleSet(prev, brand))}
                      className={`flex items-center gap-2.5 h-8 px-2.5 rounded-[8px] text-[13px] font-medium text-left transition-colors ${
                        active ? 'bg-snp-indigo-50 text-snp-indigo-700' : 'text-snp-navy-700 hover:bg-snp-navy-100'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'border-snp-navy-300 bg-white'
                      }`}>
                        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                      </div>
                      <span className="truncate">{brand}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decoration method */}
            <div>
              <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Decoration</p>
              <div className="flex flex-col gap-0.5">
                {PICKER_TECHNIQUES.map(tech => {
                  const active = filterTechniques.has(tech);
                  const chip = PRINT_TECHNIQUE_CHIPS[tech];
                  return (
                    <button
                      key={tech}
                      onClick={() => setFilterTechniques(prev => toggleSet(prev, tech))}
                      className={`flex items-center gap-2.5 h-8 px-2.5 rounded-[8px] text-[13px] font-medium text-left transition-colors ${
                        active ? 'bg-snp-indigo-50 text-snp-indigo-700' : 'text-snp-navy-700 hover:bg-snp-navy-100'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'border-snp-navy-300 bg-white'
                      }`}>
                        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                      </div>
                      {chip?.label ?? tech}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Colors</p>
              <div className="flex flex-wrap gap-2">
                {PICKER_COLORS.map(color => {
                  const active = filterColorHexes.has(color.hex);
                  return (
                    <button
                      key={color.hex}
                      onClick={() => setFilterColorHexes(prev => toggleSet(prev, color.hex))}
                      title={color.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                        active ? 'border-snp-indigo-600 ring-2 ring-snp-indigo-200 scale-110' : 'border-white shadow-sm'
                      }`}
                      style={{ backgroundColor: color.hex, boxShadow: active ? undefined : '0 0 0 1px rgba(1,39,84,0.15)' }}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f8fc]">

            {/* Search bar */}
            <div className="flex items-center gap-3 px-6 py-3.5 border-b border-snp-navy-200 bg-white shrink-0">
              <div className="relative flex-1 max-w-[440px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full h-9 pl-9 pr-9 text-[13px] border border-snp-navy-200 rounded-[10px] bg-snp-navy-50 focus:outline-none focus:border-snp-indigo-600 text-snp-navy-950 placeholder:text-snp-navy-300 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                {pickerSearch && (
                  <button onClick={() => setPickerSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-snp-navy-400 hover:text-snp-navy-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* ── Brand banner ── */}
              {currentLogoUrl ? (
                <div
                  className="relative rounded-[32px] overflow-clip flex items-center mb-5"
                  style={{ height: 100, background: '#f5f8fc', border: '1px solid #e0ebf7', paddingLeft: 24, paddingRight: 32, paddingTop: 16, paddingBottom: 16, gap: 32 }}
                >
                  <div className="flex items-center shrink-0 z-10" style={{ gap: 16 }}>
                    <div
                      className="bg-white flex items-center justify-center shrink-0"
                      style={{ width: 68, height: 68, borderRadius: 16.3, border: '0.85px solid #eaf1fa', filter: 'drop-shadow(0px 8.2px 5.4px rgba(125,146,169,0.08))', padding: 10.9 }}
                    >
                      <img src={currentLogoUrl} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    </div>
                    <div className="flex flex-col shrink-0" style={{ gap: 4 }}>
                      <p className="text-[12px] font-bold uppercase leading-[1.3]" style={{ fontFamily: "'DM Sans', sans-serif", color: '#8093a9' }}>BRANDING</p>
                      <p className="text-[18px] font-bold leading-tight" style={{ fontFamily: "'Inter', sans-serif", color: '#012754' }}>Your Brand</p>
                    </div>
                  </div>
                  <div className="self-stretch shrink-0 z-10" style={{ width: 1, background: '#e0ebf7' }} />
                  <button
                    onClick={() => setShowLogoModal(true)}
                    className="bg-white flex items-center rounded-full hover:bg-snp-navy-50 transition-colors whitespace-nowrap overflow-clip shrink-0 z-10"
                    style={{ height: 42, paddingLeft: 20, paddingRight: 20, gap: 8, border: '1px solid #e0ebf7' }}
                  >
                    <img src="/products/ready-state/replace-icon.svg" alt="" className="w-4 h-4 shrink-0" onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    <span className="capitalize leading-[1.15]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, color: '#012754' }}>Replace Brand</span>
                  </button>
                  <div className="flex-1 z-10" />
                  <button
                    onClick={() => { clearLogo(); setCurrentLogoUrl(undefined); }}
                    className="absolute top-3 right-3 z-20 w-6 h-6 flex items-center justify-center rounded-full text-snp-navy-300 hover:text-snp-navy-600 hover:bg-snp-navy-100 transition-colors"
                    title="Reset logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className="relative rounded-[32px] overflow-clip flex items-center mb-5"
                  style={{ height: 100, background: '#f5f8fc', border: '1px solid #e0ebf7', paddingLeft: 24, paddingRight: 32, paddingTop: 16, paddingBottom: 16, gap: 32 }}
                >
                  <div className="flex flex-col shrink-0 z-10" style={{ gap: 4 }}>
                    <p className="text-[12px] font-bold uppercase leading-[1.3]" style={{ fontFamily: "'DM Sans', sans-serif", color: '#8093a9' }}>BRANDING</p>
                    <p className="text-[18px] font-bold leading-tight" style={{ fontFamily: "'Inter', sans-serif", color: '#012754' }}>Add your logo</p>
                  </div>
                  <div className="self-stretch shrink-0 z-10" style={{ width: 1, background: '#e0ebf7' }} />
                  <button
                    onClick={() => setShowLogoModal(true)}
                    className="bg-white flex items-center rounded-full hover:bg-snp-navy-50 transition-colors whitespace-nowrap shrink-0 z-10"
                    style={{ height: 42, paddingLeft: 20, paddingRight: 20, gap: 8, border: '1px solid #e0ebf7' }}
                  >
                    <Upload className="w-4 h-4 text-snp-indigo-600 shrink-0" />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, color: '#3077c9' }}>Upload Logo</span>
                  </button>
                  <div className="flex-1 z-10" />
                </div>
              )}

              {swagPickerProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-10 h-10 text-snp-navy-200 mb-3" />
                  <p className="text-[15px] font-semibold text-snp-navy-700 mb-1">No products found</p>
                  <p className="text-[13px] text-snp-navy-500">Try adjusting your filters or search</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                  {swagPickerProducts.map(product => {
                    const isSelected = selected.has(product.id);
                    const badge = product.tags[0];
                    const badgeStyle = badge ? BADGE_STYLE[badge] : null;
                    return (
                      <div
                        key={product.id}
                        onClick={() => togglePickerItem(product.id)}
                        className="relative bg-white rounded-[16px] border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md"
                        style={{
                          borderColor: isSelected ? 'var(--snp-indigo-600)' : 'var(--snp-navy-200)',
                          boxShadow: isSelected ? '0px 4px 16px 0px rgba(48,119,201,0.16)' : undefined,
                        }}
                      >
                        {/* Badge top-left */}
                        {badgeStyle && (
                          <div
                            className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase"
                            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                          >
                            {badge}
                          </div>
                        )}
                        {/* Checkbox top-right */}
                        <div className={`absolute top-3 right-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'bg-white/90 border-snp-navy-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        {/* Product image + logo overlay */}
                        <div className="relative h-[160px] bg-[#f8fafc] flex items-center justify-center overflow-hidden p-4">
                          {product.image.startsWith('/') ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                          ) : (
                            <span className="text-[48px]">{product.image}</span>
                          )}
                          {currentLogoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <img
                                src={currentLogoUrl}
                                alt=""
                                className="w-12 h-12 object-contain"
                                style={{ mixBlendMode: 'multiply', opacity: 0.85 }}
                              />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-3 border-t border-snp-navy-100">
                          <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                          <p className="text-[12px] font-semibold text-snp-navy-950 leading-snug mb-1 line-clamp-2">{product.name}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-[12px] font-bold text-snp-indigo-600">${product.price}</p>
                            {product.colors.length > 0 && (
                              <div className="flex items-center gap-0.5">
                                {product.colors.slice(0, 4).map(c => (
                                  <div key={c.hex} className="w-2.5 h-2.5 rounded-full border-[1.5px] border-white" style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }} title={c.name} />
                                ))}
                                {product.colors.length > 4 && (
                                  <span className="text-[8px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 4}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          </>}
        </div>
      </div>

    </div>

    {/* ── Logo file input (hidden) ── */}
    <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />

    {/* ── Logo modal ── */}
    {showLogoModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoModal(false)}>
        <div
          className="relative bg-white rounded-[24px] shadow-[0px_24px_60px_0px_rgba(1,39,84,0.18)] w-full max-w-[440px] mx-4 p-7 flex flex-col gap-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => setShowLogoModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center hover:bg-snp-navy-100 transition-colors">
            <X className="w-4 h-4 text-snp-navy-600" />
          </button>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[18px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {currentLogoUrl ? 'Replace brand' : 'Add your logo'}
            </h2>
            <p className="text-[13px] text-snp-navy-500">
              {currentLogoUrl ? 'Choose an existing logo or upload a new one.' : 'Your logo will be previewed on all product cards.'}
            </p>
          </div>
          {allBrandSets.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Your logos</p>
              <div className="grid grid-cols-3 gap-2">
                {allBrandSets.map(bs => {
                  const isActive = currentLogoUrl === bs.logoUrl;
                  return (
                    <button
                      key={bs.id}
                      onClick={() => { setCurrentLogoUrl(bs.logoUrl); saveLogo(bs.logoUrl, bs.companyName); setShowLogoModal(false); }}
                      className="flex flex-col items-center gap-2 p-3 rounded-[14px] border-2 transition-all hover:border-snp-indigo-400"
                      style={{ borderColor: isActive ? 'var(--snp-indigo-600)' : '#e0ebf7', background: isActive ? '#f0f4ff' : '#f5f8fc' }}
                    >
                      <div className="w-14 h-14 bg-white rounded-[10px] flex items-center justify-center" style={{ border: '0.85px solid #eaf1fa', padding: 8 }}>
                        <img src={bs.logoUrl} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                      </div>
                      <span className="text-[11px] font-medium text-snp-navy-600 truncate w-full text-center leading-tight">
                        {bs.companyName || 'Logo'}
                      </span>
                      {isActive && <span className="text-[10px] font-bold text-snp-indigo-600 uppercase tracking-wide">Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-snp-navy-200" />
            <span className="text-[11px] text-snp-navy-400">{allBrandSets.length > 0 ? 'or upload a new one' : 'upload a logo'}</span>
            <div className="flex-1 h-px bg-snp-navy-200" />
          </div>
          <button onClick={() => logoFileRef.current?.click()}
            className="w-full h-10 rounded-[10px] border border-dashed border-snp-navy-300 text-[13px] font-medium text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Upload PNG / SVG
          </button>
        </div>
      </div>
    )}
    </>
  );
}
