import { GripVertical, Eye, EyeOff, Copy, Trash2, Type, Lock, Unlock } from 'lucide-react';
import { type DesignLayer, type ImageLayer, type TextLayer } from './types';

interface Props {
  layer: DesignLayer;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisible: () => void;
  onUpdateLayer: (id: string, patch: Partial<DesignLayer>) => void;
}

export function LayerCard({
  layer, isSelected, onSelect, onDelete, onDuplicate, onToggleVisible, onUpdateLayer,
}: Props) {
  const isImg = layer.type === 'logo' || layer.type === 'graphic';
  const isText = layer.type === 'text';

  return (
    <div
      className={`rounded-[10px] border transition-all ${
        isSelected
          ? 'border-snp-indigo-600 bg-snp-indigo-50'
          : 'border-[#e8eef5] bg-white hover:border-snp-navy-300'
      }`}
    >
      <div
        className="flex items-center gap-2 px-2.5 py-2 cursor-pointer select-none"
        onClick={onSelect}
      >
        <GripVertical className="w-3 h-3 text-[#c5d5e8] shrink-0 cursor-grab" />

        {/* Thumbnail */}
        <div className="w-8 h-8 rounded-[6px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center overflow-hidden shrink-0">
          {isImg ? (
            <img
              src={(layer as ImageLayer).src}
              alt={layer.name}
              className="w-full h-full object-contain p-0.5"
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
            />
          ) : (
            <Type className="w-3.5 h-3.5 text-snp-navy-500" />
          )}
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-snp-navy-950 truncate leading-tight">
            {layer.name}
            {isText && (layer as TextLayer).isPersonalized && (
              <span className="ml-1 text-[8px] font-bold text-snp-purple-700 bg-snp-purple-100 px-1 py-0.5 rounded-[3px] align-middle">P</span>
            )}
          </p>
          <p className="text-[9px] text-snp-navy-400 capitalize leading-tight">{layer.type}</p>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
          <button
            onClick={e => { e.stopPropagation(); onToggleVisible(); }}
            title={layer.visible ? 'Hide' : 'Show'}
            className="w-6 h-6 flex items-center justify-center rounded-[5px] text-snp-navy-400 hover:text-snp-navy-700 hover:bg-white/60 transition-colors"
          >
            {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }}
            title={layer.locked ? 'Unlock' : 'Lock'}
            className={`w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors ${
              layer.locked
                ? 'text-snp-indigo-600 bg-snp-indigo-50'
                : 'text-snp-navy-400 hover:text-snp-navy-700 hover:bg-white/60'
            }`}
          >
            {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate"
            className="w-6 h-6 flex items-center justify-center rounded-[5px] text-snp-navy-400 hover:text-snp-navy-700 hover:bg-white/60 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="w-6 h-6 flex items-center justify-center rounded-[5px] text-snp-navy-400 hover:text-[#e63946] hover:bg-[#fff5f5] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
