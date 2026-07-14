import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  ArrowRight, ChevronLeft, ChevronRight, ChevronDown,
  Upload, Plus, X, ImageIcon, FolderOpen, Package, Truck, Globe, Loader2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PRODUCTS, MARKETPLACE_GIFTS, COLLECTION_THEMES,
} from '../data/mockData';
import { useCompanyLogo } from '../context/CompanyLogoContext';
import { useLookbooks } from '../context/LookbookContext';
import { MyDesignCard } from './MyDesigns';
import { CollectionCard, useAllCollections } from './MyCollections';
import { ProductCard } from '../components/ProductCard';
import { LogoAnalysisPopup } from '../components/LogoAnalysisPopup';
import { analyzeLogo, type LogoAnalysis } from '../utils/logoAnalysis';
import { fetchLogoForDomain } from '../components/LogoInput';
import { ReplaceLogoModal } from '../components/ReplaceLogoModal';

export type SwagTab = 'overview' | 'catalog' | 'your-swag' | 'stores' | 'brands' | 'flows';
export type YourSwagSubTab = 'my-designs' | 'collections' | 'inventory' | 'shipments';

const SWAG_TABS: { id: SwagTab; label: string; path: string }[] = [
  { id: 'stores',      label: 'Stores',      path: '/stores' },
  { id: 'overview',    label: 'Discover',    path: '/swag' },
  { id: 'catalog',     label: 'Catalog',     path: '/catalog' },
  { id: 'your-swag',   label: 'My Swag',     path: '/designs' },
];

const YOUR_SWAG_ITEMS: { id: YourSwagSubTab; label: string; path: string; icon: ReactNode }[] = [
  { id: 'collections', label: 'My Collections',      path: '/my-collections', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'my-designs',  label: 'My Designs',          path: '/designs',        icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'inventory',   label: 'My Inventory',        path: '/inventory',      icon: <Package className="w-4 h-4" /> },
  { id: 'shipments',   label: 'My Shipment History', path: '/shipments',      icon: <Truck className="w-4 h-4" /> },
];

// ── Tab strip shared across swag pages ──────────────────────────────────────
export function SwagPageHeader({ activeTab }: { activeTab: SwagTab }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="relative bg-white border-b border-snp-navy-200">
        <div
          className="absolute right-0 top-0 w-[60%] h-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(201,255,253,0.45) 50%, rgba(185,210,255,0.35) 100%)' }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-[120px] pt-3 pb-0">
          <div className="flex items-center justify-between">
            <h1
              className="text-[48px] text-snp-navy-950 leading-tight mb-0"
              style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}
            >
              Swag
            </h1>
          </div>

          <div className="flex items-end gap-2 mt-2 border-b border-snp-navy-200">
            {SWAG_TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`relative h-14 px-8 text-[16px] font-medium transition-colors whitespace-nowrap ${
                    active ? 'text-snp-navy-950' : 'text-snp-navy-600 hover:text-snp-navy-700'
                  }`}
                  style={active ? { borderBottom: '1px solid var(--snp-navy-950)', marginBottom: '-1px' } : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Left sidebar for "Your Swag" sub-pages ───────────────────────────────────
export function YourSwagSidebar({ active }: { active: YourSwagSubTab }) {
  const navigate = useNavigate();
  return (
    <aside className="w-52 shrink-0">
      <nav className="flex flex-col gap-1 pt-1">
        {YOUR_SWAG_ITEMS.map(item => {
          const isActive = item.id === active;
          return (
            <div key={item.id}>
              {item.id === 'inventory' && (
                <div className="flex items-center gap-2 mt-3 mb-1 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-snp-navy-400">Bulk & Kits</span>
                  <div className="flex-1 h-px bg-snp-navy-100" />
                </div>
              )}
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 h-10 px-3 rounded-[10px] text-[14px] font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-snp-navy-100 text-snp-navy-950'
                    : 'text-snp-navy-600 hover:bg-snp-navy-50 hover:text-snp-navy-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// ── Product image helper ──────────────────────────────────────────────────────
function ProductImg({ src, className }: { src: string; className?: string }) {
  if (src.startsWith('/')) {
    return <img src={src} alt="" className={className ?? 'w-full h-full object-contain'} style={{ mixBlendMode: 'multiply' }} />;
  }
  return <span className={className ?? 'text-5xl'}>{src}</span>;
}



// ── Experience card data ──────────────────────────────────────────────────────
const MAIN_EXPERIENCES = [
  {
    id: 'single',
    color: 'var(--snp-indigo-600)',
    bgColor: '#eef5ff',
    label: 'Single item',
    desc: 'Design one branded product and send it with the Snappy gifting experience.',
    cta: 'Browse the catalog',
    route: '/catalog',
    previewType: 'single' as const,
  },
  {
    id: 'collection',
    color: 'var(--snp-purple-700)',
    bgColor: '#f3f0ff',
    label: 'Swag collection',
    desc: 'Use our swag sets or curate your own items, create a collection and send it to recipients that will have the power of choice.',
    cta: 'Start building',
    route: '/collection/edit',
    previewType: 'collection' as const,
  },
  {
    id: 'mixed',
    color: '#059669',
    bgColor: '#f0fdf8',
    label: 'Mixed collection',
    desc: 'Mix your designed swag items with the Snappy gifts catalog to create the perfect mix and make your recipients happy.',
    cta: 'Build a collection',
    route: '/collection/edit',
    previewType: 'mixed' as const,
  },
];

// Product IDs used in experience card previews
const PREVIEW_SINGLE_ID         = '1';               // Patagonia Fleece
const PREVIEW_COLLECTION_IDS    = ['1', '2', '6', '9'];
const PREVIEW_MIXED_SWAG_ID     = '2';               // Hydro Flask
const PREVIEW_MIXED_GIFT_IDS    = ['g11', 'g2', 'g3']; // Spotify, AirTags, Apple Watch SE

// ── Experience card with product imagery ────────────────────────────────────
export function ExperienceCard({ exp }: { exp: typeof MAIN_EXPERIENCES[0] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const singleProduct       = PRODUCTS.find(p => p.id === PREVIEW_SINGLE_ID);
  const collectionProducts  = PREVIEW_COLLECTION_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const mixedSwag           = PRODUCTS.find(p => p.id === PREVIEW_MIXED_SWAG_ID);
  const mixedGifts          = PREVIEW_MIXED_GIFT_IDS.map(id => MARKETPLACE_GIFTS.find(g => g.id === id)).filter(Boolean);

  return (
    <div
      className="bg-white rounded-[24px] border border-snp-navy-200 overflow-hidden flex flex-col cursor-pointer"
      style={{
        boxShadow: hovered ? '0px 20px 40px 0px rgba(1,39,84,0.14)' : '0px 4px 16px 0px rgba(1,39,84,0.06)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(exp.route)}
    >
      {/* ── Product preview area ── */}
      <div className="h-[240px] overflow-hidden relative" style={{ backgroundColor: exp.bgColor }}>

        {/* Single Item */}
        {exp.previewType === 'single' && singleProduct && (
          <div className="h-full flex items-center justify-center p-6 relative">
            <ProductImg
              src={singleProduct.image}
              className={singleProduct.image.startsWith('/') ? 'max-h-[170px] object-contain' : 'text-[80px]'}
            />
            <div className="absolute top-3.5 left-3.5 bg-white rounded-lg px-2.5 py-1 border border-snp-navy-200 shadow-sm text-[10px] font-bold text-snp-navy-950 uppercase tracking-wide">
              {singleProduct.brand}
            </div>
            <div className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-[9px] bg-white border border-snp-navy-200 shadow-sm flex items-center justify-center">
              <span className="text-[9px] font-bold text-snp-navy-400 tracking-wide">LOGO</span>
            </div>
          </div>
        )}

        {/* Swag Collection */}
        {exp.previewType === 'collection' && (
          <div className="h-full flex items-center justify-center p-5">
            <div className="grid grid-cols-2 gap-2.5 w-[204px]">
              {collectionProducts.slice(0, 4).map(p => (
                <div
                  key={p!.id}
                  className="bg-white rounded-[12px] h-[82px] flex items-center justify-center overflow-hidden shadow-[0px_2px_8px_0px_rgba(1,39,84,0.08)]"
                  style={{ transform: hovered ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.3s ease' }}
                >
                  <ProductImg
                    src={p!.image}
                    className={p!.image.startsWith('/') ? 'w-full h-full object-contain p-2' : 'text-2xl'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mixed Collection */}
        {exp.previewType === 'mixed' && mixedSwag && (
          <div className="h-full flex items-center gap-2 px-5 py-4">
            <div className="flex-1 h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden shadow-[0px_2px_8px_0px_rgba(1,39,84,0.08)]">
              <ProductImg
                src={mixedSwag.image}
                className={mixedSwag.image.startsWith('/') ? 'w-full h-full object-contain p-3' : 'text-[56px]'}
              />
            </div>
            <div className="w-7 h-7 rounded-full bg-white border border-snp-navy-200 shadow-sm flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-snp-navy-500">+</span>
            </div>
            <div className="w-[80px] flex flex-col gap-1.5 h-full">
              {mixedGifts.slice(0, 3).map(g => (
                <div
                  key={g!.id}
                  className="flex-1 bg-white rounded-[10px] flex items-center justify-center overflow-hidden shadow-[0px_2px_6px_0px_rgba(1,39,84,0.07)]"
                >
                  <ProductImg
                    src={g!.image}
                    className={g!.image.startsWith('/') ? 'w-full h-full object-contain p-1.5' : 'text-xl'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Card info ── */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[17px] font-bold text-snp-navy-950 mb-1.5">{exp.label}</p>
          <p className="text-[13px] text-snp-navy-600 leading-relaxed">{exp.desc}</p>
        </div>
        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <span className="text-[13px] font-semibold" style={{ color: exp.color }}>{exp.cta}</span>
          <ArrowRight
            className="w-3.5 h-3.5"
            style={{ color: exp.color, transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s ease' }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Top Brands section ────────────────────────────────────────────────────────
const TOP_BRANDS = [
  { name: 'Apple',          bg: '/products/AppleAirpods.png',                                      logo: 'https://cdn.simpleicons.org/apple/ffffff' },
  { name: 'The North Face', bg: "/products/The North Face Women's Everyday Insulated Jacket .jpg", logo: 'https://cdn.simpleicons.org/thenorthface/ffffff' },
  { name: 'JBL',            bg: '/products/jbl.jpg',                                               logo: 'https://cdn.simpleicons.org/jbl/ffffff' },
  { name: 'Nike',           bg: '/products/Hoodie.png',                                            logo: 'https://cdn.simpleicons.org/nike/ffffff' },
  { name: 'Stanley',        bg: '/products/SteelBottle.png',                                       logo: 'https://cdn.simpleicons.org/stanley/ffffff' },
  { name: 'Ray-Ban',        bg: '/products/InstaxCamera.png',                                      logo: 'https://cdn.simpleicons.org/rayban/ffffff' },
  { name: 'Patagonia',      bg: '/products/PatagoniaFleece.png',                                   logo: 'https://cdn.simpleicons.org/patagonia/ffffff' },
  { name: 'YETI',           bg: '/products/HydroFlaskBottle.png',                                  logo: 'https://cdn.simpleicons.org/yeti/ffffff' },
];

function TopBrandCard({ brand, onClick }: { brand: typeof TOP_BRANDS[0]; onClick: () => void }) {
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <div
      onClick={onClick}
      className="w-[187px] shrink-0 cursor-pointer rounded-[24px] shadow-[0px_12px_16px_rgba(125,146,169,0.08)] hover:shadow-[0px_16px_24px_rgba(1,39,84,0.12)] transition-shadow"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="flex flex-col gap-2 p-2 border border-[#e0ebf7] rounded-[24px] bg-white">
        {/* Blurred photo background + centered logo */}
        <div className="h-[131px] rounded-[16px] overflow-hidden relative">
          <img
            src={brand.bg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: 'blur(2.5px)' }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            {logoFailed ? (
              <span className="text-white font-bold text-sm tracking-wider uppercase px-3 text-center leading-tight">{brand.name}</span>
            ) : (
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-[48px] w-auto max-w-[130px] object-contain"
                onError={() => setLogoFailed(true)}
              />
            )}
          </div>
        </div>
        {/* Brand name */}
        <div className="flex items-center justify-center px-3 py-2">
          <span className="text-[16px] font-medium text-[#012754] capitalize leading-[1.5] truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {brand.name}
          </span>
        </div>
      </div>
    </div>
  );
}

function TopBrandsSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scrollBy(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -420 : 420, behavior: 'smooth' });
  }

  useEffect(() => {
    updateScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    return () => el.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <div className="bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-semibold text-[#012754]" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Top Brands
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-[#e0ebf7] bg-white flex items-center justify-center hover:border-snp-indigo-600 hover:shadow-[0px_4px_12px_rgba(48,119,201,0.18)] transition-all disabled:opacity-40 disabled:cursor-default"
            >
              <ChevronLeft className="w-5 h-5 text-snp-navy-700" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-[#e0ebf7] bg-white flex items-center justify-center hover:border-snp-indigo-600 hover:shadow-[0px_4px_12px_rgba(48,119,201,0.18)] transition-all disabled:opacity-40 disabled:cursor-default"
            >
              <ChevronRight className="w-5 h-5 text-snp-navy-700" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-1 -mx-1"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingTop: 16, paddingBottom: 16, marginTop: -16, marginBottom: -16 }}
          onScroll={updateScroll}
        >
          {TOP_BRANDS.map(brand => (
            <TopBrandCard
              key={brand.name}
              brand={brand}
              onClick={() => navigate(`/catalog?brand=${encodeURIComponent(brand.name)}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


// ── Theme Row (Trending Sets) ─────────────────────────────────────────────────

const HOW_SWAG_DISMISSED_KEY = 'snappy_how_swag_works_dismissed';

function HowSwagWorks({ onDismiss }: { onDismiss: () => void }) {
  const steps = [
    {
      heading: 'Upload your logo to preview branded swag',
      body: 'Instantly visualize your brand across high-quality swag and curated gift options.',
      image: '/upload-logo.png',
    },
    {
      heading: 'Customize products',
      body: 'Design products your way — pick a starter design or build from scratch.',
      image: '/customize-products.png',
    },
    {
      heading: 'Send swag',
      body: 'Send as a gift collection, mix with physical items, send a single item, or create a store.',
      image: '/create-collection.png',
    },
  ];

  return (
    <div
      className="relative rounded-[24px] bg-white p-6"
      style={{ boxShadow: '0px 16px 24px rgba(1,39,84,0.16)' }}
    >
      {/* Title */}
      <span
        className="block text-[17px] font-bold uppercase tracking-[0.08em] mb-4"
        style={{ fontFamily: "'Clash Display', sans-serif", color: '#345276' }}
      >
        How swag works
      </span>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white border border-[#e0ebf7] flex items-center justify-center text-snp-navy-400 hover:bg-snp-navy-50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Three cards */}
      <div className="flex gap-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-[16px] overflow-hidden relative pl-6 pt-6 shrink-0"
            style={{
              height: 240,
              width: i === 0 ? 500 : undefined,
              flex: i === 0 ? undefined : 1,
              background: '#fbfcfe',
              border: '1px solid #e8eef6',
            }}
          >
            {/* Text */}
            <p
              className="text-[16px] font-semibold flex items-center gap-1.5 leading-snug mb-1.5 pr-8"
              style={{ color: '#345276' }}
            >
              {step.heading}
              <ArrowRight className="w-4 h-4 shrink-0 opacity-50" style={{ color: '#345276' }} />
            </p>
            <p
              className="text-[14px] leading-relaxed pr-8"
              style={{ color: '#8093a9' }}
            >
              {step.body}
            </p>

            {/* Illustration filling bottom */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden flex items-end justify-center">
              <img src={step.image} alt="" className="w-full object-contain object-bottom rounded-tl-[8px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeRow({ theme, onContinue, overrideProductIds }: { theme: (typeof COLLECTION_THEMES)[0]; onContinue: (theme: (typeof COLLECTION_THEMES)[0]) => void; overrideProductIds?: string[] }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logoUrl, isApplying } = useCompanyLogo();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const productIdList = overrideProductIds ?? theme.productIds;
  const products = productIdList
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const [stripVisible, setStripVisible] = useState(true);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setStripVisible(false);
    const t = setTimeout(() => setStripVisible(true), 180);
    return () => clearTimeout(t);
  }, [overrideProductIds]);

  function updateScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scrollBy(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  }

  useEffect(() => {
    updateScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    return () => el.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <div
      className="rounded-[20px] bg-white border border-snp-navy-100 overflow-hidden"
      style={{ boxShadow: '0px 2px 12px rgba(1,39,84,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 min-w-0">
          <h3
            className="text-[20px] font-semibold text-snp-navy-950 shrink-0"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {theme.name}
          </h3>
          <span
            className="hidden sm:inline text-[14px] text-snp-navy-500 truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {theme.tagline}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <button
            onClick={() => onContinue(theme)}
            className="rounded-full text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#3077c9', fontFamily: "'DM Sans', sans-serif", padding: '12px 20px' }}
          >
            Start with this design
          </button>
          <button
            onClick={() => scrollBy('left')}
            disabled={!canScrollLeft}
            className="rounded-full bg-white flex items-center justify-center text-snp-navy-500 hover:text-snp-navy-800 transition-colors disabled:opacity-25 disabled:cursor-default disabled:pointer-events-none"
            style={{ border: '1px solid #e0ebf7', padding: 12 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scrollBy('right')}
            disabled={!canScrollRight}
            className="rounded-full bg-white flex items-center justify-center text-snp-navy-500 hover:text-snp-navy-800 transition-colors disabled:opacity-25 disabled:cursor-default disabled:pointer-events-none"
            style={{ border: '1px solid #e0ebf7', padding: 12 }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Product strip */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-6 px-6 gap-3.5 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', opacity: stripVisible ? 1 : 0, transition: 'opacity 0.2s ease' }}
      >
        {products.map(product => {
          const isPhoto = product.image.startsWith('/');
          const hasPrintArea = isPhoto && product.type !== 'bulk' && !!product.printArea;
          const showLogoOverlay = hasPrintArea && !!logoUrl && !isApplying;
          return (
            <div
              key={product.id}
              className="relative shrink-0 size-[250px] rounded-[20px] overflow-hidden cursor-pointer group flex items-center justify-center"
              style={{ background: '#fbfcfe' }}
              onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location, catalogMode: true } })}
            >
              {isPhoto ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-7 group-hover:scale-[1.04] transition-transform duration-200"
                  style={{ mixBlendMode: 'multiply' }}
                />
              ) : (
                <span className="text-[64px]">{product.image}</span>
              )}

              {/* Print-area logo overlay — same logic as ProductCard */}
              {showLogoOverlay && product.printArea && (
                product.printArea.style === 'badge' ? (
                  <div
                    className="absolute pointer-events-none flex items-center justify-center rounded-xl bg-white/85 shadow-sm p-1.5"
                    style={{
                      left: `${product.printArea.x}%`,
                      top: `${product.printArea.y}%`,
                      width: `${product.printArea.width}%`,
                      height: `${product.printArea.height}%`,
                    }}
                  >
                    <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                ) : (
                  <img
                    src={logoUrl}
                    alt=""
                    className="absolute pointer-events-none object-contain"
                    style={{
                      left: `${product.printArea.x}%`,
                      top: `${product.printArea.y}%`,
                      width: `${product.printArea.width}%`,
                      height: `${product.printArea.height}%`,
                      mixBlendMode: 'multiply',
                      opacity: 0.88,
                    }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )
              )}

              {/* Personalized badge */}
              {product.isPersonalized && (
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(237,233,254,0.96) 0%, rgba(221,214,254,0.96) 100%)',
                    border: '1px solid rgba(167,139,250,0.4)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <span className="text-[10px] font-bold" style={{ color: '#6d28d9', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em' }}>@</span>
                  <span className="text-[10px] font-medium italic" style={{ color: '#7c3aed', fontFamily: "'DM Sans', sans-serif" }}>Personalized</span>
                </div>
              )}

              {/* Shimmer skeleton while applying */}
              {isApplying && isPhoto && (
                <div className="absolute inset-0 z-20 rounded-[20px] overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-[#eef4ff]" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'product-card-shimmer 1.0s ease-in-out infinite',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Overview page ────────────────────────────────────────────────────────
export function SwagOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveLogo, logoUrl, allBrandSets, activateBrandSet, deleteBrandSet } = useCompanyLogo();
  const { createLookbook, lookbooks } = useLookbooks();

  const [howSwagWorksVisible, setHowSwagWorksVisible] = useState(
    () => !localStorage.getItem(HOW_SWAG_DISMISSED_KEY),
  );
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [showReplaceBrandModal, setShowReplaceBrandModal] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<(typeof COLLECTION_THEMES)[0] | null>(null);
  const [showLogoDropdown, setShowLogoDropdown] = useState(false);

  // Hero logo upload
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [pendingUpload, setPendingUpload] = useState<{ url: string; name: string } | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<LogoAnalysis | undefined>(undefined);
  const [heroDomainInput, setHeroDomainInput] = useState('');
  const [heroDomainFetching, setHeroDomainFetching] = useState(false);

  function navigateToCollection(theme: (typeof COLLECTION_THEMES)[0], logo: string) {
    const d = createLookbook({
      name: `My ${theme.name} design`,
      logoUrl: logo,
      productIds: theme.productIds,
      themeName: theme.name,
    });
    navigate(`/designs/${d.id}`);
  }

  function handleContinueWithTheme(theme: (typeof COLLECTION_THEMES)[0]) {
    if (logoUrl) {
      navigateToCollection(theme, logoUrl);
    } else {
      setPendingTheme(theme);
      setShowReplaceBrandModal(true);
    }
  }


  async function handleHeroDomainFetch() {
    const domain = heroDomainInput.trim();
    if (!domain || heroDomainFetching) return;
    setHeroDomainFetching(true);
    try {
      const url = await fetchLogoForDomain(domain);
      const name = domain.replace(/^www\./, '').split('.')[0];
      setPendingAnalysis(undefined);
      setPendingUpload({ url, name });
      analyzeLogo(url).then(setPendingAnalysis);
    } finally {
      setHeroDomainFetching(false);
    }
  }

  function handleHeroFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const url = evt.target?.result as string;
      const name = file.name.replace(/\.[^.]+$/, '');
      setPendingAnalysis(undefined);
      setPendingUpload({ url, name });
      analyzeLogo(url).then(setPendingAnalysis);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleHeroAnalysisComplete() {
    if (!pendingUpload) return;
    saveLogo(pendingUpload.url, pendingUpload.name, true);
    setPendingUpload(null);
    setPendingAnalysis(undefined);
  }

  const popularProducts = PRODUCTS.filter(p => p.tags.includes('POPULAR') && p.type !== 'bulk').slice(0, 8);

  const recentDesigns = [...lookbooks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2);
  const allCollections = useAllCollections();
  const sentCollections = allCollections.slice(0, 2);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Logo analysis full-screen loader ── */}
      {pendingUpload && (
        <LogoAnalysisPopup
          logoUrl={pendingUpload.url}
          analysis={pendingAnalysis}
          onComplete={handleHeroAnalysisComplete}
        />
      )}

      {/* ── Page header with tabs ─────────────────────────────────── */}
      <SwagPageHeader activeTab="overview" />

      {/* ══════════════════════════════════════════════════════════
          How Swag Works — first-visit only, shown before anything else
      ══════════════════════════════════════════════════════════ */}
      {howSwagWorksVisible && !logoUrl && (
        <div className="px-4 md:px-[120px] pt-8 max-w-[1400px] mx-auto w-full">
          <HowSwagWorks
            onDismiss={() => {
              localStorage.setItem(HOW_SWAG_DISMISSED_KEY, '1');
              setHowSwagWorksVisible(false);
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — Logo Upload Banner
      ══════════════════════════════════════════════════════════ */}
      <div className="px-4 md:px-[120px] pt-8 pb-4 max-w-[1400px] mx-auto w-full">
        {/* Hidden file input */}
        <input ref={heroFileRef} type="file" accept="image/*,image/svg+xml" className="hidden" onChange={handleHeroFile} />

        {!logoUrl && (
          /* ── Upload state — no logo yet ── */
          <div
            className="relative rounded-[32px] overflow-hidden h-[300px]"
            style={{ background: 'radial-gradient(ellipse at 18% 90%, #c4d9ef 0%, #d8e8f6 25%, #eaf2fb 55%, #f5f8fd 100%)' }}
          >
            {/* ── Left products — absolute, pinned to left edge ── */}
            <div className="absolute left-0 top-0 h-full w-[360px] pointer-events-none">
              <img src="/products/left-products.png" alt=""
                className="absolute object-contain"
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left bottom' }} />
            </div>

            {/* ── Center content — truly centered ── */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 pb-2">
              <div className="flex flex-col items-center gap-[6px] text-center whitespace-nowrap">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8093a9]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Make it yours
                </p>
                <p className="text-[36px] font-semibold leading-[1.1] text-[#012754]"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Watch your logo<br />come to life
                </p>
              </div>

              {/* Primary — domain input */}
              <div
                className="flex items-center h-[56px] rounded-[16px] bg-white/85 backdrop-blur-sm border border-white/70 shadow-[0px_6px_20px_rgba(1,39,84,0.14)] overflow-hidden focus-within:border-[#3077c9]/60 focus-within:shadow-[0_0_0_3px_rgba(48,119,201,0.16),0px_6px_20px_rgba(1,39,84,0.14)] transition-all"
              >
                <Globe className="w-4 h-4 text-[#6b8db5] ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="yourcompany.com"
                  value={heroDomainInput}
                  onChange={e => setHeroDomainInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleHeroDomainFetch(); }}
                  className="h-full px-3 text-[14px] text-[#012754] placeholder-[#9fb3c8] outline-none bg-transparent w-[200px]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  onClick={handleHeroDomainFetch}
                  disabled={!heroDomainInput.trim() || heroDomainFetching}
                  className="h-full px-5 flex items-center gap-2 text-[13px] font-semibold text-white border-l border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  style={{ background: 'linear-gradient(180deg, #6ba3e0 0%, #3077c9 100%)' }}
                >
                  {heroDomainFetching
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><ArrowRight className="w-4 h-4" /> Fetch logo</>
                  }
                </button>
              </div>

              {/* Secondary — upload link */}
              <button
                onClick={() => heroFileRef.current?.click()}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#6b8db5] hover:text-[#3077c9] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Upload className="w-3.5 h-3.5" />
                or upload your logo
              </button>
            </div>

            {/* ── Right products — absolute, pinned to right edge ── */}
            <div className="absolute right-0 top-0 h-full w-[360px] pointer-events-none">
              <img src="/products/right-products.png" alt=""
                className="absolute object-contain"
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right bottom' }} />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2a — Send more (collections)
      ══════════════════════════════════════════════════════════ */}
      {sentCollections.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] pt-2 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Send more
            </h2>
            <button
              onClick={() => navigate('/my-collections')}
              className="h-9 px-4 border border-[#e0ebf7] rounded-[12px] text-[13px] font-medium text-snp-navy-800 hover:bg-snp-navy-50 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sentCollections.map(col => (
              <CollectionCard key={col.id} col={col} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2b — Continue where you left off (designs)
      ══════════════════════════════════════════════════════════ */}
      {recentDesigns.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] pt-2 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Continue where you left off
            </h2>
            <button
              onClick={() => navigate('/designs')}
              className="h-9 px-4 border border-[#e0ebf7] rounded-[12px] text-[13px] font-medium text-snp-navy-800 hover:bg-snp-navy-50 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentDesigns.map(design => (
              <MyDesignCard
                key={design.id}
                design={design}
                onDelete={() => {}}
                onDuplicate={() => {}}
                onShare={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — Trending Swag Themes
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-snp-navy-100 py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-[32px] font-semibold text-snp-navy-950 leading-[1.3]"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Curated Designs
            </h2>

            {logoUrl && (
              <div className="flex items-center gap-3">
                {/* Logo pill with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLogoDropdown(v => !v)}
                    className="flex items-center gap-2 bg-white border border-[#e0ebf7] rounded-full hover:border-[#97bbe4] transition-colors"
                    style={{ height: 44, paddingLeft: 12, paddingRight: 12 }}
                  >
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-5 w-auto max-w-[56px] object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    <ChevronDown className={`w-4 h-4 text-snp-navy-950 transition-transform ${showLogoDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showLogoDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowLogoDropdown(false)} />
                      <div
                        className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-[16px] overflow-hidden z-50"
                        style={{ width: 280, border: '1px solid #e0ebf7', boxShadow: '0px 12px 16px 0px rgba(125,146,169,0.08)', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        <div className="px-4 pt-4 pb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8093a9' }}>My Logos</p>
                        </div>
                        <div className="px-4 pb-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => { setShowLogoDropdown(false); setShowReplaceBrandModal(true); }}
                            className="w-14 h-14 rounded-[8px] flex items-center justify-center transition-colors hover:bg-snp-indigo-100"
                            style={{ border: '1.5px dashed #97bbe4', background: '#fbfcfe' }}
                          >
                            <Plus className="w-5 h-5" style={{ color: '#3077c9' }} />
                          </button>
                          {allBrandSets.filter(bs => bs.logoUrl).map(bs => {
                            const isActive = bs.logoUrl === logoUrl;
                            return (
                              <div key={bs.id} className="relative group">
                                <button
                                  onClick={() => { activateBrandSet(bs.id); setShowLogoDropdown(false); }}
                                  className="w-14 h-14 rounded-[8px] flex items-center justify-center p-1.5 transition-all"
                                  style={{ border: isActive ? '1px solid #3077c9' : '1px solid #e0ebf7', opacity: isActive ? 1 : 0.8, boxShadow: isActive ? '0px 4px 8px rgba(1,39,84,0.16)' : 'none' }}
                                >
                                  <img src={bs.logoUrl!} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} onError={e => (e.currentTarget.style.display = 'none')} />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); deleteBrandSet(bs.id); }}
                                  title="Remove from list"
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-snp-navy-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-snp-navy-700"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Upload new logo chip */}
                <button
                  onClick={() => setShowReplaceBrandModal(true)}
                  className="flex items-center gap-2 bg-white border border-[#e0ebf7] rounded-full hover:border-[#97bbe4] transition-colors whitespace-nowrap"
                  style={{ height: 44, paddingLeft: 16, paddingRight: 16, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Upload className="w-4 h-4 text-snp-navy-500" />
                  <span className="text-[14px] font-medium text-[#012754]">Upload new logo</span>
                </button>
              </div>
            )}
          </div>

          {/* Per-theme carousels — HOW SWAG WORKS after [0], pastel cards after [1] */}
          <div className="flex flex-col gap-5">
            {(showAllCollections ? COLLECTION_THEMES : COLLECTION_THEMES.slice(0, 4)).map((theme, i) => {
              const displayIds = theme.productIds.filter(id => PRODUCTS.find(pr => pr.id === id)?.type === 'on-demand');
              return (
              <>
                <ThemeRow key={theme.id} theme={theme} onContinue={handleContinueWithTheme} overrideProductIds={displayIds} />
                {i === 1 && (
                  <div key="popular-theme-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Card 1 — For Techies (purple) */}
            <div
              className="drop-shadow-[0px_16px_12px_rgba(1,39,84,0.16)] flex flex-col items-start pb-[5px] relative rounded-[32px] cursor-pointer shrink-0"
              style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 100%), linear-gradient(90deg, rgb(184,159,231) 0%, rgb(184,159,231) 100%)' }}
              onClick={() => { const t = COLLECTION_THEMES.find(th => th.id === 'onboarding'); if (t) handleContinueWithTheme(t); }}
            >
              <div
                className="theme-card-inner bg-gradient-to-b flex flex-col from-[#dbcff3] gap-[47px] items-center justify-center overflow-clip px-6 py-6 relative rounded-[32px] shadow-[0px_12px_16px_0px_rgba(125,146,169,0.08)] to-[#b89fe7] w-full"
              >
                {/* Top label */}
                <p className="text-[12px] font-bold text-white uppercase text-center leading-[1.3] w-full"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  CURATED DESIGNS
                </p>
                {/* Watermark — 3 lines of 110px text, container wider than card to overflow+clip */}
                <div className="flex flex-col items-end justify-center w-[874px] pointer-events-none select-none">
                  <p className="font-semibold text-white text-[110px] leading-[0.9] whitespace-nowrap opacity-10 text-center w-full"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}>For Techies</p>
                  <p className="font-semibold text-white text-[110px] leading-[0.9] text-center"
                    style={{ fontFamily: "'Clash Display', sans-serif", minWidth: '100%', width: 'min-content' }}>For Techies</p>
                  <div className="flex items-center w-full">
                    <p className="font-semibold text-white text-[110px] leading-[0.9] whitespace-nowrap opacity-10 text-center"
                      style={{ fontFamily: "'Clash Display', sans-serif" }}>For Techies</p>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between w-full">
                  <p className="text-[12px] font-bold text-white uppercase leading-[1.3]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>for techies</p>
                  <p className="text-[12px] font-bold text-white uppercase leading-[1.3] opacity-60"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>16 Products</p>
                </div>
                {/* Stacked photos — absolutely centered vertically */}
                <div className="absolute pointer-events-none" style={{ height: 193.712, left: 45.49, top: 'calc(50% + 0.36px)', width: 290.872, transform: 'translateY(-50%)' }}>
                  {/* Right photo — rotate +15° */}
                  <div className="absolute flex items-center justify-center" style={{ left: 97.16, width: 193.712, height: 193.712, top: 0 }}>
                    <div className="photo-right" style={{ transform: 'rotate(15deg)' }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                        <img alt="" className="absolute max-w-none object-cover" style={{ left: '-10.93%', top: '-3.59%', width: '121.88%', height: '121.88%' }} src="/products/theme-cards/techies-right.jpg" />
                      </div>
                    </div>
                  </div>
                  {/* Middle photo — no rotation */}
                  <div className="photo-mid absolute overflow-hidden" style={{ left: 73.38, top: 17.77, borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                    <img alt="" className="absolute max-w-none" style={{ left: '-38.89%', top: 0, height: '100%', width: '177.78%' }} src="/products/theme-cards/techies-middle.jpg" />
                  </div>
                  {/* Left photo — rotate -15° */}
                  <div className="absolute flex items-center justify-center" style={{ left: 0, width: 193.712, height: 193.712, top: 0 }}>
                    <div className="photo-left" style={{ transform: 'rotate(-15deg)' }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[17.466px] size-full" src="/products/theme-cards/techies-left.jpg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — Most Popular (blue) */}
            <div
              className="drop-shadow-[0px_16px_12px_rgba(1,39,84,0.16)] flex flex-col items-start pb-[5px] relative rounded-[32px] cursor-pointer shrink-0"
              style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 100%), linear-gradient(90deg, rgb(151,187,228) 0%, rgb(151,187,228) 100%)' }}
              onClick={() => { const t = COLLECTION_THEMES.find(th => th.id === 'classic'); if (t) handleContinueWithTheme(t); }}
            >
              <div
                className="theme-card-inner bg-gradient-to-b flex flex-col from-[#b7cfec] gap-[47px] items-center justify-center overflow-clip px-6 py-6 relative rounded-[32px] shadow-[0px_12px_16px_0px_rgba(125,146,169,0.08)] to-[#97bbe4] w-full"
              >
                <p className="text-[12px] font-bold text-white uppercase text-center leading-[1.3] w-full"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  CURATED DESIGNS
                </p>
                <div className="flex flex-col items-end justify-center w-[874px] pointer-events-none select-none">
                  <p className="font-semibold text-white text-[110px] leading-[0.9] whitespace-nowrap opacity-10 text-center w-full"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}>Most Popular</p>
                  <p className="font-semibold text-white text-[110px] leading-[0.9] text-center"
                    style={{ fontFamily: "'Clash Display', sans-serif", minWidth: '100%', width: 'min-content' }}>Most Popular</p>
                  <div className="flex items-center w-full">
                    <p className="font-semibold text-white text-[110px] leading-[0.9] whitespace-nowrap opacity-10 text-center"
                      style={{ fontFamily: "'Clash Display', sans-serif" }}>Most Popular</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[12px] font-bold text-white uppercase leading-[1.3]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>MOST POPULAR</p>
                  <p className="text-[12px] font-bold text-white uppercase leading-[1.3] opacity-60"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>24 Products</p>
                </div>
                <div className="absolute pointer-events-none" style={{ height: 193.712, left: 45.49, top: 'calc(50% + 0.36px)', width: 290.872, transform: 'translateY(-50%)' }}>
                  <div className="absolute flex items-center justify-center" style={{ left: 97.16, width: 193.712, height: 193.712, top: 0 }}>
                    <div className="photo-right" style={{ transform: 'rotate(15deg)' }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src="/products/theme-cards/popular-right.jpg" />
                      </div>
                    </div>
                  </div>
                  <div className="photo-mid absolute overflow-hidden" style={{ left: 73.38, top: 17.77, borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                    <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src="/products/theme-cards/popular-middle.jpg" />
                  </div>
                  <div className="absolute flex items-center justify-center" style={{ left: 0, width: 193.712, height: 193.712, top: 0 }}>
                    <div className="photo-left" style={{ transform: 'rotate(-15deg)' }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src="/products/theme-cards/popular-left.jpg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 — Summertime (gold) */}
            <div
              className="drop-shadow-[0px_16px_12px_rgba(1,39,84,0.16)] flex flex-col items-start pb-[5px] relative rounded-[32px] cursor-pointer shrink-0"
              style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 100%), linear-gradient(90deg, rgb(255,210,126) 0%, rgb(255,210,126) 100%)' }}
              onClick={() => { const t = COLLECTION_THEMES.find(th => th.id === 'summer'); if (t) handleContinueWithTheme(t); }}
            >
              <div
                className="theme-card-inner bg-gradient-to-b flex flex-col from-[#ffe1a8] gap-[47px] items-center justify-center overflow-clip px-6 py-6 relative rounded-[32px] shadow-[0px_12px_16px_0px_rgba(125,146,169,0.08)] to-[#ffd27d] w-full"
              >
                <p className="text-[12px] font-bold text-white uppercase text-center leading-[1.3] w-full"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  CURATED DESIGNS
                </p>
                <div className="flex flex-col items-end justify-center w-[874px] pointer-events-none select-none">
                  <p className="font-semibold text-white text-[110px] leading-[0.9] whitespace-nowrap opacity-20 text-center w-full"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}>Summertime</p>
                  <p className="font-semibold text-white text-[110px] leading-[0.9] text-center"
                    style={{ fontFamily: "'Clash Display', sans-serif", minWidth: '100%', width: 'min-content' }}>Summertime</p>
                  <div className="flex items-center w-full">
                    <p className="font-semibold text-white text-[110px] leading-[0.9] whitespace-nowrap opacity-20 text-center"
                      style={{ fontFamily: "'Clash Display', sans-serif" }}>Summertime</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[12px] font-bold text-white uppercase leading-[1.3]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>Summertime</p>
                  <p className="text-[12px] font-bold text-white uppercase leading-[1.3] opacity-60"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>26 Products</p>
                </div>
                <div className="absolute pointer-events-none" style={{ height: 193.712, left: 45.49, top: 'calc(50% + 0.36px)', width: 290.872, transform: 'translateY(-50%)' }}>
                  <div className="absolute flex items-center justify-center" style={{ left: 97.16, width: 193.712, height: 193.712, top: 0 }}>
                    <div className="photo-right" style={{ transform: 'rotate(15deg)' }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src="/products/theme-cards/summer-right.jpg" />
                      </div>
                    </div>
                  </div>
                  <div className="photo-mid absolute overflow-hidden" style={{ left: 73.38, top: 17.77, borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                    <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src="/products/theme-cards/summer-middle.jpg" />
                  </div>
                  <div className="absolute flex items-center justify-center" style={{ left: 0, width: 193.712, height: 193.712, top: 0 }}>
                    <div className="photo-left" style={{ transform: 'rotate(-15deg)' }}>
                      <div className="relative overflow-hidden" style={{ borderRadius: 17.466, boxShadow: '0px 16.871px 25.306px 0px rgba(0,0,0,0.16)', width: 158.165, height: 158.165 }}>
                        <img alt="" className="absolute max-w-none" style={{ height: '164.93%', left: '-0.09%', top: '-51.85%', width: '112.53%' }} src="/products/theme-cards/summer-left.jpg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                </div>
                )}
              </>
              );
            })}
          </div>

          {/* See All Collections button */}
          {!showAllCollections && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAllCollections(true)}
                className="flex items-center gap-2 h-10 px-6 rounded-full border border-snp-navy-200 bg-white text-[14px] font-medium text-snp-navy-700 hover:border-snp-navy-400 hover:text-snp-navy-950 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Plus className="w-4 h-4" />
                See All Curated Designs
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — Top Brands
      ══════════════════════════════════════════════════════════ */}
      <TopBrandsSection />

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] w-full">
        <div className="border-t border-snp-navy-100" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — Popular Items
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-snp-navy-100 py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-[26px] font-bold text-snp-navy-950"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Popular Items
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/catalog')}
                className="h-10 px-5 rounded-full border border-snp-navy-200 bg-white text-[14px] font-medium text-snp-navy-800 hover:border-snp-navy-400 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                View All
              </button>
              <button
                onClick={() => document.getElementById('popular-scroll')?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="w-10 h-10 rounded-full border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-600 hover:border-snp-navy-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('popular-scroll')?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="w-10 h-10 rounded-full border border-snp-navy-200 bg-white flex items-center justify-center text-snp-navy-600 hover:border-snp-navy-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product strip */}
          <div
            id="popular-scroll"
            className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {popularProducts.map(product => (
              <div key={product.id} className="shrink-0 w-[260px]">
                <ProductCard
                  product={product}
                  onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location, catalogMode: true } })}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Replace Brand modal ────────────────────────────────────────────── */}
      {showReplaceBrandModal && (
        <ReplaceLogoModal
          currentLogoUrl={logoUrl}
          onSelect={url => {
            saveLogo(url);
            setShowReplaceBrandModal(false);
            if (pendingTheme) { navigateToCollection(pendingTheme, url); setPendingTheme(null); }
          }}
          onClose={() => { setShowReplaceBrandModal(false); setPendingTheme(null); }}
        />
      )}


    </div>
  );
}
