import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, ThumbsUp, MessageSquare } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

interface PreviewData {
  logoUrl?: string;
  productIds: string[];
  budget: number;
  companyName: string;
}

// Mock fallback so the page is always demoable
const MOCK_PREVIEW: PreviewData = {
  productIds: ['1', '2', '4', '6', '9'],
  budget: 50,
  companyName: 'Acme Corp',
};

export function CollectionPublicPreview() {
  const { token } = useParams<{ token: string }>();

  // Load from localStorage (set by share flow) or use mock
  const stored = token ? localStorage.getItem(`snappy_preview_${token}`) : null;
  const data: PreviewData = stored ? (JSON.parse(stored) as PreviewData) : MOCK_PREVIEW;

  const products = data.productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const [status, setStatus] = useState<'idle' | 'requesting' | 'approved' | 'changed'>('idle');
  const [feedback, setFeedback] = useState('');

  function handleApprove() {
    if (token) {
      localStorage.setItem(`snappy_approval_${token}`, JSON.stringify({ status: 'approved' }));
    }
    setStatus('approved');
  }

  function handleSubmitFeedback() {
    if (!feedback.trim()) return;
    if (token) {
      localStorage.setItem(`snappy_approval_${token}`, JSON.stringify({ status: 'changes-requested', feedback }));
    }
    setStatus('changed');
  }

  return (
    <div
      className="min-h-screen bg-snp-navy-50 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-snp-navy-200">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-[18px] font-bold text-snp-navy-950"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              snappy
            </span>
            <span className="text-[11px] text-snp-navy-400 border border-snp-navy-200 rounded-full px-2 py-0.5">preview</span>
          </div>
          {data.companyName && (
            <span className="text-[13px] text-snp-navy-600">
              <span className="font-semibold text-snp-navy-950">{data.companyName}</span> · Gift Collection
            </span>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[900px] mx-auto w-full px-6 py-10">

        {/* Collection header */}
        <div className="bg-white rounded-[24px] border border-snp-navy-200 p-8 mb-6 shadow-[0px_4px_16px_0px_rgba(1,39,84,0.06)]">
          <div className="flex items-start gap-4 mb-6">
            {data.logoUrl ? (
              <div className="w-14 h-14 rounded-[14px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center overflow-hidden shrink-0">
                <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-[14px] bg-[#eef5ff] border border-[#c8dff5] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-snp-indigo-600 tracking-wide">LOGO</span>
              </div>
            )}
            <div>
              <p className="text-[12px] font-bold text-snp-navy-400 uppercase tracking-widest mb-1">Collection for review</p>
              <h1
                className="text-[26px] font-bold text-snp-navy-950 leading-tight"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {data.companyName} Brand Kit
              </h1>
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                <span className="text-[13px] text-snp-navy-600">{products.length} items</span>
                {data.budget > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#d1dce8]" />
                    <span className="text-[13px] font-semibold text-snp-indigo-600">${data.budget}/person</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-snp-navy-50 rounded-[16px] border border-snp-navy-200 overflow-hidden"
              >
                <div className="h-[120px] flex items-center justify-center relative overflow-hidden">
                  {product.image.startsWith('/') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <span className="text-[40px]">{product.image}</span>
                  )}
                  {data.logoUrl && (
                    <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-[7px] bg-white shadow-sm border border-snp-navy-200 flex items-center justify-center overflow-hidden">
                      <img src={data.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                  <p className="text-[11px] font-semibold text-snp-navy-950 leading-snug line-clamp-2">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] font-bold text-snp-indigo-600">From ${product.price}</p>
                    {product.colors.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {product.colors.slice(0, 4).map(c => (
                          <div key={c.hex} className="w-2.5 h-2.5 rounded-full border-[1.5px] border-white" style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px rgba(1,39,84,0.15)' }} title={c.name} />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-[8px] font-bold text-snp-navy-400 ml-0.5">+{product.colors.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action area ─────────────────────────────────────────────── */}
        {status === 'idle' && (
          <div className="bg-white rounded-[24px] border border-snp-navy-200 p-8 shadow-[0px_4px_16px_0px_rgba(1,39,84,0.06)]">
            <p
              className="text-[17px] font-semibold text-snp-navy-950 mb-2"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Does this collection look good?
            </p>
            <p className="text-[13px] text-snp-navy-500 mb-6">
              Review the items above and let {data.companyName} know if you approve or need changes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-[14px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' }}
              >
                <ThumbsUp className="w-4 h-4" />
                Approve this collection
              </button>
              <button
                onClick={() => setStatus('requesting')}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-[14px] border-2 border-snp-navy-200 text-snp-navy-600 text-[14px] font-semibold hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Request changes
              </button>
            </div>
          </div>
        )}

        {status === 'requesting' && (
          <div className="bg-white rounded-[24px] border border-snp-navy-200 p-8 shadow-[0px_4px_16px_0px_rgba(1,39,84,0.06)]">
            <p
              className="text-[17px] font-semibold text-snp-navy-950 mb-2"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              What would you like to change?
            </p>
            <p className="text-[13px] text-snp-navy-500 mb-4">
              Your feedback will be sent directly to {data.companyName}.
            </p>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="e.g. Can we swap the fleece for a hoodie? And maybe add a notebook..."
              rows={4}
              className="w-full rounded-[14px] border border-snp-navy-200 px-4 py-3 text-[13px] text-snp-navy-700 placeholder-snp-navy-400 focus:outline-none focus:border-snp-indigo-600 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStatus('idle')}
                className="flex-1 h-11 rounded-[12px] border border-snp-navy-200 text-snp-navy-600 text-[13px] font-semibold hover:border-snp-navy-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim()}
                className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#3077c9' }}
              >
                Send feedback
              </button>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-[#f0fdf4] rounded-[24px] border border-[#bbf7d0] p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0">
              <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p
                className="text-[18px] font-bold text-[#15803d] mb-1"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Collection approved!
              </p>
              <p className="text-[13px] text-[#16a34a]">
                {data.companyName} has been notified. They'll take it from here.
              </p>
            </div>
          </div>
        )}

        {status === 'changed' && (
          <div className="bg-snp-indigo-50 rounded-[24px] border border-[#bfdbfe] p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-snp-indigo-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <p
                className="text-[18px] font-bold text-[#1d4ed8] mb-1"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Feedback sent!
              </p>
              <p className="text-[13px] text-snp-indigo-700">
                {data.companyName} will review your comments and update the collection.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="py-6 text-center">
        <p className="text-[12px] text-snp-navy-400">
          Powered by <span className="font-semibold text-snp-navy-500">Snappy</span> · Corporate gifting made simple
        </p>
      </div>
    </div>
  );
}
