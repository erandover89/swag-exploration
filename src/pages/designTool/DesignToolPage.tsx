import { useState, useEffect, useRef } from 'react';
import type Konva from 'konva';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronDown, Undo2, Redo2, Minus, Plus, Check, AlertTriangle,
  X, Package, Download, Eye, Sparkles, Info,
} from 'lucide-react';
import { useDesignEditor } from './useDesignEditor';
import { loadImageDimensions, makeImageLayerSized, type DesignLayer, type TextLayer } from './types';
import { LayerSidebar } from './LayerSidebar';
import { DesignCanvas } from './DesignCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { type Product, type Lookbook, type PrintTechnique, PRINT_TECHNIQUE_CHIPS } from '../../data/mockData';
import { useCompanyLogo } from '../../context/CompanyLogoContext';
import { useLookbooks } from '../../context/LookbookContext';
import { Button } from '../../components/Button';

const TECHNIQUE_DESCRIPTIONS: Record<PrintTechnique, string> = {
  embroidery:        'Thread stitched into fabric. Works best with solid colors — no gradients or fine strokes.',
  dtf:               'Direct-to-Film transfer. Vibrant full-color prints that bond to almost any fabric.',
  dtg:               'Direct-to-Garment inkjet. Great for photo-quality art on cotton.',
  sublimation:       'Dye fuses into polyester fibers. Requires a white or light base — no separate backgrounds.',
  'digital-inkjet':  'High-res inkjet on hard goods. Sharp detail on flat or slightly curved surfaces.',
  'laser-printing':  'Laser engraving on metal, wood, or plastic. Best with 1–3 solid colors.',
  'uv-printing':     'UV-cured full-color ink on rigid surfaces. Durable and scratch-resistant.',
  'digital-printing':'Versatile digital print. Handles full color on a wide range of promotional materials.',
};

const CANVAS_W = 460;
const CANVAS_H = 520;
const PRINTABLE_AREA = { x: 92, y: 88, width: 276, height: 344 };

// When there is no lookbook context (e.g. standalone preview), use this bucket key.
const GLOBAL_KEY = '__global__';

interface Props {
  product: Product;
  lookbookId?: string | null;
  onClose?: () => void;
  onSave?: (pickedLookbookId?: string) => void;
  approveMode?: boolean;
  /** seed a fresh canvas with this logo instead of the company logo (e.g. the store's primary) */
  seedLogoUrl?: string;
  /** override the logo picker's asset library (e.g. a store's uploaded logos) */
  logoAssets?: { id: string; name: string; src: string }[];
}

export function DesignToolPage({ product, lookbookId, onClose, onSave, approveMode, seedLogoUrl, logoAssets }: Props) {
  const navigate = useNavigate();
  const isDirtyRef = useRef(false);
  const realClose = () => { onClose ? onClose() : navigate(-1); };
  const close = () => {
    if (isDirtyRef.current && lookbookId) { setShowUnsavedModal(true); } else { realClose(); }
  };
  const stageRef = useRef<Konva.Stage | null>(null);
  const logoSeededRef = useRef(false);

  const { logoUrl, addProductsToBrandSet } = useCompanyLogo();
  const {
    lookbooks,
    createLookbook,
    addProducts,
    getProductDesign,
    saveProductDesign,
    approveProductDesign,
  } = useLookbooks();

  const effectiveLookbookId = lookbookId ?? GLOBAL_KEY;
  const savedDesign = getProductDesign(effectiveLookbookId, product.id);

  function requestSave(doSave: () => void, afterSave: () => void) {
    doSave();
    afterSave();
  }

  const [showDesignPicker, setShowDesignPicker] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [selectedLookbookId, setSelectedLookbookId] = useState<string | null>(
    lookbookId ?? (lookbooks[0]?.id ?? null),
  );

  const editor = useDesignEditor({
    productId: product.id,
    canvasWidth: CANVAS_W,
    canvasHeight: CANVAS_H,
    printableArea: PRINTABLE_AREA,
    zoom: 100,
    backgroundColor: savedDesign?.backgroundColor ?? null,
    selectedLayerId: savedDesign?.layers[0]?.id ?? null,
    layers: savedDesign?.layers ?? [],
  });

  // Dirty state — true when the user has made edits not yet saved
  const isDirty = editor.canUndo;
  isDirtyRef.current = isDirty;

  useEffect(() => {
    // fresh canvases seed with the currently assigned logo — the caller's
    // (e.g. the store's primary logo) wins over the company logo
    const seed = seedLogoUrl ?? logoUrl;
    if (!savedDesign && seed && !logoSeededRef.current) {
      logoSeededRef.current = true;
      loadImageDimensions(seed).then(({ w, h }) => {
        editor.addLayer(makeImageLayerSized('logo', seed, seedLogoUrl ? 'Store Logo' : 'Company Logo', PRINTABLE_AREA, w, h));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isInputFocused = () => {
      const el = document.activeElement;
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); editor.undo(); return; }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); editor.redo(); return; }

      if (isInputFocused()) return;

      const selId = editor.state.selectedLayerId;
      const selLayer = editor.state.layers.find(l => l.id === selId);

      if ((e.key === 'Delete' || e.key === 'Backspace') && selId && !selLayer?.locked) {
        e.preventDefault();
        editor.deleteLayer(selId);
        return;
      }
      if (e.key === 'Escape') { editor.selectLayer(null); return; }

      if (selLayer && !selLayer.locked && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -delta : e.key === 'ArrowRight' ? delta : 0;
        const dy = e.key === 'ArrowUp' ? -delta : e.key === 'ArrowDown' ? delta : 0;
        editor.updateLayer(selLayer.id, { x: selLayer.x + dx, y: selLayer.y + dy });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.state.selectedLayerId, editor.state.layers]);

  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showInfo) return;
    const handler = (e: MouseEvent) => {
      if (!infoRef.current?.contains(e.target as Node)) setShowInfo(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showInfo]);

  const [previewMode, setPreviewMode] = useState(false);

  const hasPersonalizedLayers = editor.state.layers.some(
    l => l.type === 'text' && (l as TextLayer).isPersonalized
  );

  const [previewColorIdx, setPreviewColorIdx] = useState(0);
  const [recipientColorHexes, setRecipientColorHexes] = useState<Set<string>>(
    () => new Set(savedDesign?.recipientColorHexes ?? product.colors.map(c => c.hex)),
  );
  const selectedColor = product.colors[previewColorIdx] ?? product.colors[0];

  function toggleInclude(hex: string) {
    setRecipientColorHexes(prev => {
      if (prev.has(hex) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(hex)) next.delete(hex); else next.add(hex);
      return next;
    });
  }

  const hasQualityIssue = savedDesign?.hasQualityIssue ?? (product.hasImageQualityIssue ?? false);

  function persistCanvas() {
    saveProductDesign(effectiveLookbookId, product.id, {
      layers: editor.state.layers,
      canvasWidth: CANVAS_W,
      canvasHeight: CANVAS_H,
      recipientColorHexes: [...recipientColorHexes],
      hasQualityIssue: false,
      backgroundColor: editor.state.backgroundColor ?? null,
    });
    addProductsToBrandSet([product.id]);
  }

  function handleSaveButton() {
    if (approveMode) {
      requestSave(
        () => { persistCanvas(); approveProductDesign(effectiveLookbookId, product.id); },
        () => { onSave ? onSave() : close(); },
      );
    } else if (lookbookId) {
      persistCanvas();
      addProducts(lookbookId, [product.id]);
      onSave ? onSave(lookbookId) : navigate(`/designs/${lookbookId}`, { replace: true });
    } else {
      setShowDesignPicker(true);
    }
  }

  const saveLabel = approveMode ? 'Approve & save item' : lookbookId ? (isDirty ? 'Save changes' : 'Saved') : 'Save to design';

  return (
    <div
      className="flex flex-col"
      style={{ height: onClose ? '100vh' : 'calc(100vh - 112px)', fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ── Top toolbar ─────────────────────────────────────────────────────── */}
      <div className="h-14 flex items-center px-4 gap-3 shrink-0 relative bg-white border-b border-[#e0ebf7]">

        <button
          onClick={close}
          className="w-8 h-8 rounded-full border border-[#e0ebf7] flex items-center justify-center text-snp-navy-500 hover:bg-snp-navy-50 hover:text-snp-navy-800 hover:border-snp-navy-300 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="font-medium text-snp-navy-400 shrink-0">Design</span>
          <span className="text-snp-navy-200 shrink-0">›</span>
          <span
            className="font-semibold truncate text-snp-navy-950"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {product.name}
          </span>
        </div>

        {isDirty && lookbookId && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            Unsaved changes
          </span>
        )}

        <div className="flex-1" />

        {/* Info button + popover */}
        <div ref={infoRef} className="relative shrink-0">
          <button
            onClick={() => setShowInfo(o => !o)}
            title="Product & decoration info"
            className={`w-8 h-8 rounded-[8px] border flex items-center justify-center transition-colors ${
              showInfo
                ? 'bg-snp-navy-50 border-snp-navy-300 text-snp-navy-800'
                : 'border-[#e0ebf7] text-snp-navy-500 hover:bg-snp-navy-50 hover:border-snp-navy-300 hover:text-snp-navy-800'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {showInfo && (() => {
            const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
            return (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-[300px] rounded-[16px] overflow-hidden z-50 bg-white border border-[#e0ebf7]"
                style={{ boxShadow: '0 8px 32px rgba(1,39,84,0.12)' }}
              >
                <div className="px-4 pt-4 pb-3 border-b border-[#e0ebf7]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-snp-navy-400 mb-1">
                    {product.brand} · {product.category}
                  </p>
                  <p
                    className="text-[15px] font-semibold text-snp-navy-950 leading-snug"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    {product.name}
                  </p>
                </div>

                <div className="px-4 py-3 border-b border-[#e0ebf7]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-snp-navy-400 mb-2">
                    Decoration method
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                      style={{ background: chip.bg, color: chip.text }}
                    >
                      {chip.label}
                    </span>
                    <p className="text-[12px] leading-relaxed text-snp-navy-500">
                      {TECHNIQUE_DESCRIPTIONS[product.printTechnique]}
                    </p>
                  </div>
                </div>

                {product.description && (
                  <div className="px-4 py-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-snp-navy-400 mb-1.5">
                      About this product
                    </p>
                    <p className="text-[12px] leading-relaxed line-clamp-4 text-snp-navy-500">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 rounded-[10px] p-0.5 border border-[#e0ebf7]">
          <button
            onClick={editor.undo}
            disabled={!editor.canUndo}
            title="Undo (⌘Z)"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-snp-navy-500 hover:bg-snp-navy-50 hover:text-snp-navy-800 transition-colors disabled:opacity-30"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={editor.redo}
            disabled={!editor.canRedo}
            title="Redo (⌘⇧Z)"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-snp-navy-500 hover:bg-snp-navy-50 hover:text-snp-navy-800 transition-colors disabled:opacity-30"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Export PNG */}
        <button
          onClick={() => {
            const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
            if (!uri) return;
            const a = document.createElement('a');
            a.href = uri;
            a.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-design.png`;
            a.click();
          }}
          title="Export PNG (2×)"
          className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#e0ebf7] text-snp-navy-500 hover:bg-snp-navy-50 hover:border-snp-navy-300 hover:text-snp-navy-800 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Preview */}
        <button
          onClick={() => setPreviewMode(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#e0ebf7] text-[12px] font-semibold text-snp-navy-600 hover:bg-snp-navy-50 hover:border-snp-navy-300 hover:text-snp-navy-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>

        {/* Zoom */}
        <div className="flex items-center gap-0.5 rounded-[10px] p-0.5 border border-[#e0ebf7]">
          <button
            onClick={() => editor.setZoom(Math.max(50, editor.state.zoom - 25))}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-snp-navy-500 hover:bg-snp-navy-50 hover:text-snp-navy-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[12px] font-bold w-10 text-center select-none text-snp-navy-700">
            {editor.state.zoom}%
          </span>
          <button
            onClick={() => editor.setZoom(Math.min(150, editor.state.zoom + 25))}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-snp-navy-500 hover:bg-snp-navy-50 hover:text-snp-navy-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 shrink-0 bg-[#e0ebf7]" />

        <button
          onClick={close}
          className="h-9 px-4 rounded-[10px] text-[13px] font-medium border border-[#e0ebf7] text-snp-navy-600 hover:bg-snp-navy-50 hover:border-snp-navy-300 hover:text-snp-navy-800 transition-colors"
        >
          Cancel
        </button>

        <Button size="sm" onClick={handleSaveButton}>
          {saveLabel}
        </Button>
      </div>

      {/* ── Quality issue banner ──────────────────────────────────────────────── */}
      {hasQualityIssue && (
        <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ background: '#fff8ec', borderBottom: '1px solid #fbbf24' }}>
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#b45309' }} />
          <span className="text-[13px] font-semibold" style={{ color: '#92400e' }}>Low resolution layer detected — replace for best print quality</span>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        <LayerSidebar
          layers={editor.state.layers}
          selectedLayerId={editor.state.selectedLayerId}
          printableArea={PRINTABLE_AREA}
          backgroundColor={editor.state.backgroundColor}
          logoAssets={logoAssets}
          onSelect={editor.selectLayer}
          onAdd={editor.addLayer}
          onDelete={editor.deleteLayer}
          onDuplicate={editor.duplicateLayer}
          onUpdateLayer={editor.updateLayer}
          onSetBackgroundColor={editor.setBackgroundColor}
        />

        {/* Canvas area */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 35%, #e8f2fb 0%, #f0f5fb 60%, #f5f8fc 100%)' }}
          onClick={e => { if (e.currentTarget === e.target) editor.selectLayer(null); }}
        >
          {product.colors.length > 1 && (
            <ColorVariantPicker
              colors={product.colors}
              previewColorIdx={previewColorIdx}
              onPreview={setPreviewColorIdx}
              recipientColorHexes={recipientColorHexes}
              onToggleInclude={toggleInclude}
            />
          )}

          <DesignCanvas
            layers={editor.state.layers}
            selectedLayerId={editor.state.selectedLayerId}
            canvasWidth={CANVAS_W}
            canvasHeight={CANVAS_H}
            printableArea={PRINTABLE_AREA}
            productImage={product.image}
            productColorHex={selectedColor?.hex ?? '#f5f8fc'}
            zoom={editor.state.zoom}
            backgroundColor={editor.state.backgroundColor}
            stageRef={stageRef}
            onSelect={editor.selectLayer}
            onUpdateLayer={editor.updateLayer}
          />

          <p className="text-[11px] text-snp-navy-400 font-medium pointer-events-none select-none">
            Click to select · Drag to move · Handles to resize &amp; rotate
          </p>
        </div>

        <PropertiesPanel
          selectedLayer={
            editor.state.selectedLayerId
              ? editor.state.layers.find(l => l.id === editor.state.selectedLayerId) ?? null
              : null
          }
          product={product}
          onUpdateLayer={editor.updateLayer}
          onAlign={alignment => editor.alignLayer(alignment, PRINTABLE_AREA)}
        />
      </div>

      {/* ── Design picker (first-time save, no lookbook context) ─────────────── */}
      {showDesignPicker && (
        <DesignPickerModal
          productName={product.name}
          lookbooks={lookbooks}
          selectedLookbookId={selectedLookbookId}
          onSelect={setSelectedLookbookId}
          onNewLookbook={() => {
            const lb = createLookbook({ productIds: [product.id] });
            saveProductDesign(lb.id, product.id, {
              layers: editor.state.layers,
              canvasWidth: CANVAS_W,
              canvasHeight: CANVAS_H,
              recipientColorHexes: [...recipientColorHexes],
              hasQualityIssue: false,
              backgroundColor: editor.state.backgroundColor ?? null,
            });
            addProductsToBrandSet([product.id]);
            setShowDesignPicker(false);
            if (onSave) { onSave(lb.id); } else { navigate(`/designs/${lb.id}`); }
          }}
          onConfirm={() => {
            persistCanvas();
            if (selectedLookbookId) addProducts(selectedLookbookId, [product.id]);
            setShowDesignPicker(false);
            onSave ? onSave(selectedLookbookId ?? undefined) : navigate(-1);
          }}
          onCancel={() => setShowDesignPicker(false)}
        />
      )}

      {/* ── Unsaved changes modal ─────────────────────────────────────────────── */}
      {showUnsavedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(1,39,84,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-[20px] shadow-[0px_24px_48px_rgba(1,39,84,0.20)] w-[360px] p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[16px] font-semibold text-snp-navy-950">Unsaved changes</h3>
              <p className="text-[13px] text-snp-navy-500 leading-relaxed">
                You have unsaved changes to <span className="font-semibold text-snp-navy-700">{product.name}</span>. Save before leaving?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" className="w-full justify-center" onClick={() => { setShowUnsavedModal(false); handleSaveButton(); }}>
                Save changes
              </Button>
              <button
                onClick={() => { setShowUnsavedModal(false); realClose(); }}
                className="w-full h-9 rounded-[10px] text-[13px] font-medium text-snp-navy-500 hover:bg-snp-navy-50 transition-colors"
              >
                Discard & leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-screen preview overlay ───────────────────────────────────────── */}
      {previewMode && (
        <PreviewOverlay
          product={product}
          layers={editor.state.layers}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
          printableArea={PRINTABLE_AREA}
          backgroundColor={editor.state.backgroundColor}
          recipientColorHexes={recipientColorHexes}
          hasPersonalizedLayers={hasPersonalizedLayers}
          onClose={() => setPreviewMode(false)}
        />
      )}
    </div>
  );
}

// ── Design picker modal ────────────────────────────────────────────────────────

function DesignPickerModal({
  productName, lookbooks, selectedLookbookId, onSelect, onNewLookbook, onConfirm, onCancel,
}: {
  productName: string;
  lookbooks: Lookbook[];
  selectedLookbookId: string | null;
  onSelect: (id: string) => void;
  onNewLookbook: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-[20px] shadow-[0px_24px_48px_rgba(1,39,84,0.20)] w-full max-w-[420px] mx-4 overflow-hidden">

        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-[18px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Save to a design
            </h2>
            <p className="text-[13px] text-snp-navy-400 mt-0.5">
              Add <span className="font-medium text-snp-navy-600">{productName}</span> to an existing design
            </p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-full hover:bg-snp-navy-100 flex items-center justify-center text-snp-navy-400 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pb-2 max-h-[300px] overflow-y-auto flex flex-col gap-1">
          {lookbooks.length === 0 ? (
            <p className="text-[13px] text-snp-navy-400 text-center py-6">No designs yet</p>
          ) : (
            lookbooks.map(lb => {
              const isSelected = lb.id === selectedLookbookId;
              return (
                <button
                  key={lb.id}
                  onClick={() => onSelect(lb.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-colors ${
                    isSelected ? 'bg-snp-indigo-50 border border-snp-indigo-300' : 'border border-transparent hover:bg-snp-navy-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-[10px] bg-snp-navy-100 flex items-center justify-center shrink-0 overflow-hidden border border-snp-navy-200">
                    {lb.logoUrl
                      ? <img src={lb.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                      : <Package className="w-5 h-5 text-snp-navy-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-snp-navy-950 truncate">{lb.name}</p>
                    <p className="text-[12px] text-snp-navy-400">{lb.productIds.length} product{lb.productIds.length !== 1 ? 's' : ''}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-snp-indigo-600 shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={onNewLookbook}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-[12px] border border-dashed border-snp-navy-300 text-[13px] font-medium text-snp-navy-500 hover:border-snp-indigo-400 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create a new design
          </button>
        </div>

        <div className="px-6 py-4 border-t border-snp-navy-100 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" disabled={!selectedLookbookId} onClick={onConfirm}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ── Color variant picker ───────────────────────────────────────────────────────

interface ColorPickerProps {
  colors: { name: string; hex: string }[];
  previewColorIdx: number;
  onPreview: (idx: number) => void;
  recipientColorHexes: Set<string>;
  onToggleInclude: (hex: string) => void;
}

function ColorVariantPicker({ colors, previewColorIdx, onPreview, recipientColorHexes, onToggleInclude }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentColor = colors[previewColorIdx] ?? colors[0];
  const includedCount = colors.filter(c => recipientColorHexes.has(c.hex)).length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-9 pl-2.5 pr-3 bg-white rounded-[10px] shadow-sm border border-[#e0ebf7] hover:border-snp-navy-300 transition-colors"
      >
        <span
          className="w-5 h-5 rounded-full shrink-0 border border-black/10"
          style={{ backgroundColor: currentColor.hex }}
        />
        <span className="text-[12px] font-semibold text-snp-navy-800">{currentColor.name}</span>
        <span className="text-[10px] text-snp-navy-400 pl-2 ml-0.5 border-l border-snp-navy-200 font-medium">
          {includedCount} of {colors.length} offered
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-snp-navy-400 transition-transform ml-0.5 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-[14px] shadow-[0px_8px_32px_rgba(1,39,84,0.12)] border border-snp-navy-100 z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-snp-navy-100">
            <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest">
              Color variants · {includedCount} of {colors.length} offered to recipients
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {colors.map((color, i) => {
              const included = recipientColorHexes.has(color.hex);
              const isPreviewing = i === previewColorIdx;
              return (
                <div
                  key={color.hex}
                  className={`flex items-center gap-2 px-3 py-2 transition-colors ${
                    isPreviewing ? 'bg-snp-navy-50' : 'hover:bg-[#f8fafc]'
                  }`}
                >
                  <button
                    onClick={() => onPreview(i)}
                    className={`flex items-center gap-2.5 flex-1 min-w-0 text-left ${!included ? 'opacity-40' : ''}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full shrink-0 transition-all ${
                        isPreviewing ? 'ring-2 ring-offset-1 ring-snp-navy-700' : ''
                      }`}
                      style={{
                        backgroundColor: color.hex,
                        border: isPreviewing ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
                      }}
                    />
                    <span className={`text-[12px] truncate ${
                      isPreviewing ? 'font-semibold text-snp-navy-950' : 'font-medium text-snp-navy-700'
                    }`}>
                      {color.name}
                    </span>
                    {isPreviewing && (
                      <span className="text-[9px] text-snp-navy-400 font-semibold shrink-0 ml-auto">viewing</span>
                    )}
                  </button>

                  <button
                    onClick={() => onToggleInclude(color.hex)}
                    title={included ? `Remove ${color.name} from recipient options` : `Add ${color.name} to recipient options`}
                    className={`w-5 h-5 rounded-[5px] shrink-0 flex items-center justify-center border-2 transition-colors ${
                      included
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-snp-navy-300 hover:border-snp-navy-500'
                    }`}
                  >
                    {included && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-snp-navy-100">
            <p className="text-[9px] text-snp-navy-400">Click row to preview on canvas · ☑ = offered to recipients</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Full-screen preview overlay ────────────────────────────────────────────────

type AiMockupState = 'idle' | 'generating' | 'done';

function PreviewOverlay({
  product, layers, canvasWidth, canvasHeight, printableArea,
  backgroundColor, recipientColorHexes, hasPersonalizedLayers, onClose,
}: {
  product: Product;
  layers: DesignLayer[];
  canvasWidth: number;
  canvasHeight: number;
  printableArea: { x: number; y: number; width: number; height: number };
  backgroundColor: string | null;
  recipientColorHexes: Set<string>;
  hasPersonalizedLayers: boolean;
  onClose: () => void;
}) {
  const [aiState, setAiState] = useState<AiMockupState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const includedColors = product.colors.filter(c => recipientColorHexes.has(c.hex));
  const displayColors = (includedColors.length > 0 ? includedColors : product.colors).slice(0, 4);

  const cardZoom = Math.min(70, Math.round((340 / canvasHeight) * 100));
  const aiZoom = Math.round((220 / printableArea.height) * 100);
  const aiScale = aiZoom / 100;
  const clipW = Math.round(printableArea.width * aiScale);
  const clipH = Math.round(printableArea.height * aiScale);
  const offsetX = Math.round(printableArea.x * aiScale);
  const offsetY = Math.round(printableArea.y * aiScale);
  const frameW = clipW + 48;
  const frameH = clipH + 64;

  function startGenerate() {
    setAiState('generating');
    timerRef.current = setTimeout(() => setAiState('done'), 2500);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col select-none"
      style={{ background: '#0d1420', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div
        className="h-14 flex items-center justify-between px-6 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Eye className="w-4 h-4 text-white/40 shrink-0" />
          <span className="text-[14px] font-semibold text-white truncate">{product.name}</span>
          <span className="text-white/20 shrink-0">·</span>
          <span className="text-[12px] text-white/40 font-medium shrink-0">Design preview</span>
          {hasPersonalizedLayers && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-snp-purple-300 bg-snp-purple-950/60 border border-snp-purple-800/50 rounded-full px-2.5 py-1 shrink-0">
              <Sparkles className="w-3 h-3" />
              Showing as Alex Chen
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] border border-white/15 text-white/70 text-[12px] font-semibold hover:bg-white/10 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          Exit preview
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center gap-5 px-8 py-6 overflow-hidden">
        {displayColors.map((color, i) => (
          <div key={color.hex} className="flex flex-col items-center gap-3 shrink-0">

            {aiState === 'idle' && (
              <div
                className="rounded-[24px] overflow-hidden p-5"
                style={{ background: `radial-gradient(ellipse at 50% 110%, ${color.hex}55 0%, #0d1420 60%)` }}
              >
                <div className="pointer-events-none">
                  <DesignCanvas
                    layers={layers}
                    selectedLayerId={null}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    printableArea={printableArea}
                    productImage={product.image}
                    productColorHex={color.hex}
                    zoom={cardZoom}
                    backgroundColor={backgroundColor}
                    hidePrintArea={true}
                    previewMode={true}
                    onSelect={() => {}}
                    onUpdateLayer={() => {}}
                  />
                </div>
              </div>
            )}

            {aiState === 'generating' && (
              <div
                className="animate-pulse rounded-[20px]"
                style={{
                  width: frameW,
                  height: frameH,
                  background: `linear-gradient(135deg, ${color.hex}25 0%, rgba(255,255,255,0.04) 100%)`,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            )}

            {aiState === 'done' && (
              <div
                className="relative overflow-hidden rounded-[20px]"
                style={{ width: frameW, height: frameH, boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}
              >
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(145deg, ${color.hex}60 0%, #1a2038 55%, #0d1420 100%)` }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.09) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -54%)', width: clipW, height: clipH, overflow: 'hidden', borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                  <div style={{ position: 'absolute', left: -offsetX, top: -offsetY }}>
                    <DesignCanvas
                      layers={layers}
                      selectedLayerId={null}
                      canvasWidth={canvasWidth}
                      canvasHeight={canvasHeight}
                      printableArea={printableArea}
                      productImage={product.image}
                      productColorHex={color.hex}
                      zoom={aiZoom}
                      backgroundColor={backgroundColor}
                      hidePrintArea={true}
                      previewMode={true}
                      onSelect={() => {}}
                      onUpdateLayer={() => {}}
                    />
                  </div>
                </div>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-white/50" />
                  <span className="text-[8px] text-white/50 font-bold tracking-wider">AI</span>
                </div>
              </div>
            )}

            <span className="text-[11px] font-semibold text-white/40">{color.name}</span>
          </div>
        ))}
      </div>

      {/* Footer / AI CTA */}
      <div
        className="h-11 flex items-center justify-center gap-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {aiState === 'idle' && (
          <button
            onClick={startGenerate}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white/35 hover:text-white/65 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Generate AI lifestyle mockups
          </button>
        )}
        {aiState === 'generating' && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/30 animate-pulse">
            <Sparkles className="w-3 h-3" />
            Generating AI mockups…
          </span>
        )}
        {aiState === 'done' && (
          <>
            <span className="text-[10px] text-white/22 font-medium tracking-wide">✦ AI simulation — for preview purposes only</span>
            <span className="text-white/15">·</span>
            <button
              onClick={() => setAiState('idle')}
              className="text-[10px] font-semibold text-white/30 hover:text-white/60 transition-colors"
            >
              Back to product view
            </button>
          </>
        )}
      </div>
    </div>
  );
}
