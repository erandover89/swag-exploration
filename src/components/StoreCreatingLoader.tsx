import { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/mockData';

const DURATION     = 5_500;
const TIP_DURATION = 2_600;

const STAGE_AT = [0, 1_800, 3_600];

const STAGE_LABELS = [
  { label: 'Setting up your storefront', sub: 'Building your branded store page — one link for everyone' },
  { label: 'Adding your products',       sub: 'Stocking your store with your logo-applied items' },
  { label: 'Store ready!',              sub: 'Share the link — recipients browse and order from their country' },
];

const TIPS = [
  { label: 'How stores work', headline: 'One link, ships to their country',  body: 'Unlike a collection, there\'s no per-person budget. Recipients browse everything and order what they want.' },
  { label: 'Always on',       headline: 'Your store works 24/7',             body: 'No scheduling needed — share the link once and recipients order whenever they\'re ready.' },
];

const SPARKLES = [
  { size: 10, top: '16%', left: '12%',  delay: '0s',   dur: '3.2s' },
  { size: 7,  top: '72%', left: '17%',  delay: '1.3s', dur: '4s'   },
  { size: 9,  top: '18%', right: '12%', delay: '0.7s', dur: '2.8s' },
  { size: 6,  top: '76%', right: '16%', delay: '1.9s', dur: '3.7s' },
  { size: 8,  top: '46%', left: '7%',   delay: '0.4s', dur: '3.5s' },
  { size: 6,  top: '50%', right: '7%',  delay: '2.1s', dur: '3s'   },
] as { size: number; top: string; left?: string; right?: string; delay: string; dur: string }[];

interface Props {
  storeName: string;
  productIds: string[];
  logoUrl?: string | null;
  onComplete: () => void;
}

export function StoreCreatingLoader({ storeName, productIds, logoUrl, onComplete }: Props) {
  const [progress,     setProgress]     = useState(0);
  const [stage,        setStage]        = useState(0);
  const [tipIndex,     setTipIndex]     = useState(0);
  const [tipVisible,   setTipVisible]   = useState(true);
  const [cardVisible,  setCardVisible]  = useState<boolean[]>([]);
  const [badgeVisible, setBadgeVisible] = useState<boolean[]>([]);
  const [tickVisible,  setTickVisible]  = useState<boolean[]>([]);
  const [completing,   setCompleting]   = useState(false);
  const [exiting,      setExiting]      = useState(false);

  const products = productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 6) as NonNullable<ReturnType<typeof PRODUCTS.find>>[];

  useEffect(() => {
    setCardVisible(Array(products.length).fill(false));
    setBadgeVisible(Array(products.length).fill(false));
    setTickVisible(Array(products.length).fill(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    setExiting(true);
    setTimeout(onComplete, 600);
  }

  useEffect(() => {
    const t0 = Date.now();

    const progressTick = setInterval(() => {
      setProgress(Math.min(((Date.now() - t0) / DURATION) * 100, 100));
    }, 60);

    // Stage 0 → cards slide in
    const cardTimers = products.map((_, i) =>
      setTimeout(() => {
        setCardVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 200 + i * 220),
    );

    // Stage 1 → logo badges pop onto each card
    const s1 = setTimeout(() => {
      setStage(1);
      products.forEach((_, i) => {
        setTimeout(() => {
          setBadgeVisible(prev => { const n = [...prev]; n[i] = true; return n; });
        }, i * 220);
      });
    }, STAGE_AT[1]);

    // Stage 2 → completion ticks
    const s2 = setTimeout(() => {
      setStage(2);
      setCompleting(true);
      products.forEach((_, i) => {
        setTimeout(() => {
          setTickVisible(prev => { const n = [...prev]; n[i] = true; return n; });
        }, i * 120);
      });
    }, STAGE_AT[2]);

    // Tip rotation
    const tipTimer = setTimeout(() => {
      setTipVisible(false);
      setTimeout(() => { setTipIndex(1); setTipVisible(true); }, 250);
    }, TIP_DURATION);

    const end = setTimeout(dismiss, DURATION);

    return () => {
      clearInterval(progressTick);
      cardTimers.forEach(clearTimeout);
      [s1, s2, tipTimer, end].forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tip = TIPS[tipIndex];

  return (
    <>
      <style>{`
        @keyframes scl-orbit     { to { transform: rotate(360deg); } }
        @keyframes scl-orbitRev  { to { transform: rotate(-360deg); } }
        @keyframes scl-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.9; transform: scale(1.07); }
        }
        @keyframes scl-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes scl-slideUp {
          from { transform: translateY(22px) scale(0.9); opacity: 0; }
          to   { transform: translateY(0)    scale(1);   opacity: 1; }
        }
        @keyframes scl-fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes scl-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(48,119,201,0.35); }
          50%      { box-shadow: 0 0 50px rgba(54,212,255,0.6);  }
        }
        @keyframes scl-scan {
          0%   { transform: translateY(-120%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        @keyframes scl-badgePop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          55%  { transform: scale(1.35) rotate(4deg); opacity: 1; }
          75%  { transform: scale(0.88) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes scl-badgeRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(54,212,255,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(54,212,255,0);  }
        }
        @keyframes scl-checkGrow {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes scl-tickDraw {
          from { stroke-dashoffset: 14; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes scl-tickDrawLg {
          from { stroke-dashoffset: 24; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes scl-twinkle {
          0%, 100% { opacity: 0;   transform: scale(0.5) rotate(0deg);  }
          50%      { opacity: 0.9; transform: scale(1)   rotate(20deg); }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(140deg, #010f2a 0%, #012754 40%, #0d3469 70%, #163d7f 100%)',
        fontFamily: "'DM Sans', sans-serif",
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.6s ease',
        overflow: 'hidden',
      }}>

        {/* Dot texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(54,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Ambient glow blobs */}
        <div style={{
          position: 'absolute', width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(48,119,201,0.2) 0%, transparent 65%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          animation: 'scl-pulse 5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(54,212,255,0.1) 0%, transparent 65%)',
          top: '12%', right: '8%',
          animation: 'scl-pulse 7s ease-in-out 1.5s infinite',
          pointerEvents: 'none',
        }} />

        {/* Sparkles */}
        {SPARKLES.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: s.top,
            ...(s.left ? { left: s.left } : { right: s.right }),
            animation: `scl-twinkle ${s.dur} ease-in-out ${s.delay} infinite`,
            pointerEvents: 'none',
          }}>
            <svg width={s.size} height={s.size} viewBox="0 0 14 14" fill="none">
              <path d="M7 0L8.1 5.6L14 7L8.1 8.4L7 14L5.9 8.4L0 7L5.9 5.6Z" fill="#36d4ff" />
            </svg>
          </div>
        ))}

        {/* Progress bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(54,212,255,0.1)' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3077c9 0%, #36d4ff 100%)',
            width: `${progress}%`,
            transition: 'width 0.06s linear',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>

          {/* Logo ring */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{
              position: 'absolute', width: 128, height: 128, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0deg, #36d4ff 65deg, rgba(54,212,255,0.08) 130deg, transparent 200deg)',
              animation: 'scl-orbit 2.5s linear infinite',
            }} />
            <div style={{
              position: 'absolute', width: 142, height: 142, borderRadius: '50%',
              background: 'conic-gradient(from 180deg, transparent 0deg, rgba(48,119,201,0.35) 55deg, transparent 110deg)',
              animation: 'scl-orbitRev 4.2s linear infinite',
            }} />
            <div style={{
              position: 'relative', width: 90, height: 90, borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(14px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              animation: stage === 0 ? 'scl-glow 2.2s ease-in-out infinite' : undefined,
            }}>
              {logoUrl ? (
                <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 14 }} />
              ) : (
                <span style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, fontFamily: "'Clash Display', sans-serif" }}>LOGO</span>
              )}

              {stage === 0 && (
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(54,212,255,0.38) 48%, rgba(54,212,255,0.12) 52%, transparent 100%)',
                  animation: 'scl-scan 2s ease-in-out infinite',
                }} />
              )}

              {completing && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 20,
                  background: 'rgba(34,197,94,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'scl-checkGrow 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="15" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.12)" />
                    <path d="M10 18L16 24L26 13" stroke="#22c55e" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="24"
                      style={{ animation: 'scl-tickDrawLg 0.4s ease 0.2s forwards', strokeDashoffset: 24 }} />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Headline + subtitle */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1
              key={`title-${completing}`}
              style={{
                fontSize: 30, fontWeight: 700, color: 'white', lineHeight: 1.2, margin: '0 0 7px',
                fontFamily: "'Clash Display', sans-serif",
                animation: 'scl-fadeUp 0.45s ease forwards',
              }}
            >
              {completing ? 'Store created!' : storeName}
            </h1>
            <p
              key={`sub-${stage}`}
              style={{
                fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0,
                animation: 'scl-fadeUp 0.4s ease 0.05s forwards', opacity: 0,
              }}
            >
              {STAGE_LABELS[stage].sub}
            </p>
          </div>

          {/* Stage step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {STAGE_LABELS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  title={s.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width:  i === stage ? 28 : 20,
                    height: i === stage ? 28 : 20,
                    borderRadius: '50%',
                    background: i < stage  ? '#22c55e'
                               : i === stage ? '#36d4ff'
                               : 'rgba(255,255,255,0.08)',
                    color: i <= stage ? '#012754' : 'rgba(255,255,255,0.28)',
                    fontSize: 10, fontWeight: 700,
                    transition: 'all 0.45s cubic-bezier(0.34,1.2,0.64,1)',
                    boxShadow: i === stage ? '0 0 14px rgba(54,212,255,0.55)' : 'none',
                  }}
                >
                  {i < stage ? '✓' : i + 1}
                </div>
                {i < STAGE_LABELS.length - 1 && (
                  <div style={{
                    width: 40, height: 2, margin: '0 3px',
                    borderRadius: 2,
                    background: i < stage
                      ? 'linear-gradient(90deg, #22c55e, #36d4ff)'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.55s ease',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Product cards row */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36 }}>
            {products.map((product, i) => {
              const visible  = cardVisible[i];
              const hasBadge = badgeVisible[i];
              const hasTick  = tickVisible[i];
              const isPhoto  = product.image.startsWith('/');
              return (
                <div
                  key={product.id}
                  style={{
                    width: 86, borderRadius: 14, position: 'relative',
                    background: 'rgba(255,255,255,0.07)',
                    border: hasBadge || hasTick
                      ? '1.5px solid rgba(54,212,255,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    overflow: 'visible',
                    opacity: visible ? 1 : 0,
                    transition: 'border-color 0.4s ease',
                    animation: visible
                      ? `scl-slideUp 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards, scl-float ${3.2 + i * 0.4}s ease-in-out ${i * 0.35}s infinite`
                      : 'none',
                  }}
                >
                  <div style={{
                    height: 78, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '14px 14px 0 0', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.05)',
                  }}>
                    {isPhoto ? (
                      <img src={product.image} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                    ) : (
                      <span style={{ fontSize: 28 }}>{product.image}</span>
                    )}
                  </div>

                  <div style={{ padding: '5px 7px 8px' }}>
                    <p style={{
                      fontSize: 8, fontWeight: 700, color: '#36d4ff', textTransform: 'uppercase',
                      letterSpacing: '0.07em', margin: '0 0 2px', opacity: 0.65,
                    }}>{product.brand}</p>
                    <p style={{
                      fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.82)',
                      margin: 0, lineHeight: 1.3,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{product.name}</p>
                  </div>

                  {hasBadge && !hasTick && logoUrl && (
                    <div style={{
                      position: 'absolute', bottom: -8, right: -8,
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'white',
                      border: '2px solid rgba(54,212,255,0.75)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                      animation: 'scl-badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, scl-badgeRing 1.6s ease-in-out infinite',
                    }}>
                      <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                    </div>
                  )}

                  {hasTick && (
                    <div style={{
                      position: 'absolute', bottom: -8, right: -8,
                      width: 26, height: 26, borderRadius: '50%',
                      background: '#22c55e',
                      border: '2px solid rgba(34,197,94,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'scl-checkGrow 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="white" strokeWidth="1.9"
                          strokeLinecap="round" strokeLinejoin="round"
                          strokeDasharray="14"
                          style={{ animation: 'scl-tickDraw 0.3s ease 0.1s forwards', strokeDashoffset: 14 }} />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips card */}
          <div style={{
            maxWidth: 400, width: '100%', textAlign: 'center',
            opacity: tipVisible ? 1 : 0,
            transform: tipVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 18, padding: '18px 24px 20px',
              backdropFilter: 'blur(14px)',
            }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(54,212,255,0.15)',
                border: '1px solid rgba(54,212,255,0.3)',
                borderRadius: 99, padding: '3px 10px',
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#36d4ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {tip.label}
                </span>
              </div>
              <p style={{
                fontSize: 18, fontWeight: 700, color: 'white',
                margin: '0 0 6px', fontFamily: "'Clash Display', sans-serif", lineHeight: 1.3,
              }}>
                {tip.headline}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
                {tip.body}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
              {TIPS.map((_, i) => (
                <div key={i} style={{
                  width: i === tipIndex ? 18 : 5, height: 5, borderRadius: 99,
                  background: i === tipIndex ? '#36d4ff' : 'rgba(255,255,255,0.18)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>

        </div>

        {/* Skip */}
        <div style={{ position: 'absolute', bottom: 24 }}>
          <button
            onClick={dismiss}
            style={{
              fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", padding: '6px 12px',
              borderRadius: 8, transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            Skip →
          </button>
        </div>

      </div>
    </>
  );
}
