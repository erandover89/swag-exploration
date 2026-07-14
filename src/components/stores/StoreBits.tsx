import type { CSSProperties } from 'react';
import type { Product } from '../../data/mockData';
import type { DistributorStore, StoreStatus } from '../../data/storesData';
import { useLookbooks } from '../../context/LookbookContext';
import type { ImageLayer, TextLayer } from '../../pages/designTool/types';

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

export type ProductView = 'front' | 'back' | 'detail';

/** Colorway photo when real per-color assets exist — never a CSS tint. */
// eslint-disable-next-line react-refresh/only-export-components
export function productImageFor(product: Product, colorName?: string | null): string {
  if (colorName && product.colorImages?.[colorName]) return product.colorImages[colorName];
  return product.image;
}

export function StoreProductImage({ product, logoSrc, className, imgStyle, view = 'front', colorName }: {
  product: Product;
  logoSrc: string;
  className?: string;
  imgStyle?: CSSProperties;
  /** 'detail' zooms into the print area; 'back' mirrors the photo without a logo (flat shots only) */
  view?: ProductView;
  /** selected colorway — swaps to real per-color photography when the product has it */
  colorName?: string | null;
}) {
  const src = productImageFor(product, colorName);
  const isPhoto = src.startsWith('/');
  const pa = product.printArea;
  const showLogo = isPhoto && pa && logoSrc && view !== 'back';

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
            src={src}
            alt={product.name}
            className="w-full h-full object-contain"
            style={{ mixBlendMode: 'multiply', ...imgStyle }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">{src}</div>
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

// ── Artwork-aware mockup ──────────────────────────────────────────────────────

/**
 * The one mockup renderer for store products. When the admin has authored
 * artwork in the design studio (persisted under lookbook `store:${storeId}`),
 * the saved layers render live over the product photo — so an artwork save
 * refreshes tiles, the PDP and the storefront instantly. Without artwork it
 * falls back to the print-area logo composite.
 */
export function StoreProductMockup({ store, product, className, logoSrc, colorName, view = 'front' }: {
  store: DistributorStore;
  product: Product;
  className?: string;
  /** override the composited logo (per-color or shopper-picked); defaults to the store's primary */
  logoSrc?: string;
  colorName?: string | null;
  view?: ProductView;
}) {
  const { getProductDesign } = useLookbooks();
  const design = getProductDesign(`store:${store.id}`, product.id);
  const src = productImageFor(product, colorName);
  const layers = design?.layers.filter(l => l.visible) ?? [];

  if (!layers.length || !src.startsWith('/') || view !== 'front') {
    return (
      <StoreProductImage
        product={product}
        logoSrc={logoSrc ?? storeLogoSrc(store)}
        className={className}
        colorName={colorName}
        view={view}
      />
    );
  }

  const cw = design!.canvasWidth || 460;
  const chh = design!.canvasHeight || 520;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className ?? ''}`}>
      {/* aspect box matching the design canvas so layer coordinates line up */}
      <div
        className="relative h-full max-w-full"
        style={{ aspectRatio: `${cw} / ${chh}`, containerType: 'size' }}
      >
        <img src={src} alt={product.name} className="absolute inset-0 w-full h-full object-cover" style={{ mixBlendMode: 'multiply' }} />
        {design!.backgroundColor && (
          <div
            className="absolute"
            style={{
              left: '20%', top: '16.9%', width: '60%', height: '66.2%', // printable area in canvas %
              background: design!.backgroundColor,
            }}
          />
        )}
        {[...layers].sort((a, b) => a.zIndex - b.zIndex).map(layer => {
          const pos: CSSProperties = {
            position: 'absolute',
            left: `${(layer.x / cw) * 100}%`,
            top: `${(layer.y / chh) * 100}%`,
            width: `${(layer.width / cw) * 100}%`,
            height: `${(layer.height / chh) * 100}%`,
            transform: `rotate(${layer.rotation}deg)`,
            transformOrigin: 'top left',
            opacity: layer.opacity,
            pointerEvents: 'none',
          };
          if (layer.type === 'text') {
            const t = layer as TextLayer;
            return (
              <div
                key={layer.id}
                style={{
                  ...pos,
                  display: 'flex',
                  justifyContent: t.textAlign === 'center' ? 'center' : t.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  fontSize: `${(t.fontSize / chh) * 100}cqh`,
                  fontFamily: t.fontFamily,
                  fontWeight: t.fontWeight,
                  color: t.fillEnabled ? t.fillColor : 'transparent',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                }}
              >
                {t.text}
              </div>
            );
          }
          const img = layer as ImageLayer;
          return (
            <img
              key={layer.id}
              src={img.src}
              alt=""
              style={{ ...pos, objectFit: 'contain', mixBlendMode: layer.type === 'logo' ? 'multiply' : 'normal', opacity: 0.94 }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          );
        })}
      </div>
    </div>
  );
}
