// ── Layer types ───────────────────────────────────────────────────────────────

export type LayerType = 'logo' | 'graphic' | 'text';

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  opacity: number;
  locked: boolean;
  zIndex: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'logo' | 'graphic';
  src: string;
}

export type TextAlign = 'left' | 'center' | 'right';

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: TextAlign;
  fillEnabled: boolean;
  fillColor: string;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  letterSpacing: number;
  lineHeight: number;
  isPersonalized: boolean;
  personalizationType: string | null;
  personalizationPlaceholder: string | null;
}

export type DesignLayer = ImageLayer | TextLayer;

// ── Personalization options ───────────────────────────────────────────────────

export interface PersonalizationOption {
  key: string;
  label: string;
  placeholder: string;
  group: string;
}

export const PERSONALIZATION_OPTIONS: PersonalizationOption[] = [
  // Name
  { key: 'name.first',         label: 'First name',             placeholder: '{{name.first}}',         group: 'Name' },
  { key: 'name.last',          label: 'Last name',              placeholder: '{{name.last}}',          group: 'Name' },
  { key: 'name.first_initial', label: 'First initial',          placeholder: '{{name.first_initial}}', group: 'Name' },
  { key: 'name.last_initial',  label: 'Last initial',           placeholder: '{{name.last_initial}}',  group: 'Name' },
  { key: 'name.initials',      label: 'Initials',               placeholder: '{{name.initials}}',      group: 'Name' },
  // Anniversary
  { key: 'anniversary.month',           label: 'Anniversary month',        placeholder: '{{anniversary.month}}',           group: 'Anniversary' },
  { key: 'anniversary.elapsed',         label: 'Anniversary elapsed',      placeholder: '{{anniversary.elapsed}}',         group: 'Anniversary' },
  { key: 'anniversary.elapsed_years',   label: 'Anniversary elapsed years',placeholder: '{{anniversary.elapsed_years}}',   group: 'Anniversary' },
  { key: 'anniversary.year',            label: 'Anniversary year',         placeholder: '{{anniversary.year}}',            group: 'Anniversary' },
  { key: 'anniversary.decade',          label: 'Anniversary decade',       placeholder: '{{anniversary.decade}}',          group: 'Anniversary' },
  // Birthday
  { key: 'birthday.month',   label: 'Birthday month',   placeholder: '{{birthday.month}}',   group: 'Birthday' },
  { key: 'birthday.elapsed', label: 'Birthday elapsed', placeholder: '{{birthday.elapsed}}', group: 'Birthday' },
  { key: 'birthday.year',    label: 'Birth year',        placeholder: '{{birthday.year}}',    group: 'Birthday' },
  { key: 'birthday.decade',  label: 'Birth decade',      placeholder: '{{birthday.decade}}',  group: 'Birthday' },
  { key: 'birthday.zodiac',  label: 'Birth zodiac',      placeholder: '{{birthday.zodiac}}',  group: 'Birthday' },
  // Work
  { key: 'work.department', label: 'Work department', placeholder: '{{work.department}}', group: 'Work' },
  { key: 'work.location',   label: 'Work location',   placeholder: '{{work.location}}',   group: 'Work' },
];

export const PERSONALIZATION_SAMPLE_DATA: Record<string, string> = {
  'name.first':                'Alex',
  'name.last':                 'Chen',
  'name.first_initial':        'A',
  'name.last_initial':         'C',
  'name.initials':             'AC',
  'anniversary.month':         'March',
  'anniversary.elapsed':       '5 years',
  'anniversary.elapsed_years': '5',
  'anniversary.year':          '2019',
  'anniversary.decade':        '2010s',
  'birthday.month':            'July',
  'birthday.elapsed':          '32 years',
  'birthday.year':             '1992',
  'birthday.decade':           '90s',
  'birthday.zodiac':           'Cancer',
  'work.department':           'Engineering',
  'work.location':             'San Francisco',
};

/** Replace {{key}} tokens with sample data when previewMode is true. */
export function resolvePersonalizationText(text: string, previewMode: boolean): string {
  if (!previewMode) return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => PERSONALIZATION_SAMPLE_DATA[key] ?? `{{${key}}}`);
}

// ── Design state ──────────────────────────────────────────────────────────────

export interface PrintableArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesignState {
  productId: string;
  canvasWidth: number;
  canvasHeight: number;
  printableArea: PrintableArea;
  zoom: number;
  backgroundColor: string | null;
  selectedLayerId: string | null;
  layers: DesignLayer[];
}

export interface DesignEditorState {
  present: DesignState;
  past: DesignState[];
  future: DesignState[];
}

// ── Asset catalog ─────────────────────────────────────────────────────────────

export interface AssetItem {
  id: string;
  name: string;
  src: string;
  thumbnail?: string;
}

export const LOGO_ASSETS: AssetItem[] = [
  { id: 'logo-nexus',   name: 'Nexus Co',     src: 'https://api.dicebear.com/9.x/shapes/svg?seed=nexusco&backgroundColor=3077c9&radius=12'   },
  { id: 'logo-bloom',   name: 'Bloom Studio', src: 'https://api.dicebear.com/9.x/shapes/svg?seed=bloomstudio&backgroundColor=0d9488&radius=12' },
  { id: 'logo-orbit',   name: 'Orbit Labs',   src: 'https://api.dicebear.com/9.x/shapes/svg?seed=orbitlabs&backgroundColor=7c3aed&radius=12'   },
  { id: 'logo-apple',   name: 'Apple',        src: 'https://logo.clearbit.com/apple.com'   },
  { id: 'logo-stripe',  name: 'Stripe',       src: 'https://logo.clearbit.com/stripe.com'  },
  { id: 'logo-google',  name: 'Google',       src: 'https://logo.clearbit.com/google.com'  },
];

export const GRAPHIC_ASSETS: AssetItem[] = [
  { id: 'g-star',    name: 'Star burst',   src: 'https://api.dicebear.com/9.x/shapes/svg?seed=star&backgroundColor=fbbf24&radius=0'    },
  { id: 'g-wave',    name: 'Wave',         src: 'https://api.dicebear.com/9.x/shapes/svg?seed=wave&backgroundColor=3b82f6&radius=0'    },
  { id: 'g-geo',     name: 'Geometric',    src: 'https://api.dicebear.com/9.x/shapes/svg?seed=geo&backgroundColor=ef4444&radius=0'     },
  { id: 'g-flora',   name: 'Flora',        src: 'https://api.dicebear.com/9.x/shapes/svg?seed=flora&backgroundColor=10b981&radius=0'   },
  { id: 'g-circle',  name: 'Circles',      src: 'https://api.dicebear.com/9.x/shapes/svg?seed=circles&backgroundColor=8b5cf6&radius=0' },
  { id: 'g-lines',   name: 'Lines',        src: 'https://api.dicebear.com/9.x/shapes/svg?seed=lines&backgroundColor=f97316&radius=0'   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function makeId(): string {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const LOGO_MAX_W = 180;
const LOGO_MAX_H = 90;
const GRAPHIC_MAX = 140;

/**
 * Async: resolve an image's natural pixel dimensions.
 * Returns {w:0, h:0} for SVGs without explicit size or on error.
 */
export function loadImageDimensions(src: string): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = src;
  });
}

/**
 * Create an ImageLayer with aspect-ratio-correct sizing and smart placement:
 * - Logo: fits within 180×90, placed at top-center of printable area
 * - Graphic: fits within 140×140, placed at center of printable area
 * Pass naturalW=0, naturalH=0 if intrinsic dims are unknown.
 */
export function makeImageLayerSized(
  type: 'logo' | 'graphic',
  src: string,
  name: string,
  printableArea: PrintableArea,
  naturalW: number,
  naturalH: number,
): ImageLayer {
  const hasNaturalDims = naturalW > 0 && naturalH > 0;

  if (type === 'logo') {
    // SVGs without explicit size: assume wide wordmark ratio (3:1)
    const nw = hasNaturalDims ? naturalW : 180;
    const nh = hasNaturalDims ? naturalH : 60;
    const scale = Math.min(LOGO_MAX_W / nw, LOGO_MAX_H / nh, 1);
    const w = Math.round(nw * scale);
    const h = Math.round(nh * scale);
    return {
      id: makeId(), type, name, src,
      x: Math.round(printableArea.x + (printableArea.width - w) / 2),
      y: printableArea.y + 30,
      width: w, height: h,
      rotation: 0, visible: true, opacity: 1, locked: false, zIndex: 0,
    };
  } else {
    const nw = hasNaturalDims ? naturalW : 120;
    const nh = hasNaturalDims ? naturalH : 120;
    const scale = Math.min(GRAPHIC_MAX / nw, GRAPHIC_MAX / nh, 1);
    const w = Math.round(nw * scale);
    const h = Math.round(nh * scale);
    return {
      id: makeId(), type, name, src,
      x: Math.round(printableArea.x + (printableArea.width - w) / 2),
      y: Math.round(printableArea.y + (printableArea.height - h) / 2),
      width: w, height: h,
      rotation: 0, visible: true, opacity: 1, locked: false, zIndex: 0,
    };
  }
}

/** Synchronous fallback — uses 0,0 natural dims (smart defaults apply). */
export function makeImageLayer(type: 'logo' | 'graphic', src: string, name: string, printableArea: PrintableArea): ImageLayer {
  return makeImageLayerSized(type, src, name, printableArea, 0, 0);
}

export function makeTextLayer(printableArea: PrintableArea): TextLayer {
  return {
    id: makeId(),
    type: 'text',
    name: 'Text',
    text: 'Your text here',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'normal',
    textAlign: 'center',
    fillEnabled: true,
    fillColor: '#ffffff',
    strokeEnabled: false,
    strokeColor: '#000000',
    strokeWidth: 1,
    letterSpacing: 0,
    lineHeight: 1.2,
    x: printableArea.x + printableArea.width / 2 - 100,
    y: printableArea.y + printableArea.height / 2 - 20,
    width: 200,
    height: 40,
    rotation: 0,
    visible: true,
    opacity: 1,
    locked: false,
    zIndex: 0,
    isPersonalized: false,
    personalizationType: null,
    personalizationPlaceholder: null,
  };
}
