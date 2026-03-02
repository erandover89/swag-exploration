import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Pencil, Copy } from 'lucide-react';
import { MY_DESIGNS, PRODUCTS, type SwagDesign } from '../data/mockData';

type SortType = 'recent' | 'most-sent' | 'name';

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'recent',    label: 'Most Recent' },
  { value: 'most-sent', label: 'Most Sent'   },
  { value: 'name',      label: 'Name A–Z'    },
];

const PLACEMENT_LABELS: Record<string, string> = {
  'left-chest': 'Left Chest',
  'center':     'Center',
  'back':       'Back',
  'sleeve':     'Sleeve',
};

const STYLE_LABELS: Record<string, string> = {
  'embroidery':   'Embroidery',
  'screen-print': 'Screen Print',
  'emboss':       'Emboss',
};

// ── ProductImage helper ────────────────────────────────────────────────────
function ProductImage({ src, className }: { src: string; className?: string }) {
  if (src.startsWith('/')) {
    return <img src={src} alt="product" className={className ?? 'w-16 h-16 object-contain'} />;
  }
  return <span className={className ?? 'text-5xl'}>{src}</span>;
}

// ── Design card ─────────────────────────────────────────────────────────────
function DesignCard({ design }: { design: SwagDesign }) {
  const navigate = useNavigate();
  const product  = PRODUCTS.find(p => p.id === design.productId);

  return (
    <div className="bg-white border border-[#e0ebf7] rounded-[20px] overflow-hidden hover:shadow-[0px_8px_24px_0px_rgba(1,39,84,0.10)] transition-shadow flex flex-col">
      {/* Product preview area */}
      <div
        className="relative flex items-center justify-center py-10 px-6 min-h-[160px]"
        style={{ backgroundColor: `${design.colorHex}18` }}
      >
        <ProductImage src={product?.image ?? '📦'} className="text-[80px] w-20 h-20 object-contain select-none" />

        {/* Color + date badges */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-white border border-[#e0ebf7] rounded-lg px-2 py-1">
          <div className="w-3 h-3 rounded-full border border-white shadow-sm shrink-0" style={{ backgroundColor: design.colorHex }} />
          <span className="text-[10px] font-medium text-[#59728f]">{design.colorName}</span>
        </div>
        {design.sendCount > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-[#3077c9] text-white rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Sent {design.sendCount}×
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <p className="text-[11px] font-bold text-[#a6b3c3] uppercase tracking-wide mb-0.5">{product?.brand}</p>
          <p className="text-[15px] font-bold text-[#012754] truncate" title={design.name}>{design.name}</p>
        </div>

        {/* Attribute tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-medium text-[#59728f] bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2.5 py-0.5">
            {PLACEMENT_LABELS[design.placement] ?? design.placement}
          </span>
          <span className="text-[10px] font-medium text-[#59728f] bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2.5 py-0.5">
            {STYLE_LABELS[design.printStyle] ?? design.printStyle}
          </span>
        </div>

        {/* Created date + send count */}
        <div className="flex items-center justify-between text-[11px] text-[#a6b3c3]">
          <span>{design.createdAt}</span>
          {design.sendCount === 0 && <span className="italic">Never sent</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] text-white text-[12px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            onClick={() => alert(`Sending "${design.name}"…`)}
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#e0ebf7] text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] transition-colors"
            onClick={() => navigate(`/design/${design.productId}`)}
            title="Edit design"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#e0ebf7] text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] transition-colors"
            onClick={() => alert(`Duplicating "${design.name}"…`)}
            title="Duplicate design"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export function MyDesigns() {
  const navigate  = useNavigate();
  const [sortBy, setSortBy] = useState<SortType>('recent');

  const sorted = [...MY_DESIGNS].sort((a, b) => {
    if (sortBy === 'most-sent') return b.sendCount - a.sendCount;
    if (sortBy === 'name')      return a.name.localeCompare(b.name);
    return 0; // keep insertion order for 'recent'
  });

  const totalSends = MY_DESIGNS.reduce((sum, d) => sum + d.sendCount, 0);
  const topDesign  = [...MY_DESIGNS].sort((a, b) => b.sendCount - a.sendCount)[0];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="relative bg-white border-b border-[#e0ebf7] overflow-hidden">
        <div
          className="absolute right-0 top-0 w-[50%] h-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(201,255,253,0.35) 60%, rgba(185,210,255,0.25) 100%)' }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-[120px] pt-6 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-5">
            <button
              className="w-8 h-8 rounded-full border border-[#e0ebf7] flex items-center justify-center hover:bg-[#f5f8fc] transition-colors shrink-0"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#59728f]" />
            </button>
            <span className="text-[12px] font-bold text-[#a6b3c3] uppercase tracking-wide">Swag</span>
            <span className="text-[12px] text-[#a6b3c3]">/</span>
            <span className="text-[12px] font-bold text-[#59728f] uppercase tracking-wide">My Designs</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1
                className="text-4xl md:text-[56px] text-[#012754] leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}
              >
                My Designs
              </h1>
              <p className="text-[14px] text-[#59728f] mt-1">
                {MY_DESIGNS.length} saved designs · {totalSends} total sends
              </p>
            </div>

            <button
              className="self-start md:self-auto flex items-center gap-2 h-11 px-5 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90 shrink-0"
              style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
              onClick={() => navigate('/')}
            >
              + Create New Design
            </button>
          </div>

          {/* Stats row */}
          {MY_DESIGNS.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-[14px] px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-[#a6b3c3] uppercase tracking-wide">Total Designs</span>
                <span className="text-[22px] font-bold text-[#012754]">{MY_DESIGNS.length}</span>
              </div>
              <div className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-[14px] px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-[#a6b3c3] uppercase tracking-wide">Total Sends</span>
                <span className="text-[22px] font-bold text-[#012754]">{totalSends}</span>
              </div>
              {topDesign && topDesign.sendCount > 0 && (
                <div className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-[14px] px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-[#a6b3c3] uppercase tracking-wide">Most Popular</span>
                  <span className="text-[14px] font-bold text-[#012754] truncate max-w-[200px]">{topDesign.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sort bar ────────────────────────────────────────────────── */}
      <div className="border-b border-[#e0ebf7] bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-3 flex items-center gap-3">
          <span className="text-[12px] font-bold text-[#a6b3c3] uppercase tracking-wide">Sort by</span>
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-4 h-8 rounded-full text-[12px] font-medium border transition-all ${
                  sortBy === opt.value
                    ? 'bg-[#3077c9] border-[#3077c9] text-white'
                    : 'border-[#e0ebf7] text-[#345276] hover:border-[#3077c9] hover:text-[#3077c9]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Designs grid ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-8">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🎨</span>
            <h3 className="text-[16px] font-semibold text-[#345276] mb-2">No designs yet</h3>
            <p className="text-[14px] text-[#8093a9] mb-5">Start by browsing the swag catalog and clicking "Design This" on any product</p>
            <button
              className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold"
              style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
              onClick={() => navigate('/')}
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map(design => (
              <DesignCard key={design.id} design={design} />
            ))}

            {/* Ghost "create new" card */}
            <div
              className="border-2 border-dashed border-[#b7cfec] rounded-[20px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#f5f8fc] transition-colors p-8 min-h-[280px]"
              onClick={() => navigate('/')}
            >
              <span className="text-4xl text-[#a6b3c3]">+</span>
              <p className="text-[13px] font-semibold text-[#8093a9] text-center">Design Something New</p>
              <p className="text-[11px] text-[#a6b3c3] text-center">Browse catalog to pick a product</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
