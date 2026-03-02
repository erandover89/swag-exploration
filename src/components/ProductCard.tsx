import { Sparkles, Package } from 'lucide-react';
import { type Product, MOCK_COMPANY } from '../data/mockData';
import { AddToCollectionMenu } from './AddToCollectionMenu';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onDesign?: () => void;
  onRefineWithAI?: () => void;
}

function ProductMedia({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith('/')) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" />;
  }
  return <span className="text-[100px] select-none" style={{ lineHeight: 1 }}>{src}</span>;
}

export function ProductCard({ product, onClick, onDesign: _onDesign, onRefineWithAI }: ProductCardProps) {
  const isPhoto = product.image.startsWith('/');
  const isBulk  = product.type === 'bulk';

  return (
    <div
      className="flex flex-col gap-4 pb-4 cursor-pointer group"
      onClick={onClick}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image area */}
      <div className={`relative bg-[#f5f8fc] rounded-[16px] overflow-hidden flex items-center justify-center ${isPhoto ? 'h-[260px]' : 'py-[72px] px-8'}`}>
        {isPhoto ? (
          <>
            <ProductMedia src={product.image} alt={product.name} />
            {/* Logo badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#e0ebf7] rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
              <span className="text-[9px] font-black tracking-widest leading-none" style={{ color: MOCK_COMPANY.logoColor }}>
                {MOCK_COMPANY.logo}
              </span>
              <span className="text-[9px] text-[#8093a9]">branded</span>
            </div>
          </>
        ) : (
          <div className="relative flex flex-col items-center">
            <ProductMedia src={product.image} alt={product.name} />
            {!isBulk && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-3 text-xs font-black tracking-widest opacity-80"
                style={{ color: MOCK_COMPANY.logoColor }}
              >
                {MOCK_COMPANY.logo}
              </div>
            )}
          </div>
        )}

        {/* Tags – top left (POPULAR, SUSTAINABLE, PREMIUM) */}
        {product.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.tags.map(tag => (
              <span key={tag} className="bg-white text-[#2864a8] text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Type badge – top right */}
        {isBulk ? (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#e8f0fc] border border-[#c7d7f4] rounded-lg px-2 py-1">
            <Package className="w-2.5 h-2.5 text-[#3077c9]" />
            <span className="text-[9px] font-black text-[#012754] uppercase tracking-wide">
              Min. {product.minQuantity ?? '?'} pcs
            </span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-2 py-1">
            <span className="text-[9px] font-black text-[#16a34a] uppercase tracking-wide">No minimum</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-bold text-[#3077c9] uppercase tracking-widest leading-none truncate">
            {product.brand}
          </p>
          <p className="text-[14px] font-medium text-[#345276] leading-snug line-clamp-2">
            {product.name}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-[15px] font-bold text-[#012754] leading-tight">
            ${product.price.toFixed(2)}
          </p>
          {isBulk && (
            <span className="text-[11px] text-[#8093a9]">/ unit</span>
          )}
        </div>

        {product.hasMoreOptions && (
          <p className="text-[10px] font-bold text-[#3077c9] uppercase tracking-wide">
            + More Options
          </p>
        )}

        {/* ── Hover action tray ────────────────────────────────── */}
        <div className="flex flex-col gap-1.5 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          {/* Primary button */}
          <button
            className="h-9 w-full rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)',
            }}
            onClick={e => { e.stopPropagation(); onClick?.(); }}
          >
            {isBulk ? 'Create Order' : 'Design This'}
          </button>

          {/* Secondary row — only for on-demand */}
          {!isBulk && (
            <div className="flex gap-1.5">
              <div className="flex-1">
                <AddToCollectionMenu
                  trigger={
                    <button className="w-full h-8 rounded-[10px] border border-[#e0ebf7] text-[#59728f] text-[12px] font-medium hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors">
                      + Add to Collection
                    </button>
                  }
                />
              </div>
              <button
                className="flex-1 h-8 rounded-[10px] border border-[#e0ebf7] text-[#59728f] text-[12px] font-medium hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#faf5ff] transition-colors flex items-center justify-center gap-1"
                onClick={e => { e.stopPropagation(); onRefineWithAI?.(); }}
              >
                <Sparkles className="w-3 h-3" />
                Refine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
