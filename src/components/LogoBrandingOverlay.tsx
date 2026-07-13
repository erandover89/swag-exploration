import { useState, useEffect } from 'react';

const STAGE_AT  = [0, 2200, 5000];
const FINISH_AT = 7_500;

const STAGES = [
  { label: 'Reading your logo',       sub: 'Scanning brand assets and structure' },
  { label: 'Extracting brand colors', sub: 'Building your visual palette' },
  { label: 'Your brand is ready!',    sub: 'Identity captured and ready to use' },
];

const FALLBACK_PALETTE = ['#3077c9', '#36d4ff', '#7c3aed', '#f59e0b', '#10b981'];

// ── Color extraction via Canvas ───────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function extractDominantColors(imgUrl: string, count = 5): Promise<string[]> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const SIZE = 60;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve([]); return; }
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        const freq = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 120) continue;                         // transparent
          if (r > 235 && g > 235 && b > 235) continue;  // near-white
          if (r < 20  && g < 20  && b < 20)  continue;  // near-black

          // Quantize into buckets of 24 for deduplication
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;
          const prev = freq.get(key) ?? { r: qr, g: qg, b: qb, n: 0 };
          prev.n++;
          freq.set(key, prev);
        }

        // Sort by frequency, then pick diverse colors (min Euclidean distance 80)
        const sorted = [...freq.values()].sort((a, b) => b.n - a.n);
        const picked: { r: number; g: number; b: number }[] = [];
        for (const c of sorted) {
          if (picked.length >= count) break;
          const far = picked.every(p => {
            const d = Math.sqrt((p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2);
            return d > 80;
          });
          if (far || picked.length === 0) picked.push(c);
        }

        resolve(picked.map(c => rgbToHex(c.r, c.g, c.b)));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imgUrl;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  logoUrl: string;
  onDismiss: () => void;
}

export function LogoBrandingOverlay({ logoUrl, onDismiss }: Props) {
  const [stage,      setStage]      = useState(0);
  const [progress,   setProgress]   = useState(0);
  const [colorCount, setColorCount] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [entering,   setEntering]   = useState(true);
  const [exiting,    setExiting]    = useState(false);
  const [palette,    setPalette]    = useState<string[]>(FALLBACK_PALETTE);

  // Fade in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntering(false)));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Extract real brand colors from the logo
  useEffect(() => {
    extractDominantColors(logoUrl, 5).then(colors => {
      if (colors.length >= 2) setPalette(colors);
    });
  }, [logoUrl]);

  // Derived gradient from extracted colors (top 3)
  const gradientColors = palette.slice(0, 3);
  const rightGradient = gradientColors.length >= 2
    ? `linear-gradient(160deg, ${gradientColors.map((c, i) => `${c}${i === 0 ? '28' : i === 1 ? '18' : '10'}`).join(', ')})`
    : `radial-gradient(circle, ${gradientColors[0] ?? '#3077c9'}22 0%, transparent 70%)`;

  function dismiss() {
    setExiting(true);
    setTimeout(onDismiss, 600);
  }

  useEffect(() => {
    const t0 = Date.now();

    const progressTick = setInterval(() => {
      setProgress(Math.min(((Date.now() - t0) / FINISH_AT) * 100, 100));
    }, 80);

    const s1 = setTimeout(() => {
      setStage(1);
      [0, 1, 2, 3, 4].forEach(i =>
        setTimeout(() => setColorCount(n => Math.max(n, i + 1)), i * 340),
      );
    }, STAGE_AT[1]);

    const s2 = setTimeout(() => {
      setStage(2);
      setCompleting(true);
    }, STAGE_AT[2]);

    const sEnd = setTimeout(() => {
      setProgress(100);
      dismiss();
    }, FINISH_AT);

    return () => {
      clearInterval(progressTick);
      [s1, s2, sEnd].forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        @keyframes ov-spinFast { to { transform: rotate(360deg); } }
        @keyframes ov-spinSlow { to { transform: rotate(-360deg); } }
        @keyframes ov-scan {
          0%   { transform: translateY(-120%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(120%);  opacity: 0; }
        }
        @keyframes ov-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.9; transform: scale(1.06); }
        }
        @keyframes ov-slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes ov-popColor {
          0%   { transform: scale(0);    opacity: 0; }
          65%  { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes ov-cardRise {
          0%   { transform: translateY(20px) scale(0.88); opacity: 0; }
          70%  { transform: translateY(-3px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        @keyframes ov-badgePop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          55%  { transform: scale(1.3) rotate(4deg); opacity: 1; }
          75%  { transform: scale(0.88) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes ov-checkGrow {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes ov-tickDraw {
          from { stroke-dashoffset: 28; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes ov-glow {
          0%, 100% { box-shadow: 0 0 24px rgba(54,212,255,0.25); }
          50%      { box-shadow: 0 0 52px rgba(54,212,255,0.6); }
        }
        @keyframes ov-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes ov-gradientShift {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.85; }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(140deg, #010f2a 0%, #012754 40%, #0d3469 70%, #163d7f 100%)',
        fontFamily: "'DM Sans', sans-serif",
        opacity: entering || exiting ? 0 : 1,
        transition: 'opacity 0.55s ease',
        overflow: 'hidden',
      }}>

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(54,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />

        {/* Brand-color gradient — right side, fades in with stage 1 */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: rightGradient,
          opacity: colorCount > 0 ? 1 : 0,
          transition: 'opacity 1.2s ease',
          animation: colorCount > 0 ? 'ov-gradientShift 6s ease-in-out infinite' : 'none',
          clipPath: 'polygon(55% 0%, 100% 0%, 100% 100%, 35% 100%)',
        }} />

        {/* Ambient center glow */}
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: `radial-gradient(circle, ${palette[0] ? palette[0] + '2e' : 'rgba(48,119,201,0.18)'} 0%, transparent 68%)`,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          animation: 'ov-pulse 4s ease-in-out infinite',
          pointerEvents: 'none',
          transition: 'background 1.5s ease',
        }} />

        {/* Logo ring */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            position: 'absolute', width: 180, height: 180, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0deg, #36d4ff 70deg, rgba(54,212,255,0.12) 130deg, transparent 180deg)',
            animation: 'ov-spinFast 2.4s linear infinite',
          }} />
          <div style={{
            position: 'absolute', width: 196, height: 196, borderRadius: '50%',
            background: `conic-gradient(from 90deg, transparent 0deg, ${palette[1] ? palette[1] + '55' : 'rgba(48,119,201,0.3)'} 50deg, transparent 100deg)`,
            animation: 'ov-spinSlow 5s linear infinite',
            transition: 'background 1.5s ease',
          }} />
          <div style={{
            position: 'relative', width: 128, height: 128, borderRadius: 20,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            animation: stage === 0 ? 'ov-glow 2s ease-in-out infinite' : undefined,
          }}>
            <img
              src={logoUrl}
              alt="Your logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {stage === 0 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(180deg, transparent 0%, rgba(54,212,255,0.38) 48%, rgba(54,212,255,0.12) 52%, transparent 100%)',
                animation: 'ov-scan 1.8s ease-in-out infinite',
              }} />
            )}
            {completing && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 20,
                background: 'rgba(34,197,94,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'ov-checkGrow 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <circle cx="22" cy="22" r="19" stroke="#22c55e" strokeWidth="2" fill="rgba(34,197,94,0.12)" />
                  <path d="M13 22L19.5 28.5L31 16" stroke="#22c55e" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" strokeDasharray="28"
                    style={{ animation: 'ov-tickDraw 0.4s ease 0.2s forwards', strokeDashoffset: 28 }}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Color palette — extracted from logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, height: 38 }}>
          {palette.map((color, i) => {
            const shown = i < colorCount;
            return (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: color,
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: shown ? `0 0 16px ${color}99` : 'none',
                opacity: shown ? 1 : 0,
                transform: shown ? 'scale(1)' : 'scale(0)',
                animation: shown ? 'ov-popColor 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
                transition: 'background-color 0.6s ease',
              }} />
            );
          })}
          {colorCount >= 5 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginLeft: 4, animation: 'ov-slideUp 0.3s ease forwards' }}>
              palette extracted
            </span>
          )}
        </div>


        {/* Stage label */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p key={`s-${stage}`} style={{
            fontSize: 22, fontWeight: 600, color: 'white',
            fontFamily: "'Clash Display', sans-serif",
            marginBottom: 6, lineHeight: 1.2,
            animation: 'ov-slideUp 0.35s ease forwards',
          }}>
            {STAGES[stage].label}
          </p>
          <p key={`sub-${stage}`} style={{
            fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5,
            animation: 'ov-slideUp 0.35s ease 0.05s forwards', opacity: 0,
          }}>
            {STAGES[stage].sub}
          </p>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
          {STAGES.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', fontWeight: 700, fontSize: 10,
                width: i === stage ? 28 : 20, height: i === stage ? 28 : 20,
                background: i < stage ? '#22c55e' : i === stage ? (palette[0] ?? '#36d4ff') : 'rgba(255,255,255,0.09)',
                color: i <= stage ? '#012754' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.4s cubic-bezier(0.34,1.2,0.64,1)',
                boxShadow: i === stage ? `0 0 14px ${palette[0] ?? '#36d4ff'}80` : 'none',
              }}>
                {i < stage ? '✓' : i + 1}
              </div>
              {i < STAGES.length - 1 && (
                <div style={{
                  width: 24, height: 2, margin: '0 2px', borderRadius: 2,
                  background: i < stage
                    ? `linear-gradient(90deg, #22c55e, ${palette[0] ?? '#36d4ff'})`
                    : 'rgba(255,255,255,0.09)',
                  transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ width: 260, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.09)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: palette.length >= 2
              ? `linear-gradient(90deg, ${palette[0]} 0%, ${palette[1]} 100%)`
              : 'linear-gradient(90deg, #3077c9 0%, #36d4ff 100%)',
            width: `${progress}%`,
            transition: 'width 0.08s linear, background 1.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 6, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(progress)}%
        </p>

        {/* Skip */}
        <button
          onClick={dismiss}
          style={{
            marginTop: 20, fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            padding: '6px 12px', borderRadius: 8, transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
        >
          Skip →
        </button>
      </div>
    </>
  );
}
