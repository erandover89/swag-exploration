// Logo palette extraction + garment-color recommendation (Covver-style).

/** Extract up to 3 dominant colors from an uploaded logo via canvas sampling. */
export function extractPalette(dataUrl: string): Promise<string[]> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const S = 48;
        const canvas = document.createElement('canvas');
        canvas.width = S; canvas.height = S;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, S, S);
        const data = ctx.getImageData(0, 0, S, S).data;
        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
          if (a < 128) continue;
          // skip near-white/near-black backgrounds
          if (r > 240 && g > 240 && b > 240) continue;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const bkt = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
          bkt.r += r; bkt.g += g; bkt.b += b; bkt.n++;
          buckets.set(key, bkt);
        }
        const top = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 3)
          .map(({ r, g, b, n }) => `#${[r / n, g / n, b / n].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`);
        resolve(top);
      } catch { resolve([]); }
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}

export interface ColorFamily { id: string; label: string; hexes: string[]; match: (hex: string) => boolean }

export const COLOR_FAMILIES: ColorFamily[] = [
  { id: 'neutrals', label: 'Neutrals', hexes: ['#1a1a1a', '#9ca3af', '#f9fafb'], match: h => ['#1a1a1a', '#111827', '#374151', '#9ca3af', '#6b7280', '#f9fafb', '#f5f0e8', '#d4c5a0', '#d4c5a9', '#8c7b6b', '#c0c0c0', '#475569'].includes(h) },
  { id: 'blues', label: 'Blues & navy', hexes: ['#1e3a5f', '#3b82f6', '#1d4ed8'], match: h => ['#1e3a5f', '#3b82f6', '#1d4ed8', '#5b7fa6', '#1a4a5c', '#3077c9', '#2563eb', '#2d3748', '#93c5fd'].includes(h) },
  { id: 'warm', label: 'Warm tones', hexes: ['#dc2626', '#e97316', '#7f1d1d'], match: h => ['#dc2626', '#e97316', '#e11d48', '#b91c1c', '#7f1d1d', '#78350f', '#e8b4b8', '#cc0000', '#f9a8d4', '#fbcfe8'].includes(h) },
  { id: 'greens', label: 'Greens & earth', hexes: ['#166534', '#4a5240', '#4d7c5f'], match: h => ['#166534', '#4a5240', '#8c7b6b', '#d4c5a0', '#86efac'].includes(h) },
  { id: 'brights', label: 'Brights', hexes: ['#7c3aed', '#c026d3', '#5eead4'], match: h => ['#7c3aed'].includes(h) },
];

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/**
 * Map a logo's extracted palette to the garment-color families that pair well
 * with it. Neutrals are always included — every logo reads on black/white/heather.
 */
export function recommendColorFamilies(palette: string[]): string[] {
  const out = new Set<string>(['neutrals']);
  for (const hex of palette) {
    const { h, s, l } = hexToHsl(hex);
    if (s < 0.15 || l < 0.12 || l > 0.92) { out.add('neutrals'); continue; }
    if (h >= 190 && h <= 260) out.add('blues');
    else if (h <= 45 || h >= 330) out.add('warm');
    else if (h >= 60 && h <= 185) out.add('greens');
    else out.add('brights');
  }
  return [...out];
}
