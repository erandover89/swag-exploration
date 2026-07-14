# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **frontend-only demo prototype** of the Snappy swag/gifting platform, currently centered on the **Stores experience for the SanMar RFP** (see [STORES.md](STORES.md) for the demo script and RFP requirement mapping). A distributor (SanMar's customer) creates, brands, prices, and runs ecommerce storefronts for *their* customers, marking items up on top of SanMar cost.

There is no backend. All data is seeded from `src/data/*.ts` and persisted to `localStorage` under `snappy_*` keys. The "↺ Reset all" pill (bottom-right of admin pages) clears those keys and reseeds.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (typecheck + build — run this to verify types)
npm run lint      # eslint .
npm run preview   # serve the production build
```

There are no tests. `npm run build` is the correctness check.

Stack: React 19, TypeScript, Vite 7, Tailwind CSS v4 (via `@tailwindcss/vite`, no tailwind.config), react-router-dom v7, react-konva (design canvas), lucide-react. Deployed on Vercel as an SPA (`vercel.json` rewrites everything to `index.html`).

## Two product surfaces

The app is really two products in one router ([src/App.tsx](src/App.tsx)):

1. **Snappy admin app** — everything the distributor/company user sees (catalog, designs, collections, send flow, stores console). Wrapped in `TopBar` + `MainNav` chrome.
2. **Consumer storefronts** — `/store/:slug/*` renders [StorefrontShell](src/storefront/StorefrontShell.tsx), a completely separate consumer product per store with its own header/footer/cart, nested routes (`index`, `shop`, `p/:pid`, `checkout`, `confirmed`), passcode gate, and per-store theming. No Snappy chrome, and even the dev reset pill is hidden.

`AppShell` in App.tsx controls this via `hideBars` (path-prefix checks) — add new full-bleed routes there. It also implements a `backgroundLocation` overlay-route pattern (modal routes rendered on top of the previous page) for `/items/saved` and `/product/:id`.

## Stores architecture (the current focus)

Route flow: `/stores` (console) → `/stores/new` (4-step wizard) → `/stores/:id` (manager) → `/store/:slug` (public storefront).

- **[src/data/storesData.ts](src/data/storesData.ts)** — the single source of truth for the Stores domain: `DistributorStore` type (incl. discount codes, users, SEO, footer content, banner, per-product customizations, catalog layout), `STORE_THEMES` (+ per-store `customTheme`), `STYLE_CODES`, the **pricing engine**, `SEED_STORES` (key demos: `ridgeline-united` [discount codes, users, banner], `northgate-hvac` [email-list gate], `summit-credit-union` [passcode `SUMMIT26`]), and `CATALOG_TEMPLATES` for the wizard. **`normalizeStore()`** ??-fills newer fields — every new `DistributorStore` field must be added there so stale localStorage data keeps working; never bump the LS key.
- **[src/context/StoresContext.tsx](src/context/StoresContext.tsx)** — `useStores()` CRUD over the store list, persisted to `localStorage['snappy_distributor_stores_v1']` (parsed data runs through `normalizeStore`). `getStore()` accepts id **or** slug. `updateStore` accepts a patch object or `(store) => patch` function and stamps `updatedAt`.
- **[src/pages/stores/](src/pages/stores)** — `StoresConsole` (KPIs, search/filter/sort, bulk actions), `StoreCreateWizard` (logo palette → color recommendations via [src/utils/logoColors.ts](src/utils/logoColors.ts), banner upload), `StoreManager` shell; the tabs (Overview / Products / Pricing / Design / Orders / Users / Settings) live in **[src/pages/stores/manager/](src/pages/stores/manager)**. `ProductsTab` has search/filters/DnD ordering/grouping; `ProductEditor` embeds the Konva `DesignToolPage` — per-(store, product) artwork persists through `LookbookContext` under the synthetic lookbook id **`store:${storeId}`**, with shopper constraints (locked/editable/removable per layer) in `store.productCustomizations`.
- **[src/storefront/](src/storefront)** — the shopper experience. Cart state lives in `StorefrontShell` and is shared via `useSf()` (also shopper identity, applied discount code, shipping method, `placeShopperOrder`). Order history persists to `localStorage['sf_orders_${slug}']` ([shopperData.ts](src/storefront/shopperData.ts) — status is *derived* from `placedAt` age) and mirrors a summary row into `store.orders`. `StorefrontCustomizer` is the constrained shopper editor (reuses `useDesignEditor` + `DesignCanvas`, not `DesignToolPage`).

### Pricing model — always use the engine

Money flows: Snappy all-in cost (one set price for every distributor) → distributor markup → store retail → volume tiers → member/user discount → discount code → shipping. Never compute prices inline; use the helpers in storesData.ts: `baseCost`, `retailPrice`, `unitMargin`, `tierFor`/`tierPrice`, `priceBreakdown` (Garment + Decoration display split), `userDiscountPctFor`, `validateDiscount`, **`computeCartTotals`** (the one composition path for cart math), `fmtMoney`, and `storeProducts`/`visibleProducts`/`storeCategories` for catalog resolution.

### Theming

Storefronts are themed entirely from data: `getTheme(store.themeId)` returns a `StoreTheme` whose colors/fonts/radius are applied as inline styles inside the storefront components. New themes go in `STORE_THEMES`; don't hardcode storefront colors in components.

## Legacy swag surface (still routed, less active)

Catalog/designs/collections/send flows live in `src/pages/` with data from [src/data/mockData.ts](src/data/mockData.ts) (`PRODUCTS`, `MY_DESIGNS`, etc.). Product images come from `/public/products/` — always reference `PRODUCTS[].image`, never hardcode paths. The Konva-based design editor is `src/pages/designTool/` (newer) and `SwagDesignTool.tsx` (older). Context providers: `CompanyLogoContext` (uploaded logo, triggers the branding overlay), `LookbookContext`, `UserDesignsContext`/`DesignsContext`.

`SwagOverview.tsx` is the landing page (`/`). `/flows` renders a directory of every prototype flow — useful for finding your way around.

## Styling conventions (admin app)

- Fonts: DM Sans (body), Clash Display (headings). Brand navy `#012754`, brand blue `#3077c9`, accent cyan `#36d4ff`.
- Cards: `rounded-[16px]`/`rounded-[20px]`, `border-[#e0ebf7]`, shadow `0px_4px_8px_0px_rgba(1,39,84,0.08)`, hover lift `translateY(-4px)`.
- Primary buttons: h-11/h-12, gradient `linear-gradient(180deg, #5992d4 0%, #3077c9 100%)`.
- Storefronts deliberately do **not** follow these — they follow their `StoreTheme`.

## Reference docs

- [STORES.md](STORES.md) — Stores demo script + RFP requirement IDs (RFP-004, -022/032/033/034, -023, -028, -045, -052)
- [PRD.md](PRD.md) — full PRD for the swag surface (routes, flows, data model)
- [ANALYTICS.md](ANALYTICS.md) — event taxonomy spec (not wired up in code)
- [NEXTSTEPS.md](NEXTSTEPS.md) — iteration roadmap / open ideas
