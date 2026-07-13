import { useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { LOGO_ASSETS, type AssetItem } from './types';

interface Props {
  onSelect: (asset: AssetItem) => void;
  onUpload: (src: string, name: string) => void;
  onClose: () => void;
}

export function LogoPickerModal({ onSelect, onUpload, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      onUpload(src, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className="absolute left-[calc(100%+12px)] top-0 z-50 bg-white rounded-[20px] shadow-[0px_16px_48px_rgba(1,39,84,0.18)] border border-snp-navy-200 w-64"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#f0f4f8]">
        <span className="text-[14px] font-bold text-snp-navy-950">Logo</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-snp-navy-50 text-snp-navy-500 hover:text-snp-navy-950 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Logo grid */}
      <div className="p-3 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
        {LOGO_ASSETS.map(asset => (
          <button
            key={asset.id}
            onClick={() => onSelect(asset)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-[12px] border border-snp-navy-200 hover:border-snp-indigo-600 hover:bg-snp-indigo-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-[10px] bg-snp-navy-50 flex items-center justify-center overflow-hidden">
              <img src={asset.src} alt={asset.name} className="w-10 h-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className="text-[10px] font-medium text-snp-navy-600 group-hover:text-snp-indigo-600 transition-colors text-center leading-tight line-clamp-1">
              {asset.name}
            </span>
          </button>
        ))}
      </div>

      {/* Upload */}
      <div className="px-3 pb-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-[10px] border-2 border-dashed border-[#c7d7f4] text-snp-indigo-600 text-[12px] font-semibold hover:bg-[#eef6ff] transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload new
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
