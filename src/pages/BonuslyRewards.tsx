import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight, Star, Zap, Gift, Home, Trophy, Users,
         ShoppingBag, Settings, X, Check, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

// ── Bonusly brand tokens ──────────────────────────────────────────────────────
const B = {
  green:       '#4CAF50',
  greenHover:  '#43A047',
  greenLight:  '#E8F5E9',
  greenDark:   '#2E7D32',
  purple:      '#6C5CE7',
  purpleLight: '#F0EEFF',
  yellow:      '#FDCB6E',
  gray50:      '#F8F9FA',
  gray100:     '#F1F3F5',
  gray200:     '#E9ECEF',
  gray400:     '#ADB5BD',
  gray600:     '#6C757D',
  gray900:     '#2D3436',
};

// ── Preference categories for personalization ─────────────────────────────────
const PREF_CATS = [
  { key: 'Apparel',     label: 'Apparel & Gear',    emoji: '👕', color: '#4CAF50', bg: '#E8F5E9', border: '#C8E6C9' },
  { key: 'Drinkware',   label: 'Drinkware',          emoji: '☕', color: '#2196F3', bg: '#E3F2FD', border: '#BBDEFB' },
  { key: 'Electronics', label: 'Tech & Gadgets',     emoji: '🎧', color: '#9C27B0', bg: '#F3E5F5', border: '#E1BEE7' },
  { key: 'Bags',        label: 'Bags & Carry',       emoji: '🎒', color: '#FF9800', bg: '#FFF3E0', border: '#FFE0B2' },
  { key: 'Home',        label: 'Home & Decor',       emoji: '🏠', color: '#00BCD4', bg: '#E0F7FA', border: '#B2EBF2' },
  { key: 'Accessories', label: 'Accessories',        emoji: '✨', color: '#E91E63', bg: '#FCE4EC', border: '#F8BBD9' },
  { key: 'POPULAR',     label: 'Trending Now',       emoji: '🔥', color: '#FF5722', bg: '#FBE9E7', border: '#FFCCBC' },
  { key: 'PREMIUM',     label: 'Premium Picks',      emoji: '⭐', color: '#FFC107', bg: '#FFFDE7', border: '#FFF9C4' },
  { key: 'budget',      label: 'Budget-Friendly',    emoji: '💸', color: '#4CAF50', bg: '#E8F5E9', border: '#C8E6C9' },
  { key: 'splurge',     label: 'Worth Saving For',   emoji: '🏆', color: '#6C5CE7', bg: '#F0EEFF', border: '#D4CDFF' },
];

const CONFETTI_EMOJIS = ['🎉', '✨', '🌟', '🎊', '💚', '🎈', '⭐', '💫'];

function toPoints(price: number) {
  return Math.round(price * 10 / 50) * 50 || 50;
}

// ── Bonusly "b" logo mark ─────────────────────────────────────────────────────
function BonuslyMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Teardrop/leaf outer shape — pointed upper-left, rounded everywhere else */}
      <path
        d="M22 8 C10 8 6 20 6 33 C6 48 14 64 26 74 C38 84 54 90 68 86 C82 82 92 70 92 55 C92 40 84 24 68 15 C56 8 36 6 22 8 Z"
        fill="#4CAF50"
      />
      {/* White b — vertical stem */}
      <rect x="20" y="17" width="14" height="66" rx="7" fill="white" />
      {/* White b — bowl outer circle; leftmost x=34 aligns with stem right edge */}
      <circle cx="57" cy="60" r="23" fill="white" />
      {/* Green b — bowl counter (shows green through the b counter) */}
      <circle cx="57" cy="60" r="13" fill="#4CAF50" />
    </svg>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function RewardCard({ product, animDelay = 0 }: { product: (typeof PRODUCTS)[0]; animDelay?: number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pts = toPoints(product.price);
  return (
    <div
      className="flex flex-col rounded-[16px] overflow-hidden cursor-pointer group shrink-0"
      style={{
        width: 220,
        background: '#fff',
        border: `1px solid ${B.gray200}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        animation: `bonusly-fadein 0.4s ease both`,
        animationDelay: `${animDelay}ms`,
      }}
      onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location } })}
    >
      <div className="relative overflow-hidden flex items-center justify-center" style={{ height: 160, background: B.gray50 }}>
        {product.image.startsWith('/') ? (
          <img src={product.image} alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-[1.05] transition-transform duration-300"
            style={{ mixBlendMode: 'multiply' }} />
        ) : (
          <span className="text-[64px]">{product.image}</span>
        )}
        {product.tags.includes('POPULAR') && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ background: B.greenLight, color: B.greenDark }}>
            <Star className="w-2.5 h-2.5" /> Popular
          </div>
        )}
        {product.tags.includes('PREMIUM') && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ background: B.purpleLight, color: B.purple }}>
            <Zap className="w-2.5 h-2.5" /> Premium
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: B.gray400 }}>{product.brand}</p>
        <p className="text-[13px] font-semibold leading-snug line-clamp-2" style={{ color: B.gray900 }}>{product.name}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-[15px] font-bold" style={{ color: B.green }}>
            {pts.toLocaleString()} <span className="text-[11px] font-semibold" style={{ color: B.gray400 }}>pts</span>
          </span>
          <button
            className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] transition-colors"
            style={{ background: B.green, color: '#fff' }}
            onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`, { state: { backgroundLocation: location } }); }}
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Horizontal scrolling section ──────────────────────────────────────────────
function Section({ title, emoji, products, viewAllLabel = 'View all' }: {
  title: string; emoji: string; products: typeof PRODUCTS; viewAllLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold flex items-center gap-2" style={{ color: B.gray900 }}>
          <span>{emoji}</span> {title}
        </h2>
        <button className="flex items-center gap-1 text-[13px] font-semibold hover:opacity-80" style={{ color: B.green }}>
          {viewAllLabel} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {products.map((p, i) => <RewardCard key={p.id} product={p} animDelay={i * 50} />)}
      </div>
    </div>
  );
}

// ── Personalize modal ─────────────────────────────────────────────────────────
function PersonalizeModal({
  onClose,
  onConfirm,
  initialSelected,
}: {
  onClose: () => void;
  onConfirm: (prefs: string[]) => void;
  initialSelected: string[];
}) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [bouncing, setBouncing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function toggle(key: string) {
    setBouncing(key);
    setTimeout(() => setBouncing(null), 350);
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function handleConfirm() {
    if (selected.length === 0) return;
    setConfirming(true);
    // Spawn confetti particles
    const ps = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      delay: Math.random() * 300,
    }));
    setParticles(ps);
    setTimeout(() => {
      onConfirm(selected);
    }, 900);
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{
        background: visible ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Confetti layer */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed pointer-events-none text-[22px] z-[300]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `bonusly-confetti 0.9s ease forwards`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Modal card */}
      <div
        className="relative w-full sm:w-[620px] rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          maxHeight: '90vh',
          overflowY: 'auto',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
        }}
      >
        {/* Gradient header */}
        <div className="relative px-7 pt-7 pb-5"
          style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.green} 100%)` }}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-white/80" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-white/70">Personalization</span>
          </div>
          <h2 className="text-[26px] font-black text-white leading-tight">What do you love?</h2>
          <p className="text-white/70 text-[14px] mt-1">Pick your vibe — we'll curate rewards just for you.</p>
        </div>

        {/* Category grid */}
        <div className="p-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
            {PREF_CATS.map(cat => {
              const isSelected = selected.includes(cat.key);
              const isBouncing = bouncing === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => toggle(cat.key)}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-[18px] text-center transition-all"
                  style={{
                    background: isSelected ? cat.bg : B.gray50,
                    border: `2px solid ${isSelected ? cat.color : B.gray200}`,
                    transform: isBouncing
                      ? 'scale(1.12)'
                      : isSelected ? 'scale(1.03)' : 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34,1.7,0.64,1), border 0.15s ease, background 0.15s ease',
                    boxShadow: isSelected ? `0 4px 16px ${cat.color}30` : 'none',
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: cat.color }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-[32px] leading-none" style={{
                    filter: isSelected ? 'none' : 'grayscale(0.3)',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34,1.7,0.64,1)',
                    display: 'block',
                  }}>
                    {cat.emoji}
                  </span>
                  <span className="text-[13px] font-bold leading-tight" style={{ color: isSelected ? cat.color : B.gray600 }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selection summary */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px]" style={{ color: B.gray400 }}>
              {selected.length === 0
                ? 'Select at least one to continue'
                : `${selected.length} selected — looking great! 🎯`}
            </span>
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="text-[12px] font-semibold"
                style={{ color: B.gray400 }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0 || confirming}
            className="w-full h-14 rounded-[14px] flex items-center justify-center gap-2 text-[15px] font-black transition-all"
            style={{
              background: selected.length === 0 ? B.gray200 : confirming
                ? B.green
                : `linear-gradient(135deg, ${B.greenDark} 0%, ${B.green} 100%)`,
              color: selected.length === 0 ? B.gray400 : '#fff',
              transform: confirming ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.2s ease',
              boxShadow: selected.length > 0 && !confirming ? `0 6px 24px ${B.green}50` : 'none',
            }}
          >
            {confirming ? (
              <>✨ Building your picks…</>
            ) : (
              <>Show my picks <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Personalized results view ─────────────────────────────────────────────────
function PersonalizedView({
  prefs,
  onAdjust,
}: {
  prefs: string[];
  onAdjust: () => void;
}) {
  const catMap: Record<string, typeof PRODUCTS> = {
    Apparel:     PRODUCTS.filter(p => p.category === 'Apparel'),
    Drinkware:   PRODUCTS.filter(p => p.category === 'Drinkware'),
    Electronics: PRODUCTS.filter(p => p.category === 'Electronics'),
    Bags:        PRODUCTS.filter(p => p.category === 'Bags'),
    Home:        PRODUCTS.filter(p => p.category === 'Home & Decor'),
    Accessories: PRODUCTS.filter(p => p.category === 'Accessories'),
    POPULAR:     PRODUCTS.filter(p => p.tags.includes('POPULAR')),
    PREMIUM:     PRODUCTS.filter(p => p.tags.includes('PREMIUM')),
    budget:      PRODUCTS.filter(p => p.price <= 50),
    splurge:     PRODUCTS.filter(p => p.price >= 100),
  };

  const catMeta = Object.fromEntries(PREF_CATS.map(c => [c.key, c]));

  const sections = prefs
    .map(key => ({ key, meta: catMeta[key], products: catMap[key] ?? [] }))
    .filter(s => s.products.length > 0);

  // Top picks = union of first 2 items from each selected category, deduped
  const topPickIds = new Set<string>();
  const topPicks: typeof PRODUCTS = [];
  prefs.forEach(key => {
    (catMap[key] ?? []).slice(0, 3).forEach(p => {
      if (!topPickIds.has(p.id)) { topPickIds.add(p.id); topPicks.push(p); }
    });
  });

  return (
    <div className="flex flex-col gap-10" style={{ animation: 'bonusly-fadein 0.5s ease both' }}>
      {/* Hero banner */}
      <div className="rounded-[24px] overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.green} 100%)`, minHeight: 160 }}>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20"
          style={{ background: '#fff' }} />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full opacity-10"
          style={{ background: '#fff' }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {prefs.map(key => (
                <span key={key} className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {catMeta[key]?.emoji} {catMeta[key]?.label}
                </span>
              ))}
            </div>
            <h2 className="text-[28px] font-black text-white leading-tight mb-1">
              Your picks are ready, Maya! 🎉
            </h2>
            <p className="text-white/70 text-[14px]">
              {topPicks.length} rewards curated just for you
            </p>
          </div>
          <button
            onClick={onAdjust}
            className="shrink-0 flex items-center gap-2 px-4 h-10 rounded-[12px] text-[13px] font-bold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <Settings className="w-3.5 h-3.5" /> Adjust preferences
          </button>
        </div>
      </div>

      {/* Top picks across all selected categories */}
      {topPicks.length > 0 && (
        <Section title="Top picks for you" emoji="🎯" products={topPicks} viewAllLabel="See all" />
      )}

      {/* Per-category sections */}
      {sections.map(({ key, meta, products }) => (
        <Section
          key={key}
          title={meta.label}
          emoji={meta.emoji}
          products={products}
        />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function BonuslyRewards() {
  const [activeNav, setActiveNav] = useState('Rewards');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmedPrefs, setConfirmedPrefs] = useState<string[]>([]);
  const [showPersonalized, setShowPersonalized] = useState(false);

  const navLinks = [
    { label: 'Home', icon: Home },
    { label: 'Recognition', icon: Trophy },
    { label: 'Challenges', icon: Zap },
    { label: 'Nominations', icon: Users },
    { label: 'Rewards', icon: Gift },
  ];

  const categories = ['All', 'Apparel', 'Drinkware', 'Electronics', 'Bags', 'Home & Decor', 'Accessories'];

  const popular     = PRODUCTS.filter(p => p.tags.includes('POPULAR'));
  const premium     = PRODUCTS.filter(p => p.tags.includes('PREMIUM'));
  const apparel     = PRODUCTS.filter(p => p.category === 'Apparel');
  const drinkware   = PRODUCTS.filter(p => p.category === 'Drinkware');
  const electronics = PRODUCTS.filter(p => p.category === 'Electronics');
  const bags        = PRODUCTS.filter(p => p.category === 'Bags');
  const homeDecor   = PRODUCTS.filter(p => p.category === 'Home & Decor');
  const accessories = PRODUCTS.filter(p => p.category === 'Accessories');
  const affordable  = PRODUCTS.filter(p => p.price <= 50).slice(0, 8);
  const splurge     = PRODUCTS.filter(p => p.price >= 100).slice(0, 8);

  const allFiltered = activeCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const displayList = searchResults ?? allFiltered;

  function handleConfirmPrefs(prefs: string[]) {
    setConfirmedPrefs(prefs);
    setShowModal(false);
    setShowPersonalized(true);
    setActiveCategory('All');
    setSearchQuery('');
  }

  return (
    <>
      {/* ── Global keyframe styles ────────────────────────────────────────────── */}
      <style>{`
        @keyframes bonusly-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bonusly-confetti {
          0%   { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(${`var(--cx, 40px)`}, -120px) scale(0.4) rotate(720deg); }
        }
      `}</style>

      <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: B.gray50 }}>

        {/* ── Personalize modal ─────────────────────────────────────────────── */}
        {showModal && (
          <PersonalizeModal
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirmPrefs}
            initialSelected={confirmedPrefs}
          />
        )}

        {/* ── Top header ────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: B.gray200 }}>
          <div className="max-w-[1280px] mx-auto px-6 h-[60px] flex items-center gap-6">
            <a href="/bonusly" className="flex items-center gap-2.5 shrink-0 mr-2">
              <BonuslyMark size={34} />
              <span className="text-[20px] font-black tracking-tight" style={{ color: B.gray900 }}>bonusly</span>
            </a>

            <nav className="flex items-center gap-1 flex-1">
              {navLinks.map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => setActiveNav(label)}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[13px] font-semibold transition-colors whitespace-nowrap"
                  style={{
                    background: activeNav === label ? B.greenLight : 'transparent',
                    color: activeNav === label ? B.greenDark : B.gray600,
                  }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </nav>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: B.gray400 }} />
              <input type="text" placeholder="Search rewards…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-4 rounded-[10px] text-[13px] outline-none w-[200px]"
                style={{ background: B.gray100, color: B.gray900, border: `1px solid ${B.gray200}` }} />
            </div>

            <button className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
              <Bell className="w-4.5 h-4.5" style={{ color: B.gray600 }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: B.green }} />
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                style={{ background: `linear-gradient(135deg, ${B.green} 0%, #81C784 100%)` }}>MC</div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[12px] font-semibold" style={{ color: B.gray900 }}>Maya Chen</span>
                <span className="text-[10px]" style={{ color: B.gray400 }}>Customer Success</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Points hero ───────────────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.green} 55%, #81C784 100%)` }}>
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-white/80 text-[13px] font-semibold uppercase tracking-widest mb-1">Welcome back 👋</p>
              <h1 className="text-white text-[32px] font-black leading-tight mb-1">Maya Chen</h1>
              <p className="text-white/75 text-[14px]">Recognition is just the beginning — spend your hard-earned points.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-[16px] px-6 py-4 flex flex-col items-center"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">Points Balance</span>
                <span className="text-white text-[36px] font-black leading-none">12,450</span>
                <span className="text-white/70 text-[12px] mt-1">available to spend</span>
              </div>
              <div className="rounded-[16px] px-5 py-4 flex flex-col items-center"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">Swag Points</span>
                <span className="text-white text-[28px] font-black leading-none">3,000</span>
                <span className="text-white/70 text-[12px] mt-1">available</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category filter ───────────────────────────────────────────────── */}
        <div className="sticky top-[60px] z-40 bg-white border-b" style={{ borderColor: B.gray200 }}>
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center gap-2 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => { setActiveCategory(cat); setShowPersonalized(false); }}
                  className="shrink-0 px-4 h-8 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: activeCategory === cat && !showPersonalized ? B.green : B.gray100,
                    color: activeCategory === cat && !showPersonalized ? '#fff' : B.gray600,
                    border: activeCategory === cat && !showPersonalized ? 'none' : `1px solid ${B.gray200}`,
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Page body ─────────────────────────────────────────────────────── */}
        <main className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-10">

          {showPersonalized && !searchResults ? (
            <PersonalizedView prefs={confirmedPrefs} onAdjust={() => setShowModal(true)} />
          ) : searchResults ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold" style={{ color: B.gray900 }}>
                🔍 Results for "{searchQuery}" <span className="text-[14px] font-normal" style={{ color: B.gray400 }}>({searchResults.length} items)</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {searchResults.map(p => <RewardCard key={p.id} product={p} />)}
              </div>
            </div>
          ) : activeCategory !== 'All' ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold" style={{ color: B.gray900 }}>
                {activeCategory} <span className="text-[14px] font-normal" style={{ color: B.gray400 }}>({displayList.length} items)</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {displayList.map(p => <RewardCard key={p.id} product={p} />)}
              </div>
            </div>
          ) : (
            <>
              {/* Featured / For You */}
              <div className="rounded-[24px] overflow-hidden flex flex-col sm:flex-row items-stretch"
                style={{ background: `linear-gradient(135deg, ${B.greenLight} 0%, #fff 100%)`, border: `1px solid #C8E6C9` }}>
                <div className="flex flex-col justify-center gap-3 p-8 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: B.green }}>✨ Picked for you</span>
                  <h2 className="text-[26px] font-black leading-tight" style={{ color: B.gray900 }}>Make these picks<br />yours, Maya</h2>
                  <p className="text-[14px]" style={{ color: B.gray600 }}>Based on your recognition history and interests.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="self-start flex items-center gap-2 px-5 h-10 rounded-[12px] text-white text-[13px] font-bold mt-2 transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]"
                    style={{ background: `linear-gradient(135deg, ${B.greenDark} 0%, ${B.green} 100%)`, boxShadow: `0 4px 16px ${B.green}40` }}>
                    <Sparkles className="w-3.5 h-3.5" /> Personalize picks
                  </button>
                </div>
                <div className="flex items-center gap-3 p-6 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {popular.slice(0, 3).map(p => <RewardCard key={p.id} product={p} />)}
                </div>
              </div>

              <Section title="Popular at Bonusly" emoji="🔥" products={popular} />
              <Section title="Premium Picks" emoji="⭐" products={premium} viewAllLabel="See all premium" />
              <Section title="Everyday Drinkware" emoji="☕" products={drinkware} />
              <Section title="Apparel & Gear" emoji="👕" products={apparel} />
              <Section title="Tech & Electronics" emoji="🎧" products={electronics} />
              <Section title="Bags & Carry" emoji="🎒" products={bags} />
              {homeDecor.length > 0 && <Section title="Home & Decor" emoji="🏠" products={homeDecor} />}
              {accessories.length > 0 && <Section title="Accessories" emoji="✨" products={accessories} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-[20px] p-5 flex flex-col gap-4" style={{ background: B.greenLight, border: `1px solid #C8E6C9` }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-bold" style={{ color: B.greenDark }}>💸 Under 500 pts</h3>
                    <button className="text-[12px] font-semibold" style={{ color: B.green }}>View all →</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                    {affordable.map(p => <RewardCard key={p.id} product={p} />)}
                  </div>
                </div>
                <div className="rounded-[20px] p-5 flex flex-col gap-4" style={{ background: B.purpleLight, border: `1px solid #d4cdff` }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-bold" style={{ color: B.purple }}>🏆 Worth saving for</h3>
                    <button className="text-[12px] font-semibold" style={{ color: B.purple }}>View all →</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                    {splurge.map(p => <RewardCard key={p.id} product={p} />)}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] flex flex-col sm:flex-row items-center gap-6 px-8 py-8 overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, #1B5E20 0%, ${B.greenDark} 60%, ${B.green} 100%)` }}>
                <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 100% 50%, #A5D6A7 0%, transparent 60%)` }} />
                <div className="flex-1 flex flex-col gap-3 z-10">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A5D6A7' }}>🎁 Bonusly Swag Store</span>
                  <h3 className="text-[24px] font-black text-white leading-tight">Rep the brand you love</h3>
                  <p className="text-[14px] text-white/60">Exclusive company swag — use your Swag Points.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="flex items-center gap-2 px-5 h-10 rounded-[12px] text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
                      style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                      <ShoppingBag className="w-3.5 h-3.5" /> Browse Swag
                    </button>
                    <span className="text-white/40 text-[12px]">You have <strong className="text-white">3,000</strong> swag pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {PRODUCTS.filter(p => p.category === 'Apparel').slice(0, 3).map(p => (
                    <div key={p.id} className="w-24 h-24 rounded-[14px] overflow-hidden flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {p.image.startsWith('/') && (
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" style={{ mixBlendMode: 'screen' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="border-t mt-12" style={{ borderColor: B.gray200, background: '#fff' }}>
          <div className="max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BonuslyMark size={24} />
              <span className="text-[14px] font-bold" style={{ color: B.gray600 }}>bonusly</span>
            </div>
            <p className="text-[12px]" style={{ color: B.gray400 }}>© 2026 Bonusly · Recognition is just the beginning</p>
            <div className="flex items-center gap-4">
              {['Help', 'Privacy', 'Terms'].map(l => (
                <a key={l} href="#" className="text-[12px] hover:underline" style={{ color: B.gray400 }}>{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
