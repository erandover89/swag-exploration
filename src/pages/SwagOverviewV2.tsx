import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { LogoInput } from '../components/LogoInput';
import { SwagPageHeader } from './SwagOverview';
import { PRODUCTS } from '../data/mockData';

// ── Collections row ───────────────────────────────────────────────────────────
const COLLECTION_PACKAGES = [
  { id: 'pkg-c1', label: 'New Hire Kit',       desc: 'Let them pick their favorite branded item', productIds: ['1', '2', '6', '9'], price: 75,  route: '/collection/c1', accentColor: 'var(--snp-indigo-600)', accentBg: '#eef4ff' },
  { id: 'pkg-c2', label: 'Work Anniversary',   desc: 'Premium gifts for milestone moments',       productIds: ['1', '5', '2'],       price: 150, route: '/collection/c6', accentColor: 'var(--snp-amber-500)', accentBg: '#fffbeb' },
  { id: 'pkg-c3', label: 'Holiday Gift',        desc: 'Seasonal branded picks for your team',      productIds: ['2', '9', '4'],       price: 50,  route: '/collection/c2', accentColor: 'var(--snp-purple-700)', accentBg: '#f5f3ff' },
  { id: 'pkg-c4', label: 'Team Appreciation',  desc: 'Show your whole team some love',            productIds: ['1', '4', '2'],       price: 60,  route: '/collection/c9', accentColor: '#0891b2', accentBg: '#f0fafd' },
];

// ── Single items row ──────────────────────────────────────────────────────────
const SINGLE_PACKAGES = [
  { id: 'pkg-s1', label: 'Send a Hoodie', desc: 'Carhartt Midweight — a crowd favorite',        productIds: ['5'], price: 65,  route: '/product/5' },
  { id: 'pkg-s2', label: 'Send a Bottle', desc: 'Hydro Flask — always appreciated',             productIds: ['2'], price: 45,  route: '/product/2' },
  { id: 'pkg-s3', label: 'Send a Fleece', desc: 'Patagonia Synchilla — premium and iconic',     productIds: ['1'], price: 155, route: '/product/1' },
  { id: 'pkg-s4', label: 'Send a Tote',   desc: 'Baggu Canvas — sustainable and stylish',       productIds: ['6'], price: 28,  route: '/product/6' },
];

// ── Logo badge — placeholder before logo, branded after ───────────────────────
function LogoBadge({ logoUrl, size = 'md' }: { logoUrl: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 rounded-[7px]' : 'w-9 h-9 rounded-[9px]';
  if (!logoUrl) {
    return (
      <div className={`absolute bottom-2.5 right-2.5 ${dim} bg-white border-2 border-dashed border-[#d1dce8] flex items-center justify-center`}>
        <span className="text-[6px] font-black text-[#c0ccda] tracking-widest">LOGO</span>
      </div>
    );
  }
  return (
    <div
      className={`absolute bottom-2.5 right-2.5 ${dim} bg-white shadow-[0px_2px_8px_0px_rgba(1,39,84,0.12)] border border-snp-navy-200 flex items-center justify-center overflow-hidden`}
      style={{ animation: 'v2-logo-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <img src={logoUrl} alt="" className="w-full h-full object-contain p-1.5" />
    </div>
  );
}

// ── Collection card ───────────────────────────────────────────────────────────
function CollectionCard({ pkg, logoUrl }: { pkg: typeof COLLECTION_PACKAGES[number]; logoUrl: string }) {
  const navigate = useNavigate();
  const products = pkg.productIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const hasLogo = !!logoUrl;

  return (
    <div
      className="bg-white rounded-[20px] border border-snp-navy-200 overflow-hidden flex flex-col cursor-pointer group hover:shadow-[0px_16px_40px_0px_rgba(1,39,84,0.12)] hover:-translate-y-1 transition-all duration-200"
      style={{ borderTop: `3px solid ${pkg.accentColor}` }}
      onClick={() => navigate(pkg.route, { state: { logoUrl } })}
    >
      {/* 2×2 product grid */}
      <div className="relative p-3.5 h-[200px]" style={{ backgroundColor: pkg.accentBg }}>
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          {products.slice(0, 4).map(p => (
            <div
              key={p!.id}
              className="bg-white rounded-[12px] flex items-center justify-center overflow-hidden shadow-[0px_2px_6px_0px_rgba(1,39,84,0.07)] group-hover:shadow-[0px_4px_10px_0px_rgba(1,39,84,0.10)] transition-shadow"
            >
              {p!.image.startsWith('/') ? (
                <img src={p!.image} alt="" className="w-full h-full object-contain p-2" style={{ mixBlendMode: 'multiply' }} />
              ) : (
                <span className="text-2xl">{p!.image}</span>
              )}
            </div>
          ))}
        </div>
        <LogoBadge logoUrl={logoUrl} />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[15px] font-bold text-snp-navy-950 leading-snug">{pkg.label}</p>
          <p className="text-[12px] text-snp-navy-500 mt-0.5">{pkg.desc}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[13px] font-bold" style={{ color: pkg.accentColor }}>From ${pkg.price}</span>
          <div
            className="h-8 px-3.5 rounded-[9px] text-[12px] font-semibold flex items-center gap-1.5 transition-all"
            style={
              hasLogo
                ? { background: `linear-gradient(180deg, ${pkg.accentColor}dd 0%, ${pkg.accentColor} 100%)`, color: 'white' }
                : { backgroundColor: '#f0f4f8', color: 'var(--snp-navy-400)' }
            }
          >
            Send now <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single item card ──────────────────────────────────────────────────────────
function SingleCard({ pkg, logoUrl }: { pkg: typeof SINGLE_PACKAGES[number]; logoUrl: string }) {
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === pkg.productIds[0]);
  const hasLogo = !!logoUrl;

  return (
    <div
      className="bg-white rounded-[20px] border border-snp-navy-200 overflow-hidden flex flex-col cursor-pointer group hover:shadow-[0px_12px_32px_0px_rgba(1,39,84,0.10)] hover:-translate-y-1 transition-all duration-200"
      onClick={() => navigate(pkg.route, { state: { logoUrl } })}
    >
      {/* Product image */}
      <div className="bg-snp-navy-50 h-[160px] relative flex items-center justify-center overflow-hidden">
        {product?.image.startsWith('/') ? (
          <img
            src={product.image}
            alt=""
            className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-[56px]">{product?.image}</span>
        )}
        <LogoBadge logoUrl={logoUrl} size="sm" />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[14px] font-bold text-snp-navy-950 leading-snug">{pkg.label}</p>
          <p className="text-[11px] text-snp-navy-500 mt-0.5">{pkg.desc}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[12px] font-bold text-snp-indigo-600">From ${pkg.price}</span>
          <div
            className="h-7 px-3 rounded-[8px] text-[11px] font-semibold flex items-center gap-1.5 transition-all"
            style={
              hasLogo
                ? { background: '#3077c9', color: 'white' }
                : { backgroundColor: '#f0f4f8', color: 'var(--snp-navy-400)' }
            }
          >
            Send now <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function SwagOverviewV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState('');

  const hasLogo = !!logoUrl;

  const popularProducts = PRODUCTS.filter(p => p.tags.includes('POPULAR')).slice(0, 8);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="overview" />
      <style>{`
        @keyframes v2-logo-pop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes v2-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ══ SECTION 1 — Logo Hero ══════════════════════════════════════════════ */}
      <div
        className="border-b border-snp-navy-200 py-14 md:py-20"
        style={{ background: 'linear-gradient(160deg, #eef4ff 0%, #fafcff 50%, #f3eeff 100%)' }}
      >
        <div className="max-w-[560px] mx-auto px-4 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-snp-navy-200 rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
            <Sparkles className="w-3 h-3 text-snp-indigo-600" />
            <span className="text-[10px] font-bold text-snp-indigo-600 uppercase tracking-[0.18em]">Instant Brand Preview</span>
          </div>

          {/* Headline */}
          <h1
            className="text-[38px] md:text-[52px] font-bold text-snp-navy-950 leading-[1.1] mb-4"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Drop your logo,<br />start sending.
          </h1>
          <p className="text-[15px] text-snp-navy-600 mb-8 leading-relaxed">
            Enter your domain and we'll brand everything instantly — then send in 2 clicks.
          </p>

          {/* LogoInput */}
          <LogoInput
            onReady={(url) => { setLogoUrl(url); }}
            renderIdle={({ triggerFileInput }) => (
              <div>
                <button
                  onClick={triggerFileInput}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors mx-auto"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload a logo file
                </button>
              </div>
            )}
            renderReady={({ logoUrl: url, domain, onReset }) => (
              <div
                className="flex items-center gap-3 bg-white border border-snp-navy-200 rounded-[16px] px-5 py-4 max-w-[380px] mx-auto shadow-sm"
                style={{ animation: 'v2-fade-up 0.3s ease both' }}
              >
                <div className="w-10 h-10 rounded-[10px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={url} alt="" className="w-full h-full object-contain p-0.5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest">Logo applied to everything</span>
                  </div>
                  <p className="text-[13px] font-semibold text-snp-navy-950 truncate">{domain}</p>
                </div>
                <button onClick={onReset} className="text-[#c0ccda] hover:text-snp-navy-500 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* ══ SECTION 2 — Ready to Send ══════════════════════════════════════════ */}
      <div className="py-12 border-b border-snp-navy-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="text-[24px] md:text-[30px] font-semibold text-snp-navy-950 leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {hasLogo ? 'Your logo is on everything — ready to send' : 'Ready to send'}
              </h2>
              <p className="text-[14px] text-snp-navy-600 mt-1">
                {hasLogo
                  ? 'Pick a package and send in 2 clicks'
                  : 'Add your logo above to brand everything instantly'}
              </p>
            </div>
            <div className="hidden md:flex shrink-0">
              {hasLogo ? (
                <div
                  className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-3.5 py-1.5"
                  style={{ animation: 'v2-fade-up 0.3s ease both' }}
                >
                  <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span className="text-[11px] font-semibold text-[#16a34a]">Logo applied to all</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-full px-3.5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-snp-amber-500" />
                  <span className="text-[11px] font-semibold text-[#92400e]">Add your logo to activate</span>
                </div>
              )}
            </div>
          </div>

          {/* Collections row */}
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Collections</span>
              <div className="flex-1 h-px bg-snp-navy-200" />
              <span className="text-[11px] text-snp-navy-400">Pick one item from a curated set</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLLECTION_PACKAGES.map(pkg => (
                <CollectionCard key={pkg.id} pkg={pkg} logoUrl={logoUrl} />
              ))}
            </div>
          </div>

          {/* Single items row */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Single Items</span>
              <div className="flex-1 h-px bg-snp-navy-200" />
              <span className="text-[11px] text-snp-navy-400">Send one great branded product</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SINGLE_PACKAGES.map(pkg => (
                <SingleCard key={pkg.id} pkg={pkg} logoUrl={logoUrl} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3 — Popular Products ═══════════════════════════════════════ */}
      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2
                className="text-[24px] md:text-[30px] font-semibold text-snp-navy-950 leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Popular Products
              </h2>
              <p className="text-[14px] text-snp-navy-600 mt-1">Top-rated branded swag from premium brands</p>
            </div>
            <button
              onClick={() => navigate('/catalog')}
              className="hidden md:flex items-center gap-1.5 text-[13px] font-semibold text-snp-indigo-600 hover:underline shrink-0"
            >
              See entire catalog <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-2 -mx-4 md:-mx-[120px] px-4 md:px-[120px] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {popularProducts.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location, logoUrl } })}
                className="shrink-0 w-[190px] bg-white rounded-[16px] border border-snp-navy-200 overflow-hidden cursor-pointer group hover:border-snp-indigo-600 hover:shadow-[0px_8px_20px_0px_rgba(1,39,84,0.10)] transition-all"
              >
                <div className="bg-snp-navy-50 h-[150px] relative flex items-center justify-center overflow-hidden">
                  {product.image.startsWith('/') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-[52px]">{product.image}</span>
                  )}
                  <LogoBadge logoUrl={logoUrl} size="sm" />
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                  <p className="text-[12px] font-semibold text-snp-navy-950 leading-snug mb-1.5 line-clamp-2">{product.name}</p>
                  <p className="text-[12px] font-bold text-snp-indigo-600">From ${product.price}</p>
                </div>
              </div>
            ))}

            {/* See all card */}
            <div
              onClick={() => navigate('/catalog')}
              className="shrink-0 w-[140px] rounded-[16px] border-2 border-dashed border-[#c8dff5] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-snp-navy-50 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-snp-navy-400" />
              <p className="text-[11px] font-semibold text-snp-navy-500 text-center leading-snug">See entire<br />catalog</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
