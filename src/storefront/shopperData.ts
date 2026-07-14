// Shopper-side order history — persisted per store in localStorage.

import type { ShippingMethodId } from '../data/storesData';
import { shippingMethod } from '../data/storesData';
import type { LineCustomization } from './StorefrontShell';

export interface ShopperOrderLine {
  productId: string;
  size: string;
  qty: number;
  logoId: string;
  unitPrice: number;
  customization?: LineCustomization;
}

export interface ShopperOrder {
  id: string;               // shared with the admin-side StoreOrder record
  storeId: string;
  slug: string;
  email: string;
  name?: string;
  placedAt: string;         // ISO datetime
  lines: ShopperOrderLine[];
  totals: {
    units: number; subtotal: number; volumeDiscount: number; userDiscount: number;
    codeDiscount: number; shipping: number; pointsApplied: number; total: number;
  };
  discountCode?: string;
  shippingMethodId: ShippingMethodId;
}

const key = (slug: string) => `sf_orders_${slug}`;

export function loadShopperOrders(slug: string): ShopperOrder[] {
  try { return JSON.parse(localStorage.getItem(key(slug)) ?? '[]'); } catch { return []; }
}

export function appendShopperOrder(order: ShopperOrder): void {
  try {
    localStorage.setItem(key(order.slug), JSON.stringify([order, ...loadShopperOrders(order.slug)]));
  } catch { /* quota — demo data only */ }
}

// ── Derived status — orders "advance" on their own as demo time passes ───────

export type ShopperOrderStatus = 'processing' | 'in-production' | 'shipped' | 'delivered';

export interface TrackingStep { id: ShopperOrderStatus; label: string; detail: string; at: Date; done: boolean }

const STATUS_LABELS: Record<ShopperOrderStatus, string> = {
  'processing': 'Order received',
  'in-production': 'In production',
  'shipped': 'Shipped',
  'delivered': 'Delivered',
};

export function orderStatusLabel(s: ShopperOrderStatus): string { return STATUS_LABELS[s]; }

/** Fake but consistent tracking number derived from the order id. */
export function trackingNumber(orderId: string): string {
  let h = 0;
  for (const ch of orderId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `1Z${(h % 900 + 100)}${orderId.replace(/[^0-9]/g, '').padEnd(4, '7').slice(0, 4)}03${(h % 9000 + 1000)}`;
}

export function orderTimeline(order: ShopperOrder): { status: ShopperOrderStatus; steps: TrackingStep[] } {
  const placed = new Date(order.placedAt);
  const hours = (n: number) => new Date(placed.getTime() + n * 3600_000);
  const shipDays = 3;
  const deliverDays = shipDays + shippingMethod(order.shippingMethodId).etaDays[1];

  const steps: Omit<TrackingStep, 'done'>[] = [
    { id: 'processing', label: STATUS_LABELS['processing'], detail: 'Artwork files generated and sent to production', at: placed },
    { id: 'in-production', label: STATUS_LABELS['in-production'], detail: 'Items are being decorated on demand', at: hours(12) },
    { id: 'shipped', label: STATUS_LABELS['shipped'], detail: `Tracking ${trackingNumber(order.id)}`, at: hours(shipDays * 24) },
    { id: 'delivered', label: STATUS_LABELS['delivered'], detail: 'Left at the front door', at: hours(deliverDays * 24) },
  ];

  const now = new Date();
  const done = steps.map(s => ({ ...s, done: now >= s.at }));
  const status = [...done].reverse().find(s => s.done)?.id ?? 'processing';
  return { status, steps: done };
}
