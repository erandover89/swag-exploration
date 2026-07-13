// ── Distributor Stores — data model, themes, pricing engine, seeds ───────────
// The Snappy user here is a DISTRIBUTOR (SanMar's customer) managing branded
// storefronts on behalf of their own customers (leagues, cafes, companies).
// Pricing model: Snappy/SanMar all-in cost → distributor markup → store price.

import { PRODUCTS, type Product, type ProductCategory } from './mockData';

// ── Types ─────────────────────────────────────────────────────────────────────

export type StoreStatus = 'live' | 'draft' | 'paused';
export type ClientType = 'Team Sports' | 'Cafe & Retail' | 'Corporate' | 'Education' | 'Nonprofit';
export type AccessMode = 'public' | 'passcode';
export type PaymentMode = 'card' | 'points' | 'mixed';

export interface VolumeTier {
  qty: number;         // minimum units in cart line to qualify
  discountPct: number; // % off store retail price
}

export interface StoreLogoAsset {
  id: string;
  label: string;   // "Primary", "Monochrome", "Crest"…
  src: string;     // data URI (svg) or uploaded dataURL
}

export interface StoreTheme {
  id: string;
  name: string;
  vibe: string;               // one-line description shown in pickers
  fontDisplay: string;
  fontBody: string;
  displayWeight: number;
  displayTransform: 'uppercase' | 'none';
  displayTracking: string;    // letter-spacing
  radius: string;             // card/button radius
  colors: {
    bg: string;         // page background
    surface: string;    // cards
    ink: string;        // primary text
    sub: string;        // secondary text
    border: string;
    primary: string;    // CTA
    primaryInk: string; // text on CTA
    accent: string;     // highlights, deal chips
    headerBg: string;
    headerInk: string;
    heroBg: string;     // hero band background
    heroInk: string;
  };
}

export interface StorePricing {
  globalMarkupPct: number;                       // applied on Snappy cost
  productOverrides: Record<string, number>;      // productId → explicit retail price
  volumeTiers: VolumeTier[];                     // storewide qty discounts
  showBulkSavings: boolean;                      // surface tier table on PDPs
}

export interface StoreSettings {
  access: AccessMode;
  passcode?: string;
  payment: PaymentMode;
  bulkOrdering: boolean;      // size-grid ordering on PDPs
  logoPicker: boolean;        // end customer picks which logo is applied
}

export interface StoreOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  margin: number;
  status: 'Paid' | 'In production' | 'Shipped' | 'Delivered';
  date: string;
}

export interface DistributorStore {
  id: string;
  slug: string;
  name: string;
  clientName: string;
  clientType: ClientType;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
  themeId: string;
  logos: StoreLogoAsset[];
  primaryLogoId: string;
  heroHeadline: string;
  heroSub: string;
  announcement: string;
  productIds: string[];
  featuredIds: string[];
  hiddenIds: string[];
  pricing: StorePricing;
  settings: StoreSettings;
  stats: { revenue30d: number; orders30d: number; visitors30d: number; margin30d: number };
  orders: StoreOrder[];
}

// ── SanMar-style codes for catalog items (real SanMar-distributed brands) ────
export const STYLE_CODES: Record<string, string> = {
  '1': 'PAT-25580',   '2': 'HF-W32BTS',   '3': 'LC-LS2501',   '4': 'SF000',
  '5': 'CTK121',      '6': 'BG-STC10',    '7': 'APL-MTJV3',   '8': 'KK-TKW20',
  '9': 'STN-CREW3',   '10': 'FJ-MINI12',  '11': 'APL-S9410',  '12': 'CSTF-IMP',
  '13': 'NKDX8730',   '14': 'ADI-5145',   '15': 'UA-1370399', '16': 'ML-HNL2',
  '17': 'SNP-KIT01',  '18': 'MSK-XL2',    '19': 'YET-R20',    '20': 'CM-SHRPA',
  '21': 'VN-EYEBLK',  '22': 'STSW149',    '23': 'NF0A529L',   '24': 'TT-TB2201',
  '25': 'TM1MC461',   '26': 'CM-PET16',   '27': 'BC3001',
};

// ── Storefront themes ─────────────────────────────────────────────────────────

export const STORE_THEMES: StoreTheme[] = [
  {
    id: 'athletic',
    name: 'Stadium',
    vibe: 'Bold, high-contrast athletic — built for team sports and spirit wear',
    fontDisplay: "'Archivo', sans-serif",
    fontBody: "'Archivo', sans-serif",
    displayWeight: 900,
    displayTransform: 'uppercase',
    displayTracking: '-0.01em',
    radius: '6px',
    colors: {
      bg: '#0e1116', surface: '#171c24', ink: '#f5f7fa', sub: '#96a1b0',
      border: '#252d38', primary: '#c8f135', primaryInk: '#101500',
      accent: '#5eead4', headerBg: '#0a0d11', headerInk: '#f5f7fa',
      heroBg: '#12181f', heroInk: '#f5f7fa',
    },
  },
  {
    id: 'artisan',
    name: 'Roastery',
    vibe: 'Warm, editorial, café-craft — serif type and cream tones',
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Manrope', sans-serif",
    displayWeight: 600,
    displayTransform: 'none',
    displayTracking: '-0.02em',
    radius: '18px',
    colors: {
      bg: '#faf5ec', surface: '#ffffff', ink: '#2e2116', sub: '#8a7663',
      border: '#eadfcd', primary: '#a2530a', primaryInk: '#fff8ef',
      accent: '#4d7c5f', headerBg: '#faf5ec', headerInk: '#2e2116',
      heroBg: '#2e2116', heroInk: '#faf5ec',
    },
  },
  {
    id: 'modern',
    name: 'Studio',
    vibe: 'Sleek, minimal, agency-grade — crisp grids and electric accents',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontBody: "'Manrope', sans-serif",
    displayWeight: 700,
    displayTransform: 'none',
    displayTracking: '-0.03em',
    radius: '12px',
    colors: {
      bg: '#fafafa', surface: '#ffffff', ink: '#0f172a', sub: '#64748b',
      border: '#e2e8f0', primary: '#4f46e5', primaryInk: '#ffffff',
      accent: '#06b6d4', headerBg: '#ffffff', headerInk: '#0f172a',
      heroBg: '#0f172a', heroInk: '#ffffff',
    },
  },
  {
    id: 'varsity',
    name: 'Varsity',
    vibe: 'Classic collegiate — heritage reds, ivory, and letterman energy',
    fontDisplay: "'Archivo', sans-serif",
    fontBody: "'Manrope', sans-serif",
    displayWeight: 800,
    displayTransform: 'uppercase',
    displayTracking: '0.02em',
    radius: '10px',
    colors: {
      bg: '#fffbf2', surface: '#ffffff', ink: '#27180e', sub: '#8c7a6b',
      border: '#f0e4d3', primary: '#b91c1c', primaryInk: '#fff5ec',
      accent: '#1d4ed8', headerBg: '#ffffff', headerInk: '#27180e',
      heroBg: '#b91c1c', heroInk: '#fff5ec',
    },
  },
];

export function getTheme(themeId: string): StoreTheme {
  return STORE_THEMES.find(t => t.id === themeId) ?? STORE_THEMES[2];
}

// ── Built-in demo client logos (inline SVG → data URI) ───────────────────────

function svgUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const RIDGELINE_CREST = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 132" fill="none">
<path d="M60 4 L112 20 V72 C112 100 90 118 60 128 C30 118 8 100 8 72 V20 Z" fill="#0d1b2a" stroke="#c8f135" stroke-width="5"/>
<path d="M22 78 L44 46 L56 62 L74 34 L98 78 Z" fill="#c8f135"/>
<path d="M22 78 L44 46 L56 62 L50 78 Z" fill="#8fb51e"/>
<text x="60" y="104" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="22" fill="#f5f7fa">RUFC</text>
</svg>`);

const RIDGELINE_MONO = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 132" fill="none">
<path d="M60 4 L112 20 V72 C112 100 90 118 60 128 C30 118 8 100 8 72 V20 Z" fill="none" stroke="#101500" stroke-width="6"/>
<path d="M22 78 L44 46 L56 62 L74 34 L98 78 Z" fill="#101500"/>
<text x="60" y="104" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="22" fill="#101500">RUFC</text>
</svg>`);

const DRIFTWOOD_BADGE = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none">
<circle cx="70" cy="70" r="64" fill="#2e2116" stroke="#a2530a" stroke-width="4"/>
<path d="M44 62 h40 v18 a20 20 0 0 1 -40 0 Z" fill="#faf5ec"/>
<path d="M84 66 h8 a8 8 0 0 1 0 16 h-9" stroke="#faf5ec" stroke-width="5" fill="none"/>
<path d="M52 50 c0 -6 6 -6 6 -12 M64 50 c0 -6 6 -6 6 -12" stroke="#e8b878" stroke-width="4" stroke-linecap="round" fill="none"/>
<text x="70" y="122" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="700" fill="#faf5ec" letter-spacing="2">DRIFTWOOD</text>
</svg>`);

const DRIFTWOOD_MONO = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none">
<circle cx="70" cy="70" r="62" fill="none" stroke="#2e2116" stroke-width="5"/>
<path d="M44 58 h40 v18 a20 20 0 0 1 -40 0 Z" fill="#2e2116"/>
<path d="M84 62 h8 a8 8 0 0 1 0 16 h-9" stroke="#2e2116" stroke-width="5" fill="none"/>
<text x="70" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="700" fill="#2e2116" letter-spacing="2">DRIFTWOOD</text>
</svg>`);

const MERIDIAN_MARK = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120" fill="none">
<path d="M18 100 V28 L52 72 L86 28 V100" stroke="#4f46e5" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<circle cx="112" cy="40" r="14" fill="#06b6d4"/>
<circle cx="112" cy="84" r="7" fill="#4f46e5"/>
</svg>`);

const MERIDIAN_MONO = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120" fill="none">
<path d="M18 100 V28 L52 72 L86 28 V100" stroke="#0f172a" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<circle cx="112" cy="40" r="14" fill="#0f172a"/>
</svg>`);

function initialsLogo(text: string, bg: string, fg: string): string {
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="${bg}"/><text x="60" y="76" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="44" fill="${fg}">${text}</text></svg>`);
}

// ── Pricing engine ────────────────────────────────────────────────────────────

/** All-in cost the distributor pays Snappy/SanMar (product + decoration + shipping). */
export function baseCost(product: Product): number {
  return product.price;
}

function roundRetail(v: number): number {
  return Math.max(1, Math.round(v * 2) / 2); // nearest 50¢
}

/** Store retail price after distributor markup (or explicit override). */
export function retailPrice(store: DistributorStore, product: Product): number {
  const override = store.pricing.productOverrides[product.id];
  if (override != null) return override;
  return roundRetail(baseCost(product) * (1 + store.pricing.globalMarkupPct / 100));
}

/** Distributor margin per unit at a given sell price. */
export function unitMargin(store: DistributorStore, product: Product, price?: number): number {
  return (price ?? retailPrice(store, product)) - baseCost(product);
}

/** Best qualifying volume tier for a quantity, or null. */
export function tierFor(store: DistributorStore, qty: number): VolumeTier | null {
  const tiers = [...store.pricing.volumeTiers].sort((a, b) => a.qty - b.qty);
  let best: VolumeTier | null = null;
  for (const t of tiers) if (qty >= t.qty) best = t;
  return best;
}

/** Unit price after volume discount at a given quantity. */
export function tierPrice(store: DistributorStore, product: Product, qty: number): number {
  const base = retailPrice(store, product);
  const tier = tierFor(store, qty);
  return tier ? roundRetail(base * (1 - tier.discountPct / 100)) : base;
}

export function fmtMoney(v: number): string {
  return v % 1 === 0 ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;
}

export function storeProducts(store: DistributorStore): Product[] {
  return store.productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is Product => !!p);
}

export function visibleProducts(store: DistributorStore): Product[] {
  return storeProducts(store).filter(p => !store.hiddenIds.includes(p.id));
}

export function storeCategories(store: DistributorStore): ProductCategory[] {
  return [...new Set(visibleProducts(store).map(p => p.category))];
}

export const DEFAULT_TIERS: VolumeTier[] = [
  { qty: 12, discountPct: 10 },
  { qty: 24, discountPct: 15 },
  { qty: 48, discountPct: 22 },
];

// ── Seed orders ───────────────────────────────────────────────────────────────

function seedOrders(prefix: string, rows: [string, number, number, StoreOrder['status'], string][], marginRate: number): StoreOrder[] {
  return rows.map(([customer, items, total, status, date], i) => ({
    id: `${prefix}-${1042 - i * 7}`,
    customer, items, total,
    margin: Math.round(total * marginRate),
    status, date,
  }));
}

// ── Seed stores ───────────────────────────────────────────────────────────────

export const SEED_STORES: DistributorStore[] = [
  {
    id: 'st-ridgeline',
    slug: 'ridgeline-united',
    name: 'Ridgeline United FC Team Store',
    clientName: 'Ridgeline United FC',
    clientType: 'Team Sports',
    status: 'live',
    createdAt: '2026-05-02',
    updatedAt: '2026-07-11',
    themeId: 'athletic',
    logos: [
      { id: 'lg-crest', label: 'Club crest', src: RIDGELINE_CREST },
      { id: 'lg-mono', label: 'Monochrome', src: RIDGELINE_MONO },
    ],
    primaryLogoId: 'lg-crest',
    heroHeadline: 'Wear the crest.',
    heroSub: 'Official Ridgeline United FC gear — jerseys, hoodies and training kit for players, parents and fans.',
    announcement: 'Fall season kit drop is live — order by Aug 15 for first-practice delivery',
    productIds: ['13', '27', '5', '22', '4', '15', '25', '9', '2', '8', '6', '14'],
    featuredIds: ['13', '22', '25', '14'],
    hiddenIds: [],
    pricing: {
      globalMarkupPct: 42,
      productOverrides: { '13': 34.99 },
      volumeTiers: DEFAULT_TIERS,
      showBulkSavings: true,
    },
    settings: { access: 'public', payment: 'card', bulkOrdering: true, logoPicker: true },
    stats: { revenue30d: 18432, orders30d: 214, visitors30d: 3120, margin30d: 5446 },
    orders: seedOrders('RU', [
      ['Karen Mitchell (U12 Falcons)', 16, 486.4, 'In production', 'Jul 12'],
      ['Coach D. Alvarez', 24, 612.0, 'Paid', 'Jul 12'],
      ['Priya Raman', 3, 96.5, 'Shipped', 'Jul 10'],
      ['Booster Club — J. Whitfield', 48, 1104.0, 'In production', 'Jul 9'],
      ['Tom Okafor', 2, 71.0, 'Delivered', 'Jul 7'],
      ['Sarah Jennings (U10)', 5, 148.5, 'Delivered', 'Jul 5'],
    ], 0.295),
  },
  {
    id: 'st-driftwood',
    slug: 'driftwood-coffee',
    name: 'Driftwood Coffee Merch',
    clientName: 'Driftwood Coffee Roasters',
    clientType: 'Cafe & Retail',
    status: 'live',
    createdAt: '2026-05-20',
    updatedAt: '2026-07-08',
    themeId: 'artisan',
    logos: [
      { id: 'lg-badge', label: 'Roastery badge', src: DRIFTWOOD_BADGE },
      { id: 'lg-mono', label: 'Monochrome', src: DRIFTWOOD_MONO },
    ],
    primaryLogoId: 'lg-badge',
    heroHeadline: 'Goods for slow mornings.',
    heroSub: 'Small-batch merch from your neighborhood roastery — heavyweight tees, cozy knits and the tote that carries the beans.',
    announcement: 'Every order includes a free bag of our Harbor House blend ☕',
    productIds: ['27', '22', '25', '6', '8', '2', '16', '26', '3', '9'],
    featuredIds: ['22', '6', '25', '8'],
    hiddenIds: [],
    pricing: {
      globalMarkupPct: 55,
      productOverrides: {},
      volumeTiers: [{ qty: 6, discountPct: 8 }, { qty: 12, discountPct: 12 }],
      showBulkSavings: false,
    },
    settings: { access: 'public', payment: 'card', bulkOrdering: false, logoPicker: false },
    stats: { revenue30d: 6218, orders30d: 118, visitors30d: 1904, margin30d: 2208 },
    orders: seedOrders('DW', [
      ['Maya Chen', 2, 118.0, 'Paid', 'Jul 11'],
      ['Wholesale — Harbor Market', 12, 468.0, 'In production', 'Jul 10'],
      ['Liam Gallagher', 1, 42.0, 'Shipped', 'Jul 9'],
      ['Staff order — E. Duarte', 8, 296.0, 'Delivered', 'Jul 6'],
      ['Nora Blake', 3, 104.5, 'Delivered', 'Jul 3'],
    ], 0.35),
  },
  {
    id: 'st-meridian',
    slug: 'meridian-marketing',
    name: 'Meridian & Co. Brand Store',
    clientName: 'Meridian & Co. Marketing',
    clientType: 'Corporate',
    status: 'live',
    createdAt: '2026-06-01',
    updatedAt: '2026-07-12',
    themeId: 'modern',
    logos: [
      { id: 'lg-mark', label: 'Primary mark', src: MERIDIAN_MARK },
      { id: 'lg-mono', label: 'Monochrome', src: MERIDIAN_MONO },
    ],
    primaryLogoId: 'lg-mark',
    heroHeadline: 'The agency uniform, upgraded.',
    heroSub: 'Client-gifting and team essentials for Meridian & Co. — premium apparel and everyday carry, branded and delivered on demand.',
    announcement: 'Client-gift season: bulk pricing unlocks at 12 units',
    productIds: ['1', '23', '24', '16', '27', '4', '2', '8', '6', '21', '12', '10'],
    featuredIds: ['1', '23', '21', '10'],
    hiddenIds: [],
    pricing: {
      globalMarkupPct: 38,
      productOverrides: {},
      volumeTiers: DEFAULT_TIERS,
      showBulkSavings: true,
    },
    settings: { access: 'public', payment: 'mixed', bulkOrdering: true, logoPicker: true },
    stats: { revenue30d: 24980, orders30d: 96, visitors30d: 2450, margin30d: 6870 },
    orders: seedOrders('MC', [
      ['Events — Q3 client summit', 36, 4212.0, 'In production', 'Jul 12'],
      ['Dana Whitworth', 2, 318.0, 'Paid', 'Jul 11'],
      ['People Ops — onboarding batch', 14, 1288.0, 'Shipped', 'Jul 9'],
      ['Marcus Lee', 1, 214.0, 'Delivered', 'Jul 8'],
      ['Studio team — A. Kowalski', 6, 486.0, 'Delivered', 'Jul 4'],
    ], 0.275),
  },
  {
    id: 'st-lakeside',
    slug: 'lakeside-little-league',
    name: 'Lakeside Little League Store',
    clientName: 'Lakeside Little League',
    clientType: 'Team Sports',
    status: 'draft',
    createdAt: '2026-07-09',
    updatedAt: '2026-07-09',
    themeId: 'varsity',
    logos: [{ id: 'lg-init', label: 'Primary', src: initialsLogo('LL', '#b91c1c', '#fff5ec') }],
    primaryLogoId: 'lg-init',
    heroHeadline: 'Play ball, Lakeside.',
    heroSub: 'Spirit wear for the whole league — from tee-ball to majors.',
    announcement: 'Opening day pre-orders now open',
    productIds: ['27', '13', '4', '25', '9', '2', '6'],
    featuredIds: ['27', '25'],
    hiddenIds: [],
    pricing: { globalMarkupPct: 40, productOverrides: {}, volumeTiers: DEFAULT_TIERS, showBulkSavings: true },
    settings: { access: 'public', payment: 'card', bulkOrdering: true, logoPicker: false },
    stats: { revenue30d: 0, orders30d: 0, visitors30d: 0, margin30d: 0 },
    orders: [],
  },
  {
    id: 'st-summit',
    slug: 'summit-credit-union',
    name: 'Summit Credit Union Store',
    clientName: 'Summit Credit Union',
    clientType: 'Corporate',
    status: 'live',
    createdAt: '2026-04-14',
    updatedAt: '2026-06-28',
    themeId: 'modern',
    logos: [{ id: 'lg-init', label: 'Primary', src: initialsLogo('S', '#0e7490', '#ecfeff') }],
    primaryLogoId: 'lg-init',
    heroHeadline: 'Gear that banks on you.',
    heroSub: 'Employee apparel and member giveaways for Summit CU branches.',
    announcement: 'New branch-opening kits available',
    productIds: ['27', '4', '24', '2', '8', '6', '12'],
    featuredIds: ['24', '2'],
    hiddenIds: [],
    pricing: { globalMarkupPct: 35, productOverrides: {}, volumeTiers: [{ qty: 24, discountPct: 12 }], showBulkSavings: true },
    settings: { access: 'passcode', passcode: 'SUMMIT26', payment: 'points', bulkOrdering: true, logoPicker: false },
    stats: { revenue30d: 4120, orders30d: 61, visitors30d: 720, margin30d: 1068 },
    orders: seedOrders('SC', [
      ['Branch 12 — giveaway restock', 50, 1250.0, 'Shipped', 'Jul 8'],
      ['HR — new hire kits', 10, 512.0, 'Delivered', 'Jul 2'],
    ], 0.26),
  },
  {
    id: 'st-cascade',
    slug: 'cascade-run-club',
    name: 'Cascade Run Club Shop',
    clientName: 'Cascade Run Club',
    clientType: 'Nonprofit',
    status: 'live',
    createdAt: '2026-03-30',
    updatedAt: '2026-06-15',
    themeId: 'athletic',
    logos: [{ id: 'lg-init', label: 'Primary', src: initialsLogo('CR', '#0d9488', '#f0fdfa') }],
    primaryLogoId: 'lg-init',
    heroHeadline: 'Run the ridge.',
    heroSub: 'Club singlets, trail layers and race-day essentials.',
    announcement: 'Fall trail series registration merch is here',
    productIds: ['13', '27', '15', '9', '25', '2', '8'],
    featuredIds: ['13', '9'],
    hiddenIds: [],
    pricing: { globalMarkupPct: 30, productOverrides: {}, volumeTiers: [{ qty: 12, discountPct: 10 }], showBulkSavings: false },
    settings: { access: 'public', payment: 'card', bulkOrdering: false, logoPicker: false },
    stats: { revenue30d: 2244, orders30d: 43, visitors30d: 810, margin30d: 518 },
    orders: seedOrders('CR', [
      ['Race committee — volunteer tees', 30, 780.0, 'Delivered', 'Jun 30'],
      ['Jess Nakamura', 2, 64.0, 'Delivered', 'Jun 22'],
    ], 0.23),
  },
  {
    id: 'st-northgate',
    slug: 'northgate-hvac',
    name: 'Northgate HVAC Workwear',
    clientName: 'Northgate Heating & Air',
    clientType: 'Corporate',
    status: 'paused',
    createdAt: '2026-02-11',
    updatedAt: '2026-05-19',
    themeId: 'varsity',
    logos: [{ id: 'lg-init', label: 'Primary', src: initialsLogo('N', '#1d4ed8', '#eff6ff') }],
    primaryLogoId: 'lg-init',
    heroHeadline: 'Crew gear that works.',
    heroSub: 'Uniform program for Northgate field technicians.',
    announcement: 'Summer uniform refresh',
    productIds: ['5', '4', '15', '25', '9'],
    featuredIds: ['5'],
    hiddenIds: [],
    pricing: { globalMarkupPct: 25, productOverrides: {}, volumeTiers: [{ qty: 24, discountPct: 15 }], showBulkSavings: true },
    settings: { access: 'passcode', passcode: 'CREW', payment: 'card', bulkOrdering: true, logoPicker: false },
    stats: { revenue30d: 0, orders30d: 0, visitors30d: 12, margin30d: 0 },
    orders: seedOrders('NG', [
      ['Field ops — spring uniforms', 60, 2280.0, 'Delivered', 'May 12'],
    ], 0.2),
  },
  {
    id: 'st-bluebird',
    slug: 'bluebird-bakery',
    name: 'Bluebird Bakery Shop',
    clientName: 'Bluebird Bakery',
    clientType: 'Cafe & Retail',
    status: 'draft',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
    themeId: 'artisan',
    logos: [{ id: 'lg-init', label: 'Primary', src: initialsLogo('B', '#3b82f6', '#eff6ff') }],
    primaryLogoId: 'lg-init',
    heroHeadline: 'Fresh out of the oven.',
    heroSub: 'Aprons, tees and totes from your favorite corner bakery.',
    announcement: 'Grand-opening merch drop',
    productIds: ['27', '6', '25', '2'],
    featuredIds: ['27'],
    hiddenIds: [],
    pricing: { globalMarkupPct: 50, productOverrides: {}, volumeTiers: [], showBulkSavings: false },
    settings: { access: 'public', payment: 'card', bulkOrdering: false, logoPicker: false },
    stats: { revenue30d: 0, orders30d: 0, visitors30d: 0, margin30d: 0 },
    orders: [],
  },
];

// ── Catalog templates for the creation wizard ────────────────────────────────

export interface CatalogTemplate {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  productIds: string[];
  suggestedThemeId: string;
}

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'team-sports',
    name: 'Team Sports Store',
    desc: 'Performance tees, hoodies, beanies and sideline gear — built for leagues, clubs and spirit wear.',
    emoji: '🏆',
    productIds: ['13', '27', '5', '22', '4', '15', '25', '9', '2', '8', '6', '14'],
    suggestedThemeId: 'athletic',
  },
  {
    id: 'marketing',
    name: 'Marketing & Events Store',
    desc: 'Premium apparel, drinkware and giveaway-ready items for campaigns, conferences and client gifting.',
    emoji: '🎯',
    productIds: ['1', '23', '24', '16', '27', '4', '2', '8', '6', '21', '12', '10'],
    suggestedThemeId: 'modern',
  },
  {
    id: 'cafe-retail',
    name: 'Cafe & Retail Store',
    desc: 'Heavyweight tees, cozy knits, totes and counter-side merch for shops with a loyal following.',
    emoji: '☕',
    productIds: ['27', '22', '25', '6', '8', '2', '16', '26', '3'],
    suggestedThemeId: 'artisan',
  },
  {
    id: 'full-catalog',
    name: 'Full SanMar Catalog',
    desc: 'Start from the complete synced catalog — every style, color and size — then curate down.',
    emoji: '📦',
    productIds: PRODUCTS.filter(p => p.image.startsWith('/')).map(p => p.id),
    suggestedThemeId: 'varsity',
  },
];

export { initialsLogo, svgUri };
