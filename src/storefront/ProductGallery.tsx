import { useState } from 'react';
import type { Product } from '../data/mockData';
import { StoreProductImage, StoreProductMockup, type ProductView } from '../components/stores/StoreBits';
import { useSf } from './StorefrontShell';

interface GalleryView { id: string; view: ProductView; label: string }

/**
 * Multi-angle gallery simulated from the product photography:
 * front (artwork mockup or logo composite), print detail (zoom on the
 * decoration), and a mirrored back view for flat-shot products. Selecting a
 * color swaps to real per-color photography when the product has it — no tints.
 */
export function ProductGallery({ product, logoSrc, colorName, overridePreview }: {
  product: Product;
  logoSrc: string;
  colorName?: string | null;
  /** when the shopper customized the item, show their preview as the front view */
  overridePreview?: string;
}) {
  const { store } = useSf();
  const views: GalleryView[] = [{ id: 'front', view: 'front', label: 'Front' }];
  if (product.printArea) views.push({ id: 'detail', view: 'detail', label: 'Print detail' });
  if (product.photoType !== 'model' && product.image.startsWith('/')) views.push({ id: 'back', view: 'back', label: 'Back' });

  // reset the active view when the product changes (state-adjust-during-render pattern)
  const [view, setView] = useState({ pid: product.id, active: views[0].id });
  if (view.pid !== product.id) setView({ pid: product.id, active: 'front' });
  const active = view.active;
  const setActive = (id: string) => setView({ pid: product.id, active: id });
  const current = views.find(v => v.id === active) ?? views[0];

  const renderView = (v: ProductView, cls: string) => v === 'front'
    ? <StoreProductMockup store={store} product={product} logoSrc={logoSrc} colorName={colorName} className={cls} />
    : <StoreProductImage product={product} logoSrc={logoSrc} view={v} colorName={colorName} className={cls} />;

  return (
    <div>
      <div className="relative bg-white overflow-hidden" style={{ borderRadius: `calc(var(--sf-radius) * 1.4)`, border: '1px solid var(--sf-border)' }}>
        {overridePreview && current.id === 'front' ? (
          <div className="h-[440px] p-10 flex items-center justify-center">
            <img src={overridePreview} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          renderView(current.view, 'h-[440px] p-10')
        )}
        {current.id === 'back' && (
          <span className="absolute top-4 right-4 text-[10.5px] font-bold px-2 py-1" style={{ background: 'color-mix(in srgb, var(--sf-ink) 8%, transparent)', color: 'var(--sf-sub)', borderRadius: 'calc(var(--sf-radius)/1.5)' }}>
            Back — undecorated
          </span>
        )}
      </div>

      {views.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              title={v.label}
              className="w-[74px] text-center"
            >
              <div
                className="bg-white overflow-hidden transition-all"
                style={{
                  borderRadius: 'calc(var(--sf-radius) / 1.1)',
                  border: '2px solid',
                  borderColor: active === v.id ? 'var(--sf-primary)' : 'var(--sf-border)',
                }}
              >
                {overridePreview && v.id === 'front' ? (
                  <div className="h-16 p-1.5 flex items-center justify-center">
                    <img src={overridePreview} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  renderView(v.view, 'h-16 p-1.5')
                )}
              </div>
              <span className="block mt-1 text-[10px] font-semibold" style={{ color: active === v.id ? 'var(--sf-primary)' : 'var(--sf-sub)' }}>
                {v.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
