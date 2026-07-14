import { useNavigate } from 'react-router-dom';
import { Copy, Pause, Trash2 } from 'lucide-react';
import { type DistributorStore } from '../../../data/storesData';
import { useStores } from '../../../context/StoresContext';
import { card, input, label } from './shared';

export function SettingsTab({ store }: { store: DistributorStore }) {
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
        <p className="text-[12px] text-snp-navy-500 mb-4">Public stores are open to anyone with the link. Gated stores ask for a passcode or a verified email first.</p>
        <div className="flex gap-3 flex-wrap">
          <button className={radioCard(store.settings.access === 'public')} onClick={() => updateStore(store.id, s => ({ settings: { ...s.settings, access: 'public' } }))}>
            <div className="text-[13.5px] font-bold text-snp-navy-950 mb-0.5">Public</div>
            <div className="text-[11.5px] text-snp-navy-500">Anyone with the link can browse & buy</div>
          </button>
          <button className={radioCard(store.settings.access === 'passcode')} onClick={() => updateStore(store.id, s => ({ settings: { ...s.settings, access: 'passcode', passcode: s.settings.passcode ?? 'WELCOME' } }))}>
            <div className="text-[13.5px] font-bold text-snp-navy-950 mb-0.5">Passcode</div>
            <div className="text-[11.5px] text-snp-navy-500">Requires a shared access code</div>
          </button>
          {store.users.enabled && store.users.users.length > 0 ? (
            <button className={radioCard(store.settings.access === 'email-list')} onClick={() => updateStore(store.id, s => ({ settings: { ...s.settings, access: 'email-list' } }))}>
              <div className="text-[13.5px] font-bold text-snp-navy-950 mb-0.5">Approved email list</div>
              <div className="text-[11.5px] text-snp-navy-500">Only the {store.users.users.length} user{store.users.users.length !== 1 ? 's' : ''} on your list can enter</div>
            </button>
          ) : (
            <div className="flex-1 rounded-[14px] border-2 border-dashed border-snp-navy-200 p-4 text-left opacity-70">
              <div className="text-[13.5px] font-bold text-snp-navy-500 mb-0.5">Approved email list</div>
              <div className="text-[11.5px] text-snp-navy-400">Add users in the <b>Users</b> tab to unlock this option</div>
            </div>
          )}
        </div>
        {store.settings.access === 'passcode' && (
          <div className="mt-3">
            <label className={label}>Access code</label>
            <input className={input} style={{ maxWidth: 200 }} value={store.settings.passcode ?? ''}
              onChange={e => updateStore(store.id, s => ({ settings: { ...s.settings, passcode: e.target.value.toUpperCase() } }))} />
          </div>
        )}
        {store.settings.access === 'email-list' && (
          <p className="mt-3 text-[12px] text-snp-navy-500">
            Shoppers verify their email at the storefront gate. Manage the list — including per-user discounts and admins — in the <b>Users</b> tab.
          </p>
        )}
      </div>

      <div className={`${card} p-5`}>
        <span className="text-[15px] font-bold text-snp-navy-950 block mb-1">Payment</span>
        <p className="text-[12px] text-snp-navy-500 mb-4">How shoppers pay at checkout. Snappy handles fulfillment and invoicing — your margin is paid out to you.</p>
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

      <div className={`${card} p-5 space-y-4`}>
        <div>
          <span className="text-[15px] font-bold text-snp-navy-950 block">Search engine listing (SEO)</span>
          <span className="text-[12px] text-snp-navy-500">How this storefront appears in search results and browser tabs.</span>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className={label}>Meta title</label>
            <span className={`text-[10.5px] font-semibold ${store.seo.metaTitle.length > 60 ? 'text-amber-600' : 'text-snp-navy-400'}`}>{store.seo.metaTitle.length}/60</span>
          </div>
          <input className={input} value={store.seo.metaTitle}
            onChange={e => updateStore(store.id, s => ({ seo: { ...s.seo, metaTitle: e.target.value } }))} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className={label}>Meta description</label>
            <span className={`text-[10.5px] font-semibold ${store.seo.metaDescription.length > 160 ? 'text-amber-600' : 'text-snp-navy-400'}`}>{store.seo.metaDescription.length}/160</span>
          </div>
          <textarea
            className="w-full px-3.5 py-2.5 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 outline-none focus:border-snp-indigo-500 resize-none"
            rows={2}
            value={store.seo.metaDescription}
            onChange={e => updateStore(store.id, s => ({ seo: { ...s.seo, metaDescription: e.target.value } }))}
          />
        </div>
        <div>
          <label className={label}>Keywords</label>
          <input className={input} placeholder="team store, spirit wear, club merch…" value={store.seo.keywords}
            onChange={e => updateStore(store.id, s => ({ seo: { ...s.seo, keywords: e.target.value } }))} />
        </div>
        {/* Search preview */}
        <div className="rounded-[12px] border border-snp-navy-100 bg-snp-navy-50/40 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2">Preview</div>
          <div className="text-[11.5px] text-emerald-700">snappy.store › {store.slug}</div>
          <div className="text-[15px] text-blue-700 leading-snug hover:underline cursor-pointer">{store.seo.metaTitle || store.name}</div>
          <div className="text-[12px] text-snp-navy-600 leading-snug line-clamp-2">{store.seo.metaDescription || store.heroSub}</div>
        </div>
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
            onClick={() => { if (confirm(`Delete "${store.name}"? This permanently removes the store and its storefront — it can't be undone.`)) { removeStore(store.id); navigate('/stores'); } }}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-red-200 bg-white text-[13px] font-semibold text-snp-red-600 hover:bg-snp-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete store
          </button>
        </div>
      </div>
    </div>
  );
}
