import { useState, useEffect, useRef } from 'react';
import { Store, Check } from 'lucide-react';
import { STORES } from '../data/mockData';

interface AddToStoreMenuProps {
  trigger: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  dropUp?: boolean;
}

export function AddToStoreMenu({ trigger, align = 'left', dropUp = false }: AddToStoreMenuProps) {
  const [open, setOpen]         = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(v => !v);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function handleAdd(storeId: string) {
    setJustAdded(storeId);
    setTimeout(() => { setOpen(false); setJustAdded(null); }, 900);
  }

  const alignClass = align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

  return (
    <div className="relative" ref={containerRef} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div onClick={handleTriggerClick}>
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute bg-white rounded-[16px] border border-snp-navy-200 shadow-[0px_8px_32px_rgba(1,39,84,0.14)] w-[240px] z-[200] overflow-hidden ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${alignClass}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-[10px] font-bold text-snp-navy-500 uppercase tracking-widest">
              Add to store
            </p>
          </div>

          {/* Existing stores or empty state */}
          {STORES.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <Store className="w-6 h-6 text-snp-navy-300 mx-auto mb-2" />
              <p className="text-[12px] font-medium text-snp-navy-500">No stores yet</p>
              <p className="text-[11px] text-snp-navy-400 mt-0.5">Create a store from the Stores page</p>
            </div>
          ) : (
            STORES.map(store => {
              const isAdded = justAdded === store.id;
              return (
                <button
                  key={store.id}
                  onClick={() => handleAdd(store.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-snp-navy-50 transition-colors text-left"
                >
                  <div
                    className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{ background: isAdded ? '#22c55e' : 'var(--snp-navy-100)' }}
                  >
                    {isAdded
                      ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      : <Store className="w-3 h-3 text-snp-indigo-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-snp-navy-950 truncate leading-snug">
                      {store.name}
                    </p>
                    <p className="text-[10px] text-snp-navy-400">
                      {store.productCount} products · {store.status === 'live' ? '🟢 Live' : '⚪ Draft'}
                    </p>
                  </div>
                  {isAdded && (
                    <span className="text-[10px] text-[#22c55e] font-semibold shrink-0">Added!</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
