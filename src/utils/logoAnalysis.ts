// ── Logo Quality Analysis ─────────────────────────────────────────────────────
// All checks are deterministic and run client-side via Canvas.
// No external calls. Results are ready in ~50–100ms.

export type LogoScore = 'great' | 'good' | 'fair' | 'poor';
export type IssueSeverity = 'error' | 'warning' | 'info';

export interface LogoIssue {
  severity: IssueSeverity;
  title: string;
  detail: string;
}

export interface LogoAnalysis {
  fileType: 'svg' | 'png' | 'jpg' | 'gif' | 'other';
  /** Natural image dimensions (0 for SVG — resolution-independent) */
  width: number;
  height: number;
  /** Unique quantized colors found in non-transparent pixels */
  colorCount: number;
  hasTransparency: boolean;
  score: LogoScore;
  issues: LogoIssue[];
  decorationFlags: {
    /** Risk level for embroidery based on color count */
    embroideryRisk: 'none' | 'moderate' | 'high';
    /** Resolution is high enough for quality print output */
    printReady: boolean;
    /** Low color count — well suited for laser engraving */
    engravingFriendly: boolean;
    /** Has transparency — important for DTF and clean placement */
    dtfReady: boolean;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectFileType(dataUrl: string): LogoAnalysis['fileType'] {
  if (dataUrl.startsWith('data:image/svg')) return 'svg';
  if (dataUrl.startsWith('data:image/png')) return 'png';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'jpg';
  if (dataUrl.startsWith('data:image/gif')) return 'gif';
  return 'other';
}

function analyzeRaster(dataUrl: string): Promise<{
  width: number; height: number; colorCount: number; hasTransparency: boolean;
}> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      try {
        const SAMPLE = 80;
        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE;
        canvas.height = SAMPLE;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve({ width: w, height: h, colorCount: 0, hasTransparency: false }); return; }

        ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
        const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

        const colors = new Set<string>();
        let hasTransparency = false;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) { hasTransparency = true; continue; }
          // Quantize into 32-step buckets to group similar shades
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          colors.add(`${qr},${qg},${qb}`);
        }

        resolve({ width: w, height: h, colorCount: colors.size, hasTransparency });
      } catch {
        resolve({ width: w, height: h, colorCount: 0, hasTransparency: false });
      }
    };
    img.onerror = () => resolve({ width: 0, height: 0, colorCount: 0, hasTransparency: false });
    img.src = dataUrl;
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function analyzeLogo(dataUrl: string): Promise<LogoAnalysis> {
  const fileType = detectFileType(dataUrl);

  // SVGs are resolution-independent and support all decoration methods
  if (fileType === 'svg') {
    return {
      fileType: 'svg',
      width: 0, height: 0,
      colorCount: 0,
      hasTransparency: true,
      score: 'great',
      issues: [],
      decorationFlags: { embroideryRisk: 'none', printReady: true, engravingFriendly: true, dtfReady: true },
    };
  }

  const { width, height, colorCount, hasTransparency } = await analyzeRaster(dataUrl);
  const maxDim = Math.max(width, height);
  const issues: LogoIssue[] = [];

  // ── Resolution ──────────────────────────────────────────────────────────────
  if (maxDim > 0 && maxDim < 200) {
    issues.push({
      severity: 'error',
      title: 'Very low resolution',
      detail: `${width}×${height}px — will appear pixelated on products. Minimum 500px recommended.`,
    });
  } else if (maxDim < 500) {
    issues.push({
      severity: 'warning',
      title: 'Low resolution',
      detail: `${width}×${height}px — may reduce quality on larger items. Upload at 500px or higher.`,
    });
  }

  // ── File format ─────────────────────────────────────────────────────────────
  if (fileType === 'jpg') {
    issues.push({
      severity: 'warning',
      title: 'JPEG format',
      detail: 'JPEGs have no transparency and use lossy compression. PNG or SVG will produce sharper results.',
    });
  }

  // ── Transparency ────────────────────────────────────────────────────────────
  if (fileType === 'png' && !hasTransparency) {
    issues.push({
      severity: 'warning',
      title: 'No transparent background',
      detail: 'A white or solid background may appear on dark or colored products.',
    });
  }

  // ── Color count → embroidery compatibility ──────────────────────────────────
  if (colorCount > 15) {
    issues.push({
      severity: 'error',
      title: `${colorCount} colors — embroidery not supported`,
      detail: 'Embroidery is limited to ~8 thread colors. DTF or DTG decoration is recommended for this logo.',
    });
  } else if (colorCount > 8) {
    issues.push({
      severity: 'warning',
      title: `${colorCount} colors — embroidery risk`,
      detail: 'Thread colors will be approximated and some shades may be merged.',
    });
  }

  // ── SVG recommendation (info only) ──────────────────────────────────────────
  issues.push({
    severity: 'info',
    title: 'SVG recommended',
    detail: 'Vector files scale perfectly at any size and work with all decoration methods.',
  });

  // ── Overall score ────────────────────────────────────────────────────────────
  const errors   = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const score: LogoScore =
    errors >= 2   ? 'poor' :
    errors === 1  ? 'fair' :
    warnings >= 2 ? 'fair' :
    warnings === 1 ? 'good' :
    'great';

  return {
    fileType,
    width, height,
    colorCount,
    hasTransparency,
    score,
    issues,
    decorationFlags: {
      embroideryRisk: colorCount > 15 ? 'high' : colorCount > 8 ? 'moderate' : 'none',
      printReady: maxDim >= 500,
      engravingFriendly: colorCount > 0 && colorCount <= 3,
      dtfReady: hasTransparency && maxDim >= 300,
    },
  };
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const SCORE_LABEL: Record<LogoScore, string> = {
  great: 'Great',
  good:  'Good',
  fair:  'Fair',
  poor:  'Needs work',
};

export const SCORE_COLORS: Record<LogoScore, { bg: string; text: string; dot: string; border: string }> = {
  great: { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e', border: '#bbf7d0' },
  good:  { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', border: '#bfdbfe' },
  fair:  { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', border: '#fde68a' },
  poor:  { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', border: '#fecaca' },
};

export const SEVERITY_COLORS: Record<IssueSeverity, { bg: string; text: string; border: string; icon: string }> = {
  error:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: '✕' },
  warning: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', icon: '⚠' },
  info:    { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd', icon: 'ℹ' },
};
