import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeKind = 'entry' | 'screen' | 'action' | 'decision' | 'outcome' | 'gate';

interface FlowNode {
  kind: NodeKind;
  label: string;
  sublabel?: string;
}

interface Branch {
  label: string;
  nodes: FlowNode[];
}

// A flow item is either a single node, or a branch split (multiple parallel paths)
type FlowItem =
  | { type: 'node'; node: FlowNode }
  | { type: 'branch'; branches: Branch[] };

interface FlowChart {
  id: string;
  title: string;
  description: string;
  category: 'creation' | 'managing';
  items: FlowItem[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const FLOWS: FlowChart[] = [
  {
    id: 'theme',
    title: 'Create a Design from a Theme',
    description: 'Starting from Discover — handles both first-time users (no logo) and returning users.',
    category: 'creation',
    items: [
      { type: 'node', node: { kind: 'entry',   label: 'Discover Page',           sublabel: '/swag' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Upload logo first',
            nodes: [
              { kind: 'action',  label: 'Upload logo',       sublabel: 'Domain fetch or file upload' },
              { kind: 'gate',    label: 'Logo ready',        sublabel: 'Compact hero card shown' },
            ],
          },
          {
            label: 'Explore first',
            nodes: [
              { kind: 'gate',    label: 'No logo yet',       sublabel: 'Can add later' },
            ],
          },
        ],
      },
      { type: 'node', node: { kind: 'action',  label: 'Click a Curated Design',  sublabel: 'Theme carousel on Discover' } },
      { type: 'node', node: { kind: 'screen',  label: 'Design Workspace',        sublabel: '/designs/:id — Draft' } },
      { type: 'node', node: { kind: 'gate',    label: 'Logo required',           sublabel: 'Upload prompt shown if missing' } },
      { type: 'node', node: { kind: 'action',  label: 'Add & review products',   sublabel: 'Product picker drawer' } },
      { type: 'node', node: { kind: 'action',  label: 'Click "Save & Send"',     sublabel: 'Header CTA' } },
      { type: 'node', node: { kind: 'screen',  label: 'Preparing Loader',        sublabel: 'Async product generation' } },
      { type: 'node', node: { kind: 'gate',    label: 'Your design is ready 🎉', sublabel: 'Status → Active' } },
      {
        type: 'branch',
        branches: [
          { label: 'Swag Collection',  nodes: [{ kind: 'outcome', label: 'Gift Collection',  sublabel: 'Recipients pick items' }] },
          { label: 'Mixed Collection', nodes: [{ kind: 'outcome', label: 'Mixed Collection', sublabel: 'Swag + marketplace gifts' }] },
          { label: 'Single Item',      nodes: [{ kind: 'outcome', label: 'Send Flow',         sublabel: '/send' }] },
          { label: 'Store',            nodes: [{ kind: 'outcome', label: 'Storefront',        sublabel: 'Essentials plan only' }] },
        ],
      },
    ],
  },

  {
    id: 'catalog',
    title: 'Design a Product from the Catalog',
    description: 'User browses the catalog, customizes a product in the design tool, and saves it to a design.',
    category: 'creation',
    items: [
      { type: 'node', node: { kind: 'entry',   label: 'Catalog',                sublabel: '/catalog' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Upload logo first',
            nodes: [
              { kind: 'action', label: 'Upload logo',   sublabel: 'Domain fetch or file upload' },
              { kind: 'gate',   label: 'Logo ready',    sublabel: 'Compact hero card shown' },
            ],
          },
          {
            label: 'Explore first',
            nodes: [
              { kind: 'gate',   label: 'No logo yet',  sublabel: 'Can add in design tool' },
            ],
          },
        ],
      },
      { type: 'node', node: { kind: 'action',  label: 'Click product card' } },
      { type: 'node', node: { kind: 'screen',  label: 'Product Detail',         sublabel: '/product/:id — modal overlay' } },
      { type: 'node', node: { kind: 'action',  label: '"Customize & design"' } },
      { type: 'node', node: { kind: 'screen',  label: 'Design Tool',            sublabel: '/design/:id — Konva canvas' } },
      { type: 'node', node: { kind: 'gate',    label: 'Logo required',          sublabel: 'Upload prompt shown if missing' } },
      { type: 'node', node: { kind: 'action',  label: 'Edit layers, place logo' } },
      { type: 'node', node: { kind: 'action',  label: 'Save item' } },
      { type: 'node', node: { kind: 'decision', label: 'Add to which design?' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Existing design',
            nodes: [
              { kind: 'gate',   label: 'Pick a design',         sublabel: 'From saved designs list' },
            ],
          },
          {
            label: 'New design',
            nodes: [
              { kind: 'action', label: 'Name the design',       sublabel: 'Creates a new workspace' },
            ],
          },
        ],
      },
      { type: 'node', node: { kind: 'screen',  label: 'Design Workspace',       sublabel: '/designs/:id' } },
      { type: 'node', node: { kind: 'gate',    label: 'Product saved modal',    sublabel: 'Overlay on workspace' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Customize',
            nodes: [{ kind: 'outcome', label: 'Back to Design Tool', sublabel: 'Modal closes' }],
          },
          {
            label: 'Send as a gift',
            nodes: [{ kind: 'outcome', label: 'Send Flow', sublabel: '/send' }],
          },
          {
            label: 'Add to collection',
            nodes: [
              { kind: 'outcome', label: 'Existing collection', sublabel: 'Pick from saved list' },
              { kind: 'outcome', label: 'New collection',      sublabel: 'BYOC → /collection/new' },
            ],
          },
          {
            label: 'Add to store',
            nodes: [{ kind: 'gate', label: 'Essentials only', sublabel: 'Upsell shown for free plan' }],
          },
        ],
      },
    ],
  },

  {
    id: 'republish',
    title: 'Edit & Re-publish an Active Design',
    description: 'A design is already Active (published). User edits it and pushes the update to connected channels.',
    category: 'managing',
    items: [
      { type: 'node', node: { kind: 'entry',   label: 'Design Workspace',       sublabel: 'Status: Active' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Edit design',
            nodes: [{ kind: 'action', label: 'Open Design Tool',     sublabel: 'Edit layers, artwork, logo' }],
          },
          {
            label: 'Add products',
            nodes: [{ kind: 'action', label: 'Product picker',       sublabel: 'Add from catalog' }],
          },
          {
            label: 'Remove / replace',
            nodes: [{ kind: 'action', label: 'Remove product',       sublabel: 'Or replace logo' }],
          },
        ],
      },
      { type: 'node', node: { kind: 'gate',    label: 'Unsaved changes detected', sublabel: 'Orange dot on "Publish changes"' } },
      { type: 'node', node: { kind: 'action',  label: 'Click "Publish changes"' } },
      { type: 'node', node: { kind: 'screen',  label: 'Publish Changes Modal',  sublabel: 'Diff summary + connected entities' } },
      { type: 'node', node: { kind: 'decision', label: 'Push now?' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Push update',
            nodes: [{ kind: 'outcome', label: 'Entities synced',    sublabel: 'Snapshot updated, dot clears' }],
          },
          {
            label: 'Not now',
            nodes: [{ kind: 'gate',    label: 'Modal closes',       sublabel: 'Orange dot remains' }],
          },
        ],
      },
    ],
  },

  {
    id: 'blank',
    title: 'Create a Design from Scratch',
    description: 'Starting from My Designs — opens a blank workspace to build a design by adding products manually.',
    category: 'creation',
    items: [
      { type: 'node', node: { kind: 'entry',   label: 'My Designs',             sublabel: '/designs' } },
      { type: 'node', node: { kind: 'action',  label: 'Click "Create a design"' } },
      { type: 'node', node: { kind: 'screen',  label: 'Design Workspace',       sublabel: '/designs/:id — empty Draft' } },
      { type: 'node', node: { kind: 'gate',    label: 'Logo required',          sublabel: 'Upload prompt shown if missing' } },
      { type: 'node', node: { kind: 'action',  label: 'Add products',           sublabel: 'Product picker drawer' } },
      { type: 'node', node: { kind: 'action',  label: 'Click "Save & Send"',    sublabel: 'Header CTA' } },
      { type: 'node', node: { kind: 'screen',  label: 'Preparing Loader',       sublabel: 'Async product generation' } },
      { type: 'node', node: { kind: 'gate',    label: 'Your design is ready 🎉', sublabel: 'Status → Active' } },
      {
        type: 'branch',
        branches: [
          { label: 'Swag Collection',  nodes: [{ kind: 'outcome', label: 'Gift Collection',   sublabel: 'Recipients pick items' }] },
          { label: 'Mixed Collection', nodes: [{ kind: 'outcome', label: 'Mixed Collection',  sublabel: 'Swag + marketplace gifts' }] },
          { label: 'Single Item',      nodes: [{ kind: 'outcome', label: 'Send Flow',          sublabel: '/send' }] },
          { label: 'Store',            nodes: [{ kind: 'outcome', label: 'Storefront',         sublabel: 'Essentials plan only' }] },
        ],
      },
    ],
  },

  {
    id: 'manage',
    title: 'Manage Designs',
    description: 'Actions available on saved designs from the My Designs page.',
    category: 'managing',
    items: [
      { type: 'node', node: { kind: 'entry',   label: 'My Designs',             sublabel: '/designs — grid of cards' } },
      {
        type: 'branch',
        branches: [
          {
            label: 'Open',
            nodes: [
              { kind: 'screen',  label: 'Design Workspace',   sublabel: '/designs/:id' },
              { kind: 'outcome', label: 'Edit or distribute' },
            ],
          },
          {
            label: 'Duplicate',
            nodes: [
              { kind: 'gate',    label: 'Card: "In creation"', sublabel: 'Non-blocking ~30s state' },
              { kind: 'screen',  label: 'User continues',      sublabel: 'App unblocked' },
              { kind: 'outcome', label: 'Card ready',          sublabel: 'New Draft replaces spinner' },
            ],
          },
          {
            label: 'Delete',
            nodes: [
              { kind: 'gate',    label: 'Confirm delete',     sublabel: 'Destructive action' },
              { kind: 'outcome', label: 'Design removed' },
            ],
          },
        ],
      },
    ],
  },
];

// ── Node styles ───────────────────────────────────────────────────────────────

function nodeStyles(kind: NodeKind): { bg: string; border: string; text: string; radius: string } {
  switch (kind) {
    case 'entry':    return { bg: '#eef4ff', border: '#c7dcf5', text: '#2864a8', radius: '999px' };
    case 'screen':   return { bg: '#ffffff', border: '#d6e4f4', text: '#012754', radius: '10px' };
    case 'action':   return { bg: '#fafcff', border: '#c8d8ea', text: '#344f6d', radius: '8px' };
    case 'decision': return { bg: '#fff7ed', border: '#fcd9a8', text: '#92400e', radius: '8px' };
    case 'outcome':  return { bg: '#effbf5', border: '#d6f5e7', text: '#006644', radius: '999px' };
    case 'gate':     return { bg: '#f5f0ff', border: '#ddd0f5', text: '#5b21b6', radius: '8px' };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Arrow({ dim = false }: { dim?: boolean }) {
  return (
    <div className="flex justify-center" style={{ height: 28 }}>
      <div className="flex flex-col items-center gap-0">
        <div style={{ width: 1.5, height: 18, backgroundColor: dim ? '#dce4ee' : '#b0c2d4' }} />
        <div style={{
          width: 0, height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `5px solid ${dim ? '#dce4ee' : '#b0c2d4'}`,
        }} />
      </div>
    </div>
  );
}

function Node({ node }: { node: FlowNode }) {
  const s = nodeStyles(node.kind);
  const isDiamond = node.kind === 'decision';

  if (isDiamond) {
    return (
      <div className="flex justify-center my-1">
        <div className="relative flex items-center justify-center" style={{ width: 130, height: 70 }}>
          <div
            className="absolute"
            style={{
              width: 58, height: 58,
              transform: 'rotate(45deg)',
              backgroundColor: s.bg,
              border: `1.5px solid ${s.border}`,
              borderRadius: 5,
            }}
          />
          <span
            className="relative z-10 text-center leading-tight px-1"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: s.text, maxWidth: 90 }}
          >
            {node.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div
        className="flex flex-col items-center text-center px-4 py-2.5"
        style={{
          backgroundColor: s.bg,
          border: `1.5px solid ${s.border}`,
          borderRadius: s.radius,
          minWidth: 160,
          maxWidth: 220,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: s.text, lineHeight: 1.3 }}>{node.label}</span>
        {node.sublabel && (
          <span style={{ fontSize: 10, color: '#8093a9', marginTop: 2, lineHeight: 1.3 }}>{node.sublabel}</span>
        )}
      </div>
    </div>
  );
}

function BranchSplit({ branches }: { branches: Branch[] }) {
  return (
    <div className="flex justify-center">
      <div className="flex items-start gap-3">
        {branches.map((branch, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Branch label */}
            <div className="flex flex-col items-center" style={{ height: 28 }}>
              <div style={{ width: 1.5, height: 10, backgroundColor: '#b0c2d4' }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: '#8093a9',
                backgroundColor: '#ffffff',
                padding: '0 4px',
                border: '1px solid #e0ebf7',
                borderRadius: 4,
                whiteSpace: 'nowrap',
              }}>
                {branch.label}
              </span>
            </div>
            {/* Branch nodes */}
            {branch.nodes.map((node, j) => (
              <div key={j} className="flex flex-col items-center">
                {j > 0 && <Arrow dim />}
                <Node node={node} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowDiagram({ flow }: { flow: FlowChart }) {
  return (
    <div
      className="rounded-[20px] border border-[#e0ebf7] bg-[#fafcff] p-8"
      style={{ boxShadow: '0px 2px 8px rgba(1,39,84,0.04)' }}
    >
      {/* Flow title + description */}
      <div className="mb-7">
        <h2
          className="text-[17px] font-semibold text-[#012754] mb-1"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {flow.title}
        </h2>
        <p className="text-[12px] text-[#59728f] leading-relaxed">{flow.description}</p>
      </div>

      {/* Diagram */}
      <div className="flex flex-col items-center">
        {flow.items.map((item, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            {i > 0 && item.type === 'node' && <Arrow />}
            {item.type === 'node'
              ? <Node node={item.node} />
              : (
                <>
                  <Arrow />
                  <BranchSplit branches={item.branches} />
                </>
              )
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

// ── Page ──────────────────────────────────────────────────────────────────────

export function FlowsPage() {
  const [activeId, setActiveId] = useState(FLOWS[0].id);
  const activeFlow = FLOWS.find(f => f.id === activeId)!;

  return (
    <div className="min-h-screen bg-[#f5f8fc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-[840px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-bold text-[#8093a9] uppercase tracking-widest">Dev reference</span>
            <Link to="/" className="text-[11px] text-[#8093a9] hover:text-[#3077c9] transition-colors">← Back to prototype</Link>
          </div>
          <h1
            className="text-[28px] font-semibold text-[#012754] mb-1"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Creation & Management Flows
          </h1>
          <p className="text-[13px] text-[#59728f] max-w-[540px] leading-relaxed">
            Core user journeys for creating, designing, and managing swag — including decision branches and state transitions.
          </p>
        </div>

        {/* Flow switcher */}
        <div className="flex flex-col gap-3 mb-6">
          {(['creation', 'managing'] as const).map(cat => (
            <div key={cat} className="flex items-center gap-2 flex-wrap">
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: '#8093a9',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                minWidth: 64,
              }}>
                {cat === 'creation' ? 'Creation' : 'Managing'}
              </span>
              {FLOWS.filter(f => f.category === cat).map(flow => (
                <button
                  key={flow.id}
                  onClick={() => setActiveId(flow.id)}
                  className="transition-all"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${activeId === flow.id ? '#3077c9' : '#d6e4f4'}`,
                    backgroundColor: activeId === flow.id ? '#3077c9' : '#ffffff',
                    color: activeId === flow.id ? '#ffffff' : '#59728f',
                    cursor: 'pointer',
                  }}
                >
                  {flow.title}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Active flow diagram */}
        <FlowDiagram flow={activeFlow} />

      </div>
    </div>
  );
}
