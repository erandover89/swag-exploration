import { useState } from 'react';
import { Settings, Bell, ChevronDown, Home, Gift, Shirt, Package, HelpCircle } from 'lucide-react';
import { MOCK_COMPANY } from '../data/mockData';
import { SendFlowModal } from './SendFlowModal';

// ── Snappy logo mark ────────────────────────────────────────────────────────
function SnappyLogo() {
  return (
    <svg width="37" height="23" viewBox="0 0 37 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 17C5 17 7 5 12 5C17 5 17 19 22 19C27 19 27 9 32 9C34.5 9 36 11 36 11" stroke="var(--snp-indigo-600)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// ── Top dark bar ────────────────────────────────────────────────────────────
export function TopBar() {
  return (
    <div
      className="h-10 bg-snp-navy-950 border-b border-[#36d4ff] flex items-center px-12 gap-3 text-white shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Left – Plan info */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-wide">Plan</span>
        <span className="bg-snp-navy-50 text-[#2864a8] text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide">
          {MOCK_COMPANY.plan}
        </span>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <button className="bg-white/5 border border-[#36d4ff] text-[#f2f4f6] text-[12px] font-medium px-2 py-0.5 rounded-full">
          Upgrade
        </button>
      </div>


      {/* Right – Credits / icons / user */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-wide">Credit Usage</span>
          <span className="text-[12px] font-bold text-white">$1,256.00 (35%)</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        {/* Info icon (circle-i) */}
        <div className="w-px h-4 bg-white/20" />
        <HelpCircle className="w-4 h-4 text-snp-navy-400 cursor-pointer hover:text-white transition-colors" />
        <div className="w-px h-4 bg-white/20" />

        <div className="w-px h-4 bg-white/20" />
        <Settings className="w-4 h-4 text-snp-navy-400 cursor-pointer hover:text-white transition-colors" />
        <div className="w-px h-4 bg-white/20" />
        <Bell className="w-4 h-4 text-snp-navy-400 cursor-pointer hover:text-white transition-colors" />
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden">
            <span>D</span>
          </div>
          <span className="text-[10px] font-bold text-snp-navy-400 uppercase">Hi </span>
          <span className="text-[12px] font-bold text-white">Dave</span>
        </div>
      </div>
    </div>
  );
}

// ── Nav items ────────────────────────────────────────────────────────────────
export type NavPage = 'home' | 'gifts' | 'swag' | 'track';

const NAV_ITEMS: { id: NavPage; label: string; Icon: React.ElementType; href: string }[] = [
  { id: 'home',  label: 'Home',  Icon: Home,    href: '#' },
  { id: 'gifts', label: 'Gifts', Icon: Gift,    href: '#' },
  { id: 'swag',  label: 'Swag',  Icon: Shirt,   href: '/' },
  { id: 'track', label: 'Track', Icon: Package, href: '#' },
];

// ── Main nav ─────────────────────────────────────────────────────────────────
export function MainNav({ currentPage }: { currentPage: NavPage }) {
  const [showSendFlow, setShowSendFlow] = useState(false);
  return (
    <>
    <div
      className="h-[72px] bg-white border-b border-snp-navy-200 flex items-center px-6 shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Left block – logo + account selector */}
      <div className="flex items-center gap-6 shrink-0 w-[400px]">
        <SnappyLogo />

        {/* Vertical divider */}
        <div className="self-stretch py-3">
          <div className="w-px h-full bg-snp-navy-200" />
        </div>

        {/* Account selector */}
        <div className="flex items-center gap-3 p-2 rounded-[16px] cursor-pointer hover:bg-snp-navy-50 transition-colors">
          {/* Company logo box */}
          <div className="w-12 h-12 rounded-[12px] bg-white border border-snp-navy-50 flex items-center justify-center shadow-[0px_4px_8px_0px_rgba(1,39,84,0.08)] shrink-0">
            <span
              className="text-[9px] font-black tracking-widest leading-none"
              style={{ color: MOCK_COMPANY.logoColor }}
            >
              {MOCK_COMPANY.logo}
            </span>
          </div>
          {/* Company name + team */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-snp-navy-400 uppercase tracking-wide leading-none">
              {MOCK_COMPANY.name}
            </span>
            <span className="text-[12px] font-bold text-snp-navy-700 leading-none">Finance Team</span>
          </div>
          {/* Chevron */}
          <ChevronDown className="w-3.5 h-3.5 text-snp-navy-400 ml-1" />
        </div>

        {/* Vertical divider */}
        <div className="self-stretch py-3">
          <div className="w-px h-full bg-snp-navy-200" />
        </div>
      </div>

      {/* Center – Nav tabs */}
      <div className="flex flex-1 justify-center items-center h-full px-4 gap-4">
        {NAV_ITEMS.map(({ id, label, Icon, href }) => {
          const active = currentPage === id;
          return (
            <a
              key={id}
              href={href}
              className={`flex items-center gap-2 h-12 px-4 rounded-[16px] text-[14px] font-medium transition-colors ${
                active
                  ? 'bg-snp-navy-100 text-snp-indigo-600'
                  : 'text-snp-navy-600 hover:bg-snp-navy-50 hover:text-snp-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </a>
          );
        })}
      </div>

      {/* Right block – actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Vertical divider */}
        <div className="self-stretch py-3 mr-4">
          <div className="w-px h-full bg-snp-navy-200" />
        </div>

        {/* + Create */}
        <button className="flex items-center gap-2 bg-white border border-snp-navy-200 rounded-[8px] px-4 h-12 text-[14px] font-medium text-snp-navy-950 hover:bg-snp-navy-50 transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.08)]">
          + Create
          <ChevronDown className="w-3.5 h-3.5 text-snp-navy-400" />
        </button>

        {/* Send Gifts */}
        <button
          className="flex items-center justify-center h-12 px-6 text-[14px] font-medium text-white rounded-[16px] border border-snp-indigo-600 shadow-[0px_4px_8px_0px_rgba(1,39,84,0.08)] transition-opacity hover:opacity-90"
          style={{ background: '#3077c9', borderColor: 'rgba(255,255,255,0.2)' }}
          onClick={() => setShowSendFlow(true)}
        >
          Send Gifts
        </button>
      </div>
    </div>
    {showSendFlow && <SendFlowModal onClose={() => setShowSendFlow(false)} />}
    </>
  );
}
