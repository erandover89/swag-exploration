import { useState, useRef } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { fetchLogoForDomain } from './LogoInput';

interface Props {
  currentLogoUrl?: string | null;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function ReplaceLogoModal({ onSelect, onClose }: Props) {
  const [domain, setDomain] = useState('');
  const [fetching, setFetching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleDomainFetch() {
    if (!domain.trim() || fetching) return;
    setFetching(true);
    try {
      const url = await fetchLogoForDomain(domain);
      onSelect(url);
    } finally {
      setFetching(false);
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = evt => onSelect(evt.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col overflow-hidden rounded-[16px] shadow-[0px_16px_24px_0px_rgba(1,39,84,0.16)] border border-[#e0ebf7] w-[400px] mx-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white flex gap-4 items-start min-h-[85px] pb-2 pl-6 pr-3 pt-3">
          <div className="flex-1 flex flex-col gap-4 justify-center py-3 min-w-0">
            <p className="text-[20px] font-black text-[#012754] leading-normal" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Add new logo
            </p>
            <p className="text-[14px] text-[#59728f] leading-[1.5]">
              Fetch, upload or choose from existing logos
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full border border-[#e0ebf7] bg-white flex items-center justify-center hover:bg-[#f5f8fc] transition-colors mt-1"
          >
            <X className="w-4 h-4 text-[#59728f]" />
          </button>
        </div>

        {/* Body */}
        <div className="bg-[#fbfcfe] flex flex-col items-start w-full">
          <div className="flex flex-col gap-6 items-center pb-10 pt-0 px-6 w-full">
            {/* Divider line */}
            <div className="w-full h-px bg-[#e0ebf7]" />

            {/* URL Fetch */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-1">
                <span className="text-[#8093a9]" style={{ fontSize: 13 }}>✦</span>
                <span className="text-[12px] font-bold text-[#8093a9] uppercase tracking-wider">Magic Fetch from URL</span>
              </div>
              <div className="bg-white border border-[#e0ebf7] rounded-[12px] h-[65px] flex items-center justify-between px-4 w-full">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <input
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDomainFetch()}
                    placeholder="yourcompany.com"
                    className="flex-1 text-[14px] text-[#012754] bg-transparent outline-none placeholder:text-[#012754]/30 min-w-0"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleDomainFetch}
                  disabled={!domain.trim() || fetching}
                  className="h-9 px-3 rounded-[8px] bg-[#3077c9] text-white text-[14px] font-medium flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
                >
                  {fetching
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : 'Fetch logo'}
                </button>
              </div>
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-6 w-full">
              <div className="flex-1 h-px bg-[#e0ebf7]" />
              <span className="text-[12px] font-bold text-[#8093a9] uppercase">Or</span>
              <div className="flex-1 h-px bg-[#e0ebf7]" />
            </div>

            {/* File upload drop zone */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,image/svg+xml"
              className="hidden"
              onChange={handleFileInput}
            />
            <div
              className="bg-white border border-dashed rounded-[12px] flex flex-col items-center justify-center gap-2 px-4 py-12 w-full cursor-pointer transition-colors"
              style={{ borderColor: dragging ? '#3077c9' : '#e0ebf7', background: dragging ? '#f0f4ff' : 'white' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-5 h-5 text-[#8093a9]" />
              <div className="text-center text-[14px]">
                <p className="text-[#59728f]">Drag &amp; drop your logo here</p>
                <p className="text-[#3077c9] underline decoration-solid underline-offset-2">Browse files</p>
              </div>
            </div>
          </div>

          {/* Requirements footer */}
          <div className="bg-[#f5f8fc] w-full flex items-center justify-center py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-center">
              <span className="text-[#a6b3c3]">Recommended requirements: </span>
              <span className="text-[#59728f]">.PNG 1500x1500px or SVG</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
