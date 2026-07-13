import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, X, Search, Pin, Trash2, ArrowLeftRight,
  MoreHorizontal, Send, Save, ChevronLeft, Check,
} from 'lucide-react';
import {
  PRODUCTS, MARKETPLACE_GIFTS, COLLECTION_EXAMPLES,
  type Product, type MarketplaceGift,
} from '../data/mockData';
import { LogoHero } from '../components/LogoHero';


// ── Types ─────────────────────────────────────────────────────────────────────

interface CollectionItem {
  type: 'swag' | 'marketplace';
  itemId: string;
}

type ItemData = Product | MarketplaceGift;

function getItemData(item: CollectionItem): ItemData | undefined {
  return item.type === 'swag'
    ? PRODUCTS.find(p => p.id === item.itemId)
    : MARKETPLACE_GIFTS.find(g => g.id === item.itemId);
}

function itemKey(item: CollectionItem) {
  return `${item.type}-${item.itemId}`;
}

// ── Add Product Curtain ───────────────────────────────────────────────────────

function AddProductCurtain({
  open,
  onClose,
  addedIds,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  addedIds: Set<string>;
  onAdd: (type: 'swag' | 'marketplace', itemId: string) => void;
}) {
  const [tab, setTab] = useState<'swag' | 'marketplace'>('swag');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 320);
    else setQuery('');
  }, [open]);

  const q = query.toLowerCase();
  const filteredSwag = PRODUCTS.filter(
    p => !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
  );
  const filteredMarketplace = MARKETPLACE_GIFTS.filter(
    g => !q || g.name.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q),
  );
  const items = tab === 'swag' ? filteredSwag : filteredMarketplace;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: open ? 'rgba(1,39,84,0.35)' : 'transparent',
          backdropFilter: open ? 'blur(2px)' : 'none',
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col"
        style={{
          width: '75%',
          maxWidth: '960px',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '-12px 0 48px rgba(1,39,84,0.18)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-snp-navy-200 shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Add products
            </h2>
            <p className="text-[12px] text-snp-navy-500 mt-0.5">
              Browse swag and marketplace gifts to add to your collection
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-snp-navy-50 text-snp-navy-600 hover:text-snp-navy-950 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-7 py-4 border-b border-snp-navy-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by product name or brand…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-snp-navy-400 outline-none focus:border-snp-indigo-600 transition-colors bg-[#fafcff]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-7 border-b border-snp-navy-200 shrink-0">
          {(['swag', 'marketplace'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-11 px-1 mr-6 text-[13px] font-medium border-b-2 -mb-px transition-all ${
                tab === t
                  ? 'border-snp-navy-950 text-snp-navy-950'
                  : 'border-transparent text-snp-navy-600 hover:text-snp-navy-700'
              }`}
            >
              {t === 'swag'
                ? `Swag · ${filteredSwag.length}`
                : `Marketplace · ${filteredMarketplace.length}`}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-7">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Search className="w-8 h-8 text-[#d1dce8]" />
              <p className="text-[14px] font-semibold text-snp-navy-500">No results for "{query}"</p>
              <button
                onClick={() => setQuery('')}
                className="text-[13px] font-semibold text-snp-indigo-600 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => {
                const isAdded = addedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[16px] border border-snp-navy-200 overflow-hidden flex flex-col hover:border-snp-navy-300 hover:shadow-[0px_4px_16px_0px_rgba(1,39,84,0.08)] transition-all"
                  >
                    <div className="bg-snp-navy-50 h-[140px] flex items-center justify-center overflow-hidden">
                      {item.image.startsWith('/') ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-3" />
                      ) : (
                        <span className="text-[48px]">{item.image}</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">{item.brand}</p>
                      <p className="text-[12px] font-semibold text-snp-navy-950 leading-snug line-clamp-2 flex-1">{item.name}</p>
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <p className="text-[12px] font-bold text-snp-indigo-600">${item.price}</p>
                        <button
                          disabled={isAdded}
                          onClick={() => onAdd(tab, item.id)}
                          className={`flex items-center gap-1 h-7 px-3 rounded-[8px] text-[11px] font-semibold transition-all shrink-0 ${
                            isAdded
                              ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] cursor-default'
                              : 'bg-snp-indigo-600 text-white hover:bg-[#2566b0] active:bg-[#1e5299]'
                          }`}
                        >
                          {isAdded
                            ? <><Check className="w-3 h-3" /> Added</>
                            : <>+ Add</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Card ellipsis menu ────────────────────────────────────────────────────────

function CardMenu({
  isPinned,
  onPin,
  onSwap,
  onRemove,
}: {
  isPinned: boolean;
  onPin: () => void;
  onSwap: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="absolute top-2.5 right-2.5 z-10">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-7 h-7 rounded-full bg-white border border-snp-navy-200 shadow-sm flex items-center justify-center text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute top-9 right-0 bg-white rounded-[12px] border border-snp-navy-200 shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] py-1.5 w-38 min-w-[148px]">
          <button
            onClick={() => { onPin(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-snp-navy-700 hover:bg-snp-navy-50 transition-colors"
          >
            <Pin className="w-3.5 h-3.5 shrink-0" />
            {isPinned ? 'Unpin' : 'Pin to top'}
          </button>
          <button
            onClick={() => { onSwap(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-snp-navy-700 hover:bg-snp-navy-50 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            Swap
          </button>
          <div className="my-1 mx-3 h-px bg-[#f0f5fb]" />
          <button
            onClick={() => { onRemove(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function getInitialItems(state: unknown): CollectionItem[] {
  const s = state as { collectionId?: string; productIds?: string[]; logoUrl?: string } | null;

  if (s?.collectionId) {
    const col = COLLECTION_EXAMPLES.find(c => c.id === s.collectionId);
    if (col) return [
      ...col.swagProductIds.map(id => ({ type: 'swag' as const, itemId: id })),
      ...col.otherGiftIds.map(id => ({ type: 'marketplace' as const, itemId: id })),
    ];
  }

  if (s?.productIds) {
    return s.productIds.map(id => ({ type: 'swag' as const, itemId: id }));
  }

  // Default starter set
  return ['1', '2', '6', '9'].map(id => ({ type: 'swag' as const, itemId: id }));
}

export function CollectionBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;


  const [items, setItems] = useState<CollectionItem[]>(() => getInitialItems(state));
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [curtainOpen, setCurtainOpen] = useState(false);

  const addedIds = new Set(items.map(i => i.itemId));

  const handleAdd = (type: 'swag' | 'marketplace', itemId: string) => {
    if (addedIds.has(itemId)) return;
    setItems(prev => [...prev, { type, itemId }]);
  };

  const handleRemove = (itemId: string) => {
    setItems(prev => prev.filter(i => i.itemId !== itemId));
    setPinnedIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
  };

  const handlePin = (itemId: string) => {
    setPinnedIds(prev => {
      const s = new Set(prev);
      s.has(itemId) ? s.delete(itemId) : s.add(itemId);
      return s;
    });
  };

  // Pinned items float to the top
  const sorted = [
    ...items.filter(i => pinnedIds.has(i.itemId)),
    ...items.filter(i => !pinnedIds.has(i.itemId)),
  ];

  const collectionName = (() => {
    const s = state as { collectionId?: string } | null;
    if (s?.collectionId) {
      return COLLECTION_EXAMPLES.find(c => c.id === s.collectionId)?.name ?? 'My Collection';
    }
    return 'My Collection';
  })();

  return (
    <div className="min-h-screen bg-snp-navy-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-snp-navy-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-snp-navy-600 hover:text-snp-navy-950 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[13px] font-medium">Back</span>
            </button>
            <div className="w-px h-5 bg-snp-navy-200 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-wide">Collection Builder</p>
              <p className="text-[15px] font-bold text-snp-navy-950 truncate">{collectionName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[12px] text-snp-navy-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            <div className="w-px h-4 bg-snp-navy-200" />
            <button className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-snp-navy-200 text-snp-navy-950 text-[12px] font-semibold hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors">
              <Save className="w-3.5 h-3.5" /> Save draft
            </button>
            <button
              onClick={() => navigate('/send')}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#3077c9' }}
            >
              <Send className="w-3.5 h-3.5" /> Send collection
            </button>
          </div>

        </div>
      </div>

      {/* ── Logo Hero ── */}
      <LogoHero
        onCreateCollection={() => setCurtainOpen(true)}
        ctaLabel="Continue →"
        productIds={items.filter(i => i.type === 'swag').slice(0, 2).map(i => i.itemId)}
      />

      {/* ── Product grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {/* Add product — always first */}
          <button
            onClick={() => setCurtainOpen(true)}
            className="border-2 border-dashed border-snp-navy-300 rounded-[20px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#eef5ff] hover:border-snp-indigo-600 transition-all p-6 min-h-[280px] text-left"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#eef5ff] flex items-center justify-center">
              <Plus className="w-5 h-5 text-snp-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold text-snp-navy-700">Add product</p>
              <p className="text-[11px] text-snp-navy-400 mt-0.5">Swag or marketplace gift</p>
            </div>
          </button>

          {/* Collection item cards */}
          {sorted.map(item => {
            const data = getItemData(item);
            if (!data) return null;
            const isPinned = pinnedIds.has(item.itemId);
            const key = itemKey(item);

            return (
              <div
                key={key}
                onClick={() => { if (item.type === 'swag') navigate(`/product/${item.itemId}`, { state: { backgroundLocation: location } }); }}
                className="bg-white rounded-[20px] border overflow-hidden flex flex-col transition-all cursor-pointer"
                style={{
                  borderColor: isPinned ? 'var(--snp-indigo-600)' : 'var(--snp-navy-200)',
                  boxShadow: isPinned
                    ? '0 0 0 1px var(--snp-indigo-600), 0px 4px 12px 0px rgba(48,119,201,0.12)'
                    : '0px 2px 8px 0px rgba(1,39,84,0.05)',
                }}
              >
                {/* Image */}
                <div className="bg-snp-navy-50 h-[180px] relative flex items-center justify-center overflow-hidden">
                  {data.image.startsWith('/') ? (
                    <img
                      src={data.image}
                      alt={data.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <span className="text-[56px]">{data.image}</span>
                  )}

                  {isPinned && (
                    <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-snp-indigo-600 flex items-center justify-center shadow-sm">
                      <Pin className="w-3 h-3 text-white" style={{ fill: 'white' }} />
                    </div>
                  )}

                  {item.type === 'marketplace' && (
                    <div className="absolute bottom-2.5 left-2.5 bg-white border border-snp-navy-200 rounded-full px-2 py-0.5 text-[9px] font-bold text-snp-navy-500 uppercase tracking-wide">
                      Marketplace
                    </div>
                  )}

                  <CardMenu
                    isPinned={isPinned}
                    onPin={() => handlePin(item.itemId)}
                    onSwap={() => setCurtainOpen(true)}
                    onRemove={() => handleRemove(item.itemId)}
                  />
                </div>

                {/* Info */}
                <div className="p-3.5 flex flex-col gap-1 flex-1">
                  <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">{data.brand}</p>
                  <p className="text-[12px] font-semibold text-snp-navy-950 leading-snug line-clamp-2 flex-1">{data.name}</p>
                  <p className="text-[13px] font-bold text-snp-indigo-600 mt-1">${data.price}</p>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ── Add product curtain ── */}
      <AddProductCurtain
        open={curtainOpen}
        onClose={() => setCurtainOpen(false)}
        addedIds={addedIds}
        onAdd={handleAdd}
      />

    </div>
  );
}
