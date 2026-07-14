import { useRef } from 'react';
import { ExternalLink, Plus, Upload, X } from 'lucide-react';
import {
  STORE_THEMES, fmtMoney, getStoreTheme, retailPrice, storeProducts,
  type DistributorStore, type StoreTheme,
} from '../../../data/storesData';
import { useStores } from '../../../context/StoresContext';
import { StoreLogo, StoreProductImage, storeLogoSrc } from '../../../components/stores/StoreBits';
import { fileToDataUrl, resizeImageDataUrl } from '../../../utils/imageResize';
import { card, input, label } from './shared';

const THEME_COLOR_FIELDS: { key: keyof StoreTheme['colors']; label: string }[] = [
  { key: 'bg', label: 'Page background' },
  { key: 'surface', label: 'Card surface' },
  { key: 'ink', label: 'Primary text' },
  { key: 'sub', label: 'Secondary text' },
  { key: 'border', label: 'Borders' },
  { key: 'primary', label: 'Buttons / CTA' },
  { key: 'primaryInk', label: 'Text on CTA' },
  { key: 'accent', label: 'Accent / deals' },
  { key: 'headerBg', label: 'Header background' },
  { key: 'headerInk', label: 'Header text' },
  { key: 'heroBg', label: 'Hero background' },
  { key: 'heroInk', label: 'Hero text' },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function DesignTab({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const theme = getStoreTheme(store);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const selectCustom = () => {
    updateStore(store.id, s => ({
      themeId: 'custom',
      // seed the custom theme from whatever preset was active
      customTheme: s.customTheme ?? { ...getStoreTheme(s), id: 'custom', name: 'Custom', vibe: 'Your own palette, hex by hex', colors: { ...getStoreTheme(s).colors } },
    }));
  };

  const setCustomColor = (key: keyof StoreTheme['colors'], value: string) => {
    updateStore(store.id, s => s.customTheme
      ? { customTheme: { ...s.customTheme, colors: { ...s.customTheme.colors, [key]: value } } }
      : {});
  };

  const addLogos = async (files: FileList | null) => {
    if (!files) return;
    const next: DistributorStore['logos'] = [];
    for (const file of Array.from(files).slice(0, 6 - store.logos.length)) {
      const src = await fileToDataUrl(file);
      next.push({ id: `lg-${Date.now()}-${next.length}`, label: file.name.replace(/\.\w+$/, ''), src });
    }
    if (next.length) updateStore(store.id, s => ({ logos: [...s.logos, ...next] }));
  };

  const removeLogo = (id: string) => {
    updateStore(store.id, s => {
      if (s.logos.length <= 1) return {};
      const logos = s.logos.filter(l => l.id !== id);
      return { logos, primaryLogoId: s.primaryLogoId === id ? logos[0].id : s.primaryLogoId };
    });
  };

  const setBanner = async (file: File | null) => {
    if (!file) return;
    const raw = await fileToDataUrl(file);
    const resized = await resizeImageDataUrl(raw);
    updateStore(store.id, { bannerImage: resized });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        {/* Theme */}
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
            {/* Custom theme card */}
            <button
              onClick={selectCustom}
              className={`rounded-[12px] border-2 p-3 text-left transition-all col-span-2 ${store.themeId === 'custom' ? 'border-snp-indigo-600' : 'border-dashed border-snp-navy-300 hover:border-snp-navy-400'}`}
            >
              <div className="flex gap-1 mb-2">
                {(store.customTheme
                  ? [store.customTheme.colors.heroBg, store.customTheme.colors.primary, store.customTheme.colors.accent, store.customTheme.colors.bg]
                  : ['#0ea5e9', '#f43f5e', '#facc15', '#10b981']
                ).map((c, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-black/10" style={{ background: c }} />
                ))}
              </div>
              <div className="text-[13px] font-bold text-snp-navy-950">Custom</div>
              <div className="text-[10.5px] text-snp-navy-500 leading-snug">Build your own theme with exact hex values</div>
            </button>
          </div>

          {/* Custom hex editor */}
          {store.themeId === 'custom' && store.customTheme && (
            <div className="mt-4 pt-4 border-t border-snp-navy-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-3">Custom colors</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {THEME_COLOR_FIELDS.map(f => {
                  const value = store.customTheme!.colors[f.key];
                  return (
                    <div key={f.key} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={HEX_RE.test(value) ? value : '#000000'}
                        onChange={e => setCustomColor(f.key, e.target.value)}
                        className="w-8 h-8 rounded-[7px] border border-snp-navy-200 cursor-pointer p-0.5 bg-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10.5px] font-semibold text-snp-navy-600 leading-tight truncate">{f.label}</div>
                        <input
                          value={value}
                          onChange={e => setCustomColor(f.key, e.target.value)}
                          className="w-full text-[11px] font-mono text-snp-navy-800 bg-transparent outline-none border-b border-transparent focus:border-snp-indigo-400"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Logos */}
        <div className={`${card} p-5`}>
          <span className="text-[15px] font-bold text-snp-navy-950 block mb-3">Logos</span>
          <input ref={logoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { addLogos(e.target.files); e.target.value = ''; }} />
          <div className="flex gap-3 flex-wrap">
            {store.logos.map(l => (
              <div
                key={l.id}
                className={`relative rounded-[12px] border-2 p-3 w-28 cursor-pointer ${store.primaryLogoId === l.id ? 'border-snp-indigo-600' : 'border-snp-navy-200'}`}
                onClick={() => updateStore(store.id, { primaryLogoId: l.id })}
              >
                <img src={l.src} alt={l.label} className="h-12 mx-auto object-contain" />
                <input
                  value={l.label}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateStore(store.id, s => ({
                    logos: s.logos.map(x => x.id === l.id ? { ...x, label: e.target.value } : x),
                  }))}
                  className="mt-1.5 w-full text-[10.5px] font-semibold text-snp-navy-600 text-center bg-transparent outline-none border-b border-transparent focus:border-snp-indigo-400"
                />
                {store.primaryLogoId === l.id && (
                  <span className="absolute top-1.5 left-1.5 text-[8.5px] font-bold uppercase tracking-wide bg-snp-indigo-600 text-white px-1.5 py-0.5 rounded">Primary</span>
                )}
                {store.logos.length > 1 && (
                  <button
                    title="Remove logo"
                    onClick={e => { e.stopPropagation(); removeLogo(l.id); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-snp-navy-100 text-snp-navy-500 flex items-center justify-center hover:bg-snp-red-100 hover:text-snp-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {store.logos.length < 6 && (
              <button
                onClick={() => logoRef.current?.click()}
                className="rounded-[12px] border-2 border-dashed border-snp-navy-300 hover:border-snp-indigo-500 w-28 min-h-[104px] flex flex-col items-center justify-center gap-1.5 text-snp-navy-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[10.5px] font-semibold">Add logo</span>
              </button>
            )}
          </div>
          <p className="mt-3 text-[11.5px] text-snp-navy-400">Primary logo is composited onto products. {store.settings.logoPicker ? 'Shoppers can switch logos per item at order time.' : 'Enable the logo picker in Settings to let shoppers choose.'}</p>
        </div>

        {/* Banner image */}
        <div className={`${card} p-5`}>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[15px] font-bold text-snp-navy-950">Banner image</span>
            <span className="text-[11.5px] text-snp-navy-400">Shown across the storefront hero</span>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => { setBanner(e.target.files?.[0] ?? null); e.target.value = ''; }} />
          {store.bannerImage ? (
            <div className="relative rounded-[12px] overflow-hidden border border-snp-navy-200">
              <img src={store.bannerImage} alt="Store banner" className="w-full h-28 object-cover" />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button onClick={() => bannerRef.current?.click()} className="h-8 px-3 rounded-[8px] bg-white/90 text-[11.5px] font-bold text-snp-navy-800">Replace</button>
                <button onClick={() => updateStore(store.id, { bannerImage: null })} className="h-8 px-3 rounded-[8px] bg-white/90 text-[11.5px] font-bold text-snp-red-600">Remove</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => bannerRef.current?.click()}
              className="w-full rounded-[12px] border-2 border-dashed border-snp-navy-300 hover:border-snp-indigo-500 hover:bg-snp-indigo-50/50 transition-colors flex flex-col items-center justify-center gap-1.5 h-24 text-snp-navy-500"
            >
              <Upload className="w-4 h-4" />
              <span className="text-[12px] font-semibold">Upload a banner image</span>
              <span className="text-[10.5px] text-snp-navy-400">Wide images work best — JPG or PNG</span>
            </button>
          )}
        </div>

        {/* Storefront copy */}
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

        {/* Footer content */}
        <div className={`${card} p-5 space-y-4`}>
          <div>
            <span className="text-[15px] font-bold text-snp-navy-950 block">Footer content</span>
            <span className="text-[12px] text-snp-navy-500">Shown in the storefront footer's About & Help sections</span>
          </div>
          {([
            ['ourStory', 'Our story'],
            ['qualityPromise', 'Quality promise'],
            ['privacy', 'Privacy'],
            ['contact', 'Contact us'],
          ] as const).map(([key, title]) => (
            <div key={key}>
              <label className={label}>{title}</label>
              <textarea
                className="w-full px-3.5 py-2.5 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 outline-none focus:border-snp-indigo-500 resize-none"
                rows={2}
                value={store.footerContent[key]}
                onChange={e => updateStore(store.id, s => ({ footerContent: { ...s.footerContent, [key]: e.target.value } }))}
              />
            </div>
          ))}
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
          <div className="px-6 py-8 relative overflow-hidden" style={{ background: theme.colors.heroBg }}>
            {store.bannerImage && (
              <>
                <img src={store.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 100%)' }} />
              </>
            )}
            <div className="relative">
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
