import { useState, useRef, useEffect } from 'react';
import { X, Link2, Check, Mail, UserPlus, Trash2 } from 'lucide-react';
import { type Design } from '../data/mockData';
import { useUserDesigns } from '../context/UserDesignsContext';

interface Props {
  design: Design;
  onClose: () => void;
}

export function ShareDesignModal({ design, onClose }: Props) {
  const { updateDesign } = useUserDesigns();
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const shareUrl = `${window.location.origin}/share/${design.id}`;
  const sharedWith = design.sharedWith ?? [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function addEmail() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) { setEmailError('Enter a valid email address'); return; }
    if (sharedWith.includes(email)) { setEmailError('Already added'); return; }
    updateDesign(design.id, { sharedWith: [...sharedWith, email] });
    setEmailInput('');
    setEmailError('');
  }

  function removeEmail(email: string) {
    updateDesign(design.id, { sharedWith: sharedWith.filter(e => e !== email) });
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-[24px] w-full max-w-[460px] mx-4 shadow-[0px_24px_60px_rgba(1,39,84,0.18)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-snp-navy-100">
          <div>
            <h2 className="text-[18px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Share design
            </h2>
            <p className="text-[13px] text-snp-navy-400 mt-0.5">
              Anyone with the link can view — no account needed
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-snp-navy-100 hover:bg-snp-navy-200 flex items-center justify-center transition-colors mt-0.5 shrink-0"
          >
            <X className="w-4 h-4 text-snp-navy-500" />
          </button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-5">

          {/* Copy link */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Public link</p>
            <div className="flex items-center gap-2 p-1 pl-3.5 bg-snp-navy-50 border border-snp-navy-200 rounded-[12px]">
              <Link2 className="w-3.5 h-3.5 text-snp-navy-400 shrink-0" />
              <span className="flex-1 text-[12px] text-snp-navy-500 truncate font-mono">{shareUrl}</span>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-[9px] text-[12px] font-semibold transition-all"
                style={{
                  background: copied ? '#22c55e' : '#3077c9',
                  color: 'white',
                }}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy link</>}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-snp-navy-100" />
            <span className="text-[11px] text-snp-navy-400">or invite by email</span>
            <div className="flex-1 h-px bg-snp-navy-100" />
          </div>

          {/* Email invite */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Invite people</p>
            <div className="flex gap-2">
              <div className={`flex-1 flex items-center gap-2 border rounded-[12px] px-3 h-10 bg-white transition-colors focus-within:border-snp-indigo-400 ${emailError ? 'border-red-300' : 'border-snp-navy-200'}`}>
                <Mail className="w-3.5 h-3.5 text-snp-navy-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setEmailError(''); }}
                  onKeyDown={e => e.key === 'Enter' && addEmail()}
                  placeholder="name@company.com"
                  className="flex-1 text-[13px] text-snp-navy-950 bg-transparent outline-none placeholder:text-snp-navy-300"
                />
              </div>
              <button
                onClick={addEmail}
                disabled={!emailInput.trim()}
                className="h-10 px-4 rounded-[12px] text-[13px] font-semibold text-white flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: '#3077c9' }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite
              </button>
            </div>
            {emailError && <p className="text-[11px] text-red-500">{emailError}</p>}
          </div>

          {/* Shared with list */}
          {sharedWith.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">
                Shared with ({sharedWith.length})
              </p>
              <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto">
                {sharedWith.map(email => (
                  <div key={email} className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-snp-navy-50 group">
                    <div className="w-7 h-7 rounded-full bg-snp-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-snp-indigo-600 uppercase">
                        {email[0]}
                      </span>
                    </div>
                    <span className="flex-1 text-[13px] text-snp-navy-700 truncate">{email}</span>
                    <span className="text-[10px] text-snp-navy-400 font-medium">View only</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full hover:bg-snp-navy-200 flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-snp-navy-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
