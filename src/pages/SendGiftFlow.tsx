import { useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown, Sparkles, Check, Users, Mail, Upload,
  Monitor, Plus, X, Pencil, Search, MoreHorizontal,
  ShieldCheck, Calendar, Clock, Settings2, Info,
  ChevronRight,
} from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY } from '../data/mockData';

// ── Static data ───────────────────────────────────────────────────────────────

const MOCK_RECIPIENTS = [
  'alex.johnson@acme.com',
  'sarah.chen@techcorp.io',
  'marcus.williams@startup.co',
  'priya.patel@enterprise.net',
  'jordan.kim@company.org',
  'emily.rodriguez@firm.com',
  'daniel.okonkwo@agency.io',
  'lisa.tanaka@brand.co',
];

const COLLECTIONS = [
  { id: 'snappys',  name: "Snappy's Picks",       sub: 'Most loved this month',        productIds: ['1','2','13','15'], choices: 70 },
  { id: 'wellness', name: 'Wellness & Outdoors',   sub: 'For the active & mindful',     productIds: ['2','16','15','1'],  choices: 48 },
  { id: 'office',   name: 'Office Essentials',     sub: 'Everyday work staples',        productIds: ['14','13','18','9'], choices: 55 },
  { id: 'tech',     name: 'Tech & Gear',           sub: "Gadgets they'll actually use", productIds: ['12','19','2','14'], choices: 42 },
  { id: 'ai',       name: 'Custom AI Collection',  sub: 'Built for your recipients',    productIds: ['1','2','14'],       choices: 30 },
];

const UNWRAP_THEMES = [
  { id: 't1', bg: 'from-[#1a3a6e] to-[#0a1f40]', label: 'Navy'    },
  { id: 't2', bg: 'from-[#0d3a2a] to-[#061f17]', label: 'Forest'  },
  { id: 't3', bg: 'from-[#3a1a6e] to-[#1a0a40]', label: 'Violet'  },
  { id: 't4', bg: 'from-[#6e1a1a] to-[#3a0a0a]', label: 'Crimson' },
  { id: 't5', bg: 'from-[#2a2a2a] to-[#0a0a0a]', label: 'Dark'    },
  { id: 't6', bg: 'from-[#3a6e1a] to-[#1a3a0a]', label: 'Sage'    },
];


// ── Small helpers ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-snp-indigo-600' : 'bg-[#d1dae4]'}`}
    >
      <span
        className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

// Section wrapper — white card with rounded corners
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#e8edf4] overflow-hidden" style={{ boxShadow: '0px 2px 8px rgba(1,39,84,0.05)' }}>
      <div className="px-6 py-5 flex items-center justify-between border-b border-[#f0f4f9]">
        <h2 className="text-[16px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Settings row — label left, control right
function SettingRow({ icon, label, value, control, last = false }: {
  icon: React.ReactNode; label: string; value?: React.ReactNode;
  control?: React.ReactNode; last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 ${!last ? 'border-b border-[#f0f4f9]' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-snp-navy-500 shrink-0">{icon}</span>
        <span className="text-[14px] font-medium text-snp-navy-700 shrink-0">{label}</span>
        {value && <span className="text-[13px] text-snp-navy-950 ml-2 truncate">{value}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {control ?? <ChevronDown className="w-4 h-4 text-snp-navy-400" />}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SendGiftFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const routeState = locationState as {
    collectionName?: string;
    productIds?: string[];
    logoUrl?: string;
    budget?: number;
  } | null;

  const collectionId   = searchParams.get('collection') ?? 'snappys';
  const budgetParam    = searchParams.get('budget')     ?? '50';

  const fallbackCollection = COLLECTIONS.find(c => c.id === collectionId) ?? COLLECTIONS[0];

  // Use route state if available (coming from QuickCollection), else fall back to search params
  const collectionName = routeState?.collectionName ?? fallbackCollection.name;
  const productIds     = routeState?.productIds     ?? fallbackCollection.productIds;
  const budgetNum      = routeState?.budget         ?? (parseFloat(budgetParam) || 50);
  const incomingLogo   = routeState?.logoUrl;

  // Campaign name
  const [campaignName, setCampaignName] = useState('Summer 2026');
  const [editingName, setEditingName]   = useState(false);

  // Gift design
  const [selectedTheme, setSelectedTheme] = useState(0);

  // Recipients
  const [recipientTab, setRecipientTab] = useState<'email' | 'csv' | 'slack' | 'teams'>('email');
  const [emailInput, setEmailInput]     = useState('');
  const [recipients, setRecipients]     = useState<string[]>(MOCK_RECIPIENTS);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInput, setPasteInput]     = useState('');

  const addRecipient = () => {
    const e = emailInput.trim();
    if (e && !recipients.includes(e)) { setRecipients(r => [...r, e]); setEmailInput(''); }
  };

  const addMultipleRecipients = (text: string) => {
    const emails = text.split(/[,;\n\r\t]+/).map(s => s.trim()).filter(s => s.includes('@'));
    if (emails.length) setRecipients(r => [...new Set([...r, ...emails])]);
  };

  const commitPaste = () => {
    addMultipleRecipients(pasteInput);
    setPasteInput('');
    setShowPasteModal(false);
  };

  // Send success
  const [showSuccess, setShowSuccess] = useState(false);

  // Settings
  const [giftGuarantee, setGiftGuarantee] = useState(true);
  const [useBalance, setUseBalance]       = useState(true);
  const [showAdvanced, setShowAdvanced]   = useState(false);

  // Pricing
  const perPerson    = budgetNum;
  const snappyFee    = +(perPerson * 0.15).toFixed(2);
  const estimatedTax = +(perPerson * 0.10).toFixed(2);
  const subtotal     = +(perPerson + snappyFee + estimatedTax).toFixed(2);
  const total        = +(subtotal * recipients.length).toFixed(2);
  const hasRecipients = recipients.length > 0;

  // Hero product image for greeting card
  const heroProduct = PRODUCTS.find(p => p.id === productIds[0]);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f5f7fa' }}>

      {/* ── Header (dark) ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: 'linear-gradient(90deg, #0d1b2e 0%, #0f2240 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Left: quit */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest hidden sm:block">
            Quit Without Saving
          </span>
        </div>

        {/* Center: campaign name */}
        <div className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
          <span className="text-[18px]">🌻</span>
          {editingName ? (
            <input
              autoFocus
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
              className="text-[16px] font-bold text-white bg-transparent border-b border-white/40 outline-none px-1 py-0.5 min-w-[120px] text-center"
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 group">
              <span className="text-[16px] font-bold text-white">{campaignName}</span>
              <Pencil className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
            </button>
          )}
          <span className="px-2 py-0.5 rounded-full bg-[#c2410c]/20 border border-[#c2410c]/40 text-[10px] font-black text-[#fb923c] uppercase tracking-wide">
            Draft
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-[13px] font-medium text-white/60 hover:text-white/90 transition-colors">
            Finish Later
          </button>
          <button
            onClick={() => setShowSuccess(true)}
            className="flex items-center gap-2 h-10 px-6 rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#3077c9' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Review &amp; Send
            {hasRecipients && (
              <span className="bg-white/25 rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none">
                {recipients.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Page title ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8edf4]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#fff7ed] flex items-center justify-center text-[24px] shrink-0">🌻</div>
          {editingName ? (
            <input
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
              className="text-[28px] font-bold text-snp-navy-950 border-b-2 border-snp-indigo-600 bg-transparent outline-none"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-2 group">
              <h1
                className="text-[28px] font-bold text-snp-navy-950"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {campaignName}
              </h1>
              <Pencil className="w-4 h-4 text-[#c8dff5] group-hover:text-snp-indigo-600 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 py-7">
        <div className="flex gap-7 items-start">

          {/* ── Main column ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Gift Design */}
            <Section
              title="Gift Design"
              action={
                <button className="flex items-center gap-1.5 text-[12px] font-semibold text-snp-purple-700 bg-[#f5f3ff] border border-snp-purple-200 rounded-full px-3 py-1.5 hover:bg-[#ede9fe] transition-colors">
                  <Sparkles className="w-3 h-3" />
                  Design with AI
                </button>
              }
            >
              {/* Greeting card */}
              <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-3">Greeting Card</p>
              <div
                className="rounded-[16px] overflow-hidden border border-[#e8edf4]"
                style={{ boxShadow: '0px 4px 20px rgba(1,39,84,0.08)' }}
              >
                {/* Card top bar */}
                <div className="bg-white px-5 py-3 border-b border-[#f0f4f9] flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[5px] bg-snp-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-[8px] font-black">{MOCK_COMPANY.logo}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-snp-navy-600">{MOCK_COMPANY.name}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="text-[11px] font-medium text-snp-navy-600 border border-snp-navy-200 rounded-[6px] px-2.5 py-1 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors">Change Cover</button>
                    <button className="text-[11px] font-medium text-snp-navy-600 border border-snp-navy-200 rounded-[6px] px-2.5 py-1 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors">Reposition</button>
                  </div>
                </div>

                {/* Card cover image */}
                <div
                  className="relative h-[220px] flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, var(--snp-indigo-100) 0%, #ede9fe 50%, #fce7f3 100%)' }}
                >
                  {/* Floating product images */}
                  {productIds.slice(0, 3).map((id, i) => {
                    const p = PRODUCTS.find(pr => pr.id === id);
                    if (!p) return null;
                    const positions = [
                      { left: '8%', top: '15%', rotate: '-8deg', size: 100 },
                      { left: '35%', top: '10%', rotate: '4deg',  size: 120 },
                      { right: '8%', top: '20%', rotate: '10deg', size: 100 },
                    ];
                    const pos = positions[i];
                    return (
                      <div
                        key={p.id}
                        className="absolute bg-white rounded-[14px] shadow-[0px_8px_24px_rgba(1,39,84,0.14)] overflow-hidden"
                        style={{ ...pos, width: pos.size, height: pos.size, transform: `rotate(${pos.rotate})` }}
                      >
                        {p.image.startsWith('/') ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <span className="flex items-center justify-center h-full text-4xl">{p.image}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Card message */}
                <div className="bg-white px-8 py-6">
                  <div className="text-center mb-4">
                    <p className="text-[20px] font-bold text-snp-navy-950 mb-0.5">
                      You deserve this{' '}
                      <span className="inline-block bg-snp-indigo-600/10 text-snp-indigo-600 px-2 py-0.5 rounded-lg text-[18px]">@firstname</span>
                      !
                    </p>
                  </div>
                  <p className="text-[13px] text-snp-navy-600 text-center leading-relaxed mb-4">
                    Here's to a human gesture in a digital world…
                  </p>
                  <div className="text-center text-[12px] text-snp-navy-500">
                    Yours,{' '}
                    <span className="inline-block bg-snp-navy-50 text-snp-navy-700 px-2 py-0.5 rounded-lg font-medium">@companyname</span>
                  </div>
                </div>
              </div>

              {/* Unwrapping experience */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest">Unwrapping Experience</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#e8edf4]" />
                    <div className="w-5 h-5 rounded-md bg-snp-indigo-600" />
                    <div className="w-5 h-5 rounded-md bg-snp-purple-700" />
                  </div>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {UNWRAP_THEMES.map((t, i) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTheme(i)}
                      className={`shrink-0 w-[120px] h-[80px] rounded-[12px] overflow-hidden cursor-pointer bg-gradient-to-br ${t.bg} transition-all ${
                        selectedTheme === i
                          ? 'ring-2 ring-snp-indigo-600 ring-offset-2'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                  <div className="shrink-0 w-[100px] h-[80px] rounded-[12px] border-2 border-dashed border-[#c8dff5] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-snp-navy-50 transition-colors">
                    <Plus className="w-4 h-4 text-snp-navy-500" />
                    <span className="text-[10px] font-semibold text-snp-navy-500">Browse All</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Recipients */}
            <Section
              title="Recipients"
              action={
                <span className="px-3 py-1 rounded-full bg-snp-navy-50 border border-snp-navy-200 text-[11px] font-bold text-snp-navy-500 uppercase tracking-wide">
                  {recipients.length} Recipients Added
                </span>
              }
            >
              {/* Method tabs */}
              <div
                className="flex items-center gap-0 border-b border-[#e8edf4] mb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-6 px-6"
                style={{ scrollbarWidth: 'none' }}
              >
                {[
                  { id: 'notify',  label: 'Send Notifications', hasInfo: true },
                  { id: 'links',   label: 'Generate Links/Codes', hasInfo: true },
                  { id: 'print',   label: 'Print Me', hasInfo: false },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className="flex items-center gap-1.5 h-10 px-4 text-[12px] font-medium text-snp-navy-500 hover:text-snp-navy-700 whitespace-nowrap border-b-2 border-transparent -mb-px transition-all"
                  >
                    {tab.label}
                    {tab.hasInfo && <Info className="w-3 h-3" />}
                  </button>
                ))}

                <div className="w-px h-5 bg-[#e8edf4] mx-1 shrink-0" />

                {([
                  { id: 'email' as const,  label: 'Email',    Icon: Mail    },
                  { id: 'csv'   as const,  label: 'SMS',      Icon: Monitor },
                  { id: 'slack' as const,  label: 'Slack',    Icon: Monitor },
                  { id: 'teams' as const,  label: 'MS Teams', Icon: Monitor },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRecipientTab(tab.id)}
                    className={`flex items-center gap-1.5 h-10 px-4 text-[12px] font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                      recipientTab === tab.id
                        ? 'border-snp-indigo-600 text-snp-navy-950 font-semibold'
                        : 'border-transparent text-snp-navy-500 hover:text-snp-navy-700'
                    }`}
                  >
                    <tab.Icon className="w-3.5 h-3.5 shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-400" />
                <input
                  type="text"
                  placeholder="Type an email and press Enter, or paste multiple"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addRecipient()}
                  onPaste={e => {
                    const text = e.clipboardData.getData('text');
                    if (text.includes(',') || text.includes('\n') || text.includes(';')) {
                      e.preventDefault();
                      addMultipleRecipients(text);
                    }
                  }}
                  className="w-full h-10 pl-9 pr-10 border border-[#e8edf4] rounded-[10px] text-[13px] text-snp-navy-950 placeholder-[#b0bcc9] focus:outline-none focus:border-snp-indigo-600 focus:ring-1 focus:ring-snp-indigo-600/15 bg-[#fafbfd] transition"
                />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-snp-navy-400 hover:text-snp-navy-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Recipient list or empty state */}
              {recipients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-[20px] bg-snp-indigo-50 flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-[#b0c8e8]" />
                  </div>
                  <p className="text-[14px] font-semibold text-snp-navy-700 mb-1">Add your lucky recipients</p>
                  <p className="text-[12px] text-snp-navy-500 leading-relaxed mb-1">
                    Type or paste emails above, or upload a CSV to add multiple at once.
                  </p>
                  <button className="text-[12px] font-medium text-snp-indigo-600 underline underline-offset-2 mb-5">
                    Download CSV Template
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={addRecipient}
                      className="flex items-center gap-2 h-9 px-5 rounded-[10px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Recipient
                    </button>
                    <button
                      className="flex items-center gap-2 h-9 px-5 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                      style={{ background: '#3077c9' }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload From File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {recipients.map((email, i) => (
                    <div key={i} className="group flex items-center gap-3 py-2 px-3 rounded-[10px] hover:bg-snp-navy-50">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="flex-1 text-[13px] text-snp-navy-700 truncate">{email}</span>
                      <button onClick={() => setRecipients(r => r.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5 text-snp-navy-500 hover:text-[#e63946]" />
                      </button>
                    </div>
                  ))}
                  <div className="mt-2 px-3 py-1.5 bg-snp-indigo-50 rounded-[8px] flex items-center gap-2">
                    <Check className="w-3 h-3 text-snp-indigo-600" />
                    <span className="text-[12px] font-medium text-snp-indigo-600 flex-1">
                      {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} added
                    </span>
                    <button
                      onClick={() => setShowPasteModal(true)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-snp-indigo-600 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add more
                    </button>
                  </div>
                </div>
              )}
            </Section>

            {/* Gift Settings */}
            <Section title="Gift Settings">
              <div className="-mx-6 px-0">
                <SettingRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Campaign Name"
                  value={<span className="font-semibold">{campaignName}</span>}
                  control={<ChevronRight className="w-4 h-4 text-[#c0ccd9]" />}
                />
                <SettingRow
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Gift Guarantee"
                  value={
                    <span className="flex items-center gap-1 text-snp-navy-700">
                      Enabled — Ensure everyone gets a gift
                      <Info className="w-3 h-3 text-snp-navy-400 shrink-0" />
                    </span>
                  }
                  control={<Toggle checked={giftGuarantee} onChange={setGiftGuarantee} />}
                />
                <SettingRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Schedule"
                  value="Send Now"
                />
                <SettingRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Expiration Date"
                  value={
                    <span className="flex items-center gap-1.5">
                      Thu, 06/20/2024 at 3:00 PM GMT+3
                      <span className="text-[#c0ccd9]">·</span>
                      <span className="text-snp-navy-500">60 days after</span>
                    </span>
                  }
                />
                <SettingRow
                  icon={<Settings2 className="w-4 h-4" />}
                  label="Advanced Settings"
                  last
                  control={
                    <button
                      onClick={() => setShowAdvanced(v => !v)}
                      className="flex items-center gap-1"
                    >
                      <ChevronDown className={`w-4 h-4 text-snp-navy-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </button>
                  }
                />
                {showAdvanced && (
                  <div className="px-6 pb-4 pt-2 bg-[#fafbfd] border-t border-[#f0f4f9] flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-snp-navy-700">Expiration</p>
                      <select className="border border-snp-navy-200 rounded-[8px] px-2 py-1 text-[13px] text-snp-navy-950 focus:outline-none focus:border-snp-indigo-600 bg-white">
                        <option>14 days</option>
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-snp-navy-700">Allow re-gifting</p>
                      <Toggle checked={false} onChange={() => {}} />
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Payments */}
            <Section title="Payments">
              <p className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-widest mb-4">Select the Payment Method</p>

              {/* Balance card */}
              <div className="flex items-center gap-4 p-4 bg-snp-indigo-50 border border-[#c7d7f4] rounded-[14px] mb-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-snp-navy-600 uppercase tracking-wide flex items-center gap-1 mb-0.5">
                    Prepaid Balance <Info className="w-3 h-3" />
                  </p>
                  <p className="text-[18px] font-black text-snp-navy-950 leading-none">$1,203.00</p>
                </div>
                <button className="text-[12px] font-semibold text-snp-indigo-600 hover:underline shrink-0">
                  Change Balance
                </button>
              </div>

              <div className="border-t border-[#f0f4f9] my-4" />

              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-medium text-snp-navy-700">Use balance for this order</span>
                <Toggle checked={useBalance} onChange={setUseBalance} />
              </div>

              {/* Add billing */}
              <button className="w-full flex items-center justify-center gap-2 h-11 rounded-[12px] border-2 border-dashed border-[#c7d7f4] text-[13px] font-semibold text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors mb-4">
                <Plus className="w-4 h-4" />
                Add A Billing Method
              </button>

              <button className="flex items-center gap-1.5 text-[12px] font-medium text-snp-indigo-600 hover:underline">
                <Info className="w-3.5 h-3.5" />
                How does Snappy's pricing work?
              </button>
            </Section>

            {/* Bottom CTA */}
            <button
              onClick={() => setShowSuccess(true)}
              className="w-full h-14 rounded-[16px] text-white text-[16px] font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2.5"
              style={{ background: '#3077c9' }}
            >
              <Sparkles className="w-5 h-5" />
              Review &amp; Send
              {hasRecipients && (
                <span className="bg-white/20 rounded-full px-2 py-0.5 text-[13px] font-bold">
                  {recipients.length} recipients
                </span>
              )}
            </button>

          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div className="w-[300px] xl:w-[320px] shrink-0">
            <div className="sticky top-[76px]">
              <div
                className="bg-white rounded-[16px] border border-[#e8edf4] overflow-hidden"
                style={{ boxShadow: '0px 2px 8px rgba(1,39,84,0.06)' }}
              >

                {/* Collection card */}
                <div className="p-5 border-b border-[#f0f4f9]">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-[12px] overflow-hidden shrink-0 bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center">
                      {incomingLogo ? (
                        <img src={incomingLogo} alt="logo" className="w-full h-full object-contain p-2" />
                      ) : heroProduct && heroProduct.image.startsWith('/') ? (
                        <img src={heroProduct.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{heroProduct?.image ?? '🎁'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">Gift Collection</p>
                      <p className="text-[14px] font-bold text-snp-navy-950 leading-snug mb-0.5 line-clamp-2">{collectionName}</p>
                      <p className="text-[13px] font-semibold text-snp-indigo-600">${budgetNum.toFixed(2)}</p>
                    </div>
                  </div>
                  <button className="mt-3 text-[12px] font-semibold text-snp-indigo-600 hover:underline">
                    Change Gift
                  </button>
                </div>

                {/* Pricing */}
                <div className="p-5">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-[13px] text-snp-navy-600">
                        Shipping <Info className="w-3 h-3 text-[#c0ccd9]" />
                      </span>
                      <span className="text-[13px] font-semibold text-[#22c55e]">Included</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-[13px] text-snp-navy-600">
                        15% Snappy fee <Info className="w-3 h-3 text-[#c0ccd9]" />
                      </span>
                      <span className="text-[13px] font-semibold text-snp-navy-700">${snappyFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-[13px] text-snp-navy-600">
                        10% estimated tax <Info className="w-3 h-3 text-[#c0ccd9]" />
                      </span>
                      <span className="text-[13px] font-semibold text-snp-navy-700">${estimatedTax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#f0f4f9] pt-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center gap-1 text-[13px] font-bold text-snp-navy-950">
                        Subtotal Per Recipient <Info className="w-3 h-3 text-[#c0ccd9]" />
                      </span>
                      <span className="text-[18px] font-black text-snp-navy-950">${subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-[13px] text-snp-navy-600">
                        Recipients <Info className="w-3 h-3 text-[#c0ccd9]" />
                      </span>
                      <button className="flex items-center gap-1 text-[13px] font-semibold text-snp-navy-950">
                        {hasRecipients ? `×${recipients.length}` : 'x0'}
                        <ChevronRight className="w-3.5 h-3.5 text-snp-navy-400" />
                      </button>
                    </div>
                  </div>

                  {!hasRecipients && (
                    <p className="text-center text-[12px] text-snp-navy-400 py-1 mb-3">Add recipients to see total</p>
                  )}
                  {hasRecipients && (
                    <div className="border-t border-[#f0f4f9] pt-3 mb-3 flex justify-between items-baseline">
                      <span className="text-[14px] font-bold text-snp-navy-950">Total</span>
                      <span className="text-[20px] font-black text-snp-navy-950">${total.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-[#f0f4f9] pt-4 mb-4">
                    <button className="flex items-center gap-1.5 text-[12px] font-medium text-snp-indigo-600 hover:underline">
                      <Info className="w-3.5 h-3.5" />
                      How does Snappy's pricing work?
                    </button>
                  </div>

                  <div className="p-3 bg-snp-indigo-50 rounded-[10px] flex items-start gap-2.5 mb-4">
                    <Info className="w-4 h-4 text-snp-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-snp-navy-700 leading-relaxed">
                      We invoice the cost of claimed gifts. The rest returns to your balance.
                    </p>
                  </div>

                  <button
                    onClick={() => alert('Preview gift experience')}
                    className="w-full h-11 rounded-[12px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700 hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Preview Gift
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Paste multiple recipients modal ────────────────────────────────── */}
      {showPasteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,31,61,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPasteModal(false); }}
        >
          <div className="bg-white rounded-[24px] p-7 w-full max-w-[480px] shadow-[0px_24px_48px_rgba(1,39,84,0.20)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Add multiple recipients
              </h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="w-8 h-8 rounded-full border border-snp-navy-200 flex items-center justify-center hover:bg-snp-navy-50 transition-colors"
              >
                <X className="w-4 h-4 text-snp-navy-600" />
              </button>
            </div>
            <p className="text-[13px] text-snp-navy-500 mb-3 leading-relaxed">
              Paste email addresses separated by commas, semicolons, or new lines. You can also drag and drop a CSV file.
            </p>
            <textarea
              autoFocus
              value={pasteInput}
              onChange={e => setPasteInput(e.target.value)}
              placeholder={'alex@company.com, sarah@company.com\nmarcus@company.com'}
              className="w-full h-[140px] border border-[#e8edf4] rounded-[12px] px-4 py-3 text-[13px] text-snp-navy-950 placeholder-snp-navy-400 focus:outline-none focus:border-snp-indigo-600 focus:ring-1 focus:ring-snp-indigo-600/15 resize-none bg-[#fafbfd] transition"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={commitPaste}
                disabled={!pasteInput.trim()}
                className="flex-1 h-11 rounded-[10px] text-white text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#3077c9' }}
              >
                Add Recipients
              </button>
              <button
                onClick={() => setShowPasteModal(false)}
                className="h-11 px-5 rounded-[10px] border border-snp-navy-200 text-[14px] font-medium text-snp-navy-700 hover:border-snp-indigo-600 hover:text-snp-indigo-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success modal ───────────────────────────────────────────────────── */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,31,61,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <div className="bg-white rounded-[28px] p-8 w-full max-w-[480px] shadow-[0px_40px_80px_rgba(1,39,84,0.28)] flex flex-col items-center text-center">

            {/* Icon */}
            <div
              className="w-20 h-20 rounded-[24px] flex items-center justify-center text-[40px] mb-6"
              style={{ background: 'linear-gradient(135deg, #3077c9 0%, #1d4ed8 100%)', boxShadow: '0px 12px 24px rgba(48,119,201,0.35)' }}
            >
              🎁
            </div>

            <h2
              className="text-[28px] font-bold text-snp-navy-950 mb-2"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Gifts are on their way!
            </h2>
            <p className="text-[14px] text-snp-navy-500 leading-relaxed mb-8 max-w-[340px]">
              Your campaign has been sent. Recipients will receive an email with a link to choose and claim their gift.
            </p>

            {/* Summary card */}
            <div className="w-full bg-snp-navy-50 rounded-[16px] p-5 mb-6 text-left flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-snp-navy-500">Campaign</span>
                <span className="text-[13px] font-semibold text-snp-navy-950">{campaignName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-snp-navy-500">Collection</span>
                <span className="text-[13px] font-semibold text-snp-navy-950 max-w-[240px] text-right truncate">{collectionName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-snp-navy-500">Recipients</span>
                <span className="text-[13px] font-semibold text-snp-navy-950">{recipients.length} people</span>
              </div>
              <div className="border-t border-snp-navy-200 pt-3 flex justify-between items-baseline">
                <span className="text-[13px] font-bold text-snp-navy-950">Total charged</span>
                <span className="text-[22px] font-black text-snp-navy-950">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => navigate('/shipments')}
                className="h-12 w-full rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: '#3077c9' }}
              >
                Track Campaign
              </button>
              <button
                onClick={() => navigate('/')}
                className="h-12 w-full rounded-[12px] border border-snp-navy-200 text-[14px] font-medium text-snp-navy-700 hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-all"
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
