import { useState } from 'react';
import { X, Check, Clock, Package, ChevronRight } from 'lucide-react';
import { type Product } from '../data/mockData';

interface CreateOrderModalProps {
  product: Product;
  onClose: () => void;
  onTryOnDemand?: () => void;
}

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-baseline gap-1.5 text-[13px] font-semibold text-[#012754]">
        {label}
        {required && <span className="text-[#e63946] text-[11px]">*</span>}
        {hint && <span className="text-[12px] font-normal text-[#a6b3c3]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full h-11 border border-[#e0ebf7] rounded-[10px] px-4 text-[13px] text-[#345276] placeholder:text-[#b7cfec] focus:outline-none focus:border-[#3077c9] focus:ring-2 focus:ring-[#3077c9]/10 transition-colors bg-white';

export function CreateOrderModal({ product, onClose, onTryOnDemand }: CreateOrderModalProps) {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [company, setCompany]       = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [quantity, setQuantity]     = useState(product.minQuantity ?? 50);
  const [sendMethod, setSendMethod] = useState<'' | 'individual' | 'bulk'>('');
  const [submitted, setSubmitted]   = useState(false);

  const minQty = product.minQuantity ?? 50;
  const canSubmit = firstName && lastName && email && company && quantity >= minQty && sendMethod;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const isEmoji = !product.image.startsWith('/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-[24px] w-[520px] max-w-full overflow-hidden flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0px 32px_80px rgba(1,39,84,0.28)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {!submitted ? (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="px-8 pt-7 pb-5 border-b border-[#e0ebf7] shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-1">Bulk & Kits</p>
                  <h2
                    className="text-[22px] font-semibold text-[#012754] leading-tight"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    Start an Order
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#f5f8fc] flex items-center justify-center text-[#8093a9] hover:text-[#345276] transition-colors shrink-0 mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product summary */}
              <div className="flex items-center gap-3 p-3 bg-[#f5f8fc] rounded-[12px] border border-[#e0ebf7]">
                <div className="w-10 h-10 rounded-[8px] bg-white border border-[#e0ebf7] flex items-center justify-center overflow-hidden shrink-0">
                  {isEmoji ? (
                    <span className="text-xl leading-none">{product.image}</span>
                  ) : (
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#3077c9] uppercase tracking-widest leading-tight">{product.brand}</p>
                  <p className="text-[13px] font-semibold text-[#012754] leading-snug truncate">{product.name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {product.leadTimeDays && (
                    <div className="flex items-center gap-1 text-[11px] text-[#59728f]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{product.leadTimeDays} day lead time</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-[#59728f]">
                    <Package className="w-3.5 h-3.5" />
                    <span>Min. {minQty} units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Form body ───────────────────────────────────────────── */}
            <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">

              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Alex"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Johnson"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </Field>
              </div>

              {/* Work Email */}
              <Field label="Work Email" required>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="alex@yourcompany.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </Field>

              {/* Company Name */}
              <Field label="Company Name" required>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Acme Corp"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </Field>

              {/* Delivery date */}
              <Field label="When do you need it delivered?" hint="(optional)">
                <input
                  type="date"
                  className={inputCls}
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                />
              </Field>

              {/* Quantity */}
              <Field label="Desired Quantity" required>
                <p className="text-[12px] text-[#8093a9] -mt-0.5 mb-1.5 leading-relaxed">
                  A minimum of {minQty} units is required for this product.{' '}
                  <button
                    type="button"
                    className="text-[#3077c9] hover:underline font-medium"
                    onClick={onTryOnDemand}
                  >
                    Smaller order in mind? Try on-demand swag.
                  </button>
                </p>
                <input
                  type="number"
                  className={inputCls}
                  min={minQty}
                  value={quantity}
                  onChange={e => {
                    const v = parseInt(e.target.value) || minQty;
                    setQuantity(Math.max(minQty, v));
                  }}
                />
                {quantity >= minQty && (
                  <p className="text-[11px] text-[#8093a9] mt-1">
                    ~${(product.price * quantity).toLocaleString()} estimated total
                  </p>
                )}
              </Field>

              {/* Send method */}
              <Field label="How do you plan to send your gifts?" required>
                <div className="flex flex-col gap-2">
                  {([
                    { value: 'individual' as const, label: 'Individually', desc: 'Each recipient gets their own shipment — we handle addresses' },
                    { value: 'bulk' as const,        label: 'In bulk',       desc: 'All gifts shipped together to one location (e.g. a conference)' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3.5 rounded-[12px] border cursor-pointer transition-all ${
                        sendMethod === opt.value
                          ? 'border-[#3077c9] bg-[#f0f6ff]'
                          : 'border-[#e0ebf7] hover:border-[#b7cfec] bg-white'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          sendMethod === opt.value ? 'border-[#3077c9]' : 'border-[#c5d5e8]'
                        }`}>
                          {sendMethod === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-[#3077c9]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1" onClick={() => setSendMethod(opt.value)}>
                        <p className="text-[13px] font-semibold text-[#012754] leading-tight">{opt.label}</p>
                        <p className="text-[11px] text-[#8093a9] leading-snug mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div className="px-8 py-5 border-t border-[#e0ebf7] shrink-0">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-12 rounded-[12px] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: canSubmit
                    ? 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)'
                    : '#c8d9ed',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                Start an order
                {canSubmit && <ChevronRight className="w-4 h-4" />}
              </button>
              <p className="text-[11px] text-[#a6b3c3] text-center mt-2.5">
                Our team will reach out within 1 business day to confirm details.
              </p>
            </div>
          </>
        ) : (
          /* ── Success state ────────────────────────────────────────── */
          <div className="px-8 py-14 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center shadow-lg">
              <Check className="w-9 h-9 text-white" />
            </div>
            <div>
              <h2
                className="text-[24px] font-semibold text-[#012754] mb-2"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Order Request Received!
              </h2>
              <p className="text-[14px] text-[#59728f] leading-relaxed max-w-[320px]">
                Our team will reach out to <span className="font-semibold text-[#345276]">{email}</span> within 1 business day to confirm your design and kick off production.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#f5f8fc] rounded-[14px] px-5 py-4 border border-[#e0ebf7] w-full max-w-[320px]">
              <Clock className="w-4 h-4 text-[#8093a9] shrink-0" />
              <p className="text-[12px] text-[#59728f] text-left">
                {product.leadTimeDays
                  ? `Estimated lead time: ${product.leadTimeDays} days after approval`
                  : 'Estimated lead time: 14–21 days after design approval'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-11 px-8 rounded-[12px] border border-[#e0ebf7] text-[14px] font-medium text-[#59728f] hover:bg-[#f5f8fc] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
