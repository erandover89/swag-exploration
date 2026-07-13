import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, ExternalLink, Copy, Pause, Play, Archive, MoreHorizontal,
  Store as StoreIcon, DollarSign, TrendingUp, ShoppingCart, ChevronDown, X, Pencil,
} from 'lucide-react';
import { useStores } from '../../context/StoresContext';
import { SwagPageHeader } from '../SwagOverview';
import { StoreLogo, StoreStatusPill } from '../../components/stores/StoreBits';
import { fmtMoney, type ClientType, type DistributorStore, type StoreStatus } from '../../data/storesData';

const CLIENT_TYPES: (ClientType | 'All')[] = ['All', 'Team Sports', 'Cafe & Retail', 'Corporate', 'Education', 'Nonprofit'];
const STATUS_FILTERS: { id: StoreStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All stores' },
  { id: 'live', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'paused', label: 'Paused' },
];

type SortKey = 'updated' | 'revenue' | 'orders' | 'name';

function KpiCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub: string; accent: string;
}) {
  return (
    <div className="flex-1 bg-white rounded-[18px] border border-snp-navy-200 p-5 shadow-[0px_4px_12px_rgba(1,39,84,0.05)]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: `${accent}14`, color: accent }}>
          {icon}
        </div>
        <span className="text-[12px] font-semibold text-snp-navy-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-[28px] font-bold text-snp-navy-950 leading-none mb-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
        {value}
      </div>
      <div className="text-[12px] text-snp-navy-500">{sub}</div>
    </div>
  );
}

function RowMenu({ store, onClose }: { store: DistributorStore; onClose: () => void }) {
  const navigate = useNavigate();
  const { duplicateStore, updateStore, removeStore } = useStores();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const item = 'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-snp-navy-800 hover:bg-snp-navy-50 text-left transition-colors';

  return (
    <div ref={ref} className="absolute right-0 top-9 z-30 w-52 bg-white rounded-[12px] border border-snp-navy-200 shadow-[0px_12px_32px_rgba(1,39,84,0.16)] py-1.5 overflow-hidden">
      <button className={item} onClick={() => { navigate(`/stores/${store.id}`); onClose(); }}>
        <Pencil className="w-3.5 h-3.5 text-snp-navy-400" /> Edit store
      </button>
      <button className={item} onClick={() => { window.open(`/store/${store.slug}`, '_blank'); onClose(); }}>
        <ExternalLink className="w-3.5 h-3.5 text-snp-navy-400" /> View storefront
      </button>
      <button
        className={item}
        onClick={() => {
          const copy = duplicateStore(store.id);
          onClose();
          if (copy) navigate(`/stores/${copy.id}`);
        }}
      >
        <Copy className="w-3.5 h-3.5 text-snp-navy-400" /> Duplicate as template
      </button>
      {store.status !== 'draft' && (
        <button
          className={item}
          onClick={() => { updateStore(store.id, { status: store.status === 'paused' ? 'live' : 'paused' }); onClose(); }}
        >
          {store.status === 'paused'
            ? <><Play className="w-3.5 h-3.5 text-snp-navy-400" /> Resume store</>
            : <><Pause className="w-3.5 h-3.5 text-snp-navy-400" /> Pause store</>}
        </button>
      )}
      <div className="h-px bg-snp-navy-100 my-1" />
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-snp-red-600 hover:bg-snp-red-50 text-left transition-colors"
        onClick={() => {
          if (confirm(`Archive "${store.name}"? Order history is exported before retirement.`)) removeStore(store.id);
          onClose();
        }}
      >
        <Archive className="w-3.5 h-3.5" /> Archive store
      </button>
    </div>
  );
}

export function StoresConsole() {
  const navigate = useNavigate();
  const { stores, updateStore } = useStores();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StoreStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ClientType | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = stores;
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (typeFilter !== 'All') list = list.filter(s => s.clientType === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) || s.clientName.toLowerCase().includes(q) || s.slug.includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'revenue') return b.stats.revenue30d - a.stats.revenue30d;
      if (sortKey === 'orders') return b.stats.orders30d - a.stats.orders30d;
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [stores, statusFilter, typeFilter, query, sortKey]);

  const totals = useMemo(() => ({
    live: stores.filter(s => s.status === 'live').length,
    revenue: stores.reduce((a, s) => a + s.stats.revenue30d, 0),
    margin: stores.reduce((a, s) => a + s.stats.margin30d, 0),
    orders: stores.reduce((a, s) => a + s.stats.orders30d, 0),
  }), [stores]);

  const toggleSelect = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));

  return (
    <div className="min-h-screen bg-background pb-24" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="stores" />
      {/* ── Console header ── */}
      <div className="bg-white border-b border-snp-navy-200">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-6 pb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-[24px] text-snp-navy-950 leading-none" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}>
                  Your storefronts
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: '#eef2ff', color: '#4338ca' }}>
                  SanMar Distributor Edition
                </span>
              </div>
              <p className="text-[14px] text-snp-navy-600">
                Create, brand and run storefronts for every customer — pricing and margins stay in your control.
              </p>
            </div>
            <button
              onClick={() => navigate('/stores/new')}
              className="flex items-center gap-2 h-12 px-6 rounded-[14px] text-white text-[14px] font-semibold shadow-[0px_8px_20px_rgba(48,119,201,0.35)] hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <Plus className="w-4 h-4" /> Create store
            </button>
          </div>

          {/* KPIs */}
          <div className="flex gap-4 mt-6 flex-wrap">
            <KpiCard icon={<StoreIcon className="w-4 h-4" />} label="Live stores" value={String(totals.live)} sub={`${stores.length} total across your book`} accent="#2563eb" />
            <KpiCard icon={<DollarSign className="w-4 h-4" />} label="Storefront sales" value={`$${totals.revenue.toLocaleString()}`} sub="Last 30 days, all stores" accent="#059669" />
            <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Your margin" value={`$${totals.margin.toLocaleString()}`} sub="Markup earned on top of SanMar cost" accent="#7c3aed" />
            <KpiCard icon={<ShoppingCart className="w-4 h-4" />} label="Orders" value={String(totals.orders)} sub="Last 30 days" accent="#ea580c" />
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-[12px] border border-snp-navy-200 p-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`h-9 px-4 rounded-[9px] text-[13px] font-semibold transition-colors ${
                  statusFilter === f.id ? 'bg-snp-navy-950 text-white' : 'text-snp-navy-600 hover:bg-snp-navy-50'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 text-[11px] ${statusFilter === f.id ? 'text-white/60' : 'text-snp-navy-400'}`}>
                  {f.id === 'all' ? stores.length : stores.filter(s => s.status === f.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Client type dropdown */}
          <div className="relative">
            <button
              onClick={() => setTypeOpen(o => !o)}
              className="flex items-center gap-2 h-11 px-4 bg-white rounded-[12px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-800"
            >
              {typeFilter === 'All' ? 'All customer types' : typeFilter}
              <ChevronDown className="w-3.5 h-3.5 text-snp-navy-400" />
            </button>
            {typeOpen && (
              <div className="absolute left-0 top-12 z-30 w-52 bg-white rounded-[12px] border border-snp-navy-200 shadow-[0px_12px_32px_rgba(1,39,84,0.16)] py-1.5">
                {CLIENT_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setTypeOpen(false); }}
                    className={`w-full px-3 py-2 text-[13px] text-left hover:bg-snp-navy-50 ${typeFilter === t ? 'font-bold text-snp-indigo-700' : 'font-medium text-snp-navy-800'}`}
                  >
                    {t === 'All' ? 'All customer types' : t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search stores or customers…"
              className="w-full h-11 pl-10 pr-4 bg-white rounded-[12px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-snp-navy-400 outline-none focus:border-snp-indigo-500"
            />
          </div>

          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="h-11 px-3 bg-white rounded-[12px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700 outline-none"
          >
            <option value="updated">Recently updated</option>
            <option value="revenue">Highest sales</option>
            <option value="orders">Most orders</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* ── Bulk actions bar ── */}
        {selected.size > 0 && (
          <div className="mt-4 flex items-center gap-3 bg-snp-navy-950 text-white rounded-[14px] px-5 h-14 shadow-[0px_12px_28px_rgba(1,39,84,0.3)]">
            <span className="text-[13px] font-semibold">{selected.size} selected</span>
            <div className="w-px h-5 bg-white/20" />
            <button
              className="text-[13px] font-semibold text-white/85 hover:text-white flex items-center gap-1.5"
              onClick={() => { selected.forEach(id => updateStore(id, { status: 'live' })); setSelected(new Set()); }}
            >
              <Play className="w-3.5 h-3.5" /> Publish
            </button>
            <button
              className="text-[13px] font-semibold text-white/85 hover:text-white flex items-center gap-1.5"
              onClick={() => { selected.forEach(id => updateStore(id, { status: 'paused' })); setSelected(new Set()); }}
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
            <button
              className="text-[13px] font-semibold text-white/85 hover:text-white flex items-center gap-1.5"
              onClick={() => alert('Rebrand across selected stores — swap logos, colors and themes in one pass. (Demo)')}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Bulk rebrand
            </button>
            <button className="ml-auto text-white/60 hover:text-white" onClick={() => setSelected(new Set())}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Stores table ── */}
        <div className="mt-4 bg-white rounded-[18px] border border-snp-navy-200 overflow-visible shadow-[0px_4px_12px_rgba(1,39,84,0.05)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-snp-navy-100 text-[11px] font-bold uppercase tracking-wider text-snp-navy-400">
                <th className="pl-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map(s => s.id)))}
                    className="accent-[#2563eb] w-3.5 h-3.5"
                  />
                </th>
                <th className="py-3">Store</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Items</th>
                <th className="py-3 text-right">Markup</th>
                <th className="py-3 text-right">30d sales</th>
                <th className="py-3 text-right">Your margin</th>
                <th className="py-3 text-right pr-3">Orders</th>
                <th className="py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(store => (
                <tr
                  key={store.id}
                  className="border-b border-snp-navy-50 last:border-0 hover:bg-snp-indigo-50/40 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/stores/${store.id}`)}
                >
                  <td className="pl-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(store.id)}
                      onChange={() => toggleSelect(store.id)}
                      className="accent-[#2563eb] w-3.5 h-3.5"
                    />
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] border border-snp-navy-100 bg-snp-navy-50 flex items-center justify-center p-1 shrink-0">
                        <StoreLogo store={store} size={32} rounded={6} />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-snp-navy-950 leading-tight">{store.name}</div>
                        <div className="text-[11.5px] text-snp-navy-400 font-medium">snappy.store/{store.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="text-[13px] font-semibold text-snp-navy-800">{store.clientName}</div>
                    <div className="text-[11.5px] text-snp-navy-400">{store.clientType}</div>
                  </td>
                  <td className="py-3.5"><StoreStatusPill status={store.status} /></td>
                  <td className="py-3.5 text-right text-[13px] font-semibold text-snp-navy-700">{store.productIds.length}</td>
                  <td className="py-3.5 text-right">
                    <span className="text-[12px] font-bold text-snp-purple-700 bg-snp-purple-50 px-2 py-0.5 rounded-md">
                      +{store.pricing.globalMarkupPct}%
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-[13px] font-bold text-snp-navy-950">
                    {store.stats.revenue30d ? `$${store.stats.revenue30d.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 text-right text-[13px] font-bold" style={{ color: store.stats.margin30d ? '#059669' : undefined }}>
                    {store.stats.margin30d ? fmtMoney(store.stats.margin30d) : <span className="text-snp-navy-300">—</span>}
                  </td>
                  <td className="py-3.5 text-right pr-3 text-[13px] font-semibold text-snp-navy-700">
                    {store.stats.orders30d || '—'}
                  </td>
                  <td className="py-3.5 pr-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 relative">
                      <button
                        title="View storefront"
                        onClick={() => window.open(`/store/${store.slug}`, '_blank')}
                        className="w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-500 hover:text-snp-indigo-700 hover:border-snp-indigo-300 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMenuFor(menuFor === store.id ? null : store.id)}
                        className="w-8 h-8 rounded-[8px] border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-500 hover:text-snp-navy-800"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {menuFor === store.id && <RowMenu store={store} onClose={() => setMenuFor(null)} />}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-[14px] text-snp-navy-400">
                    No stores match — try clearing filters, or{' '}
                    <button className="text-snp-indigo-700 font-semibold" onClick={() => navigate('/stores/new')}>create a new store</button>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[12px] text-snp-navy-400">
          Catalog, inventory and pricing sync nightly from SanMar via PromoStandards · Orders route to SanMar under your account number
        </p>
      </div>
    </div>
  );
}
