import { Upload, Palette, Send } from 'lucide-react';

const STORAGE_KEY = 'snappy_design_onboarding_seen';

export function hasSeenOnboarding(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

export function markOnboardingSeen() {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
}

const STEPS = [
  {
    icon: Upload,
    title: 'Add your logo',
    desc: 'Upload your brand logo, applied across all products instantly.',
  },
  {
    icon: Palette,
    title: 'Design your swag',
    desc: 'Pick a starter design or build from scratch, product by product.',
  },
  {
    icon: Send,
    title: 'Send or sell',
    desc: 'Send as a gift collection or publish as a store for your team.',
  },
];

interface OnboardingPopupProps {
  onDismiss: () => void;
}

export function OnboardingPopup({ onDismiss }: OnboardingPopupProps) {
  function handleDismiss() {
    markOnboardingSeen();
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(1,39,84,0.4)', backdropFilter: 'blur(4px)' }}>
      <div
        className="bg-white rounded-[24px] w-full max-w-[560px] overflow-hidden"
        style={{ boxShadow: '0px 32px 64px rgba(1,39,84,0.20)' }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(180deg, #f5f8fc 0%, #ffffff 100%)' }}
        >
          <h2
            className="text-[26px] font-semibold text-snp-navy-950 leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Here's how Snappy Swag works
          </h2>
          <p className="text-[14px] text-snp-navy-600 mt-2">
            Get started in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="px-8 pb-6">
          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={i} className="flex gap-4">
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #e8f0fa 0%, #dbeafe 100%)', border: '1.5px solid #c7daf5' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#3077c9' }} />
                    </div>
                    {!isLast && (
                      <div
                        className="w-px flex-1 mt-1 mb-1"
                        style={{ background: 'repeating-linear-gradient(to bottom, #c7daf5 0px, #c7daf5 4px, transparent 4px, transparent 8px)', minHeight: 24 }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className={`${isLast ? 'pb-0' : 'pb-5'} pt-1.5 flex-1`}>
                    <p className="text-[15px] font-semibold text-snp-navy-950">{step.title}</p>
                    <p className="text-[13px] text-snp-navy-500 leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="px-8 pb-8">
          <button
            onClick={handleDismiss}
            className="w-full h-12 rounded-[14px] text-white text-[15px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#3077c9' }}
          >
            Got it, let's go
          </button>
        </div>
      </div>
    </div>
  );
}
