import { useState } from 'react';
import { type Product, PRINT_TECHNIQUE_CHIPS } from '../data/mockData';
import { useCompanyLogo } from '../context/CompanyLogoContext';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

function ProductMedia({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith('/')) {
    return <img src={src} alt={alt} className="max-h-[186px] w-auto max-w-full object-contain" style={{ mixBlendMode: 'multiply' }} />;
  }
  return <span className="text-[100px] select-none" style={{ lineHeight: 1 }}>{src}</span>;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const isPhoto = product.image.startsWith('/');
  const isBulk  = product.type === 'bulk';
  const { logoUrl, isApplying } = useCompanyLogo();
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Only show the print-area overlay for photo, non-bulk products with a defined print area
  const hasPrintArea = isPhoto && !isBulk && !!product.printArea;
  const showLogoOverlay = hasPrintArea && !!logoUrl && !isApplying;

  return (
    <div
      className="flex flex-col gap-4 pb-4 cursor-pointer group"
      onClick={onClick}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image area */}
      <div className="relative bg-[#f5f8fc] rounded-[16px] overflow-hidden flex items-center justify-center py-[72px] px-8">
        {isPhoto ? (
          <>
            <ProductMedia src={product.image} alt={product.name} />

            {/* ── Logo print-area overlay ──────────────────────────────────── */}
            {showLogoOverlay && product.printArea && (
              product.printArea.style === 'badge' ? (
                <div
                  className="absolute pointer-events-none flex items-center justify-center rounded-xl bg-white/85 shadow-sm p-1.5"
                  style={{
                    left: `${product.printArea.x}%`,
                    top: `${product.printArea.y}%`,
                    width: `${product.printArea.width}%`,
                    height: `${product.printArea.height}%`,
                  }}
                >
                  <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              ) : (
                <img
                  src={logoUrl}
                  alt=""
                  className="absolute pointer-events-none object-contain"
                  style={{
                    left: `${product.printArea.x}%`,
                    top: `${product.printArea.y}%`,
                    width: `${product.printArea.width}%`,
                    height: `${product.printArea.height}%`,
                    mixBlendMode: 'multiply',
                    opacity: 0.88,
                  }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )
            )}


{/* ── Branded badge — only when a logo is active ── */}
            {!isBulk && !hasPrintArea && !!logoUrl && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-snp-navy-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                <img src={logoUrl} alt="" className="h-3.5 w-auto object-contain max-w-[40px]" onError={e => (e.currentTarget.style.display = 'none')} />
                <span className="text-[9px] text-snp-navy-500">branded</span>
              </div>
            )}
          </>
        ) : (
          <div className="relative flex flex-col items-center">
            <ProductMedia src={product.image} alt={product.name} />
            {!isBulk && !!logoUrl && (
              <img
                src={logoUrl}
                alt=""
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-3 h-5 w-auto object-contain max-w-[48px] opacity-80"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>
        )}

        {/* Tag – top left: print technique only */}
        <div className="absolute top-2 left-2">
          {(() => {
            const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
            return chip ? (
              <span className="text-[11px] font-bold px-2 py-1.5 rounded-[8px] uppercase" style={{ backgroundColor: '#eef4ff', color: '#2864a8' }}>
                {chip.label}
              </span>
            ) : null;
          })()}
        </div>

        {/* Color tint overlay — shown on swatch hover */}
        {hoveredColor && isPhoto && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[16px] z-10 transition-colors duration-150"
            style={{ backgroundColor: hoveredColor, mixBlendMode: 'color', opacity: 0.45 }}
          />
        )}

        {/* Skeleton overlay — shown briefly after a new logo is applied */}
        {!isBulk && isApplying && (
          <div className="absolute inset-0 z-20 rounded-[16px] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[#eef4ff]" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'product-card-shimmer 1.0s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Type indicator */}
        {isBulk ? (
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest">Bulk Order</span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-[#f5f8fc] border border-[#e0ebf7] rounded-[6px] px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-[#59728f] uppercase tracking-wide">On demand</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex flex-col gap-0.5">
          <p className="text-[12px] font-bold text-[#012754] uppercase tracking-widest leading-none truncate">
            {product.brand}
          </p>
          <p className="text-[14px] font-normal text-[#59728f] leading-snug line-clamp-2">
            {product.name}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-[14px] font-medium text-[#012754] leading-tight">
            ${product.price.toFixed(2)}
          </p>
          {isBulk && (
            <span className="text-[11px] text-snp-navy-500">/ unit</span>
          )}
        </div>

        {product.colors.length > 0 && (
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 5).map(c => (
              <div
                key={c.hex}
                className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform hover:scale-125"
                style={{
                  backgroundColor: c.hex,
                  border: '1.5px solid white',
                  boxShadow: hoveredColor === c.hex
                    ? `0 0 0 2px ${c.hex}`
                    : '0 0 0 1px rgba(1,39,84,0.15)',
                }}
                title={c.name}
                onMouseEnter={e => { e.stopPropagation(); setHoveredColor(c.hex); }}
                onMouseLeave={e => { e.stopPropagation(); setHoveredColor(null); }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[9px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
