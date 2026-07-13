import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, Package, ArrowRight, Star } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useLookbooks } from '../context/LookbookContext';
import { useCompanyLogo } from '../context/CompanyLogoContext';

// Mirrored from DesignWorkspace — keeps this page self-contained
interface PublishState {
  publishedAt: string;
  snapshot: { productIds: string[]; logoUrl: string | null };
  connections: {
    collections: Array<{ id: string; name: string; sentCount: number; syncedAt: string }>;
    store: { name: string; url: string; syncedAt: string } | null;
  };
}
function savePublishState(lookbookId: string, state: PublishState): void {
  try { localStorage.setItem(`snappy_publish_${lookbookId}`, JSON.stringify(state)); } catch {}
}

export function DesignPublishPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLookbook } = useLookbooks();
  const { logoUrl: contextLogo } = useCompanyLogo();

  const design = id ? getLookbook(id) : undefined;
  if (!design) { navigate('/designs', { replace: true }); return null; }

  const logoUrl = design.logoUrl ?? contextLogo;

  const previewProducts = design.productIds
    .map(pid => PRODUCTS.find(p => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 5);

  function publish(mode: 'collection' | 'mix' | 'browse') {
    if (!id || !design) return;
    const now = new Date().toISOString();
    const snapshot = { productIds: [...design.productIds], logoUrl };
    if (mode === 'collection') {
      savePublishState(id, {
        publishedAt: now,
        snapshot,
        connections: {
          collections: [{ id: 'c1', name: `${design.name} Collection`, sentCount: 0, syncedAt: now }],
          store: null,
        },
      });
      navigate('/collection/preview', { state: { designId: id } });
    } else if (mode === 'mix') {
      savePublishState(id, {
        publishedAt: now,
        snapshot,
        connections: {
          collections: [{ id: 'c1', name: `${design.name} Collection`, sentCount: 0, syncedAt: now }],
          store: null,
        },
      });
      navigate('/collection/edit');
    } else {
      savePublishState(id, { publishedAt: now, snapshot, connections: { collections: [], store: null } });
      navigate(`/designs/${id}`);
    }
  }

  const yOffsets = [10, -6, 0, -6, 10];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(155deg, #eef3ff 0%, #f5eeff 45%, #fff4ee 100%)' }}
    >
      {/* Header */}
      <div className="h-14 flex items-center px-8 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-snp-navy-500 hover:text-snp-navy-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {design.name}
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 pb-10">

        {/* Product thumbnails — slight arc */}
        {previewProducts.length > 0 && (
          <div className="flex items-end gap-3 h-20">
            {previewProducts.map((p, i) => {
              const isPhoto = p.image.startsWith('/');
              return (
                <div
                  key={p.id}
                  className="w-[64px] h-[64px] rounded-[14px] bg-white flex items-center justify-center overflow-hidden shrink-0"
                  style={{
                    boxShadow: '0px 6px 20px rgba(1,39,84,0.10), 0px 1px 4px rgba(1,39,84,0.06)',
                    transform: `translateY(${yOffsets[i] ?? 0}px)`,
                    border: '1.5px solid rgba(224,235,247,0.8)',
                  }}
                >
                  {isPhoto
                    ? <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1.5" />
                    : <span className="text-[26px]">{p.image}</span>
                  }
                </div>
              );
            })}
          </div>
        )}

        {/* Heading */}
        <div className="text-center">
          <h1
            className="text-[42px] font-semibold text-snp-navy-950 leading-tight mb-2"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Your design is ready&nbsp;🎉
          </h1>
          <p className="text-[16px] text-snp-navy-500">
            How do you want to get it into people's hands?
          </p>
        </div>

        {/* Option cards */}
        <div className="flex gap-4 w-full max-w-[960px]">

          {/* Gift collection — recommended */}
          <button
            type="button"
            onClick={() => publish('collection')}
            className="flex-1 text-left rounded-[24px] p-7 flex flex-col gap-5 group transition-all duration-200 hover:scale-[1.025] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(145deg, #1a56b0 0%, #3077c9 60%, #5195e8 100%)',
              boxShadow: '0px 12px 32px rgba(30,86,180,0.28)',
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <Send className="w-5 h-5 text-white" />
              </div>
              <span
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
              >
                <Star className="w-2.5 h-2.5 fill-current" />
                Recommended
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <h3
                className="text-[19px] font-semibold text-white leading-snug"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Let recipients pick their swag
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Set a budget. Recipients choose their favorite item. Shipping always included worldwide.
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 text-[13px] font-semibold text-white group-hover:gap-2.5 transition-all"
            >
              Set up a collection <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Mix & match — Snappy exclusive */}
          <button
            type="button"
            onClick={() => publish('mix')}
            className="flex-1 text-left rounded-[24px] p-7 flex flex-col gap-5 group transition-all duration-200 hover:scale-[1.025] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(145deg, #5b21b6 0%, #7c3aed 60%, #9461f5 100%)',
              boxShadow: '0px 12px 32px rgba(91,33,182,0.25)',
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#d8b4fe' }}
              >
                Snappy exclusive
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <h3
                className="text-[19px] font-semibold text-white leading-snug"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Mix swag with other gifts
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Combine branded swag with experiences, gift cards, and more. Recipients pick their favorite combination.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white group-hover:gap-2.5 transition-all">
              Build a mixed collection <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Browse & send */}
          <button
            type="button"
            onClick={() => publish('browse')}
            className="flex-1 text-left rounded-[24px] p-7 flex flex-col gap-5 group transition-all duration-200 hover:scale-[1.025] active:scale-[0.99]"
            style={{
              background: 'white',
              boxShadow: '0px 8px 24px rgba(1,39,84,0.06)',
              border: '1.5px solid rgba(224,235,247,0.8)',
            }}
          >
            <div className="w-11 h-11 rounded-[12px] bg-snp-navy-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-snp-navy-500" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <h3
                className="text-[19px] font-semibold text-snp-navy-950 leading-snug"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Browse & send a single item
              </h3>
              <p className="text-[13px] text-snp-navy-500 leading-relaxed">
                Pick one product and send it directly. Each recipient enters their own shipping address.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-snp-navy-700 group-hover:text-snp-indigo-600 group-hover:gap-2.5 transition-all">
              Browse items <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] text-snp-navy-400 hover:text-snp-navy-600 transition-colors"
        >
          Not ready yet — come back later
        </button>
      </div>
    </div>
  );
}
