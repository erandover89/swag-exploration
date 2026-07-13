import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown, ChevronLeft, UserPlus, Store, Send, Plus, Trash2,
  AlertTriangle, Pencil, Package, Check, X, ArrowRight, Star,
  Globe, Loader2, Upload,
} from 'lucide-react';
import { PRODUCTS, COUNTRIES, MOCK_COMPANY, BUDGET_RANGES, PRINT_TECHNIQUE_CHIPS } from '../data/mockData';
import { useCompanyLogo } from '../context/CompanyLogoContext';
import { useLookbooks } from '../context/LookbookContext';
import { ProductPickerDrawer } from '../components/ProductPickerDrawer';
import { ReplaceLogoModal } from '../components/ReplaceLogoModal';
import { InviteModal } from '../components/InviteModal';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { fetchLogoForDomain } from '../components/LogoInput';

// ── Publish state data model ──────────────────────────────────────────────────

interface ConnectedCollection {
  id: string;
  name: string;
  sentCount: number;
  syncedAt: string;
}

interface ConnectedStore {
  name: string;
  url: string;
  syncedAt: string;
}

interface PublishState {
  publishedAt: string;
  snapshot: { productIds: string[]; logoUrl: string | null };
  connections: {
    collections: ConnectedCollection[];
    store: ConnectedStore | null;
  };
}

function getPublishState(lookbookId: string): PublishState | null {
  try {
    const raw = localStorage.getItem(`snappy_publish_${lookbookId}`);
    return raw ? (JSON.parse(raw) as PublishState) : null;
  } catch {
    return null;
  }
}

function savePublishState(lookbookId: string, state: PublishState): void {
  localStorage.setItem(`snappy_publish_${lookbookId}`, JSON.stringify(state));
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function isRasterLogoUrl(url?: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('data:image/svg+xml')) return false;
  if (/\.(svg)(\?|$)/i.test(url) || url.includes('dicebear')) return false;
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}

const BUDGET_TABS = BUDGET_RANGES;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function DesignWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { logoUrl: contextLogo, isApplying, saveLogo, allBrandSets, activateBrandSet, deleteBrandSet } = useCompanyLogo();
  const { getLookbook, updateLookbook, addProducts, removeProduct, getProductDesign } = useLookbooks();

  const design = id ? getLookbook(id) : undefined;

  useEffect(() => {
    if (id && !design) navigate('/designs', { replace: true });
  }, [id, design, navigate]);

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(design?.name ?? '');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (design) setNameValue(design.name);
  }, [design?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  function commitName() {
    if (!id) return;
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== design?.name) updateLookbook(id, { name: trimmed });
    else if (!trimmed) setNameValue(design?.name ?? '');
    setEditingName(false);
  }

  // Filter bar
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  const budgetRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showBudgetMenu) return;
    function handle(e: MouseEvent) {
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) setShowBudgetMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showBudgetMenu]);

  useEffect(() => {
    if (!showCountryMenu) return;
    function handle(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountryMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showCountryMenu]);

  // Modals / drawers
  const [pickerOpen, setPickerOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoDropdownOpen, setLogoDropdownOpen] = useState(false);
  // Pending logo action — set when user picks a logo while one is already active
  const [logoConfirm, setLogoConfirm] = useState<
    { type: 'new' } | { type: 'switch'; brandSetId: string; logoUrl: string } | null
  >(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(
    () => !!(location.state as { openPublish?: boolean } | null)?.openPublish,
  );

  // Publish-changes confirmation modal
  const [showPublishChangesModal, setShowPublishChangesModal] = useState(false);

  // Preparing-design loader (shown on first Save & Send)
  const [preparingDone, setPreparingDone] = useState(true);
  const [preparingProgress, setPreparingProgress] = useState(0);
  const [preparingPhase, setPreparingPhase] = useState(0);

  const PREPARING_PHASES = [
    'Preparing your swag design…',
    'Applying your logo to products…',
    'Making sure everything looks great…',
    'Almost ready!',
  ];

  // Creating-collection animation
  const [showCreating, setShowCreating] = useState(false);
  const [creatingPhase, setCreatingPhase] = useState(0);
  const [creatingProgress, setCreatingProgress] = useState(0);
  const creatingDestRef = useRef<{ designId: string; productIds: string[]; collectionName: string } | null>(null);

  const CREATING_PHASES = [
    'Applying your branding…',
    'Building your collection…',
    'Setting up shipping…',
    'Almost ready!',
  ];

  useEffect(() => {
    if (!showCreating) { setCreatingPhase(0); setCreatingProgress(0); return; }
    // Progress bar: tick to 100 on next frame so CSS transition fires
    const raf = requestAnimationFrame(() => setCreatingProgress(100));
    // Phase cycling
    const t1 = setTimeout(() => setCreatingPhase(1), 1200);
    const t2 = setTimeout(() => setCreatingPhase(2), 2500);
    const t3 = setTimeout(() => setCreatingPhase(3), 3700);
    // Navigate when done
    const t4 = setTimeout(() => {
      setShowCreating(false);
      if (creatingDestRef.current) {
        navigate('/collection/preview', {
          state: {
            designId: creatingDestRef.current.designId,
            productIds: creatingDestRef.current.productIds,
            collectionName: creatingDestRef.current.collectionName,
          },
        });
      }
    }, 5000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [showCreating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Publish state — initialized from localStorage; re-synced whenever id changes
  const [publishState, setPublishStateLocal] = useState<PublishState | null>(
    () => (id ? getPublishState(id) : null)
  );

  useEffect(() => {
    setPublishStateLocal(id ? getPublishState(id) : null);
  }, [id]);

  // Run loader animation when publish modal opens in draft state
  useEffect(() => {
    if (!showPublishModal || preparingDone) return;
    setPreparingProgress(0);
    setPreparingPhase(0);
    const t0 = setTimeout(() => setPreparingProgress(100), 50);
    const t1 = setTimeout(() => setPreparingPhase(1), 900);
    const t2 = setTimeout(() => setPreparingPhase(2), 1900);
    const t3 = setTimeout(() => setPreparingPhase(3), 2800);
    const t4 = setTimeout(() => setPreparingDone(true), 3600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [showPublishModal, preparingDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset progress when modal closes
  useEffect(() => {
    if (!showPublishModal) { setPreparingProgress(0); setPreparingPhase(0); }
  }, [showPublishModal]);

  function doSavePublish(state: PublishState) {
    if (!id) return;
    try { savePublishState(id, state); } catch {}
    setPublishStateLocal(state);
  }

  // Banner (no-logo state)
  const [bannerDomain, setBannerDomain] = useState('');
  const [bannerFetching, setBannerFetching] = useState(false);

  async function handleBannerFetch() {
    const raw = bannerDomain.trim();
    if (!raw) { setLogoModalOpen(true); return; }
    setBannerFetching(true);
    try {
      const url = await fetchLogoForDomain(raw);
      saveLogo(url);
      if (id) updateLookbook(id, { logoUrl: url });
      setBannerDomain('');
    } finally {
      setBannerFetching(false);
    }
  }



  if (!design) return null;

  const logoUrl = design.logoUrl ?? contextLogo;

  const allProducts = design.productIds
    .map(pid => PRODUCTS.find(p => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => p != null);

  const previewProducts = allProducts.slice(0, 5);

  const budgetRange = BUDGET_TABS.find(b => b.max === budgetFilter);
  const products = allProducts.filter(p => budgetFilter === null || (p.price <= budgetFilter && p.price >= (budgetRange?.min ?? 0)));

  // Products for the no-logo marquee
  const marqueeProducts = (allProducts.length > 0 ? allProducts : PRODUCTS).filter(p => p.image.startsWith('/'));

  // Returns a specific issue label for a product, or null if none
  function getProductIssueLabel(productId: string): string | null {
    const canvasDesign = id ? getProductDesign(id, productId) : null;
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return null;
    if (canvasDesign) return canvasDesign.hasQualityIssue ? 'Quality issue' : null;
    if (product.hasImageQualityIssue) return 'Quality issue';
    if (isRasterLogoUrl(logoUrl ?? undefined)) return 'Low res logo';
    return null;
  }

  const ctasDisabled = allProducts.length === 0;

  const budgetLabel = budgetFilter === null ? 'All Budgets' : (BUDGET_TABS.find(b => b.max === budgetFilter)?.label ?? `$${budgetFilter}`);
  const country = COUNTRIES.find(c => c.code === selectedCountry);

  // ── Publish diff detection ─────────────────────────────────────────────────
  const isPublished = publishState !== null;
  const isEssential = MOCK_COMPANY.plan.toLowerCase().includes('essential');

  // Diff counts (used in modal state C and hasChanges)
  const prevIds = publishState?.snapshot.productIds ?? [];
  const currIds = design.productIds;
  const addedCount = currIds.filter(pid => !prevIds.includes(pid)).length;
  const removedCount = prevIds.filter(pid => !currIds.includes(pid)).length;
  const logoChanged = isPublished && logoUrl !== publishState!.snapshot.logoUrl;
  const designUpdatedCount = isPublished ? currIds.filter(pid => {
    const ds = getProductDesign(id!, pid);
    return ds?.savedAt && new Date(ds.savedAt) > new Date(publishState!.publishedAt);
  }).length : 0;

  const hasChanges = isPublished && (
    addedCount > 0 || removedCount > 0 || logoChanged || designUpdatedCount > 0
  );
  const totalChanges = addedCount + removedCount + (logoChanged ? 1 : 0) + designUpdatedCount;

  // Count of connected entities (for button label + entities bar)
  const connectedCollections = publishState?.connections.collections ?? [];
  const connectedStore = publishState?.connections.store ?? null;
  const connectedCount = connectedCollections.length + (connectedStore ? 1 : 0);

  // ── Publish action handlers ────────────────────────────────────────────────
  function handlePublishStore() {
    if (!id || !design) return;
    const now = new Date().toISOString();
    const store = { name: `${design.name} Store`, url: '#', syncedAt: now };
    const newState: PublishState = publishState
      ? { ...publishState, connections: { ...publishState.connections, store } }
      : {
          publishedAt: now,
          snapshot: { productIds: [...design.productIds], logoUrl },
          connections: { collections: [], store },
        };
    try { savePublishState(id, newState); } catch {}
    setPublishStateLocal(newState);
    setShowPublishModal(false);
  }


  function handlePublishCollection() {
    if (!id || !design) return;
    const now = new Date().toISOString();
    const collectionName = publishState
      ? `${design.name} Collection ${publishState.connections.collections.length + 2}`
      : `${design.name} Collection`;
    if (publishState) {
      const newCol = { id: `c${Date.now()}`, name: collectionName, sentCount: 0, syncedAt: now };
      doSavePublish({
        ...publishState,
        connections: { ...publishState.connections, collections: [...publishState.connections.collections, newCol] },
      });
    } else {
      doSavePublish({
        publishedAt: now,
        snapshot: { productIds: [...design.productIds], logoUrl },
        connections: {
          collections: [{ id: 'c1', name: collectionName, sentCount: 12, syncedAt: now }],
          store: null,
        },
      });
    }
    setShowPublishModal(false);
    creatingDestRef.current = { designId: id, productIds: [...design.productIds], collectionName };
    setShowCreating(true);
  }


  function handlePublishBrowse() {
    if (!id || !design) return;
    const now = new Date().toISOString();
    doSavePublish({
      publishedAt: now,
      snapshot: { productIds: [...design.productIds], logoUrl },
      connections: { collections: [], store: null },
    });
    setShowPublishModal(false);
  }

  // Executes the actual publish — called from the confirmation modal
  function confirmPublishChanges() {
    if (!publishState || !id || !design) return;
    const now = new Date().toISOString();
    doSavePublish({
      ...publishState,
      publishedAt: now,
      snapshot: { productIds: [...design.productIds], logoUrl },
      connections: {
        collections: publishState.connections.collections.map(col => ({ ...col, syncedAt: now })),
        store: publishState.connections.store ? { ...publishState.connections.store, syncedAt: now } : null,
      },
    });
    setShowPublishChangesModal(false);
  }

  function openPublishModal() {
    setPreparingDone(isPublished); // Draft → show loader; Published → skip loader
    setShowPublishModal(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Onboarding popup */}

      {/* Invite modal */}
      {showInviteModal && (
        <InviteModal accountName={MOCK_COMPANY.name} onClose={() => setShowInviteModal(false)} />
      )}

      {/* Replace logo modal */}
      {logoModalOpen && (
        <ReplaceLogoModal
          currentLogoUrl={logoUrl}
          onSelect={url => { saveLogo(url); if (id) updateLookbook(id, { logoUrl: url }); setLogoModalOpen(false); }}
          onClose={() => setLogoModalOpen(false)}
        />
      )}


      {/* ── Publish modal ──────────────────────────────────────────────────────── */}
      {showPublishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(1,39,84,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPublishModal(false)}
        >
          <style>{`
            @keyframes prep-float {
              from { opacity: 0; transform: translateY(14px) scale(0.88); }
              to   { opacity: 1; transform: translateY(0px)  scale(1); }
            }
            @keyframes prep-phase {
              0%   { opacity: 0; transform: translateY(5px); }
              15%  { opacity: 1; transform: translateY(0); }
              80%  { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-5px); }
            }
          `}</style>
          <div
            className="bg-white rounded-[24px] shadow-[0px_24px_64px_rgba(1,39,84,0.20)] overflow-hidden w-[860px]"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Gradient header — shared between loader + ready states ── */}
            <div
              className="px-8 relative text-center transition-all duration-500"
              style={{
                background: 'linear-gradient(155deg, #eef3ff 0%, #f5eeff 45%, #fff4ee 100%)',
                paddingTop: '2rem',
                paddingBottom: preparingDone ? '1.75rem' : '2.25rem',
              }}
            >
              <button
                onClick={() => setShowPublishModal(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-snp-navy-500 hover:bg-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product arc */}
              {previewProducts.length > 0 && (
                <div className="flex items-end justify-center gap-2 h-14 mb-5">
                  {previewProducts.map((p, i) => {
                    const isPhoto = p.image.startsWith('/');
                    return (
                      <div
                        key={p.id}
                        className="w-[48px] h-[48px] rounded-[11px] bg-white flex items-center justify-center overflow-hidden shrink-0"
                        style={{
                          boxShadow: '0px 4px 14px rgba(1,39,84,0.10)',
                          transform: `translateY(${[7, -4, 0, -4, 7][i] ?? 0}px)`,
                          border: '1.5px solid rgba(224,235,247,0.8)',
                          animation: `prep-float 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms both`,
                        }}
                      >
                        {isPhoto
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                          : <span className="text-[20px]">{p.image}</span>
                        }
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Heading — crossfades between loading and ready */}
              <div className="relative" style={{ minHeight: preparingDone ? 'auto' : '80px' }}>

                {/* Loading heading + phases + progress */}
                <div
                  className="transition-opacity duration-500"
                  style={{
                    opacity: preparingDone ? 0 : 1,
                    position: preparingDone ? 'absolute' : 'relative',
                    inset: 0,
                    pointerEvents: 'none',
                  }}
                >
                  <h2
                    className="text-[26px] font-semibold text-snp-navy-950 leading-tight"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    Preparing your design…
                  </h2>
                  <div className="h-5 overflow-hidden relative w-[340px] mx-auto mt-2">
                    {PREPARING_PHASES.map((phase, i) => (
                      <p
                        key={i}
                        className="absolute inset-0 text-[13px] text-snp-navy-400 text-center"
                        style={{
                          animation: preparingPhase === i ? 'prep-phase 1.1s ease forwards' : undefined,
                          opacity: preparingPhase === i ? undefined : 0,
                        }}
                      >
                        {phase}
                      </p>
                    ))}
                  </div>
                  <div className="w-[280px] mx-auto h-[3px] rounded-full bg-white/60 overflow-hidden mt-5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${preparingProgress}%`,
                        background: 'linear-gradient(90deg, #3077c9, #36d4ff)',
                        transition: preparingProgress === 100 ? 'width 3.5s linear' : 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Ready heading */}
                <div
                  className="transition-opacity duration-500"
                  style={{ opacity: preparingDone ? 1 : 0 }}
                >
                  <h2
                    className="text-[26px] font-semibold text-snp-navy-950 leading-tight mb-1"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    Your design is ready&nbsp;🎉
                  </h2>
                  <p className="text-[13px] text-snp-navy-500">
                    How do you want to get it into people's hands?
                  </p>
                </div>
              </div>
            </div>

            {/* ── Distribution options — revealed when ready ── */}
            <div
              className="overflow-hidden transition-all duration-500"
              style={{ maxHeight: preparingDone ? '600px' : '0px', opacity: preparingDone ? 1 : 0 }}
            >

                {/* 3 primary option cards */}
                <div className="px-6 pt-6 pb-4 grid grid-cols-3 gap-4">

                  {/* Card 1 — Gift Collection */}
                  <button
                    type="button"
                    onClick={handlePublishCollection}
                    className="text-left rounded-[20px] overflow-hidden border border-[#e0ebf7] bg-white group hover:border-indigo-200 hover:shadow-[0px_8px_28px_rgba(79,70,229,0.12)] transition-all active:scale-[0.99]"
                  >
                    <div className="aspect-square flex items-center justify-center overflow-hidden" style={{ background: '#ede9fe' }}>
                      <img src="/gift-collection.png" alt="Gift Collection" className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                    </div>
                    <div className="px-4 pt-4 pb-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="text-[14px] font-semibold text-snp-navy-950"
                          style={{ fontFamily: "'Clash Display', sans-serif" }}
                        >
                          Swag Collection
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <Star className="w-2 h-2 fill-current" /> Recommended
                        </span>
                      </div>
                      <p className="text-[12px] text-snp-navy-400 leading-snug">
                        Recipients pick their favorite item from your curated swag set.
                      </p>
                    </div>
                  </button>

                  {/* Card 2 — Mixed Collection */}
                  <button
                    type="button"
                    onClick={() => { setShowPublishModal(false); navigate('/collection/edit'); }}
                    className="text-left rounded-[20px] overflow-hidden border border-[#e0ebf7] bg-white group hover:border-purple-200 hover:shadow-[0px_8px_28px_rgba(124,58,237,0.12)] transition-all active:scale-[0.99]"
                  >
                    <div className="aspect-square flex items-center justify-center overflow-hidden" style={{ background: '#dde8f7' }}>
                      <img src="/mixed.png" alt="Mixed Collection" className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                    </div>
                    <div className="px-4 pt-4 pb-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="text-[14px] font-semibold text-snp-navy-950"
                          style={{ fontFamily: "'Clash Display', sans-serif" }}
                        >
                          Mixed Collection
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 shrink-0 bg-purple-50 text-purple-600 border border-purple-100">
                          Swag + Gifts
                        </span>
                      </div>
                      <p className="text-[12px] text-snp-navy-400 leading-snug">
                        Mix swag with physical gifts and experiences in one collection.
                      </p>
                    </div>
                  </button>

                  {/* Card 3 — Single Item */}
                  <button
                    type="button"
                    onClick={handlePublishBrowse}
                    className="text-left rounded-[20px] overflow-hidden border border-[#e0ebf7] bg-white group hover:border-sky-200 hover:shadow-[0px_8px_28px_rgba(14,165,233,0.12)] transition-all active:scale-[0.99]"
                  >
                    <div className="aspect-square flex items-center justify-center overflow-hidden" style={{ background: '#ede9fe' }}>
                      <img src="/single-item.png" alt="Single Item" className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                    </div>
                    <div className="px-4 pt-4 pb-4">
                      <span
                        className="text-[14px] font-semibold text-snp-navy-950 block mb-1.5"
                        style={{ fontFamily: "'Clash Display', sans-serif" }}
                      >
                        Single Item
                      </span>
                      <p className="text-[12px] text-snp-navy-400 leading-snug">
                        Send one perfect swag item directly to your recipients.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Store — subtle full-width row */}
                <div className="mx-6 mb-6 border-t border-[#e0ebf7] pt-4">
                  <button
                    type="button"
                    onClick={handlePublishStore}
                    disabled={!isEssential}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] hover:bg-snp-navy-50 transition-colors disabled:opacity-50 disabled:cursor-default text-left group"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-snp-navy-100 flex items-center justify-center shrink-0">
                      <Store className="w-3.5 h-3.5 text-snp-navy-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-snp-navy-600">Create a branded store</span>
                        {!isEssential && (
                          <span className="text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-purple-50 text-purple-500 border border-purple-100">Essentials</span>
                        )}
                      </div>
                      <p className="text-[11px] text-snp-navy-400">Reward recipients with points — they log in and redeem their favorite swag</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-snp-navy-300 shrink-0 group-hover:text-snp-indigo-600 transition-colors" />
                  </button>
                </div>

            </div>{/* end distribution options */}

          </div>
        </div>
      )}

      {/* ── Publish changes confirmation modal ────────────────────────────── */}
      {showPublishChangesModal && publishState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(1,39,84,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPublishChangesModal(false)}
        >
          <div
            className="bg-white rounded-[24px] shadow-[0px_24px_64px_rgba(1,39,84,0.20)] w-[460px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-7 pt-7 pb-5">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2
                  className="text-[22px] font-semibold text-snp-navy-950 leading-tight"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Publish {totalChanges} change{totalChanges !== 1 ? 's' : ''}
                </h2>
                <button
                  onClick={() => setShowPublishChangesModal(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-snp-navy-400 hover:bg-snp-navy-100 transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] text-snp-navy-500">These updates will affect:</p>
            </div>

            {/* Connections list */}
            <div className="px-7 pb-5 flex flex-col gap-2">
              {publishState.connections.collections.map(col => (
                <div
                  key={col.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-snp-navy-50"
                >
                  <div className="w-8 h-8 rounded-[10px] bg-indigo-100 flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-snp-navy-800 truncate">{col.name}</p>
                    <p className="text-[11px] text-snp-navy-400">{col.sentCount} sent</p>
                  </div>
                </div>
              ))}
              {publishState.connections.store && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-snp-navy-50">
                  <div className="w-8 h-8 rounded-[10px] bg-teal-100 flex items-center justify-center shrink-0">
                    <Store className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-snp-navy-800 truncate">{publishState.connections.store.name}</p>
                    <p className="text-[11px] text-snp-navy-400">Live store</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-7 pb-7 flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowPublishChangesModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={confirmPublishChanges}>
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Logo change confirmation modal ────────────────────────────────── */}
      {logoConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(1,39,84,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setLogoConfirm(null)}
        >
          <div
            className="bg-white rounded-[24px] shadow-[0px_24px_64px_rgba(1,39,84,0.20)] w-[420px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-7 pt-7 pb-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2
                  className="text-[20px] font-semibold text-snp-navy-950 leading-tight"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Change logo on all items?
                </h2>
                <button
                  onClick={() => setLogoConfirm(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-snp-navy-400 hover:bg-snp-navy-100 transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] text-snp-navy-500 leading-relaxed">
                This will replace the logo on all <strong className="text-snp-navy-800">{design.productIds.length} item{design.productIds.length !== 1 ? 's' : ''}</strong> in this design. Any custom logo placements will be updated.
              </p>
            </div>
            <div className="px-7 pb-7 flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setLogoConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (logoConfirm.type === 'new') {
                    setLogoDropdownOpen(false);
                    setLogoModalOpen(true);
                  } else {
                    activateBrandSet(logoConfirm.brandSetId);
                    if (id) updateLookbook(id, { logoUrl: logoConfirm.logoUrl });
                    setLogoDropdownOpen(false);
                  }
                  setLogoConfirm(null);
                }}
              >
                Change logo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Creating collection animation ─────────────────────────────────── */}
      {showCreating && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-10"
          style={{ background: 'linear-gradient(155deg, #eef3ff 0%, #f5eeff 50%, #fff4ee 100%)', fontFamily: "'DM Sans', sans-serif" }}
        >
          <style>{`
            @keyframes cg-floatup {
              from { opacity: 0; transform: translateY(24px) scale(0.88); }
              to   { opacity: 1; transform: translateY(0px)  scale(1); }
            }
            @keyframes cg-phase {
              0%   { opacity: 0; transform: translateY(6px); }
              15%  { opacity: 1; transform: translateY(0); }
              80%  { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-6px); }
            }
          `}</style>

          {/* Product arc */}
          {previewProducts.length > 0 && (
            <div className="flex items-end gap-3 h-[88px]">
              {previewProducts.map((p, i) => {
                const yOff = [14, -8, 0, -8, 14][i] ?? 0;
                const delay = `${i * 120}ms`;
                const isPhoto = p.image.startsWith('/');
                return (
                  <div
                    key={p.id}
                    className="w-[72px] h-[72px] rounded-[16px] bg-white flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                      transform: `translateY(${yOff}px)`,
                      boxShadow: '0px 8px 24px rgba(1,39,84,0.12), 0px 2px 6px rgba(1,39,84,0.06)',
                      border: '1.5px solid rgba(224,235,247,0.9)',
                      animation: `cg-floatup 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay} both`,
                    }}
                  >
                    {isPhoto
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                      : <span className="text-[28px]">{p.image}</span>
                    }
                  </div>
                );
              })}
            </div>
          )}

          {/* Heading */}
          <div className="text-center flex flex-col items-center gap-3">
            <h2
              className="text-[36px] font-semibold text-snp-navy-950 leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Creating your gift collection&nbsp;🎁
            </h2>

            {/* Phase text */}
            <div className="h-5 overflow-hidden relative w-[260px]">
              {CREATING_PHASES.map((phase, i) => (
                <p
                  key={i}
                  className="absolute inset-0 text-[14px] text-snp-navy-400 text-center"
                  style={{
                    animation: creatingPhase === i ? 'cg-phase 1.2s ease forwards' : undefined,
                    opacity: creatingPhase === i ? undefined : 0,
                  }}
                >
                  {phase}
                </p>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-[320px] h-[3px] rounded-full bg-snp-navy-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${creatingProgress}%`,
                background: 'linear-gradient(90deg, #3077c9, #36d4ff)',
                transition: creatingProgress === 100 ? 'width 4.8s linear' : 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Product picker drawer */}
      <ProductPickerDrawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentProductIds={design.productIds}
        onAdd={ids => { if (id) addProducts(id, ids); }}
      />

      {/* ── Page header bar ───────────────────────────────────────────────── */}
      <div className="h-14 bg-white border-b border-[#e0ebf7] flex items-center px-6 gap-3 shrink-0 sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full border border-[#e0ebf7] flex items-center justify-center text-snp-navy-500 hover:bg-snp-navy-50 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <Pill
          label={isPublished ? 'Active' : 'Draft'}
          color={isPublished ? 'Green' : 'Blue'}
          size="Small"
          shape="Curved"
        />

        <span className="text-[13px] text-snp-navy-400 truncate">
          Last updated {timeAgo(design.updatedAt)}
        </span>

        <div className="flex items-center gap-3 ml-auto shrink-0">

          {/* Publish changes group — shown once design is connected */}
          {isPublished && (
            <div className="flex items-center gap-2.5">
              {hasChanges && (
                <span className="text-[12px] font-medium text-orange-500 whitespace-nowrap">
                  {totalChanges} unpublished change{totalChanges !== 1 ? 's' : ''}
                </span>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowPublishChangesModal(true)}
                  disabled={!hasChanges}
                  className={`h-8 px-3.5 text-[13px] font-semibold rounded-[8px] transition-all whitespace-nowrap ${
                    hasChanges
                      ? 'text-white'
                      : 'text-snp-navy-400 bg-snp-navy-100 cursor-default opacity-50'
                  }`}
                  style={hasChanges ? { background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' } : {}}
                >
                  Publish changes
                </button>
                {hasChanges && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white pointer-events-none" />
                )}
              </div>
            </div>
          )}

          {/* Send — always present; primary when draft, secondary when connected */}
          <Button
            size="sm"
            variant={isPublished ? 'secondary' : 'primary'}
            disabled={ctasDisabled}
            onClick={openPublishModal}
          >
            {isPublished ? 'Send' : 'Save & Send'}
          </Button>
        </div>
      </div>

      {/* ── Wizard step header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e0ebf7] px-12 py-8 shrink-0">
        <div className="max-w-[1440px] mx-auto flex items-start justify-between gap-8">

          {/* Left: large name + subtitle */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3">
              {editingName ? (
                <input
                  ref={nameInputRef}
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitName();
                    if (e.key === 'Escape') { setNameValue(design.name); setEditingName(false); }
                  }}
                  className="text-[40px] font-semibold text-snp-navy-950 leading-[1.1] bg-transparent border-b-2 border-snp-indigo-400 outline-none"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                />
              ) : (
                <h1
                  className="text-[40px] font-semibold text-snp-navy-950 leading-[1.1] cursor-text"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                  onClick={() => setEditingName(true)}
                >
                  {design.name}
                </h1>
              )}
              {!editingName && (
                <button
                  onClick={() => setEditingName(true)}
                  className="w-7 h-7 rounded-[8px] bg-snp-navy-100 flex items-center justify-center text-snp-navy-400 hover:bg-snp-navy-200 transition-colors shrink-0 self-center"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[14px] text-snp-navy-500">
              {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}
              {isPublished && ` · ${connectedCount} collection${connectedCount !== 1 ? 's' : ''} linked`}
            </p>
          </div>

          {/* Right: Invite + Add Products */}
          <div className="flex items-center gap-3 shrink-0 self-center">
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              iconLeft={<UserPlus className="w-4 h-4" />}
            >
              Invite
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPickerOpen(true)}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Add Products
            </Button>
          </div>
        </div>
      </div>


      {/* ── No-logo state OR filter bar + product grid ────────────────────── */}
      {!logoUrl ? (

        <div className="flex-1 flex flex-col">
          <style>{`@keyframes workspace-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>

          {/* Banner */}
          <div className="px-12 pt-8 pb-6">
            <div
              className="relative rounded-[32px] overflow-hidden h-[300px] max-w-[1440px] mx-auto"
              style={{ background: 'radial-gradient(ellipse at 18% 90%, #c4d9ef 0%, #d8e8f6 25%, #eaf2fb 55%, #f5f8fd 100%)' }}
            >
              {/* Left products */}
              <div className="absolute left-0 top-0 h-full w-[360px] pointer-events-none">
                <img
                  src="/products/left-products.png"
                  alt=""
                  className="absolute object-contain"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left bottom' }}
                />
              </div>

              {/* Center CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 pb-2">
                <div className="text-center">
                  <h2
                    className="text-[28px] font-semibold text-[#012754] leading-[1.15]"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    See your brand on our swag
                  </h2>
                  <p className="text-[13px] text-[#3d5a7a] mt-1.5">
                    Upload your logo to preview it on every product in this design
                  </p>
                </div>

                {/* Domain fetch input */}
                <div
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 w-[400px]"
                  style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0px 4px 16px rgba(1,39,84,0.08)' }}
                >
                  <Globe className="w-4 h-4 text-[#3d5a7a] shrink-0" />
                  <input
                    type="text"
                    value={bannerDomain}
                    onChange={e => setBannerDomain(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBannerFetch()}
                    placeholder="Enter your website or domain…"
                    className="flex-1 bg-transparent text-[13px] text-[#012754] placeholder-[#7a9bb8] outline-none"
                  />
                  <button
                    onClick={handleBannerFetch}
                    disabled={bannerFetching}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-full text-[12px] font-semibold text-white transition-opacity disabled:opacity-60 shrink-0"
                    style={{ background: 'linear-gradient(180deg, #5992d4 0%, #3077c9 100%)' }}
                  >
                    {bannerFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    Fetch logo
                  </button>
                </div>

                {/* Upload link */}
                <button
                  onClick={() => setLogoModalOpen(true)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#3077c9] hover:text-[#2563b0] transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload logo file instead
                </button>
              </div>

              {/* Right products */}
              <div className="absolute right-0 top-0 h-full w-[360px] pointer-events-none">
                <img
                  src="/products/right-products.png"
                  alt=""
                  className="absolute object-contain"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right bottom' }}
                />
              </div>
            </div>
          </div>

          {/* Marquee */}
          {marqueeProducts.length > 0 && (
            <div className="pb-10 max-w-[1440px] mx-auto w-full px-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#59728f] mb-4">
                IN THIS {(design.themeName ?? design.name).toUpperCase()} THEME:
              </p>
              <div className="relative overflow-hidden">
                {/* Left fade */}
                <div
                  className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}
                />
                {/* Right fade */}
                <div
                  className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }}
                />
                {/* Scrolling track — doubled for seamless loop */}
                <div
                  className="flex gap-4"
                  style={{
                    width: 'max-content',
                    animation: `workspace-marquee ${marqueeProducts.length * 3}s linear infinite`,
                  }}
                >
                  {[...marqueeProducts, ...marqueeProducts].map((p, i) => (
                    <div
                      key={`${p.id}-${i}`}
                      className="w-[200px] h-[200px] rounded-[20px] overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: '#f5f8fc' }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-contain p-5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      ) : (
        <>
          {/* ── Filter bar ────────────────────────────────────────────────────── */}
          <div className="bg-[#fbfcfe] border-b border-[#e0ebf7] sticky top-14 z-20">
            <div className="max-w-[1440px] mx-auto px-12 py-3 flex items-center gap-3">

              {/* Budget pill */}
              <div ref={budgetRef} className="relative shrink-0">
                <button
                  onClick={() => { setShowBudgetMenu(v => !v); setShowCountryMenu(false); }}
                  className="flex items-center gap-2 h-[52px] px-5 rounded-full border border-[#e0ebf7] bg-white text-[13px] font-medium text-snp-navy-950 hover:border-snp-indigo-300 transition-colors"
                >
                  {budgetLabel}
                  <ChevronDown className="w-3.5 h-3.5 text-snp-navy-400" />
                </button>
                {showBudgetMenu && (
                  <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e0ebf7] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[160px] py-1.5 max-h-[280px] overflow-y-auto">
                    <button
                      onClick={() => { setBudgetFilter(null); setShowBudgetMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 flex items-center justify-between gap-3 transition-colors ${budgetFilter === null ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}
                    >
                      All Budgets
                      {budgetFilter === null && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                    {BUDGET_TABS.map(b => (
                      <button
                        key={b.max}
                        onClick={() => { setBudgetFilter(b.max); setShowBudgetMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 flex items-center justify-between gap-3 transition-colors ${budgetFilter === b.max ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}
                      >
                        {b.label}
                        {budgetFilter === b.max && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Country pill */}
              <div ref={countryRef} className="relative shrink-0">
                <button
                  onClick={() => { setShowCountryMenu(v => !v); setShowBudgetMenu(false); }}
                  className="flex items-center gap-2 h-[52px] px-5 rounded-full border border-[#e0ebf7] bg-white text-[13px] font-medium text-snp-navy-950 hover:border-snp-indigo-300 transition-colors"
                >
                  <span className="text-base leading-none">{country?.flag}</span>
                  {country?.name}
                  <ChevronDown className="w-3.5 h-3.5 text-snp-navy-400" />
                </button>
                {showCountryMenu && (
                  <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e0ebf7] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,39,84,0.12)] z-20 min-w-[180px] py-1.5">
                    {COUNTRIES.slice(0, 7).map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setSelectedCountry(c.code); setShowCountryMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-snp-navy-50 flex items-center justify-between gap-3 transition-colors ${selectedCountry === c.code ? 'text-snp-indigo-600' : 'text-snp-navy-700'}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{c.flag}</span>
                          {c.name}
                        </span>
                        {selectedCountry === c.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Logo pill + dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setLogoDropdownOpen(v => !v)}
                  className="flex items-center gap-2 h-[52px] px-5 rounded-full border border-[#e0ebf7] bg-white text-[13px] font-medium text-snp-navy-950 hover:border-snp-indigo-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-[6px] border border-[#e0ebf7] flex items-center justify-center overflow-hidden bg-snp-navy-50 shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-snp-navy-100 rounded-[4px]" />
                    )}
                  </div>
                  {MOCK_COMPANY.name}
                  <ChevronDown className={`w-3.5 h-3.5 text-snp-navy-400 transition-transform ${logoDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {logoDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLogoDropdownOpen(false)} />
                    <div
                      className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-[16px] overflow-hidden z-50"
                      style={{ width: 260, border: '1px solid #e0ebf7', boxShadow: '0px 12px 24px rgba(1,39,84,0.10)' }}
                    >
                      <div className="px-4 pt-3.5 pb-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-snp-navy-400">My Logos</p>
                      </div>
                      <div className="px-4 pb-4 flex flex-wrap gap-3">
                        {/* "+" — opens upload modal */}
                        <button
                          onClick={() => {
                            if (logoUrl && design.productIds.length > 0) {
                              setLogoConfirm({ type: 'new' });
                            } else {
                              setLogoDropdownOpen(false);
                              setLogoModalOpen(true);
                            }
                          }}
                          className="w-14 h-14 rounded-[10px] flex items-center justify-center hover:bg-snp-indigo-50 transition-colors"
                          style={{ border: '1.5px dashed #97bbe4', background: '#fbfcfe' }}
                          title="Add new logo"
                        >
                          <Plus className="w-5 h-5 text-snp-indigo-500" />
                        </button>
                        {/* Existing logos */}
                        {allBrandSets.filter(bs => bs.logoUrl).map(bs => {
                          const isActive = bs.logoUrl === logoUrl;
                          return (
                            <div key={bs.id} className="relative group">
                              <button
                                onClick={() => {
                                  if (isActive) { setLogoDropdownOpen(false); return; }
                                  if (logoUrl && design.productIds.length > 0) {
                                    setLogoConfirm({ type: 'switch', brandSetId: bs.id, logoUrl: bs.logoUrl! });
                                  } else {
                                    activateBrandSet(bs.id);
                                    if (id && bs.logoUrl) updateLookbook(id, { logoUrl: bs.logoUrl });
                                    setLogoDropdownOpen(false);
                                  }
                                }}
                                className="w-14 h-14 rounded-[10px] flex items-center justify-center p-1.5 transition-all"
                                style={{
                                  border: isActive ? '1.5px solid #3077c9' : '1.5px solid #e0ebf7',
                                  boxShadow: isActive ? '0px 4px 8px rgba(48,119,201,0.16)' : 'none',
                                }}
                              >
                                <img src={bs.logoUrl!} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} onError={e => (e.currentTarget.style.display = 'none')} />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); deleteBrandSet(bs.id); }}
                                title="Remove"
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-snp-navy-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-snp-navy-700"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* ── Product grid ─────────────────────────────────────────────────── */}
          <div className="flex-1 max-w-[1440px] mx-auto w-full px-12 py-8">
            {design.productIds.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-[20px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)' }}
                >
                  <Package className="w-8 h-8" style={{ color: '#3077c9' }} />
                </div>
                <div>
                  <p className="text-[18px] font-semibold text-snp-navy-800 mb-1">Your design is empty</p>
                  <p className="text-[14px] text-snp-navy-500">Add products to start building your design</p>
                </div>
                <Button
                  size="lg"
                  onClick={() => setPickerOpen(true)}
                  iconLeft={<Plus className="w-4 h-4" />}
                >
                  Add Products
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl mb-4">🎁</span>
                <p className="text-[16px] font-semibold text-snp-navy-700 mb-1">No items in this budget range</p>
                <p className="text-[13px] text-snp-navy-500">Try a higher budget to see more options</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-5">
                {products.map(product => {
                  const isPhoto = product.image.startsWith('/');
                  const hasPrintArea = isPhoto && !!product.printArea;
                  const showOverlay = hasPrintArea && !!logoUrl && !isApplying;
                  const issueLabel = getProductIssueLabel(product.id);
                  const hasQualityIssue = issueLabel !== null;
                  const chip = PRINT_TECHNIQUE_CHIPS[product.printTechnique];
                  const isBulk = product.type === 'bulk';
                  const isNewSincePublish = isPublished && !publishState!.snapshot.productIds.includes(product.id);
                  const productDesignState = id ? getProductDesign(id, product.id) : null;
                  const isDesignUpdatedSincePublish = isPublished && !!productDesignState?.savedAt &&
                    new Date(productDesignState.savedAt) > new Date(publishState!.publishedAt);

                  return (
                    <div key={product.id} className="flex flex-col gap-3">

                      {/* Image container */}
                      <div
                        className="relative bg-[#f5f8fc] rounded-[16px] overflow-hidden cursor-pointer group"
                        style={{ border: isNewSincePublish ? '1.5px solid #22c55e' : isDesignUpdatedSincePublish ? '1.5px solid #93c5fd' : hasQualityIssue ? '1.5px solid #fbbf24' : '1.5px solid transparent' }}
                        onClick={() => navigate(`/product/${product.id}`, { state: { backgroundLocation: location } })}
                      >
                        {/* Image area */}
                        <div className="relative flex items-center justify-center py-20 px-8">
                          {isPhoto ? (
                            <div className="relative w-[200px] h-[186px]">
                              <div className="absolute inset-0 bg-white rounded" />
                              <img
                                src={product.image}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                              {showOverlay && product.printArea && (
                                product.printArea.style === 'badge' ? (
                                  <div
                                    className="absolute pointer-events-none flex items-center justify-center rounded-xl bg-white/85 shadow-sm p-1.5"
                                    style={{ left: `${product.printArea.x}%`, top: `${product.printArea.y}%`, width: `${product.printArea.width}%`, height: `${product.printArea.height}%` }}
                                  >
                                    <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                                  </div>
                                ) : (
                                  <img
                                    src={logoUrl} alt=""
                                    className="absolute pointer-events-none object-contain"
                                    style={{ left: `${product.printArea.x}%`, top: `${product.printArea.y}%`, width: `${product.printArea.width}%`, height: `${product.printArea.height}%`, mixBlendMode: 'multiply', opacity: 0.88 }}
                                  />
                                )
                              )}
                              {!hasPrintArea && !!logoUrl && !isApplying && (
                                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-[8px] bg-white shadow-[0px_2px_8px_0px_rgba(1,39,84,0.12)] border border-[#e0ebf7] flex items-center justify-center overflow-hidden">
                                  <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[80px] group-hover:scale-105 transition-transform duration-300 inline-block">
                              {product.image}
                            </span>
                          )}

                          {isApplying && (
                            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                              <div className="absolute inset-0 bg-[#eef4ff]" />
                              <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'product-card-shimmer 1.2s ease-in-out infinite' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Print technique chip — top left */}
                        {chip && (
                          <span
                            className="absolute top-2 left-2 text-[11px] font-bold px-2 py-1.5 rounded-[8px] uppercase"
                            style={{ backgroundColor: '#eef4ff', color: '#2864a8' }}
                          >
                            {chip.label}
                          </span>
                        )}

                        {/* Trash button — top right, always visible */}
                        <button
                          onClick={e => { e.stopPropagation(); if (id) removeProduct(id, product.id); }}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-[#e0ebf7] flex items-center justify-center text-snp-navy-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Bottom-left badges */}
                        {(issueLabel || isNewSincePublish || isDesignUpdatedSincePublish) && (
                          <div className="absolute bottom-2.5 left-2.5 flex flex-col gap-1 items-start">
                            {issueLabel && (
                              <div
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: '#fff8ec', color: '#b45309', border: '1px solid #fbbf24' }}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {issueLabel}
                              </div>
                            )}
                            {isNewSincePublish && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-green-700 bg-green-50 border border-green-200">
                                New
                              </div>
                            )}
                            {isDesignUpdatedSincePublish && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200">
                                <Pencil className="w-3 h-3" />
                                Unpublished changes
                              </div>
                            )}
                          </div>
                        )}

                        {/* Order type — bottom right */}
                        <div className="absolute bottom-2.5 right-2.5">
                          {isBulk ? (
                            <span className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest">Bulk Order</span>
                          ) : (
                            <div className="bg-[#f5f8fc] border border-[#e0ebf7] rounded-[6px] px-1.5 py-0.5">
                              <span className="text-[9px] font-bold text-[#59728f] uppercase tracking-wide">On demand</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product info */}
                      <div className="flex flex-col gap-0.5 px-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-snp-navy-400 truncate">{product.brand}</span>
                        <span className="text-[14px] text-snp-navy-800 leading-snug line-clamp-2">{product.name}</span>
                        <span className="text-[14px] font-medium text-snp-navy-950 mt-0.5">${product.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
