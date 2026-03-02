import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ChevronDown, RotateCcw, ArrowRight, Check, Globe2 } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

// ── Static data ────────────────────────────────────────────────────────────────

const PAST_CAMPAIGNS = [
  { id: 'c1', name: 'New Hire Welcome Kit',   date: 'Jan 15, 2025', sent: 24, spent: 1200, emoji: '🎁' },
  { id: 'c2', name: 'Holiday Team Gift 2024', date: 'Dec 10, 2024', sent: 18, spent: 900,  emoji: '🎄' },
  { id: 'c3', name: 'Sales Q4 Kickoff Swag',  date: 'Nov 5, 2024',  sent: 12, spent: 780,  emoji: '👕' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States',  flag: '🇺🇸' },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany',        flag: '🇩🇪' },
  { code: 'FR', name: 'France',         flag: '🇫🇷' },
  { code: 'AU', name: 'Australia',      flag: '🇦🇺' },
  { code: 'NL', name: 'Netherlands',    flag: '🇳🇱' },
  { code: 'IL', name: 'Israel',         flag: '🇮🇱' },
];

type GiftCollection = {
  id: string; name: string; sub: string;
  ai?: true; productIds?: string[];
};

const GIFT_COLLECTIONS: GiftCollection[] = [
  { id: 'ai',       name: 'Create with AI',      sub: 'Build the perfect gift in seconds', ai: true },
  { id: 'snappys',  name: "Snappy's Picks",       sub: 'Most loved this month',             productIds: ['1', '2', '13', '15'] },
  { id: 'wellness', name: 'Wellness & Outdoors',  sub: 'For the active & mindful',          productIds: ['2', '16', '15', '1']  },
  { id: 'office',   name: 'Office Essentials',    sub: 'Everyday work staples',             productIds: ['14', '13', '18', '9'] },
  { id: 'tech',     name: 'Tech & Gear',          sub: "Gadgets they'll actually use",      productIds: ['12', '19', '2', '14'] },
];

// ── Campaign card ──────────────────────────────────────────────────────────────

type Campaign = typeof PAST_CAMPAIGNS[number];

function CampaignCard({ c }: { c: Campaign }) {
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#f8fafc] hover:bg-[#f0f6ff] border border-transparent hover:border-[#c7d7f4] transition-all cursor-pointer">
      <div className="w-8 h-8 rounded-[9px] bg-white border border-[#e0ebf7] flex items-center justify-center text-base shrink-0 shadow-sm">
        {c.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#012754] truncate leading-tight">{c.name}</p>
        <p className="text-[11px] text-[#8093a9] mt-0.5">{c.sent} recipients · ${c.spent.toLocaleString()} · {c.date}</p>
      </div>
      <button
        className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#3077c9] opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-[#c7d7f4] rounded-[7px] px-2.5 py-1 hover:bg-[#f0f6ff]"
        onClick={e => { e.stopPropagation(); alert(`Repeating "${c.name}"…`); }}
      >
        Send Again <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Collection card ────────────────────────────────────────────────────────────

function CollectionCard({ col, onClick }: { col: GiftCollection; onClick: () => void }) {
  const products = (col.productIds ?? [])
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (col.ai) {
    return (
      <button
        onClick={onClick}
        className="group flex flex-col text-left rounded-[20px] overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-[0px_20px_48px_rgba(109,40,217,0.32)]"
        style={{ background: 'linear-gradient(150deg, #060e27 0%, #0f1e58 45%, #4a1d96 100%)' }}
      >
        {/* Visual area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 relative overflow-hidden min-h-[120px]">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 80%, rgba(109,40,217,0.55) 0%, transparent 65%)' }} />
          {/* Scattered stars */}
          <div className="absolute top-[14%] right-[22%] w-1   h-1   rounded-full bg-white opacity-30" />
          <div className="absolute top-[28%] right-[38%] w-1.5 h-1.5 rounded-full bg-purple-300 opacity-25" />
          <div className="absolute top-[52%] left-[18%] w-1   h-1   rounded-full bg-white opacity-20" />
          <div className="absolute top-[20%] left-[30%] w-1   h-1   rounded-full bg-white opacity-35" />
          <div className="absolute bottom-[22%] right-[16%] w-1.5 h-1.5 rounded-full bg-blue-300 opacity-25" />
          {/* Icon */}
          <div
            className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <Sparkles className="w-6 h-6 text-[#c4b5fd]" />
          </div>
          <p className="relative z-10 text-white/60 text-[11px] tracking-wide">Describe your recipient →</p>
        </div>
        {/* Label */}
        <div className="px-4 pt-2.5 pb-4 border-t border-white/10">
          <p className="text-white font-bold text-[14px] leading-snug">Create with AI</p>
          <p className="text-white/50 text-[11px] mt-0.5">Build the perfect gift in seconds</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left rounded-[20px] overflow-hidden bg-white border border-[#e0ebf7] hover:border-[#3077c9] transition-all duration-200 hover:shadow-[0px_12px_32px_rgba(48,119,201,0.16)] hover:-translate-y-1"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 2×2 collage */}
      <div className="grid grid-cols-2 gap-1 p-2 bg-[#f5f8fc]">
        {products.slice(0, 4).map(p => (
          <div key={p.id} className="aspect-square rounded-[8px] overflow-hidden bg-white flex items-center justify-center">
            {p.image.startsWith('/') ? (
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl select-none">{p.image}</span>
            )}
          </div>
        ))}
      </div>
      {/* Info */}
      <div className="px-3 pt-2 pb-3">
        <p className="text-[13px] font-bold text-[#012754] leading-snug">{col.name}</p>
        <p className="text-[11px] text-[#8093a9] mt-0.5 leading-tight">{col.sub}</p>
      </div>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SendFlowModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [showSendAgain, setShowSendAgain]         = useState(true);
  const [budget, setBudget]                       = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US']);
  const [showCountryMenu, setShowCountryMenu]     = useState(false);
  const [collectionsVisible, setCollectionsVisible] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // Progressive disclosure
  useEffect(() => {
    const n = parseFloat(budget);
    setCollectionsVisible(!isNaN(n) && n >= 5 && selectedCountries.length > 0);
  }, [budget, selectedCountries]);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Click-outside for country dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node))
        setShowCountryMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleCountry = (code: string) =>
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );

  const countryLabel = () => {
    if (selectedCountries.length === 0) return 'Select countries';
    const first = COUNTRIES.find(c => c.code === selectedCountries[0]);
    if (selectedCountries.length === 1) return first ? `${first.flag} ${first.name}` : selectedCountries[0];
    return `${first?.flag} ${first?.name} +${selectedCountries.length - 1} more`;
  };

  const handleCollectionClick = (col: GiftCollection) => {
    const params = new URLSearchParams();
    if (!col.ai) params.set('collection', col.id);
    params.set('budget', budget);
    if (selectedCountries.length > 0) params.set('countries', selectedCountries.join(','));
    onClose();
    navigate(`/send?${params.toString()}`);
  };

  const budgetNum = parseFloat(budget);
  const budgetValid = !isNaN(budgetNum) && budgetNum >= 5;

  return (
    <div
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @keyframes sfPageIn {
          from { opacity: 0; transform: translateY(28px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0)   scale(1);     }
        }
        @keyframes sfCollectionsIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .sf-root        { animation: sfPageIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .sf-collections { animation: sfCollectionsIn 0.38s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="sf-root min-h-screen flex flex-col">

        {/* ── Nav bar ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#f0f4f8] flex items-center justify-between px-6 md:px-14 py-4">
          <div className="flex items-center gap-2.5">
            <svg width="32" height="20" viewBox="0 0 37 23" fill="none">
              <path d="M1 17C5 17 7 5 12 5C17 5 17 19 22 19C27 19 27 9 32 9C34.5 9 36 11 36 11" stroke="#3077c9" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-[12px] font-bold text-[#a6b3c3] tracking-[0.14em] uppercase">Send a Gift</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f8fc] hover:bg-[#e0ebf7] flex items-center justify-center text-[#8093a9] hover:text-[#345276] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Page body ─────────────────────────────────────────────── */}
        <div className="flex-1 max-w-[860px] mx-auto w-full px-6 md:px-8 pt-6 pb-8">

          {/* ── Hero ─────────────────────────────────────────────────── */}
          <div className="mb-5">
            <p className="text-[10px] font-bold text-[#3077c9] uppercase tracking-[0.15em] mb-1.5">Let's send something great</p>
            <h1
              className="leading-[1.06] mb-2"
              style={{
                fontFamily: "'Clash Display', sans-serif",
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: '#012754',
              }}
            >
              Send something{' '}
              <span style={{
                backgroundImage: 'linear-gradient(88deg, #3077c9 0%, #36d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                unforgettable.
              </span>
            </h1>
            <p className="text-[14px] text-[#59728f]">
              Set a budget and we'll surface the perfect collections for you.
            </p>
          </div>

          {/* ── Send Again ───────────────────────────────────────────── */}
          {showSendAgain && (
            <section className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3 h-3 text-[#8093a9]" />
                  <span className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest">Sent before</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-[12px] font-semibold text-[#3077c9] hover:underline">
                    See All →
                  </button>
                  <button
                    onClick={() => setShowSendAgain(false)}
                    title="Dismiss"
                    className="w-5 h-5 rounded-full bg-[#f5f8fc] hover:bg-[#e0ebf7] flex items-center justify-center text-[#8093a9] hover:text-[#345276] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {PAST_CAMPAIGNS.map(c => <CampaignCard key={c.id} c={c} />)}
              </div>
            </section>
          )}

          {/* ── Budget + Country ─────────────────────────────────────── */}
          <section className="mb-5">
            <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest mb-3">
              {showSendAgain ? 'Or start something new' : 'Start a new gift'}
            </p>

            {/* Sentence-style inputs */}
            <div
              className="flex flex-wrap items-center gap-x-2.5 gap-y-3"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              <span className="text-[#012754]" style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700 }}>
                My budget is
              </span>

              {/* $ input */}
              <div className="relative flex items-center">
                <span
                  className="absolute left-3 text-[#8093a9] pointer-events-none select-none"
                  style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700 }}
                >$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="pl-9 pr-3 h-[44px] w-[110px] border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#3077c9]/10 transition-all bg-[#f9fbff] text-[#012754]"
                  style={{
                    borderColor: budgetValid ? '#3077c9' : '#e0ebf7',
                    fontSize: 'clamp(18px, 3vw, 26px)',
                    fontWeight: 700,
                    fontFamily: "'Clash Display', sans-serif",
                  }}
                />
              </div>

              <span className="text-[#8093a9]" style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 600 }}>
                per person, sending to
              </span>

              {/* Country dropdown */}
              <div className="relative" ref={countryRef}>
                <button
                  onClick={() => setShowCountryMenu(v => !v)}
                  className="flex items-center gap-2 h-[44px] px-3 border-2 rounded-[12px] transition-all bg-[#f9fbff] text-[#012754] font-semibold"
                  style={{
                    borderColor: selectedCountries.length > 0 ? '#3077c9' : '#e0ebf7',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  <Globe2 className="w-4 h-4 text-[#8093a9] shrink-0" />
                  <span className="max-w-[180px] truncate">{countryLabel()}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8093a9] shrink-0 transition-transform duration-200 ${showCountryMenu ? 'rotate-180' : ''}`} />
                </button>
                {showCountryMenu && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-[#e0ebf7] rounded-[16px] shadow-[0px_12px_40px_rgba(1,39,84,0.14)] z-20 min-w-[220px] py-2 overflow-hidden">
                    {COUNTRIES.map(c => {
                      const sel = selectedCountries.includes(c.code);
                      return (
                        <button
                          key={c.code}
                          onClick={() => toggleCountry(c.code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-left transition-colors ${sel ? 'bg-[#f0f6ff] text-[#3077c9]' : 'text-[#345276] hover:bg-[#f5f8fc]'}`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="flex-1">{c.name}</span>
                          {sel && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Inline hint */}
            {budget && !budgetValid && (
              <p className="mt-3 text-[12px] text-[#8093a9]">Enter a budget of at least $5 to see recommendations.</p>
            )}
          </section>

          {/* ── Collections (progressive disclosure) ─────────────────── */}
          {collectionsVisible && (
            <section className="sf-collections mb-5">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest shrink-0">Choose a collection</p>
                <div className="flex-1 h-px bg-[#f0f4f8]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {GIFT_COLLECTIONS.map(col => (
                  <CollectionCard key={col.id} col={col} onClick={() => handleCollectionClick(col)} />
                ))}
              </div>
            </section>
          )}

          {/* ── Explore other paths ──────────────────────────────────── */}
          <div className={`${collectionsVisible ? 'border-t border-[#f0f4f8] pt-4' : 'pt-2'}`}>
            <p className="text-[10px] font-bold text-[#c0ccd9] uppercase tracking-widest mb-2.5 text-center">
              Or explore on your own
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { onClose(); alert('Gifts page — coming soon'); }}
                className="group flex items-center gap-3 p-3.5 rounded-[14px] bg-[#f8fafc] border border-[#e0ebf7] hover:border-[#3077c9] hover:bg-[#f0f6ff] transition-all text-left"
              >
                <span className="text-lg shrink-0">🎁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#012754] leading-tight">Browse All Gifts</p>
                  <p className="text-[11px] text-[#8093a9] mt-0.5 leading-tight">Full gifts catalog</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#c0ccd9] group-hover:text-[#3077c9] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
              <button
                onClick={() => { onClose(); navigate('/'); }}
                className="group flex items-center gap-3 p-3.5 rounded-[14px] bg-[#f8fafc] border border-[#e0ebf7] hover:border-[#7c3aed] hover:bg-[#faf5ff] transition-all text-left"
              >
                <span className="text-lg shrink-0">👕</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#012754] leading-tight">Design & Send Swag</p>
                  <p className="text-[11px] text-[#8093a9] mt-0.5 leading-tight">Branded gear with your logo</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#c0ccd9] group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
