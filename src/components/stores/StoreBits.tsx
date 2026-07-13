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

export function StoreProductImage({ product, logoSrc, className, imgStyle }: {
  product: Product;
  logoSrc: string;
  className?: string;
  imgStyle?: CSSProperties;
}) {
  const isPhoto = product.image.startsWith('/');
  const pa = product.printArea;
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {isPhoto ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
          style={{ mixBlendMode: 'multiply', ...imgStyle }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl">{product.image}</div>
      )}
      {isPhoto && pa && logoSrc && (
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
  );
}
