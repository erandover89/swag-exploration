import { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import { PRODUCTS, PRINT_TECHNIQUE_CHIPS, type ProductCategory } from '../data/mockData';

const ALL_CATEGORIES: ProductCategory[] = ['Apparel', 'Electronics', 'Home & Decor', 'Drinkware', 'Bags', 'Accessories', 'Outdoor'];

interface ProductPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  currentProductIds: string[];
  onAdd: (productIds: string[]) => void;
}

export function ProductPickerDrawer({ open, onClose, currentProductIds, onAdd }: ProductPickerDrawerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => p.type !== 'bulk');
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    return list;
  }, [search, selectedCategory]);

  function toggleSelect(id: string) {
    if (currentProductIds.includes(id)) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    onAdd(Array.from(selected));
    setSelected(new Set());
    onClose();
  }

  function handleClose() {
    setSelected(new Set());
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width: 'min(85vw, 1100px)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-12 py-8 border-b border-[#e0ebf7] shrink-0">
          <div className="flex flex-col gap-1">
            <h2
              className="text-[40px] font-semibold leading-tight text-[#012754]"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Select Swag Items
            </h2>
            <p className="text-[14px] text-[#59728f]">Choose products to add to this design</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="h-12 px-6 rounded-[8px] text-white text-[14px] font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ background: '#3077c9', boxShadow: '0px 4px 8px rgba(1,39,84,0.08)' }}
            >
              Add {selected.size > 0 ? selected.size : ''} item{selected.size !== 1 ? 's' : ''}
            </button>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full border border-[#e0ebf7] flex items-center justify-center text-[#59728f] hover:bg-[#f5f8fc] transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 min-h-0">

          {/* Left sidebar — categories */}
          <div className="w-[260px] shrink-0 border-r border-[#e0ebf7] overflow-y-auto py-8 px-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#8093a9] mb-3">Category</p>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-[8px] text-[14px] transition-colors ${
                  selectedCategory === null
                    ? 'bg-[#eef4ff] text-[#2864a8] font-semibold'
                    : 'text-[#59728f] hover:bg-[#f5f8fc]'
                }`}
              >
                All Products
              </button>
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`w-full text-left px-3 py-2 rounded-[8px] text-[14px] transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#eef4ff] text-[#2864a8] font-semibold'
                      : 'text-[#59728f] hover:bg-[#f5f8fc]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right: search + grid */}
          <div className="flex flex-col flex-1 min-w-0">

            {/* Filter bar */}
            <div className="bg-[#fbfcfe] border-b border-[#e0ebf7] px-10 py-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8093a9]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search product by name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-[52px] pl-11 pr-4 rounded-full border border-[#e0ebf7] bg-[#fbfcfe] text-[14px] text-[#012754] placeholder-[#8093a9] outline-none focus:border-[#78a7dc] transition-colors"
                />
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto px-10 py-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="w-10 h-10 text-[#c0cdd9] mb-3" />
                  <p className="text-[15px] font-medium text-[#59728f]">No products found</p>
                  <p className="text-[13px] text-[#8093a9]">Try adjusting your search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {filtered.map(product => {
                    const alreadyAdded = currentProductIds.includes(product.id);
                    const isSelected = selected.has(product.id);
                    const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
                    const isPhoto = product.image.startsWith('/');

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleSelect(product.id)}
                        className={`flex flex-col gap-3 cursor-pointer ${alreadyAdded ? 'opacity-40 cursor-default' : ''}`}
                      >
                        {/* Image area */}
                        <div
                          className="relative bg-[#f5f8fc] rounded-[16px] overflow-hidden flex items-center justify-center py-[72px] px-8"
                          style={{
                            border: isSelected ? '1.5px solid #78a7dc' : '1.5px solid transparent',
                            boxShadow: 'inset 0px 4px 24px rgba(1,39,84,0.04)',
                          }}
                        >
                          {isPhoto ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-[186px] w-auto max-w-full object-contain"
                              style={{ mixBlendMode: 'multiply' }}
                            />
                          ) : (
                            <span className="text-[80px]">{product.image}</span>
                          )}

                          {/* Print technique pill — top left */}
                          {chip && (
                            <div className="absolute top-[7px] left-[7px] bg-[#fbfcfe] rounded-[8px] h-8 px-2 flex items-center">
                              <span className="text-[11px] font-bold uppercase text-[#2864a8]">{chip.label}</span>
                            </div>
                          )}

                          {/* Checkbox — top right */}
                          <div
                            className="absolute top-[15px] right-[15px] w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors shrink-0"
                            style={{
                              background: isSelected || alreadyAdded ? '#3077c9' : 'white',
                              border: isSelected || alreadyAdded ? '1px solid #3077c9' : '1px solid #e0ebf7',
                            }}
                          >
                            {(isSelected || alreadyAdded) && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>

                        {/* Product info */}
                        <div className="flex flex-col gap-1.5 px-1">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[12px] font-bold uppercase tracking-wide text-[#012754] truncate">{product.brand}</p>
                            <p className="text-[14px] text-[#59728f] leading-snug line-clamp-2">{product.name}</p>
                          </div>
                          <p className="text-[14px] font-medium text-[#012754]">${product.price.toFixed(2)}</p>
                          {product.colors.length > 1 && (
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#3077c9]">+ More Options Available</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
