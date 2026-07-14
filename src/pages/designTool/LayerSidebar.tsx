import { useState, useRef } from 'react';
import { Plus, Type, ImageIcon, Sparkles, Upload, X } from 'lucide-react';
import {
  LOGO_ASSETS, GRAPHIC_ASSETS,
  loadImageDimensions, makeImageLayerSized, makeTextLayer,
  type DesignLayer, type PrintableArea, type AssetItem,
} from './types';
import { LayerCard } from './LayerCard';

interface Props {
  layers: DesignLayer[];
  selectedLayerId: string | null;
  printableArea: PrintableArea;
  backgroundColor: string | null;
  /** override the logo picker's asset library (e.g. a store's uploaded logos) */
  logoAssets?: AssetItem[];
  onSelect: (id: string | null) => void;
  onAdd: (layer: DesignLayer) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<DesignLayer>) => void;
  onSetBackgroundColor: (color: string | null) => void;
}

type PickerType = 'logo' | 'graphic' | null;

export function LayerSidebar({
  layers, selectedLayerId, printableArea, backgroundColor, logoAssets,
  onSelect, onAdd, onDelete, onDuplicate, onUpdateLayer, onSetBackgroundColor,
}: Props) {
  const [openPicker, setOpenPicker] = useState<PickerType>(null);
  const [graphicTab, setGraphicTab] = useState<'ai' | 'uploads'>('ai');
  const [userUploads, setUserUploads] = useState<AssetItem[]>([]);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const addAsset = async (type: 'logo' | 'graphic', asset: AssetItem) => {
    setOpenPicker(null);
    const { w, h } = await loadImageDimensions(asset.src);
    onAdd(makeImageLayerSized(type, asset.src, asset.name, printableArea, w, h));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = openPicker ?? 'logo';
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const name = file.name.replace(/\.[^/.]+$/, '');
      const asset: AssetItem = { id: `upload-${Date.now()}`, name, src };
      if (type === 'graphic') setUserUploads(prev => [asset, ...prev]);
      addAsset(type, asset);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Display in reverse z-order (top of list = highest z)
  const displayLayers = [...layers].reverse();

  return (
    <div className="w-[260px] bg-white border-r border-snp-navy-200 flex flex-col shrink-0">

      {/* ── Add-layer controls ── */}
      <div className="px-4 pt-4 pb-4 shrink-0" style={{ background: '#f5f8fc', borderBottom: '1px solid #e0ebf7' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">Add Layer</span>
        </div>

        <div className="flex gap-1.5">
          {([
            { id: 'logo' as PickerType,    label: 'Logo'    },
            { id: 'graphic' as PickerType, label: 'Graphic' },
          ]).map(btn => (
            <button
              key={btn.id}
              onClick={() => setOpenPicker(openPicker === btn.id ? null : btn.id)}
              className={`flex-1 h-8 rounded-[8px] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                openPicker === btn.id
                  ? 'bg-snp-indigo-600 text-white shadow-sm'
                  : 'border border-snp-navy-200 text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600'
              }`}
            >
              <Plus className="w-3 h-3" />
              {btn.label}
            </button>
          ))}
          <button
            onClick={() => { onAdd(makeTextLayer(printableArea)); setOpenPicker(null); }}
            className="flex-1 h-8 rounded-[8px] border border-snp-navy-200 text-[11px] font-semibold text-snp-navy-600 flex items-center justify-center gap-1 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-all"
          >
            <Type className="w-3 h-3" />
            Text
          </button>
        </div>

        {/* Personalization button */}
        <button
          onClick={() => { onAdd(makeTextLayer(printableArea)); setOpenPicker(null); }}
          className="mt-1.5 w-full h-8 rounded-[8px] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, var(--snp-purple-700) 0%, var(--snp-indigo-600) 100%)' }}
        >
          <Sparkles className="w-3 h-3" />
          Add Personalization
        </button>
      </div>

      {/* ── Inline Logo Picker ── */}
      {openPicker === 'logo' && (
        <div className="mx-3 mb-3 border border-snp-navy-200 rounded-[12px] overflow-hidden shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#f0f4f8]">
            <span className="text-[11px] font-bold text-snp-navy-950">Choose logo</span>
            <button onClick={() => setOpenPicker(null)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-snp-navy-50 text-snp-navy-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2 grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto">
            {(logoAssets ?? LOGO_ASSETS).map(asset => (
              <button
                key={asset.id}
                onClick={() => addAsset('logo', asset)}
                className="flex flex-col items-center gap-1 p-1.5 rounded-[8px] border border-snp-navy-200 hover:border-snp-indigo-600 hover:bg-snp-indigo-50 transition-all"
              >
                <div className="w-10 h-10 rounded-[6px] bg-snp-navy-50 flex items-center justify-center overflow-hidden">
                  <img src={asset.src} alt={asset.name} className="w-9 h-9 object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <span className="text-[9px] font-medium text-snp-navy-600 text-center leading-tight line-clamp-1 w-full">
                  {asset.name}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 h-8 border-t border-[#f0f4f8] text-[11px] font-semibold text-snp-indigo-600 hover:bg-[#eef6ff] transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload your logo
          </button>
        </div>
      )}

      {/* ── Inline Graphic Picker ── */}
      {openPicker === 'graphic' && (
        <div className="mx-3 mb-3 border border-snp-navy-200 rounded-[12px] overflow-hidden shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#f0f4f8]">
            <span className="text-[11px] font-bold text-snp-navy-950">Choose graphic</span>
            <button onClick={() => setOpenPicker(null)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-snp-navy-50 text-snp-navy-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1 px-2 pt-2">
            {([
              { id: 'ai' as const, label: 'AI designs' },
              { id: 'uploads' as const, label: 'Your uploads' },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setGraphicTab(t.id)}
                className={`flex-1 h-7 rounded-[6px] text-[10px] font-semibold transition-colors ${
                  graphicTab === t.id ? 'bg-snp-indigo-600 text-white' : 'bg-snp-navy-50 text-snp-navy-600 hover:bg-[#e8f0fc]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-2 grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
            {(graphicTab === 'ai' ? GRAPHIC_ASSETS : userUploads).map(asset => (
              <button
                key={asset.id}
                onClick={() => addAsset('graphic', asset)}
                className="flex flex-col items-center gap-1 p-1.5 rounded-[8px] border border-snp-navy-200 hover:border-snp-indigo-600 hover:bg-snp-indigo-50 transition-all"
              >
                <div className="w-10 h-10 rounded-[6px] bg-snp-navy-50 flex items-center justify-center overflow-hidden">
                  <img src={asset.src} alt={asset.name} className="w-9 h-9 object-contain" />
                </div>
                <span className="text-[9px] font-medium text-snp-navy-600 text-center leading-tight line-clamp-1 w-full">
                  {asset.name}
                </span>
              </button>
            ))}
            {graphicTab === 'uploads' && userUploads.length === 0 && (
              <div className="col-span-3 py-4 flex flex-col items-center gap-1.5 text-snp-navy-400">
                <ImageIcon className="w-5 h-5" />
                <span className="text-[10px]">No uploads yet</span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 h-8 border-t border-[#f0f4f8] text-[11px] font-semibold text-snp-indigo-600 hover:bg-[#eef6ff] transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload graphic
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* ── Canvas section ── */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #e0ebf7' }}>
        <button
          onClick={() => setCanvasOpen(o => !o)}
          className="w-full flex items-center justify-between transition-colors"
        >
          <span className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">Canvas</span>
          <span className="text-[9px] text-snp-navy-400">{canvasOpen ? '▲' : '▼'}</span>
        </button>

        {canvasOpen && (
          <div className="mt-2.5 px-3 py-2 rounded-[10px] border border-snp-navy-100 bg-snp-navy-50 flex items-center gap-3">
            <span className="text-[10px] font-semibold text-snp-navy-600 shrink-0">Background</span>
            <div className="flex items-center gap-2">
              <button
                title="Pick background color"
                onClick={() => colorInputRef.current?.click()}
                className="w-6 h-6 rounded-[4px] border-2 border-snp-navy-200 hover:border-snp-indigo-600 transition-colors shrink-0 overflow-hidden"
                style={{ backgroundColor: backgroundColor ?? '#ffffff' }}
              />
              <input
                ref={colorInputRef}
                type="color"
                value={backgroundColor ?? '#ffffff'}
                onChange={e => onSetBackgroundColor(e.target.value)}
                className="sr-only"
              />
              {backgroundColor ? (
                <button
                  onClick={() => onSetBackgroundColor(null)}
                  className="text-[10px] font-medium text-snp-navy-400 hover:text-[#e63946] transition-colors"
                >
                  None
                </button>
              ) : (
                <span className="text-[10px] text-snp-navy-400">None</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Layer list header ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <span className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">Layers</span>
        <span className="text-[9px] font-bold text-snp-navy-400 bg-snp-navy-100 rounded-[4px] px-1.5 py-0.5">
          {layers.length}
        </span>
      </div>

      {/* ── Layer list ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {layers.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-snp-navy-300">
            <ImageIcon className="w-7 h-7" />
            <p className="text-[11px] text-center leading-snug text-snp-navy-400">
              Add a logo, graphic,<br />or text to get started
            </p>
          </div>
        ) : (
          displayLayers.map(layer => (
            <LayerCard
              key={layer.id}
              layer={layer}
              isSelected={layer.id === selectedLayerId}
              onSelect={() => onSelect(layer.id === selectedLayerId ? null : layer.id)}
              onDelete={() => onDelete(layer.id)}
              onDuplicate={() => onDuplicate(layer.id)}
              onToggleVisible={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
              onUpdateLayer={onUpdateLayer}
            />
          ))
        )}
      </div>
    </div>
  );
}
