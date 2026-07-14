import { useMemo, useRef, useState } from 'react';
import type Konva from 'konva';
import { Loader2, Lock, RotateCcw, Trash2, Type as TypeIcon, Upload, X } from 'lucide-react';
import type { Product } from '../data/mockData';
import { CUSTOMIZATION_UPCHARGE, fmtMoney, type DistributorStore } from '../data/storesData';
import { useLookbooks } from '../context/LookbookContext';
import { storeLogoSrc } from '../components/stores/StoreBits';
import { useDesignEditor } from '../pages/designTool/useDesignEditor';
import { DesignCanvas } from '../pages/designTool/DesignCanvas';
import {
  loadImageDimensions, makeImageLayerSized, makeTextLayer,
  type DesignLayer, type TextLayer,
} from '../pages/designTool/types';
import { fileToDataUrl } from '../utils/imageResize';
import type { LineCustomization } from './StorefrontShell';

const CANVAS_W = 460;
const CANVAS_H = 520;
const PRINTABLE_AREA = { x: 92, y: 88, width: 276, height: 344 };

/** Composite the product photo + the Konva layer export into one preview image. */
async function compositePreview(productImage: string, stageDataUrl: string): Promise<string | undefined> {
  try {
    const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (productImage.startsWith('/')) {
      const photo = await load(productImage);
      // cover-fit, matching the customizer canvas background
      const scale = Math.max(CANVAS_W / photo.naturalWidth, CANVAS_H / photo.naturalHeight);
      const w = photo.naturalWidth * scale, h = photo.naturalHeight * scale;
      ctx.drawImage(photo, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
    }
    const overlay = await load(stageDataUrl);
    ctx.drawImage(overlay, 0, 0, CANVAS_W, CANVAS_H);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return undefined; // tainted canvas or load failure — fall back to the "Customized" chip
  }
}

export function StorefrontCustomizer({ store, product, initial, onSave, onClose }: {
  store: DistributorStore;
  product: Product;
  initial?: LineCustomization;
  onSave: (c: LineCustomization) => void;
  onClose: () => void;
}) {
  const { getProductDesign } = useLookbooks();
  const stageRef = useRef<Konva.Stage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const customization = store.productCustomizations[product.id] ?? {};

  // Seed: prior customization → admin artwork → auto-placed store logo.
  // Admin constraints harden the layers before the shopper ever sees them.
  const { seedLayers, adminIds, deletableIds } = useMemo(() => {
    const constraints = customization.constraints ?? {};
    const adminLayers: DesignLayer[] = getProductDesign(`store:${store.id}`, product.id)?.layers ?? [];
    const adminIds = new Set(adminLayers.map(l => l.id));
    const deletableIds = new Set(adminLayers.filter(l => (constraints[l.id] ?? 'locked') === 'removable').map(l => l.id));

    if (initial) {
      // resuming an edit — shopper-added layers stay free, admin layers keep their rules
      return {
        seedLayers: initial.layers.map(l => ({ ...l })),
        adminIds,
        deletableIds,
      };
    }

    if (adminLayers.length) {
      return {
        seedLayers: adminLayers.map(l => ({
          ...JSON.parse(JSON.stringify(l)) as DesignLayer,
          locked: (constraints[l.id] ?? 'locked') === 'locked',
        })),
        adminIds,
        deletableIds,
      };
    }

    // no admin artwork — start from the store logo, movable but not deletable
    const logo = makeImageLayerSized('logo', storeLogoSrc(store), `${store.clientName} logo`, PRINTABLE_AREA, 0, 0);
    return { seedLayers: [logo], adminIds: new Set([logo.id]), deletableIds: new Set<string>() };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editor = useDesignEditor({
    productId: product.id,
    canvasWidth: CANVAS_W,
    canvasHeight: CANVAS_H,
    printableArea: PRINTABLE_AREA,
    zoom: 100,
    backgroundColor: null,
    selectedLayerId: null,
    layers: seedLayers,
  });

  const selected = editor.state.layers.find(l => l.id === editor.state.selectedLayerId);
  const canDelete = !!selected && (!adminIds.has(selected.id) || deletableIds.has(selected.id));

  const addText = () => {
    const t = makeTextLayer(PRINTABLE_AREA);
    editor.addLayer({ ...t, text: 'YOUR TEXT', fillColor: '#ffffff', strokeEnabled: true, strokeColor: '#111111', strokeWidth: 1, fontWeight: 'bold' });
  };

  const uploadLogo = async (file: File | null) => {
    if (!file) return;
    const src = await fileToDataUrl(file);
    const { w, h } = await loadImageDimensions(src);
    editor.addLayer(makeImageLayerSized('logo', src, 'Your logo', PRINTABLE_AREA, w, h));
  };

  const summarize = (layers: DesignLayer[]): string => {
    const bits: string[] = [];
    const texts = layers.filter((l): l is TextLayer => l.type === 'text' && !adminIds.has(l.id));
    const uploads = layers.filter(l => l.type !== 'text' && !adminIds.has(l.id));
    if (texts.length) bits.push(`text “${texts[0].text.slice(0, 18)}${texts[0].text.length > 18 ? '…' : ''}”`);
    if (uploads.length) bits.push(`${uploads.length} uploaded logo${uploads.length > 1 ? 's' : ''}`);
    const moved = layers.some(l => adminIds.has(l.id));
    if (!bits.length && moved) bits.push('adjusted artwork');
    return bits.join(' · ') || 'custom artwork';
  };

  const save = async () => {
    setSaving(true);
    editor.selectLayer(null);
    // let the transformer detach before capturing
    await new Promise(r => setTimeout(r, 60));
    let previewDataUrl: string | undefined;
    try {
      const stageUrl = stageRef.current?.toDataURL({ pixelRatio: 1 });
      if (stageUrl) previewDataUrl = await compositePreview(product.image, stageUrl);
    } catch { /* tainted canvas — chip-only fallback */ }
    onSave({
      id: initial?.id ?? `cust-${Date.now().toString(36)}`,
      layers: editor.state.layers,
      previewDataUrl,
      summary: summarize(editor.state.layers),
    });
  };

  const toolBtn = 'flex items-center gap-2 h-10 px-4 text-[12.5px] font-bold transition-opacity hover:opacity-80 disabled:opacity-35';

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div
        className="w-full max-w-3xl max-h-[94vh] overflow-y-auto p-5 md:p-6"
        style={{ background: 'var(--sf-surface)', color: 'var(--sf-ink)', borderRadius: 'calc(var(--sf-radius) * 1.4)', border: '1px solid var(--sf-border)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[18px] font-bold">Customize your {product.name}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:opacity-70"><X className="w-4.5 h-4.5" /></button>
        </div>
        <p className="text-[12px] mb-4" style={{ color: 'var(--sf-sub)' }}>
          Drag to move · handles to resize & rotate · <Lock className="w-3 h-3 inline -mt-0.5" /> locked elements stay put · +{fmtMoney(CUSTOMIZATION_UPCHARGE)}/item
        </p>

        <div className="flex flex-col md:flex-row gap-5">
          {/* Canvas */}
          <div className="flex justify-center shrink-0">
            <div className="scale-[0.82] md:scale-100 origin-top">
              <DesignCanvas
                layers={editor.state.layers}
                selectedLayerId={editor.state.selectedLayerId}
                canvasWidth={CANVAS_W}
                canvasHeight={CANVAS_H}
                printableArea={PRINTABLE_AREA}
                productImage={product.image}
                productColorHex={product.colors[0]?.hex ?? '#f5f8fc'}
                zoom={100}
                backgroundColor={null}
                stageRef={stageRef}
                previewMode
                onSelect={editor.selectLayer}
                onUpdateLayer={editor.updateLayer}
              />
            </div>
          </div>

          {/* Tools */}
          <div className="flex-1 min-w-[220px] space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={addText} className={toolBtn} style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
                <TypeIcon className="w-4 h-4" /> Add text
              </button>
              <button onClick={() => fileRef.current?.click()} className={toolBtn} style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
                <Upload className="w-4 h-4" /> Your logo
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { uploadLogo(e.target.files?.[0] ?? null); e.target.value = ''; }} />

            {/* Selected text controls */}
            {selected?.type === 'text' && (
              <div className="p-3 space-y-2.5" style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
                <div className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--sf-sub)' }}>Text</div>
                <input
                  value={(selected as TextLayer).text}
                  onChange={e => editor.updateTextLayer(selected.id, { text: e.target.value })}
                  className="w-full h-10 px-3 text-[13px] font-bold bg-transparent outline-none"
                  style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'calc(var(--sf-radius)/1.2)', color: 'var(--sf-ink)' }}
                />
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={(selected as TextLayer).fillColor}
                    onChange={e => editor.updateTextLayer(selected.id, { fillColor: e.target.value })}
                    className="w-9 h-9 rounded-md border cursor-pointer p-0.5"
                    style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-surface)' }}
                  />
                  <input
                    type="range" min={12} max={64}
                    value={(selected as TextLayer).fontSize}
                    onChange={e => editor.updateTextLayer(selected.id, { fontSize: Number(e.target.value) })}
                    className="flex-1"
                    style={{ accentColor: 'var(--sf-primary)' }}
                  />
                  <span className="text-[11px] font-bold w-8 text-right" style={{ color: 'var(--sf-sub)' }}>{(selected as TextLayer).fontSize}px</span>
                </div>
              </div>
            )}

            {selected && (
              <button
                disabled={!canDelete}
                onClick={() => editor.deleteLayer(selected.id)}
                className={`${toolBtn} w-full justify-center`}
                style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', color: canDelete ? '#dc2626' : 'var(--sf-sub)' }}
                title={canDelete ? 'Remove this element' : 'This element can’t be removed'}
              >
                {canDelete ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {canDelete ? 'Remove element' : 'Locked by the store'}
              </button>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button disabled={!editor.canUndo} onClick={editor.undo} className={toolBtn} style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
                <RotateCcw className="w-3.5 h-3.5" /> Undo
              </button>
            </div>

            <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--sf-border)' }}>
              <button
                onClick={save}
                disabled={saving}
                className="w-full h-12 font-bold text-[14px] flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ background: 'var(--sf-primary)', color: 'var(--sf-primary-ink)', borderRadius: 'var(--sf-radius)' }}
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : `Save customization (+${fmtMoney(CUSTOMIZATION_UPCHARGE)}/item)`}
              </button>
              <button onClick={onClose} className="w-full h-10 text-[12.5px] font-bold hover:opacity-70" style={{ color: 'var(--sf-sub)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
