import { useEffect, useCallback, useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { type Product } from '../data/mockData';

interface RefineAIModalProps {
  product?: Product;
  onClose: () => void;
}

const SUGGESTION_CHIPS = [
  'Make it more minimal',
  'Bold & vibrant colors',
  'Classic & professional',
  'Playful startup vibe',
  'Eco-friendly aesthetic',
];

const REFINE_STEPS = [
  'Analyzing your brand...',
  'Generating style variations...',
  'Applying refinements...',
  'Finalizing design...',
];

export function RefineAIModal({ product, onClose }: RefineAIModalProps) {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<'idle' | 'refining' | 'done'>('idle');
  const [refineStep, setRefineStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setLeaving(true);
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const handleRefine = () => {
    if (!prompt.trim()) return;
    setPhase('refining');
    setRefineStep(0);
    const delays = [0, 700, 1400, 2100];
    delays.forEach((d, i) => setTimeout(() => setRefineStep(i), d));
    setTimeout(() => setPhase('done'), 3000);
  };

  const isVisible = visible && !leaving;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(1,39,84,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.22s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[520px] bg-white rounded-[28px] overflow-hidden"
        style={{
          boxShadow: '0px 40px 80px rgba(1,39,84,0.28)',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'transform 0.26s ease, opacity 0.22s ease',
          opacity: isVisible ? 1 : 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ background: 'linear-gradient(135deg, #011e45 0%, #012754 100%)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#36d4ff]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">AI Assistant</p>
                <p className="text-[15px] font-bold text-white leading-none">Refine with AI</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {product && (
            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-[12px] px-3 py-2.5">
              <div className="w-10 h-10 bg-[#f5f8fc] rounded-[8px] overflow-hidden flex items-center justify-center shrink-0">
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{product.brand}</p>
                <p className="text-[12px] font-semibold text-white truncate">{product.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {phase === 'idle' && (
            <>
              <p className="text-[13px] text-[#59728f] mb-4 leading-relaxed">
                Describe your brand style or what you'd like to change — AI will apply it to your swag.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {SUGGESTION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setPrompt(chip)}
                    className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      prompt === chip
                        ? 'bg-[#eaf1fa] border-[#3077c9] text-[#3077c9]'
                        : 'border-[#e0ebf7] text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9]'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. We're a modern fintech startup — keep it clean, navy tones, minimal branding on left chest..."
                rows={3}
                className="w-full px-4 py-3 border border-[#e0ebf7] rounded-[14px] text-[13px] text-[#012754] placeholder:text-[#a6b3c3] focus:outline-none focus:border-[#3077c9] focus:ring-2 focus:ring-[#3077c9]/15 resize-none transition-all leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />

              <button
                onClick={handleRefine}
                disabled={!prompt.trim()}
                className="mt-4 w-full h-11 rounded-[12px] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: prompt.trim()
                    ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                    : '#e0ebf7',
                  color: prompt.trim() ? 'white' : '#a6b3c3',
                  cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <Sparkles className="w-4 h-4" />
                Refine with AI
              </button>
            </>
          )}

          {phase === 'refining' && (
            <div className="py-6">
              <div className="flex flex-col gap-3">
                {REFINE_STEPS.map((step, i) => {
                  const done = i < refineStep;
                  const active = i === refineStep;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{
                          background: done ? '#7c3aed' : active ? 'transparent' : 'transparent',
                          border: done ? 'none' : active ? '2px solid #7c3aed' : '2px solid #e0ebf7',
                        }}
                      >
                        {done ? (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : active ? (
                          <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
                        ) : null}
                      </div>
                      <span
                        className={`text-[13px] font-medium transition-colors ${
                          done ? 'text-[#7c3aed]' : active ? 'text-[#012754]' : 'text-[#c0cdd9]'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${((refineStep + 1) / REFINE_STEPS.length) * 100}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #5b21b6)',
                  }}
                />
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3
                className="text-[20px] font-bold text-[#012754] mb-2"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Refinements applied!
              </h3>
              <p className="text-[13px] text-[#59728f] leading-relaxed mb-6">
                Your brand style has been captured. The catalog now reflects your preferences.
              </p>
              <button
                onClick={handleClose}
                className="h-10 px-6 rounded-[12px] text-white text-[13px] font-semibold flex items-center gap-2 mx-auto transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }}
              >
                Browse the catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
