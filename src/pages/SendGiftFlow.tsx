import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, ChevronUp, Sparkles, Check,
  Users, Mail, Upload, Calendar, Settings2, ShieldCheck,
  Slack, Monitor, Plus, X,
} from 'lucide-react';
import { PRODUCTS, MOCK_COMPANY } from '../data/mockData';

// ── Static data ────────────────────────────────────────────────────────────────

const COLLECTIONS = [
  { id: 'snappys',  name: "Snappy's Picks",       sub: 'Most loved this month',        productIds: ['1','2','13','15'], choices: 70 },
  { id: 'wellness', name: 'Wellness & Outdoors',   sub: 'For the active & mindful',     productIds: ['2','16','15','1'],  choices: 48 },
  { id: 'office',   name: 'Office Essentials',     sub: 'Everyday work staples',        productIds: ['14','13','18','9'], choices: 55 },
  { id: 'tech',     name: 'Tech & Gear',           sub: "Gadgets they'll actually use", productIds: ['12','19','2','14'], choices: 42 },
  { id: 'ai',       name: 'Custom AI Collection',  sub: 'Built for your recipients',    productIds: ['1','2','14'],       choices: 30 },
];

const CARD_THEMES = [
  { bgFrom: '#1e3a6e', bgTo: '#0a1f40', accent: '#36d4ff',  label: 'Navy'    },
  { bgFrom: '#f5f8fc', bgTo: '#dce9f7', accent: '#3077c9',  label: 'Light'   },
  { bgFrom: '#0b3d2e', bgTo: '#061f17', accent: '#34d399',  label: 'Forest'  },
  { bgFrom: '#2c1860', bgTo: '#160c3a', accent: '#c4b5fd',  label: 'Violet'  },
  { bgFrom: '#4a0d0d', bgTo: '#2d0505', accent: '#fca5a5',  label: 'Crimson' },
  { bgFrom: '#1a1410', bgTo: '#0c0a07', accent: '#fbbf24',  label: 'Gold'    },
];

const COUNTRIES_MAP: Record<string, { name: string; flag: string }> = {
  US: { name: 'United States',  flag: '🇺🇸' },
  CA: { name: 'Canada',         flag: '🇨🇦' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  DE: { name: 'Germany',        flag: '🇩🇪' },
  FR: { name: 'France',         flag: '🇫🇷' },
  AU: { name: 'Australia',      flag: '🇦🇺' },
  NL: { name: 'Netherlands',    flag: '🇳🇱' },
  IL: { name: 'Israel',         flag: '🇮🇱' },
};

// ── Small helpers ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-[#3077c9]' : 'bg-[#d1dae4]'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}

function SectionCard({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e0ebf7] rounded-[20px] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0f4f8]">
        <span className="w-6 h-6 rounded-full bg-[#eaf1fa] flex items-center justify-center text-[10px] font-black text-[#3077c9] shrink-0">
          {num}
        </span>
        <h2 className="text-[15px] font-bold text-[#012754]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Render greeting text with coloured merge-tag spans
function GreetingPreview({ message, accent }: { message: string; accent: string }) {
  const parts = message.split(/(\{[^}]+\})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\{[^}]+\}$/.test(part) ? (
          <span
            key={i}
            className="inline-block px-1.5 py-0.5 rounded-md text-[11px] font-bold mx-0.5"
            style={{ backgroundColor: accent + 'cc', color: '#fff' }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// Fanned product collage (3 overlapping cards)
function ProductCollage({ productIds, size = 'md' }: { productIds: string[]; size?: 'sm' | 'md' }) {
  const products = productIds
    .slice(0, 3)
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const cardW   = size === 'sm' ? 72  : 108;
  const offsets = size === 'sm' ? [-28, 0, 28] : [-42, 0, 42];
  const rots    = [-9, 0, 9];
  const zs      = [1, 3, 2];
  const wrapH   = size === 'sm' ? 100 : 148;

  return (
    <div className="relative flex items-center justify-center" style={{ height: wrapH }}>
      {products.map((p, i) => (
        <div
          key={p.id}
          className="absolute rounded-[14px] overflow-hidden bg-white border border-[#e0ebf7] shadow-md"
          style={{
            width: cardW,
            height: cardW,
            transform: `rotate(${rots[i]}deg) translateX(${offsets[i]}px)`,
            zIndex: zs[i],
          }}
        >
          {p.image.startsWith('/') ? (
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <span className="flex items-center justify-center h-full text-4xl select-none">{p.image}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SendGiftFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const collectionId   = searchParams.get('collection') ?? 'snappys';
  const budgetParam    = searchParams.get('budget')     ?? '50';
  const countriesParam = searchParams.get('countries')  ?? 'US';

  const collection = COLLECTIONS.find(c => c.id === collectionId) ?? COLLECTIONS[0];
  const countries  = countriesParam.split(',').filter(Boolean);
  const budgetNum  = parseFloat(budgetParam) || 50;

  // Header: editable campaign name
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [editingName, setEditingName]   = useState(false);

  // Gift design
  const [selectedTheme, setSelectedTheme] = useState(0);
  const theme = CARD_THEMES[selectedTheme];
  const greetingMsg =
    `Hi {first_name},\n\nWe're so grateful for you! Please choose a gift as a token of our appreciation.\n\nWith gratitude,\n{sender_name}`;

  // Recipients
  const [recipientTab, setRecipientTab] = useState<'email' | 'csv' | 'slack' | 'teams'>('email');
  const [emailInput, setEmailInput]     = useState('');
  const [recipients, setRecipients]     = useState<string[]>([]);

  const addRecipient = () => {
    const e = emailInput.trim();
    if (e && !recipients.includes(e)) {
      setRecipients(r => [...r, e]);
      setEmailInput('');
    }
  };

  // Gift settings
  const [giftGuarantee, setGiftGuarantee] = useState(false);
  const [useBalance, setUseBalance]       = useState(true);
  const [showAdvanced, setShowAdvanced]   = useState(false);

  // Pricing
  const subtotal     = recipients.length * budgetNum;
  const platformFee  = subtotal * 0.15;
  const estimatedTax = subtotal * 0.10;
  const total        = subtotal + platformFee + estimatedTax;
  const hasRecipients = recipients.length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e0ebf7] h-[72px] flex items-center px-5 sm:px-8 gap-4 shrink-0">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-medium text-[#59728f] hover:text-[#012754] transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Editable campaign name */}
        <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
          {editingName ? (
            <input
              autoFocus
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
              className="text-[16px] font-bold text-[#012754] text-center border-b-2 border-[#3077c9] bg-transparent outline-none px-2 py-0.5 min-w-[160px] max-w-[300px]"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-[16px] font-bold text-[#012754] hover:text-[#3077c9] transition-colors truncate max-w-[240px]"
            >
              {campaignName}
            </button>
          )}
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[9px] font-black text-[#c2410c] uppercase tracking-wide">
            DRAFT
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="hidden sm:block text-[13px] font-medium text-[#59728f] hover:text-[#012754] transition-colors px-3 py-2 rounded-[8px] hover:bg-[#f5f8fc]">
            Save for Later
          </button>
          <button
            onClick={() => alert('Review & Send')}
            className="flex items-center gap-2 h-10 px-5 rounded-[12px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
          >
            Review & Send
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* Page title */}
        <div className="mb-7">
          <h1
            className="text-[26px] sm:text-[30px] font-bold text-[#012754] leading-tight"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Let's send your gift
          </h1>
          <p className="text-[13px] text-[#8093a9] mt-1 flex items-center gap-2 flex-wrap">
            <span>{collection.name}</span>
            <span className="text-[#d1dae4]">·</span>
            <span>Up to ${budgetNum}/person</span>
            <span className="text-[#d1dae4]">·</span>
            <span>{countries.map(c => COUNTRIES_MAP[c]?.flag ?? c).join(' ')}</span>
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Main column ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* — Section 1: Gift Design — */}
            <SectionCard num="01" title="Gift Design">
              {/* Collection tag */}
              <div className="flex items-center gap-2 mb-5">
                <div className="inline-flex items-center gap-1.5 bg-[#f0f6ff] border border-[#c7d7f4] rounded-full px-3 py-1">
                  <Sparkles className="w-3 h-3 text-[#3077c9]" />
                  <span className="text-[12px] font-semibold text-[#3077c9]">
                    {collection.choices} choices · Recipient picks one
                  </span>
                </div>
              </div>

              {/* Collage + greeting card */}
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">

                {/* Collage */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <ProductCollage productIds={collection.productIds} />
                  <p className="text-[11px] font-medium text-[#8093a9]">{collection.name}</p>
                </div>

                {/* Greeting card preview */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-2">Greeting Card</p>
                  <div
                    className="rounded-[16px] overflow-hidden border border-[#e0ebf7] shadow-sm"
                    style={{ background: `linear-gradient(160deg, ${theme.bgFrom} 0%, ${theme.bgTo} 100%)` }}
                  >
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[7px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                        <span className="text-[7px] font-black" style={{ color: MOCK_COMPANY.logoColor }}>
                          {MOCK_COMPANY.logo}
                        </span>
                      </div>
                      <span className="text-white/60 text-[10px] font-semibold">{MOCK_COMPANY.name}</span>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="bg-white/10 border border-white/15 rounded-[12px] p-3 text-white/85 text-[11px] leading-relaxed whitespace-pre-line">
                        <GreetingPreview message={greetingMsg} accent={theme.accent} />
                      </div>
                      <div className="mt-3 flex justify-center">
                        <div
                          className="px-4 py-1.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: theme.accent + '30',
                            color: theme.accent,
                            border: `1px solid ${theme.accent}50`,
                          }}
                        >
                          Choose Gift →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color theme swatches */}
              <div>
                <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-2.5">Card Theme</p>
                <div className="flex gap-2 flex-wrap">
                  {CARD_THEMES.map((t, i) => (
                    <button
                      key={i}
                      title={t.label}
                      onClick={() => setSelectedTheme(i)}
                      className="w-7 h-7 rounded-full border-2 transition-all duration-150"
                      style={{
                        background: `linear-gradient(160deg, ${t.bgFrom}, ${t.bgTo})`,
                        borderColor: selectedTheme === i ? t.accent : 'transparent',
                        boxShadow: selectedTheme === i ? `0 0 0 3px ${t.accent}40` : 'none',
                        transform: selectedTheme === i ? 'scale(1.18)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* — Section 2: Recipients — */}
            <SectionCard num="02" title="Recipients">
              {/* Tab bar */}
              <div className="flex gap-1 bg-[#f5f8fc] rounded-[12px] p-1 mb-5">
                {([
                  { id: 'email' as const,  label: 'Email',      Icon: Mail    },
                  { id: 'csv'   as const,  label: 'CSV Upload', Icon: Upload  },
                  { id: 'slack' as const,  label: 'Slack',      Icon: Slack   },
                  { id: 'teams' as const,  label: 'Teams',      Icon: Monitor },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRecipientTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[9px] text-[12px] font-medium transition-all ${
                      recipientTab === tab.id
                        ? 'bg-white text-[#012754] shadow-sm font-semibold'
                        : 'text-[#8093a9] hover:text-[#345276]'
                    }`}
                  >
                    <tab.Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {recipientTab === 'email' ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addRecipient()}
                      className="flex-1 h-10 border border-[#e0ebf7] rounded-[10px] px-3 text-[14px] text-[#012754] placeholder-[#a6b3c3] focus:outline-none focus:border-[#3077c9] focus:ring-1 focus:ring-[#3077c9]/20 transition"
                    />
                    <button
                      onClick={addRecipient}
                      className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold transition-opacity hover:opacity-90 shrink-0 flex items-center gap-1.5"
                      style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {recipients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#f5f8fc] flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-[#c0ccd9]" />
                      </div>
                      <p className="text-[13px] font-medium text-[#8093a9]">No recipients yet</p>
                      <p className="text-[12px] text-[#b0bcc9] mt-1">Add emails above to get started</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {recipients.map((email, i) => (
                        <div key={i} className="group flex items-center gap-3 py-2 px-3 rounded-[10px] hover:bg-[#f5f8fc]">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {email[0].toUpperCase()}
                          </div>
                          <span className="flex-1 text-[13px] text-[#345276] truncate">{email}</span>
                          <button
                            onClick={() => setRecipients(r => r.filter((_, j) => j !== i))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5 text-[#8093a9] hover:text-[#e63946]" />
                          </button>
                        </div>
                      ))}
                      <div className="mt-2 px-3 py-1.5 bg-[#f0f6ff] rounded-[8px] flex items-center gap-2">
                        <Check className="w-3 h-3 text-[#3077c9]" />
                        <span className="text-[12px] font-medium text-[#3077c9]">
                          {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} added
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#f5f8fc] flex items-center justify-center mb-3">
                    {recipientTab === 'csv'   ? <Upload  className="w-5 h-5 text-[#c0ccd9]" /> :
                     recipientTab === 'slack' ? <Slack   className="w-5 h-5 text-[#c0ccd9]" /> :
                                               <Monitor className="w-5 h-5 text-[#c0ccd9]" />}
                  </div>
                  <p className="text-[13px] font-medium text-[#8093a9]">
                    {recipientTab === 'csv'   ? 'Upload a CSV file'              :
                     recipientTab === 'slack' ? 'Connect your Slack workspace'   :
                                               'Connect Microsoft Teams'}
                  </p>
                  <p className="text-[12px] text-[#b0bcc9] mt-1">
                    {recipientTab === 'csv'   ? 'Add multiple recipients at once' :
                                               'Import recipients from your workspace'}
                  </p>
                  <button className="mt-4 h-9 px-5 rounded-[10px] border border-[#e0ebf7] text-[13px] font-medium text-[#345276] hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors">
                    {recipientTab === 'csv' ? 'Upload CSV' : 'Connect'}
                  </button>
                </div>
              )}
            </SectionCard>

            {/* — Section 3: Gift Settings — */}
            <SectionCard num="03" title="Gift Settings">
              <div className="flex flex-col gap-0">

                {/* Campaign name */}
                <div className="pb-4">
                  <label className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest block mb-1.5">
                    Campaign Name
                  </label>
                  <input
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    className="w-full h-10 border border-[#e0ebf7] rounded-[10px] px-3 text-[14px] text-[#012754] focus:outline-none focus:border-[#3077c9] focus:ring-1 focus:ring-[#3077c9]/20 transition"
                  />
                </div>

                {/* Gift Guarantee */}
                <div className="flex items-center justify-between py-4 border-t border-[#f0f4f8]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#3077c9] shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-[#012754]">Gift Guarantee</p>
                      <p className="text-[11px] text-[#8093a9]">Auto-resend if gift is undelivered</p>
                    </div>
                  </div>
                  <Toggle checked={giftGuarantee} onChange={setGiftGuarantee} />
                </div>

                {/* Schedule */}
                <div className="flex items-center justify-between py-4 border-t border-[#f0f4f8]">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#8093a9] shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-[#012754]">Schedule</p>
                      <p className="text-[11px] text-[#8093a9]">Send immediately or pick a future date</p>
                    </div>
                  </div>
                  <button className="text-[13px] font-medium text-[#59728f] border border-[#e0ebf7] rounded-[8px] px-3 py-1.5 hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors">
                    Send Now
                  </button>
                </div>

                {/* Advanced */}
                <div className="border-t border-[#f0f4f8] pt-4">
                  <button
                    onClick={() => setShowAdvanced(v => !v)}
                    className="flex items-center gap-2 text-[12px] font-semibold text-[#59728f] hover:text-[#345276] transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Advanced Options
                    {showAdvanced
                      ? <ChevronUp className="w-3.5 h-3.5 ml-1" />
                      : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 pl-5 border-l-2 border-[#e0ebf7] flex flex-col gap-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-[#345276]">Expiration</p>
                        <select className="border border-[#e0ebf7] rounded-[8px] px-2 py-1 text-[13px] text-[#012754] focus:outline-none focus:border-[#3077c9] bg-white">
                          <option>14 days</option>
                          <option>30 days</option>
                          <option>60 days</option>
                          <option>90 days</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-[#345276]">Allow re-gifting</p>
                        <Toggle checked={false} onChange={() => {}} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* — Section 4: Payments — */}
            <SectionCard num="04" title="Payments">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#f0f6ff] border border-[#c7d7f4] rounded-[14px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#012754]">$1,203.00 available</p>
                    <p className="text-[11px] text-[#59728f]">Prepaid balance · Snappy Essential</p>
                  </div>
                  <Toggle checked={useBalance} onChange={setUseBalance} />
                </div>

                {(!useBalance || (hasRecipients && total > 1203)) && (
                  <button className="flex items-center gap-2 h-10 px-4 rounded-[10px] border-2 border-dashed border-[#c7d7f4] text-[13px] font-medium text-[#59728f] hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Billing Method
                  </button>
                )}
              </div>
            </SectionCard>

          </div>

          {/* ── Sticky sidebar ──────────────────────────────────────────────── */}
          <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-[88px]">
              <div className="bg-white border border-[#e0ebf7] rounded-[20px] overflow-hidden">

                {/* Gift preview */}
                <div className="p-5 border-b border-[#f0f4f8]">
                  <ProductCollage productIds={collection.productIds} size="sm" />
                  <div className="mt-3 text-center">
                    <p className="text-[14px] font-bold text-[#012754]">{collection.name}</p>
                    <p className="text-[12px] text-[#8093a9] mt-0.5">
                      {collection.choices} choices · Recipient picks one
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    <span className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2.5 py-1 text-[11px] font-medium text-[#59728f]">
                      Up to ${budgetNum}/person
                    </span>
                    {countries.slice(0, 2).map(c => (
                      <span key={c} className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2.5 py-1 text-[11px] font-medium text-[#59728f]">
                        {COUNTRIES_MAP[c]?.flag ?? c} {COUNTRIES_MAP[c]?.name ?? c}
                      </span>
                    ))}
                    {countries.length > 2 && (
                      <span className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-full px-2.5 py-1 text-[11px] font-medium text-[#59728f]">
                        +{countries.length - 2} more
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => alert('Preview gift experience')}
                    className="mt-4 w-full h-9 rounded-[11px] border border-[#e0ebf7] text-[13px] font-medium text-[#345276] hover:border-[#3077c9] hover:text-[#3077c9] hover:bg-[#f0f6ff] transition-colors"
                  >
                    Preview Gift →
                  </button>
                </div>

                {/* Pricing */}
                <div className="p-5">
                  <p className="text-[10px] font-bold text-[#a6b3c3] uppercase tracking-widest mb-4">Pricing</p>

                  {hasRecipients ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#59728f]">
                          Gift value ({recipients.length} × ${budgetNum})
                        </span>
                        <span className="text-[13px] font-semibold text-[#012754]">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#59728f]">Platform fee (15%)</span>
                        <span className="text-[13px] font-semibold text-[#012754]">
                          ${platformFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#59728f]">Est. tax (10%)</span>
                        <span className="text-[13px] font-semibold text-[#012754]">
                          ${estimatedTax.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-[#f0f4f8] pt-2.5 flex justify-between items-baseline">
                        <span className="text-[14px] font-bold text-[#012754]">Total</span>
                        <span className="text-[17px] font-black text-[#012754]">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-[12px] text-[#b0bcc9] py-3">
                      Add recipients to see pricing
                    </p>
                  )}

                  <button
                    onClick={() => alert('Review & Send')}
                    className="mt-5 w-full h-11 rounded-[13px] text-white text-[14px] font-bold transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                  >
                    Review & Send
                  </button>
                  {!hasRecipients && (
                    <p className="mt-2 text-center text-[11px] text-[#b0bcc9]">
                      Add recipients to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
