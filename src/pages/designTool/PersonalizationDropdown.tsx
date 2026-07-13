import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { PERSONALIZATION_OPTIONS, PERSONALIZATION_SAMPLE_DATA, type PersonalizationOption } from './types';

interface Props {
  value: string | null;
  onChange: (option: PersonalizationOption | null) => void;
}

const GROUPS = Array.from(new Set(PERSONALIZATION_OPTIONS.map(o => o.group)));

export function PersonalizationDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = PERSONALIZATION_OPTIONS.find(o => o.key === value) ?? null;

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
        className={`w-full flex items-center justify-between px-2.5 h-8 rounded-[8px] border text-[11px] font-medium transition-colors ${
          value
            ? 'border-snp-purple-700 bg-snp-purple-100 text-snp-purple-700'
            : 'border-snp-navy-200 bg-snp-navy-50 text-snp-navy-500 hover:border-snp-navy-300'
        }`}
      >
        <span className="truncate flex-1">{selected?.label ?? 'None (static text)'}</span>
        {selected && PERSONALIZATION_SAMPLE_DATA[selected.key] && (
          <span className="text-[9px] text-snp-purple-400 font-semibold shrink-0 mx-1">
            → {PERSONALIZATION_SAMPLE_DATA[selected.key]}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-[12px] shadow-[0px_8px_32px_rgba(1,39,84,0.18)] border border-snp-navy-200 z-50 max-h-52 overflow-y-auto">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full px-3 py-2 text-left text-[11px] text-snp-navy-500 hover:bg-snp-navy-50 transition-colors border-b border-[#f0f4f8]"
          >
            — None (static text)
          </button>
          {GROUPS.map(group => (
            <div key={group}>
              <p className="px-3 pt-2 pb-1 text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest">
                {group}
              </p>
              {PERSONALIZATION_OPTIONS.filter(o => o.group === group).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-[11px] transition-colors hover:bg-snp-navy-50 ${
                    value === opt.key ? 'text-snp-purple-700 font-semibold' : 'text-snp-navy-700 font-medium'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[9px] text-snp-purple-400 font-semibold shrink-0">
                    → {PERSONALIZATION_SAMPLE_DATA[opt.key] ?? opt.placeholder}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
