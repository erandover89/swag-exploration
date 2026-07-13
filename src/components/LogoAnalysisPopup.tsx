import { useEffect, useRef, useMemo, useState } from 'react';
import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import type { LogoAnalysis } from '../utils/logoAnalysis';

interface CheckItem {
  label: string;
  result: string;
  status: 'pass' | 'warn' | 'fail';
}

interface LogoAnalysisPopupProps {
  logoUrl: string;
  analysis: LogoAnalysis | undefined;
  onComplete: () => void;
}

const STEP_MS = 750;
const REVEAL_OFFSET = 500;

const DARK_SCORE: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  great: { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   text: '#4ade80', dot: '#22c55e' },
  good:  { bg: 'rgba(54,212,255,0.10)',  border: 'rgba(54,212,255,0.25)', text: '#67e8f9', dot: '#36d4ff' },
  fair:  { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24', dot: '#f59e0b' },
  poor:  { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#f87171', dot: '#ef4444' },
};

const DARK_SCORE_LABEL: Record<string, string> = {
  great: 'Great quality',
  good:  'Good quality',
  fair:  'Fair quality',
  poor:  'Needs work',
};

export function LogoAnalysisPopup({ logoUrl, analysis, onComplete }: LogoAnalysisPopupProps) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const checks = useMemo<CheckItem[]>(() => {
    if (!analysis) return [];
    const { fileType, width, height, colorCount, hasTransparency, decorationFlags: f } = analysis;
    const maxDim = Math.max(width, height);

    const methods: string[] = [];
    if (f.dtfReady || fileType === 'svg') methods.push('DTF');
    if (f.printReady || fileType === 'svg') methods.push('Print');
    if (f.embroideryRisk === 'none') methods.push('Embroidery');
    if (f.engravingFriendly) methods.push('Engraving');

    return [
      {
        label: 'File format',
        result:
          fileType === 'svg' ? 'SVG vector'
          : fileType === 'png' ? 'PNG image'
          : fileType === 'jpg' ? 'JPEG image'
          : fileType.toUpperCase(),
        status: fileType === 'jpg' ? 'warn' : 'pass',
      },
      {
        label: 'Resolution',
        result:
          fileType === 'svg' ? 'Infinite (vector)'
          : width === 0 ? 'Could not read'
          : `${width}×${height}px`,
        status:
          fileType === 'svg' ? 'pass'
          : maxDim >= 500 ? 'pass'
          : maxDim >= 200 ? 'warn'
          : 'fail',
      },
      {
        label: 'Transparency',
        result:
          fileType === 'svg' ? 'Fully supported'
          : hasTransparency ? 'Clear background'
          : fileType === 'jpg' ? 'Not supported (JPEG)'
          : 'No alpha channel',
        status: fileType === 'svg' || hasTransparency ? 'pass' : 'warn',
      },
      {
        label: 'Color palette',
        result:
          fileType === 'svg' ? 'Vector colors'
          : colorCount === 0 ? 'None detected'
          : `${colorCount} color${colorCount !== 1 ? 's' : ''}`,
        status:
          fileType === 'svg' ? 'pass'
          : colorCount <= 8 ? 'pass'
          : colorCount <= 15 ? 'warn'
          : 'fail',
      },
      {
        label: 'Decoration methods',
        result: methods.length > 0 ? methods.join(' · ') : 'Limited options',
        status:
          f.embroideryRisk === 'none' && methods.length >= 3 ? 'pass'
          : f.embroideryRisk === 'high' ? 'fail'
          : 'warn',
      },
    ];
  }, [analysis]);

  useEffect(() => {
    if (checks.length === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    checks.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveIdx(i), i * STEP_MS));
      timers.push(setTimeout(() => setRevealedCount(c => c + 1), i * STEP_MS + REVEAL_OFFSET));
    });
    // Score badge shown for 900ms, then start fade-out
    timers.push(setTimeout(() => setExiting(true), checks.length * STEP_MS + 900));
    // Fire onComplete 200ms into the fade so overlay mounts while we're still fading out
    timers.push(setTimeout(() => onCompleteRef.current(), checks.length * STEP_MS + 1100));
    return () => timers.forEach(clearTimeout);
  }, [checks.length]);

  const allRevealed = revealedCount >= checks.length && checks.length > 0;
  const progress = checks.length > 0 ? (revealedCount / checks.length) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #010f1e 0%, #012754 60%, #01153a 100%)',
        fontFamily: "'DM Sans', sans-serif",
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.55s ease',
      }}
    >
      <style>{`
        @keyframes anl-spin   { to { transform: rotate(360deg); } }
        @keyframes anl-spin-r { to { transform: rotate(-360deg); } }
        @keyframes anl-scan   { from { width: 0%; } to { width: 65%; } }
        @keyframes anl-result { from { opacity: 0; transform: translateX(5px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes anl-score  { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes anl-twinkle {
          0%, 100% { opacity: 0.10; transform: scale(0.75) rotate(0deg);  }
          50%       { opacity: 0.70; transform: scale(1.2)  rotate(20deg); }
        }
      `}</style>

      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(54,212,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Sparkles */}
      {[
        { s: 13, t: '14%', l: '12%',  c: '#36d4ff', d: '0s',   dur: '2.8s' },
        { s: 8,  t: '72%', l: '18%',  c: '#7c3aed', d: '1.1s', dur: '3.3s' },
        { s: 11, t: '16%', r: '14%',  c: '#36d4ff', d: '0.6s', dur: '2.5s' },
        { s: 7,  t: '76%', r: '16%',  c: '#f59e0b', d: '1.5s', dur: '3.6s' },
        { s: 9,  t: '50%', l: '8%',   c: '#7c3aed', d: '0.3s', dur: '4.0s' },
        { s: 6,  t: '45%', r: '9%',   c: '#36d4ff', d: '0.9s', dur: '3.1s' },
      ].map((sp, i) => (
        <div
          key={i}
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: sp.t,
            ...(sp.l ? { left: sp.l } : {}),
            ...('r' in sp ? { right: sp.r } : {}),
            animation: `anl-twinkle ${sp.dur} ease-in-out infinite ${sp.d}`,
          }}
        >
          <svg width={sp.s} height={sp.s} viewBox="0 0 14 14" fill="none">
            <path d="M7 0L8.1 5.6L14 7L8.1 8.4L7 14L5.9 8.4L0 7L5.9 5.6Z" fill={sp.c} />
          </svg>
        </div>
      ))}

      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3077c9, #36d4ff)' }}
        />
      </div>

      {/* Content column */}
      <div className="flex flex-col items-center w-full max-w-[400px] px-6">

        {/* Logo + orbital rings */}
        <div className="relative flex items-center justify-center mb-7">
          {/* Glow blob */}
          <div
            className="absolute w-[140px] h-[140px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(54,212,255,0.18) 0%, transparent 70%)', filter: 'blur(12px)' }}
          />
          {/* Outer orbital ring */}
          <svg className="absolute" width="116" height="116" style={{ top: -8, left: -8 }}>
            <circle cx="58" cy="58" r="52" fill="none" stroke="rgba(54,212,255,0.08)" strokeWidth="1.5" />
            <circle
              cx="58" cy="58" r="52"
              fill="none"
              stroke="#36d4ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="32 294"
              style={{ animation: 'anl-spin 2.4s linear infinite', transformOrigin: '58px 58px' }}
            />
          </svg>
          {/* Inner orbital ring */}
          <svg className="absolute" width="96" height="96" style={{ top: 2, left: 2 }}>
            <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(48,119,201,0.12)" strokeWidth="1" />
            <circle
              cx="48" cy="48" r="42"
              fill="none"
              stroke="#3077c9"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="20 244"
              style={{ animation: 'anl-spin-r 3.6s linear infinite', transformOrigin: '48px 48px' }}
            />
          </svg>
          {/* Logo card */}
          <div className="w-[100px] h-[100px] rounded-[24px] bg-white flex items-center justify-center overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]">
            <img src={logoUrl} alt="" className="w-full h-full object-contain p-3" />
          </div>
        </div>

        {/* Heading */}
        <h2
          className="text-[24px] font-bold text-white mb-1"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          Analyzing quality
        </h2>
        <p className="text-[13px] mb-7" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Checking your logo across 5 criteria
        </p>

        {/* Check rows */}
        <div className="w-full flex flex-col gap-1.5">
          {checks.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="w-5 h-5 rounded-full shrink-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.10)' }} />
                  <div className="h-3 rounded flex-1 animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>
              ))
            : checks.map((check, i) => {
                const revealed = i < revealedCount;
                const isActive = i === activeIdx && !revealed;
                return (
                  <div
                    key={check.label}
                    className="flex items-start gap-3 px-3 rounded-[10px] transition-all duration-200"
                    style={{
                      paddingTop: 10,
                      paddingBottom: 10,
                      opacity: revealed || isActive ? 1 : 0.24,
                      background: isActive
                        ? 'rgba(54,212,255,0.07)'
                        : revealed
                          ? 'rgba(255,255,255,0.03)'
                          : 'transparent',
                      border: isActive ? '1px solid rgba(54,212,255,0.18)' : '1px solid transparent',
                    }}
                  >
                    {/* Status icon */}
                    <div className="shrink-0 mt-px">
                      {!revealed && !isActive && (
                        <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                      )}
                      {isActive && (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#36d4ff' }} />
                      )}
                      {revealed && check.status === 'pass' && (
                        <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      {revealed && check.status === 'warn' && (
                        <div className="w-5 h-5 rounded-full bg-[#f59e0b] flex items-center justify-center">
                          <AlertTriangle className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                      {revealed && check.status === 'fail' && (
                        <div className="w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center">
                          <X className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-white">{check.label}</span>
                        {revealed && (
                          <span
                            className="text-[12px] font-medium text-right leading-tight"
                            style={{
                              color:
                                check.status === 'pass' ? '#4ade80'
                                : check.status === 'warn' ? '#fbbf24'
                                : '#f87171',
                              animation: 'anl-result 0.2s ease both',
                            }}
                          >
                            {check.result}
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <div className="mt-1.5 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(54,212,255,0.15)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ background: '#36d4ff', animation: `anl-scan ${REVEAL_OFFSET}ms ease-out both` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Score badge */}
        {allRevealed && analysis && (
          <div className="w-full mt-5" style={{ animation: 'anl-score 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div
              className="w-full px-4 py-3 rounded-[14px] flex items-center gap-3 border"
              style={{
                background: DARK_SCORE[analysis.score].bg,
                borderColor: DARK_SCORE[analysis.score].border,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DARK_SCORE[analysis.score].dot }} />
              <span className="text-[14px] font-bold" style={{ color: DARK_SCORE[analysis.score].text }}>
                {DARK_SCORE_LABEL[analysis.score]}
              </span>
              <span className="text-[12px] ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {analysis.issues.filter(i => i.severity !== 'info').length === 0
                  ? 'No issues found'
                  : `${analysis.issues.filter(i => i.severity !== 'info').length} issue${analysis.issues.filter(i => i.severity !== 'info').length !== 1 ? 's' : ''} found`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
