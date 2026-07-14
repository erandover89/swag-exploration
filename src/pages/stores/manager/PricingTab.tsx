import { useMemo, useState } from 'react';
import { Check, Plus, Shuffle, Tag, Trash2, X } from 'lucide-react';
import {
  STYLE_CODES, baseCost, fmtMoney, retailPrice, storeProducts, unitMargin, validateDiscount,
  type DiscountCode, type DiscountType, type DistributorStore,
} from '../../../data/storesData';
import { useStores } from '../../../context/StoresContext';
import { StoreProductImage, storeLogoSrc } from '../../../components/stores/StoreBits';
import { card, input, label } from './shared';

export function PricingTab({ store }: { store: DistributorStore }) {
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
    <div className="space-y-5">
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
          <p className="text-[12px] text-snp-navy-500 mb-4">On top of your Snappy cost. Per-item overrides win over the global rate.</p>
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
              <th className="py-2.5 text-right">Snappy cost</th>
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
                            const rest = { ...s.pricing.productOverrides };
                            delete rest[p.id];
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

    <DiscountCodesCard store={store} />
    </div>
  );
}

// ── Discount codes ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<DiscountType, string> = { 'fixed': 'Fixed $', 'percent': '% off', 'free-shipping': 'Free shipping' };

function describeCode(c: DiscountCode): string {
  if (c.type === 'fixed') return `$${c.value} off`;
  if (c.type === 'percent') return `${c.value}% off`;
  return 'Free shipping';
}

function DiscountCodesCard({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const [showCreate, setShowCreate] = useState(false);
  const [testInput, setTestInput] = useState('');
  const testResult = testInput.trim() ? validateDiscount(store, testInput) : null;

  const patchCode = (id: string, patch: Partial<DiscountCode>) => {
    updateStore(store.id, s => ({ discountCodes: s.discountCodes.map(c => c.id === id ? { ...c, ...patch } : c) }));
  };

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div>
          <span className="text-[15px] font-bold text-snp-navy-950 flex items-center gap-2"><Tag className="w-4 h-4 text-snp-indigo-700" /> Discount codes</span>
          <p className="text-[12px] text-snp-navy-500 mt-0.5">Shoppers redeem codes at checkout. Codes stack after volume and member discounts.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              placeholder="Test a code…"
              className="h-10 w-40 px-3 bg-white rounded-[10px] border border-snp-navy-200 text-[12.5px] uppercase outline-none focus:border-snp-indigo-500"
            />
            {testResult && (
              <span className={`absolute -bottom-5 left-0 text-[10.5px] font-semibold whitespace-nowrap ${testResult.ok ? 'text-emerald-600' : 'text-snp-red-600'}`}>
                {testResult.ok ? `✓ Valid — ${describeCode(testResult.code)}` : testResult.reason}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <Plus className="w-4 h-4" /> Create code
          </button>
        </div>
      </div>

      {store.discountCodes.length === 0 ? (
        <p className="text-[13px] text-snp-navy-400 py-8 text-center">No discount codes yet — create one to run a promotion.</p>
      ) : (
        <table className="w-full text-left mt-4">
          <thead>
            <tr className="text-[10.5px] font-bold uppercase tracking-wider text-snp-navy-400 border-y border-snp-navy-100 bg-snp-navy-50/50">
              <th className="py-2.5 pl-3">Code</th><th className="py-2.5">Discount</th><th className="py-2.5">Expires</th>
              <th className="py-2.5 text-right">Uses</th><th className="py-2.5 pl-6">Scope</th><th className="py-2.5 text-center">Active</th><th className="py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {store.discountCodes.map(c => (
              <tr key={c.id} className={`border-b border-snp-navy-50 last:border-0 text-[13px] ${!c.active ? 'opacity-50' : ''}`}>
                <td className="py-3 pl-3 font-mono font-bold text-snp-navy-950">{c.code}</td>
                <td className="py-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-snp-indigo-50 text-snp-indigo-700">{describeCode(c)}</span>
                </td>
                <td className="py-3 text-snp-navy-600">{c.expiresAt ?? 'Never'}</td>
                <td className="py-3 text-right text-snp-navy-700 font-semibold">{c.usedCount}{c.maxUses != null && ` / ${c.maxUses}`}</td>
                <td className="py-3 pl-6">
                  <div className="flex gap-1.5 flex-wrap">
                    {c.userEmails.length > 0 && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-snp-purple-50 text-snp-purple-700">{c.userEmails.length} user{c.userEmails.length > 1 ? 's' : ''}</span>}
                    {c.productIds.length > 0 && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{c.productIds.length} product{c.productIds.length > 1 ? 's' : ''}</span>}
                    {c.userEmails.length === 0 && c.productIds.length === 0 && <span className="text-[10.5px] text-snp-navy-400">Storewide</span>}
                  </div>
                </td>
                <td className="py-3 text-center">
                  <input type="checkbox" className="accent-[#2563eb] w-4 h-4" checked={c.active} onChange={e => patchCode(c.id, { active: e.target.checked })} />
                </td>
                <td className="py-3 text-right pr-2">
                  <button
                    title="Delete code"
                    onClick={() => updateStore(store.id, s => ({ discountCodes: s.discountCodes.filter(x => x.id !== c.id) }))}
                    className="w-7 h-7 rounded-[7px] text-snp-navy-300 hover:text-snp-red-600 inline-flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && <CreateCodeModal store={store} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateCodeModal({ store, onClose }: { store: DistributorStore; onClose: () => void }) {
  const { updateStore } = useStores();
  const [code, setCode] = useState('');
  const [type, setType] = useState<DiscountType>('percent');
  const [value, setValue] = useState(10);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [userEmails, setUserEmails] = useState('');
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const products = storeProducts(store);

  const randomCode = () => {
    const words = ['SAVE', 'GEAR', 'TEAM', 'CREW', 'DROP', 'KIT'];
    setCode(`${words[Math.floor(Math.random() * words.length)]}${Math.floor(10 + Math.random() * 89)}`);
  };

  const create = () => {
    const c: DiscountCode = {
      id: `dc-${Date.now().toString(36)}`,
      code: code.trim().toUpperCase(),
      type,
      value: type === 'free-shipping' ? 0 : value,
      expiresAt: expiresAt || null,
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      userEmails: userEmails.split(/[\s,;]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes('@')),
      productIds: [...productIds],
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    updateStore(store.id, s => ({ discountCodes: [c, ...s.discountCodes] }));
    onClose();
  };

  const valid = code.trim().length >= 3 && (type === 'free-shipping' || value > 0)
    && !store.discountCodes.some(c => c.code.toLowerCase() === code.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(1,39,84,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-[18px] p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[19px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Create discount code</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={label}>Code</label>
            <div className="flex gap-2">
              <input
                className={`${input} uppercase font-mono font-bold`}
                placeholder="e.g. WELCOME10"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              />
              <button onClick={randomCode} title="Generate a code" className="h-11 px-3 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 hover:bg-snp-navy-50">
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className={label}>Discount type</label>
            <div className="flex gap-2">
              {(Object.keys(TYPE_LABELS) as DiscountType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 h-11 rounded-[10px] border-2 text-[12.5px] font-bold transition-colors ${type === t ? 'border-snp-indigo-600 bg-snp-indigo-50/50 text-snp-indigo-700' : 'border-snp-navy-200 text-snp-navy-600 hover:border-snp-navy-300'}`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {type !== 'free-shipping' && (
              <div>
                <label className={label}>{type === 'fixed' ? 'Amount ($)' : 'Percent (%)'}</label>
                <input type="number" min={1} max={type === 'percent' ? 100 : undefined} className={input} value={value} onChange={e => setValue(Number(e.target.value))} />
              </div>
            )}
            <div>
              <label className={label}>Expiration</label>
              <input type="date" className={input} value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
            <div>
              <label className={label}>Usage limit</label>
              <input type="number" min={1} placeholder="∞" className={input} value={maxUses} onChange={e => setMaxUses(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={label}>Restrict to specific shoppers <span className="normal-case font-medium">(optional — emails, comma-separated)</span></label>
            <input
              className={input}
              placeholder={store.users.users[0] ? `e.g. ${store.users.users[0].email}` : 'e.g. coach@club.org'}
              value={userEmails}
              onChange={e => setUserEmails(e.target.value)}
            />
            {store.users.enabled && store.users.users.length > 0 && (
              <div className="mt-1.5 flex gap-1.5 flex-wrap">
                {store.users.users.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUserEmails(prev => prev.includes(u.email) ? prev : [prev, u.email].filter(Boolean).join(', '))}
                    className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-snp-navy-50 text-snp-navy-600 hover:bg-snp-indigo-50 hover:text-snp-indigo-700"
                  >
                    + {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={label}>Restrict to specific products <span className="normal-case font-medium">(optional)</span></label>
            <div className="max-h-36 overflow-y-auto rounded-[10px] border border-snp-navy-200 divide-y divide-snp-navy-50">
              {products.map(p => (
                <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium text-snp-navy-800 cursor-pointer hover:bg-snp-navy-50/50">
                  <input
                    type="checkbox"
                    className="accent-[#2563eb] w-3.5 h-3.5"
                    checked={productIds.has(p.id)}
                    onChange={() => setProductIds(prev => {
                      const n = new Set(prev);
                      if (n.has(p.id)) n.delete(p.id); else n.add(p.id);
                      return n;
                    })}
                  />
                  <span className="truncate">{p.name}</span>
                  <span className="ml-auto text-[10.5px] text-snp-navy-400">{STYLE_CODES[p.id]}</span>
                </label>
              ))}
            </div>
            {productIds.size > 0 && <p className="mt-1 text-[11px] text-snp-navy-500">Applies to {productIds.size} selected product{productIds.size > 1 ? 's' : ''} only</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
          <button onClick={onClose} className="h-11 px-5 rounded-[10px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50">Cancel</button>
          <button
            disabled={!valid}
            onClick={create}
            className="flex items-center gap-2 h-11 px-6 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-40 hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <Check className="w-4 h-4" /> Create code
          </button>
        </div>
      </div>
    </div>
  );
}
