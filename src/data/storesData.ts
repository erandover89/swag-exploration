// ── Distributor Stores — data model, themes, pricing engine, seeds ───────────
// The Snappy user here is a DISTRIBUTOR managing branded storefronts on behalf
// of their own customers (leagues, cafes, companies).
// Pricing model: Snappy charges one set all-in cost to every distributor →
// distributor markup → store price.

import { PRODUCTS, PRINT_TECHNIQUE_CHIPS, type Product, type ProductCategory, type PrintTechnique } from './mockData';

// ── Types ─────────────────────────────────────────────────────────────────────

export type StoreStatus = 'live' | 'draft' | 'paused';
export type ClientType =
  | 'Team Sports' | 'Corporate' | 'Retail' | 'Restaurant' | 'Education'
  | 'Nonprofit' | 'Healthcare' | 'Government' | 'Events & Entertainment' | 'Fitness & Wellness';

export const CLIENT_TYPES: ClientType[] = [
  'Team Sports', 'Corporate', 'Retail', 'Restaurant', 'Education',
  'Nonprofit', 'Healthcare', 'Government', 'Events & Entertainment', 'Fitness & Wellness',
];
export type AccessMode = 'public' | 'passcode' | 'email-list';
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

export type DiscountType = 'fixed' | 'percent' | 'free-shipping';

export interface DiscountCode {
  id: string;
  code: string;              // stored UPPERCASE, matched case-insensitively
  type: DiscountType;
  value: number;             // $ for fixed, % for percent, ignored for free-shipping
  expiresAt: string | null;  // 'YYYY-MM-DD' or null = never expires
  maxUses: number | null;    // null = unlimited
  usedCount: number;
  userEmails: string[];      // [] = anyone may use it
  productIds: string[];      // [] = applies to the whole cart
  active: boolean;
  createdAt: string;
}

export interface StoreUser {
  id: string;
  name: string;
  email: string;             // stored lowercase — the unique key
  role: string;
  department?: string;
  isAdmin: boolean;
  discountPct?: number;      // auto-applied to this shopper's cart
  source: 'csv' | 'manual';
  addedAt: string;
}

export interface AccessRule {
  id: string;
  field: 'role' | 'department' | 'emailDomain';
  value: string;
  effect: 'grant-admin' | 'discount';
  discountPct?: number;      // when effect === 'discount'
}

export interface StoreUsersConfig {
  enabled: boolean;
  users: StoreUser[];
  rules: AccessRule[];
}

export interface StoreSeo { metaTitle: string; metaDescription: string; keywords: string }

export interface StoreFooterContent { ourStory: string; qualityPromise: string; privacy: string; contact: string }

export type ShopperConstraint = 'locked' | 'editable' | 'removable';

export interface StoreProductContent {
  description: string;
  specifications: string;
  aboutBrand: string;
  custom: { title: string; body: string } | null;   // the one blank admin field
}

export interface StoreProductCustomization {
  displayName?: string;
  content?: StoreProductContent;                    // absent = generated defaults
  logoByColor?: Record<string, string>;             // product color NAME → store logoId
  constraints?: Record<string, ShopperConstraint>;  // designer layerId → tri-state (default 'locked')
  customizable?: boolean;                           // gates the shopper "Customize" button
}

export type CatalogGroupingMode = 'manual' | 'category' | 'brand' | 'custom';
export interface CatalogGroup { id: string; label: string; productIds: string[] }
export interface CatalogLayout { mode: CatalogGroupingMode; groups: CatalogGroup[] }

export interface DistributorStore {
  id: string;
  slug: string;
  name: string;
  clientName: string;
  clientType: ClientType | null;   // optional — some customers don't fit a bucket
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
  customTheme: StoreTheme | null;   // used when themeId === 'custom'
  bannerImage: string | null;       // storefront hero banner (downscaled dataURL or data URI)
  brandPalette: string[];           // colors extracted from the uploaded logo
  discountCodes: DiscountCode[];
  users: StoreUsersConfig;
  seo: StoreSeo;
  footerContent: StoreFooterContent;
  productCustomizations: Record<string, StoreProductCustomization>;  // productId →
  catalogLayout: CatalogLayout;
}

/** Seed/persisted stores may predate the newer fields — normalizeStore() fills them. */
type RawStore = Omit<DistributorStore,
  'customTheme' | 'bannerImage' | 'brandPalette' | 'discountCodes' | 'users' | 'seo' |
  'footerContent' | 'productCustomizations' | 'catalogLayout'
> & Partial<Pick<DistributorStore,
  'customTheme' | 'bannerImage' | 'brandPalette' | 'discountCodes' | 'users' | 'seo' |
  'footerContent' | 'productCustomizations' | 'catalogLayout'
>>;

export function defaultFooterContent(clientName: string): StoreFooterContent {
  return {
    ourStory: `${clientName} works with a dedicated local distributor to bring you official gear — every item is decorated on demand and shipped straight to your door.`,
    qualityPromise: 'Every order is inspected before it ships. If your gear arrives damaged or misprinted, we remake it free — no forms, no fuss.',
    privacy: 'We only collect what we need to fulfill your order. Your details are never sold or shared outside our fulfillment partners.',
    contact: `Questions about an order? Reach the ${clientName} store team at support@snappy.store and we'll get back to you within one business day.`,
  };
}

/** Fill any missing newer fields with defaults — ??-fills only, never overwrites. */
export function normalizeStore(s: RawStore): DistributorStore {
  // legacy customer type — 'Cafe & Retail' was split into Retail / Restaurant
  const clientType: ClientType | null = (s.clientType as string) === 'Cafe & Retail' ? 'Restaurant' : s.clientType ?? null;
  return {
    ...s,
    clientType,
    customTheme: s.customTheme ?? null,
    bannerImage: s.bannerImage ?? null,
    brandPalette: s.brandPalette ?? [],
    discountCodes: s.discountCodes ?? [],
    users: s.users ?? { enabled: false, users: [], rules: [] },
    seo: s.seo ?? { metaTitle: s.name, metaDescription: s.heroSub, keywords: '' },
    footerContent: s.footerContent ?? defaultFooterContent(s.clientName),
    productCustomizations: s.productCustomizations ?? {},
    catalogLayout: s.catalogLayout ?? { mode: 'manual', groups: [] },
  };
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

/** Resolve a store's active theme — honors a fully custom theme when selected. */
export function getStoreTheme(store: DistributorStore): StoreTheme {
  if (store.themeId === 'custom' && store.customTheme) return store.customTheme;
  return getTheme(store.themeId);
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

/** All-in cost the distributor pays Snappy (product + decoration + shipping) — same set price for every distributor. */
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

// ── Shipping, decoration & cart totals ────────────────────────────────────────

export type ShippingMethodId = 'ground' | 'three-day' | 'overnight';
export interface ShippingMethod { id: ShippingMethodId; label: string; price: number; etaDays: [number, number] }

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'ground',    label: 'Ground',    price: 0,    etaDays: [5, 7] },
  { id: 'three-day', label: '3-Day',     price: 12.5, etaDays: [3, 3] },
  { id: 'overnight', label: 'Overnight', price: 24.5, etaDays: [1, 1] },
];

export function shippingMethod(id?: ShippingMethodId): ShippingMethod {
  return SHIPPING_METHODS.find(m => m.id === id) ?? SHIPPING_METHODS[0];
}

/** Decoration cost baked into the all-in price, split out for display only. */
export const DECORATION_COST: Record<PrintTechnique, number> = {
  'embroidery': 7.5, 'dtg': 4.5, 'dtf': 4, 'sublimation': 5,
  'laser-printing': 3.5, 'uv-printing': 4, 'digital-inkjet': 3, 'digital-printing': 3,
};

/** Per-unit upcharge when a cart line carries shopper customization. */
export const CUSTOMIZATION_UPCHARGE = 3;

/** Display-only Garment + Decoration split — always sums exactly to retailPrice(). */
export function priceBreakdown(store: DistributorStore, product: Product): { garment: number; decoration: number; total: number } {
  const total = retailPrice(store, product);
  const decoration = Math.min(
    roundRetail(DECORATION_COST[product.printTechnique] * (1 + store.pricing.globalMarkupPct / 100)),
    roundRetail(total * 0.4),
  );
  return { garment: Math.round((total - decoration) * 100) / 100, decoration, total };
}

/** The shopper's auto-applied discount % — max of their user record and any matching rules. */
export function userDiscountPctFor(store: DistributorStore, email?: string): number {
  if (!email) return 0;
  const lower = email.toLowerCase();
  const user = store.users.users.find(u => u.email === lower);
  let pct = user?.discountPct ?? 0;
  for (const rule of store.users.rules) {
    if (rule.effect !== 'discount' || !rule.discountPct) continue;
    const matches =
      (rule.field === 'emailDomain' && lower.endsWith(`@${rule.value.toLowerCase()}`)) ||
      (rule.field === 'role' && user?.role.toLowerCase() === rule.value.toLowerCase()) ||
      (rule.field === 'department' && user?.department?.toLowerCase() === rule.value.toLowerCase());
    if (matches) pct = Math.max(pct, rule.discountPct);
  }
  return pct;
}

export function validateDiscount(
  store: DistributorStore,
  raw: string,
  email?: string,
  cartProductIds?: string[],
): { ok: true; code: DiscountCode } | { ok: false; reason: string } {
  const code = store.discountCodes.find(c => c.code.toLowerCase() === raw.trim().toLowerCase());
  if (!code) return { ok: false, reason: 'That code isn’t valid for this store.' };
  if (!code.active) return { ok: false, reason: 'This code is no longer active.' };
  const today = new Date().toISOString().slice(0, 10);
  if (code.expiresAt && today > code.expiresAt) return { ok: false, reason: 'This code has expired.' };
  if (code.maxUses != null && code.usedCount >= code.maxUses) return { ok: false, reason: 'This code has reached its usage limit.' };
  if (code.userEmails.length) {
    if (!email) return { ok: false, reason: 'Sign in to use this code.' };
    if (!code.userEmails.some(e => e.toLowerCase() === email.toLowerCase())) {
      return { ok: false, reason: 'This code isn’t available on your account.' };
    }
  }
  if (code.productIds.length && cartProductIds && !cartProductIds.some(id => code.productIds.includes(id))) {
    return { ok: false, reason: 'This code doesn’t apply to anything in your cart.' };
  }
  return { ok: true, code };
}

/** Minimal line shape the totals engine needs — the storefront cart maps onto this. */
export interface CartLineInput { productId: string; qty: number; customized?: boolean }

export interface CartTotals {
  units: number;
  subtotal: number;
  volumeDiscountPct: number;
  volumeDiscount: number;
  userDiscountPct: number;
  userDiscount: number;
  codeDiscount: number;
  freeShipping: boolean;
  shipping: number;
  total: number;
}

const cents = (v: number) => Math.round(v * 100) / 100;

/**
 * One composition path for every money display: subtotal → volume tier →
 * user discount → discount code → shipping. Each discount applies to the
 * running remainder so stacked discounts can never exceed 100%.
 */
export function computeCartTotals(
  store: DistributorStore,
  lines: CartLineInput[],
  opts: { email?: string; code?: DiscountCode | null; shippingMethodId?: ShippingMethodId } = {},
): CartTotals {
  const units = lines.reduce((a, l) => a + l.qty, 0);
  const lineTotal = (l: CartLineInput) => {
    const p = PRODUCTS.find(x => x.id === l.productId);
    if (!p) return 0;
    return (retailPrice(store, p) + (l.customized ? CUSTOMIZATION_UPCHARGE : 0)) * l.qty;
  };
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);

  const tier = tierFor(store, units);
  const volumeDiscountPct = tier?.discountPct ?? 0;
  const volumeDiscount = subtotal * volumeDiscountPct / 100;
  let remaining = subtotal - volumeDiscount;

  const userDiscountPct = userDiscountPctFor(store, opts.email);
  const userDiscount = remaining * userDiscountPct / 100;
  remaining -= userDiscount;

  let codeDiscount = 0;
  let freeShipping = false;
  const code = opts.code;
  if (code) {
    // product-restricted codes discount only the eligible lines' share of the remainder
    const eligibleSubtotal = code.productIds.length
      ? lines.filter(l => code.productIds.includes(l.productId)).reduce((a, l) => a + lineTotal(l), 0)
      : subtotal;
    const eligibleRemaining = subtotal > 0 ? remaining * (eligibleSubtotal / subtotal) : 0;
    if (code.type === 'percent') codeDiscount = eligibleRemaining * code.value / 100;
    else if (code.type === 'fixed') codeDiscount = Math.min(code.value, eligibleRemaining);
    else freeShipping = true;
  }
  remaining -= codeDiscount;

  const shipping = freeShipping ? 0 : shippingMethod(opts.shippingMethodId).price;

  return {
    units,
    subtotal: cents(subtotal),
    volumeDiscountPct,
    volumeDiscount: cents(volumeDiscount),
    userDiscountPct,
    userDiscount: cents(userDiscount),
    codeDiscount: cents(codeDiscount),
    freeShipping,
    shipping: cents(shipping),
    total: cents(Math.max(0, remaining + shipping)),
  };
}

// ── Product content defaults (Products tab editor + storefront PDP) ──────────

const BRAND_BLURBS: Record<string, string> = {
  'Nike': 'Founded at the University of Oregon track, Nike engineers performance gear trusted by athletes at every level — from first practice to championship day.',
  'Bella + Canvas': 'Bella + Canvas makes the softest tees in the game, cut and sewn with eco-conscious processes in a platinum-certified WRAP facility.',
  'Carhartt': 'Since 1889, Carhartt has built rugged workwear that outlasts the job — union-made heritage, triple-stitched seams, zero compromises.',
  'Stanley/Stella': 'Stanley/Stella crafts premium organic-cotton staples in certified factories — fashion-fit silhouettes with a radically transparent supply chain.',
  'Gildan': 'Gildan is the world’s go-to blank apparel maker — reliable fits, consistent sizing, and mills powered increasingly by renewable energy.',
  'Under Armour': 'Born from a football field insight about sweat-soaked cotton, Under Armour builds moisture-wicking performance gear for training and game day.',
  'TravisMathew': 'TravisMathew brings Southern California ease to premium apparel and headwear — clean lines, soft hand feel, clubhouse-to-street versatility.',
  'Hydro Flask': 'Hydro Flask started at a Bend, Oregon farmers market and now sets the standard for insulated stainless drinkware with TempShield technology.',
  'Klean Kanteen': 'Family-owned and climate-neutral certified, Klean Kanteen pioneered the stainless water bottle and gives 1% of sales to environmental causes.',
  'Baggu': 'Baggu designs simple, functional bags with playful color — durable recycled materials and a cult following from farmers markets to fashion week.',
  'Adidas': 'Three stripes, endless history — adidas blends sport heritage with everyday utility, increasingly built from recycled and renewed materials.',
  'Patagonia': 'Patagonia builds the best product while causing no unnecessary harm — Fair Trade sewn, recycled fabrics, and guaranteed for life.',
  'The North Face': 'Born in Berkeley in 1966, The North Face equips explorers everywhere — summit-tested insulation and fabrics that shrug off the elements.',
  'Tentree': 'Every Tentree item plants ten trees. Earth-first fabrics, certified B Corp, and over 100 million trees in the ground so far.',
  'Marine Layer': 'Marine Layer makes absurdly soft clothes from custom MicroModal fabric — designed in San Francisco for permanent weekend energy.',
  'Vans': 'Since 1966, Vans has been the original action-sports footwear brand — waffle soles, canvas classics, and creative self-expression.',
  'Casetify': 'Casetify turns phones into canvases — impact-tested protection, UV-printed artwork, and collabs with artists worldwide.',
  'Fujifilm': 'Fujifilm’s instax line made photography tangible again — instant credit-card prints that turn any event into a keepsake.',
  'Le Creuset': 'Cast in the same French foundry since 1925, Le Creuset enameled cookware is passed down generations — color, craft, and lifetime durability.',
};

export function defaultProductContent(product: Product): StoreProductContent {
  const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
  const specs = [
    `Decoration: ${chip.label}`,
    `Available sizes: ${product.sizes.join(', ')}`,
    `Colorways: ${product.colors.map(c => c.name).join(', ')}`,
    product.shippingIncluded ? 'Printed on demand — no minimums' : `Minimum order: ${product.minQuantity ?? 1} units`,
    product.leadTimeDays ? `Production lead time: ${product.leadTimeDays} days` : 'Ships in 3–5 business days',
  ].join('\n');
  return {
    description: product.description,
    specifications: specs,
    aboutBrand: BRAND_BLURBS[product.brand]
      ?? `${product.brand} is a trusted name in its category, chosen for consistent quality and dependable decoration results.`,
    custom: null,
  };
}

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

/** Wide hero banner as an inline SVG data URI (kept tiny vs. real photography). */
function bannerSvg(bg: string, accent: string, accent2: string): string {
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 480">
<rect width="1600" height="480" fill="${bg}"/>
<path d="M-100 480 L500 -80 L640 -80 L40 480 Z" fill="${accent}" opacity="0.16"/>
<path d="M200 480 L800 -80 L870 -80 L270 480 Z" fill="${accent}" opacity="0.32"/>
<path d="M1100 480 L1500 80 L1600 80 L1600 200 L1320 480 Z" fill="${accent2}" opacity="0.22"/>
<circle cx="1380" cy="120" r="180" fill="${accent}" opacity="0.10"/>
<circle cx="120" cy="60" r="90" fill="${accent2}" opacity="0.12"/>
</svg>`);
}

const RAW_SEED_STORES: RawStore[] = [
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
    productIds: ['13', '27', '5', '22', '4', '15', '25', '2', '8', '6', '14'],
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
    bannerImage: bannerSvg('#0e1116', '#c8f135', '#5eead4'),
    brandPalette: ['#0d1b2a', '#c8f135', '#f5f7fa'],
    discountCodes: [
      { id: 'dc-welcome', code: 'WELCOME10', type: 'percent', value: 10, expiresAt: null, maxUses: null, usedCount: 38, userEmails: [], productIds: [], active: true, createdAt: '2026-06-01' },
      { id: 'dc-team', code: 'TEAM25', type: 'fixed', value: 25, expiresAt: '2026-09-01', maxUses: 100, usedCount: 12, userEmails: [], productIds: [], active: true, createdAt: '2026-06-20' },
      { id: 'dc-ship', code: 'FALLKIT', type: 'free-shipping', value: 0, expiresAt: '2026-08-15', maxUses: null, usedCount: 51, userEmails: [], productIds: [], active: true, createdAt: '2026-07-01' },
    ],
    users: {
      enabled: true,
      users: [
        { id: 'u-1', name: 'Dana Alvarez', email: 'd.alvarez@ridgelineunited.org', role: 'Coach', department: 'U12', isAdmin: true, discountPct: 15, source: 'csv', addedAt: '2026-06-15' },
        { id: 'u-2', name: 'Karen Mitchell', email: 'k.mitchell@ridgelineunited.org', role: 'Team Manager', department: 'U12', isAdmin: false, discountPct: 10, source: 'csv', addedAt: '2026-06-15' },
        { id: 'u-3', name: 'Jordan Whitfield', email: 'j.whitfield@ridgelineunited.org', role: 'Booster Club', department: 'Club', isAdmin: false, discountPct: 10, source: 'csv', addedAt: '2026-06-15' },
        { id: 'u-4', name: 'Priya Raman', email: 'priya.raman@gmail.com', role: 'Parent', department: 'U10', isAdmin: false, source: 'csv', addedAt: '2026-06-15' },
        { id: 'u-5', name: 'Tom Okafor', email: 'tom.okafor@gmail.com', role: 'Parent', department: 'U14', isAdmin: false, source: 'csv', addedAt: '2026-06-15' },
        { id: 'u-6', name: 'Sarah Jennings', email: 's.jennings@outlook.com', role: 'Parent', department: 'U10', isAdmin: false, source: 'csv', addedAt: '2026-06-15' },
      ],
      rules: [
        { id: 'r-1', field: 'role', value: 'Coach', effect: 'discount', discountPct: 15 },
        { id: 'r-2', field: 'emailDomain', value: 'ridgelineunited.org', effect: 'discount', discountPct: 10 },
      ],
    },
    seo: {
      metaTitle: 'Ridgeline United FC Official Team Store — Jerseys, Hoodies & Fan Gear',
      metaDescription: 'Shop official Ridgeline United FC gear. Jerseys, hoodies, beanies and training kit for players, parents and fans — printed on demand, shipped to your door.',
      keywords: 'ridgeline united, team store, soccer merch, spirit wear, club gear',
    },
  },
  {
    id: 'st-driftwood',
    slug: 'driftwood-coffee',
    name: 'Driftwood Coffee Merch',
    clientName: 'Driftwood Coffee Roasters',
    clientType: 'Restaurant',
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
    productIds: ['27', '22', '25', '6', '8', '2', '16', '26', '3'],
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
    bannerImage: bannerSvg('#0f172a', '#4f46e5', '#06b6d4'),
    brandPalette: ['#4f46e5', '#06b6d4', '#0f172a'],
    discountCodes: [
      { id: 'dc-newhire', code: 'NEWHIRE', type: 'percent', value: 100, expiresAt: null, maxUses: null, usedCount: 41, userEmails: ['onboarding@meridianco.com'], productIds: [], active: true, createdAt: '2026-06-05' },
      { id: 'dc-summit', code: 'SUMMIT20', type: 'percent', value: 20, expiresAt: '2026-09-30', maxUses: 200, usedCount: 87, userEmails: [], productIds: [], active: true, createdAt: '2026-06-28' },
    ],
    users: {
      enabled: true,
      users: [
        { id: 'u-1', name: 'Dana Whitworth', email: 'dana.w@meridianco.com', role: 'Partner', department: 'Leadership', isAdmin: true, discountPct: 20, source: 'manual', addedAt: '2026-06-05' },
        { id: 'u-2', name: 'Marcus Lee', email: 'marcus.lee@meridianco.com', role: 'Designer', department: 'Studio', isAdmin: false, source: 'csv', addedAt: '2026-06-05' },
        { id: 'u-3', name: 'Ana Kowalski', email: 'ana.k@meridianco.com', role: 'Producer', department: 'Studio', isAdmin: false, source: 'csv', addedAt: '2026-06-05' },
        { id: 'u-4', name: 'People Ops', email: 'onboarding@meridianco.com', role: 'Operations', department: 'People', isAdmin: true, discountPct: 100, source: 'manual', addedAt: '2026-06-05' },
      ],
      rules: [
        { id: 'r-1', field: 'emailDomain', value: 'meridianco.com', effect: 'discount', discountPct: 10 },
      ],
    },
    seo: {
      metaTitle: 'Meridian & Co. Brand Store — Premium Agency Apparel & Gifts',
      metaDescription: 'Client gifting and team essentials for Meridian & Co. Premium branded apparel and everyday carry, decorated on demand.',
      keywords: 'meridian, agency merch, client gifts, branded apparel',
    },
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
    productIds: ['27', '13', '4', '25', '2', '6'],
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
    productIds: ['13', '27', '15', '25', '2', '8'],
    featuredIds: ['13', '25'],
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
    productIds: ['5', '4', '15', '25'],
    featuredIds: ['5'],
    hiddenIds: [],
    pricing: { globalMarkupPct: 25, productOverrides: {}, volumeTiers: [{ qty: 24, discountPct: 15 }], showBulkSavings: true },
    settings: { access: 'email-list', payment: 'card', bulkOrdering: true, logoPicker: false },
    stats: { revenue30d: 0, orders30d: 0, visitors30d: 12, margin30d: 0 },
    orders: seedOrders('NG', [
      ['Field ops — spring uniforms', 60, 2280.0, 'Delivered', 'May 12'],
    ], 0.2),
    users: {
      enabled: true,
      users: [
        { id: 'u-1', name: 'Ray Delgado', email: 'r.delgado@northgatehvac.com', role: 'Field Supervisor', department: 'Field Ops', isAdmin: true, discountPct: 20, source: 'csv', addedAt: '2026-05-01' },
        { id: 'u-2', name: 'Sam Porter', email: 's.porter@northgatehvac.com', role: 'Technician', department: 'Field Ops', isAdmin: false, source: 'csv', addedAt: '2026-05-01' },
        { id: 'u-3', name: 'Lena Fischer', email: 'l.fischer@northgatehvac.com', role: 'Technician', department: 'Field Ops', isAdmin: false, source: 'csv', addedAt: '2026-05-01' },
        { id: 'u-4', name: 'Office — Dispatch', email: 'dispatch@northgatehvac.com', role: 'Dispatch', department: 'Office', isAdmin: false, source: 'csv', addedAt: '2026-05-01' },
      ],
      rules: [
        { id: 'r-1', field: 'emailDomain', value: 'northgatehvac.com', effect: 'discount', discountPct: 100 },
      ],
    },
  },
  {
    id: 'st-bluebird',
    slug: 'bluebird-bakery',
    name: 'Bluebird Bakery Shop',
    clientName: 'Bluebird Bakery',
    clientType: 'Restaurant',
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

export const SEED_STORES: DistributorStore[] = RAW_SEED_STORES.map(normalizeStore);

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
    id: 'full-catalog',
    name: 'Full Catalog',
    desc: 'Start from the complete catalog — every style, color and size — then curate down.',
    emoji: '📦',
    productIds: PRODUCTS.filter(p => p.image.startsWith('/') && p.id !== '9').map(p => p.id),
    suggestedThemeId: 'modern',
  },
  {
    id: 'team-sports',
    name: 'Team Sports Store',
    desc: 'Performance tees, hoodies, beanies and sideline gear — built for leagues, clubs and spirit wear.',
    emoji: '🏆',
    productIds: ['13', '27', '5', '22', '4', '15', '25', '2', '8', '6', '14'],
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
    name: 'Retail & Hospitality Store',
    desc: 'Heavyweight tees, cozy knits, totes and counter-side merch for shops with a loyal following.',
    emoji: '☕',
    productIds: ['27', '22', '25', '6', '8', '2', '16', '26', '3'],
    suggestedThemeId: 'artisan',
  },
];

export { initialsLogo, svgUri };
