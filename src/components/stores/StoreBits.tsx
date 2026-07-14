import type { CSSProperties } from 'react';
import type { Product } from '../../data/mockData';
import type { DistributorStore, StoreStatus } from '../../data/storesData';

// ── Store logo ────────────────────────────────────────────────────────────────

export function storeLogoSrc(store: DistributorStore, logoId?: string): string {
  const asset = store.logos.find(l => l.id === (logoId ?? store.primaryLogoId)) ?? store.logos[0];
  return asset?.src ?? '';
}

export function StoreLogo({ store, size = 40, rounded = 10, className, logoId }: {
  store: DistributorStore; size?: number; rounded?: number; className?: string; logoId?: string;
}) {
  return (
    <img
      src={storeLogoSrc(store, logoId)}
      alt={`${store.clientName} logo`}
      className={className}
      style={{ width: size, height: size, borderRadius: rounded, objectFit: 'contain' }}
    />
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<StoreStatus, { label: string; bg: string; text: string; dot: string }> = {
  live:   { label: 'Live',   bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
  draft:  { label: 'Draft',  bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  paused: { label: 'Paused', bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
};

export function StoreStatusPill({ status, size = 'sm' }: { status: StoreStatus; size?: 'sm' | 'md' }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[12px] px-2.5 py-1'}`}
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ── Composited product image (store logo applied at the print area) ──────────

function hexToHslBits(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/**
 * CSS filter approximating a garment recolor from baseHex → targetHex.
 * Demo-level: hue-rotate keeps white studio backgrounds intact.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function colorFilterFor(baseHex: string, targetHex: string): string | undefined {
  if (!baseHex || !targetHex || baseHex === targetHex) return undefined;
  const from = hexToHslBits(baseHex);
  const to = hexToHslBits(targetHex);
  const hue = Math.round(to.h - from.h);
  const sat = from.s > 0.05 ? Math.min(2.5, Math.max(0.3, to.s / Math.max(0.08, from.s))) : 1;
  const bright = Math.min(1.8, Math.max(0.5, to.l / Math.max(0.15, from.l)));
  return `hue-rotate(${hue}deg) saturate(${sat.toFixed(2)}) brightness(${bright.toFixed(2)})`;
}

export type ProductView = 'front' | 'back' | 'detail';

export function StoreProductImage({ product, logoSrc, className, imgStyle, view = 'front', tintHex }: {
  product: Product;
  logoSrc: string;
  className?: string;
  imgStyle?: CSSProperties;
  /** 'detail' zooms into the print area; 'back' mirrors the photo without a logo (flat shots only) */
  view?: ProductView;
  /** simulate a garment colorway with a CSS tint (relative to the product's first color) */
  tintHex?: string | null;
}) {
  const isPhoto = product.image.startsWith('/');
  const pa = product.printArea;
  const showLogo = isPhoto && pa && logoSrc && view !== 'back';
  const tint = tintHex ? colorFilterFor(product.colors[0]?.hex ?? '', tintHex) : undefined;

  // detail view: scale everything up around the print-area center so the logo zooms with the photo
  const zoom = view === 'detail' && pa
    ? { transform: 'scale(2.1)', transformOrigin: `${pa.x + pa.width / 2}% ${pa.y + pa.height / 2}%` }
    : view === 'back'
      ? { transform: 'scaleX(-1)' }
      : undefined;

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div className="relative w-full h-full" style={zoom}>
        {isPhoto ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
            style={{ mixBlendMode: 'multiply', filter: tint, ...imgStyle }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">{product.image}</div>
        )}
        {showLogo && (
          pa.style === 'badge' ? (
            <div
              className="absolute flex items-center justify-center"
              style={{ left: `${pa.x}%`, top: `${pa.y}%`, width: `${pa.width}%`, height: `${pa.height}%` }}
            >
              <img src={logoSrc} alt="" className="max-w-[62%] max-h-[62%] object-contain drop-shadow-sm" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          ) : (
            <img
              src={logoSrc}
              alt=""
              className="absolute object-contain"
              style={{
                left: `${pa.x + pa.width * 0.2}%`,
                top: `${pa.y + pa.height * 0.15}%`,
                width: `${pa.width * 0.6}%`,
                height: `${pa.height * 0.7}%`,
                mixBlendMode: 'multiply',
                opacity: 0.92,
              }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          )
        )}
      </div>
    </div>
  );
}
