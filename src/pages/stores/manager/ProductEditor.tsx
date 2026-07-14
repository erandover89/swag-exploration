import { useMemo, useState } from 'react';
import { Brush, Check, Layers, Lock, Move, Star, Trash2, Type as TypeIcon, X, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import type { Product } from '../../../data/mockData';
import {
  STYLE_CODES, baseCost, defaultProductContent, fmtMoney, retailPrice, unitMargin,
  type DistributorStore, type ShopperConstraint, type StoreProductContent,
} from '../../../data/storesData';
import { useStores } from '../../../context/StoresContext';
import { useLookbooks } from '../../../context/LookbookContext';
import { StoreProductMockup, storeLogoSrc } from '../../../components/stores/StoreBits';
import { DesignToolPage } from '../../designTool/DesignToolPage';
import { input, label } from './shared';

/** Synthetic lookbook bucket holding this store's per-product artwork. */
// eslint-disable-next-line react-refresh/only-export-components
export const storeArtworkKey = (storeId: string) => `store:${storeId}`;

const CONSTRAINTS: { id: ShopperConstraint; label: string; hint: string }[] = [
  { id: 'locked', label: 'Locked', hint: 'Shoppers can’t move or remove it' },
  { id: 'editable', label: 'Editable', hint: 'Shoppers can move & resize it' },
  { id: 'removable', label: 'Removable', hint: 'Shoppers can delete it entirely' },
];

export function ProductEditor({ store, product, onClose }: {
  store: DistributorStore;
  product: Product;
  onClose: () => void;
}) {
  const { updateStore } = useStores();
  const { getProductDesign } = useLookbooks();
  const [showDesigner, setShowDesigner] = useState(false);
  const [previewColor, setPreviewColor] = useState(product.colors[0]?.name ?? '');

  const customization = store.productCustomizations[product.id] ?? {};
  const content: StoreProductContent = customization.content ?? defaultProductContent(product);
  const design = getProductDesign(storeArtworkKey(store.id), product.id);
  const layers = useMemo(() => design?.layers ?? [], [design]);

  const featured = store.featuredIds.includes(product.id);
  const hidden = store.hiddenIds.includes(product.id);
  const override = store.pricing.productOverrides[product.id];

  const patch = (p: Partial<typeof customization>) => {
    updateStore(store.id, s => ({
      productCustomizations: {
        ...s.productCustomizations,
        [product.id]: { ...s.productCustomizations[product.id], ...p },
      },
    }));
  };

  const patchContent = (p: Partial<StoreProductContent>) => patch({ content: { ...content, ...p } });

  const setConstraint = (layerId: string, c: ShopperConstraint) =>
    patch({ constraints: { ...customization.constraints, [layerId]: c } });

  const logoForColor = (colorName: string) => customization.logoByColor?.[colorName] ?? '';
  const previewLogoSrc = storeLogoSrc(store, logoForColor(previewColor) || undefined);

  const textarea = 'w-full px-3.5 py-2.5 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 outline-none focus:border-snp-indigo-500 resize-none';
  const sectionTitle = 'text-[14px] font-bold text-snp-navy-950 flex items-center gap-2 mb-3';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(1,39,84,0.45)' }} onClick={onClose}>
      <div className="w-full max-w-4xl bg-background h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-snp-navy-200 px-6 py-4 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-snp-navy-400">{product.brand} · {STYLE_CODES[product.id]} · {product.category}</div>
            <h2 className="text-[20px] font-bold text-snp-navy-950 truncate" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {customization.displayName || product.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[12.5px] text-snp-navy-500">
            Cost {fmtMoney(baseCost(product))} → <b className="text-snp-navy-950">{fmtMoney(retailPrice(store, product))}</b>
            <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{fmtMoney(unitMargin(store, product))}/unit</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500 hover:text-snp-navy-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-5 gap-6 items-start">
          {/* ── Preview rail ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-[16px] border border-snp-navy-200 overflow-hidden">
              <StoreProductMockup
                store={store}
                product={product}
                logoSrc={previewLogoSrc}
                colorName={previewColor}
                className="h-72 p-6"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map(c => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setPreviewColor(c.name)}
                  className="w-7 h-7 rounded-full border-2"
                  style={{
                    background: c.hex,
                    borderColor: previewColor === c.name ? '#4f46e5' : 'rgba(0,0,0,0.15)',
                    boxShadow: previewColor === c.name ? '0 0 0 2px #fff, 0 0 0 4px #4f46e5' : undefined,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStore(store.id, s => ({ featuredIds: featured ? s.featuredIds.filter(x => x !== product.id) : [...s.featuredIds, product.id] }))}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] border text-[12.5px] font-bold ${featured ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-snp-navy-200 bg-white text-snp-navy-600'}`}
              >
                <Star className={`w-3.5 h-3.5 ${featured ? 'fill-current' : ''}`} /> {featured ? 'Featured' : 'Feature'}
              </button>
              <button
                onClick={() => updateStore(store.id, s => ({ hiddenIds: hidden ? s.hiddenIds.filter(x => x !== product.id) : [...s.hiddenIds, product.id] }))}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] border text-[12.5px] font-bold ${hidden ? 'border-snp-navy-300 bg-snp-navy-100 text-snp-navy-600' : 'border-snp-navy-200 bg-white text-snp-navy-600'}`}
              >
                {hidden ? <><EyeOff className="w-3.5 h-3.5" /> Hidden</> : <><Eye className="w-3.5 h-3.5" /> Visible</>}
              </button>
              <button
                onClick={() => { if (confirm(`Remove "${product.name}" from this store?`)) { updateStore(store.id, s => ({ productIds: s.productIds.filter(x => x !== product.id) })); onClose(); } }}
                className="w-10 h-10 rounded-[10px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-400 hover:text-snp-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Price override */}
            <div className="bg-white rounded-[14px] border border-snp-navy-200 p-4">
              <label className={label}>Store price</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-snp-navy-400">$</span>
                  <input
                    type="number" step={0.5} min={0}
                    value={retailPrice(store, product)}
                    onChange={e => updateStore(store.id, s => ({
                      pricing: { ...s.pricing, productOverrides: { ...s.pricing.productOverrides, [product.id]: Number(e.target.value) } },
                    }))}
                    className={`w-full h-11 pl-7 pr-3 rounded-[10px] border text-[14px] font-bold outline-none focus:border-snp-indigo-500 ${override != null ? 'border-snp-purple-300 bg-snp-purple-50 text-snp-purple-700' : 'border-snp-navy-200 bg-white text-snp-navy-950'}`}
                  />
                </div>
                {override != null && (
                  <button
                    onClick={() => updateStore(store.id, s => {
                      const rest = { ...s.pricing.productOverrides };
                      delete rest[product.id];
                      return { pricing: { ...s.pricing, productOverrides: rest } };
                    })}
                    className="text-[11px] font-bold text-snp-purple-700 hover:underline"
                  >
                    reset
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-snp-navy-400">{override != null ? 'Overriding the global markup' : `Following the global +${store.pricing.globalMarkupPct}% markup`}</p>
            </div>
          </div>

          {/* ── Edit panel ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Artwork */}
            <div className="bg-white rounded-[16px] border border-snp-navy-200 p-5">
              <div className={sectionTitle}><Brush className="w-4 h-4 text-snp-indigo-700" /> Artwork</div>
              <div className="flex items-center gap-3">
                <div className="text-[12.5px] text-snp-navy-600 flex-1">
                  {layers.length
                    ? <><b className="text-snp-navy-950">Artwork applied</b> — {layers.length} design element{layers.length !== 1 ? 's' : ''} (logo, text, graphics). Saving updates every mockup instantly: tiles, this page and the storefront.</>
                    : <><b className="text-snp-navy-950">Artwork applied</b> — the store's primary logo is placed at the print area. Open the studio to reposition it, swap logos, or add text and graphics.</>}
                </div>
                <button
                  onClick={() => setShowDesigner(true)}
                  className="shrink-0 flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90"
                  style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                >
                  <Brush className="w-3.5 h-3.5" /> Edit artwork
                </button>
              </div>

              {/* Shopper permissions */}
              <div className="mt-4 pt-4 border-t border-snp-navy-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-snp-navy-950 flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-snp-navy-400" /> Shopper customization</span>
                  <label className="flex items-center gap-2 text-[12px] font-semibold text-snp-navy-600 cursor-pointer">
                    <input
                      type="checkbox" className="accent-[#2563eb] w-4 h-4"
                      checked={!!customization.customizable}
                      onChange={e => patch({ customizable: e.target.checked })}
                    />
                    Show a “Customize” button on this product
                  </label>
                </div>
                <p className="text-[11.5px] text-snp-navy-400 mb-3">Control what shoppers may do with each design element when customizing.</p>
                {layers.length === 0 ? (
                  <p className="text-[12px] text-snp-navy-400 bg-snp-navy-50 rounded-[10px] px-3 py-2.5">
                    Create artwork first — then each element (logo, text, graphic) gets its own Locked / Editable / Removable setting.
                    Until then, shoppers who customize start from the auto-placed store logo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {layers.map(l => {
                      const current: ShopperConstraint = customization.constraints?.[l.id] ?? 'locked';
                      return (
                        <div key={l.id} className="flex items-center gap-3 bg-snp-navy-50/60 rounded-[10px] px-3 py-2">
                          <span className="w-6 h-6 rounded-[6px] bg-white border border-snp-navy-200 flex items-center justify-center text-snp-navy-500 shrink-0">
                            {l.type === 'text' ? <TypeIcon className="w-3 h-3" /> : l.type === 'logo' ? <ImageIcon className="w-3 h-3" /> : <Move className="w-3 h-3" />}
                          </span>
                          <span className="text-[12.5px] font-semibold text-snp-navy-800 truncate flex-1">
                            {l.type === 'text' ? `"${(l as { text?: string }).text ?? 'Text'}"` : l.name}
                          </span>
                          <div className="flex gap-1">
                            {CONSTRAINTS.map(c => (
                              <button
                                key={c.id}
                                title={c.hint}
                                onClick={() => setConstraint(l.id, c.id)}
                                className={`h-7 px-2.5 rounded-[7px] text-[11px] font-bold flex items-center gap-1 transition-colors ${
                                  current === c.id ? 'bg-snp-navy-950 text-white' : 'bg-white border border-snp-navy-200 text-snp-navy-500 hover:border-snp-navy-400'
                                }`}
                              >
                                {c.id === 'locked' && <Lock className="w-2.5 h-2.5" />}
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Per-color logo mapping */}
            {store.logos.length > 1 && (
              <div className="bg-white rounded-[16px] border border-snp-navy-200 p-5">
                <div className={sectionTitle}><ImageIcon className="w-4 h-4 text-snp-indigo-700" /> Logo per colorway</div>
                <p className="text-[11.5px] text-snp-navy-400 -mt-1 mb-3">Pick which store logo is composited on each product color — e.g. the monochrome mark on dark garments.</p>
                <div className="space-y-2">
                  {product.colors.map(c => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-black/15 shrink-0" style={{ background: c.hex }} />
                      <span className="text-[12.5px] font-semibold text-snp-navy-800 w-32 truncate">{c.name}</span>
                      <select
                        value={logoForColor(c.name)}
                        onChange={e => patch({ logoByColor: { ...customization.logoByColor, [c.name]: e.target.value } })}
                        className="flex-1 h-9 px-2.5 bg-white rounded-[8px] border border-snp-navy-200 text-[12.5px] font-semibold text-snp-navy-700 outline-none focus:border-snp-indigo-500"
                      >
                        <option value="">Primary ({store.logos.find(l => l.id === store.primaryLogoId)?.label ?? 'default'})</option>
                        {store.logos.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-[16px] border border-snp-navy-200 p-5 space-y-4">
              <div className={sectionTitle}><Check className="w-4 h-4 text-snp-indigo-700" /> Product content</div>
              <div>
                <label className={label}>Display name</label>
                <input
                  className={input}
                  placeholder={product.name}
                  value={customization.displayName ?? ''}
                  onChange={e => patch({ displayName: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea className={textarea} rows={3} value={content.description} onChange={e => patchContent({ description: e.target.value })} />
              </div>
              <div>
                <label className={label}>Specifications</label>
                <textarea className={textarea} rows={4} value={content.specifications} onChange={e => patchContent({ specifications: e.target.value })} />
              </div>
              <div>
                <label className={label}>About the brand</label>
                <textarea className={textarea} rows={3} value={content.aboutBrand} onChange={e => patchContent({ aboutBrand: e.target.value })} />
              </div>
              <div className="pt-1 border-t border-snp-navy-100">
                <label className={label}>Custom section <span className="normal-case font-medium">(optional — anything else shoppers should know)</span></label>
                <input
                  className={`${input} mb-2`}
                  placeholder="Section title, e.g. Care instructions"
                  value={content.custom?.title ?? ''}
                  onChange={e => patchContent({ custom: { title: e.target.value, body: content.custom?.body ?? '' } })}
                />
                <textarea
                  className={textarea} rows={2}
                  placeholder="Section content…"
                  value={content.custom?.body ?? ''}
                  onChange={e => patchContent({ custom: { title: content.custom?.title ?? '', body: e.target.value } })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Design studio overlay */}
      {showDesigner && (
        <div className="fixed inset-0 z-[70] bg-background" onClick={e => e.stopPropagation()}>
          <DesignToolPage
            product={product}
            lookbookId={storeArtworkKey(store.id)}
            seedLogoUrl={storeLogoSrc(store)}
            logoAssets={store.logos.map(l => ({ id: l.id, name: l.label, src: l.src }))}
            onClose={() => setShowDesigner(false)}
            onSave={() => setShowDesigner(false)}
          />
        </div>
      )}
    </div>
  );
}
