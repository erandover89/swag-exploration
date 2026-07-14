import { useState, useMemo, useRef, useEffect } from 'react';
import type React from 'react';
import {
  Search, ChevronDown, X, SlidersHorizontal,
  Send, Pencil, Sparkles, Archive, Truck, BookOpen,
  Upload, Plus, Globe, Loader2, ArrowRight,
} from 'lucide-react';
import {
  PRODUCTS, CATEGORIES, COUNTRIES, MY_DESIGNED_ITEMS, FEATURED_BRANDS,
  MY_BULK_ORDERS,
  type ProductCategory, type DesignedItem, type BulkOrder, type BulkOrderStatus, type PrintTechnique, BUDGET_RANGES,
} from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { AddToCollectionMenu } from '../components/AddToCollectionMenu';
import { RefineAIModal } from '../components/RefineAIModal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SwagPageHeader } from './SwagOverview';
import { useCompanyLogo } from '../context/CompanyLogoContext';
import { DesignToolPage } from './designTool/DesignToolPage';
import { ReplaceLogoModal } from '../components/ReplaceLogoModal';
import { fetchLogoForDomain } from '../components/LogoInput';

// ── Types ──────────────────────────────────────────────────────────────────────

type MainTab = 'catalog' | 'brand-set' | 'inventory' | 'shipments';
type CatalogSubTab = 'all' | 'inventory';
type PrintTechFilter = 'all' | PrintTechnique;

// ── Constants ─────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { label: 'Any Budget', min: 0, max: Infinity },
  ...BUDGET_RANGES,
];


const PRINT_TECHNIQUES: { value: PrintTechFilter; label: string }[] = [
  { value: 'all',              label: 'All Techniques'  },
  { value: 'embroidery',       label: 'Embroidery'      },
  { value: 'dtf',              label: 'Direct to Film (DTF)' },
  { value: 'dtg',              label: 'Direct to Garment (DTG)' },
  { value: 'sublimation',      label: 'Sublimation'     },
  { value: 'digital-inkjet',   label: 'Digital Inkjet'  },
  { value: 'laser-printing',   label: 'Laser Printing'  },
  { value: 'uv-printing',      label: 'UV Printing'     },
  { value: 'digital-printing', label: 'Digital Printing'},
];

// ── Shared filter UI (moved to components/catalog/FilterPrimitives) ───────────
import { FilterSection, CheckboxRow } from '../components/catalog/FilterPrimitives';

function SidebarContent({
  catExpanded, setCatExpanded,
  brandExpanded, setBrandExpanded,
  techExpanded, setTechExpanded,
  showMoreCats, setShowMoreCats,
  selectedCategories, toggleCategory,
  selectedBrands, toggleBrand,
  selectedTechniques, toggleTechnique,
  catalogTypeFilter, setCatalogTypeFilter,
  activeFilterCount, clearFilters,
}: {
  catExpanded: boolean; setCatExpanded: (v: boolean) => void;
  brandExpanded: boolean; setBrandExpanded: (v: boolean) => void;
  techExpanded: boolean; setTechExpanded: (v: boolean) => void;
  showMoreCats: boolean; setShowMoreCats: (v: boolean) => void;
  selectedCategories: Set<ProductCategory>; toggleCategory: (cat: ProductCategory) => void;
  selectedBrands: Set<string>; toggleBrand: (b: string) => void;
  selectedTechniques: Set<PrintTechnique>; toggleTechnique: (t: PrintTechnique) => void;
  catalogTypeFilter: 'all' | 'on-demand' | 'bulk'; setCatalogTypeFilter: (v: 'all' | 'on-demand' | 'bulk') => void;
  activeFilterCount: number; clearFilters: () => void;
}) {
  const visibleCats = showMoreCats ? CATEGORIES : CATEGORIES.slice(0, 5);
  return (
    <div>
      {/* Product Type */}
      <div className="border-b border-snp-navy-100 pb-2">
        <p className="py-2 text-[10px] font-bold text-snp-navy-950 uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Product Type</p>
        <div className="flex flex-col">
          {([
            { id: 'all'       as const, label: 'All Swag' },
            { id: 'on-demand' as const, label: 'Print on demand' },
            { id: 'bulk'      as const, label: 'Bulk & Kits' },
          ]).map(opt => {
            const active = catalogTypeFilter === opt.id;
            return (
              <label key={opt.id} onClick={() => setCatalogTypeFilter(opt.id)} className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors rounded-lg ${active ? 'bg-snp-indigo-50' : 'hover:bg-snp-navy-50'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-snp-indigo-600' : 'border-snp-navy-300'}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-snp-indigo-600" />}
                </div>
                <span className={`flex-1 text-[13px] font-medium transition-colors ${active ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <FilterSection title="Categories" expanded={catExpanded} onToggle={() => setCatExpanded(!catExpanded)}>
        <div className="flex flex-col">
          {visibleCats.map(cat => (
            <CheckboxRow key={cat} checked={selectedCategories.has(cat)} onToggle={() => toggleCategory(cat)} label={cat} />
          ))}
          <button
            className="text-[12px] font-bold text-snp-indigo-600 px-2 py-2 text-left hover:underline uppercase tracking-wide"
            onClick={() => setShowMoreCats(!showMoreCats)}
          >
            {showMoreCats ? '– Less' : '+ More'}
          </button>
        </div>
      </FilterSection>
      <FilterSection title="Brand" expanded={brandExpanded} onToggle={() => setBrandExpanded(!brandExpanded)}>
        <div className="flex flex-col">
          {FEATURED_BRANDS.map(brand => (
            <CheckboxRow key={brand} checked={selectedBrands.has(brand)} onToggle={() => toggleBrand(brand)} label={brand} />
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Decoration method" expanded={techExpanded} onToggle={() => setTechExpanded(!techExpanded)}>
        <div className="flex flex-col">
          {PRINT_TECHNIQUES.slice(1).map(t => (
            <CheckboxRow key={t.value} checked={selectedTechniques.has(t.value as PrintTechnique)} onToggle={() => toggleTechnique(t.value as PrintTechnique)} label={t.label} />
          ))}
        </div>
        <a
          href="https://help.snappy.com/en/articles/print-techniques"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-2 text-[12px] font-medium text-snp-indigo-600 hover:underline"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <BookOpen className="w-3 h-3" />
          Learn about print techniques →
        </a>
      </FilterSection>
      <div className="mt-2">
        <p className="text-[13px] font-normal text-snp-navy-700 mb-1.5">Color</p>
        <div className="grid grid-cols-4 gap-2">
          {['#1a1a1a', '#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
            <button key={color} className="w-8 h-8 rounded-full border-2 border-[#d4d4d4] hover:border-snp-indigo-600 transition-colors" style={{ backgroundColor: color }} title={color} />
          ))}
        </div>
      </div>
      {activeFilterCount > 0 && (
        <button className="mt-3 flex items-center gap-1 text-[13px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors" onClick={clearFilters}>
          <X className="w-3.5 h-3.5" /> Clear filters
        </button>
      )}
    </div>
  );
}

// ── My Items Sidebar ───────────────────────────────────────────────────────────

function MyItemsSidebarContent({
  myItemsTypeFilter, setMyItemsTypeFilter,
  printTechFilter, setPrintTechFilter,
  myItemsSearch, setMyItemsSearch,
  onDesignNew,
}: {
  myItemsTypeFilter: 'all' | 'on-demand' | 'bulk'; setMyItemsTypeFilter: (v: 'all' | 'on-demand' | 'bulk') => void;
  printTechFilter: PrintTechFilter; setPrintTechFilter: (v: PrintTechFilter) => void;
  myItemsSearch: string; setMyItemsSearch: (v: string) => void;
  onDesignNew: () => void;
}) {
  const [typeExpanded, setTypeExpanded]   = useState(true);
  const [styleExpanded, setStyleExpanded] = useState(true);
  return (
    <div>
      {/* Search */}
      <div className="pb-2 border-b border-snp-navy-100 mb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-500" />
          <input
            type="text"
            value={myItemsSearch}
            onChange={e => setMyItemsSearch(e.target.value)}
            placeholder="Search designs…"
            className="w-full pl-8 pr-7 h-8 border border-snp-navy-200 rounded-[8px] text-[13px] text-snp-navy-700 placeholder:text-snp-navy-400 focus:outline-none focus:border-snp-indigo-600 transition-colors bg-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
          {myItemsSearch && (
            <button onClick={() => setMyItemsSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-snp-navy-500 hover:text-snp-navy-700">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <FilterSection title="Item Type" expanded={typeExpanded} onToggle={() => setTypeExpanded(!typeExpanded)}>
        <div className="flex flex-col">
          {([
            { id: 'all'       as const, label: 'All Items' },
            { id: 'on-demand' as const, label: 'Print on demand' },
            { id: 'bulk'      as const, label: 'Bulk & Kits' },
          ]).map(opt => {
            const active = myItemsTypeFilter === opt.id;
            return (
              <label key={opt.id} onClick={() => setMyItemsTypeFilter(opt.id)} className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors rounded-lg ${active ? 'bg-snp-indigo-50' : 'hover:bg-snp-navy-50'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-snp-indigo-600' : 'border-snp-navy-300'}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-snp-indigo-600" />}
                </div>
                <span className={`text-[13px] font-medium transition-colors ${active ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>
      {myItemsTypeFilter !== 'bulk' && (
        <FilterSection title="Print Technique" expanded={styleExpanded} onToggle={() => setStyleExpanded(!styleExpanded)}>
          <div className="flex flex-col">
            {PRINT_TECHNIQUES.map(s => {
              const active = printTechFilter === s.value;
              return (
                <label key={s.value} onClick={() => setPrintTechFilter(s.value)} className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors rounded-lg ${active ? 'bg-snp-indigo-50' : 'hover:bg-snp-navy-50'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-snp-indigo-600' : 'border-snp-navy-300'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-snp-indigo-600" />}
                  </div>
                  <span className={`text-[13px] font-medium transition-colors ${active ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}>{s.label}</span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* CTA */}
      {myItemsTypeFilter !== 'bulk' && (
        <button
          onClick={onDesignNew}
          className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-[8px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#3077c9', fontFamily: "'DM Sans', sans-serif" }}
        >
          + Design Something New
        </button>
      )}
    </div>
  );
}

// ── My Items Card ──────────────────────────────────────────────────────────────

const PLACEMENT_LABELS: Record<string, string> = {
  'left-chest': 'Left Chest', center: 'Center', back: 'Back', sleeve: 'Sleeve',
};
const STYLE_LABELS: Record<string, string> = {
  'embroidery':       'Embroidery',
  'dtf':              'DTF',
  'dtg':              'DTG',
  'sublimation':      'Sublimation',
  'digital-inkjet':   'Digital Inkjet',
  'laser-printing':   'Laser Print',
  'uv-printing':      'UV Printing',
  'digital-printing': 'Digital Print',
};

function MyItemCard({
  design,
  onSend,
  onEdit,
  onRefineWithAI,
}: {
  design: DesignedItem;
  onSend: () => void;
  onEdit: () => void;
  onRefineWithAI: () => void;
}) {
  const product = PRODUCTS.find(p => p.id === design.productId);
  return (
    <div
      className="flex flex-col gap-3 pb-4 cursor-pointer group"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image area — matches ProductCard height & style */}
      <div
        className="relative rounded-[16px] overflow-hidden h-[260px] flex items-center justify-center"
        style={{ backgroundColor: `${design.colorHex}14` }}
      >
        {product?.image.startsWith('/') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
        ) : (
          <span className="text-[100px]">{product?.image ?? '📦'}</span>
        )}

        {/* Design badge — bottom center, like ProductCard logo badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-snp-navy-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: design.colorHex }} />
          <span className="text-[9px] text-snp-navy-500">{design.colorName}</span>
          <span className="text-[9px] text-[#c0cdd9]">·</span>
          <span className="text-[9px] text-snp-navy-500">{STYLE_LABELS[design.printTechnique] ?? design.printTechnique}</span>
        </div>

        {/* Send count badge */}
        {design.sendCount > 0 && (
          <div className="absolute top-2 left-2 bg-snp-indigo-600 text-white rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            ×{design.sendCount} sent
          </div>
        )}

        {/* Placement tag */}
        <div className="absolute top-2 right-2 bg-white text-snp-navy-600 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border border-snp-navy-200">
          {PLACEMENT_LABELS[design.placement] ?? design.placement}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <p className="text-[11px] font-bold text-snp-indigo-600 uppercase tracking-widest leading-none">
          {product?.brand}
        </p>
        <p className="text-[14px] font-bold text-snp-navy-950 leading-snug truncate">
          {product?.name}
        </p>

        {/* Action tray — same reveal behaviour as ProductCard */}
        <div className="flex flex-col gap-1.5 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          <button
            className="h-9 w-full rounded-[10px] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ background: '#3077c9' }}
            onClick={e => { e.stopPropagation(); onSend(); }}
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
          <div className="flex gap-1.5">
            <div className="flex-1">
              <AddToCollectionMenu
                productId={design.productId}
                trigger={
                  <button className="w-full h-8 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[12px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors">
                    + Collection
                  </button>
                }
              />
            </div>
            <button
              className="flex-1 h-8 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[12px] font-medium hover:border-snp-purple-700 hover:text-snp-purple-700 hover:bg-snp-purple-50 transition-colors flex items-center justify-center gap-1"
              onClick={e => { e.stopPropagation(); onRefineWithAI(); }}
            >
              <Sparkles className="w-3 h-3" /> Refine
            </button>
            <button
              className="w-8 h-8 rounded-[10px] border border-snp-navy-200 flex items-center justify-center text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors shrink-0"
              onClick={e => { e.stopPropagation(); onEdit(); }}
              title="Edit design"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Order Card ────────────────────────────────────────────────────────────

function BulkOrderCard({ order }: { order: BulkOrder }) {
  const product = PRODUCTS.find(p => p.id === order.productId);
  const isEmoji = product && !product.image.startsWith('/');

  const STATUS_STYLES: Record<BulkOrderStatus, { label: string; bg: string; text: string; border: string }> = {
    'in-production':  { label: 'In production',  bg: '#e8f0fc', text: 'var(--snp-indigo-600)', border: '#c7d7f4' },
    'in-warehouse':   { label: 'In warehouse',   bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    'partially-sent': { label: 'Partially sent', bg: '#eff6ff', text: 'var(--snp-indigo-700)', border: '#bfdbfe' },
  };
  const status = STATUS_STYLES[order.status];

  return (
    <div
      className="flex flex-col gap-3 pb-4 cursor-pointer group"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image */}
      <div className="relative bg-snp-indigo-50 rounded-[16px] overflow-hidden flex items-center justify-center h-[200px] border border-[#c7d7f4]">
        {product && !isEmoji ? (
          <img src={product.image} alt={product?.name} className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
        ) : (
          <span className="text-[80px] select-none" style={{ lineHeight: 1 }}>{product?.image ?? '📦'}</span>
        )}
        {/* Status badge */}
        <div
          className="absolute top-2 left-2 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide"
          style={{ background: status.bg, color: status.text, borderColor: status.border }}
        >
          {status.label}
        </div>
        {/* Qty badge */}
        <div className="absolute top-2 right-2 bg-white/90 border border-snp-navy-200 rounded-lg px-2 py-1 text-[10px] font-bold text-snp-navy-600 uppercase tracking-wide">
          {order.quantity} units
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <p className="text-[11px] font-bold text-snp-indigo-600 uppercase tracking-widest leading-none truncate">
          {product?.brand ?? 'Bulk & Kits'}
        </p>
        <p className="text-[13px] font-semibold text-snp-navy-700 leading-snug line-clamp-2">{order.name}</p>
        <p className="text-[12px] text-snp-navy-500">
          {order.quantity} units · ${order.totalAmount.toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          <button
            className="h-9 w-full rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#3077c9' }}
            onClick={() => alert('Send from inventory — coming soon!')}
          >
            Send as Gift
          </button>
          <button
            className="h-8 w-full rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[12px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors"
            onClick={() => alert('View order details — coming soon!')}
          >
            View Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function SwagCatalog({ defaultTab = 'catalog' }: { defaultTab?: 'catalog' | 'brand-set' | 'inventory' | 'shipments' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoUrl: savedLogo, activeBrandSet, allBrandSets, saveLogo, activateBrandSet, deleteBrandSet, clearLogo } = useCompanyLogo();
  const [searchParams] = useSearchParams();
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Design-it modal
  const [designItProduct, setDesignItProduct] = useState<(typeof PRODUCTS)[0] | null>(null);

  // Add logo modal
  const [showLogoModal, setShowLogoModal]     = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => { applyLogoFromModal(evt.target?.result as string, 'My Logo'); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function applyLogoFromModal(url: string, domain: string) {
    saveLogo(url);
    applyDesign({ url, domain });
    setShowLogoModal(false);
  }

  // Tab state — initialized from the route via defaultTab prop
  const [mainTab, setMainTab] = useState<MainTab>(defaultTab);
  const [catalogSubTab] = useState<CatalogSubTab>('all');

  // Catalog filters
  const [searchQuery, setSearchQuery]               = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<ProductCategory>>(new Set());
  const [selectedBrands, setSelectedBrands]         = useState<Set<string>>(() => {
    const brand = searchParams.get('brand');
    return brand ? new Set([brand]) : new Set();
  });
  const [selectedBudgetIdx, setSelectedBudgetIdx]   = useState(0);
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);

  // Logo design preview — initialise from context if logo already saved this session
  const [pendingLogo, setPendingLogo] = useState<{ url: string; domain: string } | null>(
    savedLogo ? { url: savedLogo, domain: 'Your logo' } : null
  );

  // Keep pendingLogo in sync if context logo changes (e.g. uploaded on another page)
  useEffect(() => {
    if (savedLogo) {
      setPendingLogo(prev => prev?.url === savedLogo ? prev : { url: savedLogo, domain: 'Your logo' });
    } else {
      setPendingLogo(null);
    }
  }, [savedLogo]);

  function applyDesign(logo: { url: string; domain: string } | null) {
    setPendingLogo(logo);
    if (logo) {
      // Sync context so ProductCard overlays reflect the active design
      const existingSet = allBrandSets.find(bs => bs.logoUrl === logo.url);
      if (existingSet) {
        activateBrandSet(existingSet.id);
      } else {
        saveLogo(logo.url);
      }
    } else {
      clearLogo();
    }
  }

  // Logo filter pill dropdown
  const [showLogoDropdown, setShowLogoDropdown] = useState(false);
  const logoPillRef = useRef<HTMLDivElement>(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFetching, setBannerFetching] = useState(false);
  useEffect(() => {
    if (!showLogoDropdown) return;
    const handler = (e: MouseEvent) => {
      if (!logoPillRef.current?.contains(e.target as Node)) setShowLogoDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLogoDropdown]);

  async function handleBannerFetch() {
    const raw = bannerUrl.trim();
    if (!raw) { setShowLogoModal(true); return; }
    setBannerFetching(true);
    try {
      const url = await fetchLogoForDomain(raw);
      applyLogoFromModal(url, raw);
      setBannerUrl('');
    } finally {
      setBannerFetching(false);
    }
  }

  // Catalog type filter — pre-set from ?type= URL param (e.g. ?type=bulk from Bulk & Kits)
  const typeParam = searchParams.get('type');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<'all' | 'on-demand' | 'bulk'>(
    typeParam === 'bulk' ? 'bulk' : typeParam === 'on-demand' ? 'on-demand' : 'all'
  );

  // Catalog technique filter
  const [selectedTechniques, setSelectedTechniques] = useState<Set<PrintTechnique>>(new Set());
  const [techExpanded, setTechExpanded]             = useState(true);

  // My Items filters
  const [myItemsSearch, setMyItemsSearch]         = useState('');
  const [printTechFilter, setPrintTechFilter]     = useState<PrintTechFilter>('all');
  const [myItemsTypeFilter, setMyItemsTypeFilter] = useState<'all' | 'on-demand' | 'bulk'>('all');


  // Sidebar accordion
  const [catExpanded, setCatExpanded]     = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [showMoreCats, setShowMoreCats]   = useState(false);

  // Refine AI modal
  const [refineProduct, setRefineProduct] = useState<typeof PRODUCTS[0] | undefined>(undefined);
  const [showRefineModal, setShowRefineModal] = useState(false);

  const budget = BUDGET_OPTIONS[selectedBudgetIdx];
  const activeFilterCount = selectedCategories.size + selectedBrands.size + selectedTechniques.size + (selectedBudgetIdx > 0 ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];
    if (catalogSubTab === 'inventory') list = list.filter(p => p.type === 'bulk');
    if (catalogTypeFilter === 'on-demand') list = list.filter(p => p.type === 'on-demand');
    if (catalogTypeFilter === 'bulk')      list = list.filter(p => p.type === 'bulk');
    if (searchQuery) list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedCategories.size > 0) list = list.filter(p => selectedCategories.has(p.category));
    if (selectedBrands.size > 0) list = list.filter(p => selectedBrands.has(p.brand));
    if (selectedTechniques.size > 0) list = list.filter(p => selectedTechniques.has(p.printTechnique));
    list = list.filter(p => p.price >= budget.min && p.price < budget.max);
    return list;
  }, [catalogSubTab, catalogTypeFilter, searchQuery, selectedCategories, selectedBrands, selectedTechniques, budget]);

  const filteredDesigns = useMemo(() => {
    if (myItemsTypeFilter === 'bulk') return []; // show bulk orders instead
    // Use live brand set data if available, fall back to static mock items
    const savedIds = activeBrandSet?.savedProductIds ?? [];
    const baseItems: typeof MY_DESIGNED_ITEMS = savedIds.length > 0
      ? savedIds.map(id => MY_DESIGNED_ITEMS.find(d => d.productId === id) ?? {
          id: `bs_${id}`,
          productId: id,
          designId: 'onboarding',
          colorHex: '#ffffff',
          colorName: 'White',
          placement: 'center' as const,
          printTechnique: 'dtg' as const,
          createdAt: new Date().toISOString(),
          sendCount: 0,
        })
      : [...MY_DESIGNED_ITEMS];
    let list = baseItems;
    if (myItemsSearch) list = list.filter(d => {
      const product = PRODUCTS.find(p => p.id === d.productId);
      return (product?.name ?? '').toLowerCase().includes(myItemsSearch.toLowerCase()) ||
             (product?.brand ?? '').toLowerCase().includes(myItemsSearch.toLowerCase());
    });
    if (printTechFilter !== 'all') list = list.filter(d => d.printTechnique === printTechFilter);
    return list;
  }, [myItemsSearch, printTechFilter, myItemsTypeFilter, activeBrandSet]);

  const filteredBulkOrders = useMemo(() => {
    if (myItemsTypeFilter === 'on-demand') return [];
    let list = [...MY_BULK_ORDERS];
    if (myItemsSearch) list = list.filter(o =>
      o.name.toLowerCase().includes(myItemsSearch.toLowerCase())
    );
    return list;
  }, [myItemsSearch, myItemsTypeFilter]);

  const toggleCategory = (cat: ProductCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  };

  const toggleTechnique = (t: PrintTechnique) => {
    setSelectedTechniques(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setSelectedTechniques(new Set());
    setSelectedBudgetIdx(0);
    setSearchQuery('');
  };

  const openRefine = (product?: typeof PRODUCTS[0]) => {
    setRefineProduct(product);
    setShowRefineModal(true);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Primary nav ─────────────────────────────────────────────── */}
      <SwagPageHeader activeTab={mainTab === 'catalog' ? 'catalog' : 'your-swag'} />


      {/* ── CATALOG TAB ──────────────────────────────────────────── */}
      {mainTab === 'catalog' && (
        <div ref={catalogGridRef}>
          {/* ── Horizontal filter bar ── */}
          <div
            className="w-full border-b sticky top-0 z-10"
            style={{ background: '#fbfcfe', borderBottomColor: '#e0ebf7', fontFamily: "'DM Sans', sans-serif" }}
          >
          <div className="max-w-[1440px] mx-auto flex items-center gap-2 px-6 md:px-[120px] py-4">
            {/* Left pills */}
            <div className="flex items-center gap-2">
              {/* Budget pill */}
              <div className="relative shrink-0">
                <select
                  value={selectedBudgetIdx}
                  onChange={e => setSelectedBudgetIdx(Number(e.target.value))}
                  className="h-[52px] pl-6 pr-10 rounded-full border bg-white text-[14px] font-medium text-snp-navy-950 appearance-none cursor-pointer hover:bg-snp-navy-50 focus:outline-none"
                  style={{ borderColor: '#e0ebf7', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {BUDGET_OPTIONS.map((opt, i) => (
                    <option key={opt.label} value={i}>{i === 0 ? 'Budget' : opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-950 pointer-events-none" />
              </div>

              {/* Country pill */}
              <div className="relative shrink-0">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none leading-none">{COUNTRIES[selectedCountryIdx].flag}</span>
                <select
                  value={selectedCountryIdx}
                  onChange={e => setSelectedCountryIdx(Number(e.target.value))}
                  className="h-[52px] pl-10 pr-10 rounded-full border bg-white text-[14px] font-medium text-snp-navy-950 appearance-none cursor-pointer hover:bg-snp-navy-50 focus:outline-none"
                  style={{ borderColor: '#e0ebf7', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {COUNTRIES.map((c, i) => <option key={c.code} value={i}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-950 pointer-events-none" />
              </div>

              {/* Logo pill */}
              <div ref={logoPillRef} className="relative shrink-0">
                <button
                  onClick={() => setShowLogoDropdown(o => !o)}
                  className="h-[52px] px-4 rounded-full border bg-white flex items-center gap-2 hover:bg-snp-navy-50 transition-colors"
                  style={{ borderColor: showLogoDropdown ? '#3077c9' : '#e0ebf7' }}
                >
                  {pendingLogo ? (
                    <img
                      src={pendingLogo.url}
                      alt="Logo"
                      className="h-5 w-14 object-contain"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <span className="text-[14px] font-medium text-snp-navy-950">Upload Logo</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-snp-navy-950 transition-transform ${showLogoDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLogoDropdown && (
                  <LogoFilterDropdown
                    allBrandSets={allBrandSets}
                    activeLogo={pendingLogo?.url ?? null}
                    onSelect={url => {
                      applyDesign({ url, domain: 'Your logo' });
                      setShowLogoDropdown(false);
                    }}
                    onAdd={() => {
                      setShowLogoDropdown(false);
                      setShowLogoModal(true);
                    }}
                    onRemove={id => deleteBrandSet(id)}
                  />
                )}
              </div>
            </div>

            <div className="flex-1" />

            {/* Search — right side */}
            <div className="relative shrink-0 w-[261px]">
              <div
                className="h-[52px] flex items-center rounded-full gap-2 px-3"
                style={{ background: '#fbfcfe', border: '1px solid #e0ebf7' }}
              >
                <div className="flex items-center gap-1 shrink-0">
                  <Search className="w-4 h-4 text-snp-navy-500" />
                  <div className="w-px h-4 shrink-0" style={{ background: '#e0ebf7' }} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search product by name..."
                  className="flex-1 bg-transparent text-[14px] text-snp-navy-700 placeholder:text-snp-navy-500 focus:outline-none min-w-0"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="shrink-0 text-snp-navy-400 hover:text-snp-navy-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>{/* inner max-w wrapper */}
          </div>{/* sticky bar */}

          <div className="flex max-w-[1440px] mx-auto">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-[380px] shrink-0 border-r border-snp-navy-200 pt-4 pl-[120px] pr-4 pb-8 overflow-y-auto">
              <SidebarContent
                catExpanded={catExpanded} setCatExpanded={setCatExpanded}
                brandExpanded={brandExpanded} setBrandExpanded={setBrandExpanded}
                techExpanded={techExpanded} setTechExpanded={setTechExpanded}
                showMoreCats={showMoreCats} setShowMoreCats={setShowMoreCats}
                selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                selectedTechniques={selectedTechniques} toggleTechnique={toggleTechnique}
                catalogTypeFilter={catalogTypeFilter} setCatalogTypeFilter={setCatalogTypeFilter}
                activeFilterCount={activeFilterCount} clearFilters={clearFilters}
              />
            </aside>

            {/* Mobile filter sheet trigger */}
            <div className="flex md:hidden px-4 pt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 bg-white border border-snp-navy-200 rounded-full px-4 py-2.5 text-[14px] font-medium text-snp-navy-950 hover:bg-snp-navy-50 transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]">
                    <SlidersHorizontal className="w-4 h-4 text-snp-navy-500" />
                    Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white">
                  <SheetHeader>
                    <SheetTitle className="text-[16px] font-semibold text-snp-navy-700">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 overflow-y-auto h-full pb-8">
                    <SidebarContent
                      catExpanded={catExpanded} setCatExpanded={setCatExpanded}
                      brandExpanded={brandExpanded} setBrandExpanded={setBrandExpanded}
                      techExpanded={techExpanded} setTechExpanded={setTechExpanded}
                      showMoreCats={showMoreCats} setShowMoreCats={setShowMoreCats}
                      selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                      selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                      selectedTechniques={selectedTechniques} toggleTechnique={toggleTechnique}
                      catalogTypeFilter={catalogTypeFilter} setCatalogTypeFilter={setCatalogTypeFilter}
                      activeFilterCount={activeFilterCount} clearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Products grid */}
            <div className="flex-1 pt-5 px-4 md:pr-[40px] md:pl-8 pb-16">
              {/* ── No-logo banner ──────────────────────────────────────── */}
              {!pendingLogo && (
                <div
                  className="relative rounded-[32px] overflow-hidden h-[300px] mb-6"
                  style={{ background: 'radial-gradient(ellipse at 18% 90%, #c4d9ef 0%, #d8e8f6 25%, #eaf2fb 55%, #f5f8fd 100%)' }}
                >
                  {/* Left products */}
                  <div className="absolute left-0 top-0 h-full w-[360px] pointer-events-none">
                    <img src="/products/left-products.png" alt=""
                      className="absolute object-contain"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left bottom' }} />
                  </div>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 pb-2">
                    <div className="flex flex-col items-center gap-[6px] text-center whitespace-nowrap">
                      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8093a9]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Make it yours
                      </p>
                      <p className="text-[36px] font-semibold leading-[1.1] text-[#012754]"
                        style={{ fontFamily: "'Clash Display', sans-serif" }}>
                        Watch your logo<br />come to life
                      </p>
                    </div>

                    <div className="flex items-center h-[56px] rounded-[16px] bg-white/85 backdrop-blur-sm border border-white/70 shadow-[0px_6px_20px_rgba(1,39,84,0.14)] overflow-hidden focus-within:border-[#3077c9]/60 transition-all">
                      <Globe className="w-4 h-4 text-[#6b8db5] ml-4 shrink-0" />
                      <input
                        type="text"
                        placeholder="yourcompany.com"
                        value={bannerUrl}
                        onChange={e => setBannerUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleBannerFetch(); }}
                        className="h-full px-3 text-[14px] text-[#012754] placeholder-[#9fb3c8] outline-none bg-transparent w-[200px]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      <button
                        onClick={handleBannerFetch}
                        disabled={!bannerUrl.trim() || bannerFetching}
                        className="h-full px-5 flex items-center gap-2 text-[13px] font-semibold text-white border-l border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        style={{ background: 'linear-gradient(180deg, #6ba3e0 0%, #3077c9 100%)' }}
                      >
                        {bannerFetching
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><ArrowRight className="w-4 h-4" /> Fetch logo</>
                        }
                      </button>
                    </div>

                    <button
                      onClick={() => logoFileRef.current?.click()}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-[#6b8db5] hover:text-[#3077c9] transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      or upload your logo
                    </button>
                  </div>

                  {/* Right products */}
                  <div className="absolute right-0 top-0 h-full w-[360px] pointer-events-none">
                    <img src="/products/right-products.png" alt=""
                      className="absolute object-contain"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right bottom' }} />
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="text-6xl mb-4">🔍</span>
                  <h3 className="text-[16px] font-semibold text-snp-navy-700 mb-2">No products found</h3>
                  <p className="text-[14px] text-snp-navy-500 mb-4">Try adjusting your filters</p>
                  {activeFilterCount > 0 && (
                    <button className="h-10 px-5 rounded-[10px] border border-snp-indigo-600 text-snp-indigo-600 text-[13px] font-semibold hover:bg-snp-indigo-50" onClick={clearFilters}>
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location } })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MY ITEMS TAB ─────────────────────────────────────────── */}
      {mainTab === 'brand-set' && (
        <div className="max-w-[1400px] mx-auto">
          <div className="flex">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-[272px] shrink-0 border-r border-snp-navy-200 pt-4 pl-[72px] pr-4 pb-8">
              <MyItemsSidebarContent
                myItemsTypeFilter={myItemsTypeFilter} setMyItemsTypeFilter={setMyItemsTypeFilter}
                printTechFilter={printTechFilter} setPrintTechFilter={setPrintTechFilter}
                myItemsSearch={myItemsSearch} setMyItemsSearch={setMyItemsSearch}
                onDesignNew={() => setMainTab('catalog')}
              />
            </aside>

            {/* Mobile filter sheet trigger */}
            <div className="flex md:hidden px-4 pt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 bg-white border border-snp-navy-200 rounded-full px-4 py-2.5 text-[14px] font-medium text-snp-navy-950 hover:bg-snp-navy-50 transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]">
                    <SlidersHorizontal className="w-4 h-4 text-snp-navy-500" />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white">
                  <SheetHeader>
                    <SheetTitle className="text-[16px] font-semibold text-snp-navy-700">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 overflow-y-auto h-full pb-8">
                    <MyItemsSidebarContent
                      myItemsTypeFilter={myItemsTypeFilter} setMyItemsTypeFilter={setMyItemsTypeFilter}
                      printTechFilter={printTechFilter} setPrintTechFilter={setPrintTechFilter}
                      myItemsSearch={myItemsSearch} setMyItemsSearch={setMyItemsSearch}
                      onDesignNew={() => setMainTab('catalog')}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

              <div className="flex-1 pt-6 px-4 md:pr-[40px] md:pl-8 pb-16">
                {/* Results count */}
                <p className="text-[12px] text-snp-navy-400 font-medium mb-5">
                  {myItemsTypeFilter === 'bulk'
                    ? `${filteredBulkOrders.length} bulk ${filteredBulkOrders.length === 1 ? 'order' : 'orders'}`
                    : `${filteredDesigns.length} saved ${filteredDesigns.length === 1 ? 'design' : 'designs'}`}
                </p>

                {/* Bulk orders view */}
                {myItemsTypeFilter === 'bulk' && (
                  filteredBulkOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <span className="text-6xl mb-4">📦</span>
                      <h3 className="text-[16px] font-semibold text-snp-navy-700 mb-2">No bulk orders yet</h3>
                      <p className="text-[14px] text-snp-navy-500 mb-5">Browse Bulk & Kits products to start an order.</p>
                      <button
                        className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
                        style={{ background: '#3077c9' }}
                        onClick={() => setMainTab('catalog')}
                      >
                        Browse Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredBulkOrders.map(order => (
                        <BulkOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  )
                )}

                {/* On-demand designs view */}
                {myItemsTypeFilter !== 'bulk' && (
                  filteredDesigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <span className="text-6xl mb-4">🎨</span>
                      <h3 className="text-[16px] font-semibold text-snp-navy-700 mb-2">No designs yet</h3>
                      <p className="text-[14px] text-snp-navy-500 mb-5">
                        Click "Design This" on any catalog item to save it here.
                      </p>
                      <button
                        className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
                        style={{ background: '#3077c9' }}
                        onClick={() => setMainTab('catalog')}
                      >
                        Browse Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredDesigns.map(design => (
                        <MyItemCard
                          key={design.id}
                          design={design}
                          onSend={() => navigate('/send', { state: { productIds: [design.productId] } })}
                          onEdit={() => navigate(`/design/${design.productId}`)}
                          onRefineWithAI={() => {
                            const product = PRODUCTS.find(p => p.id === design.productId);
                            openRefine(product);
                          }}
                        />
                      ))}

                      {/* Ghost "create new" card */}
                      <div
                        className="border-2 border-dashed border-snp-navy-300 rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-snp-navy-50 hover:border-snp-indigo-600 transition-all p-8 min-h-[280px]"
                        onClick={() => setMainTab('catalog')}
                      >
                        <div className="w-12 h-12 rounded-full bg-snp-navy-100 flex items-center justify-center">
                          <span className="text-2xl text-snp-indigo-600">+</span>
                        </div>
                        <p className="text-[13px] font-semibold text-snp-navy-500 text-center">Design Something New</p>
                        <p className="text-[11px] text-snp-navy-400 text-center">Browse catalog to pick a product</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
      )}

      {/* ── INVENTORY TAB ────────────────────────────────────────── */}
      {mainTab === 'inventory' && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-20 flex flex-col items-center text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <div className="w-20 h-20 rounded-[24px] bg-snp-navy-100 border border-[#c8dff0] flex items-center justify-center mb-6">
            <Archive className="w-9 h-9 text-snp-indigo-600" />
          </div>
          <h2
            className="text-[26px] font-bold text-snp-navy-950 mb-3"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Your inventory vault is empty
          </h2>
          <p className="text-[15px] text-snp-navy-600 leading-relaxed max-w-[480px] mb-2">
            Buy swag in bulk upfront and we'll store it in our warehouse. When you're ready to send, we pick, pack, and ship it straight to your recipient — no reordering, no waiting.
          </p>
          <p className="text-[13px] text-snp-navy-400 max-w-[420px] mb-8">
            Perfect for onboarding kits, branded apparel runs, or any time you want swag ready to go at a moment's notice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#3077c9' }}
              onClick={() => setMainTab('catalog')}
            >
              Browse Bulk Catalog
            </button>
            <button
              className="h-11 px-6 rounded-[14px] border border-snp-navy-200 text-snp-navy-600 text-[14px] font-medium hover:bg-snp-navy-50 transition-colors"
            >
              Learn about bulk pricing
            </button>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[620px]">
            {[
              { icon: '📦', title: 'Bulk purchase', body: 'Buy 50–500+ units of any product at wholesale pricing.' },
              { icon: '🏪', title: 'We store it', body: 'Your branded swag lives in our climate-controlled warehouse.' },
              { icon: '🚀', title: 'Ship instantly', body: 'Send to anyone, anytime — same-day fulfillment for in-stock items.' },
            ].map(item => (
              <div key={item.title} className="bg-snp-navy-50 rounded-[16px] p-5 text-left border border-snp-navy-200">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <p className="text-[13px] font-bold text-snp-navy-950 mb-1">{item.title}</p>
                <p className="text-[12px] text-snp-navy-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SHIPMENTS TAB ────────────────────────────────────────── */}
      {mainTab === 'shipments' && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-20 flex flex-col items-center text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <div className="w-20 h-20 rounded-[24px] bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mb-6">
            <Truck className="w-9 h-9 text-[#059669]" />
          </div>
          <h2
            className="text-[26px] font-bold text-snp-navy-950 mb-3"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            No shipments yet
          </h2>
          <p className="text-[15px] text-snp-navy-600 leading-relaxed max-w-[480px] mb-2">
            When you send items from your inventory, the full order and tracking history shows up here — recipient name, address, status, and estimated delivery.
          </p>
          <p className="text-[13px] text-snp-navy-400 max-w-[440px] mb-8">
            Note: print-on-demand swag (custom items designed and sent digitally) ships directly from our production partner and isn't tracked here.
          </p>
          <button
            className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#3077c9' }}
            onClick={() => setMainTab('inventory')}
          >
            Go to Inventory
          </button>
          <div className="mt-12 w-full max-w-[560px]">
            <div className="border border-snp-navy-200 rounded-[16px] overflow-hidden">
              {/* Mock empty table header */}
              <div className="grid grid-cols-4 bg-snp-navy-50 border-b border-snp-navy-200 px-5 py-3">
                {['Recipient', 'Item', 'Status', 'Shipped'].map(h => (
                  <span key={h} className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">{h}</span>
                ))}
              </div>
              {/* Placeholder rows */}
              {[1, 2, 3].map(i => (
                <div key={i} className="grid grid-cols-4 px-5 py-4 border-b border-[#f0f4f8] last:border-0">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-3 rounded-full bg-[#edf2f7]" style={{ width: `${50 + j * 10}%`, opacity: 1 - i * 0.18 }} />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#c0cdd9] mt-3">Shipment history will appear here once you start sending inventory items.</p>
          </div>
        </div>
      )}

      {/* ── Refine AI Modal ───────────────────────────────────────── */}
      {showRefineModal && (
        <RefineAIModal
          product={refineProduct}
          onClose={() => setShowRefineModal(false)}
        />
      )}

      {/* ── Add Logo modal ───────────────────────────────────────────── */}
      <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
      {showLogoModal && (
        <ReplaceLogoModal
          currentLogoUrl={pendingLogo?.url}
          onSelect={url => { applyLogoFromModal(url, 'Your logo'); }}
          onClose={() => setShowLogoModal(false)}
        />
      )}

      {/* ── Design-it overlay ────────────────────────────────────────── */}
      {designItProduct && (
        <div className="fixed inset-0 z-50">
          <DesignToolPage
            product={designItProduct}
            onClose={() => setDesignItProduct(null)}
            onSave={() => { setDesignItProduct(null); navigate('/designs'); }}
          />
        </div>
      )}
    </div>
  );
}

// ── Logo filter dropdown ───────────────────────────────────────────────────────

function LogoFilterDropdown({
  allBrandSets,
  activeLogo,
  onSelect,
  onAdd,
  onRemove,
}: {
  allBrandSets: { id: string; logoUrl?: string | null }[];
  activeLogo: string | null;
  onSelect: (url: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const logos = allBrandSets.filter(bs => bs.logoUrl);
  return (
    <div
      className="absolute left-0 top-[calc(100%+8px)] bg-white rounded-[16px] overflow-hidden z-50"
      style={{
        width: 280,
        border: '1px solid #e0ebf7',
        boxShadow: '0px 12px 16px 0px rgba(125,146,169,0.08)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8093a9' }}>My Logos</p>
      </div>

      {/* Grid */}
      <div className="px-4 pb-4 flex flex-wrap gap-3">
        {/* Add new */}
        <button
          onClick={onAdd}
          className="w-14 h-14 rounded-[8px] flex items-center justify-center transition-colors hover:bg-snp-indigo-100"
          style={{ border: '1.5px dashed #97bbe4', background: '#fbfcfe' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#3077c9' }} />
        </button>

        {/* Existing logos */}
        {logos.map(bs => {
          const isActive = bs.logoUrl === activeLogo;
          return (
            <div key={bs.id} className="relative group">
              <button
                onClick={() => onSelect(bs.logoUrl!)}
                className="w-14 h-14 rounded-[8px] flex items-center justify-center p-1.5 transition-all"
                style={{
                  border: isActive ? '1px solid #3077c9' : '1px solid #e0ebf7',
                  opacity: isActive ? 1 : 0.8,
                  boxShadow: isActive ? '0px 4px 8px rgba(1,39,84,0.16)' : 'none',
                }}
              >
                <img
                  src={bs.logoUrl!}
                  alt=""
                  className="w-full h-full object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </button>

              {/* Remove button — appears on hover */}
              <button
                onClick={e => { e.stopPropagation(); onRemove(bs.id); }}
                title="Remove from list"
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-snp-navy-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-snp-navy-700"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
