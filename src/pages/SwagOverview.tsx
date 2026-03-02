import { useState } from 'react';
import { X, Send, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PRODUCTS, MY_DESIGNS, COLLECTION_EXAMPLES, MARKETPLACE_GIFTS,
  type CollectionExample,
} from '../data/mockData';
import { AskSnippyButton } from '../components/AskSnippyButton';

// ── Tab strip shared across swag pages ──────────────────────────────────────
export function SwagPageHeader({ activeTab }: { activeTab: 'overview' | 'catalog' }) {
  const navigate = useNavigate();
  return (
    <div className="relative bg-white border-b border-[#e0ebf7] overflow-hidden">
      <div
        className="absolute right-0 top-0 w-[60%] h-full pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(201,255,253,0.45) 50%, rgba(185,210,255,0.35) 100%)' }}
      />
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-[120px] pt-6 pb-0">
        <div className="absolute right-4 md:right-[120px] top-6">
          <AskSnippyButton />
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[12px] font-bold text-[#a6b3c3] uppercase tracking-wide">Discover</span>
          <span className="text-[12px] text-[#a6b3c3]">/</span>
          <span className="text-[12px] font-bold text-[#59728f] uppercase tracking-wide">Swag</span>
        </div>

        <h1
          className="text-4xl md:text-[56px] text-[#012754] leading-tight mb-0"
          style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}
        >
          Swag
        </h1>

        <div className="flex items-end gap-0 mt-2 border-b border-[#e0ebf7]">
          {[
            { id: 'overview' as const, label: 'Overview', path: '/' },
            { id: 'catalog' as const, label: 'Catalog', path: '/catalog' },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`h-14 px-5 md:px-8 text-[14px] md:text-[16px] font-medium transition-all border-b-2 -mb-px ${
                  active ? 'border-[#012754] text-[#012754]' : 'border-transparent text-[#59728f] hover:text-[#345276]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Product image helper ──────────────────────────────────────────────────────
function ProductImg({ src, className }: { src: string; className?: string }) {
  if (src.startsWith('/')) {
    return <img src={src} alt="" className={className ?? 'w-full h-full object-contain'} />;
  }
  return <span className={className ?? 'text-5xl'}>{src}</span>;
}

// ── Collection card (Figma-inspired) ────────────────────────────────────────
function CollectionCard({ col }: { col: CollectionExample }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const swagProducts = col.swagProductIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  // The featured (large) product image = first swag product
  const featured = swagProducts[0];
  // The small thumbnails = all swag products (up to 3) + fallback other gifts rendered as icons
  const thumbnailProducts = swagProducts.slice(0, 3);

  // Small image fan transforms on hover
  const fanTransforms = hovered
    ? ['rotate(-8deg) translateY(-5px)', 'rotate(0deg) translateY(-2px)', 'rotate(8deg) translateY(-5px)']
    : ['rotate(0deg) translateY(0)', 'rotate(0deg) translateY(0)', 'rotate(0deg) translateY(0)'];

  return (
    <div
      className="bg-white rounded-[20px] border border-[#e0ebf7] overflow-hidden flex flex-col cursor-pointer"
      style={{
        boxShadow: hovered
          ? '0px 20px 40px 0px rgba(1,39,84,0.14)'
          : '0px 4px 12px 0px rgba(1,39,84,0.06)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'box-shadow 0.28s ease, transform 0.28s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="bg-[#f5f8fc] p-3 flex gap-2 h-[200px]">
        {/* Left column: 3 small thumbnails */}
        <div className="flex flex-col gap-1.5 w-[72px] shrink-0">
          {[0, 1, 2].map(i => {
            const p = thumbnailProducts[i] ?? thumbnailProducts[0];
            return (
              <div
                key={i}
                className="flex-1 bg-white rounded-[10px] flex items-center justify-center overflow-hidden"
                style={{
                  transform: fanTransforms[i],
                  transition: `transform 0.28s ease ${i * 40}ms`,
                }}
              >
                {p ? (
                  <ProductImg
                    src={p.image}
                    className={p.image.startsWith('/') ? 'w-full h-full object-contain' : 'text-2xl'}
                  />
                ) : (
                  <span className="text-2xl">🎁</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: large featured image */}
        <div className="flex-1 bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
          {featured ? (
            <ProductImg
              src={featured.image}
              className={featured.image.startsWith('/') ? 'w-full h-full object-cover' : 'text-[64px]'}
            />
          ) : (
            <span className="text-[64px]">🎁</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white shrink-0"
            style={{ backgroundColor: col.tagColor }}
          >
            {col.tag}
          </span>
          <span className="text-[11px] font-bold text-[#012754] bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2.5 py-1 shrink-0">
            ~${col.budgetTier}/recipient
          </span>
        </div>

        <div>
          <p className="text-[15px] font-bold text-[#012754] leading-snug">{col.name}</p>
          <p className="text-[12px] text-[#59728f] mt-0.5 leading-snug">{col.description}</p>
        </div>

        {col.collectionType === 'mixed' && col.otherGiftIds.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {col.otherGiftIds.slice(0, 2).map(gId => {
              const mg = MARKETPLACE_GIFTS.find(g => g.id === gId);
              return mg ? (
                <span key={gId} className="text-[10px] italic text-[#8093a9] bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2 py-0.5">
                  {mg.brand} {mg.name.split(' ').slice(0, 2).join(' ')}
                </span>
              ) : null;
            })}
            {col.otherGiftIds.length > 2 && (
              <span className="text-[10px] font-bold text-[#8093a9] bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2 py-0.5">
                +{col.otherGiftIds.length - 2} more
              </span>
            )}
          </div>
        )}

        {col.collectionType === 'swag-only' && swagProducts.length > 1 && (
          <div className="flex items-center gap-1 flex-wrap">
            {swagProducts.map((p, idx) => (
              <span key={p!.id} className="text-[10px] text-[#8093a9]">
                {idx > 0 && <span className="font-bold text-[#a6b3c3] mx-0.5">or</span>}
                <span className="italic">{p!.name.split(' ').slice(0, 2).join(' ')}</span>
              </span>
            ))}
          </div>
        )}

        <button
          className="mt-auto h-9 w-full rounded-[10px] border border-[#3077c9] text-[#3077c9] text-[12px] font-semibold hover:bg-[#f0f6ff] active:bg-[#e0ebf7] transition-colors"
          onClick={() => navigate('/collection/new')}
        >
          Build This Collection →
        </button>
      </div>
    </div>
  );
}

// ── Main Overview page ────────────────────────────────────────────────────────
export function SwagOverview() {
  const navigate = useNavigate();
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  const totalSends = MY_DESIGNS.reduce((sum, d) => sum + d.sendCount, 0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header with tabs ─────────────────────────────────── */}
      <SwagPageHeader activeTab="overview" />

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — How It Works (dismissible, new users)
      ══════════════════════════════════════════════════════════ */}
      {showHowItWorks && (
        <div
          className="relative border-b border-[#e0ebf7]"
          style={{ background: 'linear-gradient(135deg, #f5f8fc 0%, #eaf4ff 50%, #f0f8f5 100%)' }}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] py-8">
            <button
              className="absolute top-4 right-4 md:right-[120px] flex items-center gap-1 text-[12px] font-medium text-[#8093a9] hover:text-[#59728f] transition-colors"
              onClick={() => setShowHowItWorks(false)}
            >
              Got it <X className="w-3.5 h-3.5" />
            </button>

            <h2 className="text-[13px] font-bold text-[#3077c9] uppercase tracking-widest mb-6">
              How It Works
            </h2>

            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-0">
              {[
                { emoji: '🎨', title: 'Design Your Swag', desc: 'Pick a product from the catalog and brand it with your logo and colors' },
                { emoji: '🎁', title: 'Build a Gift Collection', desc: 'Mix swag with other types of gifts — your recipients choose what they want' },
                { emoji: '🚀', title: 'Send to Anyone', desc: 'Ship anywhere in the world, or send a digital gift link instantly' },
              ].map((step, i) => (
                <div key={i} className="flex-1 flex gap-3 md:flex-col md:gap-2 items-start">
                  {i > 0 && <div className="hidden md:block w-full h-px border-t border-dashed border-[#b7cfec] mb-2 -mt-4" />}
                  <span className="text-3xl shrink-0">{step.emoji}</span>
                  <div>
                    <p className="text-[15px] font-bold text-[#012754]">{step.title}</p>
                    <p className="text-[13px] text-[#59728f] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[13px] italic text-[#59728f]">
              Pro tip: Mix swag with any product from Snappy's marketplace — physical gifts, subscriptions, donations & more. Recipients pick their favorite
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — My Swag Designs shelf (returning users)
      ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-[#e0ebf7] bg-white py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <button
                className="text-[20px] font-bold text-[#012754] hover:text-[#3077c9] transition-colors text-left leading-none"
                onClick={() => navigate('/designs')}
              >
                My Swag Designs
              </button>
              <p className="text-[12px] text-[#a6b3c3] mt-0.5">{MY_DESIGNS.length} designs · {totalSends} total sends</p>
            </div>
            <button
              className="text-[13px] font-semibold text-[#3077c9] hover:underline shrink-0"
              onClick={() => navigate('/catalog')}
            >
              + Design Something New
            </button>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {MY_DESIGNS.map(design => {
              const product = PRODUCTS.find(p => p.id === design.productId);
              return (
                <div
                  key={design.id}
                  className="flex-shrink-0 bg-[#f5f8fc] rounded-[16px] p-3.5 flex flex-col gap-2.5"
                  style={{ width: '178px' }}
                >
                  {/* Product thumb */}
                  <div
                    className="rounded-[12px] flex items-center justify-center overflow-hidden"
                    style={{ height: '90px', backgroundColor: `${design.colorHex}18` }}
                  >
                    {product && (
                      product.image.startsWith('/') ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{product.image}</span>
                      )
                    )}
                  </div>

                  {/* Color + name */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-white shadow-sm shrink-0" style={{ backgroundColor: design.colorHex }} />
                    <span className="text-[10px] text-[#8093a9]">{design.colorName}</span>
                    {design.sendCount > 0 && (
                      <span className="ml-auto text-[9px] font-bold text-[#3077c9] bg-white border border-[#e0ebf7] rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                        ×{design.sendCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-bold text-[#012754] truncate leading-snug">{design.name}</p>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-auto">
                    <button
                      className="flex-1 h-8 rounded-[8px] text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                      onClick={() => alert(`Sending "${design.name}"…`)}
                    >
                      <Send className="w-3 h-3" /> Send
                    </button>
                    <button
                      className="w-8 h-8 rounded-[8px] border border-[#e0ebf7] flex items-center justify-center text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] transition-colors"
                      onClick={() => navigate(`/design/${design.productId}`)}
                      title="Edit design"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Ghost "New Design" card */}
            <div
              className="flex-shrink-0 border-2 border-dashed border-[#b7cfec] rounded-[16px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#f5f8fc] transition-colors p-4"
              style={{ width: '140px', minWidth: '140px' }}
              onClick={() => navigate('/catalog')}
            >
              <span className="text-3xl text-[#a6b3c3]">+</span>
              <p className="text-[11px] font-semibold text-[#8093a9] text-center leading-snug">Design Something New</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — Gift Collections (Figma-inspired cards)
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-[#fafcff] py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2
                className="text-[28px] md:text-[36px] font-semibold text-[#012754] leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Start a Gift Collection
              </h2>
              <p className="text-[14px] text-[#59728f] mt-1">
                Combine branded swag with any product from Snappy's marketplace — your recipients choose their favorite
              </p>
            </div>
            <button
              className="self-start md:self-auto shrink-0 text-[13px] font-semibold text-[#3077c9] hover:underline"
              onClick={() => navigate('/catalog')}
            >
              Browse full catalog →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {COLLECTION_EXAMPLES.map(col => (
              <CollectionCard key={col.id} col={col} />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — Catalog CTA banner
      ══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#e0ebf7] bg-white py-14">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-[24px] font-semibold text-[#012754]"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Ready to pick a product?
            </h3>
            <p className="text-[14px] text-[#59728f] mt-1">
              Browse 200+ premium swag items from the world's top brands
            </p>
          </div>
          <button
            className="shrink-0 flex items-center gap-2 h-12 px-8 rounded-[16px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
            onClick={() => navigate('/catalog')}
          >
            Browse the Catalog →
          </button>
        </div>
      </div>
    </div>
  );
}
