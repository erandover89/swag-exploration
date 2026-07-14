import { X } from 'lucide-react';
import type { Product } from '../data/mockData';

// Static size-chart data (inches) keyed by a coarse garment kind.

interface SizeChart { title: string; note: string; columns: string[]; rows: Record<string, number[]> }

const UNISEX_TOPS: SizeChart = {
  title: 'Unisex tops',
  note: 'Garment measurements in inches, laid flat. For a relaxed fit, size up.',
  columns: ['Chest width', 'Body length', 'Sleeve length'],
  rows: {
    'XS': [16.5, 26, 7.75], 'S': [18, 27, 8], 'M': [20, 28, 8.25], 'L': [22, 29, 8.5],
    'XL': [24, 30, 8.75], '2XL': [26, 31, 9], '3XL': [28, 32, 9.25],
  },
};

const FLEECE_OUTERWEAR: SizeChart = {
  title: 'Fleece & outerwear',
  note: 'Body measurements in inches. Layers run true to size with room underneath.',
  columns: ['Chest', 'Waist', 'Sleeve'],
  rows: {
    'XS': [33, 27, 32], 'S': [36, 29, 33], 'M': [39, 32, 34], 'L': [42, 35, 35],
    'XL': [45, 38, 36], '2XL': [48, 42, 37], '3XL': [52, 46, 37.5],
  },
};

function chartFor(product: Product): SizeChart {
  const n = `${product.name} ${product.description}`.toLowerCase();
  if (/(fleece|jacket|hoodie|sweatshirt|polo)/.test(n)) return FLEECE_OUTERWEAR;
  return UNISEX_TOPS;
}

export function SizeChartModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const chart = product ? chartFor(product) : UNISEX_TOPS;
  const sizes = product ? Object.keys(chart.rows).filter(s => product.sizes.includes(s)) : Object.keys(chart.rows);
  const rows = sizes.length ? sizes : Object.keys(chart.rows);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div
        className="w-full max-w-md p-6"
        style={{ background: 'var(--sf-surface)', color: 'var(--sf-ink)', borderRadius: 'calc(var(--sf-radius) * 1.4)', border: '1px solid var(--sf-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[17px] font-bold">Size chart — {chart.title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[12px] mb-4" style={{ color: 'var(--sf-sub)' }}>{chart.note}</p>
        <div className="overflow-hidden" style={{ border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius)' }}>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ background: 'color-mix(in srgb, var(--sf-ink) 6%, transparent)' }}>
                <th className="text-left px-3 py-2 font-bold">Size</th>
                {chart.columns.map(c => <th key={c} className="text-right px-3 py-2 font-bold">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(size => (
                <tr key={size} style={{ borderTop: '1px solid var(--sf-border)' }}>
                  <td className="px-3 py-2 font-bold">{size}</td>
                  {chart.rows[size].map((v, i) => <td key={i} className="px-3 py-2 text-right" style={{ color: 'var(--sf-sub)' }}>{v}"</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px]" style={{ color: 'var(--sf-sub)' }}>Between sizes? We recommend sizing up — decorated garments can't be exchanged, but we'll remake misprints free.</p>
      </div>
    </div>
  );
}
