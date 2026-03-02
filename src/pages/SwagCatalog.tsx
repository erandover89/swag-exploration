import { useState, useMemo, useRef } from 'react';
import type React from 'react';
import {
  Search, ChevronDown, ChevronUp, X, SlidersHorizontal,
  Send, Pencil, Sparkles, Package, Archive, Truck,
} from 'lucide-react';
import {
  PRODUCTS, CATEGORIES, COUNTRIES, MY_DESIGNS, FEATURED_BRANDS,
  MY_BULK_ORDERS,
  type ProductCategory, type SwagDesign, type BulkOrder, type BulkOrderStatus,
} from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { AddToCollectionMenu } from '../components/AddToCollectionMenu';
import { LogoHero } from '../components/LogoHero';
import { RefineAIModal } from '../components/RefineAIModal';
import { AskSnippyButton } from '../components/AskSnippyButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { useNavigate } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────────

type MainTab = 'catalog' | 'my-items' | 'inventory' | 'shipments';
type CatalogSubTab = 'all' | 'inventory';
type SortType = 'popular' | 'price-asc' | 'price-desc' | 'newest';
type PrintStyleFilter = 'all' | 'embroidery' | 'screen-print' | 'emboss';

// ── Constants ─────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under $50',  min: 0, max: 50 },
  { label: '$50–$100',   min: 50, max: 100 },
  { label: '$100–$200',  min: 100, max: 200 },
  { label: '$200+',      min: 200, max: Infinity },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest' },
];

const PRINT_STYLES: { value: PrintStyleFilter; label: string }[] = [
  { value: 'all',          label: 'All Styles' },
  { value: 'embroidery',   label: 'Embroidery' },
  { value: 'screen-print', label: 'Screen Print' },
  { value: 'emboss',       label: 'Emboss' },
];

// ── Shared filter UI ───────────────────────────────────────────────────────────

function PillDropdown({
  label, open, onToggle, prefix, children, alignRight = false,
}: {
  label: string; open: boolean; onToggle: () => void;
  prefix?: React.ReactNode; children: React.ReactNode; alignRight?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-white border border-[#e0ebf7] rounded-full px-4 py-3 text-[14px] font-medium text-[#012754] hover:bg-[#f5f8fc] transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {prefix}{label}
        <ChevronDown className="w-4 h-4 text-[#8093a9]" />
      </button>
      {open && (
        <div className={`absolute top-full mt-1.5 bg-white border border-[#e0ebf7] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[160px] py-1.5 ${alignRight ? 'right-0' : 'left-0'}`}>
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
      className={`w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-[#f5f8fc] transition-colors ${active ? 'text-[#3077c9] font-semibold' : 'text-[#345276]'}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

function FilterSection({ title, expanded, onToggle, children }: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#eaf1fa] pb-3">
      <button
        className="flex items-center justify-between w-full py-3 text-[10px] font-bold text-[#012754] uppercase tracking-widest"
        onClick={onToggle}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
        {expanded ? <ChevronUp className="w-4 h-4 text-[#8093a9]" /> : <ChevronDown className="w-4 h-4 text-[#8093a9]" />}
      </button>
      {expanded && children}
    </div>
  );
}

function CheckboxRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg ${checked ? 'bg-[#f0f6ff]' : 'hover:bg-[#f5f8fc]'}`}
    >
      <div
        onClick={onToggle}
        className={`w-5 h-5 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-[#3077c9] border-[#3077c9]' : 'bg-white border-[#b7cfec]'}`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span
        className={`text-[14px] font-medium transition-colors ${checked ? 'text-[#3077c9]' : 'text-[#345276]'}`}
        onClick={onToggle}
      >
        {label}
      </span>
    </label>
  );
}

function SidebarContent({
  catExpanded, setCatExpanded,
  brandExpanded, setBrandExpanded,
  showMoreCats, setShowMoreCats,
  selectedCategories, toggleCategory,
  selectedBrands, toggleBrand,
  catalogTypeFilter, setCatalogTypeFilter,
}: {
  catExpanded: boolean; setCatExpanded: (v: boolean) => void;
  brandExpanded: boolean; setBrandExpanded: (v: boolean) => void;
  showMoreCats: boolean; setShowMoreCats: (v: boolean) => void;
  selectedCategories: Set<ProductCategory>; toggleCategory: (cat: ProductCategory) => void;
  selectedBrands: Set<string>; toggleBrand: (b: string) => void;
  catalogTypeFilter: 'all' | 'on-demand' | 'bulk'; setCatalogTypeFilter: (v: 'all' | 'on-demand' | 'bulk') => void;
}) {
  const visibleCats = showMoreCats ? CATEGORIES : CATEGORIES.slice(0, 5);
  return (
    <div>
      {/* Product Type radio */}
      <div className="border-b border-[#eaf1fa] pb-3">
        <p className="py-3 text-[10px] font-bold text-[#012754] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Product Type</p>
        <div className="flex flex-col">
          {([
            { id: 'all'       as const, label: 'All Swag' },
            { id: 'on-demand' as const, label: 'No Minimums' },
            { id: 'bulk'      as const, label: 'Bulk & Kits' },
          ]).map(opt => {
            const active = catalogTypeFilter === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => setCatalogTypeFilter(opt.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg ${active ? 'bg-[#f0f6ff]' : 'hover:bg-[#f5f8fc]'}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-[#3077c9]' : 'border-[#b7cfec]'}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-[#3077c9]" />}
                </div>
                <span className={`text-[14px] font-medium transition-colors ${active ? 'text-[#3077c9]' : 'text-[#345276]'}`}>
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
            <CheckboxRow
              key={cat}
              checked={selectedCategories.has(cat)}
              onToggle={() => toggleCategory(cat)}
              label={cat}
            />
          ))}
          <button
            className="text-[12px] font-bold text-[#3077c9] px-4 py-2 text-left hover:underline uppercase tracking-wide"
            onClick={() => setShowMoreCats(!showMoreCats)}
          >
            {showMoreCats ? '– Less' : '+ More'}
          </button>
        </div>
      </FilterSection>
      <FilterSection title="Brand" expanded={brandExpanded} onToggle={() => setBrandExpanded(!brandExpanded)}>
        <div className="flex flex-col">
          {FEATURED_BRANDS.map(brand => (
            <CheckboxRow
              key={brand}
              checked={selectedBrands.has(brand)}
              onToggle={() => toggleBrand(brand)}
              label={brand}
            />
          ))}
        </div>
      </FilterSection>
      <div className="mt-4">
        <p className="text-[14px] font-normal text-[#345276] mb-3">Color</p>
        <div className="grid grid-cols-4 gap-2">
          {['#1a1a1a', '#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-[#d4d4d4] hover:border-[#3077c9] transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── My Items Sidebar ───────────────────────────────────────────────────────────

function MyItemsSidebarContent({
  myItemsTypeFilter, setMyItemsTypeFilter,
  printStyleFilter, setPrintStyleFilter,
  myItemsSearch, setMyItemsSearch,
}: {
  myItemsTypeFilter: 'all' | 'on-demand' | 'bulk'; setMyItemsTypeFilter: (v: 'all' | 'on-demand' | 'bulk') => void;
  printStyleFilter: PrintStyleFilter; setPrintStyleFilter: (v: PrintStyleFilter) => void;
  myItemsSearch: string; setMyItemsSearch: (v: string) => void;
}) {
  const [typeExpanded, setTypeExpanded]   = useState(true);
  const [styleExpanded, setStyleExpanded] = useState(true);
  const [nameExpanded, setNameExpanded]   = useState(true);
  return (
    <div>
      <FilterSection title="Item Type" expanded={typeExpanded} onToggle={() => setTypeExpanded(!typeExpanded)}>
        <div className="flex flex-col">
          {([
            { id: 'all'       as const, label: 'All Items' },
            { id: 'on-demand' as const, label: 'On-demand designs' },
            { id: 'bulk'      as const, label: 'Bulk & Kits' },
          ]).map(opt => {
            const active = myItemsTypeFilter === opt.id;
            return (
              <label key={opt.id} onClick={() => setMyItemsTypeFilter(opt.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg ${active ? 'bg-[#f0f6ff]' : 'hover:bg-[#f5f8fc]'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-[#3077c9]' : 'border-[#b7cfec]'}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-[#3077c9]" />}
                </div>
                <span className={`text-[14px] font-medium transition-colors ${active ? 'text-[#3077c9]' : 'text-[#345276]'}`}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>
      {myItemsTypeFilter !== 'bulk' && (
        <FilterSection title="Print Style" expanded={styleExpanded} onToggle={() => setStyleExpanded(!styleExpanded)}>
          <div className="flex flex-col">
            {PRINT_STYLES.map(s => {
              const active = printStyleFilter === s.value;
              return (
                <label key={s.value} onClick={() => setPrintStyleFilter(s.value)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg ${active ? 'bg-[#f0f6ff]' : 'hover:bg-[#f5f8fc]'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-[#3077c9]' : 'border-[#b7cfec]'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-[#3077c9]" />}
                  </div>
                  <span className={`text-[14px] font-medium transition-colors ${active ? 'text-[#3077c9]' : 'text-[#345276]'}`}>{s.label}</span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}
      <FilterSection title="Design Name" expanded={nameExpanded} onToggle={() => setNameExpanded(!nameExpanded)}>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8093a9]" />
            <input
              type="text"
              value={myItemsSearch}
              onChange={e => setMyItemsSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full pl-9 pr-7 h-9 border border-[#e0ebf7] rounded-[10px] text-[13px] text-[#345276] placeholder:text-[#8093a9] focus:outline-none focus:border-[#3077c9] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            {myItemsSearch && (
              <button onClick={() => setMyItemsSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8093a9] hover:text-[#345276]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

// ── My Items Card ──────────────────────────────────────────────────────────────

const PLACEMENT_LABELS: Record<string, string> = {
  'left-chest': 'Left Chest', center: 'Center', back: 'Back', sleeve: 'Sleeve',
};
const STYLE_LABELS: Record<string, string> = {
  'embroidery': 'Embroidery', 'screen-print': 'Screen Print', 'emboss': 'Emboss',
};

function MyItemCard({
  design,
  onSend,
  onEdit,
  onRefineWithAI,
}: {
  design: SwagDesign;
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
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[100px]">{product?.image ?? '📦'}</span>
        )}

        {/* Design badge — bottom center, like ProductCard logo badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#e0ebf7] rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: design.colorHex }} />
          <span className="text-[9px] text-[#8093a9]">{design.colorName}</span>
          <span className="text-[9px] text-[#c0cdd9]">·</span>
          <span className="text-[9px] text-[#8093a9]">{STYLE_LABELS[design.printStyle] ?? design.printStyle}</span>
        </div>

        {/* Send count badge */}
        {design.sendCount > 0 && (
          <div className="absolute top-2 left-2 bg-[#3077c9] text-white rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            ×{design.sendCount} sent
          </div>
        )}

        {/* Placement tag */}
        <div className="absolute top-2 right-2 bg-white text-[#59728f] text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border border-[#e0ebf7]">
          {PLACEMENT_LABELS[design.placement] ?? design.placement}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <p className="text-[11px] font-bold text-[#3077c9] uppercase tracking-widest leading-none">
          {product?.brand}
        </p>
        <p className="text-[14px] font-bold text-[#012754] leading-snug truncate">
          {design.name}
        </p>
        <p className="text-[12px] text-[#8093a9] leading-snug line-clamp-1">
          {product?.name}
        </p>

        {/* Action tray — same reveal behaviour as ProductCard */}
        <div className="flex flex-col gap-1.5 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          <button
            className="h-9 w-full rounded-[10px] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            onClick={e => { e.stopPropagation(); onSend(); }}
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
          <div className="flex gap-1.5">
            <div className="flex-1">
              <AddToCollectionMenu
                trigger={
                  <button className="w-full h-8 rounded-[10px] border border-[#e0ebf7] text-[#59728f] text-[12px] font-medium hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors">
                    + Collection
                  </button>
                }
              />
            </div>
            <button
              className="flex-1 h-8 rounded-[10px] border border-[#e0ebf7] text-[#59728f] text-[12px] font-medium hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#faf5ff] transition-colors flex items-center justify-center gap-1"
              onClick={e => { e.stopPropagation(); onRefineWithAI(); }}
            >
              <Sparkles className="w-3 h-3" /> Refine
            </button>
            <button
              className="w-8 h-8 rounded-[10px] border border-[#e0ebf7] flex items-center justify-center text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors shrink-0"
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
    'in-production':  { label: 'In production',  bg: '#e8f0fc', text: '#3077c9', border: '#c7d7f4' },
    'in-warehouse':   { label: 'In warehouse',   bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    'partially-sent': { label: 'Partially sent', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  };
  const status = STATUS_STYLES[order.status];

  return (
    <div
      className="flex flex-col gap-3 pb-4 cursor-pointer group"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image */}
      <div className="relative bg-[#f0f6ff] rounded-[16px] overflow-hidden flex items-center justify-center h-[200px] border border-[#c7d7f4]">
        {product && !isEmoji ? (
          <img src={product.image} alt={product?.name} className="w-full h-full object-cover" />
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
        <div className="absolute top-2 right-2 bg-white/90 border border-[#e0ebf7] rounded-lg px-2 py-1 text-[10px] font-bold text-[#59728f] uppercase tracking-wide">
          {order.quantity} units
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <p className="text-[11px] font-bold text-[#3077c9] uppercase tracking-widest leading-none truncate">
          {product?.brand ?? 'Bulk & Kits'}
        </p>
        <p className="text-[13px] font-semibold text-[#345276] leading-snug line-clamp-2">{order.name}</p>
        <p className="text-[12px] text-[#8093a9]">
          {order.quantity} units · ${order.totalAmount.toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          <button
            className="h-9 w-full rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            onClick={() => alert('Send from inventory — coming soon!')}
          >
            Send as Gift
          </button>
          <button
            className="h-8 w-full rounded-[10px] border border-[#e0ebf7] text-[#59728f] text-[12px] font-medium hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors"
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

export function SwagCatalog() {
  const navigate = useNavigate();
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Tab state
  const [mainTab, setMainTab] = useState<MainTab>('catalog');
  const [catalogSubTab] = useState<CatalogSubTab>('all');

  // Catalog filters
  const [searchQuery, setSearchQuery]               = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<ProductCategory>>(new Set());
  const [selectedBrands, setSelectedBrands]         = useState<Set<string>>(new Set());
  const [selectedBudgetIdx, setSelectedBudgetIdx]   = useState(0);
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);
  const [sortBy, setSortBy]                         = useState<SortType>('popular');

  // Logo design preview
  const [pendingLogo, setPendingLogo] = useState<{ url: string; domain: string } | null>(null);

  // Catalog type filter
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<'all' | 'on-demand' | 'bulk'>('all');

  // My Items filters
  const [myItemsSearch, setMyItemsSearch]         = useState('');
  const [printStyleFilter, setPrintStyleFilter]   = useState<PrintStyleFilter>('all');
  const [myItemsTypeFilter, setMyItemsTypeFilter] = useState<'all' | 'on-demand' | 'bulk'>('all');

  // Dropdown open state
  const [showBudgetMenu, setShowBudgetMenu]       = useState(false);
  const [showCountryMenu, setShowCountryMenu]     = useState(false);
  const [showSortMenu, setShowSortMenu]           = useState(false);

  // Sidebar accordion
  const [catExpanded, setCatExpanded]     = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [showMoreCats, setShowMoreCats]   = useState(false);

  // Refine AI modal
  const [refineProduct, setRefineProduct] = useState<typeof PRODUCTS[0] | undefined>(undefined);
  const [showRefineModal, setShowRefineModal] = useState(false);

  const budget  = BUDGET_OPTIONS[selectedBudgetIdx];
  const country = COUNTRIES[selectedCountryIdx];
  const activeFilterCount = selectedCategories.size + selectedBrands.size + (selectedBudgetIdx > 0 ? 1 : 0);

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
    list = list.filter(p => p.price >= budget.min && p.price < budget.max);
    if (sortBy === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [catalogSubTab, catalogTypeFilter, searchQuery, selectedCategories, selectedBrands, budget, sortBy]);

  const filteredDesigns = useMemo(() => {
    if (myItemsTypeFilter === 'bulk') return []; // show bulk orders instead
    let list = [...MY_DESIGNS];
    if (myItemsSearch) list = list.filter(d =>
      d.name.toLowerCase().includes(myItemsSearch.toLowerCase())
    );
    if (printStyleFilter !== 'all') list = list.filter(d => d.printStyle === printStyleFilter);
    return list;
  }, [myItemsSearch, printStyleFilter, myItemsTypeFilter]);

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

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setSelectedBudgetIdx(0);
    setSearchQuery('');
  };

  const closeAll = () => { setShowBudgetMenu(false); setShowCountryMenu(false); setShowSortMenu(false); };

  const scrollToCatalog = () => {
    catalogGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openRefine = (product?: typeof PRODUCTS[0]) => {
    setRefineProduct(product);
    setShowRefineModal(true);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="relative bg-white border-b border-[#e0ebf7] overflow-hidden">
        <div
          className="absolute right-0 top-0 w-[50%] h-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(201,255,253,0.35) 60%, rgba(185,210,255,0.25) 100%)' }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-[120px] pt-6 pb-0">
          <div className="absolute right-4 md:right-[120px] top-6">
            <AskSnippyButton />
          </div>

          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[12px] font-bold text-[#a6b3c3] uppercase tracking-wide">Discover</span>
            <span className="text-[12px] text-[#a6b3c3]">/</span>
            <span className="text-[12px] font-bold text-[#59728f] uppercase tracking-wide">Swag</span>
          </div>

          <h1
            className="text-4xl md:text-[52px] text-[#012754] leading-tight mb-0"
            style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}
          >
            Swag
          </h1>

          {/* Main tabs: Catalog | My Items | Inventory | Shipments */}
          <div className="flex items-end gap-0 mt-2 border-b border-[#e0ebf7]">
            {([
              { id: 'catalog'   as MainTab, label: 'Catalog',   count: PRODUCTS.length,    icon: null },
              { id: 'my-items'  as MainTab, label: 'My Items',  count: MY_DESIGNS.length,  icon: Package },
              { id: 'inventory' as MainTab, label: 'Inventory', count: 0,                  icon: Archive },
              { id: 'shipments' as MainTab, label: 'Shipments', count: 0,                  icon: Truck },
            ] as { id: MainTab; label: string; count: number; icon: React.ElementType | null }[]).map(({ id, label, count, icon: Icon }) => {
              const active = mainTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setMainTab(id)}
                  className={`flex items-center gap-2 h-14 px-5 md:px-7 text-[14px] md:text-[15px] font-medium transition-all border-b-2 -mb-px ${
                    active ? 'border-[#012754] text-[#012754]' : 'border-transparent text-[#59728f] hover:text-[#345276]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-[#012754] text-white' : 'bg-[#f5f8fc] text-[#a6b3c3]'}`}>
                      {count}
                    </span>
                  )}
                  {id === 'my-items' && pendingLogo && (
                    <span className="w-2 h-2 rounded-full bg-[#3077c9] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Logo Hero (catalog tab only) ─────────────────────────── */}
      {mainTab === 'catalog' && (
        <LogoHero
          onCreateCollection={() => navigate('/collection/new', {
            state: pendingLogo
              ? { mode: 'swag', logoUrl: pendingLogo.url, domain: pendingLogo.domain }
              : {},
          })}
          onRefineWithAI={_logoUrl => openRefine(undefined)}
          onPickAndSend={scrollToCatalog}
          onLogoReady={(url, domain) => setPendingLogo({ url, domain })}
        />
      )}

      {/* ── CATALOG TAB ──────────────────────────────────────────── */}
      {mainTab === 'catalog' && (
        <>
          {/* Design-mode banner — shown when user has uploaded/fetched a logo */}
          {pendingLogo && (
            <div className="bg-gradient-to-r from-[#e8f4fd] to-[#f0f6ff] border-b border-[#c8dff0]">
              <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-2.5 flex items-center gap-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <div className="w-7 h-7 bg-white rounded-[7px] border border-[#d5e8f7] flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                  <img src={pendingLogo.url} alt="" className="w-full h-full object-contain p-0.5" />
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                  <span className="text-[12px] font-bold text-[#1a5fa0]">Design mode active</span>
                  <span className="text-[12px] text-[#4a7da8]">— {pendingLogo.domain} brand applied to products.</span>
                  <span className="text-[12px] text-[#6b94b8]">Click any product to design and save it to My Items.</span>
                </div>
                <button
                  className="shrink-0 text-[11px] font-semibold text-[#3077c9] hover:text-[#012754] transition-colors underline"
                  onClick={() => setMainTab('my-items')}
                >
                  View My Items →
                </button>
                <button
                  onClick={() => setPendingLogo(null)}
                  className="shrink-0 w-5 h-5 rounded-full bg-[#c8dff0] flex items-center justify-center text-[#3077c9] hover:bg-[#b8d2e8] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Catalog filter bar (sticky) */}
          <div className="bg-white border-b border-[#e0ebf7] sticky top-0 z-10">
            <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] pt-4 pb-3">

              {/* ── Secondary filters row ── */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile filters sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex md:hidden items-center gap-2 bg-white border border-[#e0ebf7] rounded-full px-4 py-3 text-[14px] font-medium text-[#012754] hover:bg-[#f5f8fc] transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]">
                      <SlidersHorizontal className="w-4 h-4 text-[#8093a9]" />
                      Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-white">
                    <SheetHeader>
                      <SheetTitle className="text-[16px] font-semibold text-[#345276]">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 overflow-y-auto h-full pb-8">
                      <SidebarContent
                        catExpanded={catExpanded} setCatExpanded={setCatExpanded}
                        brandExpanded={brandExpanded} setBrandExpanded={setBrandExpanded}
                        showMoreCats={showMoreCats} setShowMoreCats={setShowMoreCats}
                        selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                        selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                        catalogTypeFilter={catalogTypeFilter} setCatalogTypeFilter={setCatalogTypeFilter}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <PillDropdown
                  label={budget.label === 'Any Budget' ? 'Budget' : budget.label}
                  open={showBudgetMenu}
                  onToggle={() => { closeAll(); setShowBudgetMenu(v => !v); }}
                >
                  {BUDGET_OPTIONS.map((opt, i) => (
                    <DropdownItem key={opt.label} active={i === selectedBudgetIdx} onClick={() => { setSelectedBudgetIdx(i); setShowBudgetMenu(false); }}>
                      {opt.label}
                    </DropdownItem>
                  ))}
                </PillDropdown>

                <PillDropdown
                  label={country.name}
                  open={showCountryMenu}
                  onToggle={() => { closeAll(); setShowCountryMenu(v => !v); }}
                  prefix={<span className="text-base leading-none">{country.flag}</span>}
                >
                  {COUNTRIES.map((c, i) => (
                    <DropdownItem key={c.code} active={i === selectedCountryIdx} onClick={() => { setSelectedCountryIdx(i); setShowCountryMenu(false); }}>
                      <span className="flex items-center gap-2"><span>{c.flag}</span>{c.name}</span>
                    </DropdownItem>
                  ))}
                </PillDropdown>

                {activeFilterCount > 0 && (
                  <button
                    className="flex items-center gap-1 text-[13px] font-medium text-[#8093a9] hover:text-[#3077c9] transition-colors"
                    onClick={clearFilters}
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}

                <div className="flex-1" />

                <PillDropdown
                  label={SORT_OPTIONS.find(s => s.value === sortBy)?.label ?? 'Sort'}
                  open={showSortMenu}
                  onToggle={() => { closeAll(); setShowSortMenu(v => !v); }}
                  alignRight
                >
                  {SORT_OPTIONS.map(opt => (
                    <DropdownItem key={opt.value} active={opt.value === sortBy} onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}>
                      {opt.label}
                    </DropdownItem>
                  ))}
                </PillDropdown>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8093a9]" />
                  <div className="absolute left-9 top-1/2 -translate-y-1/2 w-px h-5 bg-[#e0ebf7]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="pl-12 pr-4 h-14 border border-[#e0ebf7] rounded-xl text-[14px] text-[#345276] placeholder:text-[#8093a9] focus:outline-none focus:border-[#3077c9] focus:ring-1 focus:ring-[#3077c9] w-52 md:w-64 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  {searchQuery && (
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8093a9] hover:text-[#59728f]" onClick={() => setSearchQuery('')}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] pt-5 pb-2">
            <p className="text-[12px] text-[#a6b3c3] font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {catalogSubTab === 'inventory' && ' · Minimum quantity required'}
            </p>
          </div>

          {/* Sidebar + Grid */}
          <div className="max-w-[1400px] mx-auto" ref={catalogGridRef}>
            <div className="flex">
              <aside className="hidden md:block w-[304px] shrink-0 border-r border-[#e0ebf7] pt-6 pl-[88px] pr-4 pb-8">
                <h3 className="text-[16px] font-semibold text-[#345276] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Filters</h3>
                <div className="w-full h-px bg-[#e0ebf7] mb-5" />
                <SidebarContent
                  catExpanded={catExpanded} setCatExpanded={setCatExpanded}
                  brandExpanded={brandExpanded} setBrandExpanded={setBrandExpanded}
                  showMoreCats={showMoreCats} setShowMoreCats={setShowMoreCats}
                  selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                  selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                  catalogTypeFilter={catalogTypeFilter} setCatalogTypeFilter={setCatalogTypeFilter}
                />
              </aside>

              <div className="flex-1 pt-6 px-4 md:pr-[40px] md:pl-8 pb-16">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <span className="text-6xl mb-4">🔍</span>
                    <h3 className="text-[16px] font-semibold text-[#345276] mb-2">No products found</h3>
                    <p className="text-[14px] text-[#8093a9] mb-4">Try adjusting your filters</p>
                    {activeFilterCount > 0 && (
                      <button className="h-10 px-5 rounded-[10px] border border-[#3077c9] text-[#3077c9] text-[13px] font-semibold hover:bg-[#f0f6ff]" onClick={clearFilters}>
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
                        onClick={() => navigate(`/product/${product.id}`, {
                          state: pendingLogo ? { logoUrl: pendingLogo.url, domain: pendingLogo.domain } : undefined,
                        })}
                        onDesign={() => navigate(`/design/${product.id}`, {
                          state: pendingLogo ? { logoUrl: pendingLogo.url, domain: pendingLogo.domain } : undefined,
                        })}
                        onRefineWithAI={() => openRefine(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MY ITEMS TAB ─────────────────────────────────────────── */}
      {mainTab === 'my-items' && (
        <>
          {/* My Items top bar */}
          <div className="bg-white border-b border-[#e0ebf7] sticky top-0 z-10">
            <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-3">
              <div className="flex items-center gap-3">
                {/* Mobile filters sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex md:hidden items-center gap-2 bg-white border border-[#e0ebf7] rounded-full px-4 py-2.5 text-[14px] font-medium text-[#012754] hover:bg-[#f5f8fc] transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]">
                      <SlidersHorizontal className="w-4 h-4 text-[#8093a9]" />
                      Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-white">
                    <SheetHeader>
                      <SheetTitle className="text-[16px] font-semibold text-[#345276]">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 overflow-y-auto h-full pb-8">
                      <MyItemsSidebarContent
                        myItemsTypeFilter={myItemsTypeFilter} setMyItemsTypeFilter={setMyItemsTypeFilter}
                        printStyleFilter={printStyleFilter} setPrintStyleFilter={setPrintStyleFilter}
                        myItemsSearch={myItemsSearch} setMyItemsSearch={setMyItemsSearch}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="flex-1" />
                {myItemsTypeFilter !== 'bulk' && (
                  <button
                    className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90 shrink-0"
                    style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                    onClick={() => setMainTab('catalog')}
                  >
                    + Design Something New
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar + Grid */}
          <div className="max-w-[1400px] mx-auto">
            <div className="flex">
              <aside className="hidden md:block w-[304px] shrink-0 border-r border-[#e0ebf7] pt-6 pl-[88px] pr-4 pb-8">
                <h3 className="text-[16px] font-semibold text-[#345276] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Filters</h3>
                <div className="w-full h-px bg-[#e0ebf7] mb-5" />
                <MyItemsSidebarContent
                  myItemsTypeFilter={myItemsTypeFilter} setMyItemsTypeFilter={setMyItemsTypeFilter}
                  printStyleFilter={printStyleFilter} setPrintStyleFilter={setPrintStyleFilter}
                  myItemsSearch={myItemsSearch} setMyItemsSearch={setMyItemsSearch}
                />
              </aside>

              <div className="flex-1 pt-6 px-4 md:pr-[40px] md:pl-8 pb-16">
                {/* Results count */}
                <p className="text-[12px] text-[#a6b3c3] font-medium mb-5">
                  {myItemsTypeFilter === 'bulk'
                    ? `${filteredBulkOrders.length} bulk ${filteredBulkOrders.length === 1 ? 'order' : 'orders'}`
                    : `${filteredDesigns.length} saved ${filteredDesigns.length === 1 ? 'design' : 'designs'}`}
                </p>

                {/* Bulk orders view */}
                {myItemsTypeFilter === 'bulk' && (
                  filteredBulkOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <span className="text-6xl mb-4">📦</span>
                      <h3 className="text-[16px] font-semibold text-[#345276] mb-2">No bulk orders yet</h3>
                      <p className="text-[14px] text-[#8093a9] mb-5">Browse Bulk & Kits products to start an order.</p>
                      <button
                        className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
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
                      <h3 className="text-[16px] font-semibold text-[#345276] mb-2">No designs yet</h3>
                      <p className="text-[14px] text-[#8093a9] mb-5">
                        Click "Design This" on any catalog item to save it here.
                      </p>
                      <button
                        className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
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
                          onSend={() => alert(`Sending "${design.name}"…`)}
                          onEdit={() => navigate(`/design/${design.productId}`)}
                          onRefineWithAI={() => {
                            const product = PRODUCTS.find(p => p.id === design.productId);
                            openRefine(product);
                          }}
                        />
                      ))}

                      {/* Ghost "create new" card */}
                      <div
                        className="border-2 border-dashed border-[#b7cfec] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#f5f8fc] hover:border-[#3077c9] transition-all p-8 min-h-[280px]"
                        onClick={() => setMainTab('catalog')}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#eaf1fa] flex items-center justify-center">
                          <span className="text-2xl text-[#3077c9]">+</span>
                        </div>
                        <p className="text-[13px] font-semibold text-[#8093a9] text-center">Design Something New</p>
                        <p className="text-[11px] text-[#a6b3c3] text-center">Browse catalog to pick a product</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── INVENTORY TAB ────────────────────────────────────────── */}
      {mainTab === 'inventory' && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-20 flex flex-col items-center text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <div className="w-20 h-20 rounded-[24px] bg-[#eaf1fa] border border-[#c8dff0] flex items-center justify-center mb-6">
            <Archive className="w-9 h-9 text-[#3077c9]" />
          </div>
          <h2
            className="text-[26px] font-bold text-[#012754] mb-3"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Your inventory vault is empty
          </h2>
          <p className="text-[15px] text-[#59728f] leading-relaxed max-w-[480px] mb-2">
            Buy swag in bulk upfront and we'll store it in our warehouse. When you're ready to send, we pick, pack, and ship it straight to your recipient — no reordering, no waiting.
          </p>
          <p className="text-[13px] text-[#a6b3c3] max-w-[420px] mb-8">
            Perfect for onboarding kits, branded apparel runs, or any time you want swag ready to go at a moment's notice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
              onClick={() => setMainTab('catalog')}
            >
              Browse Bulk Catalog
            </button>
            <button
              className="h-11 px-6 rounded-[14px] border border-[#e0ebf7] text-[#59728f] text-[14px] font-medium hover:bg-[#f5f8fc] transition-colors"
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
              <div key={item.title} className="bg-[#f5f8fc] rounded-[16px] p-5 text-left border border-[#e0ebf7]">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <p className="text-[13px] font-bold text-[#012754] mb-1">{item.title}</p>
                <p className="text-[12px] text-[#8093a9] leading-relaxed">{item.body}</p>
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
            className="text-[26px] font-bold text-[#012754] mb-3"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            No shipments yet
          </h2>
          <p className="text-[15px] text-[#59728f] leading-relaxed max-w-[480px] mb-2">
            When you send items from your inventory, the full order and tracking history shows up here — recipient name, address, status, and estimated delivery.
          </p>
          <p className="text-[13px] text-[#a6b3c3] max-w-[440px] mb-8">
            Note: print-on-demand swag (custom items designed and sent digitally) ships directly from our production partner and isn't tracked here.
          </p>
          <button
            className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            onClick={() => setMainTab('inventory')}
          >
            Go to Inventory
          </button>
          <div className="mt-12 w-full max-w-[560px]">
            <div className="border border-[#e0ebf7] rounded-[16px] overflow-hidden">
              {/* Mock empty table header */}
              <div className="grid grid-cols-4 bg-[#f5f8fc] border-b border-[#e0ebf7] px-5 py-3">
                {['Recipient', 'Item', 'Status', 'Shipped'].map(h => (
                  <span key={h} className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest">{h}</span>
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
    </div>
  );
}
