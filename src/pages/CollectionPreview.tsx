import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Send, Share2, Check, Pencil, Star } from 'lucide-react';
import { PRODUCTS, COUNTRIES, MOCK_COMPANY, BUDGET_RANGES } from '../data/mockData';
import { useUserDesigns } from '../context/UserDesignsContext';
import { useCompanyLogo } from '../context/CompanyLogoContext';

const BUDGET_TABS = BUDGET_RANGES;

const MORE_COLLECTIONS = [
  { name: "Snappy's Top Picks", curator: "Curated by Snappy", budget: 150, bg: 'linear-gradient(135deg,#eef4ff 0%,#dbeafe 100%)', emoji: '🎁' },
  { name: 'Birthday Collection', curator: 'Made by Snappy', budget: 150, bg: 'linear-gradient(135deg,#fff0f6 0%,#fce7f3 100%)', emoji: '🎂' },
  { name: 'My Awesome Collection', curator: 'Curated by Dave S.', budget: 150, bg: 'linear-gradient(135deg,#f0fff4 0%,#dcfce7 100%)', emoji: '⭐' },
  { name: 'Employee Favorites', curator: 'Made by Snappy', budget: 150, bg: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)', emoji: '❤️' },
];

function ProductThumb({ product, size = 'md' }: { product: { id: string; name: string; image: string }; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-[148px] h-[148px]' : size === 'md' ? 'w-[92px] h-[92px]' : 'w-[72px] h-[72px]';
  const pad = size === 'lg' ? 'p-3.5' : 'p-2.5';
  const textSize = size === 'lg' ? 'text-[60px]' : size === 'md' ? 'text-[38px]' : 'text-[28px]';
  const radius = size === 'lg' ? 'rounded-[22px]' : 'rounded-[16px]';
  const shadow = size === 'lg'
    ? '0px 12px 40px rgba(1,39,84,0.22)'
    : '0px 6px 20px rgba(1,39,84,0.16)';

  return (
    <div
      className={`${dim} ${radius} bg-white flex items-center justify-center overflow-hidden ${pad}`}
      style={{ boxShadow: shadow }}
    >
      {product.image.startsWith('/') ? (
        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
      ) : (
        <span className={textSize}>{product.image}</span>
      )}
    </div>
  );
}

export function CollectionPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { getDesign } = useUserDesigns();
  const { logoUrl: contextLogo } = useCompanyLogo();

  const s = state as { designId?: string; productIds?: string[]; collectionName?: string } | null;
  const designId = s?.designId;
  const designFromCtx = designId ? getDesign(designId) : undefined;

  const collectionName = designFromCtx?.name ?? s?.collectionName ?? 'Collection';
  const productIds     = designFromCtx?.productIds ?? s?.productIds ?? [];
  const logoUrl        = designFromCtx?.logoUrl ?? contextLogo;

  const [selectedBudget, setSelectedBudget] = useState<number | null>(100);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  if (!designFromCtx && !s?.productIds) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#edf2f8', fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <p className="text-[18px] font-semibold text-snp-navy-800 mb-2">Collection not found</p>
          <button onClick={() => navigate(-1)} className="text-snp-indigo-600 text-[14px] font-medium hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const country = COUNTRIES.find(c => c.code === selectedCountry)!;

  const allProducts = productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const budgetRange = BUDGET_TABS.find(b => b.max === selectedBudget);
  const visibleProducts = selectedBudget === null
    ? allProducts
    : allProducts.filter(p => p.price <= selectedBudget && p.price >= (budgetRange?.min ?? 0));

  function handleSend() {
    if (!selectedBudget) return;
    navigate('/send', {
      state: { collectionName, productIds, logoUrl, budget: selectedBudget },
    });
  }

  const [p0, p1, p2, p3] = allProducts;

  return (
    <div className="min-h-screen" style={{ background: '#edf2f8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-8 pt-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-snp-navy-400">
          <button onClick={() => navigate('/catalog')} className="hover:text-snp-navy-600 transition-colors">Browse Gifts</button>
          <span>/</span>
          <button onClick={() => navigate(-1)} className="hover:text-snp-navy-600 transition-colors">All Collections</button>
          <span>/</span>
          <span className="text-snp-navy-600 truncate max-w-[240px]">{collectionName}</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-8 pt-5 pb-8">
        <div
          className="rounded-[24px] overflow-hidden flex"
          style={{ background: 'white', boxShadow: '0px 2px 20px rgba(1,39,84,0.08)' }}
        >

          {/* Left: product fan */}
          <div
            className="w-[420px] shrink-0 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #c7d9f7 0%, #96b7e6 60%, #b8cfef 100%)',
              minHeight: 260,
            }}
          >
            {allProducts.length > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Back-layer products */}
                {p1 && (
                  <div className="absolute" style={{ top: '14%', left: '8%', transform: 'rotate(-11deg)', zIndex: 1 }}>
                    <ProductThumb product={p1} size="md" />
                  </div>
                )}
                {p2 && (
                  <div className="absolute" style={{ top: '12%', right: '8%', transform: 'rotate(9deg)', zIndex: 1 }}>
                    <ProductThumb product={p2} size="md" />
                  </div>
                )}
                {p3 && (
                  <div className="absolute" style={{ bottom: '14%', right: '10%', transform: 'rotate(-6deg)', zIndex: 1 }}>
                    <ProductThumb product={p3} size="sm" />
                  </div>
                )}
                {/* Main featured product */}
                <div className="relative" style={{ zIndex: 2 }}>
                  <ProductThumb product={p0} size="lg" />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[148px] h-[148px] rounded-[22px] bg-white/60 flex items-center justify-center">
                  <span className="text-[64px]">🎁</span>
                </div>
              </div>
            )}

            {/* Logo badge bottom-left */}
            {logoUrl && (
              <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white shadow-[0px_2px_8px_rgba(1,39,84,0.15)] border border-white flex items-center justify-center overflow-hidden z-10">
                <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
              </div>
            )}
          </div>

          {/* Right: info + CTA */}
          <div className="flex-1 px-8 py-8 flex flex-col justify-center gap-4">

            {/* Badge */}
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-snp-indigo-500 fill-snp-indigo-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-snp-navy-500">
                Hand Curated by {MOCK_COMPANY.name}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1
                className="text-[34px] font-semibold text-snp-navy-950 leading-[1.1]"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {collectionName}
              </h1>
              <p className="text-[14px] text-snp-navy-500 mt-3 leading-relaxed max-w-[400px]">
                {allProducts.length} carefully selected product{allProducts.length !== 1 ? 's' : ''} for your recipients.
                {selectedBudget
                  ? <> Showing items in the <span className="font-semibold text-snp-navy-800">{budgetRange?.label ?? `$${selectedBudget}`}</span> range.</>
                  : <> Select a budget below to filter what recipients see.</>
                }
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={!selectedBudget}
                className="flex items-center gap-2.5 h-12 px-8 rounded-[14px] text-white text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{
                  background: '#3077c9',
                  boxShadow: selectedBudget ? '0px 4px 20px rgba(48,119,201,0.38)' : 'none',
                }}
              >
                <Send className="w-4 h-4" />
                {selectedBudget ? `Send This ${budgetRange?.label ?? `$${selectedBudget}`} Collection` : 'Select a budget below'}
              </button>
              <button
                onClick={() => navigate('/collection/edit', { state: { productIds, collectionName, from: '/collection/preview' } })}
                className="w-10 h-10 rounded-full border border-snp-navy-200 bg-white hover:bg-snp-navy-50 flex items-center justify-center text-snp-navy-400 hover:text-snp-navy-600 transition-colors"
                title="Edit collection"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-snp-navy-200 bg-white hover:bg-snp-navy-50 flex items-center justify-center text-snp-navy-400 hover:text-snp-navy-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky budget strip ──────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-snp-navy-100 shadow-[0px_1px_8px_rgba(1,39,84,0.06)]">
        <div className="max-w-[1200px] mx-auto px-8 h-[48px] flex items-center gap-2.5 overflow-x-auto">

          {/* Country */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCountryMenu(v => !v)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-snp-navy-700 hover:text-snp-navy-950 transition-colors whitespace-nowrap"
            >
              <span className="text-[14px] leading-none">{country.flag}</span>
              PREVIEW FOR {country.name.toUpperCase()}
              <ChevronDown className="w-3 h-3 text-snp-navy-400" />
            </button>
            {showCountryMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-snp-navy-200 rounded-[14px] shadow-[0px_8px_24px_rgba(1,39,84,0.12)] z-40 py-1 min-w-[160px]">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCountry(c.code); setShowCountryMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] hover:bg-snp-navy-50 transition-colors text-left"
                  >
                    <span>{c.flag}</span>
                    <span className="flex-1 text-snp-navy-800">{c.name}</span>
                    {c.code === selectedCountry && <Check className="w-3.5 h-3.5 text-snp-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-snp-navy-200 mx-1 shrink-0" />

          {BUDGET_TABS.map(b => {
            const isSelected = selectedBudget === b.max;
            return (
              <button
                key={b.max}
                onClick={() => setSelectedBudget(isSelected ? null : b.max)}
                className="h-7 px-4 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all shrink-0"
                style={{
                  background: isSelected ? '#012754' : 'transparent',
                  color: isSelected ? 'white' : 'var(--snp-navy-500)',
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Collection Preview section ───────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-8 py-10">

        <div className="text-center mb-8">
          <h2
            className="text-[28px] font-semibold text-snp-navy-950"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Collection Preview
          </h2>
          <p className="text-[14px] text-snp-navy-500 mt-1.5">
            Recipients can choose one gift from the following options
          </p>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {visibleProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-[16px] overflow-hidden cursor-pointer group transition-all hover:shadow-[0px_6px_24px_rgba(1,39,84,0.10)] hover:-translate-y-0.5"
                style={{ border: '1px solid rgba(1,39,84,0.07)' }}
              >
                {/* Image */}
                <div className="relative aspect-square bg-[#f4f7fb] flex items-center justify-center overflow-hidden p-4">

                  {product.tags.includes('POPULAR') && (
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-widest text-snp-indigo-600 bg-white rounded-full px-2 py-0.5 shadow-[0px_1px_4px_rgba(1,39,84,0.10)]">
                      Popular
                    </span>
                  )}

                  <button
                    onClick={e => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white shadow-[0px_1px_4px_rgba(1,39,84,0.10)] flex items-center justify-center text-snp-navy-300 hover:text-snp-indigo-600 transition-colors"
                    title="Add to collection"
                  >
                    <span className="text-[16px] leading-none font-light">+</span>
                  </button>

                  {product.image.startsWith('/') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-[60px] group-hover:scale-105 transition-transform duration-300 inline-block">
                      {product.image}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="px-3.5 py-3 border-t" style={{ borderColor: 'rgba(1,39,84,0.06)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-snp-indigo-600 mb-0.5">{product.brand}</p>
                  <p className="text-[13px] font-medium text-snp-navy-900 leading-snug line-clamp-2">{product.name}</p>
                  {product.colors.length > 1 && (
                    <p className="text-[11px] font-semibold text-snp-indigo-500 mt-1.5">+ More Options Available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : selectedBudget !== null ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-5xl">🎁</span>
            <div>
              <p className="text-[16px] font-semibold text-snp-navy-700 mb-1">No products in this range</p>
              <p className="text-[13px] text-snp-navy-400">Try a higher budget to include more items.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="text-4xl mb-1">☝️</div>
            <p className="text-[14px] text-snp-navy-500 font-medium">Select a budget above to preview what recipients will see</p>
          </div>
        )}
      </div>

      {/* ── More gift collections ─────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-8 pb-14">
        <h3
          className="text-[22px] font-semibold text-snp-navy-950 mb-5"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          More gift collections to love
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {MORE_COLLECTIONS.map((col, i) => (
            <div
              key={i}
              className="bg-white rounded-[16px] overflow-hidden cursor-pointer hover:shadow-[0px_4px_16px_rgba(1,39,84,0.08)] transition-all"
              style={{ border: '1px solid rgba(1,39,84,0.07)' }}
            >
              <div
                className="h-[100px] flex items-center justify-center text-[48px]"
                style={{ background: col.bg }}
              >
                {col.emoji}
              </div>
              <div className="px-3.5 py-3">
                <p className="text-[13px] font-semibold text-snp-navy-900 leading-snug mb-1">{col.name}</p>
                <p className="text-[11px] text-snp-navy-400 mb-2">{col.curator}</p>
                <span className="text-[11px] font-bold text-snp-indigo-600 bg-snp-indigo-50 rounded-full px-2.5 py-0.5">
                  ${col.budget}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="border-t border-snp-navy-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-bold text-snp-navy-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>snappy</span>
            <span className="text-[12px] text-snp-navy-400">33 Irving Place, #5021, New York, NY, US 10003</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[12px] text-snp-navy-400 hover:text-snp-navy-700 transition-colors">Terms & Conditions</button>
            <button className="text-[12px] text-snp-navy-400 hover:text-snp-navy-700 transition-colors">Privacy Notice</button>
          </div>
        </div>
      </div>

    </div>
  );
}
