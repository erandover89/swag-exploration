import { useParams, useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle } from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY } from '../data/mockData';
import { useUserDesigns } from '../context/UserDesignsContext';
import { useDesigns } from '../context/DesignsContext';
import { useCompanyLogo } from '../context/CompanyLogoContext';

function isRasterLogoUrl(url?: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('data:image/svg+xml')) return false;
  if (/\.(svg)(\?|$)/i.test(url) || url.includes('dicebear')) return false;
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}

export function DesignPublicView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDesign } = useUserDesigns();
  const { designs: canvasDesigns } = useDesigns();
  const { logoUrl: contextLogo } = useCompanyLogo();

  const design = id ? getDesign(id) : undefined;

  if (!design) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-16 h-16 rounded-[20px] bg-snp-navy-50 flex items-center justify-center">
          <Eye className="w-8 h-8 text-snp-navy-300" />
        </div>
        <div className="text-center">
          <p className="text-[18px] font-semibold text-snp-navy-800 mb-1">Design not found</p>
          <p className="text-[14px] text-snp-navy-500">This link may have expired or the design was removed.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-2 h-10 px-6 rounded-[12px] text-[13px] font-semibold text-white"
          style={{ background: '#3077c9' }}
        >
          Go to homepage
        </button>
      </div>
    );
  }

  const logoUrl = design.logoUrl ?? contextLogo;

  const allProducts = design.productIds
    .map(pid => PRODUCTS.find(p => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-snp-navy-100" style={{ background: 'linear-gradient(180deg, #f7faff 0%, #fff 100%)' }}>
        <div className="max-w-[1440px] mx-auto px-[120px] pt-6 pb-10">

          {/* View-only badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-snp-navy-100 text-[11px] font-semibold text-snp-navy-500 uppercase tracking-wider">
              <Eye className="w-3 h-3" />
              View only
            </div>
          </div>

          <div className="flex items-start justify-between gap-12">

            {/* Left: name + attribution */}
            <div className="flex flex-col gap-3">
              <div>
                <h1
                  className="text-[36px] font-semibold text-snp-navy-950 leading-[1.15]"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  {design.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {design.themeName && (
                    <span className="text-[12px] text-snp-navy-400">
                      From: <span className="font-medium text-snp-navy-500">{design.themeName}</span>
                    </span>
                  )}
                  <span className="text-[12px] text-snp-navy-400">
                    {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: branding panel (read-only, no Replace Brand button) */}
            <div className="shrink-0">
              <div className="flex items-center bg-white border border-snp-navy-200 rounded-[18px] shadow-[0px_4px_16px_0px_rgba(1,39,84,0.07)] overflow-hidden px-5 py-4 gap-3">
                <div className="w-11 h-11 rounded-[10px] border border-snp-navy-100 flex items-center justify-center overflow-hidden bg-snp-navy-50 shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Brand" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full bg-snp-navy-100 rounded-[8px]" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-snp-navy-400 mb-0.5">Shared by</p>
                  <p className="text-[14px] font-semibold text-snp-navy-950">{MOCK_COMPANY.name}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-[120px] py-8">
        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)' }}
            >
              <Eye className="w-8 h-8" style={{ color: '#3077c9' }} />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-snp-navy-800 mb-1">No products yet</p>
              <p className="text-[14px] text-snp-navy-500">This design doesn't have any products added yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {allProducts.map(product => {
              const isPhoto = product.image.startsWith('/');
              const hasPrintArea = isPhoto && !!product.printArea;
              const showOverlay = hasPrintArea && !!logoUrl;
              const canvasDesign = canvasDesigns[product.id];
              const hasQualityIssue = canvasDesign
                ? (canvasDesign.hasQualityIssue ?? false)
                : (product.hasImageQualityIssue ?? isRasterLogoUrl(logoUrl ?? undefined));

              return (
                <div key={product.id} className="flex flex-col gap-4">

                  {/* Image container — no hover actions, navigate to product detail (view-only) */}
                  <div
                    className="relative bg-snp-navy-50 rounded-[16px] flex flex-col overflow-hidden"
                    style={{ border: hasQualityIssue ? '2px solid #f87171' : '2px solid transparent' }}
                  >
                    <div className="relative flex items-center justify-center py-20 px-8">
                      {product.tags.includes('POPULAR') && (
                        <div className="absolute top-2 left-2 bg-[#fbfcfe] h-8 px-2 rounded-[8px] flex items-center justify-center">
                          <span className="text-[12px] font-bold uppercase text-[#2864a8]">popular</span>
                        </div>
                      )}
                      {isPhoto ? (
                        <div className="relative w-[200px] h-[186px]">
                          <div className="absolute inset-0 bg-white rounded" />
                          <img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-[rgba(48,119,201,0.05)] rounded" />
                          {showOverlay && product.printArea && (
                            product.printArea.style === 'badge' ? (
                              <div
                                className="absolute pointer-events-none flex items-center justify-center rounded-xl bg-white/85 shadow-sm p-1.5"
                                style={{ left: `${product.printArea.x}%`, top: `${product.printArea.y}%`, width: `${product.printArea.width}%`, height: `${product.printArea.height}%` }}
                              >
                                <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                              </div>
                            ) : (
                              <img src={logoUrl} alt="" className="absolute pointer-events-none object-contain"
                                style={{ left: `${product.printArea.x}%`, top: `${product.printArea.y}%`, width: `${product.printArea.width}%`, height: `${product.printArea.height}%`, mixBlendMode: 'multiply', opacity: 0.88 }}
                              />
                            )
                          )}
                          {!hasPrintArea && !!logoUrl && (
                            <div className="absolute bottom-2 right-2 w-8 h-8 rounded-[8px] bg-white shadow-[0px_2px_8px_0px_rgba(1,39,84,0.12)] border border-snp-navy-200 flex items-center justify-center overflow-hidden">
                              <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[80px] inline-block">
                          {product.image}
                        </span>
                      )}
                    </div>

                    {/* Quality issue banner */}
                    {hasQualityIssue && (
                      <div style={{ background: '#fef2f2', borderTop: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626' }}>Low resolution image</span>
                      </div>
                    )}
                  </div>

                  {/* Product info — read-only */}
                  <div className="px-1 flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold uppercase text-snp-navy-950 leading-[1.3] truncate">{product.brand}</span>
                    <span className="text-[14px] text-snp-navy-600 leading-[1.5] line-clamp-2">{product.name}</span>
                    {product.colors.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {product.colors.slice(0, 5).map(c => (
                          <div key={c.hex} className="w-3 h-3 rounded-full border-[1.5px] border-white" style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }} title={c.name} />
                        ))}
                        {product.colors.length > 5 && (
                          <span className="text-[9px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 5}</span>
                        )}
                      </div>
                    )}
                    <span className="text-[13px] font-semibold text-snp-navy-700">${product.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-snp-navy-100 py-6 text-center">
        <p className="text-[12px] text-snp-navy-400">
          Shared via <span className="font-semibold text-snp-navy-600">Snappy Swag</span>
        </p>
      </div>

    </div>
  );
}
