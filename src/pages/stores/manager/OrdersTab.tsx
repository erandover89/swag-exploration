import { useMemo, useState } from 'react';
import { Check, Download, Package, Search, ShoppingCart, TrendingUp, Truck } from 'lucide-react';
import { fmtMoney, type DistributorStore } from '../../../data/storesData';
import { OrderStatus, card } from './shared';

const ORDER_STATUSES = ['Paid', 'In production', 'Shipped', 'Delivered'] as const;

export function OrdersTab({ store }: { store: DistributorStore }) {
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState<string>('all');

  const thisMonth = new Date().toLocaleString('en-US', { month: 'short' });
  const kpis = useMemo(() => {
    const o = store.orders;
    return [
      { icon: <ShoppingCart className="w-4 h-4" />, label: 'Total orders', value: String(o.length), accent: '#2563eb' },
      { icon: <Package className="w-4 h-4" />, label: 'Open orders', value: String(o.filter(x => x.status === 'Paid' || x.status === 'In production').length), accent: '#ea580c' },
      { icon: <Package className="w-4 h-4" />, label: 'In production', value: String(o.filter(x => x.status === 'In production').length), accent: '#a21caf' },
      { icon: <Truck className="w-4 h-4" />, label: 'Shipped this month', value: String(o.filter(x => x.status === 'Shipped' && x.date.startsWith(thisMonth)).length), accent: '#c2410c' },
      { icon: <Check className="w-4 h-4" />, label: 'Delivered', value: String(o.filter(x => x.status === 'Delivered').length), accent: '#047857' },
      { icon: <TrendingUp className="w-4 h-4" />, label: 'Your margin', value: fmtMoney(o.reduce((a, x) => a + x.margin, 0)), accent: '#7c3aed' },
    ];
  }, [store.orders, thisMonth]);

  const filtered = useMemo(() => {
    let list = store.orders;
    if (orderStatus !== 'all') list = list.filter(o => o.status === orderStatus);
    if (orderQuery.trim()) {
      const q = orderQuery.toLowerCase();
      list = list.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
    }
    return list;
  }, [store.orders, orderStatus, orderQuery]);

  return (
    <div className="space-y-5">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(s => (
          <div key={s.label} className={`${card} p-4`}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: `${s.accent}14`, color: s.accent }}>{s.icon}</div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-snp-navy-400 leading-tight">{s.label}</span>
            </div>
            <div className="text-[24px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
          <span className="text-[15px] font-bold text-snp-navy-950">Orders</span>
          <div className="flex items-center gap-1 bg-snp-navy-50 rounded-[10px] p-1">
            {(['all', ...ORDER_STATUSES] as const).map(s => (
              <button
                key={s}
                onClick={() => setOrderStatus(s)}
                className={`h-8 px-3 rounded-[7px] text-[12px] font-semibold transition-colors ${
                  orderStatus === s ? 'bg-snp-navy-950 text-white' : 'text-snp-navy-600 hover:bg-white'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-400" />
            <input
              value={orderQuery}
              onChange={e => setOrderQuery(e.target.value)}
              placeholder="Search order # or customer…"
              className="w-full h-10 pl-9 pr-3 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-snp-navy-400 outline-none focus:border-snp-indigo-500"
            />
          </div>
          <button
            onClick={() => alert('Order export (CSV) — demo')}
            className="ml-auto flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        {filtered.length === 0 ? (
          <p className="text-[13px] text-snp-navy-400 py-14 text-center">
            {store.orders.length === 0 ? 'No orders yet.' : 'No orders match your search.'}
          </p>
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
              {filtered.map(o => (
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
    </div>
  );
}
