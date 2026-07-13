import { useState, useRef, useEffect } from 'react';
import { analyzeLogo, type LogoAnalysis } from '../utils/logoAnalysis';
import { LogoAnalysisPopup } from './LogoAnalysisPopup';

export type LogoPhase = 'idle' | 'loading' | 'ready';

/** Try to load an image URL — resolves true if it loads, false otherwise */
function tryImageLoad(url: string, timeoutMs = 4000): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, timeoutMs);
    img.onload  = () => { clearTimeout(timer); resolve(true);  };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

/** Normalise a user-typed domain/URL string to a bare hostname */
function cleanDomain(input: string): string {
  const s = input.trim().toLowerCase();
  try {
    // If it already looks like a full URL, parse it
    const url = s.startsWith('http') ? new URL(s) : new URL(`https://${s}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return s.replace(/^www\./, '').split('/')[0];
  }
}

/** Fetch a logo for a domain. Tries Clearbit first, falls back to Google favicon. */
export async function fetchLogoForDomain(domain: string): Promise<string> {
  const host = cleanDomain(domain);
  const clearbit = `https://logo.clearbit.com/${host}`;
  if (await tryImageLoad(clearbit)) return clearbit;
  // Fallback: Google favicon at 128px (always returns something)
  return `https://www.google.com/s2/favicons?sz=128&domain=${host}`;
}

export interface LogoInputRenderIdleArgs {
  triggerFileInput: () => void;
  /** Fetch a logo from a domain name (e.g. "apple.com") and proceed through the normal flow */
  fetchFromDomain: (domain: string) => Promise<void>;
  /** True while a domain logo is being fetched */
  isFetchingDomain: boolean;
}

export interface BrandDetails {
  companyName: string;
  brandColor: string | null;
  description: string | null;
}

export interface LogoInputRenderReadyArgs {
  logoUrl: string;
  domain: string;
  brand: BrandDetails;
  onReset: () => void;
  analysis?: LogoAnalysis;
}

export type { LogoAnalysis };

interface LogoInputProps {
  renderIdle: (args: LogoInputRenderIdleArgs) => React.ReactNode;
  renderReady: (args: LogoInputRenderReadyArgs) => React.ReactNode;
  onPhaseChange?: (phase: LogoPhase) => void;
  onReady?: (logoUrl: string, domain: string) => void;
  /** When set, bypasses the loading/ready phase machine — called once logo is verified */
  onImmediateSubmit?: (logoUrl: string, domain: string) => void;
  /** Pre-load the component in the ready state with an existing logo URL */
  initialLogoUrl?: string;
}

export function LogoInput({
  renderIdle,
  renderReady,
  onPhaseChange,
  onReady,
  onImmediateSubmit,
  initialLogoUrl,
}: LogoInputProps) {
  const [phase, setPhase] = useState<LogoPhase>('idle');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoDomain, setLogoDomain] = useState('');
  const [brand] = useState<BrandDetails>({ companyName: '', brandColor: null, description: null });
  const [analysis, setAnalysis] = useState<LogoAnalysis | undefined>(undefined);
  const [isFetchingDomain, setIsFetchingDomain] = useState(false);
  const foundUrlRef = useRef<string | null>(null);
  const pendingDomainRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLogoUrl && phase === 'idle') {
      setLogoUrl(initialLogoUrl);
      setLogoDomain('Your logo');
      setPhase('ready');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLogoUrl]);

  function transitionTo(p: LogoPhase) {
    setPhase(p);
    onPhaseChange?.(p);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      if (onImmediateSubmit) {
        onImmediateSubmit(dataUrl, 'upload');
        return;
      }
      foundUrlRef.current = dataUrl;
      setAnalysis(undefined);
      analyzeLogo(dataUrl).then(setAnalysis);
      transitionTo('loading');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleAnalysisComplete() {
    const url = foundUrlRef.current ?? '';
    const domain = pendingDomainRef.current || 'your file';
    setLogoUrl(url);
    setLogoDomain(domain);
    transitionTo('ready');
    onReady?.(url, domain);
    pendingDomainRef.current = '';
  }

  function reset() {
    transitionTo('idle');
    setLogoUrl('');
    setLogoDomain('');
    setAnalysis(undefined);
    foundUrlRef.current = null;
    pendingDomainRef.current = '';
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function fetchFromDomain(domain: string) {
    if (!domain.trim() || isFetchingDomain) return;
    setIsFetchingDomain(true);
    try {
      const url = await fetchLogoForDomain(domain);
      const host = cleanDomain(domain);
      pendingDomainRef.current = host;
      if (onImmediateSubmit) {
        onImmediateSubmit(url, host);
        return;
      }
      foundUrlRef.current = url;
      setAnalysis(undefined);
      analyzeLogo(url).then(setAnalysis);
      transitionTo('loading');
    } finally {
      setIsFetchingDomain(false);
    }
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {phase === 'idle' && renderIdle({ triggerFileInput, fetchFromDomain, isFetchingDomain })}

      {phase === 'loading' && (
        <LogoAnalysisPopup
          logoUrl={foundUrlRef.current ?? ''}
          analysis={analysis}
          onComplete={handleAnalysisComplete}
        />
      )}

      {phase === 'ready' && renderReady({ logoUrl, domain: logoDomain, brand, onReset: reset, analysis })}
    </>
  );
}
