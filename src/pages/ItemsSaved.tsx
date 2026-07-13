import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useCompanyLogo } from '../context/CompanyLogoContext';

const CORE_PRODUCT_IDS = ['1', '2', '4', '6', '9'];

export function ItemsSaved() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { addProductsToBrandSet } = useCompanyLogo();
  const locationState = state as {
    productIds?: string[];
    logoUrl?: string;
    backgroundLocation?: unknown;
  } | null;

  const productIds = locationState?.productIds ?? CORE_PRODUCT_IDS;
  const logoUrl    = locationState?.logoUrl;

  const products = productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  const count = products.length;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (productIds.length > 0) addProductsToBrandSet(productIds);
    return () => { document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() { navigate(-1); }

  function handleCreateCollection() {
    navigate('/collection/preview', { state: { logoUrl, productIds, collectionName: 'My Swag Kit' } });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @keyframes saved-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);   }
        }
        @keyframes check-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes thumb-in {
          from { opacity: 0; transform: scale(0.8) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[28px] w-[480px] max-w-[calc(100vw-2rem)] shadow-[0px_40px_80px_rgba(1,39,84,0.30)] overflow-hidden"
        style={{ animation: 'saved-in 0.24s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center hover:bg-snp-navy-200 transition-colors z-10"
        >
          <X className="w-4 h-4 text-snp-navy-600" />
        </button>

        <div className="px-8 pt-8 pb-7 flex flex-col items-center text-center gap-5">

          {/* Checkmark */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              animation: 'check-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 13L10.5 18.5L21 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Headline + subtitle */}
          <div className="flex flex-col gap-1">
            <h2
              className="text-[26px] font-bold text-snp-navy-950 leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Your swag set is ready.
            </h2>
            <p className="text-[14px] text-snp-navy-600">
              {count} item{count !== 1 ? 's' : ''} saved to My Items
            </p>
          </div>

          {/* Thumbnail strip */}
          {products.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {products.slice(0, 6).map((p, i) => (
                <div
                  key={p!.id}
                  className="relative w-[60px] h-[60px] rounded-[12px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center overflow-hidden"
                  style={{ animation: `thumb-in 0.3s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.05}s both` }}
                >
                  {p!.image.startsWith('/') ? (
                    <img src={p!.image} alt={p!.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <span className="text-2xl">{p!.image}</span>
                  )}
                  {/* Logo badge — bottom-right corner */}
                  {logoUrl && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-[4px] bg-white shadow-sm border border-snp-navy-200 flex items-center justify-center overflow-hidden">
                      <img src={logoUrl} alt="" className="w-full h-full object-contain p-[2px]" />
                    </div>
                  )}
                </div>
              ))}
              {products.length > 6 && (
                <div
                  className="w-[60px] h-[60px] rounded-[12px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center text-[12px] font-semibold text-snp-navy-500"
                  style={{ animation: `thumb-in 0.3s cubic-bezier(0.22,1,0.36,1) ${0.15 + 6 * 0.05}s both` }}
                >
                  +{products.length - 6}
                </div>
              )}
            </div>
          )}

          {/* Primary CTA */}
          <div className="w-full flex flex-col gap-1.5 mt-1">
            <button
              onClick={handleCreateCollection}
              className="w-full h-12 rounded-[14px] text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.99]"
              style={{ background: '#3077c9', boxShadow: '0px 4px 16px rgba(48,119,201,0.35)' }}
            >
              Create a collection and send
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[12px] text-snp-navy-400">
              Let recipients choose from your set — we handle fulfillment
            </p>
          </div>

          {/* Quiet secondary */}
          <button
            onClick={() => navigate('/designs')}
            className="text-[13px] text-snp-navy-400 hover:text-snp-indigo-600 transition-colors mt-2"
          >
            I'll do this later →
          </button>

        </div>
      </div>
    </div>
  );
}
