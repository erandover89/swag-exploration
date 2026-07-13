import { useState, useRef, useEffect } from 'react';
import { X, Mail, Check, UserPlus, Trash2 } from 'lucide-react';

interface Props {
  accountName: string;
  onClose: () => void;
}

export function InviteModal({ accountName, onClose }: Props) {
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [pendingEmails, setPendingEmails] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function addEmail() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) { setEmailError('Enter a valid email address'); return; }
    if (pendingEmails.includes(email)) { setEmailError('Already added'); return; }
    setPendingEmails(prev => [...prev, email]);
    setEmailInput('');
    setEmailError('');
  }

  function removeEmail(email: string) {
    setPendingEmails(prev => prev.filter(e => e !== email));
  }

  function handleSend() {
    if (pendingEmails.length === 0) return;
    setSent(true);
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
              Invite to {accountName}
            </h2>
            <p className="text-[13px] text-snp-navy-400 mt-0.5 leading-relaxed max-w-[320px]">
              Invitees will be added as <span className="font-semibold text-snp-navy-600">Managers</span> and will have access to all designs and settings in this account.
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

          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                <Check className="w-6 h-6" style={{ color: '#16a34a' }} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-snp-navy-950">Invites sent!</p>
                <p className="text-[13px] text-snp-navy-400 mt-0.5">
                  {pendingEmails.length} invite{pendingEmails.length !== 1 ? 's' : ''} sent. They'll receive an email to join {accountName}.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 h-9 px-5 rounded-[10px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#3077c9' }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Email input */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">Add people by email</p>
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
                    Add
                  </button>
                </div>
                {emailError && <p className="text-[11px] text-red-500">{emailError}</p>}
              </div>

              {/* Pending invites */}
              {pendingEmails.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-bold text-snp-navy-400 uppercase tracking-widest">
                    Inviting ({pendingEmails.length})
                  </p>
                  <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
                    {pendingEmails.map(email => (
                      <div key={email} className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-snp-navy-50 group">
                        <div className="w-7 h-7 rounded-full bg-snp-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-snp-indigo-600 uppercase">
                            {email[0]}
                          </span>
                        </div>
                        <span className="flex-1 text-[13px] text-snp-navy-700 truncate">{email}</span>
                        <span className="text-[10px] font-semibold text-snp-indigo-500 bg-snp-indigo-50 px-2 py-0.5 rounded-full">Manager</span>
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

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-snp-navy-100">
                <button
                  onClick={onClose}
                  className="h-9 px-4 rounded-[10px] text-[13px] font-medium text-snp-navy-500 hover:bg-snp-navy-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={pendingEmails.length === 0}
                  className="h-9 px-5 rounded-[10px] text-[13px] font-semibold text-white flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: '#3077c9' }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Send invite{pendingEmails.length > 1 ? 's' : ''}
                  {pendingEmails.length > 0 && ` (${pendingEmails.length})`}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
