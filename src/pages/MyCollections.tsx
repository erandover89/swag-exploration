import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { MY_COLLECTIONS, PRODUCTS, type MyCollection } from '../data/mockData';
import { useLookbooks } from '../context/LookbookContext';
import { SwagPageHeader, YourSwagSidebar } from './SwagOverview';
import { Button } from '../components/Button';

// ── Shared hook: read all collections from publish state in localStorage ──────

export function useAllCollections(): MyCollection[] {
  const { lookbooks } = useLookbooks();
  return useMemo((): MyCollection[] => {
    const result: MyCollection[] = [...MY_COLLECTIONS];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('snappy_publish_')) continue;
      const lookbookId = key.replace('snappy_publish_', '');
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const state = JSON.parse(raw) as {
          publishedAt: string;
          snapshot: { productIds: string[] };
          connections: { collections: { id: string; name: string; sentCount: number; syncedAt: string }[] };
        };
        const lb = lookbooks.find(l => l.id === lookbookId);
        const productIds = lb?.productIds ?? state.snapshot.productIds ?? [];
        state.connections.collections.forEach(col => {
          result.push({
            id: col.id,
            name: col.name,
            type: 'swag-only',
            productIds,
            itemCount: productIds.length,
            recipientCount: col.sentCount,
            lastSentAt: col.sentCount > 0 ? col.syncedAt : null,
            createdAt: state.publishedAt,
          });
        });
      } catch { /* skip malformed entries */ }
    }
    return result;
  }, [lookbooks]);
}

// ── Collection card fan banner ─────────────────────────────────────────────────

function CollectionBanner({ productIds }: { productIds: string[] }) {
  const fanItems = [0, 1, 2, 3].map(i => {
    const id = productIds[i];
    return id ? PRODUCTS.find(p => p.id === id) ?? null : null;
  });

  const rotations = [-20, -8, 8, 20];

  return (
    <div className="relative h-[100px] bg-[#f5f8fc] rounded-[16px] overflow-hidden shrink-0">
      <div
        className="absolute bottom-[-18px] left-1/2 flex items-end"
        style={{ transform: 'translateX(-50%)' }}
      >
        {rotations.map((rotate, i) => {
          const p = fanItems[i];
          return (
            <div key={i} style={{ marginRight: i < 3 ? -40 : 0, flexShrink: 0 }}>
              <div
                className="w-[80px] h-[98px] bg-white border border-[#e0ebf7] rounded-[10px] overflow-hidden"
                style={{
                  transform: `rotate(${rotate}deg)`,
                  transformOrigin: 'bottom center',
                  boxShadow: '-8px 4px 12px rgba(89,114,143,0.10)',
                }}
              >
                {p?.image.startsWith('/') ? (
                  <img
                    src={p.image}
                    alt=""
                    className="w-full h-full object-contain p-1.5"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                ) : p ? (
                  <div className="w-full h-full flex items-center justify-center text-xl">{p.image}</div>
                ) : (
                  <div className="w-full h-full bg-[#f5f8fc]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Collection card ────────────────────────────────────────────────────────────

export function CollectionCard({ col }: { col: MyCollection }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white border border-[#e0ebf7] rounded-[24px] overflow-hidden shadow-[0px_12px_8px_rgba(125,146,169,0.08)] hover:shadow-[0px_16px_24px_rgba(1,39,84,0.10)] transition-all cursor-pointer"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      onClick={() => navigate('/collection/preview', { state: { productIds: col.productIds, collectionName: col.name } })}
    >
      <div className="flex flex-col gap-2 pt-2 px-2 pb-4">

        {/* Banner */}
        <CollectionBanner productIds={col.productIds} />

        {/* Footer */}
        <div className="flex flex-col gap-4 px-3">

          {/* Title + description */}
          <div className="flex flex-col gap-2">
            <div className="h-12 flex items-center overflow-hidden">
              <p className="text-[16px] font-medium text-[#012754] truncate w-full">{col.name}</p>
            </div>
            <p className="text-[12px] text-[#8093a9] leading-relaxed">
              {col.itemCount} item{col.itemCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Type + count pill */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8093a9] uppercase tracking-wide">
              {col.type === 'mixed' ? 'Mixed' : 'Swag Only'}
            </span>
            <div className="bg-[#f5f8fc] h-8 px-3 rounded-full flex items-center justify-center">
              <span className="text-[12px] font-bold text-[#2864a8]">{col.itemCount} items</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function MyCollections() {
  const navigate = useNavigate();
  const location = useLocation();
  const allCollections = useAllCollections();

  return (
    <div className="min-h-screen bg-[#fafcff]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SwagPageHeader activeTab="your-swag" />

      <div className="max-w-[1400px] mx-auto px-4 md:pl-[80px] md:pr-[40px] pt-8 pb-16">
        <div className="flex gap-8">
          <YourSwagSidebar active="collections" />
          <div className="flex-1">

            {/* Header row */}
            <div className="flex items-end justify-between mb-7">
              <div>
                <h2 className="text-[22px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  My Collections
                </h2>
                <p className="text-[14px] text-snp-navy-500 mt-1">Bundle products into a gift set and send to recipients 🎁</p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/collection/edit', { state: { productIds: [], from: location.pathname } })}
                iconLeft={<Plus className="w-4 h-4" />}
              >
                New Collection
              </Button>
            </div>

            {/* Grid */}
            {allCollections.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-[20px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)' }}
                >
                  <FolderOpen className="w-8 h-8" style={{ color: '#3077c9' }} />
                </div>
                <div>
                  <p className="text-[18px] font-semibold text-snp-navy-800 mb-1">No collections yet</p>
                  <p className="text-[14px] text-snp-navy-500">Create a design and publish it as a gift collection</p>
                </div>
                <Button size="lg" onClick={() => navigate('/collection/edit', { state: { productIds: [], from: location.pathname } })} iconLeft={<Plus className="w-4 h-4" />}>
                  Create your first collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {allCollections.map(col => (
                  <CollectionCard key={col.id} col={col} />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
