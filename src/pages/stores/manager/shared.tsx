// Shared styling constants + bits for the Store Manager tabs.

export const card = 'bg-white rounded-[18px] border border-snp-navy-200 shadow-[0px_4px_12px_rgba(1,39,84,0.05)]';
export const label = 'block text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 mb-2';
export const input = 'w-full h-11 px-3.5 bg-white rounded-[10px] border border-snp-navy-200 text-[13.5px] text-snp-navy-950 outline-none focus:border-snp-indigo-500';

export function OrderStatus({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    'Paid': { bg: '#eff6ff', text: '#1d4ed8' },
    'In production': { bg: '#fdf4ff', text: '#a21caf' },
    'Shipped': { bg: '#fff7ed', text: '#c2410c' },
    'Delivered': { bg: '#ecfdf5', text: '#047857' },
  };
  const s = map[status] ?? map['Paid'];
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: s.bg, color: s.text }}>{status}</span>;
}
