import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, CreditCard, Loader2, Lock, Tag, Truck, Wallet, X } from 'lucide-react';
import { CUSTOMIZATION_UPCHARGE, SHIPPING_METHODS, fmtMoney, retailPrice, validateDiscount } from '../data/storesData';
import { productById, SfButton, useSf } from './StorefrontShell';

const field = 'w-full h-12 px-3.5 text-[13.5px] outline-none bg-transparent';
const fieldWrap = { border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', background: 'var(--sf-surface)' } as const;

function arrivalLabel(etaDays: [number, number]): string {
  const fmt = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  return etaDays[0] === etaDays[1] ? `Arrives ${fmt(etaDays[0])}` : `Arrives ${fmt(etaDays[0])} – ${fmt(etaDays[1])}`;
}

export function StorefrontCheckout() {
  const {
    store, theme, lines, totals, clearCart, shopper, setShopper, placeShopperOrder,
    appliedCode, setAppliedCode, shippingMethodId, setShippingMethodId,
  } = useSf();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [email, setEmail] = useState(shopper?.email ?? 'jordan@example.com');
  const [firstName, setFirstName] = useState(shopper?.name?.split(' ')[0] ?? 'Jordan');
  const [lastName, setLastName] = useState(shopper?.name?.split(' ').slice(1).join(' ') ?? 'Avery');
  const [createAccount, setCreateAccount] = useState(true);
  const usePoints = store.settings.payment !== 'card';
  const pointsBalance = 150;
  const pointsApplied = usePoints ? Math.min(pointsBalance, totals.total) : 0;
  const cardDue = Math.max(0, totals.total - pointsApplied);

  // recognize approved users as they type their email so member discounts apply live
  useEffect(() => {
    const lower = email.trim().toLowerCase();
    const member = store.users.users.find(u => u.email === lower);
    if (member && shopper?.email !== lower) setShopper({ email: lower, name: member.name });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const applyCode = () => {
    const result = validateDiscount(store, codeInput, shopper?.email, lines.map(l => l.productId));
    if (result.ok) {
      setAppliedCode(result.code);
      setCodeError('');
      setCodeInput('');
    } else {
      setCodeError(result.reason);
    }
  };

  if (lines.length === 0 && !placing) {
    return (
      <div className="max-w-[600px] mx-auto px-5 py-24 text-center">
        <p className="text-[15px] font-semibold mb-2">Your cart is empty.</p>
        <Link to={`/store/${store.slug}/shop`} className="font-bold text-[14px]" style={{ color: 'var(--sf-primary)' }}>← Keep shopping</Link>
      </div>
    );
  }

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const order = placeShopperOrder({
        email: email.trim() || 'guest@example.com',
        name: `${firstName} ${lastName}`.trim() || undefined,
        pointsApplied,
        createAccount,
      });
      sessionStorage.setItem(`sf_last_order_${store.slug}`, JSON.stringify({ orderNo: order.id, total: cardDue, points: pointsApplied, units: totals.units }));
      clearCart();
      navigate(`/store/${store.slug}/confirmed`);
    }, 1800);
  };

  return (
    <div className="max-w-[1080px] mx-auto px-5 md:px-10 pt-8 pb-10">
      <Link to={`/store/${store.slug}/shop`} className="inline-flex items-center gap-1 text-[12.5px] font-bold mb-6 hover:opacity-70" style={{ color: 'var(--sf-sub)' }}>
        <ChevronLeft className="w-4 h-4" /> Continue shopping
      </Link>

      <h1 className="text-[32px] mb-8" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
        Checkout
      </h1>

      <div className="grid lg:grid-cols-5 gap-10 items-start">
        {/* ── Forms ── */}
        <div className="lg:col-span-3 space-y-8">
          <section>
            <h2 className="text-[15px] font-bold mb-3">Contact</h2>
            <div style={fieldWrap}>
              <input className={field} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={{ color: 'var(--sf-ink)' }} />
            </div>
            {!shopper && (
              <label className="mt-2.5 flex items-center gap-2.5 cursor-pointer text-[12.5px]" style={{ color: 'var(--sf-sub)' }}>
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={e => setCreateAccount(e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--sf-primary)' }}
                />
                Create an account to track this order and see your history
              </label>
            )}
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-3">Shipping address</h2>
            <div className="grid grid-cols-2 gap-3">
              <div style={fieldWrap}><input className={field} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ color: 'var(--sf-ink)' }} /></div>
              <div style={fieldWrap}><input className={field} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} style={{ color: 'var(--sf-ink)' }} /></div>
              <div className="col-span-2" style={fieldWrap}><input className={field} placeholder="Street address" defaultValue="482 Juniper Lane" style={{ color: 'var(--sf-ink)' }} /></div>
              <div style={fieldWrap}><input className={field} placeholder="City" defaultValue="Boulder" style={{ color: 'var(--sf-ink)' }} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div style={fieldWrap}><input className={field} placeholder="State" defaultValue="CO" style={{ color: 'var(--sf-ink)' }} /></div>
                <div style={fieldWrap}><input className={field} placeholder="ZIP" defaultValue="80302" style={{ color: 'var(--sf-ink)' }} /></div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-bold mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Shipping method
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {SHIPPING_METHODS.map(m => {
                const active = shippingMethodId === m.id;
                const free = totals.freeShipping;
                return (
                  <button
                    key={m.id}
                    onClick={() => setShippingMethodId(m.id)}
                    className="text-left p-3.5 transition-colors"
                    style={{
                      border: '1.5px solid',
                      borderColor: active ? 'var(--sf-primary)' : 'var(--sf-border)',
                      background: active ? 'color-mix(in srgb, var(--sf-primary) 7%, var(--sf-surface))' : 'var(--sf-surface)',
                      borderRadius: 'var(--sf-radius)',
                    }}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13.5px] font-bold">{m.label}</span>
                      <span className="text-[13px] font-bold" style={{ color: active ? 'var(--sf-primary)' : 'var(--sf-ink)' }}>
                        {free || m.price === 0 ? 'Free' : fmtMoney(m.price)}
                      </span>
                    </div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--sf-sub)' }}>{arrivalLabel(m.etaDays)}</div>
                    {free && m.price > 0 && <div className="text-[10.5px] font-bold mt-0.5" style={{ color: 'var(--sf-accent)' }}>Free shipping code applied</div>}
                  </button>
                );
              })}
            </div>
          </section>

          {usePoints && (
            <section>
              <h2 className="text-[15px] font-bold mb-3 flex items-center gap-2"><Wallet className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Your points</h2>
              <div className="flex items-center justify-between px-4 py-3.5" style={{ ...fieldWrap, borderColor: 'var(--sf-primary)' }}>
                <span className="text-[13.5px] font-semibold">Balance: {pointsBalance} pts</span>
                <span className="text-[13.5px] font-bold" style={{ color: 'var(--sf-primary)' }}>−{fmtMoney(pointsApplied)} applied</span>
              </div>
            </section>
          )}

          {(cardDue > 0 || !usePoints) && (
            <section>
              <h2 className="text-[15px] font-bold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: 'var(--sf-primary)' }} /> Payment
                <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--sf-sub)' }}>
                  <Lock className="w-3 h-3" /> Secured by Stripe
                </span>
              </h2>
              <div className="space-y-3">
                <div style={fieldWrap}><input className={field} placeholder="Card number" defaultValue="4242 4242 4242 4242" style={{ color: 'var(--sf-ink)' }} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1" style={fieldWrap}><input className={field} placeholder="MM / YY" defaultValue="08 / 28" style={{ color: 'var(--sf-ink)' }} /></div>
                  <div style={fieldWrap}><input className={field} placeholder="CVC" defaultValue="123" style={{ color: 'var(--sf-ink)' }} /></div>
                  <div style={fieldWrap}><input className={field} placeholder="ZIP" defaultValue="80302" style={{ color: 'var(--sf-ink)' }} /></div>
                </div>
              </div>
            </section>
          )}

          <SfButton className="w-full h-14 text-[15px]" onClick={placeOrder} disabled={placing}>
            {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</> : <>Pay {fmtMoney(cardDue)}{pointsApplied > 0 && ` + ${Math.round(pointsApplied)} pts`}</>}
          </SfButton>
          <p className="text-[11px] text-center -mt-4" style={{ color: 'var(--sf-sub)' }}>
            Demo checkout — no card is charged.
          </p>
        </div>

        {/* ── Summary ── */}
        <aside className="lg:col-span-2 p-5 lg:sticky lg:top-24" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: `calc(var(--sf-radius) * 1.4)` }}>
          <h2 className="text-[15px] font-bold mb-4">Order summary</h2>
          <div className="space-y-3.5 mb-5 max-h-72 overflow-y-auto pr-1">
            {lines.map(line => {
              const p = productById(line.productId);
              if (!p) return null;
              return (
                <div key={line.key} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-white shrink-0 flex items-center justify-center p-1" style={{ borderRadius: 'calc(var(--sf-radius)/1.3)', border: '1px solid var(--sf-border)' }}>
                    {p.image.startsWith('/')
                      ? <img src={p.image} alt="" className="max-w-full max-h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
                      : <span>{p.image}</span>}
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: 'var(--sf-ink)', color: 'var(--sf-bg)' }}>
                      {line.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold truncate">{p.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--sf-sub)' }}>
                      Size {line.size}{line.customization && ' · Customized'}
                    </div>
                  </div>
                  <span className="text-[12.5px] font-bold">
                    {fmtMoney((retailPrice(store, p) + (line.customization ? CUSTOMIZATION_UPCHARGE : 0)) * line.qty)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Discount code */}
          <div className="pb-4">
            {appliedCode ? (
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ border: '1.5px dashed var(--sf-primary)', borderRadius: 'var(--sf-radius)', background: 'color-mix(in srgb, var(--sf-primary) 6%, transparent)' }}>
                <Tag className="w-3.5 h-3.5" style={{ color: 'var(--sf-primary)' }} />
                <span className="text-[12.5px] font-bold font-mono">{appliedCode.code}</span>
                <span className="text-[11.5px]" style={{ color: 'var(--sf-sub)' }}>
                  {appliedCode.type === 'percent' ? `${appliedCode.value}% off` : appliedCode.type === 'fixed' ? `$${appliedCode.value} off` : 'Free shipping'}
                </span>
                <button onClick={() => setAppliedCode(null)} className="ml-auto hover:opacity-70" style={{ color: 'var(--sf-sub)' }}><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="flex-1" style={fieldWrap}>
                    <input
                      className="w-full h-11 px-3 text-[12.5px] uppercase outline-none bg-transparent"
                      placeholder="Discount code"
                      value={codeInput}
                      onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCode()}
                      style={{ color: 'var(--sf-ink)' }}
                    />
                  </div>
                  <button
                    onClick={applyCode}
                    disabled={!codeInput.trim()}
                    className="h-11 px-4 text-[12.5px] font-bold disabled:opacity-40 hover:opacity-80"
                    style={{ border: '1.5px solid var(--sf-border)', borderRadius: 'var(--sf-radius)', color: 'var(--sf-ink)' }}
                  >
                    Apply
                  </button>
                </div>
                {codeError && <p className="mt-1.5 text-[11.5px] font-semibold text-red-500">{codeError}</p>}
              </>
            )}
          </div>

          <div className="space-y-2 pt-4 text-[13px]" style={{ borderTop: '1px solid var(--sf-border)' }}>
            <div className="flex justify-between" style={{ color: 'var(--sf-sub)' }}>
              <span>Subtotal ({totals.units} items)</span><span>{fmtMoney(totals.subtotal)}</span>
            </div>
            {totals.volumeDiscount > 0 && (
              <div className="flex justify-between font-bold" style={{ color: 'var(--sf-accent)' }}>
                <span>Volume discount ({totals.volumeDiscountPct}%)</span><span>−{fmtMoney(totals.volumeDiscount)}</span>
              </div>
            )}
            {totals.userDiscount > 0 && (
              <div className="flex justify-between font-bold" style={{ color: 'var(--sf-accent)' }}>
                <span>Member discount ({totals.userDiscountPct}%)</span><span>−{fmtMoney(totals.userDiscount)}</span>
              </div>
            )}
            {appliedCode && totals.codeDiscount > 0 && (
              <div className="flex justify-between font-bold" style={{ color: 'var(--sf-accent)' }}>
                <span>Promo {appliedCode.code}</span><span>−{fmtMoney(totals.codeDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between" style={{ color: 'var(--sf-sub)' }}>
              <span>Shipping ({SHIPPING_METHODS.find(m => m.id === shippingMethodId)?.label})</span>
              <span className="font-semibold" style={{ color: totals.shipping === 0 ? 'var(--sf-primary)' : 'var(--sf-ink)' }}>
                {totals.shipping === 0 ? 'Free' : fmtMoney(totals.shipping)}
              </span>
            </div>
            {pointsApplied > 0 && (
              <div className="flex justify-between font-bold" style={{ color: 'var(--sf-primary)' }}>
                <span>Points applied</span><span>−{fmtMoney(pointsApplied)}</span>
              </div>
            )}
            <div className="flex justify-between text-[17px] font-bold pt-2">
              <span>Total due</span><span>{fmtMoney(cardDue)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function StorefrontConfirmed() {
  const { store, theme } = useSf();
  let order = { orderNo: `${store.slug.slice(0, 2).toUpperCase()}-1042`, total: 0, points: 0, units: 0 };
  try { order = { ...order, ...JSON.parse(sessionStorage.getItem(`sf_last_order_${store.slug}`) ?? '{}') }; } catch { /* defaults */ }

  return (
    <div className="max-w-[640px] mx-auto px-5 pt-16 pb-10 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--sf-primary) 14%, transparent)' }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--sf-primary)' }} />
      </div>
      <h1 className="text-[34px] mb-2" style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, textTransform: theme.displayTransform }}>
        Order confirmed!
      </h1>
      <p className="text-[14px] mb-8" style={{ color: 'var(--sf-sub)' }}>
        Order <b style={{ color: 'var(--sf-ink)' }}>#{order.orderNo}</b> · {order.units} item{order.units === 1 ? '' : 's'} · {fmtMoney(order.total)}
        {order.points > 0 && ` + ${Math.round(order.points)} pts`} — a confirmation email is on its way.
      </p>

      <div className="text-left p-5 mb-8" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: `calc(var(--sf-radius) * 1.4)` }}>
        <div className="text-[12px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--sf-sub)' }}>What happens next</div>
        {[
          ['Now', 'Your artwork files are generated and sent to production'],
          ['1–2 days', `Items are decorated on demand (no minimums, no waste)`],
          ['3–5 days', 'Your order ships with tracking — duties & taxes already covered'],
        ].map(([when, what], i) => (
          <div key={i} className="flex gap-4 items-start mb-3 last:mb-0">
            <span className="text-[11px] font-bold w-16 shrink-0 pt-0.5" style={{ color: 'var(--sf-primary)' }}>{when}</span>
            <span className="text-[13px]" style={{ color: 'var(--sf-ink)' }}>{what}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link to={`/store/${store.slug}/account/orders/${order.orderNo}`}>
          <SfButton>Track this order</SfButton>
        </Link>
        <Link to={`/store/${store.slug}`}>
          <SfButton kind="ghost">Back to {store.clientName}</SfButton>
        </Link>
      </div>
    </div>
  );
}
