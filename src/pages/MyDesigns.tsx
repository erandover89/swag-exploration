import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Pencil, Copy, ChevronDown, ChevronUp, ChevronRight, Trash2, X, Check, Search, Plus,
  FolderPlus, SlidersHorizontal, MoreHorizontal, Upload, ImageIcon, Share2, ArrowLeft, Globe,
  Package,
} from 'lucide-react';
import { Button } from '../components/Button';
import {
  MY_DESIGNED_ITEMS, DESIGNS, PRODUCTS, COUNTRIES, FEATURED_BRANDS, MY_COLLECTIONS,
  PRINT_TECHNIQUE_CHIPS,
  type DesignedItem, type Design, type ProductCategory, BUDGET_RANGES,
} from '../data/mockData';
import { SwagPageHeader, YourSwagSidebar } from './SwagOverview';
import { AddToCollectionMenu } from '../components/AddToCollectionMenu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { useCompanyLogo } from '../context/CompanyLogoContext';
import { LogoInput } from '../components/LogoInput';
import { useLookbooks } from '../context/LookbookContext';

// ── Constants ─────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { label: 'All Budgets', min: 0, max: Infinity },
  ...BUDGET_RANGES,
];

const PRINT_STYLE_CHIPS = PRINT_TECHNIQUE_CHIPS;

const PICKER_CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All',          value: 'All'          },
  { label: 'Apparel',      value: 'Apparel'      },
  { label: 'Drinkware',    value: 'Drinkware'    },
  { label: 'Bags',         value: 'Bags'         },
  { label: 'Electronics',  value: 'Electronics'  },
  { label: 'Home & Decor', value: 'Home & Decor' },
  { label: 'Accessories',  value: 'Accessories'  },
];

function formatPlacement(p: string) {
  return p === 'left-chest' ? 'Left Chest'
    : p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
}

// ── Sharing types ──────────────────────────────────────────────────────────────

export interface ShareEntry {
  email: string;
  name: string;
  permission: 'view' | 'edit';
}

export interface ShareSettings {
  orgWide: boolean;
  orgWidePermission: 'view' | 'edit';
  accounts: ShareEntry[];
}

const MOCK_ACCOUNTS = [
  { email: 'sarah.kim@company.com',   name: 'Sarah Kim'     },
  { email: 'design@partner.com',      name: 'Design Team'   },
  { email: 'marketing@company.com',   name: 'Marketing'     },
  { email: 'john.smith@company.com',  name: 'John Smith'    },
  { email: 'ops@company.com',         name: 'Operations'    },
];

function isSharedSettings(s?: ShareSettings) {
  return !!s && (s.orgWide || s.accounts.length > 0);
}

// ── Sharing helper components ──────────────────────────────────────────────────

function AccountAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-snp-indigo-100 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-snp-indigo-700">{initials}</span>
    </div>
  );
}

function PermissionSelect({ value, onChange }: { value: 'view' | 'edit'; onChange: (v: 'view' | 'edit') => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as 'view' | 'edit')}
      onClick={e => e.stopPropagation()}
      className="h-7 pl-2.5 pr-6 text-[12px] font-medium text-snp-navy-700 border border-snp-navy-200 rounded-[7px] bg-white focus:outline-none focus:border-snp-indigo-600 cursor-pointer appearance-none"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238093a9' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
    >
      <option value="view">Can view</option>
      <option value="edit">Can edit</option>
    </select>
  );
}

function ShareModal({ design, settings, onChange, onClose }: {
  design: Design;
  settings: ShareSettings;
  onChange: (s: ShareSettings) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<ShareSettings>(settings);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handle(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [dropdownOpen]);

  const filteredAccounts = MOCK_ACCOUNTS.filter(a =>
    !search.trim() ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleAccount(acct: typeof MOCK_ACCOUNTS[0]) {
    const isSelected = local.accounts.some(e => e.email === acct.email);
    setLocal(s => isSelected
      ? { ...s, accounts: s.accounts.filter(a => a.email !== acct.email) }
      : { ...s, accounts: [...s.accounts, { email: acct.email, name: acct.name, permission: 'view' }] }
    );
  }

  function removeAccount(email: string) {
    setLocal(s => ({ ...s, accounts: s.accounts.filter(a => a.email !== email) }));
  }

  function setPermission(email: string, permission: 'view' | 'edit') {
    setLocal(s => ({ ...s, accounts: s.accounts.map(a => a.email === email ? { ...a, permission } : a) }));
  }

  const hasAnyAccess = local.orgWide || local.accounts.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative bg-white rounded-[24px] shadow-[0px_24px_60px_0px_rgba(1,39,84,0.18)] w-full max-w-[620px] flex flex-col overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif", maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 shrink-0">
          <div>
            <h2 className="text-[18px] font-semibold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Share "{design.name || 'Untitled'}"
            </h2>
            <p className="text-[13px] text-snp-navy-400 mt-0.5">Control who can use or edit this brand</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center hover:bg-snp-navy-100 transition-colors shrink-0 ml-4">
            <X className="w-4 h-4 text-snp-navy-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 pb-5 flex flex-col gap-5">

          {/* Org-wide row */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-[14px] border border-snp-navy-200 bg-snp-navy-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-snp-indigo-100 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-snp-indigo-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-snp-navy-950">All accounts in organization</p>
                <p className="text-[11px] text-snp-navy-400">Anyone in your org can access this brand</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {local.orgWide && (
                <PermissionSelect
                  value={local.orgWidePermission}
                  onChange={v => setLocal(s => ({ ...s, orgWidePermission: v }))}
                />
              )}
              <button
                onClick={() => setLocal(s => ({ ...s, orgWide: !s.orgWide }))}
                className="relative rounded-full transition-colors shrink-0"
                style={{ width: 40, height: 22, background: local.orgWide ? 'var(--snp-indigo-600)' : 'var(--snp-navy-200)' }}
              >
                <span
                  className="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform"
                  style={{ transform: local.orgWide ? 'translateX(18px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-snp-navy-150" />
            <span className="text-[11px] text-snp-navy-400 whitespace-nowrap">or share with specific accounts</span>
            <div className="flex-1 h-px bg-snp-navy-150" />
          </div>

          {/* Account combobox */}
          <div className="relative" ref={comboRef}>
            <div
              className={`flex items-center gap-2 w-full h-10 pl-3 pr-3 border rounded-[10px] bg-white cursor-text transition-colors ${dropdownOpen ? 'border-snp-indigo-600' : 'border-snp-navy-200'}`}
              onClick={() => setDropdownOpen(true)}
            >
              <Search className="w-4 h-4 text-snp-navy-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder={local.accounts.length > 0 ? `${local.accounts.length} account${local.accounts.length !== 1 ? 's' : ''} selected` : 'Add accounts…'}
                className="flex-1 bg-transparent text-[13px] text-snp-navy-950 placeholder:text-snp-navy-400 focus:outline-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <ChevronDown className={`w-4 h-4 text-snp-navy-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {dropdownOpen && (
              <div className="absolute bottom-full mb-1.5 left-0 right-0 bg-white border border-snp-navy-200 rounded-[12px] shadow-[0px_-8px_24px_0px_rgba(1,39,84,0.12)] z-20 py-1.5 overflow-y-auto" style={{ maxHeight: 220 }}>
                {filteredAccounts.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-snp-navy-400">No accounts found</p>
                ) : filteredAccounts.map(acct => {
                  const isSelected = local.accounts.some(e => e.email === acct.email);
                  return (
                    <button
                      key={acct.email}
                      onClick={e => { e.stopPropagation(); toggleAccount(acct); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-snp-navy-50 transition-colors text-left ${isSelected ? 'bg-snp-indigo-50' : ''}`}
                    >
                      <AccountAvatar name={acct.name} />
                      <p className="flex-1 text-[13px] font-medium text-snp-navy-950">{acct.name}</p>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'border-snp-navy-300'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account list */}
          {local.accounts.length > 0 && (
            <div className="flex flex-col divide-y divide-snp-navy-100">
              {local.accounts.map(entry => (
                <div key={entry.email} className="flex items-center gap-3 py-3">
                  <AccountAvatar name={entry.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-snp-navy-950 truncate">{entry.name}</p>
                    <p className="text-[11px] text-snp-navy-400 truncate">{entry.email}</p>
                  </div>
                  <PermissionSelect value={entry.permission} onChange={v => setPermission(entry.email, v)} />
                  <button onClick={() => removeAccount(entry.email)} className="w-6 h-6 flex items-center justify-center text-snp-navy-300 hover:text-snp-navy-600 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-5 border-t border-snp-navy-100 shrink-0">
          {hasAnyAccess ? (
            <button
              onClick={() => setLocal({ orgWide: false, orgWidePermission: 'view', accounts: [] })}
              className="text-[13px] text-snp-navy-400 hover:text-red-500 transition-colors"
            >
              Remove all access
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-[10px] border border-snp-navy-200 text-[13px] font-medium text-snp-navy-700 hover:bg-snp-navy-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onChange(local); onClose(); }}
              className="h-9 px-5 rounded-[10px] bg-snp-indigo-600 text-[13px] font-semibold text-white hover:bg-snp-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared UI atoms ───────────────────────────────────────────────────────────

function FilterSection({ title, expanded, onToggle, children }: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-snp-navy-100 pb-2">
      <button
        className="flex items-center justify-between w-full py-2 text-[10px] font-bold text-snp-navy-950 uppercase tracking-widest"
        onClick={onToggle}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
        {expanded ? <ChevronUp className="w-4 h-4 text-snp-navy-500" /> : <ChevronDown className="w-4 h-4 text-snp-navy-500" />}
      </button>
      {expanded && children}
    </div>
  );
}

function CheckboxRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <label
      className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors rounded-lg ${checked ? 'bg-snp-indigo-50' : 'hover:bg-snp-navy-50'}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        onClick={onToggle}
        className={`w-5 h-5 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-snp-indigo-600 border-snp-indigo-600' : 'bg-white border-snp-navy-300'}`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-[13px] font-medium transition-colors ${checked ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`} onClick={onToggle}>
        {label}
      </span>
    </label>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({
  localItems,
  selectedBrands, toggleBrand,
  search, setSearch,
  selectedBudgetIdx, setSelectedBudgetIdx,
  selectedCountryIdx, setSelectedCountryIdx,
}: {
  localItems: DesignedItem[];
  selectedBrands: Set<string>; toggleBrand: (b: string) => void;
  search: string; setSearch: (v: string) => void;
  selectedBudgetIdx: number; setSelectedBudgetIdx: (v: number) => void;
  selectedCountryIdx: number; setSelectedCountryIdx: (v: number) => void;
}) {
  const [brandExpanded, setBrandExpanded] = useState(true);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    localItems.forEach(item => {
      const p = PRODUCTS.find(pr => pr.id === item.productId);
      if (p) brands.add(p.brand);
    });
    return [...brands].sort();
  }, [localItems]);

  const country = COUNTRIES[selectedCountryIdx];
  return (
    <div>
      {/* Search */}
      <div className="pb-2 border-b border-snp-navy-100 mb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full pl-8 pr-7 h-8 border border-snp-navy-200 rounded-[8px] text-[13px] text-snp-navy-700 placeholder:text-snp-navy-400 focus:outline-none focus:border-snp-indigo-600 transition-colors bg-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-snp-navy-500 hover:text-snp-navy-700">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="border-b border-snp-navy-100 pb-3">
        <p className="py-2 text-[10px] font-bold text-snp-navy-950 uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Budget</p>
        <div className="relative">
          <select
            value={selectedBudgetIdx}
            onChange={e => setSelectedBudgetIdx(Number(e.target.value))}
            className="w-full h-9 pl-3 pr-8 rounded-[8px] border border-snp-navy-200 bg-white text-[13px] font-medium text-snp-navy-700 focus:outline-none focus:border-snp-indigo-600 appearance-none cursor-pointer transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {BUDGET_OPTIONS.map((opt, i) => (
              <option key={opt.label} value={i}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-500 pointer-events-none" />
        </div>
      </div>

      {/* Country */}
      <div className="border-b border-snp-navy-100 pb-2">
        <p className="py-2 text-[10px] font-bold text-snp-navy-950 uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>Country</p>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm leading-none pointer-events-none">{country.flag}</span>
          <select
            value={selectedCountryIdx}
            onChange={e => setSelectedCountryIdx(Number(e.target.value))}
            className="w-full pl-8 pr-7 h-8 border border-snp-navy-200 rounded-[8px] text-[13px] text-snp-navy-700 focus:outline-none focus:border-snp-indigo-600 transition-colors bg-white appearance-none cursor-pointer"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {COUNTRIES.map((c, i) => (
              <option key={c.code} value={i}>{c.flag} {c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-500 pointer-events-none" />
        </div>
      </div>

      {/* Brand filter */}
      {availableBrands.length > 0 && (
        <FilterSection title="Brand" expanded={brandExpanded} onToggle={() => setBrandExpanded(v => !v)}>
          <div className="flex flex-col">
            {(availableBrands.length > 0 ? availableBrands : FEATURED_BRANDS).map(brand => (
              <CheckboxRow
                key={brand}
                checked={selectedBrands.has(brand)}
                onToggle={() => toggleBrand(brand)}
                label={brand}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

// ── Designed Item Card ─────────────────────────────────────────────────────────

function DesignedItemCard({
  item, design, isSelected, onToggleSelect, inBulkMode, isLowQuality, onDelete,
}: {
  item: DesignedItem; design?: Design; isSelected: boolean;
  onToggleSelect: () => void; inBulkMode: boolean; isLowQuality?: boolean;
  onDelete?: () => void;
}) {
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === item.productId);
  if (!product) return null;
  const chip = PRINT_STYLE_CHIPS[item.printTechnique];

  return (
    <div className="flex flex-col gap-3 pb-4 cursor-pointer group" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Image area */}
      <div
        className={`relative rounded-[16px] overflow-hidden h-[260px] flex items-center justify-center transition-all ${
          isSelected ? 'ring-2 ring-snp-indigo-600 ring-offset-2' : ''
        }`}
        style={{ backgroundColor: `${item.colorHex}14` }}
      >
        {product.image.startsWith('/') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
        ) : (
          <span className="text-[100px] select-none">{product.image}</span>
        )}

        {/* Low quality overlay */}
        {isLowQuality && (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center" style={{ background: 'rgba(154,52,18,0.18)' }}>
            <div className="bg-white/85 backdrop-blur-[2px] rounded-[10px] px-3 py-2 flex flex-col items-center gap-1 shadow-sm border border-orange-200/60 mx-4">
              <span className="text-[11px] font-bold text-[#c2410c] uppercase tracking-wide leading-none">⚠ Low resolution</span>
              <span className="text-[9px] text-[#9a3412] font-medium">Not recommended</span>
            </div>
          </div>
        )}

        {/* Logo + detail badge bottom center */}
        {design && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-snp-navy-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <img src={design.logoUrl ?? ''} alt="" className="w-3.5 h-3.5 object-contain rounded-sm shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.colorHex }} />
            <span className="text-[9px] text-snp-navy-500">{item.colorName}</span>
            <span className="text-[9px] text-[#c0cdd9]">·</span>
            <span className="text-[9px] text-snp-navy-500">{formatPlacement(item.placement)}</span>
          </div>
        )}

        {/* Delete button — top-left, visible on hover */}
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-white/90 border border-[#c5d5e8] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300 hover:text-red-500 text-snp-navy-400 transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        {/* Checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSelect(); }}
          className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-snp-indigo-600 border-snp-indigo-600'
              : `bg-white/90 border-[#c5d5e8] ${inBulkMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-bold text-snp-indigo-600 uppercase tracking-widest leading-none">{product.brand}</p>
          <p className="text-[13px] font-bold text-snp-navy-950 shrink-0">${product.price.toFixed(2)}</p>
        </div>
        <p className="text-[14px] font-bold text-snp-navy-950 leading-snug truncate">{product.name}</p>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          {chip && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: chip.bg, color: chip.text }}>
              {chip.label}
            </span>
          )}
          {item.hasPersonalization && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>Personalized</span>
          )}
          {item.hasGraphic && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fffbeb', color: 'var(--snp-amber-600)' }}>Graphic</span>
          )}
        </div>

        {/* Action tray */}
        <div className="flex flex-col gap-1.5 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          <div className="flex gap-1.5">
            <div className="flex-1">
              <AddToCollectionMenu
                productId={item.productId}
                trigger={
                  <button className="w-full h-8 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[12px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Add to collection
                  </button>
                }
              />
            </div>
            <button
              className="flex-1 h-8 rounded-[10px] border border-snp-navy-200 text-snp-navy-600 text-[12px] font-medium hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-colors flex items-center justify-center gap-1"
              onClick={e => { e.stopPropagation(); navigate(`/design/${item.productId}`, { state: { from: '/designs', drillDesignId: item.designId } }); }}
            >
              <Pencil className="w-3 h-3" /> Edit design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Design Thumbnail Card ─────────────────────────────────────────────────────

const DUPE_STEPS = [
  'Duplicating products',
  'Applying logo to items',
  'Creating brand',
];

function DesignCard({
  design, items, onDrill, onAddProducts, onRename, onDuplicate, onUpdateLogo, onDelete, onShare,
  isLoading = false, loadingStep = 0, sharedWith,
}: {
  design: Design;
  items: DesignedItem[];
  onDrill: () => void;
  onAddProducts: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onUpdateLogo: () => void;
  onDelete: () => void;
  onShare: () => void;
  isLoading?: boolean;
  loadingStep?: number;
  sharedWith?: ShareSettings;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const isEmpty = items.length === 0;
  const count   = items.length;
  const prods   = items.slice(0, 4).map(i => PRODUCTS.find(p => p.id === i.productId));

  function ProductCell({ product, className = '' }: { product: typeof prods[0]; className?: string }) {
    return (
      <div className={`bg-snp-navy-50 flex items-center justify-center overflow-hidden ${className}`}>
        {product ? (
          product.image.startsWith('/') ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" style={{ mixBlendMode: 'multiply' }} />
          ) : (
            <span className="text-[36px] select-none">{product.image}</span>
          )
        ) : (
          <ImageIcon className="w-6 h-6 text-snp-navy-200" />
        )}
      </div>
    );
  }

  return (
    <div className={`group ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}`} onClick={isLoading ? undefined : (isEmpty ? onAddProducts : onDrill)} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="bg-white rounded-[20px] border border-snp-navy-200 overflow-hidden hover:shadow-[0px_8px_32px_rgba(1,39,84,0.10)] hover:border-snp-navy-300 transition-all flex flex-col">

        {/* ── Cover area (square mosaic) ── */}
        <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>

          {/* Loading overlay — sits on top of whatever mosaic state exists */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6"
              style={{ background: 'linear-gradient(160deg, #eef4ff 0%, #f5f0ff 100%)' }}>
              {/* Animated logo */}
              <div className="relative">
                <div className="w-14 h-14 rounded-[14px] border-2 border-snp-indigo-200 bg-white flex items-center justify-center p-2 shadow-sm"
                  style={{ animation: 'dupe-pulse 1.4s ease-in-out infinite' }}>
                  <img src={design.logoUrl ?? ''} alt="" className="w-full h-full object-contain"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                </div>
                {/* Spinning ring */}
                <svg className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--snp-indigo-100)" strokeWidth="3" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--snp-indigo-600)" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - (loadingStep + 1) / DUPE_STEPS.length)}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
              </div>
              {/* Steps */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                {DUPE_STEPS.map((label, i) => {
                  const done    = i < loadingStep;
                  const active  = i === loadingStep;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        done   ? 'bg-[#22c55e]' :
                        active ? 'bg-snp-indigo-600' :
                                 'bg-snp-navy-200'
                      }`}>
                        {done
                          ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          : active
                            ? <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            : null}
                      </div>
                      <span className={`text-[11px] font-medium transition-colors duration-300 ${
                        done ? 'text-[#22c55e]' : active ? 'text-snp-navy-950' : 'text-snp-navy-300'
                      }`}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <style>{`@keyframes dupe-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(48,119,201,0.18)} 50%{box-shadow:0 0 0 7px rgba(48,119,201,0)} }`}</style>
            </div>
          )}

          {isEmpty ? (
            <div className="absolute inset-0 bg-snp-navy-50 flex flex-col items-center justify-center gap-3 px-6">
              <div className="w-14 h-14 rounded-[14px] border border-snp-navy-200 bg-white flex items-center justify-center p-2 shadow-sm">
                <img src={design.logoUrl ?? ''} alt="" className="w-full h-full object-contain"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-semibold text-snp-navy-600">No products yet</p>
                <p className="text-[11px] text-snp-navy-400 mt-0.5">Click to add products</p>
              </div>
            </div>
          ) : count === 1 ? (
            <ProductCell product={prods[0]} className="absolute inset-0" />
          ) : count === 2 ? (
            <div className="absolute inset-0 grid grid-cols-2 gap-px bg-snp-navy-100">
              <ProductCell product={prods[0]} />
              <ProductCell product={prods[1]} />
            </div>
          ) : count === 3 ? (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-snp-navy-100">
              <ProductCell product={prods[0]} />
              <ProductCell product={prods[1]} />
              <ProductCell product={prods[2]} className="col-span-2" />
            </div>
          ) : (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-snp-navy-100">
              <ProductCell product={prods[0]} />
              <ProductCell product={prods[1]} />
              <ProductCell product={prods[2]} />
              <ProductCell product={prods[3]} />
            </div>
          )}
        </div>

        {/* ── Content panel ── */}
        <div className="p-4 flex flex-col gap-3 border-t border-snp-navy-100">

          {/* Name row */}
          <div className="flex items-center gap-2.5">
            <img
              src={design.logoUrl ?? ''}
              alt=""
              className="w-12 h-12 rounded-[10px] border border-snp-navy-200 bg-white object-contain p-1.5 shrink-0"
              onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-snp-navy-950 truncate leading-tight">{design.name || 'Untitled'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-snp-navy-400 leading-tight">{items.length} product{items.length !== 1 ? 's' : ''}</p>
                {isSharedSettings(sharedWith) && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-snp-indigo-50 border border-snp-indigo-200">
                    <Share2 className="w-2.5 h-2.5 text-snp-indigo-500" />
                    <span className="text-[9px] font-bold text-snp-indigo-500 uppercase tracking-wide">
                      {sharedWith?.orgWide ? 'Org' : `${sharedWith!.accounts.length}`}
                    </span>
                  </span>
                )}
              </div>
            </div>
            {/* Ellipsis menu */}
            <div ref={menuRef} className="relative shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center text-snp-navy-400 hover:text-snp-indigo-600 hover:bg-snp-navy-50 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-snp-navy-200 rounded-xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-30 min-w-[170px] py-1.5">
                  <button onClick={() => { onRename(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-snp-navy-700 hover:bg-snp-navy-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-snp-navy-500" /> Rename
                  </button>
                  <button onClick={() => { onDuplicate(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-snp-navy-700 hover:bg-snp-navy-50 transition-colors">
                    <Copy className="w-3.5 h-3.5 text-snp-navy-500" /> Duplicate
                  </button>
                  <button onClick={() => { onUpdateLogo(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-snp-navy-700 hover:bg-snp-navy-50 transition-colors">
                    <ImageIcon className="w-3.5 h-3.5 text-snp-navy-500" /> Update logo
                  </button>
                  <button onClick={() => { onShare(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-snp-navy-700 hover:bg-snp-navy-50 transition-colors">
                    <Share2 className="w-3.5 h-3.5 text-snp-navy-500" /> Share Design
                  </button>
                  <div className="mx-3 my-1 border-t border-[#f0f4f8]" />
                  <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-snp-red-500 hover:bg-[#fff5f5] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Upload Brand Modal ─────────────────────────────────────────────────────────

function UploadBrandModal({ onClose, onLogoSaved }: { onClose: () => void; onLogoSaved?: (brandSetId: string) => void }) {
  const { saveLogo } = useCompanyLogo();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] w-full max-w-[440px] overflow-hidden shadow-[0px_32px_80px_rgba(1,39,84,0.28)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-snp-navy-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              New Brand
            </h2>
            <p className="text-[13px] text-snp-navy-500 mt-0.5">Upload your logo to brand products</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500 hover:text-snp-navy-700 shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <LogoInput
            onImmediateSubmit={(url) => { const id = saveLogo(url); onLogoSaved ? onLogoSaved(id) : onClose(); }}
            renderIdle={({ triggerFileInput }) => (
              <button
                onClick={triggerFileInput}
                className="w-full h-12 rounded-[14px] border-2 border-dashed border-snp-navy-200 flex items-center justify-center gap-2.5 text-[13px] font-semibold text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600 hover:bg-snp-indigo-50 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload logo (PNG, SVG)
              </button>
            )}
            renderReady={() => null}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function BrandSet() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { drillDesignId?: string } | null;
  const { allBrandSets, deleteBrandSet, addProductsToBrandSet, renameBrandSet, activateBrandSet } = useCompanyLogo();

  const [localDesigns, setLocalDesigns] = useState<Design[]>(() =>
    allBrandSets.length > 0
      ? allBrandSets.map(bs => ({ id: bs.id, name: bs.companyName || 'My Brand', logoUrl: bs.logoUrl, productIds: [], createdAt: bs.createdAt, updatedAt: bs.createdAt }))
      : [...DESIGNS]
  );
  const [localItems, setLocalItems] = useState<DesignedItem[]>([...MY_DESIGNED_ITEMS]);

  useEffect(() => {
    if (allBrandSets.length > 0) {
      setLocalDesigns(allBrandSets.map(bs => ({ id: bs.id, name: bs.companyName || 'My Brand', logoUrl: bs.logoUrl, productIds: [], createdAt: bs.createdAt, updatedAt: bs.createdAt })));
    }
  }, [allBrandSets]);

  // Filters
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedBudgetIdx, setSelectedBudgetIdx]   = useState(0);
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);
  const [search, setSearch] = useState('');

  // Bulk select
  const [selectedIds, setSelectedIds]             = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Product picker drawer
  const [showPicker, setShowPicker]         = useState(false);
  const [pickerDesignId, setPickerDesignId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch]     = useState('');
  const [pickerCategory, setPickerCategory] = useState<ProductCategory | 'All'>('All');
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());

  // Upload brand modal
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Design management modals
  const [loadingDesignIds, setLoadingDesignIds]         = useState<Map<string, number>>(new Map()); // id → step index
  const [deleteDesignId, setDeleteDesignId]             = useState<string | null>(null);
  const [duplicateDesignId, setDuplicateDesignId]       = useState<string | null>(null);
  const [updateLogoDesignId, setUpdateLogoDesignId]     = useState<string | null>(null);
  const [pendingLogoUrl, setPendingLogoUrl]             = useState<string | null>(null);
  const [pendingLogoQuality, setPendingLogoQuality]     = useState<{ isLowQuality: boolean; width: number; height: number } | null>(null);
  const [lowQualityDesignIds, setLowQualityDesignIds]   = useState<Set<string>>(new Set());
  const updateLogoFileRef = useRef<HTMLInputElement>(null);

  // Drill-in + rename + share
  const [drillDesignId, setDrillDesignId]   = useState<string | null>(locationState?.drillDesignId ?? null);
  const [renameDesignId, setRenameDesignId] = useState<string | null>(null);
  const [renameValue, setRenameValue]       = useState('');
  const [shareDesignId, setShareDesignId]   = useState<string | null>(null);
  const [shareSettings, setShareSettings]   = useState<Record<string, ShareSettings>>({});

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleBrand(brand: string) {
    setSelectedBrands(prev => { const next = new Set(prev); next.has(brand) ? next.delete(brand) : next.add(brand); return next; });
  }

  function confirmDeleteDesign(designId: string) {
    setLocalDesigns(prev => prev.filter(d => d.id !== designId));
    setLocalItems(prev => prev.filter(i => i.designId !== designId));
    if (activeDesignId === designId) setActiveDesignId(null);
    if (drillDesignId === designId) setDrillDesignId(null);
    setDeleteDesignId(null);
    deleteBrandSet(designId);
  }

  function handleUpdateLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isSvg = file.type === 'image/svg+xml';
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setPendingLogoUrl(dataUrl);
      setPendingLogoQuality(null);
      if (isSvg) {
        setPendingLogoQuality({ isLowQuality: false, width: 0, height: 0 });
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setPendingLogoQuality({ isLowQuality: w < 200 || h < 200, width: w, height: h });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function confirmUpdateLogo() {
    if (!updateLogoDesignId || !pendingLogoUrl) return;
    setLocalDesigns(prev => prev.map(d => d.id === updateLogoDesignId ? { ...d, logoUrl: pendingLogoUrl } : d));
    setLowQualityDesignIds(prev => {
      const next = new Set(prev);
      if (pendingLogoQuality?.isLowQuality) next.add(updateLogoDesignId);
      else next.delete(updateLogoDesignId);
      return next;
    });
    setUpdateLogoDesignId(null);
    setPendingLogoUrl(null);
    setPendingLogoQuality(null);
  }

  function confirmDuplicateDesign(designId: string) {
    const src = localDesigns.find(d => d.id === designId);
    if (!src) return;
    const newId = `${designId}-copy-${Date.now()}`;

    // Add real data immediately (hidden behind the loader)
    setLocalDesigns(prev => [...prev, { ...src, id: newId, name: `${src.name} (copy)` }]);
    setLocalItems(prev => [
      ...prev,
      ...prev.filter(i => i.designId === designId).map(i => ({ ...i, id: `${i.id}-copy`, designId: newId })),
    ]);
    setDuplicateDesignId(null);

    // Animate through steps, then reveal the card
    const STEP_MS = 1600;
    const set = (step: number) =>
      setLoadingDesignIds(prev => new Map(prev).set(newId, step));
    set(0);
    setTimeout(() => set(1), STEP_MS);
    setTimeout(() => set(2), STEP_MS * 2);
    setTimeout(() =>
      setLoadingDesignIds(prev => { const m = new Map(prev); m.delete(newId); return m; }),
      STEP_MS * 3,
    );
  }

  function confirmRename() {
    if (!renameDesignId || !renameValue.trim()) return;
    const trimmed = renameValue.trim();
    setLocalDesigns(prev => prev.map(d => d.id === renameDesignId ? { ...d, name: trimmed } : d));
    if (allBrandSets.find(bs => bs.id === renameDesignId)) {
      renameBrandSet(renameDesignId, trimmed);
    }
    setRenameDesignId(null);
  }

  function shareDesign(designId: string) {
    setShareDesignId(designId);
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const budget = BUDGET_OPTIONS[selectedBudgetIdx];
  const searchLower = search.trim().toLowerCase();

  const brandSetItems = useMemo<DesignedItem[]>(() => {
    if (allBrandSets.length === 0) return [];
    return allBrandSets.flatMap(bs =>
      bs.savedProductIds.map(pid => {
        const product = PRODUCTS.find(p => p.id === pid);
        return {
          id: `${bs.id}_${pid}`,
          productId: pid,
          designId: bs.id,
          colorHex: '#f5f8fc',
          colorName: '',
          placement: 'center' as const,
          printTechnique: (product?.printTechnique ?? 'dtg') as DesignedItem['printTechnique'],
          createdAt: bs.createdAt,
          sendCount: 0,
        };
      })
    );
  }, [allBrandSets]);

  const itemSource = brandSetItems.length > 0 ? brandSetItems : localItems;

  const visibleDesignedItems = useMemo(() => {
    let list = [...itemSource];
    if (drillDesignId) {
      list = list.filter(i => i.designId === drillDesignId);
    } else if (activeDesignId) {
      list = list.filter(i => i.designId === activeDesignId);
    }
    if (selectedBrands.size > 0) list = list.filter(i => {
      const p = PRODUCTS.find(pr => pr.id === i.productId);
      return p && selectedBrands.has(p.brand);
    });
    if (budget.max < Infinity) list = list.filter(i => {
      const p = PRODUCTS.find(pr => pr.id === i.productId);
      return p && p.price >= budget.min && p.price < budget.max;
    });
    if (searchLower) list = list.filter(i => {
      const p = PRODUCTS.find(pr => pr.id === i.productId);
      return p && (p.name.toLowerCase().includes(searchLower) || p.brand.toLowerCase().includes(searchLower));
    });
    return list;
  }, [itemSource, drillDesignId, activeDesignId, selectedBrands, budget, searchLower]);

  const deleteDesign       = deleteDesignId    ? localDesigns.find(d => d.id === deleteDesignId)    : null;
  const duplicateDesign    = duplicateDesignId ? localDesigns.find(d => d.id === duplicateDesignId) : null;
  const renameDesign       = renameDesignId    ? localDesigns.find(d => d.id === renameDesignId)    : null;
  const drilledDesign      = drillDesignId     ? localDesigns.find(d => d.id === drillDesignId)     : null;
  const deleteItemCount    = deleteDesignId ? itemSource.filter(i => i.designId === deleteDesignId).length : 0;
  const deleteProductIds   = deleteDesignId ? new Set(itemSource.filter(i => i.designId === deleteDesignId).map(i => i.productId)) : new Set<string>();
  const deleteCollectionCount = deleteDesignId ? MY_COLLECTIONS.filter(c => c.productIds.some(pid => deleteProductIds.has(pid))).length : 0;
  const duplicateItemCount = duplicateDesignId ? itemSource.filter(i => i.designId === duplicateDesignId).length : 0;

  const sidebarProps = {
    localItems: itemSource,
    selectedBrands, toggleBrand,
    search, setSearch,
    selectedBudgetIdx, setSelectedBudgetIdx,
    selectedCountryIdx, setSelectedCountryIdx,
  };

  const totalResults = visibleDesignedItems.length;

  const pickerProducts = useMemo(() => {
    let list = PRODUCTS;
    if (pickerCategory !== 'All') list = list.filter(p => p.category === pickerCategory);
    const q = pickerSearch.trim().toLowerCase();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    return list;
  }, [pickerCategory, pickerSearch]);

  const sidebarEl = <SidebarContent {...sidebarProps} />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="your-swag" />

      {drillDesignId === null ? (

        /* ── Design thumbnail grid ─────────────────────────────────────────── */
        <div className="max-w-[1400px] mx-auto pt-7 px-4 md:pl-[80px] md:pr-[40px] pb-24">
          <div className="flex gap-8">
            <YourSwagSidebar active="my-designs" />
            <div className="flex-1">
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-[22px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>My Designs</h2>
                <p className="text-[13px] text-snp-navy-400 mt-0.5">All your designed items, grouped by brand logo</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[10px] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
                style={{ background: '#3077c9' }}
              >
                <Plus className="w-3.5 h-3.5" />
                New Brand
              </button>
            </div>

          {localDesigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4">🎨</span>
              <h3 className="text-[16px] font-semibold text-snp-navy-700 mb-2">No designs yet</h3>
              <p className="text-[14px] text-snp-navy-500 mb-5">Design a product from the catalog to get started</p>
              <button
                className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: '#3077c9' }}
                onClick={() => navigate('/catalog')}
              >
                Browse catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {localDesigns.map(design => (
                <DesignCard
                  key={design.id}
                  design={design}
                  items={itemSource.filter(i => i.designId === design.id)}
                  onDrill={() => setDrillDesignId(design.id)}
                  onAddProducts={() => { setPickerDesignId(design.id); setShowPicker(true); }}
                  onRename={() => { setRenameDesignId(design.id); setRenameValue(design.name); }}
                  onDuplicate={() => setDuplicateDesignId(design.id)}
                  isLoading={loadingDesignIds.has(design.id)}
                  loadingStep={loadingDesignIds.get(design.id) ?? 0}
                  onUpdateLogo={() => setUpdateLogoDesignId(design.id)}
                  onDelete={() => setDeleteDesignId(design.id)}
                  onShare={() => shareDesign(design.id)}
                  sharedWith={shareSettings[design.id]}
                />
              ))}
            </div>
          )}
            </div>{/* flex-1 */}
          </div>{/* flex gap-8 */}
        </div>

      ) : (

        /* ── Drilled-in product view ────────────────────────────────────────── */
        <div className="max-w-[1400px] mx-auto">
          <div className="flex">

            {/* Desktop left sidebar */}
            <aside className="hidden md:block w-[272px] shrink-0 border-r border-snp-navy-200 pt-4 pl-[72px] pr-4 pb-8">
              {sidebarEl}
            </aside>

            {/* Mobile filter sheet trigger */}
            <div className="flex md:hidden px-4 pt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 bg-white border border-snp-navy-200 rounded-full px-4 py-2.5 text-[14px] font-medium text-snp-navy-950 hover:bg-snp-navy-50 transition-colors shadow-[0px_4px_8px_0px_rgba(1,39,84,0.06)]">
                    <SlidersHorizontal className="w-4 h-4 text-snp-navy-500" />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white">
                  <SheetHeader><SheetTitle className="text-[16px] font-semibold text-snp-navy-700">Filters</SheetTitle></SheetHeader>
                  <div className="mt-4 overflow-y-auto h-full pb-8">{sidebarEl}</div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Main content */}
            <div className="flex-1 pt-5 px-4 md:pr-[40px] md:pl-8 pb-36">

              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 mb-5">
                <button
                  onClick={() => { setDrillDesignId(null); setSelectedIds(new Set()); setSearch(''); setSelectedBrands(new Set()); }}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  My Designs
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-snp-navy-300" />
                <span className="text-[13px] font-semibold text-snp-navy-950 truncate max-w-[200px]">
                  {drilledDesign?.name || 'Design'}
                </span>
              </div>

              {/* Count + actions row */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-[12px] text-snp-navy-400 font-medium">
                  {totalResults} {totalResults === 1 ? 'item' : 'items'}
                  {COUNTRIES[selectedCountryIdx].code !== 'US' && <span className="ml-1">· {COUNTRIES[selectedCountryIdx].flag} {COUNTRIES[selectedCountryIdx].name}</span>}
                </p>
              </div>

              {/* ── Designed items ── */}
              {visibleDesignedItems.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    {visibleDesignedItems.map(item => {
                      const design = localDesigns.find(d => d.id === item.designId);
                      return (
                        <DesignedItemCard
                          key={item.id}
                          item={item}
                          design={design}
                          isSelected={selectedIds.has(item.id)}
                          onToggleSelect={() => toggleSelect(item.id)}
                          inBulkMode={selectedIds.size > 0}
                          isLowQuality={lowQualityDesignIds.has(item.designId)}
                          onDelete={drillDesignId ? () => setLocalItems(prev => prev.filter(i => i.id !== item.id)) : undefined}

                        />
                      );
                    })}
                    {/* Ghost card */}
                    <div
                      onClick={() => { if (drillDesignId) activateBrandSet(drillDesignId); navigate('/catalog'); }}
                      className="border-2 border-dashed border-snp-navy-300 rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-snp-navy-50 hover:border-snp-indigo-600 transition-all p-8 min-h-[280px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-snp-navy-100 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-snp-indigo-600" />
                      </div>
                      <p className="text-[13px] font-semibold text-snp-navy-500 text-center">Add More Products</p>
                      <p className="text-[11px] text-snp-navy-400 text-center">Browse the catalog and design products</p>
                    </div>
                  </div>
                </>
              )}

              {/* Empty state */}
              {totalResults === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="text-6xl mb-4">🎨</span>
                  <h3 className="text-[16px] font-semibold text-snp-navy-700 mb-2">
                    {search ? 'No results found' : 'Nothing here yet'}
                  </h3>
                  <p className="text-[14px] text-snp-navy-500 mb-5">
                    {search ? 'Try a different search or clear filters' : 'Browse the catalog to design your first product'}
                  </p>
                  {!search && (
                    <button
                      className="h-11 px-6 rounded-[14px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                      style={{ background: '#3077c9' }}
                      onClick={() => { if (drillDesignId) activateBrandSet(drillDesignId); navigate('/catalog'); }}
                    >
                      Browse Catalog
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Delete Design modal ─────────────────────────────────────────────────── */}
      {deleteDesignId && deleteDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDeleteDesignId(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-[420px] p-7 shadow-[0px_32px_80px_rgba(1,39,84,0.28)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 bg-[#fef2f2] rounded-[12px] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-snp-red-500" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Remove "{deleteDesign.name}"?
                </h2>
                <p className="text-[13px] text-snp-navy-500 mt-1">
                  This will permanently remove the design and its <strong>{deleteItemCount}</strong> designed item{deleteItemCount !== 1 ? 's' : ''}.
                </p>
                {deleteCollectionCount > 0 && (
                  <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-[10px] bg-amber-50 border border-amber-200">
                    <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
                    <p className="text-[12px] text-amber-700">
                      This design is included in <strong>{deleteCollectionCount}</strong> collection{deleteCollectionCount !== 1 ? 's' : ''}. Its products will be removed from {deleteCollectionCount !== 1 ? 'those collections' : 'that collection'} as well.
                    </p>
                  </div>
                )}
              </div>
              <button onClick={() => setDeleteDesignId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0 ml-auto">
                <X className="w-4 h-4 text-snp-navy-500" />
              </button>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteDesignId(null)} className="flex-1 h-11 rounded-[12px] border border-snp-navy-200 text-snp-navy-600 text-[14px] font-semibold hover:bg-snp-navy-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteDesign(deleteDesign.id)}
                className="flex-1 h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #f87171 0%, var(--snp-red-500) 100%)' }}
              >
                Remove + {deleteItemCount} item{deleteItemCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Update Logo modal ───────────────────────────────────────────────────── */}
      {(() => {
        const design = updateLogoDesignId ? localDesigns.find(d => d.id === updateLogoDesignId) : null;
        const itemCount = updateLogoDesignId ? localItems.filter(i => i.designId === updateLogoDesignId).length : 0;
        if (!design) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => { setUpdateLogoDesignId(null); setPendingLogoUrl(null); }}>
            <div className="bg-white rounded-[24px] w-full max-w-[440px] shadow-[0px_32px_80px_rgba(1,39,84,0.28)] overflow-hidden"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between px-7 pt-7 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-snp-navy-50 border border-snp-navy-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={design.logoUrl ?? ''} alt="" className="w-8 h-8 object-contain" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Update logo</h2>
                    <p className="text-[12px] text-snp-navy-500">{design.name}</p>
                  </div>
                </div>
                <button onClick={() => { setUpdateLogoDesignId(null); setPendingLogoUrl(null); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-snp-navy-50 transition-colors">
                  <X className="w-4 h-4 text-snp-navy-500" />
                </button>
              </div>

              <div className="mx-7 mb-5 rounded-[12px] bg-[#fffbeb] border border-[#fde68a] px-4 py-3 flex items-start gap-2.5">
                <span className="text-base leading-none mt-0.5">⚠️</span>
                <p className="text-[13px] text-[#92400e] leading-relaxed">
                  The new logo will be applied to all{' '}
                  <strong>{itemCount} designed item{itemCount !== 1 ? 's' : ''}</strong> in this design, replacing the current one.
                </p>
              </div>

              <div className="px-7 mb-6">
                <input ref={updateLogoFileRef} type="file" accept="image/*" className="hidden" onChange={handleUpdateLogoFile} />
                {pendingLogoUrl ? (
                  <div className={`relative border-2 rounded-[16px] p-5 flex flex-col items-center gap-3 transition-colors ${pendingLogoQuality?.isLowQuality ? 'border-snp-amber-500 bg-[#fffbeb]' : 'border-snp-indigo-600 bg-snp-indigo-50'}`}>
                    <img src={pendingLogoUrl} alt="New logo" className="w-20 h-20 object-contain rounded-[10px] bg-white border border-snp-navy-200 p-2" />
                    {pendingLogoQuality?.isLowQuality && (
                      <div className="w-full bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] px-3.5 py-2.5 flex items-start gap-2">
                        <span className="text-base leading-none mt-0.5 shrink-0">⚠️</span>
                        <div>
                          <p className="text-[12px] font-bold text-[#c2410c] mb-0.5">Low resolution logo</p>
                          <p className="text-[11px] text-[#9a3412] leading-relaxed">
                            This image is only{' '}
                            <strong>{pendingLogoQuality.width}×{pendingLogoQuality.height}px</strong>
                            {' '}— it may appear blurry when printed on products.
                            SVG or PNG at 400px+ gives the best results.
                          </p>
                        </div>
                      </div>
                    )}
                    {pendingLogoQuality && !pendingLogoQuality.isLowQuality && (
                      <p className="text-[12px] font-semibold text-snp-indigo-600">Logo looks good ✓</p>
                    )}
                    <button
                      onClick={() => { setPendingLogoUrl(null); setPendingLogoQuality(null); updateLogoFileRef.current?.click(); }}
                      className="text-[11px] font-medium text-snp-navy-500 hover:text-snp-indigo-600 transition-colors underline"
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => updateLogoFileRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#c8dff5] rounded-[16px] p-6 flex flex-col items-center gap-2.5 hover:border-snp-indigo-600 hover:bg-snp-navy-50 transition-all group"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#eef5ff] group-hover:bg-snp-indigo-100 flex items-center justify-center transition-colors">
                      <Upload className="w-5 h-5 text-snp-indigo-600" />
                    </div>
                    <p className="text-[14px] font-semibold text-snp-indigo-600">Upload new logo</p>
                    <p className="text-[11px] text-snp-navy-400">PNG or SVG · transparent background recommended</p>
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 px-7 pb-7">
                <button
                  onClick={() => { setUpdateLogoDesignId(null); setPendingLogoUrl(null); setPendingLogoQuality(null); }}
                  className="flex-1 h-11 rounded-[12px] border border-snp-navy-200 text-snp-navy-600 text-[14px] font-semibold hover:bg-snp-navy-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateLogo}
                  disabled={!pendingLogoUrl || pendingLogoQuality === null}
                  className="flex-1 h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
                  style={{ background: pendingLogoQuality?.isLowQuality ? 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)' : '#3077c9' }}
                >
                  {pendingLogoQuality?.isLowQuality ? `Continue anyway · ${itemCount} item${itemCount !== 1 ? 's' : ''}` : `Update ${itemCount} item${itemCount !== 1 ? 's' : ''} →`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Duplicate Design modal ──────────────────────────────────────────────── */}
      {duplicateDesignId && duplicateDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDuplicateDesignId(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-[420px] p-7 shadow-[0px_32px_80px_rgba(1,39,84,0.28)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <img src={duplicateDesign.logoUrl ?? ''} alt="" className="w-11 h-11 rounded-[12px] border border-snp-navy-200 bg-white object-contain p-1.5 shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
              <div>
                <h2 className="text-[18px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Duplicate "{duplicateDesign.name}"?
                </h2>
                <p className="text-[13px] text-snp-navy-500 mt-1">
                  A copy will be created with all <strong>{duplicateItemCount}</strong> designed item{duplicateItemCount !== 1 ? 's' : ''}.
                </p>
              </div>
              <button onClick={() => setDuplicateDesignId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0 ml-auto">
                <X className="w-4 h-4 text-snp-navy-500" />
              </button>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setDuplicateDesignId(null)} className="flex-1 h-11 rounded-[12px] border border-snp-navy-200 text-snp-navy-600 text-[14px] font-semibold hover:bg-snp-navy-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => confirmDuplicateDesign(duplicateDesign.id)}
                className="flex-1 h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: '#3077c9' }}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Design modal ─────────────────────────────────────────────────── */}
      {renameDesignId && renameDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRenameDesignId(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-[420px] p-7 shadow-[0px_32px_80px_rgba(1,39,84,0.28)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <img src={renameDesign.logoUrl ?? ''} alt="" className="w-11 h-11 rounded-[12px] border border-snp-navy-200 bg-white object-contain p-1.5 shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
              <div className="flex-1">
                <h2 className="text-[18px] font-bold text-snp-navy-950 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Rename design
                </h2>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenameDesignId(null); }}
                  placeholder="Design name"
                  className="w-full h-10 px-3.5 rounded-[10px] border border-snp-navy-200 text-[14px] text-snp-navy-950 placeholder:text-snp-navy-300 focus:outline-none focus:border-snp-indigo-600 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <button onClick={() => setRenameDesignId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0">
                <X className="w-4 h-4 text-snp-navy-500" />
              </button>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setRenameDesignId(null)} className="flex-1 h-11 rounded-[12px] border border-snp-navy-200 text-snp-navy-600 text-[14px] font-semibold hover:bg-snp-navy-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmRename}
                disabled={!renameValue.trim()}
                className="flex-1 h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
                style={{ background: '#3077c9' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Brand modal ──────────────────────────────────────────────────── */}
      {showUploadModal && (
        <UploadBrandModal
          onClose={() => setShowUploadModal(false)}
          onLogoSaved={(id) => { setShowUploadModal(false); setDrillDesignId(id); }}
        />
      )}

      {/* ── Product picker drawer ──────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${showPicker ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { setShowPicker(false); setPickerDesignId(null); }}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-out ${showPicker ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '66vw', maxWidth: 900, minWidth: 360, boxShadow: '-24px 0px 60px 0px rgba(1,39,84,0.18)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-snp-navy-200 shrink-0">
          <div>
            <h3 className="text-[17px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Add products</h3>
            <p className="text-[12px] text-snp-navy-500 mt-0.5">{pickerSelected.size} item{pickerSelected.size !== 1 ? 's' : ''} selected</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (pickerSelected.size > 0) {
                  addProductsToBrandSet([...pickerSelected], pickerDesignId ?? drillDesignId ?? undefined);
                }
                setPickerSelected(new Set());
                setPickerSearch('');
                setPickerCategory('All');
                setPickerDesignId(null);
                setShowPicker(false);
              }}
              className="flex items-center gap-2 h-9 px-5 rounded-[12px] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#3077c9' }}
            >
              {pickerSelected.size > 0 ? `Add ${pickerSelected.size} item${pickerSelected.size !== 1 ? 's' : ''}` : 'Done'}
            </button>
            <button
              onClick={() => { setShowPicker(false); setPickerSelected(new Set()); setPickerSearch(''); setPickerCategory('All'); setPickerDesignId(null); }}
              className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center hover:bg-snp-navy-200 transition-colors"
            >
              <X className="w-4 h-4 text-snp-navy-600" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-snp-navy-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-snp-navy-500" />
            <input
              type="text"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full h-9 pl-9 pr-9 text-[13px] border border-snp-navy-200 rounded-[10px] focus:outline-none focus:border-snp-indigo-600 focus:ring-1 focus:ring-snp-indigo-600/15 text-snp-navy-950 placeholder:text-snp-navy-300 bg-snp-navy-50 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            {pickerSearch && (
              <button onClick={() => setPickerSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-snp-navy-500 hover:text-snp-navy-700">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-2.5 border-b border-snp-navy-200 shrink-0 flex items-center gap-2 overflow-x-auto">
          {PICKER_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setPickerCategory(cat.value)}
              className={`shrink-0 h-8 px-3.5 rounded-full text-[12px] font-semibold border transition-colors ${pickerCategory === cat.value ? 'bg-snp-indigo-600 border-snp-indigo-600 text-white' : 'bg-white border-snp-navy-200 text-snp-navy-600 hover:border-snp-indigo-600 hover:text-snp-indigo-600'}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="px-6 pt-3 pb-1 shrink-0">
          <span className="text-[12px] text-snp-navy-400">{pickerProducts.length} product{pickerProducts.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-10">
            {pickerProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-8 h-8 text-[#c5d5e8] mb-3" />
                <p className="text-[14px] font-semibold text-snp-navy-700 mb-1">No products found</p>
                <p className="text-[12px] text-snp-navy-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {pickerProducts.map(product => {
                  const isSelected = pickerSelected.has(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => setPickerSelected(prev => {
                        const next = new Set(prev);
                        isSelected ? next.delete(product.id) : next.add(product.id);
                        return next;
                      })}
                      className="relative bg-white rounded-[16px] border-2 overflow-hidden cursor-pointer transition-all"
                      style={{
                        borderColor: isSelected ? 'var(--snp-indigo-600)' : 'var(--snp-navy-200)',
                        boxShadow: isSelected ? '0px 4px 16px 0px rgba(48,119,201,0.16)' : 'none',
                      }}
                    >
                      <div
                        className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: isSelected ? 'var(--snp-indigo-600)' : 'rgba(255,255,255,0.92)',
                          borderColor: isSelected ? 'var(--snp-indigo-600)' : '#d1dce8',
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="bg-snp-navy-50 h-[140px] flex items-center justify-center overflow-hidden">
                        {product.image.startsWith('/') ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-3" style={{ mixBlendMode: 'multiply' }} />
                        ) : (
                          <span className="text-[44px]">{product.image}</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] font-bold text-snp-navy-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
                        <p className="text-[11px] font-semibold text-snp-navy-950 leading-snug mb-1.5 line-clamp-2">{product.name}</p>
                        <p className="text-[11px] font-bold text-snp-indigo-600">From ${product.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bulk action bar (drill mode only) ──────────────────────────────────── */}
      {drillDesignId && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${selectedIds.size > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-[1400px] mx-auto px-4 md:px-[120px] pb-5">
            <div
              className="rounded-[20px] px-5 py-3.5 flex items-center gap-3 shadow-[0px_-4px_40px_rgba(1,39,84,0.22)]"
              style={{ background: 'linear-gradient(135deg, var(--snp-navy-950) 0%, #1e3a6e 100%)', fontFamily: "'DM Sans', sans-serif" }}
            >
              <button onClick={() => setSelectedIds(new Set())} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0">
                <X className="w-4 h-4 text-white" />
              </button>
              <span className="text-white font-bold text-[14px] shrink-0">{selectedIds.size} selected</span>
              <div className="flex-1" />
              <AddToCollectionMenu
                dropUp align="right"
                productIds={itemSource.filter(i => selectedIds.has(i.id)).map(i => i.productId)}
                trigger={
                  <button className="flex items-center gap-2 h-9 px-4 rounded-[12px] bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold transition-colors border border-white/20">
                    <FolderPlus className="w-3.5 h-3.5" /> Add to Collection
                  </button>
                }
              />
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[12px] text-white text-[13px] font-semibold bg-snp-red-500/70 hover:bg-snp-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk remove confirm */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setBulkDeleteConfirm(false)}>
          <div className="bg-white rounded-[24px] w-full max-w-[360px] p-7 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-11 h-11 bg-[#fef2f2] rounded-[12px] flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-snp-red-500" />
            </div>
            <h2 className="text-[18px] font-bold text-snp-navy-950 mb-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Remove {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}?
            </h2>
            <p className="text-[13px] text-snp-navy-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 h-11 rounded-[12px] border border-snp-navy-200 text-snp-navy-600 text-[14px] font-semibold hover:bg-snp-navy-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { setLocalItems(prev => prev.filter(d => !selectedIds.has(d.id))); setSelectedIds(new Set()); setBulkDeleteConfirm(false); }}
                className="flex-1 h-11 rounded-[12px] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #f87171 0%, var(--snp-red-500) 100%)' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareDesignId && (() => {
        const design = localDesigns.find(d => d.id === shareDesignId);
        if (!design) return null;
        return (
          <ShareModal
            design={design}
            settings={shareSettings[shareDesignId] ?? { orgWide: false, orgWidePermission: 'view', accounts: [] }}
            onChange={s => setShareSettings(prev => ({ ...prev, [shareDesignId]: s }))}
            onClose={() => setShareDesignId(null)}
          />
        );
      })()}

    </div>
  );
}

// ── New MyDesigns page (design-card grid) ─────────────────────────────────────

function timeAgoLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const m = Math.floor(days / 30);
  return m === 1 ? '1mo ago' : `${m}mo ago`;
}

export function MyDesignCard({ design, onDelete, onDuplicate, onShare, isInCreation = false }: { design: Design; onDelete: () => void; onDuplicate: () => void; onShare: () => void; isInCreation?: boolean }) {
  const navigate = useNavigate();
  const { logoUrl: contextLogo } = useCompanyLogo();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen(v => !v);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const logoUrl = design.logoUrl ?? contextLogo;
  const hasProducts = design.productIds.length > 0;
  const isReady = !!logoUrl && hasProducts;
  const needsLogo = !logoUrl;
  const productCount = design.productIds.length;
  const collectionCount = MY_COLLECTIONS.filter(c => c.productIds.some(pid => design.productIds.includes(pid))).length;

  return (
    <div
      className={`bg-white border border-[#e0ebf7] rounded-[24px] overflow-hidden shadow-[0px_12px_8px_rgba(125,146,169,0.08)] transition-all ${isInCreation ? 'cursor-default' : 'cursor-pointer hover:shadow-[0px_16px_24px_rgba(1,39,84,0.10)]'}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      onClick={isInCreation ? undefined : () => navigate(`/designs/${design.id}`)}
    >
      <div className="flex flex-col gap-2 pt-2 px-2 pb-4">

        {/* Inner container */}
        <div className="flex flex-col gap-3 p-3">

          {/* Status + More row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {isInCreation ? (
                <div className="flex items-center gap-1.5 h-8 px-2 rounded-[8px] bg-[#eef4ff] border border-[#d6e4f4]">
                  <div className="w-2 h-2 rounded-full bg-[#3077c9] shrink-0 animate-pulse" />
                  <span className="text-[10px] font-bold text-[#2864a8] uppercase tracking-wide">In creation</span>
                </div>
              ) : isReady ? (
                <div className="flex items-center gap-1.5 h-8 px-2 rounded-[8px] bg-[#effbf5]">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                  <span className="text-[10px] font-bold text-[#006644] uppercase tracking-wide">Ready to send</span>
                </div>
              ) : needsLogo ? (
                <div className="flex items-center gap-1.5 h-8 px-2 rounded-[4px] bg-[#fff6e5] border border-[#f5ebe4]">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
                  <span className="text-[10px] font-bold text-[#99670b] uppercase tracking-wide">Needs logo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 h-8 px-2 rounded-[4px] bg-snp-navy-50 border border-snp-navy-100">
                  <div className="w-2 h-2 rounded-full bg-snp-navy-300 shrink-0" />
                  <span className="text-[10px] font-bold text-snp-navy-500 uppercase tracking-wide">No products</span>
                </div>
              )}
              {isReady && logoUrl && (
                <div className="h-5 w-14 flex items-center justify-start overflow-hidden">
                  <img src={logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            {!isInCreation && (
              <div onClick={e => e.stopPropagation()}>
                <button
                  ref={triggerRef}
                  onClick={openMenu}
                  className="w-9 h-9 rounded-[8px] bg-white border border-[#e0ebf7] flex items-center justify-center hover:bg-snp-navy-50 transition-colors shrink-0"
                >
                  <MoreHorizontal className="w-4 h-4 text-snp-navy-500" />
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="h-12 flex items-center">
            <p className="text-[16px] font-medium text-[#012754] truncate w-full">{design.name}</p>
          </div>

          {/* Indicators — only when ready */}
          {isReady && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-[#8093a9] uppercase tracking-wider leading-tight">
                {productCount} product{productCount !== 1 ? 's' : ''} · edited {timeAgoLabel(design.updatedAt)}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#345276] uppercase tracking-wider">
                  {collectionCount} collection{collectionCount !== 1 ? 's' : ''}
                </span>
                <span className="text-[12px] font-bold text-[#345276]">•</span>
                <span className="text-[12px] font-bold text-[#345276] uppercase tracking-wider">0 stores</span>
              </div>
            </div>
          )}
        </div>

        {/* Card CTAs */}
        <div className="flex gap-2.5 px-2 h-12">
          {isInCreation ? (
            <div className="flex-1 bg-snp-navy-50 border border-[#e0ebf7] rounded-[16px] flex items-center justify-center gap-2 text-[13px] font-medium text-snp-navy-400 select-none">
              <div className="w-3 h-3 rounded-full border-2 border-[#3077c9] border-t-transparent animate-spin shrink-0" />
              Creating your design…
            </div>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/designs/${design.id}`); }}
              className="flex-1 bg-white border border-[#e0ebf7] rounded-[16px] flex items-center justify-center text-[14px] font-medium text-[#012754] hover:bg-snp-navy-50 transition-colors"
            >
              Customize
            </button>
          )}
        </div>
      </div>

      {/* Actions dropdown — portalled */}
      {menuOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999, fontFamily: "'DM Sans', sans-serif" }}
          className="bg-white border border-[#e0ebf7] rounded-[16px] shadow-[0px_16px_24px_0px_rgba(1,39,84,0.16)] w-[220px] p-4 flex flex-col gap-4"
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: 'Edit Design',              bg: '#effbf5', icon: <Pencil className="w-4 h-4 text-[#16a34a]" />,  action: () => { navigate(`/designs/${design.id}`); setMenuOpen(false); } },
            { label: 'Share design',             bg: '#eef4ff', icon: <Share2 className="w-4 h-4 text-[#3077c9]" />, action: () => { onShare(); setMenuOpen(false); } },
            { label: 'Duplicate design',         bg: '#f1ecfa', icon: <Copy className="w-4 h-4 text-[#7c3aed]" />,   action: () => { onDuplicate(); setMenuOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left w-full">
              <div className="w-8 h-8 rounded-[9.6px] flex items-center justify-center shrink-0" style={{ background: item.bg }}>
                {item.icon}
              </div>
              <span className="text-[14px] font-medium text-[#345276]">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left w-full"
          >
            <div className="w-8 h-8 rounded-[9.6px] bg-[#fcf2f2] flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-[#ef4444]" />
            </div>
            <span className="text-[14px] font-medium text-[#ef4444]">Delete</span>
          </button>
        </div>,
        document.body
      )}

      {/* Confirm delete modal */}
      {confirmDelete && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-[18px] font-semibold text-snp-navy-950 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Delete "{design.name}"?
            </h2>
            <p className="text-[13px] text-snp-navy-500 leading-relaxed mb-6">
              This design and all {design.productIds.length > 0 ? design.productIds.length : ''} product{design.productIds.length !== 1 ? 's' : ''} in it will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" size="sm" className="flex-1" onClick={() => { setConfirmDelete(false); onDelete(); }}>Delete design</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const IN_CREATION_KEY = 'snappy_in_creation_designs';
const IN_CREATION_MS  = 30_000;

function getInCreationMap(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(IN_CREATION_KEY) ?? '{}'); } catch { return {}; }
}
function saveInCreationMap(m: Record<string, number>) {
  localStorage.setItem(IN_CREATION_KEY, JSON.stringify(m));
}

export function MyDesigns() {
  const navigate = useNavigate();
  const { lookbooks: designs, createLookbook: createDesign, deleteLookbook: deleteDesign } = useLookbooks();
  const [shareDesignId, setShareDesignId] = useState<string | null>(null);
  const [shareSettings, setShareSettings] = useState<Record<string, ShareSettings>>({});

  const [inCreationIds, setInCreationIds] = useState<Set<string>>(() => {
    const map = getInCreationMap();
    const now = Date.now();
    return new Set(Object.entries(map).filter(([, exp]) => exp > now).map(([id]) => id));
  });

  // Resume timers for any IDs restored from localStorage on mount
  useEffect(() => {
    const map = getInCreationMap();
    const now = Date.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    Object.entries(map).forEach(([id, exp]) => {
      const remaining = exp - now;
      if (remaining > 0) {
        timers.push(setTimeout(() => {
          setInCreationIds(prev => { const s = new Set(prev); s.delete(id); return s; });
          const m = getInCreationMap(); delete m[id]; saveInCreationMap(m);
        }, remaining));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDuplicate(d: Design) {
    const newDesign = createDesign({
      name: `${d.name} (copy)`,
      logoUrl: d.logoUrl,
      productIds: [...d.productIds],
      themeName: d.themeName,
    });
    const expiresAt = Date.now() + IN_CREATION_MS;
    const map = getInCreationMap();
    map[newDesign.id] = expiresAt;
    saveInCreationMap(map);
    setInCreationIds(prev => new Set([...prev, newDesign.id]));
    setTimeout(() => {
      setInCreationIds(prev => { const s = new Set(prev); s.delete(newDesign.id); return s; });
      const m = getInCreationMap(); delete m[newDesign.id]; saveInCreationMap(m);
    }, IN_CREATION_MS);
  }

  function handleNewDesign() {
    const d = createDesign();
    navigate(`/designs/${d.id}`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="your-swag" />

      <div className="max-w-[1400px] mx-auto pt-7 px-4 md:pl-[80px] md:pr-[40px] pb-24">
        <div className="flex gap-8">
          <YourSwagSidebar active="my-designs" />
          <div className="flex-1">
        {/* Page header row */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[28px] font-semibold text-snp-navy-950"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            My Designs
          </h2>
          <Button size="sm" onClick={handleNewDesign} iconLeft={<Plus className="w-4 h-4" />}>
            New Design
          </Button>
        </div>

        {designs.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center gap-4">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)' }}
            >
              <Package className="w-8 h-8" style={{ color: '#3077c9' }} />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-snp-navy-800 mb-1">No designs yet</p>
              <p className="text-[14px] text-snp-navy-500">Create your first design to start building branded swag</p>
            </div>
            <Button size="lg" onClick={handleNewDesign} iconLeft={<Plus className="w-4 h-4" />}>
              Create your first design
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {designs.map(d => (
              <MyDesignCard
                key={d.id}
                design={d}
                onDelete={() => deleteDesign(d.id)}
                onDuplicate={() => handleDuplicate(d)}
                onShare={() => setShareDesignId(d.id)}
                isInCreation={inCreationIds.has(d.id)}
              />
            ))}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Share modal */}
      {shareDesignId && (() => {
        const d = designs.find(x => x.id === shareDesignId);
        if (!d) return null;
        return (
          <ShareModal
            design={d}
            settings={shareSettings[shareDesignId] ?? { orgWide: false, orgWidePermission: 'view', accounts: [] }}
            onChange={s => setShareSettings(prev => ({ ...prev, [shareDesignId]: s }))}
            onClose={() => setShareDesignId(null)}
          />
        );
      })()}
    </div>
  );
}
