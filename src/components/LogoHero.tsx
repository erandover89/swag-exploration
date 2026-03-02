import { useState, useRef } from 'react';
import { Globe, Upload, Sparkles, Layers, ArrowDown, X, Check } from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY } from '../data/mockData';

interface LogoHeroProps {
  onCreateCollection: () => void;
  onRefineWithAI: (logoUrl: string) => void;
  onPickAndSend: () => void;
  onLogoReady?: (logoUrl: string, domain: string) => void;
}

type Phase = 'idle' | 'loading' | 'ready' | 'error';

const LOAD_STEPS = [
  { label: 'Scanning website' },
  { label: 'Extracting brand assets' },
  { label: 'Applying to products' },
  { label: 'All set!' },
];

const EXAMPLE_DOMAINS = ['stripe.com', 'airbnb.com', 'notion.so'];
const SHOWCASE_IDS = ['1', '2', '9'];

const SPARKLES = [
  { size: 13, top: '20%', left: '17%',  color: '#3077c9', delay: '0s',   dur: '2.8s' },
  { size: 9,  top: '70%', left: '22%',  color: '#7c3aed', delay: '1.1s', dur: '3.3s' },
  { size: 11, top: '18%', right: '17%', color: '#3077c9', delay: '0.6s', dur: '2.5s' },
  { size: 7,  top: '74%', right: '19%', color: '#f59e0b', delay: '1.6s', dur: '3.6s' },
  { size: 8,  top: '48%', left: '11%',  color: '#7c3aed', delay: '0.3s', dur: '4.0s' },
] as { size: number; top: string; left?: string; right?: string; color: string; delay: string; dur: string }[];

export function LogoHero({ onCreateCollection, onRefineWithAI, onPickAndSend, onLogoReady }: LogoHeroProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [domain, setDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoDomain, setLogoDomain] = useState('');
  const [loadStep, setLoadStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const foundUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showcaseProducts = SHOWCASE_IDS
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as typeof PRODUCTS;

  const runLoadAnimation = (durationMs: number, onComplete: () => void) => {
    setLoadStep(0);
    setProgress(5);
    const stepDuration = durationMs / LOAD_STEPS.length;
    for (let i = 0; i < LOAD_STEPS.length; i++) {
      setTimeout(() => {
        setLoadStep(i);
        setProgress(Math.round(((i + 1) / LOAD_STEPS.length) * 100));
      }, i * stepDuration);
    }
    setTimeout(onComplete, durationMs);
  };

  const startFetch = (d: string) => {
    const clean = d.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!clean) return;
    foundUrlRef.current = null;
    setPhase('loading');
    const url = `https://logo.clearbit.com/${clean}`;
    const img = new window.Image();
    img.onload = () => { foundUrlRef.current = url; };
    img.src = url;
    runLoadAnimation(2800, () => {
      if (foundUrlRef.current) {
        setLogoUrl(foundUrlRef.current);
        setLogoDomain(clean);
        setPhase('ready');
        onLogoReady?.(foundUrlRef.current, clean);
      } else {
        setPhase('error');
      }
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      foundUrlRef.current = dataUrl;
      setPhase('loading');
      runLoadAnimation(2400, () => {
        setLogoUrl(dataUrl);
        setLogoDomain('your file');
        setPhase('ready');
        onLogoReady?.(dataUrl, 'your file');
      });
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setPhase('idle');
    setLogoUrl('');
    setLogoDomain('');
    setDomain('');
    setLoadStep(0);
    setProgress(0);
    foundUrlRef.current = null;
  };

  return (
    <div
      className="relative overflow-hidden border-b border-[#e0ebf7]"
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

        {/* ── IDLE STATE ────────────────────────────────────────────── */}
        {phase === 'idle' && (
          <div className="flex items-center gap-4 py-5 md:py-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Left floating product card */}
            <div className="hidden xl:flex items-center justify-end w-[150px] shrink-0 pr-2">
              <div style={{ animation: 'lhero-float-a 4s ease-in-out infinite' }}>
                {showcaseProducts[0] && (
                  <div className="relative w-[118px] h-[138px] bg-white rounded-[18px] overflow-hidden border border-[#e0ecfb] shadow-[0_16px_48px_rgba(48,119,201,0.13),0_2px_8px_rgba(48,119,201,0.06)]">
                    <img src={showcaseProducts[0].image} alt="" className="w-full h-full object-cover" />
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
                className="inline-flex items-center gap-2 bg-[#eaf1fa] border border-[#c8dff0] rounded-full px-3.5 py-1.5 mb-3"
                style={{
                  animation: 'lhero-fade-up 0.4s ease both, lhero-badge-glow 2.5s ease-in-out infinite 0.8s',
                }}
              >
                <Sparkles className="w-3 h-3 text-[#3077c9]" />
                <span className="text-[10px] font-bold text-[#3077c9] uppercase tracking-[0.18em]">
                  Instant Brand Preview
                </span>
              </div>

              {/* Headline */}
              <h2
                className="text-[26px] md:text-[32px] font-bold text-[#012754] leading-tight mb-2.5"
                style={{
                  fontFamily: "'Clash Display', 'DM Sans', sans-serif",
                  animation: 'lhero-fade-up 0.4s ease 0.1s both',
                }}
              >
                See your logo on{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #3077c9 0%, #7c3aed 50%, #3077c9 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'lhero-shimmer 3s linear infinite',
                  }}
                >
                  swag.
                </span>
              </h2>

              {/* On-demand benefits */}
              <div
                className="flex items-center justify-center gap-2 flex-wrap mb-3"
                style={{ animation: 'lhero-fade-up 0.4s ease 0.15s both' }}
              >
                {[
                  'Order 1 or 10,000 — you decide',
                  'Expert design support for bulk orders',
                  'Shipped worldwide',
                ].map(label => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-1.5 bg-white rounded-full border border-[#e0ebf7] px-2.5 py-1"
                    style={{ boxShadow: '0 1px 4px rgba(48,119,201,0.06)' }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                      <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                        <path d="M1 3L2.8 5L6 1" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#59728f] whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>

              {/* Input row */}
              <div
                className="flex gap-2 mb-2 max-w-[440px] mx-auto"
                style={{ animation: 'lhero-fade-up 0.4s ease 0.25s both' }}
              >
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8093a9]" />
                  <input
                    type="text"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && domain.trim() && startFetch(domain)}
                    placeholder="yourcompany.com"
                    className="w-full h-[44px] pl-10 pr-4 rounded-[12px] text-[14px] text-[#012754] placeholder:text-[#b7cfec] focus:outline-none transition-all bg-white"
                    style={{ border: '1.5px solid #e0ebf7', boxShadow: '0 2px 8px rgba(48,119,201,0.06)' }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#3077c9';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,119,201,0.10), 0 2px 8px rgba(48,119,201,0.06)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e0ebf7';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(48,119,201,0.06)';
                    }}
                  />
                </div>
                <button
                  onClick={() => domain.trim() && startFetch(domain)}
                  disabled={!domain.trim()}
                  className="h-[44px] px-5 rounded-[12px] text-[13px] font-bold text-white shrink-0 transition-all"
                  style={{
                    background: domain.trim()
                      ? 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)'
                      : '#d4e3f5',
                    boxShadow: domain.trim() ? '0 4px 14px rgba(48,119,201,0.28)' : 'none',
                  }}
                >
                  Preview →
                </button>
              </div>

              {/* Upload + examples */}
              <div
                className="flex items-center justify-center gap-3 flex-wrap"
                style={{ animation: 'lhero-fade-up 0.4s ease 0.35s both' }}
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-[#8093a9] hover:text-[#3077c9] transition-colors"
                >
                  <Upload className="w-3 h-3" /> Upload logo
                </button>
                <span className="text-[#d0dae6] select-none">·</span>
                <span className="text-[11px] text-[#a6b3c3]">Try:</span>
                {EXAMPLE_DOMAINS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDomain(d); startFetch(d); }}
                    className="text-[11px] font-medium text-[#59728f] bg-white rounded-full px-2.5 py-0.5 border border-[#e0ebf7] hover:border-[#3077c9] hover:text-[#3077c9] transition-all"
                    style={{ boxShadow: '0 1px 4px rgba(48,119,201,0.06)' }}
                  >
                    {d}
                  </button>
                ))}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            </div>

            {/* Right floating product card */}
            <div className="hidden xl:flex items-center justify-start w-[150px] shrink-0 pl-2">
              <div style={{ animation: 'lhero-float-b 3.6s ease-in-out infinite 0.9s' }}>
                {showcaseProducts[1] && (
                  <div className="relative w-[106px] h-[124px] bg-white rounded-[16px] overflow-hidden border border-[#ede8f7] shadow-[0_16px_40px_rgba(124,58,237,0.11),0_2px_8px_rgba(124,58,237,0.06)]">
                    <img src={showcaseProducts[1].image} alt="" className="w-full h-full object-cover" />
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

        {/* ── LOADING STATE ─────────────────────────────────────────── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8 md:py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Progress ring */}
            <div className="relative w-20 h-20 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(48,119,201,0.12)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#3077c9"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-bold text-[#3077c9]">{progress}%</span>
              </div>
            </div>

            <h3
              className="text-[22px] font-bold text-[#012754] mb-1.5"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              {LOAD_STEPS[Math.min(loadStep, LOAD_STEPS.length - 1)].label}
            </h3>
            <p className="text-[13px] text-[#8093a9] mb-8">This takes just a moment...</p>

            {/* Step list */}
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              {LOAD_STEPS.map((step, i) => {
                const done   = i < loadStep;
                const active = i === loadStep;
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: done ? '#3077c9' : active ? 'rgba(48,119,201,0.12)' : '#f0f4f8',
                        border: active ? '1.5px solid #3077c9' : done ? 'none' : '1.5px solid #e0ebf7',
                      }}
                    >
                      {done   && <Check className="w-2.5 h-2.5 text-white" />}
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#3077c9] animate-pulse" />}
                    </div>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: done ? '#3077c9' : active ? '#012754' : '#a6b3c3' }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ERROR STATE ───────────────────────────────────────────── */}
        {phase === 'error' && (
          <div className="flex flex-col items-center justify-center py-7 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div className="w-12 h-12 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center mb-3">
              <X className="w-5 h-5 text-[#ef4444]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#012754] mb-1">Logo not found</h3>
            <p className="text-[13px] text-[#8093a9] mb-5 max-w-[260px]">
              We couldn't find a logo for "{domain}". Try a different domain or upload your file.
            </p>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="h-9 px-5 rounded-[10px] border border-[#e0ebf7] text-[#59728f] text-[13px] font-semibold hover:bg-[#f5f8fc] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-5 rounded-[10px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
              >
                Upload Logo
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        )}

        {/* ── READY STATE ───────────────────────────────────────────── */}
        {phase === 'ready' && (
          <div className="py-4 md:py-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Logo confirmation strip */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-white rounded-[10px] border border-[#e0ebf7] shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest">Logo ready</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#012754]">{logoDomain}</span>
                </div>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[#8093a9] hover:text-[#3077c9] transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" /> Change
              </button>
            </div>

            {/* 3 Action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

              {/* Create Collection */}
              <button
                onClick={onCreateCollection}
                className="group text-left bg-white rounded-[16px] p-4 border border-[#e0ebf7] hover:border-[#3077c9] hover:shadow-[0_8px_24px_rgba(48,119,201,0.12)] transition-all"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#eaf1fa] border border-[#c8dff0] flex items-center justify-center shrink-0">
                    <Layers style={{ width: 14, height: 14 }} className="text-[#3077c9]" />
                  </div>
                  <p className="text-[13px] font-bold text-[#012754]">Create a Swag Collection</p>
                </div>
                <p className="text-[11px] text-[#8093a9] leading-relaxed mb-2">
                  Let recipients choose their favorite branded item
                </p>
                <div className="flex items-center gap-1 text-[#3077c9] text-[10px] font-semibold">
                  Get started <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </button>

              {/* Refine with AI */}
              <button
                onClick={() => onRefineWithAI(logoUrl)}
                className="group text-left bg-white rounded-[16px] p-4 border border-[#e0ebf7] hover:border-[#7c3aed] hover:shadow-[0_8px_24px_rgba(124,58,237,0.12)] transition-all"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#f5f3ff] border border-[#e0d9f7] flex items-center justify-center shrink-0">
                    <Sparkles style={{ width: 14, height: 14 }} className="text-[#7c3aed]" />
                  </div>
                  <p className="text-[13px] font-bold text-[#012754]">Refine with AI</p>
                </div>
                <p className="text-[11px] text-[#8093a9] leading-relaxed mb-2">
                  Personalize colors, placement, and style with AI
                </p>
                <div className="flex items-center gap-1 text-[#7c3aed] text-[10px] font-semibold">
                  Open AI studio <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </button>

              {/* Browse catalog */}
              <button
                onClick={onPickAndSend}
                className="group text-left bg-white rounded-[16px] p-4 border border-[#e0ebf7] hover:border-[#059669] hover:shadow-[0_8px_24px_rgba(5,150,105,0.10)] transition-all"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center shrink-0">
                    <ArrowDown style={{ width: 14, height: 14 }} className="text-[#059669]" />
                  </div>
                  <p className="text-[13px] font-bold text-[#012754]">Pick &amp; Send an Item</p>
                </div>
                <p className="text-[11px] text-[#8093a9] leading-relaxed mb-2">
                  Browse the catalog and choose something specific
                </p>
                <div className="flex items-center gap-1 text-[#059669] text-[10px] font-semibold">
                  Browse catalog <span className="group-hover:translate-x-1 transition-transform inline-block">↓</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
