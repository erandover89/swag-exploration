import { useState } from 'react';
import { Upload, Sparkles, X, Check, Globe, Loader2, ArrowRight } from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY, DESIGNS, type Design } from '../data/mockData';
import { LogoInput, type LogoInputRenderReadyArgs, type BrandDetails } from './LogoInput';
import { SCORE_LABEL, SCORE_COLORS, SEVERITY_COLORS } from '../utils/logoAnalysis';
import { useCompanyLogo } from '../context/CompanyLogoContext';

interface LogoHeroProps {
  // Catalog variant (default)
  onCreateCollection?: () => void;
  onLogoReady?: (logoUrl: string, domain: string, brand: BrandDetails) => void;
  // Copy overrides for alternate variants
  badge?: string;
  headline?: React.ReactNode;
  // Override the CTA button label (default: "Get started →")
  ctaLabel?: string;
  // Override the floating showcase product IDs (default: SHOWCASE_IDS)
  productIds?: string[];
  // Override the entire ready state (e.g. Quick Start → single CTA)
  renderReadyOverride?: (args: LogoInputRenderReadyArgs) => React.ReactNode;
  // Bypass the in-place loading animation and navigate immediately
  onImmediateSubmit?: (logoUrl: string, domain: string) => void;
  // Pre-load the component in the ready state with an existing logo URL
  initialLogoUrl?: string;
  // When true, don't fall back to contextLogo if initialLogoUrl is undefined
  noContextFallback?: boolean;
  // Active designs to show as quick-select options (defaults to DESIGNS from mockData)
  designs?: Design[];
}

const SHOWCASE_IDS = ['1', '2', '9'];

function ShowcaseImg({ image, className }: { image: string; className: string }) {
  return image.startsWith('/')
    ? <img src={image} alt="" className={className} />
    : <span className="text-[52px] leading-none">{image}</span>;
}

const SPARKLES = [
  { size: 13, top: '20%', left: '17%',  color: 'var(--snp-indigo-600)', delay: '0s',   dur: '2.8s' },
  { size: 9,  top: '70%', left: '22%',  color: 'var(--snp-purple-700)', delay: '1.1s', dur: '3.3s' },
  { size: 11, top: '18%', right: '17%', color: 'var(--snp-indigo-600)', delay: '0.6s', dur: '2.5s' },
  { size: 7,  top: '74%', right: '19%', color: 'var(--snp-amber-500)',  delay: '1.6s', dur: '3.6s' },
  { size: 8,  top: '48%', left: '11%',  color: 'var(--snp-purple-700)', delay: '0.3s', dur: '4.0s' },
] as { size: number; top: string; left?: string; right?: string; color: string; delay: string; dur: string }[];


export function LogoHero({
  onCreateCollection, onLogoReady,
  badge = 'Instant Brand Preview',
  designs: designsProp,
  headline = <>See your logo on <span style={{
    background: 'linear-gradient(90deg, var(--snp-indigo-600) 0%, var(--snp-purple-700) 50%, var(--snp-indigo-600) 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'lhero-shimmer 3s linear infinite',
  }}>swag.</span></>,
  ctaLabel = 'Get started →',
  productIds,

  renderReadyOverride,
  onImmediateSubmit,
  initialLogoUrl,
  noContextFallback = false,
}: LogoHeroProps) {
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [heroBrand, setHeroBrand] = useState<BrandDetails | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const { logoUrl: contextLogo, saveLogo, activateBrandSet, clearLogo, allBrandSets } = useCompanyLogo();

  // Show real persisted brand sets if any exist, otherwise fall back to demo designs
  const activeDesigns: Design[] = allBrandSets.length > 0
    ? allBrandSets.map(bs => ({ id: bs.id, name: bs.companyName || 'My Brand', logoUrl: bs.logoUrl, productIds: [], createdAt: bs.createdAt, updatedAt: bs.createdAt }))
    : (designsProp ?? DESIGNS);

  // Use prop override if provided; fall back to context only when allowed
  const effectiveInitialUrl = noContextFallback ? initialLogoUrl : (initialLogoUrl ?? contextLogo ?? undefined);

  // Auto-save to context when a logo becomes ready
  function handleLogoReady(url: string, d: string, brand: BrandDetails) {
    saveLogo(url);
    setHeroBrand(brand);
    onLogoReady?.(url, d, brand);
  }

  function handleDesignSelect(design: Design) {
    setSelectedDesignId(design.id);
    // If this is a persisted brand set, restore it; otherwise treat as a new logo
    const isRealBrandSet = allBrandSets.some(bs => bs.id === design.id);
    if (isRealBrandSet) {
      activateBrandSet(design.id);
      setHeroBrand({ companyName: design.name, brandColor: null, description: null });
      onLogoReady?.(design.logoUrl ?? '', design.name, { companyName: design.name, brandColor: null, description: null });
    } else {
      handleLogoReady(design.logoUrl ?? '', design.name, { companyName: design.name, brandColor: null, description: null });
    }
  }

  // Auto-save to context on immediate submit (bypasses loading animation)
  function handleImmediateSubmit(url: string, domain: string) {
    saveLogo(url);
    onImmediateSubmit?.(url, domain);
  }

  const showcaseProducts = (productIds ?? SHOWCASE_IDS)
    .slice(0, 2)
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as typeof PRODUCTS;

  return (
    <div
      className="relative overflow-hidden border-b border-snp-navy-200"
      style={{ background: 'linear-gradient(150deg, #eef4ff 0%, #f9fbff 55%, #f2eeff 100%)' }}
    >
      {/* ── CSS keyframe animations ── */}
      <style>{`
        @keyframes lhero-float-a {
          0%, 100% { transform: translateY(0px)   rotate(-7deg); }
          50%       { transform: translateY(-13px) rotate(-7deg); }
        }
        @keyframes lhero-float-b {
          0%, 100% { transform: translateY(-5px) rotate(6deg); }
          50%       { transform: translateY(8px)  rotate(6deg); }
        }
        @keyframes lhero-shimmer {
          0%   { background-position: 0%   center; }
          100% { background-position: 200% center; }
        }
        @keyframes lhero-twinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.8)  rotate(0deg);  }
          50%       { opacity: 0.85; transform: scale(1.25) rotate(22deg); }
        }
        @keyframes lhero-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes lhero-badge-glow {
          0%, 100% { box-shadow: 0 0 0 0   rgba(48,119,201,0.15); }
          50%       { box-shadow: 0 0 0 5px rgba(48,119,201,0);    }
        }
      `}</style>

      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(48,119,201,0.055) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft glow orbs */}
      <div
        className="absolute -top-24 right-[18%] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(48,119,201,0.10) 0%, transparent 65%)' }}
      />
      <div
        className="absolute -bottom-20 left-[8%] w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 65%)' }}
      />

      {/* Sparkle decorations */}
      {SPARKLES.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none hidden lg:block"
          style={{
            top: s.top,
            ...(s.left  ? { left:  s.left  } : {}),
            ...(s.right ? { right: s.right } : {}),
            animation: `lhero-twinkle ${s.dur} ease-in-out infinite ${s.delay}`,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 14 14" fill="none">
            <path d="M7 0L8.1 5.6L14 7L8.1 8.4L7 14L5.9 8.4L0 7L5.9 5.6Z" fill={s.color} />
          </svg>
        </div>
      ))}

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-[120px]">
        <LogoInput
          onReady={(url, d) => { saveLogo(url); onLogoReady?.(url, d, heroBrand ?? { companyName: d, brandColor: null, description: null }); }}
          onImmediateSubmit={onImmediateSubmit ? handleImmediateSubmit : undefined}
          onPhaseChange={(phase) => { if (phase === 'idle') { clearLogo(); setHeroBrand(null); } }}
          initialLogoUrl={effectiveInitialUrl}
          renderIdle={({ triggerFileInput, fetchFromDomain, isFetchingDomain }) => (
            <div className="flex items-center gap-4 py-5 md:py-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

              {/* Left floating product card */}
              <div className="hidden xl:flex items-center justify-end w-[150px] shrink-0 pr-2">
                <div style={{ animation: 'lhero-float-a 4s ease-in-out infinite' }}>
                  {showcaseProducts[0] && (
                    <div className="relative w-[118px] h-[138px] bg-white rounded-[18px] overflow-hidden border border-[#e0ecfb] shadow-[0_16px_48px_rgba(48,119,201,0.13),0_2px_8px_rgba(48,119,201,0.06)]">
                      <ShowcaseImg image={showcaseProducts[0].image} className="w-full h-full object-contain p-3" />
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 rounded-full px-1.5 py-0.5 shadow-sm border border-[#e8f0fb] whitespace-nowrap">
                        <span className="text-[6px] font-black tracking-widest leading-none" style={{ color: MOCK_COMPANY.logoColor }}>
                          {MOCK_COMPANY.logo}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Center content */}
              <div className="flex-1 min-w-0 text-center">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 bg-snp-navy-100 border border-[#c8dff0] rounded-full px-3.5 py-1.5 mb-3"
                  style={{
                    animation: 'lhero-fade-up 0.4s ease both, lhero-badge-glow 2.5s ease-in-out infinite 0.8s',
                  }}
                >
                  <Sparkles className="w-3 h-3 text-snp-indigo-600" />
                  <span className="text-[10px] font-bold text-snp-indigo-600 uppercase tracking-[0.18em]">
                    {badge}
                  </span>
                </div>

                {/* Headline */}
                <h2
                  className="text-[26px] md:text-[32px] font-bold text-snp-navy-950 leading-tight mb-2.5"
                  style={{
                    fontFamily: "'Clash Display', 'DM Sans', sans-serif",
                    animation: 'lhero-fade-up 0.4s ease 0.1s both',
                  }}
                >
                  {headline}
                </h2>

                {/* Primary — domain input */}
                <div
                  className="flex items-center h-[44px] rounded-[12px] border bg-white overflow-hidden transition-all focus-within:border-snp-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(48,119,201,0.12)]"
                  style={{ borderColor: '#c7daf5', animation: 'lhero-fade-up 0.4s ease 0.15s both', boxShadow: '0 2px 10px rgba(48,119,201,0.10)' }}
                >
                  <Globe className="w-3.5 h-3.5 text-snp-navy-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="yourcompany.com"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') fetchFromDomain(domainInput); }}
                    className="h-full px-2.5 text-[13px] text-snp-navy-900 placeholder-snp-navy-300 outline-none bg-transparent w-[175px]"
                  />
                  <button
                    onClick={() => fetchFromDomain(domainInput)}
                    disabled={!domainInput.trim() || isFetchingDomain}
                    className="h-full px-4 flex items-center gap-1.5 text-[13px] font-semibold text-white transition-all border-l border-[#c7daf5] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    style={{ background: '#3077c9' }}
                  >
                    {isFetchingDomain
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><ArrowRight className="w-4 h-4" /> Fetch logo</>
                    }
                  </button>
                </div>

                {/* Secondary — upload link */}
                <button
                  onClick={triggerFileInput}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-snp-navy-400 hover:text-snp-indigo-600 transition-colors"
                  style={{ animation: 'lhero-fade-up 0.4s ease 0.20s both' }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  or upload a file
                </button>

                {/* Saved designs quick-select */}
                {activeDesigns.length > 0 && (
                  <div
                    className="mt-4"
                    style={{ animation: 'lhero-fade-up 0.4s ease 0.42s both' }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="h-px w-12 bg-snp-navy-200" />
                      <span className="text-[11px] text-snp-navy-400 font-medium whitespace-nowrap">or pick an existing brand</span>
                      <div className="h-px w-12 bg-snp-navy-200" />
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {activeDesigns.map(design => {
                        const isSelected = selectedDesignId === design.id;
                        return (
                          <button
                            key={design.id}
                            onClick={() => handleDesignSelect(design)}
                            className="flex flex-col items-center gap-1.5 group"
                          >
                            <div
                              className={`w-12 h-12 rounded-[14px] bg-snp-navy-100 flex items-center justify-center overflow-hidden transition-all border-2 relative ${
                                isSelected
                                  ? 'border-snp-indigo-600 shadow-[0_0_0_3px_rgba(48,119,201,0.15)]'
                                  : 'border-snp-navy-200 hover:border-snp-indigo-600 hover:shadow-[0_0_0_3px_rgba(48,119,201,0.10)]'
                              }`}
                              style={{ boxShadow: isSelected ? '0 0 0 3px rgba(48,119,201,0.15)' : undefined }}
                            >
                              <span className="text-[12px] font-bold text-snp-navy-400 select-none">
                                {design.name.charAt(0).toUpperCase()}
                              </span>
                              <img
                                src={design.logoUrl ?? ''}
                                alt={design.name}
                                className="absolute inset-0 w-full h-full object-contain p-2 bg-white"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                            <span className={`text-[10px] font-medium transition-colors leading-none ${isSelected ? 'text-snp-indigo-600' : 'text-snp-navy-500 group-hover:text-snp-indigo-600'}`}>
                              {design.name}
                            </span>
                            {isSelected && (
                              <div className="flex items-center gap-0.5">
                                <div className="w-1 h-1 rounded-full bg-snp-indigo-600" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right floating product card */}
              <div className="hidden xl:flex items-center justify-start w-[150px] shrink-0 pl-2">
                <div style={{ animation: 'lhero-float-b 3.6s ease-in-out infinite 0.9s' }}>
                  {showcaseProducts[1] && (
                    <div className="relative w-[106px] h-[124px] bg-white rounded-[16px] overflow-hidden border border-[#ede8f7] shadow-[0_16px_40px_rgba(124,58,237,0.11),0_2px_8px_rgba(124,58,237,0.06)]">
                      <ShowcaseImg image={showcaseProducts[1].image} className="w-full h-full object-contain p-3" />
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 rounded-full px-1.5 py-0.5 shadow-sm border border-[#ede8f7] whitespace-nowrap">
                        <span className="text-[6px] font-black tracking-widest leading-none" style={{ color: MOCK_COMPANY.logoColor }}>
                          {MOCK_COMPANY.logo}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          renderReady={renderReadyOverride ?? (({ logoUrl: readyLogoUrl, brand: readyBrand, onReset, analysis }) => {
            // Sync brand details into hero state when they arrive
            if (readyBrand.companyName && readyBrand !== heroBrand) setHeroBrand(readyBrand);
            return (
            <div className="flex items-center gap-4 py-5 md:py-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

              {/* Left floating product card — mirrors idle */}
              <div className="hidden xl:flex items-center justify-end w-[150px] shrink-0 pr-2">
                <div style={{ animation: 'lhero-float-a 4s ease-in-out infinite' }}>
                  {showcaseProducts[0] && (
                    <div className="relative w-[118px] h-[138px] bg-white rounded-[18px] overflow-hidden border border-[#e0ecfb] shadow-[0_16px_48px_rgba(48,119,201,0.13),0_2px_8px_rgba(48,119,201,0.06)]">
                      <ShowcaseImg image={showcaseProducts[0].image} className="w-full h-full object-contain p-3" />
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 rounded-lg px-1 py-0.5 shadow-sm border border-[#e8f0fb] flex items-center justify-center" style={{ minWidth: 28 }}>
                        <img src={readyLogoUrl} alt="" className="h-3 w-auto object-contain max-w-[36px]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Center — logo display + actions */}
              <div className="flex-1 min-w-0 flex flex-col items-center gap-4 text-center">

                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 bg-snp-navy-100 border border-[#c8dff0] rounded-full px-3.5 py-1.5"
                  style={{ animation: 'lhero-fade-up 0.35s ease both' }}
                >
                  <Sparkles className="w-3 h-3 text-snp-indigo-600" />
                  <span className="text-[10px] font-bold text-snp-indigo-600 uppercase tracking-[0.18em]">{badge}</span>
                </div>

                {/* Logo card */}
                <div className="relative" style={{ animation: 'lhero-fade-up 0.35s ease 0.08s both' }}>
                  <div className="w-[100px] h-[100px] bg-white rounded-[22px] border-2 border-snp-navy-200 shadow-[0_16px_40px_rgba(48,119,201,0.14),0_2px_8px_rgba(48,119,201,0.06)] flex items-center justify-center overflow-hidden">
                    <img src={readyLogoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                  </div>
                  <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-[#22c55e] border-2 border-white flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                </div>

                {/* Quality analysis panel */}
                {analysis && (
                  <div
                    className="flex flex-col items-center gap-2"
                    style={{ animation: 'lhero-fade-up 0.35s ease 0.11s both' }}
                  >
                    {/* Score row */}
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {/* Score pill */}
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                        style={{
                          background: SCORE_COLORS[analysis.score].bg,
                          color: SCORE_COLORS[analysis.score].text,
                          borderColor: SCORE_COLORS[analysis.score].border,
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: SCORE_COLORS[analysis.score].dot }}
                        />
                        {SCORE_LABEL[analysis.score]} quality
                      </div>

                      {/* File type badge */}
                      <div className="px-2 py-1 rounded-full text-[10px] font-semibold bg-snp-navy-100 text-snp-navy-500 border border-snp-navy-200 uppercase tracking-wide">
                        {analysis.fileType === 'svg' ? 'SVG · Vector' : `${analysis.fileType.toUpperCase()} · ${analysis.width}×${analysis.height}px`}
                      </div>
                    </div>

                    {/* Issue chips — errors + warnings only, max 2 */}
                    {analysis.issues.filter(i => i.severity !== 'info').slice(0, 2).length > 0 && (
                      <div className="flex flex-col items-center gap-1 w-full max-w-[320px]">
                        {analysis.issues.filter(i => i.severity !== 'info').slice(0, 2).map((issue, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 w-full px-3 py-2 rounded-[10px] border text-left"
                            style={{
                              background: SEVERITY_COLORS[issue.severity].bg,
                              borderColor: SEVERITY_COLORS[issue.severity].border,
                            }}
                          >
                            <span
                              className="text-[11px] font-bold shrink-0 mt-px"
                              style={{ color: SEVERITY_COLORS[issue.severity].text }}
                            >
                              {SEVERITY_COLORS[issue.severity].icon}
                            </span>
                            <div>
                              <p
                                className="text-[11px] font-semibold leading-tight"
                                style={{ color: SEVERITY_COLORS[issue.severity].text }}
                              >
                                {issue.title}
                              </p>
                              <p className="text-[10px] text-snp-navy-500 leading-snug mt-0.5">
                                {issue.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Headline */}
                <div style={{ animation: 'lhero-fade-up 0.35s ease 0.14s both' }}>
                  <h2
                    className="text-[22px] md:text-[26px] font-bold text-snp-navy-950 leading-tight"
                    style={{ fontFamily: "'Clash Display', 'DM Sans', sans-serif" }}
                  >
                    {headline}
                  </h2>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-2" style={{ animation: 'lhero-fade-up 0.35s ease 0.20s both' }}>
                  <button
                    onClick={onCreateCollection}
                    className="h-11 px-8 rounded-[14px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: '#3077c9', boxShadow: '0 4px 14px rgba(48,119,201,0.30)' }}
                  >
                    {ctaLabel}
                  </button>
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1 text-[12px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors"
                  >
                    <X className="w-3 h-3" /> Change logo
                  </button>
                </div>

              </div>

              {/* Right floating product card — mirrors idle */}
              <div className="hidden xl:flex items-center justify-start w-[150px] shrink-0 pl-2">
                <div style={{ animation: 'lhero-float-b 3.6s ease-in-out infinite 0.9s' }}>
                  {showcaseProducts[1] && (
                    <div className="relative w-[106px] h-[124px] bg-white rounded-[16px] overflow-hidden border border-[#ede8f7] shadow-[0_16px_40px_rgba(124,58,237,0.11),0_2px_8px_rgba(124,58,237,0.06)]">
                      <ShowcaseImg image={showcaseProducts[1].image} className="w-full h-full object-contain p-3" />
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 rounded-lg px-1 py-0.5 shadow-sm border border-[#ede8f7] flex items-center justify-center" style={{ minWidth: 24 }}>
                        <img src={readyLogoUrl} alt="" className="h-2.5 w-auto object-contain max-w-[30px]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ); })}
        />
      </div>
    </div>
  );
}
