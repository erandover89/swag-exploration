import { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sparkles,
  Truck,
  Package,
  Pencil,
  Plus,
  Globe,
  Upload,
  X,
  Check,
  Clock,
  Palette,
  Warehouse,
} from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY, type Product } from '../data/mockData';
import { AddToCollectionMenu } from '../components/AddToCollectionMenu';
import { CreateOrderModal } from '../components/CreateOrderModal';

// ── Compact Logo Input (shown when product has no logo applied) ────────────────

function CompactLogoInput({ onLogoApplied }: { onLogoApplied: (url: string) => void }) {
  const [domain, setDomain] = useState('');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'applied'>('idle');
  const [appliedUrl, setAppliedUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const foundRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = evt => {
      const url = evt.target?.result as string;
      setAppliedUrl(url);
      setPhase('applied');
      onLogoApplied(url);
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) applyFile(file);
  };

  const fetchLogo = () => {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!clean) return;
    foundRef.current = null;
    setPhase('loading');
    const img = new window.Image();
    img.onload = () => { foundRef.current = img.src; };
    img.src = `https://logo.clearbit.com/${clean}`;
    setTimeout(() => {
      if (foundRef.current) {
        setAppliedUrl(foundRef.current);
        setPhase('applied');
        onLogoApplied(foundRef.current);
      } else {
        setPhase('idle');
      }
    }, 1600);
  };

  if (phase === 'applied' && appliedUrl) {
    return (
      <div
        className="flex items-center gap-3 rounded-[14px] p-3 mb-6 border"
        style={{
          background: 'linear-gradient(135deg, #eaf4fd 0%, #f0f6ff 100%)',
          borderColor: '#c8dff0',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="w-10 h-10 bg-white rounded-[8px] border border-[#d5e8f7] flex items-center justify-center overflow-hidden shadow-sm shrink-0">
          <img src={appliedUrl} alt="" className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e] flex items-center justify-center">
              <Check className="w-2 h-2 text-white" strokeWidth={3} />
            </div>
            <p className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest">Logo applied</p>
          </div>
          <p className="text-[12px] text-[#345276]">Click "Edit Design" to customize placement</p>
        </div>
        <button
          onClick={() => { setPhase('idle'); setAppliedUrl(null); }}
          className="text-[#8093a9] hover:text-[#345276] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-[16px] mb-6 border overflow-hidden"
      style={{ borderColor: '#e0ebf7', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <div className="w-5 h-5 rounded-full bg-[#3077c9]/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-[#3077c9]" />
        </div>
        <p className="text-[11px] font-bold text-[#012754] uppercase tracking-widest">Apply Your Logo</p>
      </div>

      {/* Primary: file upload drop zone */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center gap-2 py-6 mx-0 transition-all ${
          isDragOver
            ? 'bg-[#eaf1fa] border-y-2 border-[#3077c9]'
            : 'bg-[#f5f8fc] border-y border-[#e0ebf7] hover:bg-[#eef4fd]'
        }`}
        style={{ borderLeft: 'none', borderRight: 'none' }}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isDragOver ? 'bg-[#3077c9]' : 'bg-white border border-[#e0ebf7] shadow-sm'
        }`}>
          <Upload className={`w-4.5 h-4.5 ${isDragOver ? 'text-white' : 'text-[#3077c9]'}`} style={{ width: 18, height: 18 }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-[#012754]">
            {isDragOver ? 'Drop your logo here' : 'Upload your logo'}
          </p>
          <p className="text-[11px] text-[#8093a9] mt-0.5">PNG · SVG · JPG · Drag & drop or click</p>
        </div>
        <span className="text-[10px] font-bold text-white bg-[#22c55e] rounded-full px-2 py-0.5">
          Best quality
        </span>
      </button>

      {/* Secondary: domain URL */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-medium text-[#a6b3c3] mb-2">Or auto-fetch from your website</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8093a9]" />
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && domain.trim() && fetchLogo()}
              placeholder="yourcompany.com"
              className="w-full h-9 pl-9 pr-3 text-[12px] border border-[#e0ebf7] rounded-[10px] focus:outline-none focus:border-[#3077c9] focus:ring-1 focus:ring-[#3077c9]/15 text-[#012754] placeholder:text-[#b7cfec] transition-colors bg-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          <button
            onClick={fetchLogo}
            disabled={!domain.trim() || phase === 'loading'}
            className="h-9 px-3.5 rounded-[10px] text-[12px] font-semibold text-white shrink-0 transition-all"
            style={{
              background: domain.trim() && phase !== 'loading'
                ? 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)'
                : '#c8d9ed',
              cursor: domain.trim() && phase !== 'loading' ? 'pointer' : 'not-allowed',
            }}
          >
            {phase === 'loading' ? '…' : 'Fetch →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk & Kits info panel ────────────────────────────────────────────────────

function BulkKitsInfo({
  product,
  onCreateOrder,
}: {
  product: Product;
  onCreateOrder: () => void;
}) {
  const steps = [
    { icon: Palette,   label: 'Expert design',    desc: 'Our team handles the full branding & mockup' },
    { icon: Clock,     label: 'Production',        desc: `${product.leadTimeDays ?? 14}–${(product.leadTimeDays ?? 14) + 7} day lead time` },
    { icon: Warehouse, label: 'Ships to warehouse', desc: 'Stored and ready to send anytime' },
  ];

  return (
    <div
      className="rounded-[16px] mb-6 border overflow-hidden"
      style={{ borderColor: '#c7d7f4', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 bg-[#eef6ff]">
        <span className="text-base leading-none">📦</span>
        <p className="text-[11px] font-bold text-[#012754] uppercase tracking-widest">Bulk & Kits Order</p>
      </div>

      {/* Steps */}
      <div className="px-4 py-4 flex flex-col gap-3 bg-white">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-[8px] bg-[#e8f0fc] border border-[#c7d7f4] flex items-center justify-center shrink-0 mt-0.5">
              <step.icon className="w-3.5 h-3.5 text-[#3077c9]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#012754] leading-tight">{step.label}</p>
              <p className="text-[11px] text-[#8093a9] leading-snug">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Min qty callout */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#eef6ff] border-t border-[#c7d7f4]">
        <div>
          <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest">Minimum order</p>
          <p className="text-[20px] font-bold text-[#012754] leading-tight">
            {product.minQuantity ?? 50}
            <span className="text-[12px] font-normal text-[#8093a9] ml-1">units</span>
          </p>
        </div>
        <button
          onClick={onCreateOrder}
          className="h-10 px-5 rounded-[12px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90 shrink-0"
          style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
        >
          Create Order →
        </button>
      </div>
    </div>
  );
}

// ── Tag badge helper ───────────────────────────────────────────────────────────

const TAG_STYLES: Record<string, string> = {
  POPULAR:     'bg-amber-50 text-amber-700 border-amber-200',
  SWAG:        'bg-[#f0f6ff] text-[#3077c9] border-[#d5e8f7]',
  SUSTAINABLE: 'bg-green-50 text-green-700 border-green-200',
  PREMIUM:     'bg-[#f5f3ff] text-[#7c3aed] border-[#e0d9f7]',
};

// ── Main Component ─────────────────────────────────────────────────────────────

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const product = PRODUCTS.find(p => p.id === id);

  // Pre-populate logo from catalog "pending logo" state
  const stateLogoUrl = (location.state as { logoUrl?: string } | null)?.logoUrl ?? null;

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(true);
  const [appliedLogoUrl, setAppliedLogoUrl] = useState<string | null>(stateLogoUrl);
  const [showOrderModal, setShowOrderModal] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="text-6xl mb-4">😕</span>
        <h3 className="text-lg font-bold text-[#345276] mb-2">Product not found</h3>
        <button
          onClick={() => navigate('/')}
          className="text-[#3077c9] text-sm font-medium hover:underline"
        >
          ← Back to catalog
        </button>
      </div>
    );
  }

  const currentColor = product.colors[selectedColor];
  const isPhoto = product.image.startsWith('/');
  const isBulk  = product.type === 'bulk';
  const hasLogo = !!appliedLogoUrl;
  const showSizes = product.sizes.length > 1 && product.sizes[0] !== 'One Size';

  const goToDesignTool = () =>
    navigate(`/design/${product.id}`, { state: appliedLogoUrl ? { logoUrl: appliedLogoUrl } : undefined });

  return (
    <div className="min-h-screen bg-[#f4f7fc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white border-b border-[#e0ebf7]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[60px] lg:px-[120px] py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-7 h-7 rounded-full border border-[#e0ebf7] bg-white hover:border-[#3077c9] hover:text-[#3077c9] text-[#8093a9] transition-all shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <nav className="flex items-center gap-1.5 text-[11px] font-medium text-[#8093a9] uppercase tracking-wider min-w-0">
              <button
                onClick={() => navigate('/')}
                className="hover:text-[#3077c9] transition-colors whitespace-nowrap"
              >
                Discover
              </button>
              <span className="text-[#c5d5e8]">/</span>
              <button
                onClick={() => navigate('/')}
                className="hover:text-[#3077c9] transition-colors whitespace-nowrap"
              >
                Swag
              </button>
              <span className="text-[#c5d5e8]">/</span>
              <span className="text-[#3077c9] font-semibold whitespace-nowrap">
                {product.brand.toUpperCase()}
              </span>
              <span className="text-[#c5d5e8]">/</span>
              <span className="text-[#012754] font-semibold uppercase truncate">
                {product.name}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-[60px] lg:px-[120px] py-8">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">

          {/* ── Left: Image Gallery ── */}
          <div className="w-full lg:w-[520px] xl:w-[560px] shrink-0">

            {/* Main product image */}
            <div
              className="relative rounded-[24px] overflow-hidden mb-3 border border-[#e0ebf7] shadow-sm"
              style={{
                height: 480,
                background: isPhoto
                  ? '#f5f8fc'
                  : `${currentColor?.hex ?? '#9ca3af'}14`,
              }}
            >
              {isPhoto ? (
                <>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Branding badge */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#e0ebf7] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm whitespace-nowrap">
                    {appliedLogoUrl ? (
                      <img src={appliedLogoUrl} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <span
                        className="text-[10px] font-black tracking-widest leading-none"
                        style={{ color: MOCK_COMPANY.logoColor }}
                      >
                        {MOCK_COMPANY.logo}
                      </span>
                    )}
                    <span className="text-[10px] text-[#8093a9]">branded</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative flex flex-col items-center">
                    <span className="text-[130px] select-none" style={{ lineHeight: 1 }}>
                      {product.image}
                    </span>
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-3 text-sm font-black tracking-widest opacity-90"
                      style={{ color: MOCK_COMPANY.logoColor }}
                    >
                      {MOCK_COMPANY.logo}
                    </div>
                  </div>
                </div>
              )}

              {/* Min quantity badge — top left */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-[#e0ebf7] rounded-lg px-2.5 py-1 shadow-sm">
                <span className="text-[10px] font-semibold text-[#59728f] uppercase tracking-wide">
                  {product.type === 'bulk' && product.minQuantity
                    ? `Min. ${product.minQuantity} pcs`
                    : 'Min. 1 pc'}
                </span>
              </div>

              {/* Edit Design / Create Order button — top right */}
              {isBulk ? (
                <button
                  className="absolute top-4 right-4 flex items-center gap-1.5 bg-white border border-[#c7d7f4] hover:border-[#3077c9] hover:text-[#3077c9] rounded-[10px] px-3.5 py-2 text-[12px] font-semibold text-[#345276] shadow-sm hover:shadow-md transition-all"
                  onClick={() => setShowOrderModal(true)}
                >
                  Create Order
                </button>
              ) : (
                <button
                  className="absolute top-4 right-4 flex items-center gap-1.5 bg-white border border-[#e0ebf7] hover:border-[#3077c9] hover:text-[#3077c9] rounded-[10px] px-3.5 py-2 text-[12px] font-semibold text-[#345276] shadow-sm hover:shadow-md transition-all"
                  onClick={goToDesignTool}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Design
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2.5">
              {[product.image, product.image, product.image].map((img, i) => (
                <div
                  key={i}
                  className={`w-[calc(33.333%-7px)] aspect-square rounded-[14px] flex items-center justify-center cursor-pointer border-2 transition-all overflow-hidden shadow-sm ${
                    i === 0
                      ? 'border-[#3077c9] shadow-[0_0_0_3px_rgba(48,119,201,0.12)]'
                      : 'border-[#e0ebf7] hover:border-[#b7cfec]'
                  }`}
                  style={{ background: '#f5f8fc' }}
                >
                  {img.startsWith('/') ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl select-none">{img}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Product Info Panel ── */}
          <div className="flex-1 min-w-0 pt-1">

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-4">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                    TAG_STYLES[tag] ?? 'bg-[#f5f8fc] text-[#8093a9] border-[#e0ebf7]'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Brand label */}
            <p
              className="text-[11px] font-bold text-[#3077c9] uppercase tracking-widest mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              By {product.brand}
            </p>

            {/* Product name */}
            <h1
              className="text-[30px] md:text-[34px] text-[#012754] leading-tight mb-4"
              style={{ fontFamily: "'Clash Display', 'DM Sans', sans-serif", fontWeight: 700 }}
            >
              {product.name}
            </h1>

            {/* Price row */}
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span
                className="text-[28px] font-black text-[#012754]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ${product.price.toFixed(2)}
              </span>
              <span className="text-[#c5d5e8] text-lg font-light">+</span>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#8093a9]" />
                {product.shippingIncluded ? (
                  <span className="text-[13px] font-semibold text-[#22a06b]">Shipping Included</span>
                ) : (
                  <span className="text-[13px] text-[#8093a9]">Shipping at checkout</span>
                )}
              </div>
            </div>

            {/* Sub-label */}
            <div className="flex items-center gap-4 mb-5">
              <p className="text-[10px] font-semibold text-[#a6b3c3] uppercase tracking-wider">
                *Not including taxes / fees
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8093a9]">
                <Package className="w-3.5 h-3.5" />
                <span>
                  {product.type === 'on-demand'
                    ? 'Ships individually'
                    : `Bulk order · min ${product.minQuantity} pcs`}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e0ebf7] mb-5" />

            {/* Color Options */}
            {product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-[13px] font-bold text-[#012754] mb-3">
                  Color Options:{' '}
                  <span className="font-normal text-[#59728f]">{currentColor?.name}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, i) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(i)}
                      title={color.name}
                      className={`w-10 h-10 rounded-full border-[3px] transition-all ${
                        i === selectedColor
                          ? 'border-[#3077c9] scale-110 shadow-md'
                          : 'border-[#d4d4d4] hover:border-[#8093a9]'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {showSizes && (
              <div className="mb-5">
                <p className="text-[13px] font-bold text-[#012754] mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={`px-4 py-2 rounded-[10px] text-[13px] font-medium border transition-all ${
                        selectedSize === size
                          ? 'border-[#3077c9] bg-[#eaf1fa] text-[#3077c9]'
                          : 'border-[#e0ebf7] bg-white text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[10px] font-semibold text-[#a6b3c3] uppercase tracking-wider">
                  *Recipients picks their size and color
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-[#e0ebf7] mb-5" />

            {/* Bulk & Kits info panel OR logo upload */}
            {isBulk ? (
              <BulkKitsInfo product={product} onCreateOrder={() => setShowOrderModal(true)} />
            ) : (
              !hasLogo && <CompactLogoInput onLogoApplied={url => setAppliedLogoUrl(url)} />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Primary CTA */}
              <button
                className="w-full flex items-center justify-center gap-2 text-white rounded-[14px] px-6 py-4 text-[15px] font-bold tracking-wide transition-opacity hover:opacity-90 shadow-md"
                style={{
                  background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)',
                }}
                onClick={isBulk ? () => setShowOrderModal(true) : undefined}
              >
                {isBulk ? 'Create Order' : 'Send This Gift'}
              </button>

              {/* Secondary row */}
              <div className="flex gap-3">
                {!isBulk && (
                  <button
                    className="flex-1 flex items-center justify-center gap-2 border border-[#e0ebf7] bg-white hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] rounded-[14px] px-4 py-3 text-[13px] font-semibold text-[#59728f] transition-all"
                    onClick={goToDesignTool}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Design
                  </button>
                )}
                <div className={isBulk ? 'w-full' : 'flex-1'}>
                  <AddToCollectionMenu
                    align="right"
                    trigger={
                      <button className="w-full flex items-center justify-center gap-2 border border-[#e0ebf7] bg-white hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] rounded-[14px] px-4 py-3 text-[13px] font-semibold text-[#59728f] transition-all">
                        <Plus className="w-4 h-4" />
                        Add To Collection
                      </button>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e0ebf7] mb-5" />

            {/* Description Accordion */}
            <div>
              <button
                className="flex items-center justify-between w-full text-[14px] font-bold text-[#012754] mb-3 py-1"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                <span>Description</span>
                {descExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#8093a9]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8093a9]" />
                )}
              </button>
              {descExpanded && (
                <p className="text-[14px] text-[#59728f] leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <CreateOrderModal
          product={product}
          onClose={() => setShowOrderModal(false)}
          onTryOnDemand={() => { setShowOrderModal(false); navigate('/'); }}
        />
      )}
    </div>
  );
}
