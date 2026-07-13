import { useState, useMemo } from 'react';
import { X, ExternalLink, ChevronDown, Package, Search, Download, Send } from 'lucide-react';
import { SHIPMENTS, INVENTORY_ITEMS, type Shipment, type ShipmentStatus, type InventoryItem } from '../data/mockData';
import { SwagPageHeader, YourSwagSidebar } from './SwagOverview';

// ── Shipment status config ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; bg: string; border: string }> = {
  processing:  { label: 'Processing',  color: 'var(--snp-indigo-700)', bg: 'var(--snp-indigo-50)',  border: '#bfdbfe' },
  processed:   { label: 'Processed',   color: '#16a34a',               bg: '#f0fdf4',               border: '#bbf7d0' },
  canceled:    { label: 'Canceled',    color: 'var(--snp-navy-500)',   bg: 'var(--snp-navy-50)',    border: 'var(--snp-navy-200)' },
  'in-transit':{ label: 'In Transit',  color: '#0d9488',               bg: '#f0fdfa',               border: '#99f6e4' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const st = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ color: st.color, backgroundColor: st.bg, borderColor: st.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: st.color }} />
      {st.label}
    </span>
  );
}

function inventorySummary(item: InventoryItem): { text: string; outOfStock: boolean; low: boolean } {
  const total = item.sizes.reduce((s, sz) => s + sz.qty, 0);
  if (total === 0) return { text: '', outOfStock: true, low: false };
  const low = total <= 5;
  if (item.sizes.length === 1) return { text: `${item.sizes[0].size}: ${item.sizes[0].qty}`, outOfStock: false, low };
  const parts = item.sizes.filter(sz => sz.qty > 0).map(sz => `${sz.size}: ${sz.qty}`).join(' · ');
  return { text: parts || '', outOfStock: false, low };
}

// ── Shipment details modal ─────────────────────────────────────────────────────

function ShipmentModal({ shipment, onClose, onCancel }: {
  shipment: Shipment;
  onClose: () => void;
  onCancel: () => void;
}) {
  const { recipient: r } = shipment;
  const addressLines = [r.address, [r.city, r.state, r.zip].filter(Boolean).join(', '), r.country].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-white rounded-[24px] w-full max-w-[540px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-[#f0f4f8]">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[18px] font-bold text-snp-navy-950 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Shipment Details
            </h2>
            <p className="text-[13px] text-snp-navy-600">{shipment.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={shipment.status} />
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0">
              <X className="w-4 h-4 text-snp-navy-500" />
            </button>
          </div>
        </div>

        <div className="px-7 py-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-3">Shipment Address</p>
            <div className="bg-snp-navy-50 rounded-[14px] p-4 flex flex-col gap-0.5">
              {addressLines.map((line, i) => (
                <p key={i} className={`text-[14px] ${i === 0 ? 'font-semibold text-snp-navy-950' : 'text-snp-navy-600'}`}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-3">Contact Details</p>
            <div className="bg-snp-navy-50 rounded-[14px] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-snp-navy-500">Name</span>
                <span className="text-[13px] font-medium text-snp-navy-700">{r.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-snp-navy-500">Email</span>
                <a href={`mailto:${r.email}`} className="text-[13px] font-medium text-snp-indigo-600 hover:underline">{r.email}</a>
              </div>
              {r.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-snp-navy-500">Phone</span>
                  <span className="text-[13px] font-medium text-snp-navy-700">{r.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-3">Tracking</p>
            <div className="border border-snp-navy-200 rounded-[14px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-snp-navy-50 border-b border-snp-navy-200">
                    {['Carrier', 'Tracking Number', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 text-[13px] font-medium text-snp-navy-700">{shipment.carrier ?? <span className="text-[#c0cdd9]">—</span>}</td>
                    <td className="px-4 py-3">
                      {shipment.trackingNumber ? (
                        <a href={shipment.carrierUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[13px] font-medium text-snp-indigo-600 hover:underline">
                          {shipment.trackingNumber}<ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : <span className="text-[13px] text-[#c0cdd9]">Pending</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={shipment.status} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-3">Items</p>
            <div className="border border-snp-navy-200 rounded-[14px] overflow-hidden">
              {shipment.items.map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < shipment.items.length - 1 ? 'border-b border-[#f0f4f8]' : ''}`}>
                  <span className="text-[13px] text-snp-navy-700">{item.name}</span>
                  <span className="text-[12px] font-semibold text-snp-navy-600">×{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-7 py-5 border-t border-[#f0f4f8] flex items-center justify-between gap-3">
          {shipment.status === 'processing' ? (
            <button onClick={onCancel} className="h-9 px-4 rounded-[10px] border border-[#fca5a5] text-snp-red-500 text-[13px] font-semibold hover:bg-[#fef2f2] transition-colors">
              Cancel Shipment
            </button>
          ) : <div />}
          <button onClick={onClose} className="h-9 px-5 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[13px] font-medium hover:bg-snp-navy-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inventory section ──────────────────────────────────────────────────────────

function InventorySection() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? INVENTORY_ITEMS.filter(i => i.name.toLowerCase().includes(q)) : INVENTORY_ITEMS;
  }, [search]);

  const allSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const next = new Set(prev); filtered.forEach(i => next.delete(i.id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); filtered.forEach(i => next.add(i.id)); return next; });
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  return (
    <div className="py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Section header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Swag Inventory</h2>
          <p className="text-[13px] text-snp-navy-500 mt-1">
            Review your branded items inventory. Want to order more?{' '}
            <button className="text-snp-indigo-600 font-medium hover:underline">Talk to us</button>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={selected.size === 0}
            className="flex items-center gap-2 h-9 px-4 rounded-[10px] border border-snp-navy-200 text-snp-navy-700 text-[13px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" /> Ship Items
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-[10px] border border-snp-navy-200 text-snp-navy-700 text-[13px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="border border-snp-navy-200 rounded-[20px] overflow-hidden">
        {/* Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-snp-navy-50 border-b border-snp-navy-200">
          <p className="text-[13px] text-snp-navy-600">
            Showing <span className="font-semibold text-snp-navy-950">{filtered.length}/{INVENTORY_ITEMS.length}</span> items
          </p>
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search item…"
              className="w-full h-8 pl-9 pr-3 text-[13px] border border-snp-navy-200 rounded-[8px] focus:outline-none focus:border-snp-indigo-600 text-snp-navy-950 placeholder:text-snp-navy-400 bg-white transition-colors"
            />
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[56px_80px_1fr_260px] bg-white border-b border-snp-navy-200">
          <div className="px-4 py-3 flex items-center">
            <div
              onClick={toggleAll}
              className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center cursor-pointer transition-colors ${allSelected ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'border-snp-navy-300 bg-white hover:border-snp-indigo-600'}`}
            >
              {allSelected && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          </div>
          <div className="px-3 py-3 text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">Image</div>
          <div className="px-4 py-3 text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-snp-navy-700">
            Item <ChevronDown className="w-3 h-3" />
          </div>
          <div className="px-4 py-3 text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">Inventory per size</div>
        </div>

        {/* Rows */}
        {filtered.map((item, i) => {
          const { text, outOfStock, low } = inventorySummary(item);
          const isSelected = selected.has(item.id);
          return (
            <div
              key={item.id}
              className={`grid grid-cols-[56px_80px_1fr_260px] items-center transition-colors ${isSelected ? 'bg-snp-indigo-50' : 'hover:bg-[#fafcff]'} ${i < filtered.length - 1 ? 'border-b border-[#f0f4f8]' : ''}`}
            >
              <div className="px-4 py-4 flex items-center">
                <div
                  onClick={() => toggleOne(item.id)}
                  className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'border-snp-navy-300 bg-white hover:border-snp-indigo-600'}`}
                >
                  {isSelected && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
              <div className="px-3 py-3">
                <div className="w-12 h-12 rounded-[10px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center overflow-hidden">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1.5" style={{ mixBlendMode: 'multiply' }} />
                </div>
              </div>
              <div className="px-4 py-4">
                <p className="text-[14px] font-medium text-snp-navy-950">{item.name}</p>
              </div>
              <div className="px-4 py-4">
                {outOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[#fca5a5] bg-[#fef2f2] text-snp-red-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-snp-red-500 inline-block" />
                    Out Of Stock
                  </span>
                ) : (
                  <span className={`text-[13px] font-medium ${low ? 'text-snp-amber-600' : 'text-snp-navy-700'}`}>
                    {text}
                    {low && <span className="ml-2 text-[11px] text-snp-amber-500 font-semibold">(Low)</span>}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shipments history section ──────────────────────────────────────────────────

function ShipmentsSection() {
  const [data, setData] = useState<Shipment[]>(SHIPMENTS);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      const q = search.trim().toLowerCase();
      if (q && !s.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, statusFilter, search]);

  function handleCancel(id: string) {
    setData(prev => prev.map(s => s.id === id ? { ...s, status: 'canceled' as ShipmentStatus } : s));
    setCancelConfirm(null);
    setDetailShipment(prev => prev?.id === id ? { ...prev, status: 'canceled' } : prev);
  }

  return (
    <div className="pb-16" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Shipment History</h2>
        <p className="text-[13px] text-snp-navy-500 mt-1">Review your shipments and track their status.</p>
      </div>

      {/* Table card */}
      <div className="border border-snp-navy-200 rounded-[20px] overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-snp-navy-50 border-b border-snp-navy-200">
          {/* Status dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              className="flex items-center gap-2 h-8 px-3 bg-white border border-snp-navy-200 rounded-[8px] text-[13px] font-medium text-snp-navy-700 hover:border-snp-indigo-600 transition-colors"
            >
              {statusFilter === 'all' ? 'All statuses' : STATUS_CONFIG[statusFilter].label}
              <ChevronDown className="w-3.5 h-3.5 text-snp-navy-400" />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full mt-1.5 bg-white border border-snp-navy-200 rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[160px] py-1.5 left-0">
                {(['all', 'processing', 'in-transit', 'processed', 'canceled'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowStatusMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 transition-colors ${statusFilter === s ? 'text-snp-indigo-600 font-semibold' : 'text-snp-navy-700'}`}
                  >
                    {s === 'all' ? 'All statuses' : STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-[13px] text-snp-navy-600">
            Showing <span className="font-semibold text-snp-navy-950">{filtered.length}/{data.length}</span> shipments
          </p>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shipment…"
              className="w-full h-8 pl-9 pr-3 text-[13px] border border-snp-navy-200 rounded-[8px] focus:outline-none focus:border-snp-indigo-600 text-snp-navy-950 placeholder:text-snp-navy-400 bg-white transition-colors"
            />
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_160px_160px_180px] bg-white border-b border-snp-navy-200">
          {['Description', 'Request Date', 'Status', 'Actions'].map(h => (
            <div key={h} className="px-5 py-3 text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-[16px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-snp-navy-400" />
            </div>
            <p className="text-[15px] font-semibold text-snp-navy-700 mb-1">No shipments found</p>
            <p className="text-[13px] text-snp-navy-500">Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map((shipment, i) => (
            <div
              key={shipment.id}
              className={`grid grid-cols-[1fr_160px_160px_180px] items-center hover:bg-[#fafcff] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#f0f4f8]' : ''}`}
            >
              <div className="px-5 py-3.5">
                <p className="text-[14px] font-medium text-snp-navy-950 truncate">{shipment.description}</p>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-[13px] text-snp-navy-600">
                  {new Date(shipment.requestDate + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                </p>
              </div>
              <div className="px-5 py-3.5">
                <StatusBadge status={shipment.status} />
              </div>
              <div className="px-5 py-3.5 flex items-center gap-2">
                {shipment.status === 'processing' && (
                  <button
                    onClick={() => setCancelConfirm(shipment.id)}
                    className="h-7 px-3 rounded-[7px] border border-[#fca5a5] text-snp-red-500 text-[12px] font-medium hover:bg-[#fef2f2] transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => setDetailShipment(shipment)}
                  className="h-7 px-3 rounded-[7px] border border-snp-navy-200 text-snp-navy-600 text-[12px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors whitespace-nowrap"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancel confirm modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setCancelConfirm(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-[380px] p-7 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-11 h-11 rounded-[12px] bg-[#fef2f2] flex items-center justify-center mb-5">
              <X className="w-5 h-5 text-snp-red-500" />
            </div>
            <h3 className="text-[18px] font-bold text-snp-navy-950 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>Cancel Shipment?</h3>
            <p className="text-[14px] text-snp-navy-600 mb-6 leading-relaxed">
              This shipment is still processing. Canceling it will stop fulfillment. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 h-10 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[13px] font-medium hover:bg-snp-navy-50 transition-colors">
                Keep Shipment
              </button>
              <button onClick={() => handleCancel(cancelConfirm)} className="flex-1 h-10 rounded-[10px] bg-snp-red-500 text-white text-[13px] font-semibold hover:opacity-90 transition-opacity">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {detailShipment && (
        <ShipmentModal
          shipment={detailShipment}
          onClose={() => setDetailShipment(null)}
          onCancel={() => setCancelConfirm(detailShipment.id)}
        />
      )}
    </div>
  );
}

// ── Pages ──────────────────────────────────────────────────────────────────────

export function Inventory() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="your-swag" />
      <div className="max-w-[1400px] mx-auto px-4 md:pl-[80px] md:pr-[40px] pt-8 pb-16">
        <div className="flex gap-8">
          <YourSwagSidebar active="inventory" />
          <div className="flex-1">
            <InventorySection />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Shipments() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="your-swag" />
      <div className="max-w-[1400px] mx-auto px-4 md:pl-[80px] md:pr-[40px] pt-8 pb-16">
        <div className="flex gap-8">
          <YourSwagSidebar active="shipments" />
          <div className="flex-1">
            <ShipmentsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
