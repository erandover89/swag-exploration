import { useState, useEffect } from 'react';
import { X, Check, Send, Share2, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { PRODUCTS, COUNTRIES, type Design, BUDGET_RANGES } from '../data/mockData';

const BUDGET_TABS = BUDGET_RANGES;

interface Props {
  design: Design;
  onSend: (budget: number) => void;
  onClose: () => void;
}

export function CollectionPreviewModal({ design, onSend, onClose }: Props) {
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [visible, setVisible] = useState(false);

  const country = COUNTRIES.find(c => c.code === selectedCountry)!;

  const allProducts = design.productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const selectedRange = BUDGET_TABS.find(b => b.max === selectedBudget);
  const visibleProducts = selectedBudget === null
    ? allProducts
    : allProducts.filter(p => p.price <= selectedBudget && p.price >= (selectedRange?.min ?? 0));

  // Animate in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Mosaic: first 4 products
  const mosaicProducts = allProducts.slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Modal panel — slides up from bottom */}
      <div
        className="relative bg-white w-full max-w-[1080px] h-[92vh] flex flex-col overflow-hidden shadow-[0px_-24px_80px_rgba(1,39,84,0.22)]"
        style={{
          borderRadius: '28px 28px 0 0',
          transform: visible ? 'translateY(0)' : 'translateY(60px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-snp-navy-100 hover:bg-snp-navy-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-snp-navy-600" />
        </button>

        {/* ── Hero header ───────────────────────────────────────────── */}
        <div className="flex gap-6 px-7 pt-6 pb-5 border-b border-snp-navy-100 shrink-0">

          {/* Product mosaic */}
          <div
            className="w-[176px] h-[132px] rounded-[16px] overflow-hidden shrink-0 grid grid-cols-2 gap-0.5 bg-snp-navy-100"
            style={{ gridTemplateRows: '1fr 1fr' }}
          >
            {mosaicProducts.length === 0 ? (
              <div className="col-span-2 row-span-2 flex items-center justify-center bg-snp-navy-50">
                <span className="text-[11px] text-snp-navy-300 font-medium">No products</span>
              </div>
            ) : mosaicProducts.map(p => (
              <div key={p.id} className="bg-white flex items-center justify-center overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
              </div>
            ))}
          </div>

          {/* Info + CTA */}
          <div className="flex-1 flex flex-col justify-between min-w-0 pr-10">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">Collection Ready</span>
              </div>
              <h2
                className="text-[26px] font-semibold text-snp-navy-950 leading-tight truncate"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {design.name}
              </h2>
              <p className="text-[13px] text-snp-navy-500 mt-1 leading-snug">
                {allProducts.length} products · Recipients will pick one gift.{' '}
                <span className="font-semibold text-snp-indigo-600">Choose a budget below</span> to filter what they see.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                disabled={!selectedBudget}
                onClick={() => selectedBudget && onSend(selectedBudget)}
                iconLeft={<Send className="w-3.5 h-3.5" />}
              >
                {selectedBudget ? `Send this ${selectedRange?.label ?? `$${selectedBudget}`} collection` : 'Select a budget to send'}
              </Button>
              <button className="h-10 w-10 rounded-[12px] border border-snp-navy-200 hover:border-snp-indigo-600 hover:text-snp-indigo-600 flex items-center justify-center text-snp-navy-500 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Budget strip ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-7 py-3 border-b border-snp-navy-100 bg-white shrink-0 overflow-x-auto">

          {/* Country selector */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCountryMenu(v => !v)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-snp-navy-200 text-[12px] font-semibold text-snp-navy-700 hover:border-snp-indigo-400 transition-colors whitespace-nowrap"
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <ChevronDown className="w-3 h-3 text-snp-navy-400" />
            </button>
            {showCountryMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-snp-navy-200 rounded-[14px] shadow-[0px_8px_24px_rgba(1,39,84,0.12)] z-30 py-1 min-w-[130px]">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCountry(c.code); setShowCountryMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-snp-navy-50 transition-colors text-left"
                  >
                    <span>{c.flag}</span>
                    <span className="flex-1 text-snp-navy-800">{c.name}</span>
                    {c.code === selectedCountry && <Check className="w-3.5 h-3.5 text-snp-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-snp-navy-200 shrink-0" />

          {/* Budget pills */}
          {BUDGET_TABS.map(b => {
            const count = allProducts.filter(p => p.price <= b.max && p.price >= b.min).length;
            const isSelected = selectedBudget === b.max;
            return (
              <button
                key={b.max}
                onClick={() => setSelectedBudget(isSelected ? null : b.max)}
                className="relative h-8 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all shrink-0"
                style={{
                  background: isSelected ? 'var(--snp-indigo-600)' : 'var(--snp-navy-50)',
                  color: isSelected ? 'white' : 'var(--snp-navy-600)',
                  boxShadow: isSelected ? '0 2px 8px rgba(48,119,201,0.3)' : 'none',
                }}
              >
                {b.label}
                {count > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--snp-indigo-100)',
                      color: isSelected ? 'white' : 'var(--snp-indigo-600)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Sub-header */}
          <div className="text-center pt-6 pb-4 px-7">
            <h3
              className="text-[18px] font-semibold text-snp-navy-950"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Collection Preview
            </h3>
            <p className="text-[13px] text-snp-navy-500 mt-0.5">
              {selectedBudget
                ? `Showing ${visibleProducts.length} of ${allProducts.length} products in the ${selectedRange?.label ?? `$${selectedBudget}`} range`
                : 'Select a budget above — recipients will only see products within their range'
              }
            </p>
          </div>

          {/* No budget selected — prompt banner */}
          {!selectedBudget && (
            <div className="mx-7 mb-5 flex items-center gap-3 px-4 py-3 rounded-[14px] bg-snp-indigo-50 border border-snp-indigo-200">
              <div className="w-7 h-7 rounded-full bg-snp-indigo-600 flex items-center justify-center shrink-0">
                <span className="text-white text-[13px]">↑</span>
              </div>
              <p className="text-[13px] text-snp-indigo-800 font-medium">
                Choose a budget above to see exactly what each recipient can pick — and to unlock the Send button.
              </p>
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-4 gap-4 px-7 pb-8">
            {visibleProducts.map(product => (
              <div
                key={product.id}
                className="bg-white border border-snp-navy-100 rounded-[16px] overflow-hidden hover:border-snp-navy-200 hover:shadow-[0px_4px_16px_rgba(1,39,84,0.08)] transition-all"
              >
                <div className="aspect-square bg-snp-navy-50 flex items-center justify-center overflow-hidden p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
                  <p className="text-[13px] font-medium text-snp-navy-950 leading-snug line-clamp-2">{product.name}</p>
                  <p className="text-[13px] font-semibold text-snp-indigo-600 mt-1.5">${product.price}</p>
                </div>
              </div>
            ))}

            {/* Empty state when budget too low */}
            {selectedBudget !== null && visibleProducts.length === 0 && (
              <div className="col-span-4 flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-snp-navy-100 flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-snp-navy-700">No products in this range</p>
                  <p className="text-[13px] text-snp-navy-400 mt-1">Try a higher budget to include products in this collection.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
