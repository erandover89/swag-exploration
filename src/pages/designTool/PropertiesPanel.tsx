import { useState } from 'react';
import {
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Bold, Sparkles, X, Lock, ChevronDown,
} from 'lucide-react';
import {
  type DesignLayer, type TextLayer, type PersonalizationOption,
  PERSONALIZATION_OPTIONS, PERSONALIZATION_SAMPLE_DATA,
} from './types';
import type { AlignmentType } from './useDesignEditor';
import { PersonalizationDropdown } from './PersonalizationDropdown';
import { type Product, PRINT_TECHNIQUE_CHIPS, type PrintTechnique } from '../../data/mockData';

// ── Print technique descriptions ───────────────────────────────────────────────

const PRINT_TECHNIQUE_DESCRIPTIONS: Record<PrintTechnique, string> = {
  'embroidery':       `Thread is stitched directly into the fabric by machine. Produces a premium, textured finish that's extremely durable. Best for bold logos with clean edges — fine lines and gradients don't translate well.`,
  'dtf':              `A printed film is heat-transferred onto the fabric. Handles vibrant colors, fine detail, and gradients beautifully. Works on virtually any fabric type, including dark and synthetic materials.`,
  'dtg':              `Ink is printed directly into fabric fibers using a specialized inkjet printer. Great for complex, full-color artwork. Works best on 100% cotton in lighter colors; less durable than embroidery on heavy-use items.`,
  'sublimation':      `Dye is infused into polyester fibers using heat and pressure, becoming part of the material itself. Produces vivid, permanent color with no texture or feel. Only works on white or light-colored polyester and poly-coated surfaces.`,
  'digital-inkjet':   `High-resolution inkjet printing onto paper, packaging, or specialty substrates. Photo-quality output with full color support. Common for printed collateral, packaging inserts, and paper-based gifts.`,
  'laser-printing':   `A laser engraves, etches, or marks the surface using focused heat. Results in a permanent, precise, monochrome mark with no ink or added material. Common on metal, wood, leather, and glass.`,
  'uv-printing':      `UV-cured inks are printed directly onto a surface and instantly hardened under UV light. Produces a durable, scratch-resistant finish on almost any rigid or flexible material — plastic, metal, wood, or acrylic.`,
  'digital-printing': `A broad digital print process covering high-fidelity, full-color output across a range of substrates. Turnaround is fast, minimums are low, and color accuracy is excellent.`,
};

// ── Constants ─────────────────────────────────────────────────────────────────

const FONTS = ['Poppins', 'DM Sans', 'Inter', 'Playfair Display', 'Roboto Mono'];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 60, 72];

const ALIGN_BUTTONS: { alignment: AlignmentType; Icon: React.ComponentType<{ className?: string }>; title: string }[] = [
  { alignment: 'left',     Icon: AlignLeft,           title: 'Align left' },
  { alignment: 'center-h', Icon: AlignCenter,          title: 'Center horizontal' },
  { alignment: 'right',    Icon: AlignRight,           title: 'Align right' },
  { alignment: 'top',      Icon: AlignStartVertical,   title: 'Align top' },
  { alignment: 'center-v', Icon: AlignCenterVertical,  title: 'Center vertical' },
  { alignment: 'bottom',   Icon: AlignEndVertical,     title: 'Align bottom' },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2.5">
      {label}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-snp-navy-100" />;
}

function NumInput({
  label, value, onChange, min, max, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-medium text-snp-navy-400 leading-none">{label}</span>
      <input
        type="number"
        value={Math.round(value * 10) / 10}
        step={step}
        min={min}
        max={max}
        onChange={e => onChange(Number(e.target.value))}
        className="h-8 w-full rounded-[8px] border border-snp-navy-200 text-[12px] font-semibold text-snp-navy-950 text-center bg-white px-1 outline-none focus:border-snp-indigo-600 transition-colors"
        style={{ MozAppearance: 'textfield' } as React.CSSProperties}
        onWheel={e => e.currentTarget.blur()}
      />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  selectedLayer: DesignLayer | null;
  product: Product;
  onUpdateLayer: (id: string, patch: Partial<DesignLayer>) => void;
  onAlign: (alignment: AlignmentType) => void;
}

// ── Main export ────────────────────────────────────────────────────────────────

export function PropertiesPanel({ selectedLayer, product, onUpdateLayer, onAlign }: Props) {
  return (
    <div
      className="w-[260px] bg-white border-l border-snp-navy-200 flex flex-col shrink-0 overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {selectedLayer ? (
        <>
          <LayerProperties layer={selectedLayer} onUpdateLayer={onUpdateLayer} onAlign={onAlign} />
          <CollapsibleProductInfo product={product} />
        </>
      ) : (
        <ProductInfoContent product={product} />
      )}
    </div>
  );
}

// ── Layer properties view ─────────────────────────────────────────────────────

function LayerProperties({
  layer, onUpdateLayer, onAlign,
}: {
  layer: DesignLayer;
  onUpdateLayer: (id: string, patch: Partial<DesignLayer>) => void;
  onAlign: (alignment: AlignmentType) => void;
}) {
  const isText = layer.type === 'text';
  const tl = isText ? layer as TextLayer : null;
  const opacityPct = Math.round((layer.opacity ?? 1) * 100);
  const sizeIdx = tl ? FONT_SIZES.indexOf(tl.fontSize) : -1;

  const typeLabel = layer.type === 'logo' ? 'Logo' : layer.type === 'graphic' ? 'Graphic' : 'Text';

  function handlePersonalization(opt: PersonalizationOption | null) {
    if (!opt) {
      onUpdateLayer(layer.id, {
        isPersonalized: false, personalizationType: null, personalizationPlaceholder: null,
      } as Partial<DesignLayer>);
    } else {
      onUpdateLayer(layer.id, {
        isPersonalized: true,
        personalizationType: opt.key,
        personalizationPlaceholder: opt.placeholder,
        text: opt.placeholder,
      } as Partial<DesignLayer>);
    }
  }

  return (
    <>
      {/* ── Panel header ── */}
      <div className="px-4 pt-4 pb-3 shrink-0" style={{ background: '#f5f8fc', borderBottom: '1px solid #e0ebf7' }}>
        <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">{typeLabel} Layer</p>
        <input
          value={layer.name}
          onChange={e => onUpdateLayer(layer.id, { name: e.target.value })}
          className="w-full text-[13px] font-semibold text-snp-navy-950 bg-transparent border-b border-snp-navy-200 outline-none focus:border-snp-indigo-500 pb-0.5 transition-colors"
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* ── Locked state ── */}
      {layer.locked ? (
        <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
          <Lock className="w-5 h-5 text-snp-navy-300" />
          <p className="text-[11px] text-snp-navy-400 leading-relaxed">
            This layer is locked.<br />Unlock it to edit properties.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">

          {/* ── TRANSFORM ── */}
          <div className="px-4 py-3">
            <SectionLabel label="Transform" />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <NumInput label="X" value={layer.x} onChange={v => onUpdateLayer(layer.id, { x: v })} />
              <NumInput label="Y" value={layer.y} onChange={v => onUpdateLayer(layer.id, { y: v })} />
              <NumInput label="W" value={layer.width}  onChange={v => onUpdateLayer(layer.id, { width: Math.max(10, v) })}  min={10} />
              <NumInput label="H" value={layer.height} onChange={v => onUpdateLayer(layer.id, { height: Math.max(10, v) })} min={10} />
            </div>
            <NumInput label="Rotation °" value={layer.rotation} onChange={v => onUpdateLayer(layer.id, { rotation: v })} step={1} />
          </div>

          <Divider />

          {/* ── APPEARANCE ── */}
          <div className="px-4 py-3">
            <SectionLabel label="Appearance" />
            <div className="flex items-center gap-2">
              <input
                type="range" min={0} max={100}
                value={opacityPct}
                onChange={e => onUpdateLayer(layer.id, { opacity: Number(e.target.value) / 100 })}
                className="flex-1 h-1.5 accent-snp-indigo-600"
              />
              <span className="text-[11px] font-bold text-snp-navy-700 w-9 text-right tabular-nums shrink-0">{opacityPct}%</span>
            </div>
          </div>

          <Divider />

          {/* ── ALIGNMENT ── */}
          <div className="px-4 py-3">
            <SectionLabel label="Alignment" />
            <div className="grid grid-cols-6 gap-0.5">
              {ALIGN_BUTTONS.map(({ alignment, Icon, title }) => (
                <button
                  key={alignment}
                  title={title}
                  onClick={() => onAlign(alignment)}
                  className="h-8 flex items-center justify-center rounded-[6px] text-snp-navy-500 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* ── TEXT-ONLY SECTIONS ── */}
          {isText && tl && (
            <>
              <Divider />

              {/* TEXT CONTENT */}
              <div className="px-4 py-3">
                <SectionLabel label="Text" />
                {tl.isPersonalized ? (
                  <div className="rounded-[8px] border border-snp-purple-300 bg-snp-purple-50 px-2.5 py-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-snp-purple-600 shrink-0" />
                    <span className="text-[12px] font-semibold text-snp-purple-700 flex-1 truncate">
                      {PERSONALIZATION_OPTIONS.find(o => o.key === tl.personalizationType)?.label ?? 'Personalized'}
                    </span>
                    <button
                      onClick={() => onUpdateLayer(layer.id, {
                        isPersonalized: false, personalizationType: null, personalizationPlaceholder: null, text: '',
                      } as Partial<DesignLayer>)}
                      className="w-4 h-4 flex items-center justify-center text-snp-purple-400 hover:text-snp-purple-700 transition-colors shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <textarea
                    value={tl.text}
                    onChange={e => onUpdateLayer(layer.id, {
                      text: e.target.value, isPersonalized: false, personalizationType: null, personalizationPlaceholder: null,
                    } as Partial<DesignLayer>)}
                    rows={2}
                    placeholder="Type your text…"
                    className="w-full text-[12px] text-snp-navy-950 font-medium bg-white border border-snp-navy-200 rounded-[8px] px-2.5 py-2 resize-none outline-none focus:border-snp-indigo-600 transition-colors placeholder:text-snp-navy-400"
                  />
                )}
              </div>

              <Divider />

              {/* TYPOGRAPHY */}
              <div className="px-4 py-3">
                <SectionLabel label="Typography" />
                {/* Font + Size */}
                <div className="flex items-center gap-1.5 mb-2">
                  <select
                    value={tl.fontFamily}
                    onChange={e => onUpdateLayer(layer.id, { fontFamily: e.target.value } as Partial<DesignLayer>)}
                    className="flex-1 h-8 border border-snp-navy-200 rounded-[8px] text-[11px] text-snp-navy-700 bg-white px-2 outline-none focus:border-snp-indigo-600 transition-colors min-w-0"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <div className="flex items-center border border-snp-navy-200 rounded-[8px] h-8 bg-white overflow-hidden shrink-0">
                    <button
                      onClick={() => sizeIdx > 0 && onUpdateLayer(layer.id, { fontSize: FONT_SIZES[sizeIdx - 1] } as Partial<DesignLayer>)}
                      disabled={sizeIdx <= 0}
                      className="w-7 h-full flex items-center justify-center text-snp-navy-500 hover:bg-snp-navy-50 disabled:opacity-30 text-[14px] font-bold transition-colors"
                    >−</button>
                    <span className="w-8 text-center text-[11px] font-bold text-snp-navy-700 select-none tabular-nums">{tl.fontSize}</span>
                    <button
                      onClick={() => sizeIdx < FONT_SIZES.length - 1 && onUpdateLayer(layer.id, { fontSize: FONT_SIZES[sizeIdx + 1] } as Partial<DesignLayer>)}
                      disabled={sizeIdx >= FONT_SIZES.length - 1}
                      className="w-7 h-full flex items-center justify-center text-snp-navy-500 hover:bg-snp-navy-50 disabled:opacity-30 text-[14px] font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
                {/* Bold + Align */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateLayer(layer.id, { fontWeight: tl.fontWeight === 'bold' ? 'normal' : 'bold' } as Partial<DesignLayer>)}
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors shrink-0 ${
                      tl.fontWeight === 'bold'
                        ? 'bg-snp-indigo-600 text-white'
                        : 'border border-snp-navy-200 text-snp-navy-500 hover:border-snp-indigo-600 hover:text-snp-indigo-600'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex border border-snp-navy-200 rounded-[8px] overflow-hidden">
                    {(['left', 'center', 'right'] as const).map((align, i) => {
                      const Icon = [AlignLeft, AlignCenter, AlignRight][i];
                      return (
                        <button
                          key={align}
                          onClick={() => onUpdateLayer(layer.id, { textAlign: align } as Partial<DesignLayer>)}
                          className={`w-8 h-8 flex items-center justify-center transition-colors ${
                            tl.textAlign === align ? 'bg-snp-indigo-600 text-white' : 'bg-white text-snp-navy-500 hover:bg-snp-navy-50'
                          } ${i > 0 ? 'border-l border-snp-navy-200' : ''}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Divider />

              {/* FILL */}
              <div className="px-4 py-3">
                <SectionLabel label="Fill" />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tl.fillColor}
                    onChange={e => onUpdateLayer(layer.id, { fillColor: e.target.value, fillEnabled: true } as Partial<DesignLayer>)}
                    className="w-8 h-8 rounded-[8px] border border-snp-navy-200 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <span className="text-[11px] font-mono text-snp-navy-600 tracking-wide">{tl.fillColor.toUpperCase()}</span>
                </div>
              </div>

              <Divider />

              {/* STROKE */}
              <div className="px-4 py-3">
                <SectionLabel label="Stroke" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateLayer(layer.id, { strokeEnabled: !tl.strokeEnabled } as Partial<DesignLayer>)}
                    className={`text-[10px] font-semibold px-2.5 h-7 rounded-[6px] border transition-colors shrink-0 ${
                      tl.strokeEnabled
                        ? 'border-snp-indigo-600 text-snp-indigo-600 bg-snp-indigo-50'
                        : 'border-snp-navy-200 text-snp-navy-400 hover:border-snp-navy-300'
                    }`}
                  >
                    {tl.strokeEnabled ? 'On' : 'Off'}
                  </button>
                  {tl.strokeEnabled && (
                    <>
                      <input
                        type="color"
                        value={tl.strokeColor}
                        onChange={e => onUpdateLayer(layer.id, { strokeColor: e.target.value } as Partial<DesignLayer>)}
                        className="w-7 h-7 rounded-[6px] border border-snp-navy-200 cursor-pointer p-0.5 bg-white shrink-0"
                      />
                      <div className="flex items-center border border-snp-navy-200 rounded-[8px] h-7 bg-white overflow-hidden shrink-0">
                        <button onClick={() => onUpdateLayer(layer.id, { strokeWidth: Math.max(1, tl.strokeWidth - 1) } as Partial<DesignLayer>)}
                          className="w-6 h-full flex items-center justify-center text-snp-navy-500 hover:bg-snp-navy-50 text-[13px] font-bold">−</button>
                        <span className="w-6 text-center text-[10px] font-bold text-snp-navy-700 select-none tabular-nums">{tl.strokeWidth}</span>
                        <button onClick={() => onUpdateLayer(layer.id, { strokeWidth: Math.min(10, tl.strokeWidth + 1) } as Partial<DesignLayer>)}
                          className="w-6 h-full flex items-center justify-center text-snp-navy-500 hover:bg-snp-navy-50 text-[13px] font-bold">+</button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Divider />

              {/* SPACING */}
              <div className="px-4 py-3">
                <SectionLabel label="Spacing" />
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-snp-navy-500 w-12 shrink-0">Letter</span>
                    <input type="range" min={-2} max={10} step={0.5}
                      value={tl.letterSpacing ?? 0}
                      onChange={e => onUpdateLayer(layer.id, { letterSpacing: Number(e.target.value) } as Partial<DesignLayer>)}
                      className="flex-1 h-1.5 accent-snp-indigo-600"
                    />
                    <span className="text-[10px] font-bold text-snp-navy-700 w-9 text-right tabular-nums shrink-0">{tl.letterSpacing ?? 0}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-snp-navy-500 w-12 shrink-0">Line ht.</span>
                    <input type="range" min={0.8} max={3} step={0.1}
                      value={tl.lineHeight ?? 1.2}
                      onChange={e => onUpdateLayer(layer.id, { lineHeight: Number(e.target.value) } as Partial<DesignLayer>)}
                      className="flex-1 h-1.5 accent-snp-indigo-600"
                    />
                    <span className="text-[10px] font-bold text-snp-navy-700 w-9 text-right tabular-nums shrink-0">{(tl.lineHeight ?? 1.2).toFixed(1)}×</span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* PERSONALIZATION */}
              <div className="px-4 py-3">
                <SectionLabel label="Personalization" />
                <PersonalizationDropdown
                  value={tl.personalizationType}
                  onChange={handlePersonalization}
                />
                {tl.isPersonalized && tl.personalizationType && (
                  <p className="text-[10px] text-snp-purple-600 font-medium mt-1.5">
                    Previews as:{' '}
                    <span className="font-semibold">
                      &ldquo;{PERSONALIZATION_SAMPLE_DATA[tl.personalizationType] ?? tl.personalizationType}&rdquo;
                    </span>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Collapsible product info (shown below layer properties) ──────────────────

function CollapsibleProductInfo({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
  const description = PRINT_TECHNIQUE_DESCRIPTIONS[product.printTechnique];

  return (
    <>
      <Divider />
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-snp-navy-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest shrink-0">Product</p>
          <p className="text-[11px] font-semibold text-snp-navy-700 truncate">{product.name}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-snp-navy-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="flex flex-col">
          <div className="px-4 pb-3">
            <p className="text-[10px] font-bold text-snp-navy-500 uppercase tracking-wide">{product.brand}</p>
            <p className="text-[11px] text-snp-navy-600 leading-relaxed mt-1">{product.description}</p>
          </div>

          {product.colors.length > 0 && (
            <>
              <Divider />
              <div className="px-4 py-3">
                <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Colors · {product.colors.length}</p>
                <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                  {product.colors.map(c => (
                    <div key={c.hex} className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
                        style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }} />
                      <span className="text-[11px] text-snp-navy-600">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {product.sizes.length > 0 && (
            <>
              <Divider />
              <div className="px-4 py-3">
                <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Sizes</p>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map(s => (
                    <span key={s} className="text-[10px] font-medium text-snp-navy-600 bg-snp-navy-50 border border-snp-navy-200 rounded-[4px] px-1.5 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          <Divider />
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Decoration</p>
            <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: chip.bg, color: chip.text }}>{chip.label}</span>
            <p className="text-[11px] text-snp-navy-500 leading-relaxed mt-2">{description}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ── Product info view (no selection) ─────────────────────────────────────────

function ProductInfoContent({ product }: { product: Product }) {
  const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
  const description = PRINT_TECHNIQUE_DESCRIPTIONS[product.printTechnique];

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0" style={{ background: '#f5f8fc', borderBottom: '1px solid #e0ebf7' }}>
        <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-1.5">Product</p>
        <p className="text-[10px] font-bold text-snp-navy-500 uppercase tracking-wide">{product.brand}</p>
        <p className="text-[13px] font-semibold text-snp-navy-950 leading-snug mt-0.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>{product.name}</p>
        <p className="text-[11px] text-snp-navy-400 mt-1">Select a layer to edit its properties</p>
      </div>

      <div className="flex flex-col">
        {/* About */}
        <div className="px-4 py-3">
          <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-1.5">About</p>
          <p className="text-[11px] text-snp-navy-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Colors */}
        {product.colors.length > 0 && (
          <>
            <Divider />
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">
                Colors · {product.colors.length}
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {product.colors.map(c => (
                  <div key={c.hex} className="flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
                      style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }}
                    />
                    <span className="text-[11px] text-snp-navy-600">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <>
            <Divider />
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Sizes</p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map(s => (
                  <span
                    key={s}
                    className="text-[10px] font-medium text-snp-navy-600 bg-snp-navy-50 border border-snp-navy-200 rounded-[4px] px-1.5 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Decoration */}
        <Divider />
        <div className="px-4 py-3">
          <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-2">Decoration</p>
          <span
            className="text-[10px] font-bold rounded-full px-2.5 py-1"
            style={{ background: chip.bg, color: chip.text }}
          >
            {chip.label}
          </span>
          <p className="text-[11px] text-snp-navy-500 leading-relaxed mt-2">{description}</p>
        </div>
      </div>
    </>
  );
}
