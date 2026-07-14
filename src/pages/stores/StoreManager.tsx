import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Copy, Check, X, Rocket, Pause,
  DollarSign, ShoppingCart, TrendingUp, Users, Sparkles,
} from 'lucide-react';
import { fmtMoney, getStoreTheme, storeProducts, type DistributorStore } from '../../data/storesData';
import { useStores } from '../../context/StoresContext';
import { StoreLogo, StoreProductImage, StoreStatusPill, storeLogoSrc } from '../../components/stores/StoreBits';
import { OrderStatus, card } from './manager/shared';
import { ProductsTab } from './manager/ProductsTab';
import { PricingTab } from './manager/PricingTab';
import { DesignTab } from './manager/DesignTab';
import { OrdersTab } from './manager/OrdersTab';
import { UsersTab } from './manager/UsersTab';
import { SettingsTab } from './manager/SettingsTab';

type Tab = 'overview' | 'products' | 'pricing' | 'design' | 'orders' | 'users' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'pricing', label: 'Pricing & markup' },
  { id: 'design', label: 'Design' },
  { id: 'orders', label: 'Orders' },
  { id: 'users', label: 'Users' },
  { id: 'settings', label: 'Settings' },
];

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewTab({ store }: { store: DistributorStore }) {
  const stats = [
    { icon: <DollarSign className="w-4 h-4" />, label: '30-day sales', value: store.stats.revenue30d ? `$${store.stats.revenue30d.toLocaleString()}` : '$0', accent: '#059669' },
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Your margin', value: store.stats.margin30d ? `$${store.stats.margin30d.toLocaleString()}` : '$0', accent: '#7c3aed' },
    { icon: <ShoppingCart className="w-4 h-4" />, label: 'Orders', value: String(store.stats.orders30d), accent: '#ea580c' },
    { icon: <Users className="w-4 h-4" />, label: 'Visitors', value: store.stats.visitors30d.toLocaleString(), accent: '#2563eb' },
  ];
  const theme = getStoreTheme(store);
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
            <span className="text-[12px] text-snp-navy-400">Last 30 days</span>
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
          <div style={{ background: theme.colors.headerBg, borderBottom: `1px solid ${theme.colors.border}` }} className="h-8 flex items-center px-3 gap-2">
            <StoreLogo store={store} size={16} rounded={3} />
            <span className="text-[9px] font-bold truncate" style={{ color: theme.colors.headerInk, fontFamily: theme.fontDisplay }}>{store.clientName}</span>
          </div>
          <div style={{ background: theme.colors.heroBg }} className="px-4 py-5 relative overflow-hidden">
            {store.bannerImage && (
              <>
                <img src={store.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)' }} />
              </>
            )}
            <div className="relative">
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
                <span>{store.clientName}{store.clientType && ` · ${store.clientType}`}</span>
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
        {tab === 'users' && <UsersTab store={store} />}
        {tab === 'settings' && <SettingsTab store={store} />}
      </div>
    </div>
  );
}
