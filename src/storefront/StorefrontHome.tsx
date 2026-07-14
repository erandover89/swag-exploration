import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Globe2, Sparkles, Truck } from 'lucide-react';
import { retailPrice, storeCategories, visibleProducts, fmtMoney, tierFor } from '../data/storesData';
import { StoreProductMockup } from '../components/stores/StoreBits';
import { SfButton, useSf } from './StorefrontShell';
import type { Product } from '../data/mockData';

function ProductCardSf({ p }: { p: Product }) {
  const { store, theme } = useSf();
  const price = retailPrice(store, p);
  const tier = store.pricing.showBulkSavings ? tierFor(store, 999) : null;
  return (
    <Link
      to={`/store/${store.slug}/p/${p.id}`}
      className="group block overflow-hidden transition-transform hover:-translate-y-1"
      style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}
    >
      <div className="relative bg-white">
        <StoreProductMockup store={store} product={p} className="h-56 p-5 transition-transform duration-300 group-hover:scale-[1.04]" />
        {tier && (
          <span
            className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-1"
            style={{ background: 'var(--sf-accent)', color: '#fff', borderRadius: 'calc(var(--sf-radius) / 1.5)' }}
          >
            Up to {tier.discountPct}% off in bulk
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--sf-sub)' }}>{p.brand}</div>
        <div
          className="text-[14.5px] leading-snug mb-2 line-clamp-1"
          style={{ fontFamily: theme.fontDisplay, fontWeight: Math.min(theme.displayWeight, 700), color: 'var(--sf-ink)' }}
        >
          {p.name}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold" style={{ color: 'var(--sf-ink)' }}>{fmtMoney(price)}</span>
          <span className="flex gap-1">
            {p.colors.slice(0, 4).map(c => (
              <span key={c.name} className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ background: c.hex }} />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
export { ProductCardSf };

export function StorefrontHome() {
  const { store, theme } = useSf();
  const navigate = useNavigate();
  const products = visibleProducts(store);
  const featured = store.featuredIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
  const heroProducts = (featured.length >= 3 ? featured : products).slice(0, 3);
  const cats = storeCategories(store);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--sf-hero-bg)', color: 'var(--sf-hero-ink)' }}>
        {store.bannerImage ? (
          <>
            {/* admin-uploaded banner + legibility scrim */}
            <img src={store.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.1) 100%)' }} />
          </>
        ) : (
          <>
            {/* backdrop graphics */}
            <div
              className="absolute -right-32 -top-40 w-[520px] h-[520px] rounded-full pointer-events-none"
              style={{ background: 'var(--sf-primary)', opacity: 0.16, filter: 'blur(10px)' }}
            />
            <div
              className="absolute right-56 -bottom-52 w-[420px] h-[420px] rounded-full pointer-events-none"
              style={{ background: 'var(--sf-accent)', opacity: 0.13 }}
            />
            <div
              className="absolute inset-0 pointer-events-none select-none overflow-hidden hidden lg:block"
              aria-hidden
            >
              <span
                className="absolute -bottom-8 left-0 whitespace-nowrap text-[150px] leading-none"
                style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform, opacity: 0.05, letterSpacing: '-0.02em' }}
              >
                {store.clientName} · {store.clientName}
              </span>
            </div>
          </>
        )}

        <div className="relative max-w-[1200px] mx-auto px-5 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] mb-5 px-3 py-1.5"
              style={{ border: '1px solid color-mix(in srgb, var(--sf-hero-ink) 25%, transparent)', borderRadius: '999px', opacity: 0.85 }}>
              <Sparkles className="w-3 h-3" /> Official store
            </div>
            <h1
              className="text-[44px] md:text-[64px] leading-[0.98] mb-5"
              style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform, letterSpacing: theme.displayTracking }}
            >
              {store.heroHeadline}
            </h1>
            <p className="text-[15.5px] leading-relaxed max-w-md mb-8" style={{ opacity: 0.75 }}>
              {store.heroSub}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <SfButton onClick={() => navigate(`/store/${store.slug}/shop`)}>
                Shop the collection <ArrowRight className="w-4 h-4" />
              </SfButton>
              {featured[0] && (
                <button
                  onClick={() => navigate(`/store/${store.slug}/p/${featured[0].id}`)}
                  className="h-12 px-5 text-[14px] font-bold hover:opacity-75"
                  style={{ color: 'var(--sf-hero-ink)', border: '1.5px solid color-mix(in srgb, var(--sf-hero-ink) 35%, transparent)', borderRadius: 'var(--sf-radius)' }}
                >
                  Best seller →
                </button>
              )}
            </div>
          </div>

          {/* hero product collage */}
          <div className="relative h-[380px] hidden lg:block">
            {heroProducts.map((p, i) => {
              const poses = [
                { left: '4%', top: '10%', w: 210, rot: -7, z: 1 },
                { left: '34%', top: '0%', w: 250, rot: 2, z: 3 },
                { left: '62%', top: '28%', w: 200, rot: 8, z: 2 },
              ][i];
              return (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/p/${p.id}`}
                  className="absolute bg-white p-4 shadow-2xl transition-transform hover:scale-[1.05] hover:z-10"
                  style={{ left: poses.left, top: poses.top, width: poses.w, transform: `rotate(${poses.rot}deg)`, zIndex: poses.z, borderRadius: `calc(var(--sf-radius) * 1.4)` }}
                >
                  <StoreProductMockup store={store} product={p} className="h-40" />
                  <div className="mt-2 text-[11px] font-bold text-neutral-900 truncate">{p.name}</div>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--sf-primary)' }}>{fmtMoney(retailPrice(store, p))}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="px-5 md:px-10" style={{ background: 'var(--sf-surface)', borderBottom: '1px solid var(--sf-border)' }}>
        <div className="max-w-[1200px] mx-auto py-4 flex items-center justify-center gap-8 md:gap-14 flex-wrap text-[12.5px] font-semibold" style={{ color: 'var(--sf-sub)' }}>
          <span className="flex items-center gap-2"><Truck className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Free shipping over $75</span>
          <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Printed on demand — no leftovers</span>
          <span className="flex items-center gap-2"><Globe2 className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Ships worldwide, duties included</span>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-10 pt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-[26px]" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
            Shop by category
          </h2>
          <Link to={`/store/${store.slug}/shop`} className="text-[13px] font-bold hover:opacity-70" style={{ color: 'var(--sf-primary)' }}>
            View everything →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.slice(0, 4).map(cat => {
            const rep = products.find(p => p.category === cat);
            return (
              <Link
                key={cat}
                to={`/store/${store.slug}/shop?cat=${encodeURIComponent(cat)}`}
                className="group relative overflow-hidden"
                style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}
              >
                <div className="bg-white">
                  {rep && <StoreProductMockup store={store} product={rep} className="h-36 p-4 transition-transform duration-300 group-hover:scale-105" />}
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[13.5px] font-bold">{cat}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--sf-primary)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured grid ── */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-10 pt-14">
        <h2 className="text-[26px] mb-6" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
          {featured.length ? 'Featured drops' : 'New in store'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(featured.length ? featured : products.slice(0, 4)).map(p => <ProductCardSf key={p.id} p={p} />)}
        </div>
      </section>

      {/* ── Bulk banner ── */}
      {store.pricing.showBulkSavings && store.pricing.volumeTiers.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-5 md:px-10 pt-14">
          <div
            className="relative overflow-hidden px-8 py-10 md:px-12 flex flex-wrap items-center gap-8"
            style={{ background: 'var(--sf-hero-bg)', color: 'var(--sf-hero-ink)', borderRadius: `calc(var(--sf-radius) * 1.6)` }}
          >
            <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full" style={{ background: 'var(--sf-primary)', opacity: 0.18 }} />
            <div className="relative flex-1 min-w-[240px]">
              <h3 className="text-[28px] leading-tight mb-2" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
                Ordering for the whole crew?
              </h3>
              <p className="text-[14px] max-w-md" style={{ opacity: 0.75 }}>
                Prices drop automatically as your cart grows — enter sizes for everyone in one grid and watch the savings stack.
              </p>
            </div>
            <div className="relative flex gap-3">
              {store.pricing.volumeTiers.map(t => (
                <div key={t.qty} className="text-center px-5 py-4" style={{ background: 'color-mix(in srgb, var(--sf-hero-ink) 9%, transparent)', borderRadius: 'var(--sf-radius)' }}>
                  <div className="text-[22px] font-bold" style={{ color: 'var(--sf-primary)', fontFamily: theme.fontDisplay }}>{t.discountPct}%</div>
                  <div className="text-[11px] font-semibold" style={{ opacity: 0.7 }}>off {t.qty}+ items</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Full grid ── */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-10 pt-14">
        <h2 className="text-[26px] mb-6" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
          The full collection
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map(p => <ProductCardSf key={p.id} p={p} />)}
        </div>
        {products.length > 8 && (
          <div className="text-center mt-8">
            <SfButton kind="ghost" onClick={() => navigate(`/store/${store.slug}/shop`)}>
              Browse all {products.length} products
            </SfButton>
          </div>
        )}
      </section>
    </div>
  );
}
