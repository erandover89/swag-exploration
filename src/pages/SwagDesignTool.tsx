import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Check, Upload, X, ChevronLeft, Undo2, Redo2, Minus, Plus,
  GripVertical, Trash2, Sparkles,
} from 'lucide-react';
import { PRODUCTS, MY_DESIGNS, MOCK_COMPANY, type LogoPlacement, type PrintStyle } from '../data/mockData';

// ── Static config ────────────────────────────────────────────────────────────
const PRINT_STYLES: { value: PrintStyle; icon: string; label: string; desc: string; delta: number }[] = [
  { value: 'embroidery',   icon: '🪡', label: 'Embroidery',    desc: 'Stitched, premium',   delta: 0  },
  { value: 'screen-print', icon: '🖨', label: 'Screen Print',  desc: 'Bold, vibrant',       delta: 5  },
  { value: 'emboss',       icon: '🏷', label: 'Emboss/Deboss', desc: 'Subtle, elegant',     delta: -3 },
];

const PLACEMENTS: { value: LogoPlacement; label: string }[] = [
  { value: 'left-chest', label: 'Left Chest' },
  { value: 'center',     label: 'Center'     },
  { value: 'back',       label: 'Back'       },
  { value: 'sleeve',     label: 'Sleeve'     },
];

// Percentage-based presets (relative to canvas width/height)
const PLACEMENT_PRESETS: Record<LogoPlacement, { top: number; left: number }> = {
  'left-chest': { top: 28, left: 24 },
  'center':     { top: 46, left: 50 },
  'back':       { top: 66, left: 50 },
  'sleeve':     { top: 40, left: 77 },
};

// ── Main page ─────────────────────────────────────────────────────────────────
export function SwagDesignTool() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const location   = useLocation();
  const stateLogoUrl = (location.state as { logoUrl?: string } | null)?.logoUrl ?? null;
  const product    = PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0];
  const fileRef    = useRef<HTMLInputElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);

  // Design state
  const [colorIdx, setColorIdx]       = useState(0);
  const [placement, setPlacement]     = useState<LogoPlacement>('left-chest');
  const [printStyle, setPrintStyle]   = useState<PrintStyle>('embroidery');
  const [designName, setDesignName]   = useState('');
  const [zoom, setZoom]               = useState(100);
  const [saved, setSaved]             = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Logo state — initialized from location.state if available
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(stateLogoUrl);

  // Draggable logo position (% of canvas dimensions; null = use preset)
  const [logoPos, setLogoPos]     = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; lx: number; ly: number } | null>(null);

  const selectedColor = product.colors[colorIdx] ?? product.colors[0];
  const styleDelta    = PRINT_STYLES.find(s => s.value === printStyle)?.delta ?? 0;
  const unitPrice     = product.price + styleDelta;
  const finalName     = designName.trim() || `${product.brand} ${product.name.split(' ').slice(0, 2).join(' ')}`;
  const isPhoto       = product.image.startsWith('/');
  const isHighRes     = !!logoDataUrl && logoDataUrl.startsWith('data:');

  // Resolved logo position (preset or dragged)
  const preset = PLACEMENT_PRESETS[placement];
  const logoX  = logoPos ? logoPos.x : preset.left;
  const logoY  = logoPos ? logoPos.y : preset.top;

  // ── Logo upload ─────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Logo dragging ───────────────────────────────────────────────────────────
  const handleLogoDragStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    dragStart.current = { mx: e.clientX, my: e.clientY, lx: logoX, ly: logoY };
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current || !canvas) return;
      const r = canvas.getBoundingClientRect();
      const dx = ((ev.clientX - dragStart.current.mx) / r.width) * 100;
      const dy = ((ev.clientY - dragStart.current.my) / r.height) * 100;
      setLogoPos({
        x: Math.max(5, Math.min(95, dragStart.current.lx + dx)),
        y: Math.max(5, Math.min(95, dragStart.current.ly + dy)),
      });
    };
    const onUp = () => {
      setIsDragging(false);
      dragStart.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [logoX, logoY]);

  const changePlacement = (p: LogoPlacement) => {
    setPlacement(p);
    setLogoPos(null);
  };

  const canvasW = Math.round(460 * zoom / 100);
  const canvasH = Math.round(520 * zoom / 100);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 112px)', fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ── Editor top bar ──────────────────────────────────────────────────── */}
      <div className="h-14 bg-white border-b border-[#e0ebf7] flex items-center px-4 gap-3 shrink-0">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full border border-[#e0ebf7] flex items-center justify-center text-[#8093a9] hover:text-[#3077c9] hover:border-[#3077c9] transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="text-[#8093a9] font-medium shrink-0">Design</span>
          <span className="text-[#c5d5e8]">›</span>
          <span className="text-[#012754] font-semibold truncate">{product.name}</span>
        </div>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border border-[#e0ebf7] rounded-[10px] p-0.5">
          <button className="w-8 h-8 flex items-center justify-center text-[#8093a9] hover:text-[#012754] hover:bg-[#f5f8fc] rounded-[8px] transition-colors" title="Undo">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[#8093a9] hover:text-[#012754] hover:bg-[#f5f8fc] rounded-[8px] transition-colors" title="Redo">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-0.5 border border-[#e0ebf7] rounded-[10px] p-0.5">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            className="w-8 h-8 flex items-center justify-center text-[#8093a9] hover:text-[#012754] hover:bg-[#f5f8fc] rounded-[8px] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[12px] font-bold text-[#345276] w-10 text-center select-none">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(150, z + 25))}
            className="w-8 h-8 flex items-center justify-center text-[#8093a9] hover:text-[#012754] hover:bg-[#f5f8fc] rounded-[8px] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-6 bg-[#e0ebf7]" />

        {/* Cancel */}
        <button
          onClick={() => navigate(-1)}
          className="h-9 px-4 rounded-[10px] border border-[#e0ebf7] text-[13px] font-medium text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] transition-colors"
        >
          Cancel
        </button>

        {/* Save Design */}
        <button
          onClick={() => setShowSaveModal(true)}
          className="h-9 px-5 rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
        >
          Save Design
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Panel ──────────────────────────────────────────────────── */}
        <div className="w-[260px] bg-white border-r border-[#e0ebf7] flex flex-col shrink-0 overflow-y-auto">

          {/* LAYERS section */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest">Layers</span>
              <span className="text-[9px] font-bold text-[#8093a9] bg-[#f5f8fc] rounded-[4px] px-1.5 py-0.5">1</span>
            </div>

            {/* Logo layer row */}
            <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#f0f6ff] border border-[#3077c9]/20 group cursor-default mb-2.5">
              <GripVertical className="w-3 h-3 text-[#c5d5e8] shrink-0" />
              <div className="w-8 h-8 bg-white rounded-[6px] border border-[#e0ebf7] flex items-center justify-center overflow-hidden shrink-0">
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-[7px] font-black tracking-widest" style={{ color: MOCK_COMPANY.logoColor }}>
                    {MOCK_COMPANY.logo}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#012754] truncate leading-tight">Logo layer</p>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] mt-0.5 leading-tight ${
                  isHighRes
                    ? 'bg-[#f0fdf4] text-[#22c55e]'
                    : logoDataUrl
                    ? 'bg-[#fff7ed] text-[#f59e0b]'
                    : 'bg-[#fff7ed] text-[#f59e0b]'
                }`}>
                  {isHighRes ? '● High res' : '● Web quality'}
                </span>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setLogoDataUrl(null)}
                  className="p-1.5 text-[#8093a9] hover:text-[#e63946] transition-colors rounded-[6px] hover:bg-[#fff5f5]"
                  title="Remove logo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Add / Replace Logo button */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-9 border-2 border-dashed border-[#b7cfec] rounded-[10px] text-[12px] font-semibold text-[#3077c9] hover:bg-[#f0f6ff] hover:border-[#3077c9] transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              {logoDataUrl ? 'Replace Logo' : 'Add Logo'}
            </button>

            {!logoDataUrl && (
              <p className="text-[10px] text-[#a6b3c3] text-center mt-1.5">
                PNG / SVG / JPG · High-res recommended
              </p>
            )}
          </div>

          <div className="h-px bg-[#f0f4f8] mx-4" />

          {/* OPTIONS section */}
          <div className="px-4 py-4 flex flex-col gap-5">

            {/* Color */}
            <div>
              <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-2.5">Color</p>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {product.colors.map((color, i) => (
                  <button
                    key={color.hex}
                    onClick={() => setColorIdx(i)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      i === colorIdx
                        ? 'ring-2 ring-[#3077c9] ring-offset-2 border-transparent scale-110'
                        : 'border-[#e0ebf7] hover:border-[#3077c9]'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#59728f] font-medium">{selectedColor?.name}</p>
            </div>

            {/* Logo Placement */}
            <div>
              <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-2.5">Placement</p>
              <p className="text-[10px] text-[#c5d5e8] -mt-1.5 mb-2">Or drag the logo on canvas</p>
              <div className="flex flex-wrap gap-1.5">
                {PLACEMENTS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => changePlacement(p.value)}
                    className={`px-2.5 h-7 rounded-full text-[11px] font-medium border transition-all ${
                      placement === p.value
                        ? 'bg-[#3077c9] border-[#3077c9] text-white'
                        : 'border-[#e0ebf7] text-[#345276] hover:border-[#3077c9] hover:text-[#3077c9]'
                    }`}
                  >
                    {p.label}
                    {logoPos && placement === p.value && (
                      <span className="ml-1 opacity-60">(custom)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Decoration Style */}
            <div>
              <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-2.5">Decoration</p>
              <div className="flex flex-col gap-1.5">
                {PRINT_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setPrintStyle(s.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border text-left transition-all ${
                      printStyle === s.value
                        ? 'border-[#3077c9] bg-[#f0f6ff] shadow-[0px_2px_8px_0px_rgba(48,119,201,0.12)]'
                        : 'border-[#e0ebf7] hover:border-[#b7cfec] bg-white'
                    }`}
                  >
                    <span className="text-base leading-none">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#012754] leading-tight">{s.label}</p>
                      <p className="text-[10px] text-[#8093a9] leading-tight">{s.desc}</p>
                    </div>
                    {s.delta !== 0 && (
                      <span className={`text-[11px] font-bold shrink-0 ${s.delta > 0 ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                        {s.delta > 0 ? `+$${s.delta}` : `–$${Math.abs(s.delta)}`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-[12px] px-4 py-3">
              <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest">Est. unit price</p>
              <p className="text-[20px] font-bold text-[#012754] leading-tight">
                ~${unitPrice.toFixed(2)}
                <span className="text-[11px] font-normal text-[#8093a9] ml-1">/ unit</span>
              </p>
            </div>
          </div>

          {/* Bottom tabs + Personalized */}
          <div className="mt-auto border-t border-[#e0ebf7]">
            <div className="flex items-center gap-1 p-3">
              {(['Logo', 'Graphic', 'Text'] as const).map(tab => (
                <button
                  key={tab}
                  disabled={tab !== 'Logo'}
                  className={`flex-1 h-8 rounded-[8px] text-[12px] font-semibold transition-colors ${
                    tab === 'Logo'
                      ? 'bg-[#3077c9] text-white shadow-sm'
                      : 'text-[#c5d5e8] cursor-not-allowed'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="px-3 pb-4">
              <button
                className="w-full h-9 rounded-[10px] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #3077c9 100%)' }}
                onClick={() => alert('Personalized swag — coming soon!')}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Personalized →
              </button>
            </div>
          </div>
        </div>

        {/* ── Canvas area ──────────────────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-5 relative overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #cdd5e0 0%, #b8c2cf 100%)' }}
        >
          {/* Product card canvas */}
          <div
            ref={canvasRef}
            className="relative bg-white rounded-[24px] overflow-hidden select-none"
            style={{
              width: `${canvasW}px`,
              height: `${canvasH}px`,
              boxShadow: '0px 32px 80px rgba(1,39,84,0.32), 0px 8px 24px rgba(1,39,84,0.16)',
              transition: 'width 0.2s ease, height 0.2s ease',
            }}
          >
            {/* Product image / emoji */}
            {isPhoto ? (
              <>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundColor: selectedColor?.hex, opacity: 0.12 }}
                />
              </>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `${selectedColor?.hex ?? '#f5f8fc'}18` }}
              >
                <span className="text-[120px] select-none" style={{ lineHeight: 1 }}>
                  {product.image}
                </span>
              </div>
            )}

            {/* Print area dashed box */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: '18%', left: '22%', right: '22%', bottom: '18%',
                border: '2px dashed rgba(230, 57, 70, 0.55)',
                borderRadius: 6,
                zIndex: 5,
              }}
            />

            {/* Draggable logo overlay */}
            <div
              className={`absolute flex flex-col items-center gap-1 z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                left: `${logoX}%`,
                top: `${logoY}%`,
                transform: 'translate(-50%, -50%)',
                userSelect: 'none',
              }}
              onMouseDown={handleLogoDragStart}
              title="Drag to reposition"
            >
              <div className={`p-2 rounded-lg transition-all ${
                isDragging
                  ? 'outline outline-2 outline-dashed outline-[#3077c9] bg-white/20 backdrop-blur-sm'
                  : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-[#3077c9]/50'
              }`}>
                {logoDataUrl ? (
                  <img
                    src={logoDataUrl}
                    alt="Your logo"
                    className="h-10 w-auto max-w-[80px] object-contain drop-shadow-sm"
                    draggable={false}
                  />
                ) : (
                  <span
                    className="text-[11px] font-black tracking-widest select-none drop-shadow-sm"
                    style={{ color: MOCK_COMPANY.logoColor }}
                  >
                    {MOCK_COMPANY.logo}
                  </span>
                )}
              </div>
              {isDragging && (
                <span className="text-[9px] text-white bg-[#3077c9] rounded px-1.5 py-0.5 font-medium shadow">
                  drag to reposition
                </span>
              )}
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-white/60 font-medium">
            Drag logo to reposition · Preview is approximate
          </p>
        </div>
      </div>

      {/* ── Save Modal ──────────────────────────────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-[0px_32px_80px_rgba(1,39,84,0.30)] w-[460px] max-w-[calc(100vw-2rem)] overflow-hidden">
            {/* Header */}
            <div className="px-7 pt-6 pb-0">
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-[22px] font-semibold text-[#012754]"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Save Design
                </h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-8 h-8 rounded-full bg-[#f5f8fc] flex items-center justify-center text-[#8093a9] hover:text-[#345276] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] text-[#59728f] mb-5">
                Name your design to find it later in My Items
              </p>
            </div>

            {/* Name input */}
            <div className="px-7 pb-4">
              <label className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest block mb-2">
                Design Name
              </label>
              <input
                type="text"
                value={designName}
                onChange={e => setDesignName(e.target.value)}
                placeholder={`e.g. ${product.brand} Onboarding`}
                className="w-full h-11 border border-[#e0ebf7] rounded-[12px] px-4 text-[14px] text-[#345276] placeholder:text-[#a6b3c3] focus:outline-none focus:border-[#3077c9] focus:ring-2 focus:ring-[#3077c9]/10 transition-colors"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>

            {/* OR attach to existing */}
            {MY_DESIGNS.length > 0 && (
              <>
                <div className="flex items-center gap-3 px-7 pb-4">
                  <div className="flex-1 h-px bg-[#e0ebf7]" />
                  <span className="text-[11px] text-[#a6b3c3] font-medium whitespace-nowrap">or add to existing</span>
                  <div className="flex-1 h-px bg-[#e0ebf7]" />
                </div>

                <div className="px-7 pb-4 flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                  {MY_DESIGNS.slice(0, 4).map(d => {
                    const dProduct = PRODUCTS.find(p => p.id === d.productId);
                    const isSelected = designName === d.name;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDesignName(isSelected ? '' : d.name)}
                        className={`flex items-center gap-3 p-3 rounded-[12px] border text-left transition-all ${
                          isSelected
                            ? 'border-[#3077c9] bg-[#f0f6ff]'
                            : 'border-[#e0ebf7] hover:border-[#b7cfec] bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-[8px] bg-[#f5f8fc] flex items-center justify-center overflow-hidden shrink-0 border border-[#e0ebf7]">
                          {dProduct && dProduct.image.startsWith('/') ? (
                            <img src={dProduct.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">{dProduct?.image ?? '👕'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#012754] truncate leading-tight">{d.name}</p>
                          <p className="text-[11px] text-[#8093a9] leading-tight">{d.sendCount} sent</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#3077c9] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 px-7 py-5 border-t border-[#e0ebf7]">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 h-11 rounded-[12px] border border-[#e0ebf7] text-[14px] font-medium text-[#59728f] hover:bg-[#f5f8fc] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setSaved(true); setShowSaveModal(false); }}
                className="flex-1 h-11 rounded-[12px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
              >
                Save Design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved success overlay ─────────────────────────────────────────── */}
      {saved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-5 text-center max-w-[340px] px-8">
            <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center shadow-lg">
              <Check className="w-9 h-9 text-white" />
            </div>
            <div>
              <h2
                className="text-[28px] font-semibold text-[#012754] mb-1"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Design Saved!
              </h2>
              <p className="text-[14px] text-[#59728f] leading-relaxed">
                <span className="font-bold text-[#012754]">{finalName}</span>
                {' '}· {selectedColor?.name} · {PRINT_STYLES.find(s => s.value === printStyle)?.label}
              </p>
            </div>

            <button
              className="w-full h-12 rounded-[14px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
              onClick={() => alert('Send Now — coming soon!')}
            >
              Send Now
            </button>
            <button
              className="h-10 text-[13px] font-medium text-[#3077c9] hover:underline"
              onClick={() => navigate('/')}
            >
              Browse More →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
