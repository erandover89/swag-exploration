import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send, Pencil, Package, ChevronDown, Check, X } from 'lucide-react';
import { PRODUCTS, MARKETPLACE_GIFTS, COLLECTION_EXAMPLES, COUNTRIES, COUNTRY_PRICE_MULTIPLIERS, BUDGET_RANGES } from '../data/mockData';
import { LogoHero } from '../components/LogoHero';

// ── Budget options ──────────────────────────────────────────────────────────
const BUDGET_OPTIONS = [
  { label: 'Any Budget', min: 0, max: Infinity },
  ...BUDGET_RANGES,
];

// ── Mock country availability per item ID ───────────────────────────────────
// swag products
const ITEM_COUNTRIES: Record<string, string[]> = {
  '1':  ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IL'],
  '2':  ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '3':  ['US', 'GB', 'DE', 'CA'],
  '4':  ['US', 'GB', 'CA'],
  '5':  ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  '6':  ['US', 'GB', 'DE'],
  '7':  ['US', 'GB'],
  '8':  ['US'],
  '9':  ['US', 'GB', 'DE', 'FR'],
  '10': ['US', 'GB'],
  '11': ['US', 'GB', 'DE'],
  '12': ['US', 'GB', 'DE', 'CA'],
  // marketplace gifts — broadly available
  'g2':  ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
  'g3':  ['US', 'GB', 'DE', 'FR', 'CA'],
  'g5':  ['US', 'GB', 'CA'],
  'g6':  ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IL'],
  'g8':  ['US', 'GB', 'DE'],
  'g9':  ['US', 'GB', 'DE', 'FR'],
  'g11': ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IL'],
};
function itemCountries(id: string) { return ITEM_COUNTRIES[id] ?? ['US']; }

function localPrice(basePrice: number, countryCode: string | null): { display: string; isLocalized: boolean } {
  if (!countryCode || countryCode === 'US') return { display: `$${basePrice}`, isLocalized: false };
  const multiplier = COUNTRY_PRICE_MULTIPLIERS[countryCode] ?? 1;
  const adjusted = Math.round(basePrice * multiplier);
  return { display: `$${adjusted}`, isLocalized: true };
}

// ── PillDropdown ────────────────────────────────────────────────────────────
function PillDropdown({
  label, open, onToggle, onClose, prefix, children, alignRight = false,
}: {
  label: string; open: boolean; onToggle: () => void; onClose: () => void;
  prefix?: React.ReactNode; children: React.ReactNode; alignRight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-white border border-snp-navy-200 rounded-full px-4 py-2 text-[13px] font-medium text-snp-navy-950 hover:bg-snp-navy-50 transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {prefix}{label}
        <ChevronDown className="w-3.5 h-3.5 text-snp-navy-500" />
      </button>
      {open && (
        <div className={`absolute top-full mt-1.5 bg-white border border-snp-navy-200 rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[180px] py-1.5 ${alignRight ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 transition-colors flex items-center justify-between gap-3 ${active ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [budgetIdx, setBudgetIdx]               = useState(0);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set(['US']));
  const [activeCountry, setActiveCountry]         = useState<string | null>('US');
  const [showBudgetMenu, setShowBudgetMenu]       = useState(false);
  const [showCountryMenu, setShowCountryMenu]     = useState(false);

  const col = COLLECTION_EXAMPLES.find(c => c.id === id);

  // Keep activeCountry in sync with selectedCountries
  useEffect(() => {
    const codes = [...selectedCountries];
    if (codes.length === 0) { setActiveCountry(null); return; }
    if (!activeCountry || !selectedCountries.has(activeCountry)) {
      setActiveCountry(codes[0]);
    }
  }, [selectedCountries]);

  if (!col) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Package className="w-12 h-12 text-snp-navy-400" />
        <p className="text-[16px] font-semibold text-snp-navy-700">Collection not found</p>
        <button onClick={() => navigate('/swag')} className="text-[13px] font-semibold text-snp-indigo-600 hover:underline">
          Back to Overview
        </button>
      </div>
    );
  }

  const allSwag = col.swagProductIds.map(id => PRODUCTS.find(p => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const allGifts = col.otherGiftIds.map(id => MARKETPLACE_GIFTS.find(g => g.id === id)).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const budget = BUDGET_OPTIONS[budgetIdx];
  const multiCountry = selectedCountries.size >= 2;
  const filterCountry = activeCountry ?? (selectedCountries.size === 1 ? [...selectedCountries][0] : null);

  function passesFilters(price: number, itemId: string) {
    const inBudget = price >= budget.min && price <= budget.max;
    const inCountry = !filterCountry || itemCountries(itemId).includes(filterCountry);
    return inBudget && inCountry;
  }

  const swagProducts = allSwag.filter(p  => passesFilters(p.price,  p.id));
  const marketplaceGifts = allGifts.filter(g => passesFilters(g.price, g.id));

  function toggleCountry(code: string) {
    setSelectedCountries(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  function closeAll() { setShowBudgetMenu(false); setShowCountryMenu(false); }

  const countryLabel = selectedCountries.size === 0
    ? 'All Countries'
    : selectedCountries.size === 1
      ? (() => { const c = COUNTRIES.find(c => c.code === [...selectedCountries][0]); return c ? `${c.flag} ${c.name}` : 'Country'; })()
      : `${selectedCountries.size} Countries`;

  const isDefaultCountry = selectedCountries.size === 1 && selectedCountries.has('US');
  const hasFilters = budgetIdx > 0 || !isDefaultCountry;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: 'var(--snp-navy-50)' }}>

      {/* ── Collection Header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-4">
            <button onClick={() => navigate('/swag')} className="text-[12px] font-bold text-snp-navy-400 uppercase tracking-wide hover:text-snp-navy-600 transition-colors">Swag</button>
            <span className="text-[12px] text-snp-navy-400">/</span>
            <span className="text-[12px] font-bold text-snp-navy-600 uppercase tracking-wide">Collections</span>
            <span className="text-[12px] text-snp-navy-400">/</span>
            <span className="text-[12px] font-bold text-snp-navy-700 uppercase tracking-wide truncate max-w-[200px]">{col.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white self-start" style={{ backgroundColor: col.tagColor }}>{col.tag}</span>
              <h1 className="text-[24px] md:text-[28px] text-snp-navy-950 font-semibold leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>{col.name}</h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/collection/new', { state: { collectionId: col.id } })}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-snp-navy-950 text-[13px] font-semibold hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => navigate('/send')}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: '#3077c9' }}
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Logo Hero ──────────────────────────────────────────────────── */}
      <LogoHero
        onCreateCollection={() => navigate('/collection/new', { state: { collectionId: col.id } })}
        ctaLabel="Personalize Collection →"
        productIds={col.swagProductIds.slice(0, 2)}
      />

      {/* ── Filter toolbar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-3 flex items-center gap-3 flex-wrap">

          {/* Budget */}
          <PillDropdown
            label={budget.label === 'Any Budget' ? 'Budget' : budget.label}
            open={showBudgetMenu}
            onToggle={() => { closeAll(); setShowBudgetMenu(v => !v); }}
            onClose={closeAll}
          >
            {BUDGET_OPTIONS.map((opt, i) => (
              <DropdownItem key={opt.label} active={i === budgetIdx} onClick={() => { setBudgetIdx(i); setShowBudgetMenu(false); }}>
                {opt.label}
              </DropdownItem>
            ))}
          </PillDropdown>

          {/* Country */}
          <PillDropdown
            label={countryLabel}
            open={showCountryMenu}
            onToggle={() => { closeAll(); setShowCountryMenu(v => !v); }}
            onClose={closeAll}
            prefix={selectedCountries.size === 0 ? undefined : (
              <span className="flex -space-x-1 mr-0.5">
                {[...selectedCountries].slice(0, 3).map(code => {
                  const c = COUNTRIES.find(c => c.code === code);
                  return c ? <span key={code} className="text-[13px] leading-none">{c.flag}</span> : null;
                })}
              </span>
            )}
          >
            {COUNTRIES.map(c => (
              <DropdownItem key={c.code} active={selectedCountries.has(c.code)} onClick={() => toggleCountry(c.code)}>
                <span className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{c.flag}</span>
                  {c.name}
                </span>
              </DropdownItem>
            ))}
          </PillDropdown>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={() => { setBudgetIdx(0); setSelectedCountries(new Set()); setActiveCountry(null); }}
              className="flex items-center gap-1 text-[12px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto text-[13px] text-snp-navy-400">
            {swagProducts.length + marketplaceGifts.length} item{swagProducts.length + marketplaceGifts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Country tabs (multi-select only) ───────────────────────────── */}
      {multiCountry && (
        <div className="bg-white border-b border-snp-navy-200">
          <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] flex gap-0">
            {[...selectedCountries].map(code => {
              const c = COUNTRIES.find(c => c.code === code);
              if (!c) return null;
              const active = activeCountry === code;
              return (
                <button
                  key={code}
                  onClick={() => setActiveCountry(code)}
                  className={`flex items-center gap-2 h-11 px-5 text-[13px] font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                    active
                      ? 'border-snp-indigo-600 text-snp-navy-950 font-semibold'
                      : 'border-transparent text-snp-navy-600 hover:text-snp-navy-700'
                  }`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Product grids ──────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-10">

        {swagProducts.length === 0 && marketplaceGifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-[16px] font-semibold text-snp-navy-700 mb-1">No items match these filters</p>
            <p className="text-[13px] text-snp-navy-500">Try a different budget range or country</p>
          </div>
        ) : (
          <>
            {swagProducts.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest mb-4">Branded Swag</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
                  {swagProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-[20px] border border-snp-navy-200 overflow-hidden group hover:shadow-[0px_8px_24px_0px_rgba(1,39,84,0.10)] hover:border-snp-navy-300 transition-all"
                    >
                      <div
                        className="bg-snp-navy-50 h-[180px] flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location } })}
                      >
                        {product.image.startsWith('/') ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" style={{ mixBlendMode: 'multiply' }} />
                        ) : (
                          <span className="text-[56px]">{product.image}</span>
                        )}
                      </div>
                      <div className="p-3.5 flex flex-col gap-2.5">
                        <div>
                          <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                          <p className="text-[13px] font-semibold text-snp-navy-950 leading-snug mb-2 line-clamp-2">{product.name}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              {(() => {
                                const { display, isLocalized } = localPrice(product.price, filterCountry);
                                return isLocalized ? (
                                  <div className="flex flex-col gap-0">
                                    <p className="text-[13px] font-bold text-snp-indigo-600">{display}</p>
                                    <p className="text-[10px] text-snp-navy-400">incl. duties & taxes</p>
                                  </div>
                                ) : (
                                  <p className="text-[13px] font-bold text-snp-indigo-600">From {display}</p>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {product.colors.slice(0, 3).map(c => (
                                <div key={c.hex} className="w-3.5 h-3.5 rounded-full border-[1.5px] border-white" style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px var(--snp-navy-200)' }} title={c.name} />
                              ))}
                              {product.colors.length > 3 && <span className="text-[9px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 3}</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location } })}
                          className="w-full h-8 rounded-[10px] border border-snp-navy-200 text-[12px] font-semibold text-snp-purple-700 hover:border-snp-purple-700 hover:bg-snp-purple-50 flex items-center justify-center gap-1.5 transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <Pencil className="w-3 h-3" />
                          Edit Design
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {marketplaceGifts.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest mb-4">Marketplace Gifts</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {marketplaceGifts.map(gift => (
                    <div key={gift.id} className="bg-white rounded-[20px] border border-snp-navy-200 overflow-hidden group hover:shadow-[0px_8px_24px_0px_rgba(1,39,84,0.10)] hover:border-snp-navy-300 transition-all">
                      <div className="bg-snp-navy-50 h-[180px] flex items-center justify-center overflow-hidden">
                        {gift.image.startsWith('/') ? (
                          <img src={gift.image} alt={gift.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" style={{ mixBlendMode: 'multiply' }} />
                        ) : (
                          <span className="text-[56px]">{gift.image}</span>
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{gift.brand}</p>
                        <p className="text-[13px] font-semibold text-snp-navy-950 leading-snug mb-2 line-clamp-2">{gift.name}</p>
                        {(() => {
                          const { display, isLocalized } = localPrice(gift.price, filterCountry);
                          return isLocalized ? (
                            <div className="flex flex-col gap-0">
                              <p className="text-[13px] font-bold text-snp-indigo-600">{display}</p>
                              <p className="text-[10px] text-snp-navy-400">incl. duties & taxes</p>
                            </div>
                          ) : (
                            <p className="text-[13px] font-bold text-snp-indigo-600">{display}</p>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

    </div>
  );
}
