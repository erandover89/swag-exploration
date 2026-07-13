import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Lock, Menu, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { PRODUCTS, type Product } from '../data/mockData';
import {
  getTheme, retailPrice, tierFor, fmtMoney, storeCategories,
  type DistributorStore, type StoreTheme,
} from '../data/storesData';
import { useStores } from '../context/StoresContext';
import { storeLogoSrc } from '../components/stores/StoreBits';
import { StorefrontHome } from './StorefrontHome';
import { StorefrontShop } from './StorefrontShop';
import { StorefrontProduct } from './StorefrontProduct';
import { StorefrontCheckout, StorefrontConfirmed } from './StorefrontCheckout';

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartLine {
  key: string;         // productId|size|logoId
  productId: string;
  size: string;
  qty: number;
  logoId: string;
}

interface SfContextValue {
  store: DistributorStore;
  theme: StoreTheme;
  lines: CartLine[];
  addLines: (lines: Omit<CartLine, 'key'>[]) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  totals: { units: number; subtotal: number; discountPct: number; discount: number; total: number };
}

const SfContext = createContext<SfContextValue | null>(null);
// eslint-disable-next-line react-refresh/only-export-components
export function useSf(): SfContextValue {
  const ctx = useContext(SfContext);
  if (!ctx) throw new Error('useSf outside StorefrontShell');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function productById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

// ── Shared bits ───────────────────────────────────────────────────────────────

function SfButton({ children, onClick, kind = 'primary', className = '', disabled }: {
  children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost'; className?: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold text-[14px] px-6 h-12 transition-opacity hover:opacity-85 disabled:opacity-40 ${className}`}
      style={kind === 'primary'
        ? { background: 'var(--sf-primary)', color: 'var(--sf-primary-ink)', borderRadius: 'var(--sf-radius)' }
        : { background: 'transparent', color: 'var(--sf-ink)', border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}
    >
      {children}
    </button>
  );
}
export { SfButton };

// ── Cart drawer ───────────────────────────────────────────────────────────────

function CartDrawer() {
  const { store, lines, setQty, cartOpen, setCartOpen, totals, theme } = useSf();
  const navigate = useNavigate();
  if (!cartOpen) return null;

  const nextTier = store.pricing.volumeTiers
    .filter(t => t.qty > totals.units)
    .sort((a, b) => a.qty - b.qty)[0];

  return (
    <div className="fixed inset-0 z-[90] flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setCartOpen(false)}>
      <div
        className="w-full max-w-md h-full flex flex-col"
        style={{ background: 'var(--sf-surface)', color: 'var(--sf-ink)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: '1px solid var(--sf-border)' }}>
          <span className="text-[16px] font-bold" style={{ fontFamily: theme.fontDisplay, textTransform: theme.displayTransform }}>
            Your cart {totals.units > 0 && `(${totals.units})`}
          </span>
          <button onClick={() => setCartOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-60">
            <ShoppingBag className="w-8 h-8" />
            <span className="text-[14px]">Your cart is empty</span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {lines.map(line => {
                const p = productById(line.productId);
                if (!p) return null;
                const unit = retailPrice(store, p);
                return (
                  <div key={line.key} className="flex gap-3.5">
                    <div className="w-[72px] h-[72px] bg-white shrink-0 flex items-center justify-center p-1.5" style={{ borderRadius: 'var(--sf-radius)', border: '1px solid var(--sf-border)' }}>
                      {p.image.startsWith('/')
                        ? <img src={p.image} alt="" className="max-w-full max-h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                        : <span className="text-2xl">{p.image}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold leading-tight truncate">{p.name}</div>
                      <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--sf-sub)' }}>
                        Size {line.size}{store.logos.length > 1 && ` · ${store.logos.find(l => l.id === line.logoId)?.label ?? 'Primary'} logo`}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center" style={{ border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
                          <button className="w-7 h-7 flex items-center justify-center" onClick={() => setQty(line.key, line.qty - 1)}><Minus className="w-3 h-3" /></button>
                          <span className="w-7 text-center text-[12.5px] font-bold">{line.qty}</span>
                          <button className="w-7 h-7 flex items-center justify-center" onClick={() => setQty(line.key, line.qty + 1)}><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-[13.5px] font-bold ml-auto">{fmtMoney(unit * line.qty)}</span>
                        <button onClick={() => setQty(line.key, 0)} style={{ color: 'var(--sf-sub)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 space-y-2.5 shrink-0" style={{ borderTop: '1px solid var(--sf-border)' }}>
              {nextTier && store.pricing.showBulkSavings && (
                <div className="text-[12px] font-semibold px-3 py-2 rounded-md" style={{ background: 'color-mix(in srgb, var(--sf-accent) 14%, transparent)', color: 'var(--sf-ink)' }}>
                  🎉 Add {nextTier.qty - totals.units} more item{nextTier.qty - totals.units > 1 ? 's' : ''} to unlock {nextTier.discountPct}% off everything
                </div>
              )}
              <div className="flex justify-between text-[13px]" style={{ color: 'var(--sf-sub)' }}>
                <span>Subtotal ({totals.units} items)</span><span>{fmtMoney(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-[13px] font-bold" style={{ color: 'var(--sf-accent)' }}>
                  <span>Volume discount ({totals.discountPct}% off)</span><span>−{fmtMoney(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[16px] font-bold pt-1">
                <span>Total</span><span>{fmtMoney(totals.total)}</span>
              </div>
              <div className="text-[11px]" style={{ color: 'var(--sf-sub)' }}>Shipping & tax included · printed on demand</div>
              <SfButton className="w-full mt-1" onClick={() => { setCartOpen(false); navigate(`/store/${store.slug}/checkout`); }}>
                Checkout
              </SfButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Header / footer ───────────────────────────────────────────────────────────

function SfHeader() {
  const { store, theme, totals, setCartOpen } = useSf();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const cats = storeCategories(store).slice(0, 4);

  return (
    <>
      <div className="text-center text-[12px] font-semibold py-2 px-4" style={{ background: 'var(--sf-primary)', color: 'var(--sf-primary-ink)' }}>
        {store.announcement}
      </div>
      <header
        className="sticky top-0 z-[80] px-5 md:px-10 h-[68px] flex items-center gap-6"
        style={{ background: 'var(--sf-header-bg)', color: 'var(--sf-header-ink)', borderBottom: '1px solid var(--sf-border)' }}
      >
        <Link to={`/store/${store.slug}`} className="flex items-center gap-3 shrink-0">
          <img src={storeLogoSrc(store)} alt="" className="h-10 w-10 object-contain" />
          <span
            className="text-[17px] leading-none"
            style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform, letterSpacing: theme.displayTracking }}
          >
            {store.clientName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-6 text-[13.5px] font-semibold" style={{ opacity: 0.85 }}>
          <Link to={`/store/${store.slug}/shop`} className="hover:opacity-70">Shop all</Link>
          {cats.map(c => (
            <Link key={c} to={`/store/${store.slug}/shop?cat=${encodeURIComponent(c)}`} className="hover:opacity-70">{c}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {searchOpen ? (
            <form
              onSubmit={e => { e.preventDefault(); navigate(`/store/${store.slug}/shop?q=${encodeURIComponent(q)}`); setSearchOpen(false); }}
              className="flex items-center gap-2 px-3 h-10"
              style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', background: 'var(--sf-surface)' }}
            >
              <Search className="w-4 h-4" style={{ color: 'var(--sf-sub)' }} />
              <input
                autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search products…"
                className="bg-transparent outline-none text-[13px] w-44"
                style={{ color: 'var(--sf-ink)' }}
                onBlur={() => !q && setSearchOpen(false)}
              />
            </form>
          ) : (
            <button className="w-10 h-10 flex items-center justify-center hover:opacity-70" onClick={() => setSearchOpen(true)}>
              <Search className="w-[18px] h-[18px]" />
            </button>
          )}
          <button className="relative w-10 h-10 flex items-center justify-center hover:opacity-70" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="w-[18px] h-[18px]" />
            {totals.units > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'var(--sf-primary)', color: 'var(--sf-primary-ink)' }}
              >
                {totals.units}
              </span>
            )}
          </button>
          <button className="md:hidden w-10 h-10 flex items-center justify-center"><Menu className="w-5 h-5" /></button>
        </div>
      </header>
    </>
  );
}

function SfFooter() {
  const { store, theme } = useSf();
  return (
    <footer className="mt-20 px-5 md:px-10 pt-12 pb-8" style={{ background: 'var(--sf-hero-bg)', color: 'var(--sf-hero-ink)' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap gap-10 justify-between pb-10" style={{ borderBottom: '1px solid color-mix(in srgb, var(--sf-hero-ink) 18%, transparent)' }}>
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <img src={storeLogoSrc(store)} alt="" className="h-9 w-9 object-contain" />
              <span className="text-[16px]" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
                {store.clientName}
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed" style={{ opacity: 0.65 }}>
              Official merchandise, printed on demand and delivered worldwide. Every item supports {store.clientName}.
            </p>
          </div>
          {[
            ['Shop', ['All products', 'New arrivals', 'Best sellers']],
            ['Help', ['Sizing guide', 'Shipping & returns', 'Contact us']],
            ['About', ['Our story', 'Quality promise', 'Privacy']],
          ].map(([title, links]) => (
            <div key={title as string}>
              <div className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ opacity: 0.5 }}>{title}</div>
              <div className="space-y-2">
                {(links as string[]).map(l => <div key={l} className="text-[13px] cursor-pointer hover:opacity-70" style={{ opacity: 0.85 }}>{l}</div>)}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 flex items-center justify-between flex-wrap gap-3 text-[11.5px]" style={{ opacity: 0.55 }}>
          <span>© 2026 {store.clientName}. All rights reserved.</span>
          <span>Powered by <b>Snappy Commerce</b> · Fulfillment by SanMar network</span>
        </div>
      </div>
    </footer>
  );
}

// ── Passcode gate ─────────────────────────────────────────────────────────────

function PasscodeGate({ store, onUnlock }: { store: DistributorStore; onUnlock: () => void }) {
  const theme = getTheme(store.themeId);
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: theme.colors.heroBg, fontFamily: theme.fontBody }}>
      <div className="w-full max-w-sm text-center p-8" style={{ background: theme.colors.surface, borderRadius: `calc(${theme.radius} * 1.5)`, border: `1px solid ${theme.colors.border}` }}>
        <img src={storeLogoSrc(store)} alt="" className="h-16 w-16 object-contain mx-auto mb-4" />
        <h1 className="text-[22px] mb-1" style={{ color: theme.colors.ink, fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
          {store.clientName}
        </h1>
        <p className="text-[13px] mb-6" style={{ color: theme.colors.sub }}>This store is private. Enter the access code you received.</p>
        <form onSubmit={e => {
          e.preventDefault();
          if (code.trim().toUpperCase() === (store.settings.passcode ?? '').toUpperCase()) {
            sessionStorage.setItem(`sf_unlocked_${store.slug}`, '1');
            onUnlock();
          } else setErr(true);
        }}>
          <div className="flex items-center gap-2 px-3.5 h-12 mb-3" style={{ border: `1.5px solid ${err ? '#dc2626' : theme.colors.border}`, borderRadius: theme.radius }}>
            <Lock className="w-4 h-4" style={{ color: theme.colors.sub }} />
            <input
              value={code} onChange={e => { setCode(e.target.value); setErr(false); }}
              placeholder="ACCESS CODE"
              className="flex-1 bg-transparent outline-none text-[14px] font-bold tracking-widest uppercase"
              style={{ color: theme.colors.ink }}
            />
          </div>
          {err && <p className="text-[12px] text-red-500 mb-2">That code doesn't match — try again.</p>}
          <button type="submit" className="w-full h-12 font-bold text-[14px]" style={{ background: theme.colors.primary, color: theme.colors.primaryInk, borderRadius: theme.radius }}>
            Enter store
          </button>
        </form>
        <p className="mt-4 text-[10.5px]" style={{ color: theme.colors.sub }}>Demo hint: {store.settings.passcode}</p>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export function StorefrontShell() {
  const { slug } = useParams<{ slug: string }>();
  const { getStore } = useStores();
  const store = slug ? getStore(slug) : undefined;
  const [unlockedTick, setUnlockedTick] = useState(0);
  const [lines, setLines] = useState<CartLine[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(`sf_cart_${slug}`) ?? '[]'); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try { sessionStorage.setItem(`sf_cart_${slug}`, JSON.stringify(lines)); } catch { /* noop */ }
  }, [lines, slug]);

  const theme = getTheme(store?.themeId ?? 'modern');

  const totals = useMemo(() => {
    if (!store) return { units: 0, subtotal: 0, discountPct: 0, discount: 0, total: 0 };
    const units = lines.reduce((a, l) => a + l.qty, 0);
    const subtotal = lines.reduce((a, l) => {
      const p = productById(l.productId);
      return a + (p ? retailPrice(store, p) * l.qty : 0);
    }, 0);
    const tier = tierFor(store, units);
    const discountPct = tier?.discountPct ?? 0;
    const discount = Math.round(subtotal * discountPct) / 100;
    return { units, subtotal, discountPct, discount, total: subtotal - discount };
  }, [lines, store]);

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-neutral-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <span className="text-[40px]">🛍️</span>
        <p className="text-[16px] font-semibold">This store doesn't exist (or was retired).</p>
      </div>
    );
  }

  const locked = store.settings.access === 'passcode' && !sessionStorage.getItem(`sf_unlocked_${store.slug}`);
  if (locked) return <PasscodeGate store={store} onUnlock={() => setUnlockedTick(t => t + 1)} key={unlockedTick} />;

  const addLines = (add: Omit<CartLine, 'key'>[]) => {
    setLines(prev => {
      const next = [...prev];
      for (const l of add) {
        if (l.qty <= 0) continue;
        const key = `${l.productId}|${l.size}|${l.logoId}`;
        const existing = next.find(x => x.key === key);
        if (existing) existing.qty += l.qty;
        else next.push({ ...l, key });
      }
      return next;
    });
    setCartOpen(true);
  };

  const setQty = (key: string, qty: number) => {
    setLines(prev => qty <= 0 ? prev.filter(l => l.key !== key) : prev.map(l => l.key === key ? { ...l, qty } : l));
  };

  const c = theme.colors;
  const cssVars = {
    '--sf-bg': c.bg, '--sf-surface': c.surface, '--sf-ink': c.ink, '--sf-sub': c.sub,
    '--sf-border': c.border, '--sf-primary': c.primary, '--sf-primary-ink': c.primaryInk,
    '--sf-accent': c.accent, '--sf-header-bg': c.headerBg, '--sf-header-ink': c.headerInk,
    '--sf-hero-bg': c.heroBg, '--sf-hero-ink': c.heroInk, '--sf-radius': theme.radius,
  } as React.CSSProperties;

  return (
    <SfContext.Provider value={{ store, theme, lines, addLines, setQty, clearCart: () => setLines([]), cartOpen, setCartOpen, totals }}>
      <div className="min-h-screen flex flex-col" style={{ ...cssVars, background: 'var(--sf-bg)', color: 'var(--sf-ink)', fontFamily: theme.fontBody }}>
        {store.status !== 'live' && (
          <div className="text-center text-[12px] font-bold py-1.5 bg-amber-400 text-amber-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {store.status === 'draft' ? 'DRAFT PREVIEW — publish the store to make this link public' : 'STORE PAUSED — visible to admins only'}
          </div>
        )}
        <SfHeader />
        <main className="flex-1">
          <Routes>
            <Route index element={<StorefrontHome />} />
            <Route path="shop" element={<StorefrontShop />} />
            <Route path="p/:pid" element={<StorefrontProduct />} />
            <Route path="checkout" element={<StorefrontCheckout />} />
            <Route path="confirmed" element={<StorefrontConfirmed />} />
          </Routes>
        </main>
        <SfFooter />
        <CartDrawer />
      </div>
    </SfContext.Provider>
  );
}
