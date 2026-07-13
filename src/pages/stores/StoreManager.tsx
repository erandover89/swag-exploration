import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Copy, Check, Plus, X, Eye, EyeOff, Star,
  Rocket, Pause, DollarSign, ShoppingCart, TrendingUp, Users, Download, Trash2, Sparkles,
} from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';
import {
  STORE_THEMES, STYLE_CODES, baseCost, fmtMoney, getTheme, retailPrice, storeProducts,
  unitMargin, type DistributorStore,
} from '../../data/storesData';
import { useStores } from '../../context/StoresContext';
import { StoreLogo, StoreProductImage, StoreStatusPill, storeLogoSrc } from '../../components/stores/StoreBits';

type Tab = 'overview' | 'products' | 'pricing' | 'design' | 'orders' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'pricing', label: 'Pricing & markup' },
  { id: 'design', label: 'Design' },
  { id: 'orders', label: 'Orders' },
  { id: 'settings', label: 'Settings' },
];

const card = 'bg-white rounded-[18px] border border-snp-navy-200 shadow-[0px_4px_12px_rgba(1,39,84,0.05)]';
const label = 'block text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2';
const input = 'w-full h-11 px-3.5 bg-white rounded-[10px] border border-snp-navy-200 text-[13.5px] text-snp-navy-950 outline-none focus:border-snp-indigo-500';

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewTab({ store }: { store: DistributorStore }) {
  const stats = [
    { icon: <DollarSign className="w-4 h-4" />, label: '30-day sales', value: store.stats.revenue30d ? `$${store.stats.revenue30d.toLocaleString()}` : '$0', accent: '#059669' },
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Your margin', value: store.stats.margin30d ? `$${store.stats.margin30d.toLocaleString()}` : '$0', accent: '#7c3aed' },
    { icon: <ShoppingCart className="w-4 h-4" />, label: 'Orders', value: String(store.stats.orders30d), accent: '#ea580c' },
    { icon: <Users className="w-4 h-4" />, label: 'Visitors', value: store.stats.visitors30d.toLocaleString(), accent: '#2563eb' },
  ];
  const theme = getTheme(store.themeId);
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className={`${card} p-4`}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: `${s.accent}14`, color: s.accent }}>{s.icon}</div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-snp-navy-400">{s.label}</span>
              </div>
              <div className="text-[24px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-bold text-snp-navy-950">Recent orders</span>
            <span className="text-[12px] text-snp-navy-400">Routed to SanMar under your account · #DIST-88412</span>
          </div>
          {store.orders.length === 0 ? (
            <p className="text-[13px] text-snp-navy-400 py-6 text-center">No orders yet — publish the store and share the link to start selling.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] font-bold uppercase tracking-wider text-snp-navy-400 border-b border-snp-navy-100">
                  <th className="py-2">Order</th><th className="py-2">Customer</th><th className="py-2 text-right">Items</th>
                  <th className="py-2 text-right">Total</th><th className="py-2 text-right">Your margin</th><th className="py-2 pl-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {store.orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="border-b border-snp-navy-50 last:border-0 text-[13px]">
                    <td className="py-2.5 font-bold text-snp-navy-950">#{o.id}</td>
                    <td className="py-2.5 text-snp-navy-700">{o.customer}</td>
                    <td className="py-2.5 text-right text-snp-navy-700">{o.items}</td>
                    <td className="py-2.5 text-right font-semibold text-snp-navy-950">{fmtMoney(o.total)}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">{fmtMoney(o.margin)}</td>
                    <td className="py-2.5 pl-4"><OrderStatus status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Storefront preview card */}
      <div className={`${card} overflow-hidden self-start`}>
        <div className="p-4 pb-3 flex items-center justify-between">
          <span className="text-[13px] font-bold text-snp-navy-950">Storefront preview</span>
          <button
            onClick={() => window.open(`/store/${store.slug}`, '_blank')}
            className="text-[12px] font-semibold text-snp-indigo-700 flex items-center gap-1 hover:text-snp-indigo-800"
          >
            Open <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="mx-4 mb-4 rounded-[12px] overflow-hidden border border-snp-navy-200">
          {/* mini live render of the hero */}
          <div style={{ background: getTheme(store.themeId).colors.headerBg, borderBottom: `1px solid ${theme.colors.border}` }} className="h-8 flex items-center px-3 gap-2">
            <StoreLogo store={store} size={16} rounded={3} />
            <span className="text-[9px] font-bold truncate" style={{ color: theme.colors.headerInk, fontFamily: theme.fontDisplay }}>{store.clientName}</span>
          </div>
          <div style={{ background: theme.colors.heroBg }} className="px-4 py-5">
            <div
              className="text-[15px] leading-tight mb-1"
              style={{ color: theme.colors.heroInk, fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}
            >
              {store.heroHeadline}
            </div>
            <div className="text-[9px] leading-snug mb-2.5 line-clamp-2" style={{ color: theme.colors.heroInk, opacity: 0.7 }}>{store.heroSub}</div>
            <span className="inline-block text-[9px] font-bold px-2.5 py-1" style={{ background: theme.colors.primary, color: theme.colors.primaryInk, borderRadius: theme.radius }}>
              Shop now
            </span>
          </div>
          <div style={{ background: theme.colors.bg }} className="p-2.5 grid grid-cols-3 gap-1.5">
            {storeProducts(store).slice(0, 3).map(p => (
              <div key={p.id} className="rounded-[6px] overflow-hidden" style={{ background: '#fff', border: `1px solid ${theme.colors.border}` }}>
                <StoreProductImage product={p} logoSrc={storeLogoSrc(store)} className="h-12 p-1 bg-white" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 pb-4 text-[11.5px] text-snp-navy-500 leading-relaxed">
          Theme <b className="text-snp-navy-800">{theme.name}</b> · {store.productIds.length} items · markup +{store.pricing.globalMarkupPct}%
        </div>
      </div>
    </div>
  );
}

function OrderStatus({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    'Paid': { bg: '#eff6ff', text: '#1d4ed8' },
    'In production': { bg: '#fdf4ff', text: '#a21caf' },
    'Shipped': { bg: '#fff7ed', text: '#c2410c' },
    'Delivered': { bg: '#ecfdf5', text: '#047857' },
  };
  const s = map[status] ?? map['Paid'];
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: s.bg, color: s.text }}>{status}</span>;
}

// ── Products ──────────────────────────────────────────────────────────────────

function ProductsTab({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const [showAdd, setShowAdd] = useState(false);
  const products = storeProducts(store);
  const logoSrc = storeLogoSrc(store);

  const toggle = (list: 'featuredIds' | 'hiddenIds', id: string) => {
    updateStore(store.id, s => ({
      [list]: s[list].includes(id) ? s[list].filter(x => x !== id) : [...s[list], id],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="text-[13.5px] text-snp-navy-600">
          <b className="text-snp-navy-950">{products.length} styles</b> in this store · {store.featuredIds.length} featured · {store.hiddenIds.length} hidden
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90"
          style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
        >
          <Plus className="w-4 h-4" /> Add products
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(p => {
          const hidden = store.hiddenIds.includes(p.id);
          const featured = store.featuredIds.includes(p.id);
          const price = retailPrice(store, p);
          return (
            <div key={p.id} className={`${card} overflow-hidden group ${hidden ? 'opacity-55' : ''}`}>
              <div className="relative">
                <StoreProductImage product={p} logoSrc={logoSrc} className="h-44 bg-white p-3" />
                {featured && (
                  <span className="absolute top-2.5 left-2.5 text-[9.5px] font-bold uppercase tracking-wide bg-snp-amber-400 text-snp-navy-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> Featured
                  </span>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button title={featured ? 'Unfeature' : 'Feature on homepage'} onClick={() => toggle('featuredIds', p.id)}
                    className={`w-8 h-8 rounded-[8px] border flex items-center justify-center bg-white shadow-sm ${featured ? 'text-amber-500 border-amber-300' : 'text-snp-navy-400 border-snp-navy-200 hover:text-amber-500'}`}>
                    <Star className={`w-3.5 h-3.5 ${featured ? 'fill-current' : ''}`} />
                  </button>
                  <button title={hidden ? 'Show in store' : 'Hide from store'} onClick={() => toggle('hiddenIds', p.id)}
                    className="w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-400 hover:text-snp-navy-800 shadow-sm">
                    {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button title="Remove from store" onClick={() => updateStore(store.id, s => ({ productIds: s.productIds.filter(x => x !== p.id) }))}
                    className="w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-400 hover:text-snp-red-600 shadow-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3.5 pt-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                <div className="text-[13px] font-semibold text-snp-navy-950 truncate mb-2">{p.name}</div>
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-snp-navy-500">Cost {fmtMoney(baseCost(p))}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-snp-navy-950">{fmtMoney(price)}</span>
                    <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{fmtMoney(unitMargin(store, p))}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add products drawer */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(1,39,84,0.4)' }} onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-2xl bg-background h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[20px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Add from SanMar catalog</h3>
                <p className="text-[12.5px] text-snp-navy-500">Synced nightly via PromoStandards — live inventory & your negotiated cost</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-9 h-9 rounded-full bg-white border border-snp-navy-200 flex items-center justify-center text-snp-navy-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRODUCTS.filter(p => p.image.startsWith('/')).map(p => {
                const inStore = store.productIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={inStore}
                    onClick={() => updateStore(store.id, s => ({ productIds: [...s.productIds, p.id] }))}
                    className={`text-left rounded-[14px] border-2 bg-white overflow-hidden transition-all ${inStore ? 'opacity-40 border-snp-navy-100' : 'border-snp-navy-200 hover:border-snp-indigo-500'}`}
                  >
                    <StoreProductImage product={p} logoSrc={logoSrc} className="h-28 p-2 bg-white" />
                    <div className="px-2.5 pb-2.5">
                      <div className="text-[9.5px] font-bold uppercase text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                      <div className="text-[11.5px] font-semibold text-snp-navy-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-snp-navy-500 mt-0.5">Cost {fmtMoney(baseCost(p))}{inStore && ' · Added ✓'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pricing & markup ──────────────────────────────────────────────────────────

function PricingTab({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const products = storeProducts(store);

  const setTier = (i: number, patch: Partial<{ qty: number; discountPct: number }>) => {
    updateStore(store.id, s => ({
      pricing: { ...s.pricing, volumeTiers: s.pricing.volumeTiers.map((t, j) => j === i ? { ...t, ...patch } : t) },
    }));
  };

  const totals = useMemo(() => {
    const cost = products.reduce((a, p) => a + baseCost(p), 0);
    const retail = products.reduce((a, p) => a + retailPrice(store, p), 0);
    return { cost, retail, margin: retail - cost };
  }, [products, store]);

  return (
    <div className="grid lg:grid-cols-5 gap-5 items-start">
      <div className="lg:col-span-2 space-y-5">
        {/* Global markup */}
        <div className={`${card} p-5`}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[15px] font-bold text-snp-navy-950">Global markup</span>
            <span className="text-[24px] font-bold text-snp-purple-700" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              +{store.pricing.globalMarkupPct}%
            </span>
          </div>
          <p className="text-[12px] text-snp-navy-500 mb-4">On top of your SanMar cost. Per-item overrides win over the global rate.</p>
          <input
            type="range" min={0} max={100} value={store.pricing.globalMarkupPct}
            onChange={e => updateStore(store.id, s => ({ pricing: { ...s.pricing, globalMarkupPct: Number(e.target.value) } }))}
            className="w-full accent-[#7c3aed]"
          />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-snp-navy-50 rounded-[10px] py-2.5">
              <div className="text-[10px] font-bold uppercase text-snp-navy-400">Catalog cost</div>
              <div className="text-[15px] font-bold text-snp-navy-800">{fmtMoney(totals.cost)}</div>
            </div>
            <div className="bg-snp-navy-50 rounded-[10px] py-2.5">
              <div className="text-[10px] font-bold uppercase text-snp-navy-400">Store value</div>
              <div className="text-[15px] font-bold text-snp-navy-950">{fmtMoney(totals.retail)}</div>
            </div>
            <div className="bg-emerald-50 rounded-[10px] py-2.5">
              <div className="text-[10px] font-bold uppercase text-emerald-600">Your margin</div>
              <div className="text-[15px] font-bold text-emerald-600">{fmtMoney(totals.margin)}</div>
            </div>
          </div>
        </div>

        {/* Volume tiers */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[15px] font-bold text-snp-navy-950">Volume discounts</span>
            <label className="flex items-center gap-2 text-[12px] font-semibold text-snp-navy-600 cursor-pointer">
              <input
                type="checkbox" className="accent-[#2563eb] w-3.5 h-3.5"
                checked={store.pricing.showBulkSavings}
                onChange={e => updateStore(store.id, s => ({ pricing: { ...s.pricing, showBulkSavings: e.target.checked } }))}
              />
              Show savings on product pages
            </label>
          </div>
          <p className="text-[12px] text-snp-navy-500 mb-4">Unit price drops automatically as quantity grows — shown at add-to-cart and re-applied at checkout.</p>
          <div className="space-y-2">
            {store.pricing.volumeTiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[12px] text-snp-navy-500 font-medium w-8">Buy</span>
                  <input
                    type="number" min={2} value={t.qty}
                    onChange={e => setTier(i, { qty: Number(e.target.value) })}
                    className="w-20 h-10 px-2.5 bg-white rounded-[9px] border border-snp-navy-200 text-[13px] font-bold text-snp-navy-950 outline-none focus:border-snp-indigo-500"
                  />
                  <span className="text-[12px] text-snp-navy-500 font-medium">+ units</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number" min={1} max={60} value={t.discountPct}
                    onChange={e => setTier(i, { discountPct: Number(e.target.value) })}
                    className="w-16 h-10 px-2.5 bg-white rounded-[9px] border border-snp-navy-200 text-[13px] font-bold text-emerald-600 outline-none focus:border-snp-indigo-500"
                  />
                  <span className="text-[12px] text-snp-navy-500 font-medium">% off</span>
                </div>
                <button
                  onClick={() => updateStore(store.id, s => ({ pricing: { ...s.pricing, volumeTiers: s.pricing.volumeTiers.filter((_, j) => j !== i) } }))}
                  className="w-8 h-8 rounded-[8px] text-snp-navy-300 hover:text-snp-red-600 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateStore(store.id, s => ({
              pricing: { ...s.pricing, volumeTiers: [...s.pricing.volumeTiers, { qty: (s.pricing.volumeTiers.at(-1)?.qty ?? 6) * 2, discountPct: Math.min(60, (s.pricing.volumeTiers.at(-1)?.discountPct ?? 5) + 5) }] },
            }))}
            className="mt-3 text-[12.5px] font-semibold text-snp-indigo-700 flex items-center gap-1.5 hover:text-snp-indigo-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add tier
          </button>
        </div>
      </div>

      {/* Per-item price table */}
      <div className={`${card} lg:col-span-3 overflow-hidden`}>
        <div className="px-5 pt-4 pb-3 flex items-baseline justify-between">
          <span className="text-[15px] font-bold text-snp-navy-950">Price list</span>
          <span className="text-[11.5px] text-snp-navy-400">Set an exact price to override the global markup</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10.5px] font-bold uppercase tracking-wider text-snp-navy-400 border-y border-snp-navy-100 bg-snp-navy-50/50">
              <th className="py-2.5 pl-5">Item</th>
              <th className="py-2.5 text-right">SanMar cost</th>
              <th className="py-2.5 text-center">Store price</th>
              <th className="py-2.5 text-right pr-5">Margin / unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const override = store.pricing.productOverrides[p.id];
              const price = retailPrice(store, p);
              const margin = unitMargin(store, p);
              return (
                <tr key={p.id} className="border-b border-snp-navy-50 last:border-0">
                  <td className="py-2 pl-5">
                    <div className="flex items-center gap-2.5">
                      <StoreProductImage product={p} logoSrc={storeLogoSrc(store)} className="w-9 h-9 bg-white rounded-[8px] border border-snp-navy-100 p-0.5 shrink-0" />
                      <div>
                        <div className="text-[12.5px] font-semibold text-snp-navy-950 leading-tight">{p.name}</div>
                        <div className="text-[10.5px] text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right text-[13px] text-snp-navy-600">{fmtMoney(baseCost(p))}</td>
                  <td className="py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-snp-navy-400">$</span>
                        <input
                          type="number" step={0.5} min={0}
                          value={price}
                          onChange={e => updateStore(store.id, s => ({
                            pricing: { ...s.pricing, productOverrides: { ...s.pricing.productOverrides, [p.id]: Number(e.target.value) } },
                          }))}
                          className={`w-24 h-9 pl-6 pr-2 rounded-[8px] border text-[13px] font-bold outline-none focus:border-snp-indigo-500 ${
                            override != null ? 'border-snp-purple-300 bg-snp-purple-50 text-snp-purple-700' : 'border-snp-navy-200 bg-white text-snp-navy-950'
                          }`}
                        />
                      </div>
                      {override != null && (
                        <button
                          title="Revert to global markup"
                          onClick={() => updateStore(store.id, s => {
                            const { [p.id]: _drop, ...rest } = s.pricing.productOverrides;
                            return { pricing: { ...s.pricing, productOverrides: rest } };
                          })}
                          className="text-[10px] font-bold text-snp-purple-700 hover:underline"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  </td>
                  <td className={`py-2 text-right pr-5 text-[13px] font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-snp-red-600'}`}>
                    {margin >= 0 ? '+' : ''}{fmtMoney(margin)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Design ────────────────────────────────────────────────────────────────────

function DesignTab({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const theme = getTheme(store.themeId);
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        <div className={`${card} p-5`}>
          <span className="text-[15px] font-bold text-snp-navy-950 block mb-3">Theme</span>
          <div className="grid grid-cols-2 gap-2.5">
            {STORE_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => updateStore(store.id, { themeId: t.id })}
                className={`rounded-[12px] border-2 p-3 text-left transition-all ${store.themeId === t.id ? 'border-snp-indigo-600' : 'border-snp-navy-200 hover:border-snp-navy-300'}`}
              >
                <div className="flex gap-1 mb-2">
                  {[t.colors.heroBg, t.colors.primary, t.colors.accent, t.colors.bg].map((c, i) => (
                    <span key={i} className="w-5 h-5 rounded-full border border-black/10" style={{ background: c }} />
                  ))}
                </div>
                <div className="text-[13px] font-bold text-snp-navy-950">{t.name}</div>
                <div className="text-[10.5px] text-snp-navy-500 leading-snug">{t.vibe}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <span className="text-[15px] font-bold text-snp-navy-950 block mb-3">Logos</span>
          <div className="flex gap-3 flex-wrap">
            {store.logos.map(l => (
              <button
                key={l.id}
                onClick={() => updateStore(store.id, { primaryLogoId: l.id })}
                className={`rounded-[12px] border-2 p-3 w-28 ${store.primaryLogoId === l.id ? 'border-snp-indigo-600' : 'border-snp-navy-200'}`}
              >
                <img src={l.src} alt={l.label} className="h-12 mx-auto object-contain" />
                <div className="mt-1.5 text-[10.5px] font-semibold text-snp-navy-600 text-center truncate">{l.label}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-snp-navy-400">Primary logo is composited onto products. {store.settings.logoPicker ? 'Shoppers can switch logos per item at order time.' : 'Enable the logo picker in Settings to let shoppers choose.'}</p>
        </div>

        <div className={`${card} p-5 space-y-4`}>
          <span className="text-[15px] font-bold text-snp-navy-950 block">Storefront copy</span>
          <div>
            <label className={label}>Hero headline</label>
            <input className={input} value={store.heroHeadline} onChange={e => updateStore(store.id, { heroHeadline: e.target.value })} />
          </div>
          <div>
            <label className={label}>Hero subtitle</label>
            <textarea
              className="w-full px-3.5 py-2.5 bg-white rounded-[10px] border border-snp-navy-200 text-[13.5px] text-snp-navy-950 outline-none focus:border-snp-indigo-500 resize-none"
              rows={2}
              value={store.heroSub}
              onChange={e => updateStore(store.id, { heroSub: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Announcement bar</label>
            <input className={input} value={store.announcement} onChange={e => updateStore(store.id, { announcement: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className={`${card} overflow-hidden sticky top-24`}>
        <div className="px-5 py-3 flex items-center justify-between border-b border-snp-navy-100">
          <span className="text-[13px] font-bold text-snp-navy-950">Live preview</span>
          <button onClick={() => window.open(`/store/${store.slug}`, '_blank')} className="text-[12px] font-semibold text-snp-indigo-700 flex items-center gap-1">
            Open storefront <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div style={{ background: theme.colors.bg, fontFamily: theme.fontBody }}>
          <div className="text-center text-[9px] py-1" style={{ background: theme.colors.primary, color: theme.colors.primaryInk }}>{store.announcement}</div>
          <div className="h-11 flex items-center px-4 gap-2.5" style={{ background: theme.colors.headerBg, borderBottom: `1px solid ${theme.colors.border}` }}>
            <StoreLogo store={store} size={22} rounded={4} />
            <span className="text-[11px] font-bold" style={{ color: theme.colors.headerInk, fontFamily: theme.fontDisplay, textTransform: theme.displayTransform }}>
              {store.clientName}
            </span>
            <div className="ml-auto flex gap-3 text-[9px] font-semibold" style={{ color: theme.colors.headerInk, opacity: 0.75 }}>
              <span>Shop</span><span>Collections</span><span>About</span>
            </div>
          </div>
          <div className="px-6 py-8" style={{ background: theme.colors.heroBg }}>
            <div
              className="text-[24px] leading-[1.05] mb-2"
              style={{ color: theme.colors.heroInk, fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform, letterSpacing: theme.displayTracking }}
            >
              {store.heroHeadline}
            </div>
            <div className="text-[10.5px] leading-relaxed mb-4 max-w-[280px]" style={{ color: theme.colors.heroInk, opacity: 0.72 }}>{store.heroSub}</div>
            <span className="inline-block text-[10.5px] font-bold px-4 py-2" style={{ background: theme.colors.primary, color: theme.colors.primaryInk, borderRadius: theme.radius }}>
              Shop the collection
            </span>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2.5">
            {storeProducts(store).filter(p => !store.hiddenIds.includes(p.id)).slice(0, 6).map(p => (
              <div key={p.id} className="overflow-hidden" style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius }}>
                <StoreProductImage product={p} logoSrc={storeLogoSrc(store)} className="h-16 p-1.5 bg-white" />
                <div className="px-2 py-1.5">
                  <div className="text-[8px] font-semibold truncate" style={{ color: theme.colors.ink }}>{p.name}</div>
                  <div className="text-[8.5px] font-bold" style={{ color: theme.colors.primary }}>{fmtMoney(retailPrice(store, p))}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Orders ────────────────────────────────────────────────────────────────────

function OrdersTab({ store }: { store: DistributorStore }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <span className="text-[15px] font-bold text-snp-navy-950 block">Orders</span>
          <span className="text-[12px] text-snp-navy-400">Each order routes to SanMar under your account #DIST-88412 for fulfillment & invoicing</span>
        </div>
        <button
          onClick={() => alert('Order export (CSV) — demo')}
          className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>
      {store.orders.length === 0 ? (
        <p className="text-[13px] text-snp-navy-400 py-14 text-center">No orders yet.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10.5px] font-bold uppercase tracking-wider text-snp-navy-400 border-y border-snp-navy-100 bg-snp-navy-50/50">
              <th className="py-2.5 pl-5">Order</th><th className="py-2.5">Date</th><th className="py-2.5">Customer</th>
              <th className="py-2.5 text-right">Items</th><th className="py-2.5 text-right">Total</th>
              <th className="py-2.5 text-right">Your margin</th><th className="py-2.5 pl-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {store.orders.map(o => (
              <tr key={o.id} className="border-b border-snp-navy-50 last:border-0 text-[13px] hover:bg-snp-indigo-50/30">
                <td className="py-3 pl-5 font-bold text-snp-navy-950">#{o.id}</td>
                <td className="py-3 text-snp-navy-500">{o.date}</td>
                <td className="py-3 text-snp-navy-800 font-medium">{o.customer}</td>
                <td className="py-3 text-right text-snp-navy-700">{o.items}</td>
                <td className="py-3 text-right font-semibold text-snp-navy-950">{fmtMoney(o.total)}</td>
                <td className="py-3 text-right font-bold text-emerald-600">{fmtMoney(o.margin)}</td>
                <td className="py-3 pl-6"><OrderStatus status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────

function SettingsTab({ store }: { store: DistributorStore }) {
  const { updateStore, duplicateStore, removeStore } = useStores();
  const navigate = useNavigate();
  const radioCard = (active: boolean) =>
    `flex-1 rounded-[14px] border-2 p-4 text-left cursor-pointer transition-all ${active ? 'border-snp-indigo-600 bg-snp-indigo-50/40' : 'border-snp-navy-200 bg-white hover:border-snp-navy-300'}`;

  return (
    <div className="max-w-2xl space-y-5">
      <div className={`${card} p-5 space-y-4`}>
        <span className="text-[15px] font-bold text-snp-navy-950 block">Store URL</span>
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] text-snp-navy-500 font-medium">snappy.store/</span>
          <input className={input} style={{ maxWidth: 260 }} value={store.slug}
            onChange={e => updateStore(store.id, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
        </div>
      </div>

      <div className={`${card} p-5`}>
        <span className="text-[15px] font-bold text-snp-navy-950 block mb-1">Who can shop</span>
        <p className="text-[12px] text-snp-navy-500 mb-4">Public stores are open to anyone with the link. Passcode-gated stores ask for a shared code first.</p>
        <div className="flex gap-3">
          <button className={radioCard(store.settings.access === 'public')} onClick={() => updateStore(store.id, s => ({ settings: { ...s.settings, access: 'public' } }))}>
            <div className="text-[13.5px] font-bold text-snp-navy-950 mb-0.5">Public</div>
            <div className="text-[11.5px] text-snp-navy-500">Anyone with the link can browse & buy</div>
          </button>
          <button className={radioCard(store.settings.access === 'passcode')} onClick={() => updateStore(store.id, s => ({ settings: { ...s.settings, access: 'passcode', passcode: s.settings.passcode ?? 'WELCOME' } }))}>
            <div className="text-[13.5px] font-bold text-snp-navy-950 mb-0.5">Passcode</div>
            <div className="text-[11.5px] text-snp-navy-500">Requires a shared access code</div>
          </button>
        </div>
        {store.settings.access === 'passcode' && (
          <div className="mt-3">
            <label className={label}>Access code</label>
            <input className={input} style={{ maxWidth: 200 }} value={store.settings.passcode ?? ''}
              onChange={e => updateStore(store.id, s => ({ settings: { ...s.settings, passcode: e.target.value.toUpperCase() } }))} />
          </div>
        )}
      </div>

      <div className={`${card} p-5`}>
        <span className="text-[15px] font-bold text-snp-navy-950 block mb-1">Payment</span>
        <p className="text-[12px] text-snp-navy-500 mb-4">How shoppers pay at checkout. Wholesale cost routes to SanMar, decoration to the printer, your margin to you.</p>
        <div className="flex gap-3">
          {([
            ['card', 'Credit card', 'Guest checkout via Stripe'],
            ['points', 'Points', 'Pre-funded allowances per shopper'],
            ['mixed', 'Points + card', 'Points first, card tops up the rest'],
          ] as const).map(([mode, title, desc]) => (
            <button key={mode} className={radioCard(store.settings.payment === mode)} onClick={() => updateStore(store.id, s => ({ settings: { ...s.settings, payment: mode } }))}>
              <div className="text-[13.5px] font-bold text-snp-navy-950 mb-0.5">{title}</div>
              <div className="text-[11.5px] text-snp-navy-500">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={`${card} p-5 space-y-4`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="accent-[#2563eb] w-4 h-4 mt-0.5" checked={store.settings.bulkOrdering}
            onChange={e => updateStore(store.id, s => ({ settings: { ...s.settings, bulkOrdering: e.target.checked } }))} />
          <span>
            <span className="block text-[13.5px] font-bold text-snp-navy-950">Bulk ordering grid</span>
            <span className="block text-[12px] text-snp-navy-500">Quantity-per-size grid on product pages — for coaches and office managers ordering for groups.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="accent-[#2563eb] w-4 h-4 mt-0.5" checked={store.settings.logoPicker}
            onChange={e => updateStore(store.id, s => ({ settings: { ...s.settings, logoPicker: e.target.checked } }))} />
          <span>
            <span className="block text-[13.5px] font-bold text-snp-navy-950">Shopper logo picker</span>
            <span className="block text-[12px] text-snp-navy-500">Let shoppers choose which of the store's logos gets applied to their item.</span>
          </span>
        </label>
      </div>

      <div className={`${card} p-5`}>
        <span className="text-[15px] font-bold text-snp-navy-950 block mb-4">Store actions</span>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { const c = duplicateStore(store.id); if (c) navigate(`/stores/${c.id}`); }}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate as template
          </button>
          {store.status !== 'draft' && (
            <button
              onClick={() => updateStore(store.id, { status: store.status === 'paused' ? 'live' : 'paused' })}
              className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50"
            >
              <Pause className="w-3.5 h-3.5" /> {store.status === 'paused' ? 'Resume store' : 'Pause store'}
            </button>
          )}
          <button
            onClick={() => { if (confirm(`Archive "${store.name}"? Order data is exported first.`)) { removeStore(store.id); navigate('/stores'); } }}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-red-200 bg-white text-[13px] font-semibold text-snp-red-600 hover:bg-snp-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Archive store
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

export function StoreManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { getStore, updateStore } = useStores();
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);
  const [justCreated, setJustCreated] = useState(params.get('created') === '1');

  const store = id ? getStore(id) : undefined;
  if (!store) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="text-[15px] text-snp-navy-600">Store not found.</p>
        <button onClick={() => navigate('/stores')} className="text-snp-indigo-700 font-semibold text-[14px]">← Back to stores</button>
      </div>
    );
  }

  const url = `${window.location.origin}/store/${store.slug}`;

  return (
    <div className="min-h-screen bg-background pb-24" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Header ── */}
      <div className="bg-white border-b border-snp-navy-200">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-6">
          <button onClick={() => navigate('/stores')} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-snp-navy-500 hover:text-snp-navy-800 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> All stores
          </button>

          {justCreated && (
            <div className="mb-4 flex items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] font-medium" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
              <Sparkles className="w-4 h-4" />
              Store generated! Review products and pricing, then hit <b>Publish</b> to take it live.
              <button className="ml-auto" onClick={() => setJustCreated(false)}><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-[14px] border border-snp-navy-200 bg-snp-navy-50 flex items-center justify-center p-1.5">
              <StoreLogo store={store} size={44} rounded={8} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[26px] text-snp-navy-950 leading-tight truncate" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}>
                  {store.name}
                </h1>
                <StoreStatusPill status={store.status} size="md" />
              </div>
              <div className="flex items-center gap-2 text-[12.5px] text-snp-navy-500">
                <span>{store.clientName} · {store.clientType}</span>
                <span className="text-snp-navy-300">•</span>
                <button
                  onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                  className="flex items-center gap-1 font-semibold text-snp-indigo-700 hover:text-snp-indigo-800"
                >
                  snappy.store/{store.slug} {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <button
                onClick={() => window.open(`/store/${store.slug}`, '_blank')}
                className="flex items-center gap-2 h-11 px-5 rounded-[12px] border border-snp-navy-200 bg-white text-[13.5px] font-semibold text-snp-navy-800 hover:bg-snp-navy-50"
              >
                <ExternalLink className="w-4 h-4" /> View store
              </button>
              {store.status === 'live' ? (
                <button
                  onClick={() => updateStore(store.id, { status: 'paused' })}
                  className="flex items-center gap-2 h-11 px-5 rounded-[12px] border border-snp-navy-200 bg-white text-[13.5px] font-semibold text-snp-navy-800 hover:bg-snp-navy-50"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={() => updateStore(store.id, { status: 'live' })}
                  className="flex items-center gap-2 h-11 px-6 rounded-[12px] text-white text-[13.5px] font-bold shadow-[0px_8px_20px_rgba(5,150,105,0.35)] hover:opacity-90"
                  style={{ background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' }}
                >
                  <Rocket className="w-4 h-4" /> Publish store
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-end gap-1 mt-5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`h-11 px-4 text-[13.5px] font-semibold transition-colors relative ${
                  tab === t.id ? 'text-snp-navy-950' : 'text-snp-navy-500 hover:text-snp-navy-800'
                }`}
              >
                {t.label}
                {tab === t.id && <span className="absolute left-2 right-2 bottom-0 h-[2.5px] bg-snp-navy-950 rounded-t" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-6">
        {tab === 'overview' && <OverviewTab store={store} />}
        {tab === 'products' && <ProductsTab store={store} />}
        {tab === 'pricing' && <PricingTab store={store} />}
        {tab === 'design' && <DesignTab store={store} />}
        {tab === 'orders' && <OrdersTab store={store} />}
        {tab === 'settings' && <SettingsTab store={store} />}
      </div>
    </div>
  );
}
