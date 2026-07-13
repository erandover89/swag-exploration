import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Upload, Check, Sparkles, X, Wand2, Store as StoreIcon,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, type ProductCategory } from '../../data/mockData';
import {
  CATALOG_TEMPLATES, DEFAULT_TIERS, STORE_THEMES, STYLE_CODES,
  type ClientType, type DistributorStore, type StoreLogoAsset,
} from '../../data/storesData';
import { useStores, makeInitialsLogo } from '../../context/StoresContext';
import { StoreCreatingLoader } from '../../components/StoreCreatingLoader';
import { StoreProductImage } from '../../components/stores/StoreBits';

const STEPS = [
  { id: 'client', label: 'Customer', desc: 'Who is this store for' },
  { id: 'logos', label: 'Logos & brand', desc: 'Artwork and colors' },
  { id: 'catalog', label: 'Catalog', desc: 'Products, brands, colors' },
  { id: 'theme', label: 'Theme & pricing', desc: 'Look, feel and markup' },
] as const;

const CLIENT_TYPES: ClientType[] = ['Team Sports', 'Cafe & Retail', 'Corporate', 'Education', 'Nonprofit'];

const LOGO_BG_CHOICES = ['#0d1b2a', '#b91c1c', '#0e7490', '#7c3aed', '#a2530a', '#166534'];

// Extract up to 3 dominant colors from an uploaded logo via canvas sampling.
function extractPalette(dataUrl: string): Promise<string[]> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const S = 48;
        const canvas = document.createElement('canvas');
        canvas.width = S; canvas.height = S;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, S, S);
        const data = ctx.getImageData(0, 0, S, S).data;
        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
          if (a < 128) continue;
          // skip near-white/near-black backgrounds
          if (r > 240 && g > 240 && b > 240) continue;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const bkt = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
          bkt.r += r; bkt.g += g; bkt.b += b; bkt.n++;
          buckets.set(key, bkt);
        }
        const top = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 3)
          .map(({ r, g, b, n }) => `#${[r / n, g / n, b / n].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`);
        resolve(top);
      } catch { resolve([]); }
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

const COLOR_FAMILIES: { id: string; label: string; hexes: string[]; match: (hex: string) => boolean }[] = [
  { id: 'neutrals', label: 'Neutrals', hexes: ['#1a1a1a', '#9ca3af', '#f9fafb'], match: h => ['#1a1a1a', '#111827', '#374151', '#9ca3af', '#6b7280', '#f9fafb', '#f5f0e8', '#d4c5a0', '#d4c5a9', '#8c7b6b', '#c0c0c0', '#475569'].includes(h) },
  { id: 'blues', label: 'Blues & navy', hexes: ['#1e3a5f', '#3b82f6', '#1d4ed8'], match: h => ['#1e3a5f', '#3b82f6', '#1d4ed8', '#5b7fa6', '#1a4a5c', '#3077c9'].includes(h) },
  { id: 'warm', label: 'Warm tones', hexes: ['#dc2626', '#e97316', '#7f1d1d'], match: h => ['#dc2626', '#e97316', '#e11d48', '#b91c1c', '#7f1d1d', '#78350f', '#e8b4b8'].includes(h) },
  { id: 'greens', label: 'Greens & earth', hexes: ['#166534', '#4a5240', '#4d7c5f'], match: h => ['#166534', '#4a5240', '#8c7b6b', '#d4c5a0'].includes(h) },
  { id: 'brights', label: 'Brights', hexes: ['#7c3aed', '#c026d3', '#5eead4'], match: h => ['#7c3aed'].includes(h) },
];

export function StoreCreateWizard() {
  const navigate = useNavigate();
  const { addStore } = useStores();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Step 1 — customer
  const [clientName, setClientName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [clientType, setClientType] = useState<ClientType>('Team Sports');

  // Step 2 — logos
  const [logos, setLogos] = useState<StoreLogoAsset[]>([]);
  const [primaryLogoId, setPrimaryLogoId] = useState<string>('');
  const [palette, setPalette] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Step 3 — catalog
  const [templateId, setTemplateId] = useState<string>('team-sports');
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set(CATALOG_TEMPLATES[0].productIds));
  const [activeCategories, setActiveCategories] = useState<Set<ProductCategory>>(new Set(CATEGORIES));
  const [activeBrands, setActiveBrands] = useState<Set<string>>(new Set(PRODUCTS.map(p => p.brand)));
  const [activeColorFams, setActiveColorFams] = useState<Set<string>>(new Set(COLOR_FAMILIES.map(f => f.id)));

  // Step 4 — theme & pricing
  const [themeId, setThemeId] = useState('athletic');
  const [markup, setMarkup] = useState(40);
  const [volumeDiscounts, setVolumeDiscounts] = useState(true);
  const [bulkOrdering, setBulkOrdering] = useState(true);

  const slug = useMemo(() =>
    (clientName || 'new-store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), [clientName]);

  const templateProducts = useMemo(() => {
    const tpl = CATALOG_TEMPLATES.find(t => t.id === templateId);
    return (tpl?.productIds ?? []).map(id => PRODUCTS.find(p => p.id === id)!).filter(Boolean);
  }, [templateId]);

  // products surviving the manual brand/category/color refinements
  const eligibleIds = useMemo(() => new Set(
    templateProducts
      .filter(p => activeCategories.has(p.category))
      .filter(p => activeBrands.has(p.brand))
      .filter(p => p.colors.some(c => COLOR_FAMILIES.some(f => activeColorFams.has(f.id) && f.match(c.hex))))
      .map(p => p.id),
  ), [templateProducts, activeCategories, activeBrands, activeColorFams]);

  const finalIds = useMemo(
    () => templateProducts.filter(p => eligibleIds.has(p.id) && includedIds.has(p.id)).map(p => p.id),
    [templateProducts, eligibleIds, includedIds],
  );

  const primaryLogoSrc = logos.find(l => l.id === primaryLogoId)?.src
    ?? (clientName ? makeInitialsLogo(clientName, LOGO_BG_CHOICES[0], '#ffffff') : '');

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setAnalyzing(true);
    const next: StoreLogoAsset[] = [];
    for (const file of Array.from(files).slice(0, 4 - logos.length)) {
      const dataUrl = await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(file);
      });
      next.push({ id: `lg-${Date.now()}-${next.length}`, label: file.name.replace(/\.\w+$/, ''), src: dataUrl });
    }
    const all = [...logos, ...next];
    setLogos(all);
    if (!primaryLogoId && all.length) setPrimaryLogoId(all[0].id);
    if (next.length) {
      const colors = await extractPalette(next[0].src);
      if (colors.length) setPalette(colors);
    }
    setAnalyzing(false);
  }

  function useSampleLogo() {
    const bg = LOGO_BG_CHOICES[(clientName.length + logos.length) % LOGO_BG_CHOICES.length];
    const asset: StoreLogoAsset = {
      id: `lg-sample-${logos.length}`,
      label: logos.length === 0 ? 'Primary' : `Alternate ${logos.length}`,
      src: makeInitialsLogo(clientName || 'Demo Client', bg, '#ffffff'),
    };
    const all = [...logos, asset];
    setLogos(all);
    if (!primaryLogoId) setPrimaryLogoId(asset.id);
    if (!palette.length) setPalette([bg, '#f5f7fa', '#c8f135']);
  }

  function pickTemplate(id: string) {
    setTemplateId(id);
    const tpl = CATALOG_TEMPLATES.find(t => t.id === id)!;
    setIncludedIds(new Set(tpl.productIds));
    setThemeId(tpl.suggestedThemeId);
  }

  function generate() {
    const id = `st-${Date.now().toString(36)}`;
    const finalLogos = logos.length ? logos : [{
      id: 'lg-init', label: 'Primary',
      src: makeInitialsLogo(clientName || storeName || 'Store', LOGO_BG_CHOICES[0], '#ffffff'),
    }];
    const store: DistributorStore = {
      id,
      slug: slug || id,
      name: storeName || `${clientName} Store`,
      clientName: clientName || 'New Customer',
      clientType,
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      themeId,
      logos: finalLogos,
      primaryLogoId: finalLogos.find(l => l.id === primaryLogoId)?.id ?? finalLogos[0].id,
      heroHeadline: `${clientName || 'Your'} official gear.`,
      heroSub: `Branded merchandise for ${clientName || 'your community'} — printed on demand and shipped straight to your door.`,
      announcement: 'Welcome to our new store — free shipping on orders over $75',
      productIds: finalIds,
      featuredIds: finalIds.slice(0, 4),
      hiddenIds: [],
      pricing: {
        globalMarkupPct: markup,
        productOverrides: {},
        volumeTiers: volumeDiscounts ? DEFAULT_TIERS : [],
        showBulkSavings: volumeDiscounts,
      },
      settings: { access: 'public', payment: 'card', bulkOrdering, logoPicker: logos.length > 1 },
      stats: { revenue30d: 0, orders30d: 0, visitors30d: 0, margin30d: 0 },
      orders: [],
    };
    addStore(store);
    setGenerating(true);
    // loader dismiss → land in the manager
    sessionStorage.setItem('snappy_store_created', id);
  }

  const canNext =
    step === 0 ? clientName.trim().length > 1 :
    step === 1 ? true :
    step === 2 ? finalIds.length > 0 :
    true;

  if (generating) {
    return (
      <StoreCreatingLoader
        storeName={storeName || `${clientName} Store`}
        productIds={finalIds}
        logoUrl={primaryLogoSrc}
        onComplete={() => navigate(`/stores/${sessionStorage.getItem('snappy_store_created')}?created=1`)}
      />
    );
  }

  const inputCls = 'w-full h-12 px-4 bg-white rounded-[12px] border border-snp-navy-200 text-[14px] text-snp-navy-950 placeholder:text-snp-navy-400 outline-none focus:border-snp-indigo-500 transition-colors';
  const labelCls = 'block text-[12px] font-bold uppercase tracking-wider text-snp-navy-500 mb-2';

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Top bar ── */}
      <div className="h-16 bg-white border-b border-snp-navy-200 flex items-center px-6 gap-4 sticky top-0 z-40">
        <button onClick={() => navigate('/stores')} className="flex items-center gap-2 text-[13px] font-semibold text-snp-navy-600 hover:text-snp-navy-950">
          <ArrowLeft className="w-4 h-4" /> Stores
        </button>
        <div className="w-px h-6 bg-snp-navy-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[9px] bg-snp-indigo-100 flex items-center justify-center">
            <StoreIcon className="w-4 h-4 text-snp-indigo-700" />
          </div>
          <span className="text-[15px] font-bold text-snp-navy-950">New store</span>
          {clientName && <span className="text-[13px] text-snp-navy-400">· {clientName}</span>}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[12px] text-snp-navy-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-snp-purple-700" />
          A basic store goes live in under 2 minutes
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-6 py-8 flex gap-10">
        {/* ── Step rail ── */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="flex flex-col gap-1 sticky top-24">
            {STEPS.map((s, i) => {
              const state = i < step ? 'done' : i === step ? 'active' : 'todo';
              return (
                <button
                  key={s.id}
                  onClick={() => { if (i < step) setStep(i); }}
                  className={`flex items-start gap-3 p-3 rounded-[12px] text-left transition-colors ${
                    state === 'active' ? 'bg-white border border-snp-navy-200 shadow-[0px_4px_12px_rgba(1,39,84,0.06)]' : 'hover:bg-white/60'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                    state === 'done' ? 'bg-emerald-500 text-white' :
                    state === 'active' ? 'bg-snp-navy-950 text-white' : 'bg-snp-navy-200 text-snp-navy-600'
                  }`}>
                    {state === 'done' ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div>
                    <div className={`text-[13.5px] font-bold ${state === 'active' ? 'text-snp-navy-950' : 'text-snp-navy-600'}`}>{s.label}</div>
                    <div className="text-[11.5px] text-snp-navy-400">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Step content ── */}
        <main className="flex-1 min-w-0">
          {step === 0 && (
            <div className="max-w-xl">
              <h2 className="text-[30px] text-snp-navy-950 mb-2" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}>
                Who is this store for?
              </h2>
              <p className="text-[14px] text-snp-navy-600 mb-8">
                Each customer gets their own independent, branded storefront — catalog, pricing and payouts stay isolated per store.
              </p>

              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Customer / organization</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Ridgeline United FC"
                    value={clientName}
                    onChange={e => {
                      setClientName(e.target.value);
                      if (!storeName || storeName.endsWith(' Store')) setStoreName(e.target.value ? `${e.target.value} Store` : '');
                    }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelCls}>Store name</label>
                  <input className={inputCls} placeholder="e.g. Ridgeline United FC Team Store" value={storeName} onChange={e => setStoreName(e.target.value)} />
                  <div className="mt-2 text-[12px] text-snp-navy-400 font-medium">
                    snappy.store/<span className="text-snp-indigo-700 font-bold">{slug}</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Customer type</label>
                  <div className="flex flex-wrap gap-2">
                    {CLIENT_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setClientType(t)}
                        className={`h-10 px-4 rounded-full text-[13px] font-semibold border transition-colors ${
                          clientType === t
                            ? 'bg-snp-navy-950 text-white border-snp-navy-950'
                            : 'bg-white text-snp-navy-700 border-snp-navy-200 hover:border-snp-navy-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="max-w-2xl">
              <h2 className="text-[30px] text-snp-navy-950 mb-2" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}>
                Add their logos
              </h2>
              <p className="text-[14px] text-snp-navy-600 mb-8">
                Upload up to 4 logos. We composite them onto every product instantly and pull brand colors for the storefront — shoppers can pick which logo goes on their gear.
              </p>

              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {logos.map(l => (
                  <div
                    key={l.id}
                    className={`relative rounded-[16px] border-2 p-3 bg-white cursor-pointer transition-colors ${
                      primaryLogoId === l.id ? 'border-snp-indigo-600' : 'border-snp-navy-200 hover:border-snp-navy-300'
                    }`}
                    onClick={() => setPrimaryLogoId(l.id)}
                  >
                    <div className="h-20 flex items-center justify-center">
                      <img src={l.src} alt={l.label} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="mt-2 text-[11.5px] font-semibold text-snp-navy-700 truncate text-center">{l.label}</div>
                    {primaryLogoId === l.id && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide bg-snp-indigo-600 text-white px-1.5 py-0.5 rounded">Primary</span>
                    )}
                    <button
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-snp-navy-100 text-snp-navy-500 flex items-center justify-center hover:bg-snp-red-100 hover:text-snp-red-600"
                      onClick={e => { e.stopPropagation(); setLogos(prev => prev.filter(x => x.id !== l.id)); }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {logos.length < 4 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="rounded-[16px] border-2 border-dashed border-snp-navy-300 hover:border-snp-indigo-500 hover:bg-snp-indigo-50/50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[130px] text-snp-navy-500"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-[12px] font-semibold">{logos.length ? 'Add another' : 'Upload logo(s)'}</span>
                    <span className="text-[10.5px] text-snp-navy-400">SVG or PNG</span>
                  </button>
                )}
              </div>

              <button onClick={useSampleLogo} className="text-[13px] font-semibold text-snp-indigo-700 hover:text-snp-indigo-800 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> No file handy? Generate a demo logo
              </button>

              {(palette.length > 0 || analyzing) && (
                <div className="mt-8 bg-white rounded-[16px] border border-snp-navy-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-snp-purple-700" />
                    <span className="text-[13px] font-bold text-snp-navy-950">
                      {analyzing ? 'Analyzing artwork…' : 'Brand colors detected'}
                    </span>
                  </div>
                  {!analyzing && (
                    <>
                      <div className="flex gap-2.5">
                        {palette.map(c => (
                          <div key={c} className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-[10px] border border-snp-navy-200" style={{ background: c }} />
                            <span className="text-[10.5px] font-mono text-snp-navy-500">{c}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12px] text-snp-navy-500">
                        Applied to the storefront theme, buttons and graphics automatically — adjustable any time in Design.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-[30px] text-snp-navy-950 mb-2" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}>
                Build the catalog
              </h2>
              <p className="text-[14px] text-snp-navy-600 mb-6">
                Start from a template, then take manual control — choose exactly which brands, categories and garment colors get generated.
              </p>

              {/* Templates */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
                {CATALOG_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => pickTemplate(tpl.id)}
                    className={`text-left rounded-[16px] border-2 p-4 bg-white transition-all ${
                      templateId === tpl.id ? 'border-snp-indigo-600 shadow-[0px_8px_20px_rgba(48,119,201,0.15)]' : 'border-snp-navy-200 hover:border-snp-navy-300'
                    }`}
                  >
                    <div className="text-[22px] mb-2">{tpl.emoji}</div>
                    <div className="text-[13.5px] font-bold text-snp-navy-950 mb-1">{tpl.name}</div>
                    <div className="text-[11.5px] text-snp-navy-500 leading-snug">{tpl.desc}</div>
                    <div className="mt-2 text-[11px] font-bold text-snp-indigo-700">{tpl.productIds.length} styles</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-6 items-start">
                {/* Manual refinements */}
                <div className="w-64 shrink-0 space-y-5">
                  <div className="bg-white rounded-[16px] border border-snp-navy-200 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2.5">Categories</div>
                    <div className="space-y-1.5">
                      {[...new Set(templateProducts.map(p => p.category))].map(cat => (
                        <label key={cat} className="flex items-center gap-2.5 text-[13px] font-medium text-snp-navy-800 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-[#2563eb] w-3.5 h-3.5"
                            checked={activeCategories.has(cat)}
                            onChange={() => setActiveCategories(prev => {
                              const n = new Set(prev);
                              if (n.has(cat)) n.delete(cat); else n.add(cat);
                              return n;
                            })}
                          />
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[16px] border border-snp-navy-200 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2.5">Brands</div>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {[...new Set(templateProducts.map(p => p.brand))].map(brand => (
                        <label key={brand} className="flex items-center gap-2.5 text-[13px] font-medium text-snp-navy-800 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-[#2563eb] w-3.5 h-3.5"
                            checked={activeBrands.has(brand)}
                            onChange={() => setActiveBrands(prev => {
                              const n = new Set(prev);
                              if (n.has(brand)) n.delete(brand); else n.add(brand);
                              return n;
                            })}
                          />
                          {brand}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[16px] border border-snp-navy-200 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2.5">Garment colors</div>
                    <div className="space-y-2">
                      {COLOR_FAMILIES.map(f => (
                        <label key={f.id} className="flex items-center gap-2.5 text-[13px] font-medium text-snp-navy-800 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-[#2563eb] w-3.5 h-3.5"
                            checked={activeColorFams.has(f.id)}
                            onChange={() => setActiveColorFams(prev => {
                              const n = new Set(prev);
                              if (n.has(f.id)) n.delete(f.id); else n.add(f.id);
                              return n;
                            })}
                          />
                          <span className="flex gap-1">
                            {f.hexes.map(h => <span key={h} className="w-3.5 h-3.5 rounded-full border border-snp-navy-200" style={{ background: h }} />)}
                          </span>
                          {f.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live product preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[13px] font-bold text-snp-navy-950">
                      {finalIds.length} styles will be generated
                    </span>
                    <span className="text-[12px] text-snp-navy-400">Click any item to include / exclude</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {templateProducts.map(p => {
                      const eligible = eligibleIds.has(p.id);
                      const included = eligible && includedIds.has(p.id);
                      return (
                        <button
                          key={p.id}
                          disabled={!eligible}
                          onClick={() => setIncludedIds(prev => {
                            const n = new Set(prev);
                            if (n.has(p.id)) n.delete(p.id); else n.add(p.id);
                            return n;
                          })}
                          className={`relative text-left rounded-[14px] border-2 bg-white overflow-hidden transition-all ${
                            !eligible ? 'opacity-30 grayscale border-snp-navy-100' :
                            included ? 'border-snp-indigo-600' : 'border-snp-navy-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <StoreProductImage product={p} logoSrc={primaryLogoSrc} className="h-28 bg-white p-2" />
                          <div className="px-2.5 pb-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-snp-navy-400">{p.brand} · {STYLE_CODES[p.id]}</div>
                            <div className="text-[12px] font-semibold text-snp-navy-900 truncate">{p.name}</div>
                          </div>
                          {included && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-snp-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-3xl">
              <h2 className="text-[30px] text-snp-navy-950 mb-2" style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}>
                Theme & pricing
              </h2>
              <p className="text-[14px] text-snp-navy-600 mb-7">
                Pick the storefront personality, then set your markup on top of SanMar cost — that margin is yours on every order.
              </p>

              {/* Themes */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {STORE_THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`text-left rounded-[16px] border-2 overflow-hidden bg-white transition-all ${
                      themeId === t.id ? 'border-snp-indigo-600 shadow-[0px_8px_20px_rgba(48,119,201,0.15)]' : 'border-snp-navy-200 hover:border-snp-navy-300'
                    }`}
                  >
                    {/* mini storefront preview */}
                    <div className="h-24 p-2.5 flex flex-col gap-1.5" style={{ background: t.colors.bg }}>
                      <div className="h-3 rounded-sm flex items-center px-1.5" style={{ background: t.colors.headerBg, border: `1px solid ${t.colors.border}` }}>
                        <div className="w-6 h-1 rounded-full" style={{ background: t.colors.headerInk, opacity: 0.7 }} />
                      </div>
                      <div className="flex-1 rounded-sm flex items-center px-2 gap-2" style={{ background: t.colors.heroBg }}>
                        <div className="flex-1">
                          <div className="w-14 h-1.5 rounded-full mb-1" style={{ background: t.colors.heroInk }} />
                          <div className="w-9 h-1 rounded-full" style={{ background: t.colors.heroInk, opacity: 0.5 }} />
                        </div>
                        <div className="w-8 h-3 rounded-sm" style={{ background: t.colors.primary }} />
                      </div>
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => <div key={i} className="flex-1 h-5 rounded-sm" style={{ background: t.colors.surface, border: `1px solid ${t.colors.border}` }} />)}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[13px] font-bold text-snp-navy-950" style={{ fontFamily: t.fontDisplay }}>{t.name}</div>
                      <div className="text-[11px] text-snp-navy-500 leading-snug mt-0.5">{t.vibe}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Markup */}
              <div className="bg-white rounded-[18px] border border-snp-navy-200 p-6 mb-5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[15px] font-bold text-snp-navy-950">Your markup</span>
                  <span className="text-[26px] font-bold text-snp-purple-700" style={{ fontFamily: "'Clash Display', sans-serif" }}>+{markup}%</span>
                </div>
                <p className="text-[12.5px] text-snp-navy-500 mb-4">Applied on top of your SanMar cost across the store. Fine-tune per item after creation.</p>
                <input
                  type="range" min={0} max={100} step={1} value={markup}
                  onChange={e => setMarkup(Number(e.target.value))}
                  className="w-full accent-[#7c3aed]"
                />
                <div className="mt-4 flex items-center gap-4 bg-snp-navy-50 rounded-[12px] px-4 py-3 text-[13px]">
                  <span className="text-snp-navy-500">Example — Bella + Canvas tee:</span>
                  <span className="font-semibold text-snp-navy-700">Your cost $22.00</span>
                  <ArrowRight className="w-3.5 h-3.5 text-snp-navy-400" />
                  <span className="font-bold text-snp-navy-950">Store price ${(Math.round(22 * (1 + markup / 100) * 2) / 2).toFixed(2)}</span>
                  <span className="ml-auto font-bold text-emerald-600">${(Math.round(22 * (1 + markup / 100) * 2) / 2 - 22).toFixed(2)} margin / unit</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 rounded-[16px] border-2 p-4 bg-white cursor-pointer ${volumeDiscounts ? 'border-snp-indigo-600' : 'border-snp-navy-200'}`}>
                  <input type="checkbox" className="accent-[#2563eb] w-4 h-4 mt-0.5" checked={volumeDiscounts} onChange={e => setVolumeDiscounts(e.target.checked)} />
                  <span>
                    <span className="block text-[13.5px] font-bold text-snp-navy-950">Volume discounts</span>
                    <span className="block text-[12px] text-snp-navy-500 mt-0.5">Tiered pricing — unit cost drops at 12 / 24 / 48 units, shown on product pages.</span>
                  </span>
                </label>
                <label className={`flex items-start gap-3 rounded-[16px] border-2 p-4 bg-white cursor-pointer ${bulkOrdering ? 'border-snp-indigo-600' : 'border-snp-navy-200'}`}>
                  <input type="checkbox" className="accent-[#2563eb] w-4 h-4 mt-0.5" checked={bulkOrdering} onChange={e => setBulkOrdering(e.target.checked)} />
                  <span>
                    <span className="block text-[13.5px] font-bold text-snp-navy-950">Bulk ordering grid</span>
                    <span className="block text-[12px] text-snp-navy-500 mt-0.5">Shoppers enter quantities per size in a grid — built for team managers ordering for a group.</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ── Footer nav ── */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-snp-navy-200">
            <button
              onClick={() => step === 0 ? navigate('/stores') : setStep(s => s - 1)}
              className="h-11 px-5 rounded-[12px] border border-snp-navy-200 bg-white text-[13.5px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50"
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                disabled={!canNext}
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 h-11 px-7 rounded-[12px] text-white text-[13.5px] font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={!canNext}
                onClick={generate}
                className="flex items-center gap-2 h-12 px-8 rounded-[14px] text-white text-[14px] font-bold disabled:opacity-40 shadow-[0px_8px_24px_rgba(124,58,237,0.4)] hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
              >
                <Sparkles className="w-4 h-4" /> Generate store
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
