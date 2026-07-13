# Snappy Stores — SanMar Distributor Demo

Demo of the full Stores journey for the SanMar RFP: a **distributor** (SanMar's customer)
creates, brands, prices and runs ecommerce storefronts for **their** customers
(sports leagues, cafes, companies), marking up items on top of SanMar cost.

## Demo script

1. **Console — `/stores`** — centralized administration (RFP-004): KPIs across the book of
   business, search/filter/sort, bulk publish/pause/rebrand, duplicate-as-template, archive.
2. **Create — `/stores/new`** — 4-step wizard: customer → logos (multi-upload, brand-color
   extraction) → catalog (templates + *manual* brand/category/garment-color control, per the
   demo doc MUSTs) → theme + markup. Generation animation → lands in the manager.
3. **Manage — `/stores/:id`** — Overview (sales/margin/orders), Products (curate, feature,
   hide), **Pricing & markup** (global %, per-item overrides, volume tiers — RFP-022/032/033/034),
   Design (theme, logos, hero copy, live preview), Orders (routed to SanMar under the
   distributor account — RFP-052), Settings (public/passcode, card/points/mixed payment,
   bulk-ordering + logo-picker toggles). Publish/pause from the header.
4. **Shop — `/store/:slug`** — a completely separate consumer product per store:
   - `ridgeline-united` — dark athletic team store (Team Sports MUST)
   - `meridian-marketing` — sleek corporate/marketing store (Marketing MUST)
   - `driftwood-coffee` — warm artisan cafe store
   - `summit-credit-union` — passcode-gated, points-paid store (code: SUMMIT26)

   Search + faceted filtering (RFP-045), PDP with composited logo preview (RFP-028),
   shopper logo picker (RFP-023), tiered "buy more save more" pricing (RFP-034),
   bulk size-grid ordering (demo doc Example A), cart with dynamic volume discount,
   credit-card checkout, confirmation with production timeline.

State persists in localStorage — use the "Reset all" pill (bottom right of admin pages) to reseed.

## Run

```bash
npm install
npm run dev
```
