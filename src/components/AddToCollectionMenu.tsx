import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, FolderHeart, Check } from 'lucide-react';

// Mock existing collections shown in the menu
const MOCK_COLLECTIONS = [
  { id: 'mc1', name: 'New Hire Welcome Kit',   count: 4 },
  { id: 'mc2', name: 'Holiday Team Gift 2024', count: 7 },
  { id: 'mc3', name: 'Sales Q4 Kickoff',       count: 3 },
];

interface AddToCollectionMenuProps {
  /** The button/element that opens the menu */
  trigger: React.ReactNode;
  /** Alignment of the dropdown: 'left' (default) or 'right' */
  align?: 'left' | 'right';
  /** Open upward instead of downward (use when card has overflow-hidden) */
  dropUp?: boolean;
  /** Product ID to pre-seed into a newly created collection */
  productId?: string;
  /** Multiple product IDs to pre-seed (used for bulk-select flows) */
  productIds?: string[];
}

export function AddToCollectionMenu({ trigger, align = 'left', dropUp = false, productId, productIds }: AddToCollectionMenuProps) {
  const [open, setOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleAdd = (collectionId: string) => {
    setJustAdded(collectionId);
    setTimeout(() => { setOpen(false); setJustAdded(null); }, 900);
  };

  return (
    <div className="relative" ref={containerRef} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Trigger — clicking opens/closes menu */}
      <div onClick={e => { e.stopPropagation(); setOpen(v => !v); }}>
        {trigger}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute bg-white rounded-[16px] border border-snp-navy-200 shadow-[0px_8px_32px_rgba(1,39,84,0.14)] w-[230px] z-[200] overflow-hidden ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-[10px] font-bold text-snp-navy-500 uppercase tracking-widest">
              Add to collection
            </p>
          </div>

          {/* Existing collections */}
          {MOCK_COLLECTIONS.map(col => {
            const isAdded = justAdded === col.id;
            return (
              <button
                key={col.id}
                onClick={() => handleAdd(col.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-snp-navy-50 transition-colors text-left"
              >
                <div
                  className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{ background: isAdded ? '#22c55e' : 'var(--snp-navy-100)' }}
                >
                  {isAdded
                    ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    : <FolderHeart className="w-3 h-3 text-snp-indigo-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-snp-navy-950 truncate leading-snug">
                    {col.name}
                  </p>
                  <p className="text-[10px] text-snp-navy-400">{col.count} items</p>
                </div>
                {isAdded && (
                  <span className="text-[10px] text-[#22c55e] font-semibold shrink-0">Added!</span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="mx-3 my-1 h-px bg-snp-navy-200" />

          {/* Create new */}
          <button
            onClick={() => {
              const ids = productIds ?? (productId ? [productId] : []);
              setOpen(false);
              navigate('/collection/edit', { state: { productIds: ids, from: location.pathname } });
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 pb-3 hover:bg-snp-navy-50 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-[6px] bg-snp-indigo-600 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[13px] font-semibold text-snp-indigo-600">Create New Collection</p>
          </button>
        </div>
      )}
    </div>
  );
}
