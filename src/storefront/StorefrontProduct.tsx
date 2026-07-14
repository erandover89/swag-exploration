import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, ChevronLeft, Grid3X3, Minus, Pencil, Plus, Ruler, ShoppingBag, Truck, Wand2, X } from 'lucide-react';
import { CUSTOMIZATION_UPCHARGE, defaultProductContent, fmtMoney, priceBreakdown, retailPrice, tierFor, tierPrice, visibleProducts } from '../data/storesData';
import { storeLogoSrc } from '../components/stores/StoreBits';
import { productById, SfButton, useSf, type LineCustomization } from './StorefrontShell';
import { ProductCardSf } from './StorefrontHome';
import { ProductGallery } from './ProductGallery';
import { SizeChartModal } from './sizeCharts';
import { StorefrontCustomizer } from './StorefrontCustomizer';

export function StorefrontProduct() {
  const { pid } = useParams<{ pid: string }>();
  const { store, theme, addLines } = useSf();
  const product = pid ? productById(pid) : undefined;

  const [color, setColor] = useState(product?.colors[0]?.name ?? '');
  const [size, setSize] = useState(product?.sizes[0] ?? 'One Size');
  const [qty, setQty] = useState(1);
  const [logoId, setLogoId] = useState(store.primaryLogoId);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQty, setBulkQty] = useState<Record<string, number>>({});
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customization, setCustomization] = useState<LineCustomization | undefined>();

  const related = useMemo(
    () => visibleProducts(store).filter(p => p.id !== pid).slice(0, 4),
    [store, pid],
  );

  if (!product || !store.productIds.includes(product.id)) {
    return (
      <div className="max-w-[1200px] mx-auto px-5 py-24 text-center" style={{ color: 'var(--sf-sub)' }}>
        <p className="text-[15px] font-semibold">This product isn't available in this store.</p>
        <Link to={`/store/${store.slug}/shop`} className="font-bold" style={{ color: 'var(--sf-primary)' }}>← Back to shop</Link>
      </div>
    );
  }

  const customizationCfg = store.productCustomizations[product.id];
  const content = customizationCfg?.content ?? defaultProductContent(product);
  const displayName = customizationCfg?.displayName || product.name;

  const unit = retailPrice(store, product) + (customization ? CUSTOMIZATION_UPCHARGE : 0);
  const tiers = [...store.pricing.volumeTiers].sort((a, b) => a.qty - b.qty);
  const bulkTotalUnits = Object.values(bulkQty).reduce((a, b) => a + b, 0);
  const effectiveUnits = bulkMode ? bulkTotalUnits : qty;
  const activeTier = tierFor(store, effectiveUnits);
  const effectiveUnit = tierPrice(store, product, effectiveUnits) + (customization ? CUSTOMIZATION_UPCHARGE : 0);
  // the admin can pin a specific logo per colorway; the shopper picker overrides it
  const colorLogoId = customizationCfg?.logoByColor?.[color];
  const logoSrc = storeLogoSrc(store, logoId !== store.primaryLogoId ? logoId : (colorLogoId || logoId));

  const addToCart = () => {
    if (bulkMode) {
      addLines(product.sizes.map(s => ({ productId: product.id, size: s, qty: bulkQty[s] ?? 0, logoId, customization })));
      setBulkQty({});
    } else {
      addLines([{ productId: product.id, size, qty, logoId, customization }]);
    }
  };

  const optBtn = (active: boolean) => ({
    border: '1.5px solid',
    borderColor: active ? 'var(--sf-primary)' : 'var(--sf-border)',
    color: active ? 'var(--sf-primary)' : 'var(--sf-ink)',
    background: active ? 'color-mix(in srgb, var(--sf-primary) 8%, var(--sf-surface))' : 'var(--sf-surface)',
    borderRadius: 'calc(var(--sf-radius) / 1.2)',
  });

  return (
    <div className="max-w-[1200px] mx-auto px-5 md:px-10 pt-8">
      <Link to={`/store/${store.slug}/shop`} className="inline-flex items-center gap-1 text-[12.5px] font-bold mb-6 hover:opacity-70" style={{ color: 'var(--sf-sub)' }}>
        <ChevronLeft className="w-4 h-4" /> Shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* ── Gallery ── */}
        <div className="lg:sticky lg:top-24">
          <div className="relative">
            <ProductGallery
              product={product}
              logoSrc={logoSrc}
              colorName={color}
              overridePreview={customization?.previewDataUrl}
            />
            {activeTier && (
              <span className="absolute top-4 left-4 text-[11px] font-bold px-2.5 py-1.5" style={{ background: 'var(--sf-accent)', color: '#fff', borderRadius: 'calc(var(--sf-radius) / 1.5)' }}>
                {activeTier.discountPct}% volume discount applied
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11.5px] font-semibold" style={{ color: 'var(--sf-sub)' }}>
            <BadgeCheck className="w-3.5 h-3.5" style={{ color: 'var(--sf-primary)' }} />
            Live preview — your logo is composited exactly where it prints ({product.printTechnique.replace('-', ' ')})
          </div>
        </div>

        {/* ── Buy panel ── */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sf-sub)' }}>
            {product.brand} · {product.category}
          </div>
          <h1 className="text-[32px] leading-tight mb-3" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform, letterSpacing: theme.displayTracking }}>
            {displayName}
          </h1>

          <div className="mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-[26px] font-bold">{fmtMoney(effectiveUnit)}</span>
              {activeTier && <span className="text-[15px] line-through" style={{ color: 'var(--sf-sub)' }}>{fmtMoney(unit)}</span>}
            </div>
            {(() => {
              const bd = priceBreakdown(store, product);
              return (
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--sf-sub)' }}>
                  Garment {fmtMoney(bd.garment)} + Decoration {fmtMoney(bd.decoration)} · shipping calculated at checkout
                </div>
              );
            })()}
          </div>

          <p className="text-[13.5px] leading-relaxed mb-6 max-w-md" style={{ color: 'var(--sf-sub)' }}>{content.description}</p>

          {/* Shopper customization */}
          {customizationCfg?.customizable && (
            <div className="mb-5">
              {customization ? (
                <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ border: '1.5px dashed var(--sf-primary)', borderRadius: 'var(--sf-radius)', background: 'color-mix(in srgb, var(--sf-primary) 6%, transparent)' }}>
                  <Wand2 className="w-4 h-4 shrink-0" style={{ color: 'var(--sf-primary)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold">Customized — +{fmtMoney(CUSTOMIZATION_UPCHARGE)}/item</div>
                    <div className="text-[11.5px] truncate" style={{ color: 'var(--sf-sub)' }}>{customization.summary}</div>
                  </div>
                  <button onClick={() => setShowCustomizer(true)} title="Edit customization" className="w-8 h-8 flex items-center justify-center hover:opacity-70" style={{ color: 'var(--sf-primary)' }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setCustomization(undefined)} title="Remove customization" className="w-8 h-8 flex items-center justify-center hover:opacity-70" style={{ color: 'var(--sf-sub)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomizer(true)}
                  className="w-full flex items-center justify-center gap-2 h-12 text-[13.5px] font-bold transition-opacity hover:opacity-80"
                  style={{ border: '1.5px dashed var(--sf-primary)', color: 'var(--sf-primary)', borderRadius: 'var(--sf-radius)' }}
                >
                  <Wand2 className="w-4 h-4" /> Customize — move the logo, add text or your own artwork
                </button>
              )}
            </div>
          )}

          {/* Colors */}
          <div className="mb-5">
            <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sf-sub)' }}>Color — {color}</div>
            <div className="flex gap-2">
              {product.colors.map(c => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setColor(c.name)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c.hex,
                    borderColor: color === c.name ? 'var(--sf-primary)' : 'rgba(0,0,0,0.15)',
                    boxShadow: color === c.name ? '0 0 0 2px var(--sf-bg), 0 0 0 4px var(--sf-primary)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Logo picker */}
          {store.settings.logoPicker && store.logos.length > 1 && (
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sf-sub)' }}>Choose your logo</div>
              <div className="flex gap-2.5">
                {store.logos.map(l => (
                  <button key={l.id} onClick={() => setLogoId(l.id)} className="p-2.5 w-20 text-center" style={optBtn(logoId === l.id)}>
                    <img src={l.src} alt={l.label} className="h-9 mx-auto object-contain" />
                    <div className="mt-1 text-[9.5px] font-bold truncate">{l.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size / bulk toggle */}
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--sf-sub)' }}>
              {bulkMode ? 'Quantities by size' : 'Size'}
              {product.category === 'Apparel' && (
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="flex items-center gap-1 normal-case tracking-normal text-[11.5px] font-bold hover:opacity-70"
                  style={{ color: 'var(--sf-primary)' }}
                >
                  <Ruler className="w-3.5 h-3.5" /> Size chart
                </button>
              )}
            </span>
            {store.settings.bulkOrdering && product.sizes.length > 1 && (
              <button
                onClick={() => setBulkMode(m => !m)}
                className="flex items-center gap-1.5 text-[11.5px] font-bold hover:opacity-70"
                style={{ color: 'var(--sf-primary)' }}
              >
                <Grid3X3 className="w-3.5 h-3.5" /> {bulkMode ? 'Single item' : 'Ordering for a group?'}
              </button>
            )}
          </div>

          {!bulkMode ? (
            <>
              <div className="flex gap-2 flex-wrap mb-5">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)} className="h-10 min-w-12 px-3 text-[13px] font-bold" style={optBtn(size === s)}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center h-12" style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
                  <button className="w-11 h-full flex items-center justify-center" onClick={() => setQty(v => Math.max(1, v - 1))}><Minus className="w-4 h-4" /></button>
                  <span className="w-10 text-center text-[15px] font-bold">{qty}</span>
                  <button className="w-11 h-full flex items-center justify-center" onClick={() => setQty(v => v + 1)}><Plus className="w-4 h-4" /></button>
                </div>
                <SfButton className="flex-1" onClick={addToCart}>
                  <ShoppingBag className="w-4 h-4" /> Add to cart — {fmtMoney(effectiveUnit * qty)}
                </SfButton>
              </div>
            </>
          ) : (
            <div className="mb-6">
              {/* Bulk grid — quantity per size */}
              <div
                className="grid mb-3 overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${Math.min(product.sizes.length, 6)}, 1fr)`, border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}
              >
                {product.sizes.map(s => (
                  <div key={s} className="text-center" style={{ borderRight: '1px solid var(--sf-border)' }}>
                    <div className="py-2 text-[11.5px] font-bold" style={{ background: 'color-mix(in srgb, var(--sf-ink) 6%, transparent)' }}>{s}</div>
                    <input
                      type="number" min={0} placeholder="0"
                      value={bulkQty[s] || ''}
                      onChange={e => setBulkQty(prev => ({ ...prev, [s]: Math.max(0, Number(e.target.value)) }))}
                      className="w-full py-2.5 text-center text-[14px] font-bold bg-transparent outline-none"
                      style={{ color: 'var(--sf-ink)' }}
                    />
                  </div>
                ))}
              </div>
              {tiers.length > 0 && store.pricing.showBulkSavings && (
                <div className="text-[12px] font-semibold mb-3" style={{ color: 'var(--sf-sub)' }}>
                  {bulkTotalUnits} units — {activeTier
                    ? <span style={{ color: 'var(--sf-accent)' }}>{activeTier.discountPct}% off unlocked 🎉</span>
                    : tiers[0] ? `add ${tiers[0].qty - bulkTotalUnits} more to unlock ${tiers[0].discountPct}% off` : ''}
                </div>
              )}
              <SfButton className="w-full" disabled={bulkTotalUnits === 0} onClick={addToCart}>
                <ShoppingBag className="w-4 h-4" />
                Add {bulkTotalUnits || ''} item{bulkTotalUnits === 1 ? '' : 's'} — {fmtMoney(effectiveUnit * bulkTotalUnits)}
              </SfButton>
            </div>
          )}

          {/* Tier table */}
          {store.pricing.showBulkSavings && tiers.length > 0 && (
            <div className="mb-6 overflow-hidden" style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
              <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: 'color-mix(in srgb, var(--sf-ink) 6%, transparent)', color: 'var(--sf-sub)' }}>
                Buy more, save more
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${tiers.length + 1}, 1fr)` }}>
                {[{ qty: 1, discountPct: 0 }, ...tiers].map((t, i) => {
                  const isActive = (activeTier?.qty ?? 1) === t.qty && (t.qty > 1 ? true : !activeTier);
                  return (
                    <div key={i} className="text-center py-3" style={{ borderRight: i < tiers.length ? '1px solid var(--sf-border)' : undefined, background: isActive ? 'color-mix(in srgb, var(--sf-primary) 10%, transparent)' : undefined }}>
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--sf-sub)' }}>{t.qty === 1 ? '1+' : `${t.qty}+`} units</div>
                      <div className="text-[15px] font-bold" style={{ color: isActive ? 'var(--sf-primary)' : 'var(--sf-ink)' }}>
                        {fmtMoney(Math.round(unit * (1 - t.discountPct / 100) * 2) / 2)}
                      </div>
                      {t.discountPct > 0 && <div className="text-[10px] font-bold" style={{ color: 'var(--sf-accent)' }}>save {t.discountPct}%</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2 text-[12.5px] font-medium" style={{ color: 'var(--sf-sub)' }}>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Printed on demand · choose Ground, 3-Day or Overnight at checkout</div>
            <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Decoration: {product.printTechnique.replace('-', ' ')} · sizes {product.sizes[0]}–{product.sizes.at(-1)}</div>
          </div>

          {/* Content sections */}
          <div className="mt-8 space-y-4">
            {([
              ['Specifications', content.specifications],
              ['About the brand', content.aboutBrand],
              ...(content.custom?.title && content.custom.body ? [[content.custom.title, content.custom.body] as [string, string]] : []),
            ] as [string, string][]).map(([title, body]) => (
              <details key={title} className="group" style={{ borderTop: '1px solid var(--sf-border)' }}>
                <summary className="flex items-center justify-between py-3.5 cursor-pointer list-none text-[13.5px] font-bold hover:opacity-75">
                  {title}
                  <Plus className="w-4 h-4 transition-transform group-open:rotate-45" style={{ color: 'var(--sf-sub)' }} />
                </summary>
                <p className="text-[13px] leading-relaxed whitespace-pre-line pb-4 max-w-md" style={{ color: 'var(--sf-sub)' }}>{body}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {showSizeChart && <SizeChartModal product={product} onClose={() => setShowSizeChart(false)} />}
      {showCustomizer && (
        <StorefrontCustomizer
          store={store}
          product={product}
          initial={customization}
          onSave={c => { setCustomization(c); setShowCustomizer(false); }}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="pt-16">
          <h2 className="text-[24px] mb-5" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
            Pairs well with
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCardSf key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
