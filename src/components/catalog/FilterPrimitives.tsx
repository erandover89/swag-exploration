import { ChevronDown, ChevronUp } from 'lucide-react';

// Shared filter UI — extracted from SwagCatalog so the Stores admin can reuse
// the same Catalog filtering experience.

export function FilterSection({ title, expanded, onToggle, children }: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-snp-navy-100 pb-2">
      <button
        className="flex items-center justify-between w-full py-2 text-[10px] font-bold text-snp-navy-950 uppercase tracking-widest"
        onClick={onToggle}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
        {expanded ? <ChevronUp className="w-4 h-4 text-snp-navy-500" /> : <ChevronDown className="w-4 h-4 text-snp-navy-500" />}
      </button>
      {expanded && children}
    </div>
  );
}

export function CheckboxRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <label
      className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors rounded-lg ${checked ? 'bg-snp-indigo-50' : 'hover:bg-snp-navy-50'}`}
    >
      <div
        onClick={onToggle}
        className={`w-5 h-5 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'bg-white border-snp-navy-300'}`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span
        className={`text-[14px] font-medium transition-colors ${checked ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}
        onClick={onToggle}
      >
        {label}
      </span>
    </label>
  );
}
