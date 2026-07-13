import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Truck,
  Pencil,
  Check,
  Clock,
  Palette,
  Warehouse,
  X,
  AlertTriangle,
  Store,
  MoreHorizontal,
  Send,
  Plus,
} from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY, PRINT_TECHNIQUE_CHIPS, type Product } from '../data/mockData';
import { Button } from '../components/Button';
import { useCompanyLogo } from '../context/CompanyLogoContext';
import { useDesigns } from '../context/DesignsContext';
import { useUserDesigns } from '../context/UserDesignsContext';

function isRasterLogoUrl(url?: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('data:image/svg+xml')) return false;
  if (/\.(svg)(\?|$)/i.test(url) || url.includes('dicebear')) return false;
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}

// ── Bulk order contact form modal ─────────────────────────────────────────────

function BulkContactModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState(`Hi, I'm interested in ordering the ${product.name} in bulk.`);
  const [sent, setSent]       = useState(false);

  function handleSend() {
    if (!name.trim() || !email.trim()) return;
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-[24px] w-full max-w-[460px] overflow-hidden shadow-[0px_32px_80px_rgba(1,39,84,0.28)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {sent ? (
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
              <Check className="w-7 h-7 text-[#22c55e]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-snp-navy-950 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Request sent!
              </h2>
              <p className="text-[13px] text-snp-navy-600 leading-relaxed">
                Our team will get back to you within 1 business day with pricing and availability.
              </p>
            </div>
            <Button size="sm" className="mt-2" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="px-7 pt-6 pb-5 border-b border-snp-navy-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Get a Quote
                  </h2>
                  <p className="text-[13px] text-snp-navy-600 mt-0.5 line-clamp-1">{product.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500 hover:text-snp-navy-700 shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-7 py-5 flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">Name *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-10 px-3 rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-[#c8d9ec] focus:outline-none focus:border-snp-indigo-600 transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">Company</label>
                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="h-10 px-3 rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-[#c8d9ec] focus:outline-none focus:border-snp-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-10 px-3 rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-[#c8d9ec] focus:outline-none focus:border-snp-indigo-600 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-snp-navy-500 uppercase tracking-widest">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  className="px-3 py-2.5 rounded-[10px] border border-snp-navy-200 text-[13px] text-snp-navy-950 placeholder:text-[#c8d9ec] focus:outline-none focus:border-snp-indigo-600 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="px-7 pb-6 flex gap-3">
              <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!name.trim() || !email.trim()}
                onClick={handleSend}
              >
                Send request
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bulk & Kits info panel ────────────────────────────────────────────────────

function BulkKitsInfo({ product, onOrder }: { product: Product; onOrder: () => void }) {
  const steps = [
    { icon: Palette,   label: 'Expert design',     desc: 'Our team handles the full branding & mockup' },
    { icon: Clock,     label: 'Production',         desc: `${product.leadTimeDays ?? 14}–${(product.leadTimeDays ?? 14) + 7} day lead time` },
    { icon: Warehouse, label: 'Ships to warehouse', desc: 'Stored and ready to send anytime' },
  ];

  return (
    <div
      className="rounded-[16px] mb-2 border overflow-hidden"
      style={{ borderColor: '#c7d7f4', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 bg-[#eef6ff]">
        <span className="text-base leading-none">📦</span>
        <p className="text-[11px] font-bold text-snp-navy-950 uppercase tracking-widest">Bulk & Kits Order</p>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3 bg-white">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-[8px] bg-[#e8f0fc] border border-[#c7d7f4] flex items-center justify-center shrink-0 mt-0.5">
              <step.icon className="w-3.5 h-3.5 text-snp-indigo-600" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-snp-navy-950 leading-tight">{step.label}</p>
              <p className="text-[11px] text-snp-navy-500 leading-snug">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-4 bg-[#eef6ff] border-t border-[#c7d7f4]">
        <Button size="sm" className="w-full" onClick={onOrder}>Get a Quote</Button>
        <p className="text-[11px] text-snp-navy-500 text-center mt-2.5">
          Our team will reach out within 1 business day
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: routeState } = location;
  const product = PRODUCTS.find(p => p.id === id);

  const { logoUrl, saveLogo } = useCompanyLogo();

  const [previewColorIdx, setPreviewColorIdx] = useState(0);
  const [descExpanded, setDescExpanded]       = useState(true);
  const [showBulkModal, setShowBulkModal]     = useState(false);
  const [sendingGift, _setSendingGift]        = useState(false);
  const [showLogoUpload, setShowLogoUpload]   = useState(false);
  const [showEllipsisMenu, setShowEllipsisMenu] = useState(false);
  const [ellipsisSubPanel, setEllipsisSubPanel] = useState<null | 'collections' | 'stores'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      saveLogo(url);
      setShowLogoUpload(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="text-6xl mb-4">😕</span>
        <h3 className="text-lg font-bold text-snp-navy-700 mb-2">Product not found</h3>
        <button onClick={() => navigate('/')} className="text-snp-indigo-600 text-sm font-medium hover:underline">
          ← Back to catalog
        </button>
      </div>
    );
  }

  const { designs } = useDesigns();
  const { designs: userDesigns } = useUserDesigns();
  const owningDesign = userDesigns.find(d => d.productIds.includes(product.id));
  const currentColor = product.colors[previewColorIdx];
  const isPhoto  = product.image.startsWith('/');
  const isBulk   = product.type === 'bulk';
  const showSizes = product.sizes.length > 1 && product.sizes[0] !== 'One Size';

  // Derive the background path — used both for state selection and design tool navigation.
  const bgPath = (routeState as { backgroundLocation?: { pathname?: string } } | null)
    ?.backgroundLocation?.pathname;

  // Show "designed" state only when opened from a design workspace.
  // From catalog, discover, or collection pages → always show "customize" state.
  const fromDesign = bgPath?.startsWith('/designs/') ?? false;
  const savedDesignForProduct = fromDesign ? designs[product.id] : null;

  const hasQualityIssue = savedDesignForProduct
    ? (savedDesignForProduct.hasQualityIssue ?? false)
    : !!logoUrl && (product.hasImageQualityIssue ?? isRasterLogoUrl(logoUrl));

  const goToDesignTool = () => {
    // Pass background path as `from` so SwagDesignTool can extract the lookbookId.
    navigate(`/design/${product.id}`, { state: { from: bgPath ?? location.pathname } });
  };

  const goBack = () => {
    if (savedDesignForProduct && owningDesign) {
      navigate(`/designs/${owningDesign.id}`);
    } else {
      navigate(-1);
    }
  };

  const techniqueChip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start py-8 px-4 overflow-y-auto"
      style={{ background: 'rgba(1,39,84,0.75)', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Modal card ── */}
      <div
        className="relative bg-[#fbfcfe] border border-[#012754] rounded-[24px] w-full max-w-[1000px] overflow-hidden"
        style={{ boxShadow: '0px 16px 24px 0px rgba(1,39,84,0.16)' }}
      >
        {/* Scrollable inner */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="p-6 flex flex-col gap-6">

            {/* Breadcrumbs */}
            {(() => {
              const rs = routeState as { catalogMode?: boolean; from?: string } | null;
              const fromDesignId = bgPath?.startsWith('/designs/')
                ? bgPath.replace('/designs/', '')
                : null;
              const fromDesignName = fromDesignId
                ? userDesigns.find(d => d.id === fromDesignId)?.name
                : null;
              const rootLabel = rs?.catalogMode ? 'Catalog'
                : fromDesignId ? (fromDesignName ?? 'My Designs')
                : 'Catalog';
              const rootPath = rs?.catalogMode ? '/catalog'
                : fromDesignId ? bgPath!
                : rs?.from ?? '/catalog';
              const crumbs = fromDesignId
                ? [
                    { label: 'My Designs', onClick: () => navigate('/designs') },
                    { label: fromDesignName ?? 'Design', onClick: () => navigate(bgPath!) },
                    { label: product.name, onClick: null },
                  ]
                : [
                    { label: rootLabel, onClick: () => navigate(rootPath) },
                    { label: product.category, onClick: () => navigate('/catalog', { state: { category: product.category } }) },
                    { label: product.name, onClick: null },
                  ];
              return (
                <div className="flex items-center gap-1.5 pr-16 flex-wrap">
                  {crumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-[13px] text-snp-navy-300">/</span>}
                      {crumb.onClick ? (
                        <button
                          onClick={crumb.onClick}
                          className="text-[13px] text-snp-navy-500 hover:text-snp-navy-800 hover:underline transition-colors"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-[13px] font-semibold text-snp-navy-950 truncate max-w-[260px]">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* Two-column layout */}
            <div className="flex gap-12 items-start">

              {/* ── Left: Image gallery ── */}
              <div className="flex flex-col gap-4 flex-1 min-w-0">

                {/* Main image */}
                <div
                  className="relative bg-[#f5f8fc] rounded-[16px] overflow-hidden flex items-center justify-center"
                  style={{ height: 504, padding: 48 }}
                >
                  {isPhoto ? (
                    <>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full w-auto max-w-full object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                      {!isBulk && logoUrl && product.printArea && (
                        product.printArea.style === 'badge' ? (
                          <div
                            className="absolute pointer-events-none flex items-center justify-center rounded-xl bg-white/85 shadow-sm p-2"
                            style={{ left: `${product.printArea.x}%`, top: `${product.printArea.y}%`, width: `${product.printArea.width}%`, height: `${product.printArea.height}%` }}
                          >
                            <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <img
                            src={logoUrl}
                            alt=""
                            className="absolute pointer-events-none object-contain"
                            style={{ left: `${product.printArea.x}%`, top: `${product.printArea.y}%`, width: `${product.printArea.width}%`, height: `${product.printArea.height}%`, mixBlendMode: 'multiply', opacity: 0.88 }}
                          />
                        )
                      )}
                      {!isBulk && logoUrl && !product.printArea && (
                        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-[10px] bg-white shadow-sm border border-[#e0ebf7] flex items-center justify-center overflow-hidden">
                          <img src={logoUrl} alt="" className="w-full h-full object-contain p-1.5" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="relative flex flex-col items-center">
                      <span className="text-[130px] select-none" style={{ lineHeight: 1 }}>{product.image}</span>
                      {!isBulk && (
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-3 text-sm font-black tracking-widest opacity-90"
                          style={{ color: MOCK_COMPANY.logoColor }}
                        >
                          {MOCK_COMPANY.logo}
                        </div>
                      )}
                    </div>
                  )}

                  {isBulk && product.minQuantity && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-[#e0ebf7] rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-semibold text-snp-navy-600 uppercase tracking-wide">
                        Min. {product.minQuantity} pcs
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="flex-1 aspect-square rounded-[8px] overflow-hidden flex items-center justify-center cursor-pointer p-6 transition-all bg-[#f5f8fc]"
                      style={{
                        border: i === 0 ? '1px solid #d6e4f4' : '1px solid #d6e4f4',
                        boxShadow: i === 0 ? 'inset 0px 4px 24px 0px rgba(1,39,84,0.04)' : 'none',
                      }}
                    >
                      {isPhoto ? (
                        <img src={product.image} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                      ) : (
                        <span className="text-3xl select-none">{product.image}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: Product info ── */}
              <div className="w-[400px] shrink-0 flex flex-col gap-6 py-4">

                {/* Print technique chip */}
                {techniqueChip && (
                  <div>
                    <span
                      className="text-[12px] font-bold px-3 py-2 rounded-[8px] uppercase"
                      style={{ backgroundColor: '#eaf1fa', color: '#2864a8' }}
                    >
                      {techniqueChip.label}
                    </span>
                  </div>
                )}

                {/* Brand + name + price */}
                <div className="flex flex-col gap-1">
                  <p className="text-[12px] font-bold text-[#8093a9] uppercase" style={{ letterSpacing: '0.05em' }}>
                    By {product.brand}
                  </p>
                  <h1
                    className="text-[40px] text-[#012754] leading-[1.3]"
                    style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600 }}
                  >
                    {product.name}
                  </h1>
                  <div className="flex flex-col gap-1 py-1">
                    {isBulk ? (
                      <p className="text-[18px] text-[#012754]">Custom pricing</p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] text-[#012754]">${product.price.toFixed(2)}</span>
                        <span className="text-[14px] font-medium text-[#59728f]">+</span>
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#59728f]" />
                          <span className="text-[14px] font-medium text-[#59728f] capitalize">Shipping Included</span>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-wider">
                      *Not including taxes / fees
                    </p>
                  </div>
                </div>

                {/* Quality issue alert */}
                {hasQualityIssue && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#fef2f2] border border-[#fca5a5] rounded-[10px]">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-[13px] font-semibold text-red-600">Replace low resolution layer</span>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-[#e0ebf7]" />

                {/* ── CTAs ── */}
                {isBulk ? (
                  <BulkKitsInfo product={product} onOrder={() => setShowBulkModal(true)} />
                ) : (
                  <div className="flex flex-col gap-3">
                    {savedDesignForProduct ? (
                      /* DESIGNED / READY MODE */
                      (() => {
                        const mockCollections = [
                          { id: 'c1', name: 'Holiday 2026 Collection', itemCount: 4 },
                          { id: 'c2', name: 'New Hire Onboarding Kit', itemCount: 6 },
                          { id: 'c3', name: 'Q4 Employee Gift', itemCount: 3 },
                        ];
                        const mockStores = [
                          { id: 's1', name: 'Snappy Employee Store' },
                        ];
                        return (
                          <div className="flex flex-col gap-2.5">
                            {/* Primary: Send as a gift */}
                            <button
                              onClick={() => navigate('/send', { state: { productIds: [product.id], collectionName: product.name } })}
                              className="relative w-full h-[56px] rounded-[16px] flex items-center justify-center gap-2 overflow-hidden"
                              style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)', boxShadow: '0px 4px 8px rgba(1,39,84,0.08)' }}
                            >
                              <div className="absolute inset-0 rounded-[16px] border-2 border-white/20 pointer-events-none" />
                              <Send className="w-4 h-4 text-white" />
                              <span className="text-[15px] font-semibold text-white">Send as a gift</span>
                            </button>

                            {/* Secondary row */}
                            <div className="flex gap-2">
                              <button
                                onClick={goToDesignTool}
                                className="flex-1 h-[48px] rounded-[16px] border border-[#e0ebf7] bg-white hover:bg-[#f5f8fc] transition-all flex items-center justify-center gap-2"
                              >
                                <Pencil className="w-3.5 h-3.5 text-snp-navy-500" />
                                <span className="text-[14px] font-semibold text-[#012754]">Customize</span>
                              </button>

                              <div className="relative">
                                <button
                                  onClick={() => { setShowEllipsisMenu(v => !v); setEllipsisSubPanel(null); }}
                                  className="w-[48px] h-[48px] rounded-[16px] border border-[#e0ebf7] bg-white hover:bg-[#f5f8fc] transition-all flex items-center justify-center"
                                >
                                  <MoreHorizontal className="w-5 h-5 text-[#59728f]" />
                                </button>

                                {showEllipsisMenu && (
                                  <div
                                    className="absolute bottom-[calc(100%+8px)] right-0 bg-white border border-[#e0ebf7] rounded-[16px] overflow-hidden z-10"
                                    style={{ boxShadow: '0px 16px 24px 0px rgba(1,39,84,0.16)', minWidth: 240 }}
                                  >
                                    {/* Root menu */}
                                    {ellipsisSubPanel === null && (
                                      <div className="p-2 flex flex-col gap-0.5">
                                        <button
                                          onClick={() => setEllipsisSubPanel('collections')}
                                          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[#f5f8fc] transition-colors text-left w-full"
                                        >
                                          <div className="w-7 h-7 rounded-[8px] bg-indigo-50 flex items-center justify-center shrink-0">
                                            <Send className="w-3.5 h-3.5 text-indigo-500" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#012754]">Add to collection</p>
                                            <p className="text-[11px] text-snp-navy-400">Include in a gift collection</p>
                                          </div>
                                          <ChevronRight className="w-3.5 h-3.5 text-snp-navy-300 shrink-0" />
                                        </button>
                                        <button
                                          onClick={() => setEllipsisSubPanel('stores')}
                                          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[#f5f8fc] transition-colors text-left w-full"
                                        >
                                          <div className="w-7 h-7 rounded-[8px] bg-teal-50 flex items-center justify-center shrink-0">
                                            <Store className="w-3.5 h-3.5 text-teal-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#012754]">Add to store</p>
                                            <p className="text-[11px] text-snp-navy-400">Include in a branded storefront</p>
                                          </div>
                                          <ChevronRight className="w-3.5 h-3.5 text-snp-navy-300 shrink-0" />
                                        </button>
                                      </div>
                                    )}

                                    {/* Collections sub-panel */}
                                    {ellipsisSubPanel === 'collections' && (
                                      <>
                                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e0ebf7]">
                                          <button
                                            onClick={() => setEllipsisSubPanel(null)}
                                            className="w-6 h-6 rounded-full hover:bg-snp-navy-100 flex items-center justify-center transition-colors shrink-0"
                                          >
                                            <ChevronLeft className="w-3.5 h-3.5 text-snp-navy-500" />
                                          </button>
                                          <span className="text-[12px] font-semibold text-snp-navy-700">Choose a collection</span>
                                        </div>
                                        <div className="p-2 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
                                          {mockCollections.map(col => (
                                            <button
                                              key={col.id}
                                              onClick={() => { setShowEllipsisMenu(false); showToast(`${product.name} was added to ${col.name} successfully`); }}
                                              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[#f5f8fc] transition-colors text-left w-full"
                                            >
                                              <div className="w-7 h-7 rounded-[8px] bg-indigo-50 flex items-center justify-center shrink-0">
                                                <Send className="w-3 h-3 text-indigo-400" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-[#012754] truncate">{col.name}</p>
                                                <p className="text-[11px] text-snp-navy-400">{col.itemCount} items</p>
                                              </div>
                                            </button>
                                          ))}
                                          <div className="border-t border-[#e0ebf7] mt-1 pt-1">
                                            <button
                                              onClick={() => { setShowEllipsisMenu(false); navigate('/collection/new', { state: { productIds: [product.id] } }); }}
                                              className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-snp-indigo-600 hover:text-snp-indigo-700 w-full"
                                            >
                                              <Plus className="w-3.5 h-3.5" /> Create new collection
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {/* Stores sub-panel */}
                                    {ellipsisSubPanel === 'stores' && (
                                      <>
                                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e0ebf7]">
                                          <button
                                            onClick={() => setEllipsisSubPanel(null)}
                                            className="w-6 h-6 rounded-full hover:bg-snp-navy-100 flex items-center justify-center transition-colors shrink-0"
                                          >
                                            <ChevronLeft className="w-3.5 h-3.5 text-snp-navy-500" />
                                          </button>
                                          <span className="text-[12px] font-semibold text-snp-navy-700">Choose a store</span>
                                        </div>
                                        <div className="p-2 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
                                          {mockStores.map(store => (
                                            <button
                                              key={store.id}
                                              onClick={() => { setShowEllipsisMenu(false); showToast(`${product.name} was added to ${store.name} successfully`); }}
                                              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[#f5f8fc] transition-colors text-left w-full"
                                            >
                                              <div className="w-7 h-7 rounded-[8px] bg-teal-50 flex items-center justify-center shrink-0">
                                                <Store className="w-3 h-3 text-teal-500" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-[#012754] truncate">{store.name}</p>
                                                <p className="text-[11px] text-snp-navy-400">live</p>
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* CATALOG MODE — single Customize button */
                      <Button size="lg" className="w-full" onClick={goToDesignTool}>
                        Customize
                      </Button>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-[#e0ebf7]" />

                {/* Color Options */}
                {product.colors.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <p className="text-[16px] font-semibold text-[#012754]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Color Options: {currentColor?.name ?? 'Default'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.slice(0, 6).map((color, i) => (
                        <button
                          key={color.hex}
                          onClick={() => setPreviewColorIdx(i)}
                          title={color.name}
                          className="w-[72px] h-[72px] rounded-[16px] flex items-center justify-center p-2 bg-white transition-all"
                          style={{
                            border: i === previewColorIdx ? '1px solid #3077c9' : '1px solid #e0ebf7',
                            boxShadow: i === previewColorIdx ? '0px 4px 4px rgba(1,39,84,0.08)' : 'none',
                          }}
                        >
                          <div className="w-14 h-14 rounded-full" style={{ backgroundColor: color.hex }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {showSizes && (
                  <div className="flex flex-col gap-4">
                    <p className="text-[16px] font-semibold text-[#012754]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Size
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map(size => (
                        <div
                          key={size}
                          className="flex-1 min-w-[48px] h-[48px] flex items-center justify-center rounded-[8px] border border-[#e0ebf7] bg-white text-[14px] font-medium text-[#012754] capitalize"
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipient note */}
                {(product.colors.length > 0 || showSizes) && (
                  <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-wider">
                    *Recipients picks their size and color
                  </p>
                )}

                {/* Divider */}
                <div className="h-px bg-[#e0ebf7]" />

                {/* Description */}
                <div className="flex flex-col gap-4">
                  <button
                    className="flex items-center justify-between w-full"
                    onClick={() => setDescExpanded(!descExpanded)}
                  >
                    <span className="text-[16px] font-semibold text-[#012754]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Description
                    </span>
                    {descExpanded
                      ? <ChevronUp className="w-4 h-4 text-[#59728f]" />
                      : <ChevronDown className="w-4 h-4 text-[#59728f]" />
                    }
                  </button>
                  {descExpanded && (
                    <p className="text-[16px] text-[#405d7f] leading-[1.5]">{product.description}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-[#e0ebf7]" />

                {/* Specifications */}
                <button className="flex items-center justify-between w-full">
                  <span className="text-[16px] font-semibold text-[#012754]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Specifications
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#59728f]" />
                </button>

                {/* Divider */}
                <div className="h-px bg-[#e0ebf7]" />

                {/* About the Brand */}
                <button className="flex items-center justify-between w-full pb-2">
                  <span className="text-[16px] font-semibold text-[#012754]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    About The Brand
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#59728f]" />
                </button>

              </div>
            </div>

          </div>
        </div>

        {/* X close button — absolute */}
        <button
          onClick={goBack}
          className="absolute top-3 right-3 w-[56px] h-[56px] bg-white border border-[#d6e4f4] rounded-full flex items-center justify-center hover:bg-[#f5f8fc] transition-colors"
          style={{ boxShadow: '0px 4px 8px 0px rgba(1,39,84,0.08)' }}
        >
          <X className="w-6 h-6 text-[#59728f]" />
        </button>

        {/* Toast */}
        {toast && (
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium text-white whitespace-nowrap"
            style={{ background: 'rgba(1,39,84,0.88)', boxShadow: '0px 4px 16px rgba(1,39,84,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2.5} />
            {toast}
          </div>
        )}
      </div>

      {/* ── Sub-modals ── */}
      {showBulkModal && (
        <BulkContactModal product={product} onClose={() => setShowBulkModal(false)} />
      )}

      <input ref={logoFileRef} type="file" accept="image/*,image/svg+xml" className="hidden" onChange={handleLogoFile} />

      {showLogoUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShowLogoUpload(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-[18px] font-semibold text-snp-navy-950 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Add your logo first</h2>
            <p className="text-[13px] text-snp-navy-500 mb-6">Your logo is applied across all designed products before sending or saving to a collection.</p>
            <button
              onClick={() => logoFileRef.current?.click()}
              className="w-full h-11 rounded-[12px] text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #3077c9, #36d4ff)' }}
            >
              Upload logo
            </button>
            <button onClick={() => setShowLogoUpload(false)} className="w-full mt-3 text-[13px] text-snp-navy-400 hover:text-snp-navy-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {sendingGift && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(1,39,84,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <style>{`
            @keyframes spin-gift { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <img src="/gift-box.png" alt="" style={{ width: 160, height: 160, animation: 'spin-gift 1.2s linear infinite' }} />
        </div>
      )}

    </div>
  );
}
