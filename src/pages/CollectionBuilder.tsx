import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronDown, MoreVertical, Plus, X, Check,
  Sparkles, Gift, Tag, Globe, Search,
} from 'lucide-react';
import {
  PRODUCTS, MARKETPLACE_GIFTS, COUNTRIES,
  type Product,
} from '../data/mockData';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CollectionItem {
  uid: string;          // unique key within this collection
  productId?: string;   // ref to PRODUCTS
  giftId?: string;      // ref to MARKETPLACE_GIFTS
  isSwag: boolean;      // swag items can be designed/refined
}

interface LocationState {
  mode?: 'swag';
  logoUrl?: string;
  domain?: string;
}

// ── Mock preset themes ─────────────────────────────────────────────────────────

const PRESET_THEMES = [
  { id: 'apparel',   label: '👕 Branded Apparel', productIds: ['1', '4', '5', '13', '15', '16'] },
  { id: 'carry',     label: '🎒 Everyday Carry',  productIds: ['2', '6', '8', '9', '12', '14'] },
  { id: 'tech',      label: '💻 Tech & Workspace', productIds: ['7', '10', '11'] },
  { id: 'premium',   label: '⭐ Premium Picks',    productIds: ['3', '7', '11'] },
  { id: 'eco',       label: '🌿 Sustainable',      productIds: ['1', '6', '8'] },
];

const PRESET_TAGS = ['Popular', 'Eco-Friendly', 'Premium', 'Apparel', 'Tech', 'Employee Gift', 'Client Gift'];

const BUDGET_OPTIONS = ['$25', '$50', '$75', '$100', '$150', '$200+'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── 3-dot Item Menu ───────────────────────────────────────────────────────────

function ItemDotMenu({
  isSwag, onRemove, onDesign, onRefine,
}: {
  isSwag: boolean;
  onRemove: () => void;
  onDesign: () => void;
  onRefine: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#e0ebf7] flex items-center justify-center text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] shadow-sm transition-all"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 bg-white rounded-[12px] border border-[#e0ebf7] shadow-[0px_8px_24px_rgba(1,39,84,0.12)] z-[200] overflow-hidden min-w-[170px]"
          onClick={e => e.stopPropagation()}
        >
          {isSwag && (
            <>
              <button
                onClick={() => { setOpen(false); onDesign(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-[#012754] hover:bg-[#f5f8fc] transition-colors"
              >
                <span className="text-base">✏️</span> Design This
              </button>
              <button
                onClick={() => { setOpen(false); onRefine(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-[#7c3aed] hover:bg-[#faf5ff] transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Refine with AI
              </button>
              <div className="mx-3 my-1 h-px bg-[#e0ebf7]" />
            </>
          )}
          <button
            onClick={() => { setOpen(false); onRemove(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-[#e63946] hover:bg-red-50 transition-colors"
          >
            <span className="text-base">🗑</span> Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── BYOC Item Card ─────────────────────────────────────────────────────────────

function BYOCItemCard({
  item, logoUrl, onRemove, onDesign, onRefine,
}: {
  item: CollectionItem;
  logoUrl: string;
  onRemove: () => void;
  onDesign: () => void;
  onRefine: () => void;
}) {
  const product = item.productId ? PRODUCTS.find(p => p.id === item.productId) : undefined;
  const gift    = item.giftId    ? MARKETPLACE_GIFTS.find(g => g.id === item.giftId)  : undefined;

  const name     = product?.name  ?? gift?.name ?? 'Item';
  const brand    = product?.brand ?? gift?.brand ?? '';
  const category = product?.tags.find(t => ['POPULAR', 'SUSTAINABLE', 'PREMIUM'].includes(t)) ?? product?.category ?? gift?.category ?? '';
  const isPhoto  = (product?.image ?? '').startsWith('/') || !!gift;

  const TAG_COLORS: Record<string, { bg: string; text: string }> = {
    POPULAR:   { bg: '#fff7ed', text: '#c2410c' },
    SWAG:      { bg: '#eaf1fa', text: '#2864a8' },
    SUSTAINABLE: { bg: '#f0fdf4', text: '#16a34a' },
    PREMIUM:   { bg: '#f5f3ff', text: '#6d28d9' },
  };
  const tagStyle = TAG_COLORS[category] ?? { bg: '#f5f8fc', text: '#59728f' };

  return (
    <div className="flex flex-col gap-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Card image area */}
      <div
        className="relative rounded-[16px] border border-[#e0ebf7] overflow-hidden flex items-center justify-center bg-[#f5f8fc]"
        style={{ height: 220 }}
      >
        {/* Product image */}
        {product && (
          isPhoto
            ? <img src={product.image} alt={name} className="w-full h-full object-cover" />
            : <span className="text-6xl">{product.image}</span>
        )}
        {gift && (
          <img src={gift.image} alt={name} className="w-full h-full object-cover" />
        )}

        {/* Category badge — top left */}
        {category && (
          <div
            className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: tagStyle.bg, color: tagStyle.text }}
          >
            {category}
          </div>
        )}

        {/* Logo badge on swag items */}
        {item.isSwag && logoUrl && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#e0ebf7] rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <img src={logoUrl} alt="" className="w-3.5 h-3.5 object-contain" />
            <span className="text-[9px] text-[#8093a9]">branded</span>
          </div>
        )}

        {/* 3-dot menu — top right */}
        <div className="absolute top-3 right-3">
          <ItemDotMenu
            isSwag={item.isSwag}
            onRemove={onRemove}
            onDesign={onDesign}
            onRefine={onRefine}
          />
        </div>
      </div>

      {/* Name below */}
      <div className="px-0.5">
        <p className="text-[11px] font-bold text-[#3077c9] uppercase tracking-widest truncate">{brand}</p>
        <p className="text-[13px] font-medium text-[#345276] leading-snug line-clamp-2">{name}</p>
      </div>
    </div>
  );
}

// ── Add Specific Gifts Modal ───────────────────────────────────────────────────

function AddGiftsModal({
  currentProductIds, currentGiftIds, onAdd, onClose,
}: {
  currentProductIds: string[];
  currentGiftIds: string[];
  onAdd: (productIds: string[], giftIds: string[]) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'swag' | 'gifts'>('swag');
  const [search, setSearch] = useState('');
  const [selProducts, setSelProducts] = useState<Set<string>>(new Set(currentProductIds));
  const [selGifts, setSelGifts]       = useState<Set<string>>(new Set(currentGiftIds));

  const filteredProducts = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGifts = MARKETPLACE_GIFTS.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.brand.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProd = (id: string) => setSelProducts(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleGift = (id: string) => setSelGifts(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleApply = () => {
    onAdd([...selProducts], [...selGifts]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(1,39,84,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-[24px] w-full max-w-[720px] max-h-[90vh] flex flex-col shadow-[0px_32px_64px_rgba(1,39,84,0.22)] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e0ebf7]">
          <div>
            <h2 className="text-[20px] font-bold text-[#012754]" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Add Specific Products
            </h2>
            <p className="text-[13px] text-[#8093a9] mt-0.5">
              Select swag or marketplace gifts to include in your collection
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f8fc] border border-[#e0ebf7] flex items-center justify-center text-[#59728f] hover:text-[#012754] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-3 border-b border-[#e0ebf7]">
          <div className="flex gap-1 bg-[#f5f8fc] rounded-[10px] p-1">
            {[{ id: 'swag' as const, label: '🛍 Swag Items' }, { id: 'gifts' as const, label: '🎁 Marketplace' }].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all ${tab === t.id ? 'bg-white text-[#012754] shadow-sm' : 'text-[#8093a9]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8093a9]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full h-9 pl-10 pr-3 text-[13px] border border-[#e0ebf7] rounded-[10px] focus:outline-none focus:border-[#3077c9] text-[#012754] placeholder:text-[#b7cfec]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === 'swag' ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredProducts.map(p => {
                const sel = selProducts.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProd(p.id)}
                    className={`text-left rounded-[14px] border-2 overflow-hidden transition-all ${sel ? 'border-[#3077c9] shadow-[0px_4px_16px_rgba(48,119,201,0.18)]' : 'border-[#e0ebf7] hover:border-[#b7cfec]'}`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <div className="relative h-[100px] bg-[#f5f8fc] flex items-center justify-center overflow-hidden">
                      {p.image.startsWith('/') ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{p.image}</span>
                      )}
                      {sel && (
                        <div className="absolute inset-0 bg-[#3077c9]/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#3077c9] flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-[9px] font-bold text-[#8093a9] uppercase tracking-widest">{p.brand}</p>
                      <p className="text-[11px] font-medium text-[#012754] line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-[11px] font-bold text-[#3077c9] mt-1">${p.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredGifts.map(g => {
                const sel = selGifts.has(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGift(g.id)}
                    className={`text-left rounded-[14px] border-2 overflow-hidden transition-all ${sel ? 'border-[#3077c9] shadow-[0px_4px_16px_rgba(48,119,201,0.18)]' : 'border-[#e0ebf7] hover:border-[#b7cfec]'}`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <div className="relative h-[100px] bg-[#f5f8fc] flex items-center justify-center overflow-hidden">
                      <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                      {sel && (
                        <div className="absolute inset-0 bg-[#3077c9]/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#3077c9] flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-[9px] font-bold text-[#8093a9] uppercase tracking-widest">{g.brand}</p>
                      <p className="text-[11px] font-medium text-[#012754] line-clamp-2 leading-snug">{g.name}</p>
                      <p className="text-[11px] font-bold text-[#3077c9] mt-1">${g.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e0ebf7] flex items-center justify-between">
          <p className="text-[13px] text-[#8093a9]">
            {selProducts.size + selGifts.size} selected
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-10 px-5 rounded-[12px] border border-[#e0ebf7] text-[#59728f] text-[13px] font-semibold hover:bg-[#f5f8fc] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="h-10 px-6 rounded-[12px] text-white text-[13px] font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Themes Modal ───────────────────────────────────────────────────────────

function AddThemesModal({ onAdd, onClose }: { onAdd: (productIds: string[]) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleApply = () => {
    const productIds = new Set<string>();
    [...selected].forEach(themeId => {
      PRESET_THEMES.find(t => t.id === themeId)?.productIds.forEach(id => productIds.add(id));
    });
    onAdd([...productIds]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: 'rgba(1,39,84,0.35)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-[24px] w-full max-w-[520px] shadow-[0px_32px_64px_rgba(1,39,84,0.22)] mx-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e0ebf7]">
          <div>
            <h2 className="text-[20px] font-bold text-[#012754]" style={{ fontFamily: "'Clash Display', sans-serif" }}>Add Themes</h2>
            <p className="text-[13px] text-[#8093a9] mt-0.5">Select themes to bulk-add matching products</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f8fc] border border-[#e0ebf7] flex items-center justify-center text-[#59728f]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-2">
          {PRESET_THEMES.map(theme => {
            const sel = selected.has(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => toggle(theme.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] border-2 text-left transition-all ${sel ? 'border-[#3077c9] bg-[#eaf1fa]' : 'border-[#e0ebf7] hover:border-[#b7cfec] bg-white'}`}
              >
                <div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors ${sel ? 'bg-[#3077c9] border-[#3077c9]' : 'bg-white border-[#b7cfec]'}`}>
                  {sel && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                </div>
                <div className="flex-1">
                  <p className={`text-[14px] font-semibold ${sel ? 'text-[#3077c9]' : 'text-[#012754]'}`}>{theme.label}</p>
                  <p className="text-[11px] text-[#8093a9]">{theme.productIds.length} products</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button onClick={onClose} className="h-10 px-5 rounded-[12px] border border-[#e0ebf7] text-[#59728f] text-[13px] font-semibold hover:bg-[#f5f8fc]">Cancel</button>
          <button
            onClick={handleApply}
            disabled={selected.size === 0}
            className="h-10 px-6 rounded-[12px] text-white text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: selected.size > 0 ? 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' : '#c8d9ed' }}
          >
            Add Themes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gifting Assistant Modal (mock) ────────────────────────────────────────────

function GiftingAssistantModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const PROMPTS = [
    'Corporate onboarding for tech employees',
    'Customer appreciation under $75',
    'Holiday gift for remote team',
    'Employee recognition — wellness focus',
  ];

  const handleGenerate = (text: string) => {
    setLoading(true);
    setPrompt(text);
    setTimeout(() => {
      // Mock: return random selection of SWAG products
      const swag = PRODUCTS.filter(p => p.tags.includes('SWAG'));
      const shuffled = [...swag].sort(() => Math.random() - 0.5).slice(0, 4);
      setSuggestions(shuffled);
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: 'rgba(1,39,84,0.35)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-[24px] w-full max-w-[560px] shadow-[0px_32px_64px_rgba(1,39,84,0.22)] mx-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #a855f7 100%)', borderRadius: '24px 24px 0 0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>Gifting Assistant</h2>
              <p className="text-[12px] text-white/70">AI-powered gift suggestions</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Prompt chips */}
          <p className="text-[11px] font-bold text-[#8093a9] uppercase tracking-widest mb-3">Quick prompts</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleGenerate(p)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-[#e0ebf7] text-[#345276] hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#faf5ff] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && prompt.trim() && handleGenerate(prompt)}
              placeholder="Describe your recipients and occasion…"
              className="flex-1 h-10 px-3 text-[13px] border border-[#e0ebf7] rounded-[10px] focus:outline-none focus:border-[#7c3aed] text-[#012754] placeholder:text-[#b7cfec]"
            />
            <button
              onClick={() => prompt.trim() && handleGenerate(prompt)}
              disabled={!prompt.trim() || loading}
              className="h-10 px-4 rounded-[10px] text-white text-[13px] font-bold shrink-0 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)', opacity: !prompt.trim() || loading ? 0.5 : 1 }}
            >
              {loading ? '…' : 'Generate'}
            </button>
          </div>

          {/* Suggestions */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-[#7c3aed]">
              <div className="w-4 h-4 border-2 border-[#7c3aed]/30 border-t-[#7c3aed] rounded-full animate-spin" />
              <span className="text-[13px] font-medium">Finding perfect gifts…</span>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-[#8093a9] uppercase tracking-widest mb-3">Suggested gifts</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map(p => (
                  <div key={p.id} className="flex items-center gap-2.5 bg-[#faf5ff] border border-[#e9d5ff] rounded-[12px] p-2.5">
                    <div className="w-10 h-10 bg-white rounded-[8px] overflow-hidden flex items-center justify-center shrink-0">
                      {p.image.startsWith('/') ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{p.image}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#6d28d9] truncate">{p.brand}</p>
                      <p className="text-[11px] text-[#012754] line-clamp-2 leading-snug">{p.name.split(' ').slice(0, 4).join(' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button onClick={onClose} className="h-10 px-5 rounded-[12px] border border-[#e0ebf7] text-[#59728f] text-[13px] font-semibold hover:bg-[#f5f8fc]">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main CollectionBuilder ─────────────────────────────────────────────────────

export function CollectionBuilder() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const initState  = (location.state ?? {}) as LocationState;

  // Pre-populate items from logo flow
  const initItems = (): CollectionItem[] => {
    if (initState.mode !== 'swag') return [];
    return PRODUCTS
      .filter(p => p.tags.includes('SWAG'))
      .slice(0, 8)
      .map(p => ({ uid: uid(), productId: p.id, isSwag: true }));
  };

  const initName = () => {
    if (initState.mode === 'swag' && initState.domain) {
      const domain = initState.domain.replace('your file', '');
      const company = domain ? domain.split('.')[0] : 'Brand';
      const cap = company.charAt(0).toUpperCase() + company.slice(1);
      return `${cap} Swag Collection`;
    }
    return 'My Awesome Collection';
  };

  // State
  const [name, setName]         = useState(initName);
  const [editingName, setEditingName] = useState(false);
  const [items, setItems]       = useState<CollectionItem[]>(initItems);
  const [tags, setTags]         = useState<string[]>(initState.mode === 'swag' ? ['Swag', 'Branded'] : []);
  const [logoUrl]               = useState(initState.logoUrl ?? '');
  const [budgetIdx, setBudgetIdx] = useState(1); // $50 default
  const [countryIdx, setCountryIdx] = useState(0); // USA default
  const [showBudget, setShowBudget] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [saved, setSaved]       = useState(false);

  // Modals
  const [showAddGifts, setShowAddGifts]       = useState(false);
  const [showAddThemes, setShowAddThemes]     = useState(false);
  const [showGiftingAI, setShowGiftingAI]     = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const addItems = (productIds: string[], giftIds: string[]) => {
    const existingProductIds = new Set(items.map(i => i.productId).filter(Boolean));
    const existingGiftIds    = new Set(items.map(i => i.giftId).filter(Boolean));
    const newItems: CollectionItem[] = [
      ...productIds.filter(id => !existingProductIds.has(id)).map(id => ({
        uid: uid(),
        productId: id,
        isSwag: !!PRODUCTS.find(p => p.id === id)?.tags.includes('SWAG'),
      })),
      ...giftIds.filter(id => !existingGiftIds.has(id)).map(id => ({
        uid: uid(),
        giftId: id,
        isSwag: false,
      })),
    ];
    setItems(prev => [...prev, ...newItems]);
  };

  const addThemeItems = (productIds: string[]) => {
    addItems(productIds, []);
  };

  const removeItem = (uid: string) => {
    setItems(prev => prev.filter(i => i.uid !== uid));
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));
  const addTag = (tag: string) => { if (!tags.includes(tag)) setTags(prev => [...prev, tag]); };

  const MAX_ITEMS = 80;
  const hasItems  = items.length > 0;

  if (saved) {
    return (
      <div className="min-h-screen bg-[#fbfcfe] flex flex-col items-center justify-center text-center py-24 px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5992d4] to-[#3077c9] flex items-center justify-center shadow-[0px_16px_48px_rgba(48,119,201,0.35)] mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-[32px] font-bold text-[#012754] mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          Collection saved!
        </h2>
        <p className="text-[15px] text-[#59728f] mb-8 max-w-[400px]">
          <strong className="text-[#012754]">"{name}"</strong> is ready to send to your recipients.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="h-12 px-8 rounded-[14px] text-white text-[14px] font-bold hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            onClick={() => alert('Send flow would launch here')}
          >
            Send Now →
          </button>
          <button
            className="h-12 px-8 rounded-[14px] border-2 border-[#3077c9] text-[#3077c9] text-[14px] font-bold hover:bg-[#f0f6ff] transition-colors"
            onClick={() => navigate('/')}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: '#fbfcfe',
        backgroundImage: 'radial-gradient(circle, rgba(1,39,84,0.055) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e0ebf7]" style={{ boxShadow: '0px 1px 0px #e0ebf7' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-[60px] lg:px-[120px] h-[64px] flex items-center justify-between gap-4">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-full border border-[#e0ebf7] bg-white flex items-center justify-center text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] font-bold text-[#59728f] uppercase tracking-[0.15em]">
              Build Your Own Collection
            </span>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-[10px] border border-[#d6e4f4] bg-white flex items-center justify-center text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] transition-all">
              <span className="text-[14px] font-bold">?</span>
            </button>
            <button
              onClick={() => setSaved(true)}
              className="h-10 px-5 rounded-[10px] border border-[#d6e4f4] bg-white text-[#012754] text-[13px] font-semibold hover:bg-[#f5f8fc] transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setSaved(true); }}
              disabled={!hasItems}
              className="h-10 px-5 rounded-[10px] text-white text-[13px] font-bold transition-opacity hover:opacity-90"
              style={{
                background: hasItems
                  ? 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)'
                  : '#d6e4f4',
                color: hasItems ? 'white' : '#8093a9',
              }}
            >
              Save &amp; Exit
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-[60px] lg:px-[120px] py-8">

        {/* ── Collection Tags (shown when populated) ── */}
        {hasItems && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-[#8093a9]" />
              <span className="text-[11px] font-bold text-[#8093a9] uppercase tracking-widest">Collection Tags</span>
              <span className="text-[11px] text-[#a6b3c3] ml-1">ⓘ</span>
            </div>
            <div className="bg-white rounded-[16px] border border-[#e0ebf7] px-4 py-3 flex items-center gap-3 flex-wrap shadow-[0px_2px_8px_rgba(1,39,84,0.05)]">
              {tags.length > 0 ? (
                <>
                  {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1.5 bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-3 py-1.5">
                      <span className="text-[13px] font-medium text-[#3077c9]">{tag}</span>
                      <button onClick={() => removeTag(tag)} className="text-[#a6b3c3] hover:text-[#e63946] transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <span className="text-[13px] text-[#a6b3c3]">Add tags to customize your gift collection</span>
              )}

              {/* Tag picker */}
              <div className="relative ml-auto">
                <button
                  onClick={() => {
                    const available = PRESET_TAGS.filter(t => !tags.includes(t));
                    if (available[0]) addTag(available[0]);
                  }}
                  className="text-[13px] font-semibold text-[#3077c9] hover:underline whitespace-nowrap"
                >
                  + Add Tags
                </button>
              </div>

              <button
                onClick={() => setShowGiftingAI(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[10px] text-white text-[12px] font-bold shrink-0 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gifting Assistant
              </button>
            </div>
          </div>
        )}

        {/* ── Collection Name + Stats ── */}
        <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
          {/* Name */}
          <div className="flex-1 min-w-[240px]">
            <p className="text-[11px] font-bold text-[#8093a9] uppercase tracking-widest mb-2">Collection Name</p>
            {editingName ? (
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                className="text-[28px] font-black text-[#012754] bg-transparent border-b-2 border-[#3077c9] outline-none w-full pb-1"
                style={{ fontFamily: "'Clash Display', 'Inter', sans-serif" }}
              />
            ) : (
              <h1
                className="text-[28px] font-black text-[#012754] cursor-text hover:text-[#3077c9] transition-colors"
                style={{ fontFamily: "'Clash Display', 'Inter', sans-serif" }}
                onClick={() => setEditingName(true)}
                title="Click to edit"
              >
                {name || 'My Awesome Collection'}
              </h1>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-end gap-5 shrink-0">
            {/* Gift count */}
            <div>
              <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest mb-1.5 whitespace-nowrap">Gift Options Count ⓘ</p>
              <div className="bg-white border border-[#e0ebf7] rounded-[10px] px-4 py-2.5 shadow-[0px_2px_8px_rgba(1,39,84,0.05)]">
                <span className="text-[20px] font-black text-[#345276]">{items.length}</span>
                <span className="text-[20px] font-black text-[#a6b3c3]">/{MAX_ITEMS}</span>
              </div>
            </div>

            {/* Country */}
            <div className="relative">
              <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest mb-1.5">Preview Country ⓘ</p>
              <button
                onClick={() => { setShowCountry(v => !v); setShowBudget(false); }}
                className="flex items-center gap-2 bg-white border border-[#e0ebf7] rounded-[10px] px-4 py-2.5 shadow-[0px_2px_8px_rgba(1,39,84,0.05)] hover:border-[#3077c9] transition-colors"
              >
                <span>{COUNTRIES[countryIdx].flag}</span>
                <span className="text-[14px] font-semibold text-[#012754]">{COUNTRIES[countryIdx].name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8093a9]" />
              </button>
              {showCountry && (
                <div className="absolute top-full mt-1.5 right-0 bg-white rounded-[12px] border border-[#e0ebf7] shadow-[0px_8px_24px_rgba(1,39,84,0.12)] z-50 min-w-[140px] py-1.5">
                  {COUNTRIES.map((c, i) => (
                    <button key={c.code} onClick={() => { setCountryIdx(i); setShowCountry(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#345276] hover:bg-[#f5f8fc] transition-colors">
                      <span>{c.flag}</span>{c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="relative">
              <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest mb-1.5">Preview Budget ⓘ</p>
              <button
                onClick={() => { setShowBudget(v => !v); setShowCountry(false); }}
                className="flex items-center gap-2 bg-white border border-[#e0ebf7] rounded-[10px] px-4 py-2.5 shadow-[0px_2px_8px_rgba(1,39,84,0.05)] hover:border-[#3077c9] transition-colors"
              >
                <span className="text-[14px] font-semibold text-[#012754]">{BUDGET_OPTIONS[budgetIdx]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8093a9]" />
              </button>
              {showBudget && (
                <div className="absolute top-full mt-1.5 right-0 bg-white rounded-[12px] border border-[#e0ebf7] shadow-[0px_8px_24px_rgba(1,39,84,0.12)] z-50 min-w-[110px] py-1.5">
                  {BUDGET_OPTIONS.map((opt, i) => (
                    <button key={opt} onClick={() => { setBudgetIdx(i); setShowBudget(false); }} className={`w-full px-4 py-2 text-[13px] font-medium text-left hover:bg-[#f5f8fc] transition-colors ${i === budgetIdx ? 'text-[#3077c9] font-semibold' : 'text-[#345276]'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#e0ebf7] mb-8" />

        {/* ── Empty state ── */}
        {!hasItems && (
          <div className="bg-white rounded-[24px] border border-[#e0ebf7] shadow-[0px_4px_24px_rgba(1,39,84,0.06)] relative overflow-hidden" style={{ minHeight: 360 }}>
            {/* Decorative illustrations */}
            <div className="absolute left-8 bottom-0 text-[110px] opacity-25 select-none" style={{ filter: 'grayscale(30%)' }}>🎨</div>
            <div className="absolute right-8 top-4 text-[90px] opacity-25 select-none" style={{ filter: 'grayscale(30%)' }}>✏️</div>

            <div className="relative flex flex-col items-center justify-center py-16 px-8 text-center">
              <h3
                className="text-[22px] font-bold text-[#012754] mb-2"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Start building your Custom Gift Collection!
              </h3>
              <p className="text-[14px] text-[#8093a9] mb-8 max-w-[460px] leading-relaxed">
                Add themes, select specific gifts and swag, or use our Gifting Assistant to share prompts about recipients and receive suggested gifts in seconds.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowGiftingAI(true)}
                  className="flex items-center gap-2 h-11 px-6 rounded-[12px] text-white text-[14px] font-bold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  Gifting Assistant
                </button>
                <button
                  onClick={() => setShowAddGifts(true)}
                  className="flex items-center gap-2 h-11 px-6 rounded-[12px] border-2 border-[#e0ebf7] text-[#012754] text-[14px] font-semibold hover:border-[#3077c9] hover:bg-[#f0f6ff] hover:text-[#3077c9] transition-all"
                >
                  <Gift className="w-4 h-4" />
                  Add Specific Gifts
                </button>
                <button
                  onClick={() => setShowAddThemes(true)}
                  className="flex items-center gap-2 h-11 px-6 rounded-[12px] border-2 border-[#e0ebf7] text-[#012754] text-[14px] font-semibold hover:border-[#3077c9] hover:bg-[#f0f6ff] hover:text-[#3077c9] transition-all"
                >
                  <Globe className="w-4 h-4" />
                  Add Themes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Populated grid ── */}
        {hasItems && (
          <>
            {/* Action bar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button
                onClick={() => setShowGiftingAI(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[10px] text-white text-[12px] font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)' }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Gifting Assistant
              </button>
              <button
                onClick={() => setShowAddGifts(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[10px] border border-[#e0ebf7] text-[#012754] text-[12px] font-semibold hover:border-[#3077c9] hover:bg-[#f0f6ff] hover:text-[#3077c9] transition-all"
              >
                <Gift className="w-3.5 h-3.5" /> Add Specific Gifts
              </button>
              <button
                onClick={() => setShowAddThemes(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[10px] border border-[#e0ebf7] text-[#012754] text-[12px] font-semibold hover:border-[#3077c9] hover:bg-[#f0f6ff] hover:text-[#3077c9] transition-all"
              >
                <Globe className="w-3.5 h-3.5" /> Add Themes
              </button>
              <span className="text-[12px] text-[#a6b3c3] ml-auto">
                {items.length}/{MAX_ITEMS} gift options
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {/* Add A Specific Product card */}
              <div
                className="flex flex-col gap-2 cursor-pointer group"
                onClick={() => setShowAddGifts(true)}
              >
                <div
                  className="rounded-[16px] border-2 border-dashed border-[#b7cfec] flex items-center justify-center group-hover:border-[#3077c9] group-hover:bg-[#f0f6ff] transition-all"
                  style={{ height: 220 }}
                >
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-[#eaf1fa] group-hover:bg-[#d4e8ff] flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5 text-[#3077c9]" />
                    </div>
                    <p className="text-[13px] font-semibold text-[#3077c9] leading-snug">Add A Specific Product</p>
                  </div>
                </div>
                <div className="px-0.5 h-9" />
              </div>

              {/* Item cards */}
              {items.map(item => (
                <BYOCItemCard
                  key={item.uid}
                  item={item}
                  logoUrl={logoUrl}
                  onRemove={() => removeItem(item.uid)}
                  onDesign={() => item.productId && navigate(`/design/${item.productId}`)}
                  onRefine={() => alert(`Refine AI for item ${item.productId}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddGifts && (
        <AddGiftsModal
          currentProductIds={items.filter(i => i.productId).map(i => i.productId!)}
          currentGiftIds={items.filter(i => i.giftId).map(i => i.giftId!)}
          onAdd={addItems}
          onClose={() => setShowAddGifts(false)}
        />
      )}
      {showAddThemes && (
        <AddThemesModal onAdd={addThemeItems} onClose={() => setShowAddThemes(false)} />
      )}
      {showGiftingAI && (
        <GiftingAssistantModal onClose={() => setShowGiftingAI(false)} />
      )}
    </div>
  );
}
