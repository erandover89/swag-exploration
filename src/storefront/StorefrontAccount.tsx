import { useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, LogOut, Mail, Package, User } from 'lucide-react';
import { fmtMoney, shippingMethod, userDiscountPctFor } from '../data/storesData';
import { productById, SfButton, useSf } from './StorefrontShell';
import {
  loadShopperOrders, orderStatusLabel, orderTimeline, trackingNumber,
  type ShopperOrder, type ShopperOrderStatus,
} from './shopperData';

const STATUS_COLORS: Record<ShopperOrderStatus, string> = {
  'processing': 'var(--sf-sub)',
  'in-production': 'var(--sf-accent)',
  'shipped': 'var(--sf-primary)',
  'delivered': 'var(--sf-primary)',
};

function StatusPill({ status }: { status: ShopperOrderStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: `color-mix(in srgb, ${STATUS_COLORS[status]} 14%, transparent)`, color: STATUS_COLORS[status] }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />
      {orderStatusLabel(status)}
    </span>
  );
}

function SignIn() {
  const { store, theme, setShopper } = useSf();
  const [email, setEmail] = useState('');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const lower = email.trim().toLowerCase();
    const member = store.users.users.find(u => u.email === lower);
    setShopper({ email: lower, name: member?.name });
  };

  return (
    <div className="max-w-[420px] mx-auto px-5 pt-16 pb-10 text-center">
      <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--sf-primary) 12%, transparent)' }}>
        <User className="w-6 h-6" style={{ color: 'var(--sf-primary)' }} />
      </div>
      <h1 className="text-[28px] mb-2" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
        Your account
      </h1>
      <p className="text-[13.5px] mb-7" style={{ color: 'var(--sf-sub)' }}>
        Enter the email you used at checkout to see your orders and track deliveries.
      </p>
      <form onSubmit={signIn}>
        <div className="flex items-center gap-2 px-3.5 h-12 mb-3" style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', background: 'var(--sf-surface)' }}>
          <Mail className="w-4 h-4" style={{ color: 'var(--sf-sub)' }} />
          <input
            type="email" autoFocus
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: 'var(--sf-ink)' }}
          />
        </div>
        <SfButton className="w-full" disabled={!valid}>Sign in</SfButton>
      </form>
      <p className="mt-4 text-[11.5px]" style={{ color: 'var(--sf-sub)' }}>Demo sign-in — no password needed.</p>
    </div>
  );
}

function OrdersList() {
  const { store, theme, shopper, setShopper } = useSf();
  const navigate = useNavigate();
  const orders = useMemo(
    () => loadShopperOrders(store.slug).filter(o => o.email === shopper?.email),
    [store.slug, shopper],
  );
  const memberPct = userDiscountPctFor(store, shopper?.email);
  const member = store.users.users.find(u => u.email === shopper?.email);

  return (
    <div className="max-w-[860px] mx-auto px-5 md:px-10 pt-10 pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-[30px] leading-tight" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
            {member?.name ? `Hi, ${member.name.split(' ')[0]}` : 'Your account'}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--sf-sub)' }}>
            {shopper?.email}
            {memberPct > 0 && <span className="ml-2 font-bold" style={{ color: 'var(--sf-accent)' }}>· Member discount {memberPct}% active</span>}
          </p>
        </div>
        <button
          onClick={() => setShopper(null)}
          className="flex items-center gap-1.5 text-[12.5px] font-bold hover:opacity-70"
          style={{ color: 'var(--sf-sub)' }}
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>

      <h2 className="text-[16px] font-bold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <div className="py-14 text-center" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'calc(var(--sf-radius)*1.4)' }}>
          <Package className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--sf-sub)' }} />
          <p className="text-[14px] font-semibold mb-1">No orders yet on this email</p>
          <Link to={`/store/${store.slug}/shop`} className="text-[13px] font-bold" style={{ color: 'var(--sf-primary)' }}>Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const { status } = orderTimeline(o);
            return (
              <button
                key={o.id}
                onClick={() => navigate(`/store/${store.slug}/account/orders/${o.id}`)}
                className="w-full flex items-center gap-4 p-4 text-left transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'calc(var(--sf-radius)*1.2)' }}
              >
                <div className="flex -space-x-3">
                  {o.lines.slice(0, 3).map((l, i) => {
                    const p = productById(l.productId);
                    return (
                      <div key={i} className="w-12 h-12 bg-white flex items-center justify-center p-1 shrink-0" style={{ borderRadius: 'calc(var(--sf-radius)/1.3)', border: '1px solid var(--sf-border)' }}>
                        {l.customization?.previewDataUrl
                          ? <img src={l.customization.previewDataUrl} alt="" className="max-w-full max-h-full object-contain" />
                          : p?.image.startsWith('/')
                            ? <img src={p.image} alt="" className="max-w-full max-h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                            : <span>{p?.image}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold">#{o.id}</div>
                  <div className="text-[12px]" style={{ color: 'var(--sf-sub)' }}>
                    {new Date(o.placedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {o.totals.units} item{o.totals.units !== 1 ? 's' : ''} · {fmtMoney(o.totals.total)}
                  </div>
                </div>
                <StatusPill status={status} />
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--sf-sub)' }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderDetail() {
  const { store, theme } = useSf();
  const { orderId } = useParams<{ orderId: string }>();
  const order: ShopperOrder | undefined = useMemo(
    () => loadShopperOrders(store.slug).find(o => o.id === orderId),
    [store.slug, orderId],
  );

  if (!order) {
    return (
      <div className="max-w-[640px] mx-auto px-5 py-20 text-center" style={{ color: 'var(--sf-sub)' }}>
        <p className="text-[15px] font-semibold mb-2">We couldn't find that order.</p>
        <Link to={`/store/${store.slug}/account`} className="font-bold" style={{ color: 'var(--sf-primary)' }}>← Back to your account</Link>
      </div>
    );
  }

  const { status, steps } = orderTimeline(order);
  const method = shippingMethod(order.shippingMethodId);

  return (
    <div className="max-w-[860px] mx-auto px-5 md:px-10 pt-10 pb-10">
      <Link to={`/store/${store.slug}/account`} className="inline-flex items-center gap-1 text-[12.5px] font-bold mb-6 hover:opacity-70" style={{ color: 'var(--sf-sub)' }}>
        <ChevronLeft className="w-4 h-4" /> All orders
      </Link>

      <div className="flex items-center gap-4 flex-wrap mb-8">
        <h1 className="text-[28px]" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
          Order #{order.id}
        </h1>
        <StatusPill status={status} />
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Tracking timeline */}
        <div className="md:col-span-3 p-5" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'calc(var(--sf-radius)*1.4)' }}>
          <div className="text-[12px] font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--sf-sub)' }}>
            Tracking · {method.label} shipping
          </div>
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={s.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: s.done ? 'var(--sf-primary)' : 'color-mix(in srgb, var(--sf-sub) 14%, transparent)',
                      color: s.done ? 'var(--sf-primary-ink)' : 'var(--sf-sub)',
                    }}
                  >
                    {s.done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-7 my-1" style={{ background: s.done ? 'var(--sf-primary)' : 'var(--sf-border)', opacity: s.done ? 0.5 : 1 }} />
                  )}
                </div>
                <div className="pb-6">
                  <div className="text-[13.5px] font-bold" style={{ opacity: s.done ? 1 : 0.55 }}>{s.label}</div>
                  <div className="text-[12px]" style={{ color: 'var(--sf-sub)' }}>
                    {s.detail}
                    {' · '}
                    {s.done
                      ? s.at.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : `expected ${s.at.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {status === 'shipped' && (
            <div className="mt-1 text-[12px] font-semibold px-3 py-2 rounded-md" style={{ background: 'color-mix(in srgb, var(--sf-primary) 10%, transparent)' }}>
              📦 Tracking number: <span className="font-mono font-bold">{trackingNumber(order.id)}</span>
            </div>
          )}
        </div>

        {/* Items + totals */}
        <div className="md:col-span-2 p-5" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'calc(var(--sf-radius)*1.4)' }}>
          <div className="text-[12px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--sf-sub)' }}>Items</div>
          <div className="space-y-3 mb-5">
            {order.lines.map((l, i) => {
              const p = productById(l.productId);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white shrink-0 flex items-center justify-center p-1" style={{ borderRadius: 'calc(var(--sf-radius)/1.3)', border: '1px solid var(--sf-border)' }}>
                    {l.customization?.previewDataUrl
                      ? <img src={l.customization.previewDataUrl} alt="" className="max-w-full max-h-full object-contain" />
                      : p?.image.startsWith('/')
                        ? <img src={p.image} alt="" className="max-w-full max-h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                        : <span>{p?.image}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold truncate">{p?.name ?? 'Item'}</div>
                    <div className="text-[11px]" style={{ color: 'var(--sf-sub)' }}>
                      Size {l.size} × {l.qty}{l.customization && ' · Customized'}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold">{fmtMoney(l.unitPrice * l.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-1.5 pt-3 text-[12.5px]" style={{ borderTop: '1px solid var(--sf-border)' }}>
            <div className="flex justify-between" style={{ color: 'var(--sf-sub)' }}><span>Subtotal</span><span>{fmtMoney(order.totals.subtotal)}</span></div>
            {order.totals.volumeDiscount > 0 && <div className="flex justify-between font-bold" style={{ color: 'var(--sf-accent)' }}><span>Volume discount</span><span>−{fmtMoney(order.totals.volumeDiscount)}</span></div>}
            {order.totals.userDiscount > 0 && <div className="flex justify-between font-bold" style={{ color: 'var(--sf-accent)' }}><span>Member discount</span><span>−{fmtMoney(order.totals.userDiscount)}</span></div>}
            {order.discountCode && <div className="flex justify-between font-bold" style={{ color: 'var(--sf-accent)' }}><span>Promo {order.discountCode}</span><span>{order.totals.codeDiscount > 0 ? `−${fmtMoney(order.totals.codeDiscount)}` : 'Free shipping'}</span></div>}
            <div className="flex justify-between" style={{ color: 'var(--sf-sub)' }}><span>Shipping ({method.label})</span><span>{order.totals.shipping === 0 ? 'Free' : fmtMoney(order.totals.shipping)}</span></div>
            {order.totals.pointsApplied > 0 && <div className="flex justify-between font-bold" style={{ color: 'var(--sf-primary)' }}><span>Points</span><span>−{fmtMoney(order.totals.pointsApplied)}</span></div>}
            <div className="flex justify-between text-[15px] font-bold pt-1.5"><span>Total</span><span>{fmtMoney(Math.max(0, order.totals.total - order.totals.pointsApplied))}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StorefrontAccount() {
  const { shopper } = useSf();
  if (!shopper) return <SignIn />;
  return (
    <Routes>
      <Route index element={<OrdersList />} />
      <Route path="orders/:orderId" element={<OrderDetail />} />
    </Routes>
  );
}
