import { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, GripVertical, Plus, Search, SlidersHorizontal, Star, Trash2, X } from 'lucide-react';
import { PRODUCTS, type Product, type ProductCategory } from '../../../data/mockData';
import {
  STYLE_CODES, baseCost, fmtMoney, retailPrice, storeProducts, unitMargin,
  type CatalogGroupingMode, type DistributorStore,
} from '../../../data/storesData';
import { useStores } from '../../../context/StoresContext';
import { StoreProductImage, StoreProductMockup, storeLogoSrc } from '../../../components/stores/StoreBits';
import { FilterSection, CheckboxRow } from '../../../components/catalog/FilterPrimitives';
import { COLOR_FAMILIES } from '../../../utils/logoColors';
import { card } from './shared';
import { ProductEditor } from './ProductEditor';

const GROUPING_LABELS: Record<CatalogGroupingMode, string> = {
  'manual': 'Manual order',
  'category': 'By category',
  'brand': 'By brand',
  'custom': 'Custom groups',
};

export function ProductsTab({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const [showAdd, setShowAdd] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [catFilter, setCatFilter] = useState<Set<ProductCategory>>(new Set());
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [sizeFilter, setSizeFilter] = useState<Set<string>>(new Set());
  const [colorFamFilter, setColorFamFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'featured' | 'hidden'>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ cat: true, brand: true, size: false, color: false });
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const products = storeProducts(store);
  const logoSrc = storeLogoSrc(store);
  const grouping = store.catalogLayout.mode;

  const allCats = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);
  const allSizes = useMemo(() => [...new Set(products.flatMap(p => p.sizes))].slice(0, 10), [products]);

  const activeFilterCount = catFilter.size + brandFilter.size + sizeFilter.size + colorFamFilter.size + (statusFilter !== 'all' ? 1 : 0);
  const filtering = activeFilterCount > 0 || query.trim().length > 0;

  const filtered = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (STYLE_CODES[p.id] ?? '').toLowerCase().includes(q));
    }
    if (catFilter.size) list = list.filter(p => catFilter.has(p.category));
    if (brandFilter.size) list = list.filter(p => brandFilter.has(p.brand));
    if (sizeFilter.size) list = list.filter(p => p.sizes.some(s => sizeFilter.has(s)));
    if (colorFamFilter.size) list = list.filter(p => p.colors.some(c => COLOR_FAMILIES.some(f => colorFamFilter.has(f.id) && f.match(c.hex))));
    if (statusFilter === 'featured') list = list.filter(p => store.featuredIds.includes(p.id));
    if (statusFilter === 'hidden') list = list.filter(p => store.hiddenIds.includes(p.id));
    return list;
  }, [products, query, catFilter, brandFilter, sizeFilter, colorFamFilter, statusFilter, store.featuredIds, store.hiddenIds]);

  // ── Grouping: sections rendered on the storefront in this same order ────────
  const sections = useMemo((): { id: string; label: string | null; items: Product[] }[] => {
    if (grouping === 'category') {
      return [...new Set(filtered.map(p => p.category))].map(cat => ({
        id: cat, label: cat, items: filtered.filter(p => p.category === cat),
      }));
    }
    if (grouping === 'brand') {
      return [...new Set(filtered.map(p => p.brand))].sort().map(b => ({
        id: b, label: b, items: filtered.filter(p => p.brand === b),
      }));
    }
    if (grouping === 'custom') {
      const groups = store.catalogLayout.groups;
      const grouped = new Set(groups.flatMap(g => g.productIds));
      const named = groups.map(g => ({
        id: g.id, label: g.label,
        items: g.productIds.map(id => filtered.find(p => p.id === id)).filter((p): p is Product => !!p),
      }));
      const rest = filtered.filter(p => !grouped.has(p.id));
      return rest.length ? [...named, { id: '__rest__', label: 'More gear', items: rest }] : named;
    }
    return [{ id: '__all__', label: null, items: filtered }];
  }, [filtered, grouping, store.catalogLayout.groups]);

  const toggle = (list: 'featuredIds' | 'hiddenIds', id: string) => {
    updateStore(store.id, s => ({
      [list]: s[list].includes(id) ? s[list].filter(x => x !== id) : [...s[list], id],
    }));
  };

  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>) => (v: T) =>
    setter(prev => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v); else n.add(v);
      return n;
    });

  // ── Drag-and-drop reorder (manual mode, no filters) ─────────────────────────
  const dndEnabled = grouping === 'manual' && !filtering;

  const handleDrop = (targetId: string) => {
    const src = dragId.current;
    dragId.current = null;
    setDragOverId(null);
    if (!src || src === targetId) return;
    updateStore(store.id, s => {
      const ids = s.productIds.filter(x => x !== src);
      const at = ids.indexOf(targetId);
      ids.splice(at < 0 ? ids.length : at, 0, src);
      return { productIds: ids };
    });
  };

  const setGroupFor = (productId: string, groupId: string) => {
    updateStore(store.id, s => {
      const groups = s.catalogLayout.groups.map(g => ({
        ...g,
        productIds: g.productIds.filter(x => x !== productId),
      }));
      const target = groups.find(g => g.id === groupId);
      if (target) target.productIds.push(productId);
      return { catalogLayout: { ...s.catalogLayout, groups } };
    });
  };

  const editing = editingId ? products.find(p => p.id === editingId) : undefined;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="text-[13.5px] text-snp-navy-600 mr-1">
          <b className="text-snp-navy-950">{products.length} styles</b> · {store.featuredIds.length} featured · {store.hiddenIds.length} hidden
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, brand or style code…"
            className="w-full h-10 pl-9 pr-3 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] outline-none focus:border-snp-indigo-500"
          />
        </div>

        {/* Filters popover */}
        <div className="relative">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={`flex items-center gap-2 h-10 px-4 rounded-[10px] border text-[13px] font-semibold ${activeFilterCount ? 'border-snp-indigo-500 text-snp-indigo-700 bg-snp-indigo-50/50' : 'border-snp-navy-200 bg-white text-snp-navy-700 hover:bg-snp-navy-50'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
          {filtersOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFiltersOpen(false)} />
              <div className="absolute left-0 top-12 z-40 w-72 bg-white rounded-[14px] border border-snp-navy-200 shadow-[0px_16px_40px_rgba(1,39,84,0.18)] p-4 max-h-[480px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-snp-navy-950">Filter products</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setCatFilter(new Set()); setBrandFilter(new Set()); setSizeFilter(new Set()); setColorFamFilter(new Set()); setStatusFilter('all'); }}
                      className="text-[11.5px] font-bold text-snp-indigo-700 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 mb-3">
                  {(['all', 'featured', 'hidden'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`h-8 px-3 rounded-[8px] text-[11.5px] font-bold capitalize ${statusFilter === s ? 'bg-snp-navy-950 text-white' : 'bg-snp-navy-50 text-snp-navy-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <FilterSection title="Category" expanded={!!expanded.cat} onToggle={() => setExpanded(e => ({ ...e, cat: !e.cat }))}>
                  {allCats.map(c => <CheckboxRow key={c} label={c} checked={catFilter.has(c)} onToggle={() => toggleSet(setCatFilter)(c)} />)}
                </FilterSection>
                <FilterSection title="Brand" expanded={!!expanded.brand} onToggle={() => setExpanded(e => ({ ...e, brand: !e.brand }))}>
                  {allBrands.map(b => <CheckboxRow key={b} label={b} checked={brandFilter.has(b)} onToggle={() => toggleSet(setBrandFilter)(b)} />)}
                </FilterSection>
                <FilterSection title="Available sizes" expanded={!!expanded.size} onToggle={() => setExpanded(e => ({ ...e, size: !e.size }))}>
                  {allSizes.map(s => <CheckboxRow key={s} label={s} checked={sizeFilter.has(s)} onToggle={() => toggleSet(setSizeFilter)(s)} />)}
                </FilterSection>
                <FilterSection title="Color" expanded={!!expanded.color} onToggle={() => setExpanded(e => ({ ...e, color: !e.color }))}>
                  {COLOR_FAMILIES.map(f => <CheckboxRow key={f.id} label={f.label} checked={colorFamFilter.has(f.id)} onToggle={() => toggleSet(setColorFamFilter)(f.id)} />)}
                </FilterSection>
              </div>
            </>
          )}
        </div>

        {/* Grouping mode */}
        <select
          value={grouping}
          onChange={e => updateStore(store.id, s => ({ catalogLayout: { ...s.catalogLayout, mode: e.target.value as CatalogGroupingMode } }))}
          className="h-10 px-3 bg-white rounded-[10px] border border-snp-navy-200 text-[12.5px] font-semibold text-snp-navy-700 outline-none"
          title="How products are organized on the storefront"
        >
          {(Object.keys(GROUPING_LABELS) as CatalogGroupingMode[]).map(m => (
            <option key={m} value={m}>Storefront: {GROUPING_LABELS[m]}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFeatured(true)}
          className="ml-auto flex items-center gap-2 h-10 px-4 rounded-[10px] border border-amber-300 bg-amber-50 text-[13px] font-semibold text-amber-700 hover:bg-amber-100"
        >
          <Star className="w-3.5 h-3.5 fill-current" /> Featured drops ({store.featuredIds.length})
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90"
          style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
        >
          <Plus className="w-4 h-4" /> Add products
        </button>
      </div>

      {/* Hint strips */}
      {grouping === 'manual' && (
        <p className="text-[12px] text-snp-navy-400 mb-4 -mt-1">
          {dndEnabled
            ? 'Drag the ⠿ handle to rearrange — this order is exactly how products appear on the storefront. Click any tile to edit it.'
            : 'Reordering is paused while search or filters are active. Click any tile to edit it.'}
        </p>
      )}
      {grouping === 'custom' && (
        <div className="flex items-center gap-3 mb-4 -mt-1">
          <p className="text-[12px] text-snp-navy-400">Assign each product to a group — sections appear in this order on the storefront.</p>
          <button
            onClick={() => {
              const label = prompt('Group name (e.g. "Game day", "Staff picks")');
              if (label?.trim()) updateStore(store.id, s => ({
                catalogLayout: { ...s.catalogLayout, groups: [...s.catalogLayout.groups, { id: `grp-${Date.now().toString(36)}`, label: label.trim(), productIds: [] }] },
              }));
            }}
            className="text-[12px] font-bold text-snp-indigo-700 hover:underline"
          >
            + Add group
          </button>
        </div>
      )}

      {/* Sections */}
      {sections.map(section => (
        <div key={section.id} className="mb-8">
          {section.label && (
            <div className="flex items-center gap-2.5 mb-3">
              <h3 className="text-[16px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>{section.label}</h3>
              <span className="text-[11.5px] text-snp-navy-400 font-semibold">{section.items.length} item{section.items.length !== 1 ? 's' : ''}</span>
              {grouping === 'custom' && section.id !== '__rest__' && (
                <button
                  title="Delete group (items move to “More gear”)"
                  onClick={() => updateStore(store.id, s => ({
                    catalogLayout: { ...s.catalogLayout, groups: s.catalogLayout.groups.filter(g => g.id !== section.id) },
                  }))}
                  className="text-snp-navy-300 hover:text-snp-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.items.map(p => {
              const hidden = store.hiddenIds.includes(p.id);
              const featured = store.featuredIds.includes(p.id);
              const price = retailPrice(store, p);
              const isDragOver = dragOverId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setEditingId(p.id)}
                  onDragOver={dndEnabled ? e => { e.preventDefault(); setDragOverId(p.id); } : undefined}
                  onDragLeave={dndEnabled ? () => setDragOverId(d => d === p.id ? null : d) : undefined}
                  onDrop={dndEnabled ? e => { e.preventDefault(); handleDrop(p.id); } : undefined}
                  className={`${card} overflow-hidden group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0px_10px_24px_rgba(1,39,84,0.12)] ${hidden ? 'opacity-55' : ''} ${isDragOver ? 'ring-2 ring-snp-indigo-500 ring-offset-2' : ''}`}
                >
                  <div className="relative">
                    <StoreProductMockup store={store} product={p} className="h-44 bg-white p-3" />
                    {dndEnabled && (
                      <span
                        draggable
                        onClick={e => e.stopPropagation()}
                        onDragStart={e => { dragId.current = p.id; e.dataTransfer.effectAllowed = 'move'; }}
                        onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
                        title="Drag to reorder"
                        className="absolute top-2 left-2 w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white/95 flex items-center justify-center text-snp-navy-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>
                    )}
                    {featured && (
                      <span className="absolute bottom-2.5 left-2.5 text-[9.5px] font-bold uppercase tracking-wide bg-snp-amber-400 text-snp-navy-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button title={featured ? 'Unfeature' : 'Feature on homepage'} onClick={() => toggle('featuredIds', p.id)}
                        className={`w-8 h-8 rounded-[8px] border flex items-center justify-center bg-white shadow-sm ${featured ? 'text-amber-500 border-amber-300' : 'text-snp-navy-400 border-snp-navy-200 hover:text-amber-500'}`}>
                        <Star className={`w-3.5 h-3.5 ${featured ? 'fill-current' : ''}`} />
                      </button>
                      <button title={hidden ? 'Show in store' : 'Hide from store'} onClick={() => toggle('hiddenIds', p.id)}
                        className="w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-400 hover:text-snp-navy-800 shadow-sm">
                        {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button title="Remove from store" onClick={() => updateStore(store.id, s => ({ productIds: s.productIds.filter(x => x !== p.id) }))}
                        className="w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-400 hover:text-snp-red-600 shadow-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3.5 pt-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                    <div className="text-[13px] font-semibold text-snp-navy-950 truncate mb-2">
                      {store.productCustomizations[p.id]?.displayName || p.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] text-snp-navy-500">Cost {fmtMoney(baseCost(p))}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-bold text-snp-navy-950">{fmtMoney(price)}</span>
                        <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{fmtMoney(unitMargin(store, p))}</span>
                      </div>
                    </div>
                    {grouping === 'custom' && (
                      <select
                        value={store.catalogLayout.groups.find(g => g.productIds.includes(p.id))?.id ?? '__rest__'}
                        onClick={e => e.stopPropagation()}
                        onChange={e => setGroupFor(p.id, e.target.value)}
                        className="mt-2 w-full h-8 px-2 bg-snp-navy-50 rounded-[7px] border border-snp-navy-200 text-[11.5px] font-semibold text-snp-navy-700 outline-none"
                      >
                        {store.catalogLayout.groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                        <option value="__rest__">More gear</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className={`${card} py-14 text-center text-[13.5px] text-snp-navy-400`}>
          No products match — try clearing filters or the search.
        </div>
      )}

      {/* Add products drawer */}
      {showAdd && <AddProductsDrawer store={store} logoSrc={logoSrc} onClose={() => setShowAdd(false)} />}

      {/* Featured drops manager */}
      {showFeatured && <FeaturedDropsManager store={store} onClose={() => setShowFeatured(false)} />}

      {/* Product editor */}
      {editing && <ProductEditor store={store} product={editing} onClose={() => setEditingId(null)} />}
    </div>
  );
}

// ── Add products drawer (search + filters over the full catalog) ─────────────

function AddProductsDrawer({ store, logoSrc, onClose }: {
  store: DistributorStore;
  logoSrc: string;
  onClose: () => void;
}) {
  const { updateStore } = useStores();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState('');

  const catalog = useMemo(() => PRODUCTS.filter(p => p.image.startsWith('/')), []);
  const cats = useMemo(() => [...new Set(catalog.map(p => p.category))], [catalog]);
  const brands = useMemo(() => [...new Set(catalog.map(p => p.brand))].sort(), [catalog]);

  const filtered = useMemo(() => {
    let list = catalog;
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle) ||
        (STYLE_CODES[p.id] ?? '').toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle));
    }
    if (cat) list = list.filter(p => p.category === cat);
    if (brand) list = list.filter(p => p.brand === brand);
    return list;
  }, [catalog, q, cat, brand]);

  const sel = 'h-10 px-3 bg-white rounded-[10px] border border-snp-navy-200 text-[12.5px] font-semibold text-snp-navy-700 outline-none focus:border-snp-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(1,39,84,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl bg-background h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[20px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Add from catalog</h3>
            <p className="text-[12.5px] text-snp-navy-500">One all-in Snappy cost per style — decoration and shipping included</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white border border-snp-navy-200 flex items-center justify-center text-snp-navy-500"><X className="w-4 h-4" /></button>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-2.5 mb-4 flex-wrap sticky top-0 z-10 bg-background py-1">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-400" />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search name, brand or style code…"
              className="w-full h-10 pl-9 pr-3 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] outline-none focus:border-snp-indigo-500"
            />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} className={sel}>
            <option value="">All categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={brand} onChange={e => setBrand(e.target.value)} className={sel}>
            <option value="">All brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {(q || cat || brand) && (
            <button onClick={() => { setQ(''); setCat(''); setBrand(''); }} className="text-[12px] font-bold text-snp-indigo-700 hover:underline">
              Clear
            </button>
          )}
        </div>

        <p className="text-[11.5px] text-snp-navy-400 mb-3">{filtered.length} style{filtered.length !== 1 ? 's' : ''}</p>

        {filtered.length === 0 ? (
          <p className="text-[13px] text-snp-navy-400 py-14 text-center">Nothing matches — try a different search or filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p => {
              const inStore = store.productIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  disabled={inStore}
                  onClick={() => updateStore(store.id, s => ({ productIds: [...s.productIds, p.id] }))}
                  className={`text-left rounded-[14px] border-2 bg-white overflow-hidden transition-all ${inStore ? 'opacity-40 border-snp-navy-100' : 'border-snp-navy-200 hover:border-snp-indigo-500'}`}
                >
                  <StoreProductImage product={p} logoSrc={logoSrc} className="h-28 p-2 bg-white" />
                  <div className="px-2.5 pb-2.5">
                    <div className="text-[9.5px] font-bold uppercase text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                    <div className="text-[11.5px] font-semibold text-snp-navy-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-snp-navy-500 mt-0.5">Cost {fmtMoney(baseCost(p))}{inStore && ' · Added ✓'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Featured drops — manual, curated merchandising ───────────────────────────

function FeaturedDropsManager({ store, onClose }: { store: DistributorStore; onClose: () => void }) {
  const { updateStore } = useStores();
  // draft state — nothing hits the storefront until "Save & publish"
  const [draft, setDraft] = useState<string[]>(store.featuredIds);
  const dragFeature = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const products = storeProducts(store);
  const byId = (id: string) => products.find(p => p.id === id);
  const featured = draft.map(byId).filter((p): p is Product => !!p);
  const available = products.filter(p => !draft.includes(p.id) && !store.hiddenIds.includes(p.id));
  const dirty = JSON.stringify(draft) !== JSON.stringify(store.featuredIds);

  const move = (id: string, dir: -1 | 1) => {
    setDraft(prev => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const dropOn = (targetId: string) => {
    const src = dragFeature.current;
    dragFeature.current = null;
    setDragOver(null);
    if (!src || src === targetId) return;
    setDraft(prev => {
      const next = prev.filter(x => x !== src);
      next.splice(next.indexOf(targetId), 0, src);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(1,39,84,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-[18px] p-6 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[19px] font-bold text-snp-navy-950 flex items-center gap-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            <Star className="w-4 h-4 text-amber-500 fill-current" /> Featured drops
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[12.5px] text-snp-navy-500 mb-4">
          Hand-pick and order the products in the storefront's “Featured drops” section (and hero collage). Changes publish only when you save.
        </p>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Current lineup */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2">
              Current lineup — drag or use arrows to reorder ({featured.length})
            </div>
            {featured.length === 0 ? (
              <p className="text-[12.5px] text-snp-navy-400 bg-snp-navy-50 rounded-[10px] px-3 py-4 text-center">
                Nothing featured — the storefront falls back to newest products. Add some below.
              </p>
            ) : (
              <div className="space-y-1.5">
                {featured.map((p, i) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => { dragFeature.current = p.id; }}
                    onDragEnd={() => { dragFeature.current = null; setDragOver(null); }}
                    onDragOver={e => { e.preventDefault(); setDragOver(p.id); }}
                    onDrop={e => { e.preventDefault(); dropOn(p.id); }}
                    className={`flex items-center gap-3 rounded-[12px] border bg-white px-2.5 py-2 cursor-grab active:cursor-grabbing ${dragOver === p.id ? 'border-snp-indigo-500 ring-2 ring-snp-indigo-100' : 'border-snp-navy-200'}`}
                  >
                    <GripVertical className="w-4 h-4 text-snp-navy-300 shrink-0" />
                    <span className="w-6 h-6 rounded-full bg-snp-navy-950 text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <StoreProductMockup store={store} product={p} className="w-11 h-11 bg-white rounded-[8px] border border-snp-navy-100 p-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold text-snp-navy-950 truncate">{store.productCustomizations[p.id]?.displayName || p.name}</div>
                      <div className="text-[10.5px] text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                    </div>
                    <button title="Move up" disabled={i === 0} onClick={() => move(p.id, -1)}
                      className="w-7 h-7 rounded-[7px] border border-snp-navy-200 text-snp-navy-500 disabled:opacity-30 hover:bg-snp-navy-50 flex items-center justify-center text-[11px] font-bold">↑</button>
                    <button title="Move down" disabled={i === featured.length - 1} onClick={() => move(p.id, 1)}
                      className="w-7 h-7 rounded-[7px] border border-snp-navy-200 text-snp-navy-500 disabled:opacity-30 hover:bg-snp-navy-50 flex items-center justify-center text-[11px] font-bold">↓</button>
                    <button title="Remove from featured" onClick={() => setDraft(prev => prev.filter(x => x !== p.id))}
                      className="w-7 h-7 rounded-[7px] text-snp-navy-300 hover:text-snp-red-600 flex items-center justify-center">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add more */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2">Add to featured</div>
            {available.length === 0 ? (
              <p className="text-[12px] text-snp-navy-400">Every visible product is already featured.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {available.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setDraft(prev => [...prev, p.id])}
                    className="text-left rounded-[12px] border border-snp-navy-200 bg-white overflow-hidden hover:border-amber-400 transition-colors group"
                  >
                    <div className="relative">
                      <StoreProductMockup store={store} product={p} className="h-20 p-1.5 bg-white" />
                      <span className="absolute inset-0 flex items-center justify-center bg-amber-400/0 group-hover:bg-amber-400/15 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-white rounded-full px-2 py-0.5 border border-amber-300 text-amber-700">+ Feature</span>
                      </span>
                    </div>
                    <div className="px-2 pb-1.5 text-[10.5px] font-semibold text-snp-navy-800 truncate">{p.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-snp-navy-100">
          <span className="text-[11.5px] text-snp-navy-400">{dirty ? 'Unpublished changes' : 'Live on the storefront'}</span>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="h-11 px-5 rounded-[10px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50">Cancel</button>
            <button
              disabled={!dirty}
              onClick={() => { updateStore(store.id, { featuredIds: draft }); onClose(); }}
              className="h-11 px-6 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-40 hover:opacity-90"
              style={{ background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' }}
            >
              Save & publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
