import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { retailPrice, storeCategories, visibleProducts } from '../data/storesData';
import { useSf } from './StorefrontShell';
import { ProductCardSf } from './StorefrontHome';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

export function StorefrontShop() {
  const { store, theme } = useSf();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const cat = params.get('cat') ?? '';
  const [sort, setSort] = useState<SortKey>('featured');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [sizeFilter, setSizeFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');

  const products = visibleProducts(store);
  const cats = storeCategories(store);

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);

  const allColors = useMemo(() => {
    const seen = new Map<string, string>();
    products.forEach(p => p.colors.forEach(c => { if (!seen.has(c.name)) seen.set(c.name, c.hex); }));
    return [...seen.entries()].slice(0, 12);
  }, [products]);

  const allSizes = useMemo(
    () => [...new Set(products.flatMap(p => p.sizes))].filter(s => s !== 'One Size').slice(0, 8),
    [products],
  );

  const filtered = useMemo(() => {
    let list = products;
    if (cat) list = list.filter(p => p.category === cat);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) || p.colors.some(c => c.name.toLowerCase().includes(needle)));
    }
    if (colorFilter) list = list.filter(p => p.colors.some(c => c.name === colorFilter));
    if (sizeFilter) list = list.filter(p => p.sizes.includes(sizeFilter));
    if (brandFilter) list = list.filter(p => p.brand === brandFilter);
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return retailPrice(store, a) - retailPrice(store, b);
      if (sort === 'price-desc') return retailPrice(store, b) - retailPrice(store, a);
      if (sort === 'name') return a.name.localeCompare(b.name);
      const fa = store.featuredIds.includes(a.id) ? 0 : 1;
      const fb = store.featuredIds.includes(b.id) ? 0 : 1;
      return fa - fb;
    });
  }, [products, cat, q, colorFilter, sizeFilter, brandFilter, sort, store]);

  // Admin-defined storefront organization (Products tab) — sections render only
  // on the unfiltered default view; any search/filter/sort falls back to a flat grid.
  const sections = useMemo(() => {
    const mode = store.catalogLayout.mode;
    const pristine = mode !== 'manual' && !q && !cat && !colorFilter && !sizeFilter && !brandFilter && sort === 'featured';
    if (!pristine) return null;
    if (mode === 'category') {
      return [...new Set(filtered.map(p => p.category))].map(c => ({
        id: c as string, label: c as string, items: filtered.filter(p => p.category === c),
      }));
    }
    if (mode === 'brand') {
      return [...new Set(filtered.map(p => p.brand))].sort().map(b => ({
        id: b, label: b, items: filtered.filter(p => p.brand === b),
      }));
    }
    // custom groups
    const groups = store.catalogLayout.groups;
    if (!groups.length) return null;
    const grouped = new Set(groups.flatMap(g => g.productIds));
    const named = groups
      .map(g => ({ id: g.id, label: g.label, items: g.productIds.map(id => filtered.find(p => p.id === id)).filter((p): p is typeof filtered[number] => !!p) }))
      .filter(g => g.items.length);
    const rest = filtered.filter(p => !grouped.has(p.id));
    return rest.length ? [...named, { id: '__rest__', label: 'More gear', items: rest }] : named;
  }, [store.catalogLayout, filtered, q, cat, colorFilter, sizeFilter, brandFilter, sort]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const chip = (active: boolean) =>
    `h-9 px-4 text-[12.5px] font-bold transition-colors ${active ? '' : 'hover:opacity-70'}`;

  return (
    <div className="max-w-[1240px] mx-auto px-5 md:px-10 pt-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[34px] leading-tight" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
            {cat || 'Shop all'}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--sf-sub)' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}{q && <> matching “<b>{q}</b>”</>}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 h-11" style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', background: 'var(--sf-surface)' }}>
            <Search className="w-4 h-4" style={{ color: 'var(--sf-sub)' }} />
            <input
              value={q}
              onChange={e => setParam('q', e.target.value)}
              placeholder="Search name, brand, color…"
              className="bg-transparent outline-none text-[13px] w-48"
              style={{ color: 'var(--sf-ink)' }}
            />
            {q && <button onClick={() => setParam('q', '')}><X className="w-3.5 h-3.5" style={{ color: 'var(--sf-sub)' }} /></button>}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="h-11 px-3 text-[12.5px] font-bold outline-none"
            style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', background: 'var(--sf-surface)', color: 'var(--sf-ink)' }}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button
          onClick={() => setParam('cat', '')}
          className={chip(!cat)}
          style={{ background: !cat ? 'var(--sf-ink)' : 'var(--sf-surface)', color: !cat ? 'var(--sf-bg)' : 'var(--sf-ink)', border: '1.5px solid var(--sf-border)', borderRadius: '999px' }}
        >
          All
        </button>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setParam('cat', c === cat ? '' : c)}
            className={chip(cat === c)}
            style={{ background: cat === c ? 'var(--sf-ink)' : 'var(--sf-surface)', color: cat === c ? 'var(--sf-bg)' : 'var(--sf-ink)', border: '1.5px solid var(--sf-border)', borderRadius: '999px' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Facets */}
      <div className="flex items-center gap-5 flex-wrap mb-8 text-[12.5px]" style={{ color: 'var(--sf-sub)' }}>
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px]">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
        </span>
        <div className="flex items-center gap-1.5">
          {allColors.map(([name, hex]) => (
            <button
              key={name}
              title={name}
              onClick={() => setColorFilter(colorFilter === name ? '' : name)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: hex, borderColor: colorFilter === name ? 'var(--sf-primary)' : 'rgba(0,0,0,0.15)', boxShadow: colorFilter === name ? '0 0 0 2px var(--sf-bg), 0 0 0 4px var(--sf-primary)' : undefined }}
            />
          ))}
        </div>
        <div className="w-px h-5" style={{ background: 'var(--sf-border)' }} />
        <div className="flex items-center gap-1.5">
          {allSizes.map(s => (
            <button
              key={s}
              onClick={() => setSizeFilter(sizeFilter === s ? '' : s)}
              className="h-7 min-w-8 px-2 text-[11.5px] font-bold"
              style={{
                border: '1.5px solid',
                borderColor: sizeFilter === s ? 'var(--sf-primary)' : 'var(--sf-border)',
                color: sizeFilter === s ? 'var(--sf-primary)' : 'var(--sf-sub)',
                borderRadius: 'calc(var(--sf-radius) / 1.5)',
                background: 'var(--sf-surface)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="w-px h-5" style={{ background: 'var(--sf-border)' }} />
        {allBrands.length > 6 ? (
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="h-8 px-2 text-[11.5px] font-bold outline-none"
            style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'calc(var(--sf-radius)/1.5)', background: 'var(--sf-surface)', color: brandFilter ? 'var(--sf-primary)' : 'var(--sf-sub)' }}
          >
            <option value="">All brands</option>
            {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {allBrands.map(b => (
              <button
                key={b}
                onClick={() => setBrandFilter(brandFilter === b ? '' : b)}
                className="h-7 px-2.5 text-[11.5px] font-bold"
                style={{
                  border: '1.5px solid',
                  borderColor: brandFilter === b ? 'var(--sf-primary)' : 'var(--sf-border)',
                  color: brandFilter === b ? 'var(--sf-primary)' : 'var(--sf-sub)',
                  borderRadius: 'calc(var(--sf-radius) / 1.5)',
                  background: 'var(--sf-surface)',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        )}
        {(colorFilter || sizeFilter || brandFilter || cat || q) && (
          <button
            onClick={() => { setColorFilter(''); setSizeFilter(''); setBrandFilter(''); setParams(new URLSearchParams(), { replace: true }); }}
            className="font-bold hover:opacity-70"
            style={{ color: 'var(--sf-primary)' }}
          >
            Clear all
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center" style={{ color: 'var(--sf-sub)' }}>
          <div className="text-[36px] mb-3">🔍</div>
          <p className="text-[15px] font-semibold">Nothing matches those filters.</p>
        </div>
      ) : sections ? (
        <div className="space-y-12">
          {sections.map(section => (
            <section key={section.id}>
              <h2 className="text-[22px] mb-4" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
                {section.label}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.items.map(p => <ProductCardSf key={p.id} p={p} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCardSf key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
