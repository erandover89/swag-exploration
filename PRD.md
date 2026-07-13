# Product Requirements Document: Snappy Swag Dashboard

**Version:** Current Prototype
**Date:** June 2026
**Status:** Reflects implemented prototype state

---

## Table of Contents

1. [Overview and Motivation](#1-overview-and-motivation)
2. [Core Mental Model and Terminology](#2-core-mental-model-and-terminology)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Feature Sections](#4-feature-sections)
   - 4.1 [Discover (/swag)](#41-discover-swag)
   - 4.2 [My Designs (/designs)](#42-my-designs-designs)
   - 4.3 [Design Workspace (/designs/:id)](#43-design-workspace-designid)
   - 4.4 [Catalog (/catalog)](#44-catalog-catalog)
   - 4.5 [Product Detail (/product/:id)](#45-product-detail-productid)
   - 4.6 [Design Tool (/design/:id)](#46-design-tool-designid)
   - 4.7 [Collection Preview (/collection/preview)](#47-collection-preview-collectionpreview)
   - 4.8 [My Collections (/my-collections)](#48-my-collections-my-collections)
5. [Data Model](#5-data-model)
6. [Key Flows](#6-key-flows)
   - 6.1 [Quick Start: Logo Upload](#61-quick-start-logo-upload)
   - 6.2 [Start from a Design Template](#62-start-from-a-design-template)
   - 6.3 [Create a New Blank Design](#63-create-a-new-blank-design)
   - 6.4 [Send as a Gift Collection](#64-send-as-a-gift-collection)
   - 6.5 [Bulk Product Inquiry](#65-bulk-product-inquiry)
7. [Error States and Validations](#7-error-states-and-validations)
8. [URL Structure](#8-url-structure)
9. [Analytics Events](#9-analytics-events)
10. [Out of Scope](#10-out-of-scope)

---

## 1. Overview and Motivation

Snappy Swag is a branded merchandise creation and gifting platform. It allows companies to upload their logo, apply that branding to products from a curated catalog, organize those products into named design workspaces, and distribute them to recipients as curated gift collections or via a company store.

The product addresses three pain points in corporate swag programs:

**Branded product creation is fragmented.** Procurement, design approval, and distribution are handled by separate tools or vendors. Snappy consolidates these steps into a single workflow.

**Collection delivery is unpredictable for recipients.** Budget and shipping constraints cause items to silently disappear from recipient-facing views. The platform exposes budget and country filters explicitly, at both design time and delivery time, so administrators can predict what recipients will actually see.

**Reuse across campaigns is difficult.** Swag produced for one campaign cannot easily be recycled into another. The Design entity separates the act of creating a branded product from the act of sending it, enabling one Design to feed multiple Collections over time.

---

## 2. Core Mental Model and Terminology

The swag lifecycle follows a four-stage hierarchy:

```
Logo
 └── Design  (named workspace, e.g. "Holiday 2026", "New Hire Kit")
       ├── Product A  (canvas configuration: color, placement, layers)
       ├── Product B
       └── Product C
 └── Collection  (recipient-facing curated set, filtered by budget + country)
       └── Send  (gift event: single item or collection)
```

### Terminology

| Term | Definition |
|---|---|
| **Logo** | A brand asset (image URL). Uploaded by file or fetched by domain. Persisted globally via `CompanyLogoContext`. One active logo at a time. |
| **Design** | A named workspace. Contains a logo reference and an ordered list of product IDs. Created when a user starts from a template or clicks "+ New Design". A user may have multiple Designs, including multiple with the same logo. |
| **Designed Item** | A product that has been configured in the Design Tool: specific canvas layers (logo position, graphic, text), color options for recipients, and placement metadata. Lives in `DesignsContext`. |
| **Collection** | A recipient-facing curated set assembled from one or more Designs. Filtered by budget range and country at delivery time. Items may disappear from recipient view depending on budget/country constraints. |
| **Send** | A gift delivery event. The terminal step after selecting a Collection and configuring delivery. |
| **Design Template** | A pre-configured starting point (called "theme" in code: `COLLECTION_THEMES`). Contains a name, tagline, and a predefined list of product IDs. Starting from a template creates a new Design pre-populated with those products. |
| **Bulk Product** | A product type requiring minimum order quantities. Not self-serve — leads to a quote request form. Distinguished from on-demand products which ship one unit at a time. |

### What a Design Is Not

A Design is not a Brand Set (the previous entity name). A Design is not tied exclusively to a single logo — the logo can be replaced after creation. A Design is not a Collection — it has no budget or country constraints, and it is not shown to recipients directly.

---

## 3. Navigation Architecture

### Top-Level Navigation (SwagPageHeader)

Three tabs rendered in the persistent header across all non-full-screen routes:

| Tab Label | Route | Notes |
|---|---|---|
| Discover | `/swag` | Landing page |
| Catalog | `/catalog` | Product browsing |
| My Swag | `/designs` | Expands to sidebar with sub-items |

The `My Swag` tab activates a left sidebar (`YourSwagSidebar`) with the following sub-items:

| Sub-Item | Route |
|---|---|
| My Designs | `/designs` |
| My Collections | `/my-collections` |
| Stores | External URL (`STORE_URL`) |
| Inventory | `/inventory` |
| Shipments | `/shipments` |

### Full-Screen Routes

The following routes render without TopBar or MainNav. They occupy the full viewport:

| Route | Component | Notes |
|---|---|---|
| `/design/:id` | `SwagDesignTool` → `DesignToolPage` | react-konva canvas editor |
| `/designs/:id` | `DesignWorkspace` | Full-screen design management |
| `/send` | `SendGiftFlow` | Gift delivery flow |
| `/collection/preview` | `CollectionPreview` | Collection review before sending |
| `/collection/edit` | `CollectionEditMode` | Collection assembly |
| `/theme-preview` | `QuickCollection` | Template preview with budget/country filters |
| `/generating` | `BrandingLoader` | Logo application animation |
| `/preview/:token` | `CollectionPublicPreview` | Public recipient-facing preview |
| `/share/:id` | `DesignPublicView` | Public design sharing view |

### Route Redirects

- `/brands` redirects to `/designs` (legacy route).
- `/` and `/swag` both render `SwagOverview`.

### Logo Branding Overlay

When a new logo is uploaded on any page other than `/generating`, a full-screen `LogoBrandingOverlay` animation plays over the current page. It dismisses automatically. The overlay tracks `uploadCount` from `CompanyLogoContext` to detect new uploads.

---

## 4. Feature Sections

### 4.1 Discover (/swag)

The entry point for new and returning users. Four sections rendered in order.

#### Quick Start

Renders one of two states based on whether a logo is saved in `CompanyLogoContext`:

**State A — No logo saved:**
- Full hero card with logo upload interface.
- Upload methods: file picker (drag and drop or click) and domain-based logo fetch.
- On upload: calls `saveLogo(url)` → `BrandingLoader` plays → `createDesign({ logoUrl })` → navigates to `/designs/:newDesignId`.
- Logo validation (non-blocking): low-resolution logos show a warning but do not block progression.

**State B — Logo saved:**
- Compact "logo ready" card showing the saved logo thumbnail.
- "Continue" button: calls `createDesign({ logoUrl: savedLogo })` → navigates to `/designs/:newDesignId`.
- No re-upload required. The existing logo is applied to the new Design.

#### Explore Designs (Design Templates Carousel)

A horizontally scrollable carousel of pre-configured design templates sourced from `COLLECTION_THEMES`. Arrow buttons navigate the carousel. Each template card displays:

- Template name and tagline.
- A carousel of product images from the template's product list.
- A "Start with this design" CTA.

Clicking "Start with this design":
1. If no logo is set: navigates to `/generating` (BrandingLoader) first, then proceeds.
2. Calls `createDesign({ name: theme.name, logoUrl, productIds: theme.productIds, themeName: theme.name })`.
3. Navigates to `/designs/:newDesignId`.

Available templates (from `COLLECTION_THEMES`):

| Template Name | Tagline |
|---|---|
| Classic | Timeless branded essentials for any occasion |
| Summer | Bright, warm-weather gear for outdoor adventures |
| Onboarding | Everything a new hire needs to feel right at home |
| Eco Friendly | Sustainable swag that puts your values on display |
| Anniversary | Honor loyalty and tenure with premium gifts |
| Holiday Team Gift | Seasonal gifting for the whole team |
| Birthday Surprise | A fun, personalized birthday pick |

#### How It Works / Do It Yourself

Three option cards presenting the primary paths:

| Card | Action | Destination |
|---|---|---|
| Design a single item | "Browse catalog" | `/catalog` |
| Build a swag collection | "Start building" | `/collection/edit` with `{ productIds: [], from: location.pathname }` |
| Create a store | "Set up a store" | External store URL |

#### Popular Products

A grid of eight products tagged `POPULAR` in the product catalog. Each card links to `/product/:id`.

---

### 4.2 My Designs (/designs)

The top-level view of all user-created Designs. Rendered inside the My Swag sidebar layout.

#### Header Row

- Title: "My Designs"
- Right: "+ New Design" button.
  - Creates a new Design via `createDesign({})`.
  - Auto-names: "My Design", or "My Design 2" if "My Design" already exists, incrementing as needed.
  - Navigates to `/designs/:newDesignId`.

#### Design Card Grid

3–4 column responsive grid. Each card displays:

- **Product mosaic thumbnail**: 2×2 grid of the first four product images from `Design.productIds`. Placeholder icon if no products exist.
- **Logo thumbnail**: overlaid on the mosaic in a small rounded badge.
- **Design name**: rendered in Clash Display font.
- **Subtext**: "[N] products · last edited [timeAgo]".
- **Ellipsis menu (⋯)**: rendered via `createPortal` to `document.body` to avoid clipping by `overflow-hidden` or CSS `transform` ancestors.

#### Ellipsis Menu Actions

| Action | Behavior |
|---|---|
| Rename | Opens inline rename input (also triggered by double-click on name). Saves on blur or Enter. |
| Share | Opens `ShareModal` |
| Create a gift collection | Navigates to `/collection/preview` with `{ state: { designId } }` |
| Create a new storefront | Opens `STORE_URL` in a new tab |
| Delete | Opens delete confirmation dialog (portalled) |

#### Delete Confirmation Dialog

Portalled modal. Warning: "This design and all items will be permanently removed from collections they appear in."
Buttons: "Cancel" (neutral), "Delete design" (destructive, red). Destructive action calls `deleteDesign(id)`.

#### Share Modal

Modal component (`ShareModal`) with:
- Title: "Share [Design Name]"
- **Org-wide toggle**: enable access for all accounts in the organization. When enabled, a permission select appears: "Can view" or "Can edit".
- **Account combobox**: search and select specific accounts from a mock accounts list. Each selected account gets a "Can view" / "Can edit" permission selector.
- Existing shared accounts listed with current permission and a remove button.
- Footer actions: "Save", "Cancel", and "Remove all access".

#### Empty State

When no Designs exist: icon, "No designs yet" heading, and "Create your first design" CTA.

---

### 4.3 Design Workspace (/designs/:id)

Full-screen page (no TopBar/MainNav). The primary management surface for a single Design.

If the design ID is not found in `UserDesignsContext`, redirects to `/designs`.

#### Hero Section

| Element | Detail |
|---|---|
| Breadcrumb | Left arrow / "My Designs" (link to `/designs`) / [Design Name] |
| Design name | Inline editable. Click enters edit mode. Blur or Enter saves. Esc cancels without saving. |
| Health status badge | "Design Ready" (green checkmark) when 0 quality alerts. "X Quality Alerts Need Review" (amber triangle) when alerts exist. |
| Attribution | "From: [themeName]" — shown only if design was created from a template. |
| Meta | "[N] products · last edited [timeAgo]" with an "Auto-saved" indicator (green dot). |
| Share button | Opens `ShareDesignModal`. |
| Branding panel | Logo preview + company name + "Replace Brand" button → opens `ReplaceLogoModal`. |

#### Filter Bar (sticky)

Positioned below the hero section, sticky on scroll:

- **Budget dropdown** (pill style): "All Budgets" or "Up to $X". Filters the product grid.
- **Country dropdown**: flag emoji + country name. Filters the product grid by country eligibility.
- **"Add Products" button**: always visible. Opens `ProductPickerDrawer`.
- **Health summary** (right side): alert count or "All good" state.

#### Product Grid

4-column grid of products in `Design.productIds`. Each product card:

- Product image with logo overlay at the product's `printArea` coordinates (if `logoUrl` is set).
- **Quality alert state**: amber border + banner overlay reading "⚠ Low resolution / Not recommended" when `product.hasImageQualityIssue` is true.
- **Hover actions** (appear on hover):
  - "Design" button → navigates to `/design/:productId` with `{ state: { from: '/designs/:id' } }`.
  - "Remove" button → calls `removeProduct(designId, productId)`.
- Budget filter applies: products priced above the selected budget threshold are hidden.

#### Empty State (no products)

Icon, "Your design is empty" heading, "Add products to start building" subtext, and "+ Add Products" CTA.

#### Delivery CTAs

**Disabled condition**: `allProducts.length === 0` OR `alertCount > 0`.
When disabled: helper text reads "Fix X quality issues to continue".

**Enabled**: "Send as gifts" button → opens Experience Modal.

#### Experience Modal ("How do you want to deliver this?")

| Option | Description | Action |
|---|---|---|
| Create a gift collection (recommended) | "Recipients choose one gift from this design. You set the budget — they pick what they want." | Navigates to `/collection/preview` with `{ state: { designId } }` |
| Create a new storefront | "Let recipients redeem items over time. Great for ongoing programs." | Opens `STORE_URL` in a new tab |

#### ProductPickerDrawer

A slide-in panel from the right side. Uses the Sheet component, approximately 75% viewport width, max 960px. Contains:

- Header: "Add Products" + close button.
- Search input (auto-focused on open).
- Category filter pills: All, Apparel, Drinkware, Bags, Electronics, Home & Decor, Accessories.
- Product grid (2–3 columns): product image, name, brand, price. "+ Add" button for unselected products. "Added" badge (greyed out) for products already in the Design. Multi-select accumulates a count.
- Sticky footer: "[X] products selected" + "Add to Design" button. Calls `addProducts(designId, selectedProductIds)` and closes the drawer.

#### Onboarding Popup

Shown once per user (localStorage key `snappy_design_onboarding_seen`). Triggered by `setTimeout(2000ms)` after workspace mount, if the key is not set.

Content:
- Title: "Here's how Snappy Swag works"
- Step 1 — Add your logo: "Upload your brand logo, applied across all products"
- Step 2 — Design your swag: "Pick a design or build from scratch, product by product"
- Step 3 — Send or sell: "Send as a gift collection or publish as a store"
- CTA: "Got it, let's go" — sets the localStorage flag, dismisses.

---

### 4.4 Catalog (/catalog)

A product browsing grid with filtering. Rendered inside the TopBar/MainNav layout.

#### Filter Sidebar (left)

| Filter | Type |
|---|---|
| Search | Text input |
| Budget | Dropdown (Up to $25 through Up to $350) |
| Country | Dropdown (US, UK, Germany, France, Canada, Australia, Israel) |
| Product type | Radio: All Swag / No Minimums (on-demand) / Bulk & Kits |
| Categories | Checkboxes: Apparel, Drinkware, Bags, Electronics, Home & Decor, Accessories, Outdoor |
| Brand | Checkboxes |
| Color | Checkboxes |
| Decoration method | Filter chips (print technique) |

#### Product Cards (Catalog)

Each card:
- Product image. If a logo is set in `CompanyLogoContext` and the product has a `printArea`, the logo is overlaid at the print area coordinates. This is a visual preview only — not saved to any Design.
- Product name, brand, price.
- Print technique chip (Embroidery, DTF, DTG, Sublimation, Digital Inkjet, Laser Print, UV Printing, Digital Print).
- "Bulk orders only" label for bulk products.
- Color swatch strip (up to 5 swatches, with "+N more" label if additional).
- "+ More options" link if `product.hasMoreOptions` is true.
- Click → `/product/:id`.

#### Logo Preview in Catalog

The `isApplying` flag from `CompanyLogoContext` controls a shimmer skeleton animation while the logo positions itself after upload (2-second duration). No Design is created or modified during catalog browsing.

---

### 4.5 Product Detail (/product/:id)

Two rendering modes depending on whether the product has a saved canvas configuration in `DesignsContext`.

#### Breadcrumbs

- **Catalog mode**: product name only (or back arrow → previous page).
- **Designed mode**: "My Designs → [Design Name] → [Product Name]" — all segments are links.

#### On-Demand Product — Catalog Mode (not yet designed)

- Product image, name, brand, price.
- Color swatches, size selector.
- Print technique chip.
- Primary CTA: **"Design this product"** → navigates to `/design/:id`.
- Helper text: "Customize colors and apply your logo in the design tool."
- Secondary action row: "Add to Collection", "Send as Gift", "Add to Store" — rendered but disabled, with label: "Design this product first to unlock these options."

#### On-Demand Product — Designed Mode

- Product image with logo overlay.
- Design detail chip: logo thumbnail + color name + placement label.
- Primary CTA: **"Design this product"** → opens `/design/:id` for editing.
- Active secondary actions:
  - "Add to Collection" → `AddToCollectionMenu` (add to existing or new collection).
  - "Send as Gift" → navigates to `/send`.
  - "Add to Store" → `AddToStoreMenu`.
- If no logo is set when any secondary action is clicked: shows `LogoUploadPrompt` — an inline fixed modal with a hidden file input. The user must upload a logo before the action proceeds.

#### Bulk Product

- Product image, name, pricing tier table (quantity breakpoints → price per unit).
- Primary CTA: **"Get a Quote"** → opens `BulkContactModal`.
- `BulkContactModal` fields: Name, Company, Email (required), Message (pre-filled). Submit shows confirmation state.

---

### 4.6 Design Tool (/design/:id)

Full-screen react-konva canvas editor. Accessed from the Design Workspace product card, the Product Detail page, and from Collection Edit or Theme Preview.

**Canvas dimensions:** 460×520px.
**Printable area:** `{ x: 92, y: 88, width: 276, height: 344 }`.
**Zoom range:** 50% to 150%, in 25% increments.
**History:** 50-step undo/redo via `useReducer` in `useDesignEditor`.

#### Top Toolbar

Left to right:
- Back chevron → navigates to `location.state.from`, or `navigate(-1)` if no origin.
- Breadcrumb: "Design › [Product Name]".
- Undo / Redo buttons (disabled at history boundaries).
- Zoom –/+ controls with percentage readout.
- "Cancel" button → same as back.
- Save / "Save to design" button (see Save Behavior below).

#### Quality Issue Banner

If `product.hasImageQualityIssue` is true (or the saved design has `hasQualityIssue: true`), a red banner appears below the toolbar: "Replace low resolution layer".

#### Layer Sidebar (left panel)

Layer stack ordered as: logo, graphic, text layers.

| Layer Type | Sidebar Component |
|---|---|
| Logo (`ImageLayer`) | `LayerCard` with inline logo picker |
| Graphic (`ImageLayer`) | `LayerCard` with inline graphic picker |
| Text (`TextLayer`) | `TextLayerEditorCard` with font, size, weight, color, stroke, alignment controls |

Each layer card: visibility toggle, name, move up/down, duplicate, delete.

Text layers include a `PersonalizationDropdown` to mark the layer as recipient-personalized, replacing the text with a `{{token}}` placeholder.

#### Personalization Token Groups

| Group | Available tokens |
|---|---|
| Name | first name, last name, first initial, last initial, initials |
| Anniversary | month, elapsed, elapsed years, year, decade |
| Birthday | month, elapsed, year, decade, zodiac |
| Work | department, location |

#### Canvas (center)

react-konva `Stage`. Layers rendered as `KonvaImage` or `KonvaText`. A dashed rectangle marks the printable area boundary. The selected layer receives a `Transformer` (resize/rotate/move handles). The Transformer attaches via `stage.findOne('#layerId')`. Clicking the canvas background deselects the current layer.

#### Color Selection for Recipients

Below the canvas: a pill strip of the product's available colors. Clicking a swatch toggles recipient availability (at least one must remain). The previewed color on canvas changes to match the clicked swatch.

#### Save Behavior

| Origin | Button Label | On Save |
|---|---|---|
| `/designs/:id` | "Save" | Calls `saveDesign()`, `addProducts(designId, [productId])`, navigates back to workspace. No picker shown. |
| `/theme-preview` or `/collection/edit` | "Save to design" | Calls `saveDesign()`, navigates back to origin. |
| No recognized origin | "Save to design" | Opens `DesignPickerModal`. |
| `approveMode` (SwagBuilder) | "Approve & save item" | Calls `saveDesign()`, calls `onSave()` callback. |

#### DesignPickerModal

Shown when saving from an unrecognized origin:
- List of existing Designs (logo thumbnail + product count).
- "Create a new design" option (dashed border).
- Footer: Cancel + Save (disabled until a design is selected).
- **Save to existing design:** `saveDesign()` + `addProducts(selectedDesignId, [productId])` → navigates to `/product/:id`.
- **Save as new design:** `createDesign({ productIds: [productId] })` + `saveDesign()` → navigates to `/designs/:newDesignId`.

---

### 4.7 Collection Preview (/collection/preview)

Arrives with navigation state in one of two forms:
- From Design Workspace: `{ designId: string }`
- From My Collections: `{ productIds: string[], collectionName: string }`

#### Header

- Breadcrumb: "My Designs / [Design Name] / [Collection Name]" (when arriving from workspace).
- Company logo + company name in a branding panel.
- "Replace Brand" button → navigates to `/swag`.

#### Controls (sticky filter bar)

- **Budget selector**: "All Budgets" or "Up to $X" ($25–$350).
- **Country selector**: flag emoji + country name (7 countries).
- **Share button**: generates a public preview token, stores in `localStorage` as `snappy_preview_{token}`, shows a modal with a copyable URL (`/preview/:token`). Share modal title: "Share for approval". Anyone with the link can view.

#### Product Grid

4-column grid filtered by selected budget. Products above budget are hidden. Empty state when no products match: "No items in this budget range. Try a higher budget to see more options."

#### CTAs

- **"Send as a Collection"**: writes collection to `localStorage` (`snappy_my_collections`), navigates to `/send` with `{ collectionName, productIds, logoUrl, budget }`.
- **"Create a Store"**: opens `STORE_URL` in a new tab.

---

### 4.8 My Collections (/my-collections)

Rendered inside the My Swag sidebar layout.

#### Header Row

- Title: "My Collections"
- Subtitle: "Bundle products into a gift set and send to recipients"
- "+ New Collection" button → navigates to `/collection/edit` with `{ productIds: [], from: location.pathname }`.

#### Collections Grid

3-column responsive grid. Data from `MY_COLLECTIONS`. Each card:

- **Hero image**: first product in `productIds` (200px height).
- **Type badge**: "Mixed" (blue) or "Swag Only" (green) — top-left of hero.
- **Item thumbnail overlay**: additional product images as overlapping circles (bottom-right). "+N" count badge if more than 4 items.
- **Card body**: collection name, item count, recipient count (or "Never sent").
- **Action buttons**:
  - "Preview & Send" (primary) → navigates to `/collection/preview` with `{ productIds, collectionName }`.
  - Pencil icon → navigates to `/collection/edit` with `{ productIds, from: location.pathname }`.

#### Ghost Create Card

Dashed-border card at the end of the grid. Clicking creates a new collection via `/collection/edit`.

---

## 5. Data Model

### Design

```typescript
interface Design {
  id: string;            // generated: "design_{timestamp}_{random}"
  name: string;          // display name, auto-named if not provided
  logoUrl: string | null;
  productIds: string[];  // ordered list of product IDs in this workspace
  themeName?: string;    // attribution if created from COLLECTION_THEMES
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601 — drives "last edited" display
  sharedWith?: string[]; // emails this design has been shared with
}
```

**Persistence:** `localStorage` key `snappy_user_designs` via `UserDesignsContext`.
**Seed data:** Three mock Designs in `DESIGNS` (ids: `onboarding`, `summer`, `sales`).

### DesignedItem

```typescript
interface DesignedItem {
  id: string;
  productId: string;
  designId: string;
  colorHex: string;
  colorName: string;
  placement: LogoPlacement;    // 'left-chest' | 'center' | 'back' | 'sleeve'
  printTechnique: PrintTechnique;
  hasPersonalization?: boolean;
  hasGraphic?: boolean;
  createdAt: string;
  sendCount: number;
}
```

**Persistence:** `DesignsContext` (canvas state + quality flags).
**Seed data:** Four items in `MY_DESIGNED_ITEMS`.

### DesignState (Canvas)

```typescript
interface DesignState {
  productId: string;
  canvasWidth: number;        // 460
  canvasHeight: number;       // 520
  printableArea: PrintableArea; // { x: 92, y: 88, width: 276, height: 344 }
  zoom: number;               // 50–150
  selectedLayerId: string | null;
  layers: DesignLayer[];
}
```

**Persistence:** `DesignsContext` (in-memory + localStorage). 50-step history managed by `useDesignEditor` reducer.

### DesignLayer

```typescript
interface BaseLayer {
  id: string;
  type: 'logo' | 'graphic' | 'text';
  name: string;
  x: number; y: number; width: number; height: number;
  rotation: number;
  visible: boolean;
  zIndex: number;
}

interface ImageLayer extends BaseLayer {
  type: 'logo' | 'graphic';
  src: string;
}

interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  fillEnabled: boolean;
  fillColor: string;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  isPersonalized: boolean;
  personalizationType: string | null;
  personalizationPlaceholder: string | null;
}
```

### Product

```typescript
interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  category: 'Apparel' | 'Electronics' | 'Home & Decor' | 'Drinkware' | 'Bags' | 'Accessories' | 'Outdoor';
  type: 'on-demand' | 'bulk';
  tags: string[];            // 'POPULAR', 'PREMIUM', 'SUSTAINABLE'
  colors: ProductColor[];
  sizes: string[];
  description: string;
  minQuantity?: number;      // bulk only
  leadTimeDays?: number;     // bulk only
  shippingIncluded: boolean;
  image: string;             // file path or emoji
  printTechnique: PrintTechnique;
  printArea?: PrintArea;
  hasMoreOptions?: boolean;
  quantityTiers?: QuantityTier[];
  hasImageQualityIssue?: boolean;
}

interface PrintArea {
  x: number;      // % from left of image container
  y: number;      // % from top of image container
  width: number;  // % of container width
  height: number; // % of container height
  style: 'multiply' | 'badge';
  // 'multiply' = CSS blend mode for light backgrounds
  // 'badge'    = white-backed patch for dark or colored backgrounds
}
```

### MyCollection

```typescript
interface MyCollection {
  id: string;
  name: string;
  type: 'swag-only' | 'mixed';
  productIds: string[];
  itemCount: number;
  recipientCount: number;
  lastSentAt: string | null;
  createdAt: string;
}
```

**Persistence:** `MY_COLLECTIONS` mock data. User-created collections written to `localStorage` key `snappy_my_collections` on the Send action in CollectionPreview.

### Logo (CompanyLogoContext)

```typescript
interface CompanyLogoContextValue {
  logoUrl: string | null;
  uploadCount: number;      // increments on each new upload; triggers LogoBrandingOverlay
  isApplying: boolean;      // true for 2s after upload; controls shimmer animation on product cards
  activeBrandSet: BrandSet | null;
  allBrandSets: BrandSet[];
  saveLogo: (url: string, companyName?: string, silent?: boolean) => string;
  activateBrandSet: (id: string) => void;
  renameBrandSet: (id: string, name: string) => void;
  deleteBrandSet: (id: string) => void;
  clearLogo: () => void;
  addProductsToBrandSet: (productIds: string[], brandSetId?: string) => void;
}
```

**Persistence:** `localStorage` keys: `snappy_company_logo` (active URL), `snappy_brand_sets` (history), `snappy_active_brand_set_id`.

### localStorage Key Summary

| Key | Owner | Contents |
|---|---|---|
| `snappy_company_logo` | `CompanyLogoContext` | Active logo URL string |
| `snappy_brand_sets` | `CompanyLogoContext` | JSON array of BrandSet objects |
| `snappy_active_brand_set_id` | `CompanyLogoContext` | Active brand set ID string |
| `snappy_user_designs` | `UserDesignsContext` | JSON array of Design objects |
| `snappy_design_onboarding_seen` | `OnboardingPopup` | Boolean flag |
| `snappy_my_collections` | `CollectionPreview` | JSON array of collection entries |
| `snappy_preview_{token}` | `CollectionPreview` | JSON object: `{ logoUrl, productIds, budget, companyName }` |

---

## 6. Key Flows

### 6.1 Quick Start: Logo Upload

**Entry:** Discover page (`/swag`), no logo saved.

1. User sees the full hero card with logo upload area.
2. User drops a file or enters a domain name.
   - File: validates format and approximate resolution. Non-blocking low-res warning shown if applicable.
   - Domain: `fetchLogoForDomain(domain)` fetches logo. Error shown if not found.
3. `saveLogo(url)` is called. `uploadCount` increments. `isApplying` set to `true` for 2 seconds.
4. `BrandingLoader` animation plays at `/generating`.
5. `createDesign({ logoUrl })` creates a new blank Design.
6. Navigates to `/designs/:newDesignId`.

### 6.2 Start from a Design Template

**Entry:** Discover page carousel, "Start with this design" on any template card.

1. User clicks "Start with this design" on a template card.
2. If no logo is set: navigates to `/generating` first, then continues.
3. `createDesign({ name: theme.name, logoUrl, productIds: theme.productIds, themeName: theme.name })` is called.
   - Auto-name deduplication: if "Classic" already exists, creates "Classic 2", then "Classic 3", etc.
4. Navigates to `/designs/:newDesignId`.
5. Workspace opens with all template products pre-loaded.
6. Attribution label "From: [themeName]" appears in the hero section.

### 6.3 Create a New Blank Design

**Entry:** My Designs page, "+ New Design" button.

1. `createDesign({})` is called. Name auto-assigned ("My Design", "My Design 2", etc.). `productIds: []`.
2. Navigates to `/designs/:newDesignId`.
3. Workspace opens with empty product grid.
4. User opens ProductPickerDrawer to add products.
5. For each product the user wants to configure: navigates to `/design/:productId` from the workspace.
6. On save from the Design Tool: `addProducts(designId, [productId])` is called. Navigates back to workspace.
7. Design auto-saves to `localStorage` on every mutation.

### 6.4 Send as a Gift Collection

**Entry:** Design Workspace, "Send as gifts" button (enabled only when 0 quality alerts and at least 1 product).

1. Experience Modal opens. User selects "Create a gift collection".
2. Navigates to `/collection/preview` with `{ state: { designId } }`.
3. Collection Preview loads products from `Design.productIds`.
4. User selects budget. Products above budget are hidden.
5. User selects country.
6. Optional: user clicks share icon → token generated → copyable `/preview/:token` URL.
7. User clicks "Send as a Collection":
   - Collection entry written to `localStorage` (`snappy_my_collections`).
   - Navigates to `/send` with `{ collectionName, productIds, logoUrl, budget }`.

### 6.5 Bulk Product Inquiry

**Entry:** Product Detail page for a `type: 'bulk'` product.

1. Product Detail renders with a pricing tier table. Primary CTA is "Get a Quote".
2. User clicks "Get a Quote" → `BulkContactModal` opens.
3. Fields: Name, Company (required), Email (required), Message (pre-filled with product context).
4. Submit shows a confirmation state. No network request in the prototype.

---

## 7. Error States and Validations

### Logo Upload

| Condition | Behavior |
|---|---|
| File too large | Error message in upload area. Upload blocked. |
| Unsupported format | Error message. Upload blocked. |
| Low resolution (raster image) | Non-blocking warning. User can proceed. Affected products show quality alert in workspace and design tool. |
| Domain logo not found | Error message. User can try another domain or upload a file. |
| Processing timeout | Error state shown with retry option. |

### Design Workspace — Quality Alerts

| Condition | Behavior |
|---|---|
| `product.hasImageQualityIssue === true` | Amber border on product card. Banner overlay: "⚠ Low resolution / Not recommended". Alert increments the health badge counter. |
| Alert count > 0 | "Send as gifts" button disabled. Helper text: "Fix X quality issues to continue". |

### Design Tool

| Condition | Behavior |
|---|---|
| `product.hasImageQualityIssue === true` | Red banner below toolbar: "Replace low resolution layer". |
| Undo at oldest history state | Undo button is disabled. |
| Redo at newest history state | Redo button is disabled. |
| No design selected in DesignPickerModal | "Save" button is disabled. |

### Collection Preview

| Condition | Behavior |
|---|---|
| Budget set so that no products are visible | Empty state: "No items in this budget range. Try a higher budget to see more options." |

### Product Detail — Logo Required

| Condition | Behavior |
|---|---|
| No logo set, user clicks "Add to Collection" / "Send as Gift" / "Add to Store" | `LogoUploadPrompt` modal appears. User must upload a logo to proceed. |
| Product not yet designed, user clicks secondary actions | Actions rendered disabled with label: "Design this product first to unlock these options." |

### Design Workspace — Design Not Found

| Condition | Behavior |
|---|---|
| `/designs/:id` with unknown ID | Redirect to `/designs`. |

---

## 8. Out of Scope

The following are explicitly not implemented in the current prototype:

**Backend and data persistence.** All data is sourced from `mockData.ts` and `localStorage`. There is no backend API, authentication, or database. All state is local to the browser session.

**Real logo image analysis.** Low-resolution detection is based on file URL patterns (`blob:`, `.png`, `.jpg` extension matching). The `hasImageQualityIssue` flag is a static field in mock product data. Actual image dimension or DPI analysis is not performed.

**Send flow completion.** The `/send` route renders `SendGiftFlow`. Recipient address collection, payment processing, and fulfillment are not implemented in the prototype.

**Inventory and Shipments.** The `/inventory` and `/shipments` routes render placeholder components with static content. No real inventory data or shipment tracking exists.

**Store management.** The Stores item in the sidebar opens an external URL. There is no in-product store creation or management.

**Personalization token resolution.** Tokens like `{{name.first}}` can be placed in text layers in the Design Tool. Resolving tokens per recipient at send time is not implemented.

**Organization account directory.** The ShareModal uses a hardcoded `MOCK_ACCOUNTS` list. No real org directory integration exists. Sharing settings have no enforcement effect.

**Country-based product filtering.** The `ITEM_COUNTRIES` map in code defines which countries each product ships to, but this is not enforced in `CollectionPreview`. Only budget filtering is applied at the collection preview stage.

**Localized pricing.** `COUNTRY_PRICE_MULTIPLIERS` is defined in `mockData.ts` but is not applied to any displayed price in the prototype.

**BulkContactModal form submission.** The form reaches a confirmation state visually, but no network request is made.

**Public preview durability.** Collection public previews (`/preview/:token`) are stored in `localStorage`. They are device-local and not accessible from other devices or browsers.

**Design versioning.** Undo/redo exists within a single Design Tool session (50-step in-memory history). There is no persistent version history for a Design's content across sessions.

**Multi-logo switching.** `CompanyLogoContext` maintains a `BrandSet` history, but the product surface only exposes one active logo at a time. The Design entity stores one `logoUrl`.

**Send count tracking.** The `sendCount` field on `DesignedItem` is seeded with mock values. No actual send event tracking is wired up.

---

## 8. URL Structure

### Public Routes (TopBar + MainNav visible)

| Route | Page | Notes |
|---|---|---|
| `/` | Discover (SwagOverview) | Alias for `/swag` |
| `/swag` | Discover (SwagOverview) | Default entry point |
| `/catalog` | Catalog (SwagCatalog, tab: catalog) | |
| `/inventory` | Inventory (SwagCatalog, tab: inventory) | |
| `/shipments` | Shipments | |
| `/stores` | Stores (SwagStores) | Placeholder |
| `/product/:id` | Product Detail | `:id` = product ID from `PRODUCTS` |
| `/designs` | My Designs | |
| `/my-collections` | My Collections | |
| `/collection/new` | Collection Builder | Blank collection start |
| `/swag-v2` | SwagOverviewV2 | Alternate overview (experimental) |
| `/items/saved` | Items Saved | Can render as overlay via background location |
| `/flows` | Flows Page | |
| `/bonusly` | Bonusly Rewards | |
| `/brands` | — | Redirects to `/designs` (legacy alias) |

### Full-Screen Routes (TopBar + MainNav hidden)

| Route | Page | State / Notes |
|---|---|---|
| `/designs/:id` | Design Workspace | `:id` = Design ID; redirects to `/designs` if not found |
| `/design/:id` | Design Tool (SwagDesignTool) | `:id` = product ID; full react-konva canvas |
| `/send` | Send Gift Flow | Navigated to with `{ collectionName, productIds, logoUrl, budget }` state |
| `/generating` | Branding Loader | Plays animation after logo upload; then navigates to `/designs/:id` |
| `/theme-preview` | Quick Collection | Legacy route; kept alive (has existing references) |
| `/collection/edit` | Collection Edit Mode | State: `{ productIds, from }` |
| `/collection/preview` | Collection Preview | State: `{ designId }` or `{ productIds, collectionName }` |
| `/preview/:token` | Collection Public Preview | `:token` = localStorage-stored public token |
| `/share/:id` | Design Public View | `:id` = Design ID; shareable read-only view |

### URL Parameter Conventions

- **`:id` (product)**: matches keys in `PRODUCTS` array (e.g. `prod_001`). Used by `/product/:id` and `/design/:id`.
- **`:id` (design)**: matches `design_{timestamp}_{random}` pattern generated by `UserDesignsContext.generateId()`. Used by `/designs/:id`.
- **`:token` (collection)**: localStorage key used for public collection sharing. Device-local; not globally resolvable.
- **Router state** (not in URL): Several routes receive data via React Router's `location.state`. This data is not reflected in the URL and is lost on hard refresh.

### Routes that pass critical state via `location.state` (not URL params)

| Route | State shape | Passed from |
|---|---|---|
| `/collection/preview` | `{ designId?: string; productIds?: string[]; collectionName?: string }` | DesignWorkspace, MyCollections |
| `/collection/edit` | `{ productIds: string[]; from: string }` | MyCollections, CollectionBuilder |
| `/send` | `{ collectionName: string; productIds: string[]; logoUrl: string \| null; budget: number }` | CollectionPreview |
| `/design/:id` | `{ from?: string }` | ProductDetail, DesignWorkspace (Design button) |
| `/generating` | `{ logoUrl: string; themeName?: string; productIds?: string[] }` | SwagOverview Quick Start |
| `/items/saved` | `{ backgroundLocation: Location }` | Rendered as overlay on `/designs` |

---

## 9. Analytics Events

No analytics SDK is currently wired in the prototype. The following events are derived from the actual user interactions implemented in the code. They represent the instrumentation plan for production.

### Event naming convention
`[object]_[action]` — snake_case, past tense for completed actions, present tense for initiated actions.

---

### Logo Events

| Event | Trigger | Properties |
|---|---|---|
| `logo_upload_started` | User opens file picker or drags file onto LogoHero | `source: 'file_drop' \| 'file_picker' \| 'domain_fetch'` |
| `logo_upload_completed` | `saveLogo()` called successfully | `source`, `is_svg: boolean`, `is_raster: boolean` |
| `logo_upload_failed` | Validation error before save | `reason: 'file_too_large' \| 'unsupported_format' \| 'domain_not_found' \| 'processing_timeout'` |
| `logo_quality_warning_shown` | Low-res logo detected (non-blocking) | `source` |
| `logo_replaced` | "Replace Brand" → ReplaceLogoModal → new logo selected | `design_id: string`, `source: 'upload' \| 'existing'` |
| `logo_removed` | Logo removed from CompanyLogoContext | — |

---

### Design Events

| Event | Trigger | Properties |
|---|---|---|
| `design_created` | `createDesign()` called | `origin: 'quick_start' \| 'template' \| 'new_design_button' \| 'design_tool_save'`, `template_name?: string`, `product_count: number` |
| `design_opened` | User navigates to `/designs/:id` | `design_id: string`, `product_count: number`, `has_alerts: boolean` |
| `design_renamed` | `updateDesign(id, { name })` called via inline edit | `design_id: string` |
| `design_deleted` | `deleteDesign()` confirmed in deletion dialog | `design_id: string`, `product_count: number` |
| `design_shared` | ShareModal saved with at least one access rule | `design_id: string`, `org_wide: boolean`, `account_count: number` |
| `design_share_removed` | "Remove all access" in ShareModal | `design_id: string` |
| `design_product_added` | `addProducts()` called from ProductPickerDrawer | `design_id: string`, `products_added: number`, `total_products: number` |
| `design_product_removed` | `removeProduct()` called via "Remove" on product card | `design_id: string`, `product_id: string` |
| `design_delivery_blocked` | User attempts delivery CTA while alerts exist | `design_id: string`, `alert_count: number` |
| `design_deliver_clicked` | "Send as gifts" button clicked (CTAs enabled) | `design_id: string`, `product_count: number` |
| `design_delivery_method_selected` | Option chosen in Experience Modal | `design_id: string`, `method: 'gift_collection' \| 'storefront'` |

---

### Template Events

| Event | Trigger | Properties |
|---|---|---|
| `template_viewed` | Template card visible in carousel (impression) | `template_name: string`, `position: number` |
| `template_selected` | "Start with this design" clicked | `template_name: string`, `product_count: number`, `had_logo: boolean` |

---

### Product Picker Events

| Event | Trigger | Properties |
|---|---|---|
| `product_picker_opened` | ProductPickerDrawer opened | `design_id: string`, `current_product_count: number` |
| `product_picker_searched` | User types in search field | `query: string` |
| `product_picker_category_filtered` | Category pill selected | `category: string` |
| `product_picker_confirmed` | "Add to Design" button clicked | `design_id: string`, `products_added: number` |
| `product_picker_dismissed` | Drawer closed without adding | `design_id: string` |

---

### Catalog Events

| Event | Trigger | Properties |
|---|---|---|
| `catalog_viewed` | `/catalog` route loaded | — |
| `catalog_filtered` | Any filter applied | `filter_type: 'type' \| 'category' \| 'brand' \| 'color' \| 'technique' \| 'budget' \| 'country'`, `value: string` |
| `catalog_searched` | User types in search field | `query: string` |
| `catalog_product_clicked` | Product card clicked → `/product/:id` | `product_id: string`, `product_type: 'on-demand' \| 'bulk'`, `position: number` |

---

### Product Detail Events

| Event | Trigger | Properties |
|---|---|---|
| `product_detail_viewed` | `/product/:id` loaded | `product_id: string`, `product_type: 'on-demand' \| 'bulk'`, `mode: 'catalog' \| 'designed'` |
| `product_design_started` | "Design this product" clicked | `product_id: string`, `had_logo: boolean` |
| `product_add_to_collection_clicked` | "Add to Collection" action triggered | `product_id: string`, `had_logo: boolean` |
| `product_send_as_gift_clicked` | "Send as Gift" action triggered | `product_id: string`, `had_logo: boolean` |
| `product_logo_gate_shown` | LogoUploadPrompt modal shown | `product_id: string`, `action_attempted: string` |
| `product_logo_uploaded_from_gate` | Logo uploaded via LogoUploadPrompt | `product_id: string` |
| `product_bulk_quote_started` | "Get a Quote" clicked | `product_id: string` |
| `product_bulk_quote_submitted` | BulkContactModal form submitted | `product_id: string` |

---

### Design Tool Events

| Event | Trigger | Properties |
|---|---|---|
| `design_tool_opened` | `/design/:id` loaded | `product_id: string`, `had_existing_canvas: boolean`, `entry_point: 'product_detail' \| 'workspace' \| 'catalog'` |
| `design_tool_logo_added` | Logo layer placed | `product_id: string` |
| `design_tool_text_added` | Text layer added | `product_id: string` |
| `design_tool_graphic_added` | Graphic layer added | `product_id: string` |
| `design_tool_personalization_added` | Personalization token inserted in text | `product_id: string`, `token: string` |
| `design_tool_undo` | Undo action triggered | `product_id: string` |
| `design_tool_save_started` | Save button clicked → DesignPickerModal opened | `product_id: string` |
| `design_tool_saved_to_existing` | Saved to existing Design | `product_id: string`, `design_id: string` |
| `design_tool_saved_as_new` | Saved as new Design | `product_id: string`, `design_id: string` |

---

### Collection Events

| Event | Trigger | Properties |
|---|---|---|
| `collection_preview_viewed` | `/collection/preview` loaded | `design_id?: string`, `product_count: number`, `entry_point: 'workspace' \| 'my_collections'` |
| `collection_budget_set` | Budget selector changed in CollectionPreview | `budget: number` |
| `collection_country_set` | Country selector changed | `country_code: string` |
| `collection_send_started` | "Continue" clicked in CollectionPreview | `design_id?: string`, `product_count: number`, `visible_product_count: number`, `budget: number` |
| `collection_share_link_copied` | Share link copied in CollectionPreview | `design_id?: string` |
| `collection_created` | New collection created from CollectionEditMode | `product_count: number` |

---

### Onboarding Events

| Event | Trigger | Properties |
|---|---|---|
| `onboarding_popup_shown` | OnboardingPopup rendered (2s delay) | `design_id: string` |
| `onboarding_popup_dismissed` | "Got it, let's go" clicked | `design_id: string` |

---

### Conversion Funnel (key sequence for KPI tracking)

```
logo_upload_completed
  → design_created (origin: quick_start | template | new_design_button)
    → design_product_added
      → design_deliver_clicked
        → design_delivery_method_selected (method: gift_collection | storefront)
          → collection_send_started
```

Each step in this funnel should be queryable independently to measure drop-off rates between stages. The `design_id` property threads through all events after design creation, enabling per-design funnel analysis.

---

## 10. Out of Scope

**The following routes are prototype exploration surfaces and are not documented as product features:** `/flows`, `/bonusly`, `/swag-v2`, `/items/saved`.
