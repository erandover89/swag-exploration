# Snappy Swag — Analytics Specification

**Version:** 1.0
**Date:** June 2026
**Target platforms:** Amplitude · Mixpanel
**Status:** Implementation-ready

---

## Table of Contents

1. [Event Taxonomy](#1-event-taxonomy)
2. [Entity Model](#2-entity-model)
3. [Funnels](#3-funnels)
4. [Executive Dashboards](#4-executive-dashboards)
5. [Business Questions](#5-business-questions)
6. [Logo Friction Analysis](#6-logo-friction-analysis)
7. [North Star Metrics](#7-north-star-metrics)

---

## 1. Event Taxonomy

### Naming Conventions

- Format: `object_action` — snake_case, past tense for completed actions
- Grouped by surface area
- Every event carries the [Global Context Properties](#global-context-properties) automatically

### Global Context Properties

These properties are attached to **every event** via a middleware/plugin layer. Never pass them manually per-call.

| Property | Type | Description |
|---|---|---|
| `account_id` | string | Snappy account identifier |
| `org_id` | string | Parent organization identifier |
| `user_id` | string | Authenticated user identifier |
| `session_id` | string | Browser session (reset on new tab/login) |
| `platform` | string | `'web'` |
| `app_version` | string | Frontend build version |
| `timestamp` | ISO 8601 | Event time (auto-set by SDK) |
| `active_logo_id` | string \| null | Logo currently active in context |
| `active_design_id` | string \| null | Design currently in context (if in workspace) |

---

### 1.1 Discovery Events

#### `discover_page_viewed`
User lands on the Discover tab.

| | |
|---|---|
| **Trigger** | `/swag` or `/` route mounts |
| **Required** | `has_logo: boolean` |
| **Optional** | `has_existing_designs: boolean`, `design_count: number` |

---

#### `discover_logo_upload_section_viewed`
The Quick Start logo upload section is visible (no logo state).

| | |
|---|---|
| **Trigger** | LogoHero renders in no-logo state |
| **Required** | — |
| **Optional** | — |

---

#### `discover_saved_logo_section_viewed`
Compact "logo ready" card is visible (logo already saved).

| | |
|---|---|
| **Trigger** | LogoHero renders in logo-saved state |
| **Required** | `logo_id: string` |
| **Optional** | — |

---

#### `discover_theme_carousel_viewed`
Trending Themes section becomes visible (impression).

| | |
|---|---|
| **Trigger** | Carousel section enters viewport |
| **Required** | `theme_count: number` |
| **Optional** | — |

---

#### `discover_theme_clicked`
User clicks "Start with this design" on a theme card.

| | |
|---|---|
| **Trigger** | Theme CTA click |
| **Required** | `theme_id: string`, `theme_name: string`, `position: number`, `had_logo: boolean` |
| **Optional** | `product_count: number` |

---

#### `discover_popular_item_clicked`
User clicks a popular product card on the Discover page.

| | |
|---|---|
| **Trigger** | Popular Items card click |
| **Required** | `product_id: string`, `position: number`, `had_logo: boolean` |
| **Optional** | `product_name: string`, `product_type: 'on-demand' \| 'bulk'` |

---

#### `discover_diy_option_clicked`
User selects one of the "Do It Yourself" entry points.

| | |
|---|---|
| **Trigger** | DIY card click |
| **Required** | `option: 'single_item' \| 'swag_collection' \| 'store'` |
| **Optional** | — |

---

#### `discover_view_all_catalog_clicked`
User clicks "View All" from Popular Items.

| | |
|---|---|
| **Trigger** | View All button click |
| **Required** | — |
| **Optional** | — |

---

### 1.2 Logo Events

> See [Section 6](#6-logo-friction-analysis) for the full logo friction event model.

#### `logo_upload_started`

| | |
|---|---|
| **Trigger** | File picker opened or file drag initiated |
| **Required** | `method: 'file_picker' \| 'drag_drop'`, `surface: 'discover' \| 'catalog' \| 'workspace' \| 'product_detail'` |
| **Optional** | — |

---

#### `logo_fetch_started`

| | |
|---|---|
| **Trigger** | Domain submitted in logo fetch input |
| **Required** | `surface: string` |
| **Optional** | `domain: string` |

---

#### `logo_acquired`
A logo was successfully saved into context (via any method).

| | |
|---|---|
| **Trigger** | `saveLogo()` completes successfully |
| **Required** | `logo_id: string`, `method: 'upload' \| 'fetch' \| 'existing' \| 'replace'`, `surface: string`, `file_type: 'svg' \| 'png' \| 'jpg' \| 'gif' \| 'webp' \| 'unknown'` |
| **Optional** | `is_first_logo: boolean`, `replace_count: number` |

---

#### `logo_acquisition_failed`

| | |
|---|---|
| **Trigger** | Logo cannot be saved |
| **Required** | `method: string`, `surface: string`, `reason: 'file_too_large' \| 'unsupported_format' \| 'domain_not_found' \| 'processing_timeout' \| 'network_error'` |
| **Optional** | — |

---

#### `logo_analysis_completed`
Covver analysis result received.

| | |
|---|---|
| **Trigger** | Logo analysis pipeline returns result |
| **Required** | `logo_id: string`, `passed: boolean` |
| **Optional** | `issues: string[]` — e.g. `['low_resolution', 'wrong_format', 'transparency_missing']`, `dpi: number`, `width_px: number`, `height_px: number` |

---

#### `logo_quality_warning_shown`
Quality warning surfaced to user (non-blocking).

| | |
|---|---|
| **Trigger** | Warning banner/modal renders |
| **Required** | `logo_id: string`, `issue_type: string`, `surface: string` |
| **Optional** | — |

---

#### `logo_replaced`
User replaced an existing logo with a new one.

| | |
|---|---|
| **Trigger** | ReplaceLogoModal confirms selection |
| **Required** | `previous_logo_id: string`, `new_logo_id: string`, `method: 'upload' \| 'existing'`, `surface: string` |
| **Optional** | `design_id: string`, `replace_count: number`, `triggered_by: 'replace_brand_button' \| 'quality_warning' \| 'workspace_prompt'` |

---

#### `logo_removed`

| | |
|---|---|
| **Trigger** | Logo removed from context |
| **Required** | `logo_id: string`, `surface: string` |
| **Optional** | — |

---

### 1.3 Branding Loader Events

#### `branding_loader_started`

| | |
|---|---|
| **Trigger** | `/generating` route mounts |
| **Required** | `logo_id: string`, `origin: 'quick_start' \| 'theme'` |
| **Optional** | `theme_id: string` |

---

#### `branding_loader_completed`

| | |
|---|---|
| **Trigger** | Loader animation ends, navigation to workspace fires |
| **Required** | `logo_id: string`, `design_id: string`, `duration_ms: number` |
| **Optional** | — |

---

### 1.4 Design Events

#### `design_created`

| | |
|---|---|
| **Trigger** | `createDesign()` called |
| **Required** | `design_id: string`, `origin: 'quick_start' \| 'theme' \| 'new_design_button' \| 'design_tool_save'`, `had_logo: boolean` |
| **Optional** | `theme_id: string`, `theme_name: string`, `initial_product_count: number`, `logo_id: string` |

---

#### `design_opened`

| | |
|---|---|
| **Trigger** | `/designs/:id` mounts |
| **Required** | `design_id: string`, `product_count: number`, `alert_count: number`, `is_design_ready: boolean` |
| **Optional** | `logo_id: string`, `origin: 'my_designs' \| 'branding_loader' \| 'design_tool_save' \| 'direct'` |

---

#### `design_renamed`

| | |
|---|---|
| **Trigger** | Inline name committed (blur or Enter) |
| **Required** | `design_id: string` |
| **Optional** | — |

---

#### `design_product_added`

| | |
|---|---|
| **Trigger** | `addProducts()` called from ProductPickerDrawer |
| **Required** | `design_id: string`, `products_added: number`, `total_products_after: number` |
| **Optional** | `product_ids: string[]`, `source: 'picker_drawer' \| 'design_tool'` |

---

#### `design_product_removed`

| | |
|---|---|
| **Trigger** | "Remove" clicked on product card in workspace |
| **Required** | `design_id: string`, `product_id: string`, `remaining_product_count: number` |
| **Optional** | — |

---

#### `design_quality_alert_viewed`
Quality alert badge becomes visible.

| | |
|---|---|
| **Trigger** | Workspace renders with `alert_count > 0` |
| **Required** | `design_id: string`, `alert_count: number` |
| **Optional** | `alerted_product_ids: string[]` |

---

#### `design_delivery_blocked`
User attempts "Send as gifts" but is blocked.

| | |
|---|---|
| **Trigger** | CTA clicked while disabled |
| **Required** | `design_id: string`, `reason: 'no_products' \| 'quality_alerts'`, `alert_count: number` |
| **Optional** | — |

---

#### `design_deliver_clicked`
"Send as gifts" CTA clicked while enabled.

| | |
|---|---|
| **Trigger** | CTA button click (enabled state) |
| **Required** | `design_id: string`, `product_count: number`, `logo_id: string` |
| **Optional** | — |

---

#### `design_delivery_method_selected`
User selects an option in the Experience Modal.

| | |
|---|---|
| **Trigger** | Option button click in modal |
| **Required** | `design_id: string`, `method: 'gift_collection' \| 'storefront'` |
| **Optional** | `product_count: number` |

---

#### `design_shared`
ShareModal saved with access rules.

| | |
|---|---|
| **Trigger** | ShareModal "Save" confirmed |
| **Required** | `design_id: string`, `org_wide: boolean` |
| **Optional** | `account_count: number`, `view_count: number`, `edit_count: number` |

---

#### `design_share_removed`

| | |
|---|---|
| **Trigger** | "Remove all access" in ShareModal |
| **Required** | `design_id: string` |
| **Optional** | — |

---

#### `design_deleted`

| | |
|---|---|
| **Trigger** | Delete confirmed in confirmation dialog |
| **Required** | `design_id: string`, `product_count: number`, `had_been_used_in_collection: boolean` |
| **Optional** | — |

---

### 1.5 Product Picker Drawer Events

#### `product_picker_opened`

| | |
|---|---|
| **Trigger** | ProductPickerDrawer opens |
| **Required** | `design_id: string`, `current_product_count: number` |
| **Optional** | — |

---

#### `product_picker_searched`

| | |
|---|---|
| **Trigger** | User types in search field (debounced) |
| **Required** | `design_id: string`, `query: string`, `results_count: number` |
| **Optional** | — |

---

#### `product_picker_category_filtered`

| | |
|---|---|
| **Trigger** | Category pill selected |
| **Required** | `design_id: string`, `category: string` |
| **Optional** | — |

---

#### `product_picker_item_toggled`
User adds or removes an item in the picker (before confirming).

| | |
|---|---|
| **Trigger** | Product card checkbox/button clicked |
| **Required** | `design_id: string`, `product_id: string`, `action: 'add' \| 'remove'`, `selected_count: number` |
| **Optional** | — |

---

#### `product_picker_confirmed`

| | |
|---|---|
| **Trigger** | "Add to Design" button clicked |
| **Required** | `design_id: string`, `products_added: number` |
| **Optional** | `product_ids: string[]` |

---

#### `product_picker_dismissed`
Drawer closed with 0 additions.

| | |
|---|---|
| **Trigger** | Drawer closed without confirming |
| **Required** | `design_id: string`, `selected_count_at_close: number` |
| **Optional** | — |

---

### 1.6 Catalog Events

#### `catalog_viewed`

| | |
|---|---|
| **Trigger** | `/catalog` route mounts |
| **Required** | `active_tab: 'catalog' \| 'my-items' \| 'inventory'`, `has_logo: boolean` |
| **Optional** | — |

---

#### `catalog_filtered`

| | |
|---|---|
| **Trigger** | Filter applied/changed |
| **Required** | `filter_type: 'product_type' \| 'category' \| 'brand' \| 'color' \| 'technique' \| 'budget' \| 'country'`, `value: string` |
| **Optional** | `result_count: number` |

---

#### `catalog_searched`

| | |
|---|---|
| **Trigger** | Search query submitted (debounced) |
| **Required** | `query: string`, `result_count: number` |
| **Optional** | — |

---

#### `catalog_product_clicked`

| | |
|---|---|
| **Trigger** | Product card click in Catalog |
| **Required** | `product_id: string`, `product_type: 'on-demand' \| 'bulk'`, `position: number` |
| **Optional** | `category: string`, `brand: string`, `had_logo: boolean` |

---

### 1.7 Product Detail Events

#### `product_detail_viewed`

| | |
|---|---|
| **Trigger** | `/product/:id` mounts |
| **Required** | `product_id: string`, `product_type: 'on-demand' \| 'bulk'`, `mode: 'catalog' \| 'designed'` |
| **Optional** | `design_id: string`, `entry_point: 'catalog' \| 'workspace' \| 'discover_popular' \| 'my_designs'`, `had_logo: boolean` |

---

#### `product_design_started`
"Design this product" clicked.

| | |
|---|---|
| **Trigger** | Primary CTA click |
| **Required** | `product_id: string`, `had_logo: boolean`, `mode: 'catalog' \| 'designed'` |
| **Optional** | `design_id: string`, `entry_point: string` |

---

#### `product_add_to_collection_clicked`

| | |
|---|---|
| **Trigger** | "Add to Collection" action triggered |
| **Required** | `product_id: string`, `mode: 'designed'` |
| **Optional** | `design_id: string` |

---

#### `product_send_as_gift_clicked`

| | |
|---|---|
| **Trigger** | "Send as Gift" action triggered |
| **Required** | `product_id: string`, `mode: 'designed'` |
| **Optional** | `design_id: string` |

---

#### `product_logo_gate_shown`
LogoUploadPrompt modal displayed.

| | |
|---|---|
| **Trigger** | Action clicked without logo set |
| **Required** | `product_id: string`, `action_attempted: 'add_to_collection' \| 'send_as_gift' \| 'add_to_store'` |
| **Optional** | — |

---

#### `product_logo_uploaded_from_gate`

| | |
|---|---|
| **Trigger** | Logo uploaded via gate modal |
| **Required** | `product_id: string`, `logo_id: string` |
| **Optional** | — |

---

#### `product_bulk_quote_started`

| | |
|---|---|
| **Trigger** | "Get a Quote" clicked |
| **Required** | `product_id: string` |
| **Optional** | `product_name: string`, `entry_point: string` |

---

#### `product_bulk_quote_submitted`

| | |
|---|---|
| **Trigger** | BulkContactModal form submitted |
| **Required** | `product_id: string` |
| **Optional** | — |

---

### 1.8 Design Tool Events

#### `design_tool_opened`

| | |
|---|---|
| **Trigger** | `/design/:id` mounts |
| **Required** | `product_id: string`, `entry_point: 'discover_popular' \| 'product_detail' \| 'workspace' \| 'catalog' \| 'my_designs'`, `had_existing_canvas: boolean`, `had_logo: boolean` |
| **Optional** | `design_id: string` |

---

#### `design_tool_logo_placed`

| | |
|---|---|
| **Trigger** | Logo layer added to canvas |
| **Required** | `product_id: string`, `logo_id: string` |
| **Optional** | `placement: string`, `design_id: string` |

---

#### `design_tool_text_added`

| | |
|---|---|
| **Trigger** | Text layer added |
| **Required** | `product_id: string` |
| **Optional** | `design_id: string` |

---

#### `design_tool_graphic_added`

| | |
|---|---|
| **Trigger** | Graphic layer added |
| **Required** | `product_id: string` |
| **Optional** | `design_id: string` |

---

#### `design_tool_personalization_added`

| | |
|---|---|
| **Trigger** | Personalization token inserted in text layer |
| **Required** | `product_id: string`, `token: string` |
| **Optional** | `design_id: string` |

---

#### `design_tool_undo`

| | |
|---|---|
| **Trigger** | Undo triggered |
| **Required** | `product_id: string`, `history_depth: number` |
| **Optional** | — |

---

#### `design_tool_save_started`
Save button clicked, DesignPickerModal opens.

| | |
|---|---|
| **Trigger** | Save button click |
| **Required** | `product_id: string`, `entry_point: string`, `layer_count: number` |
| **Optional** | `had_logo: boolean` |

---

#### `design_tool_saved_to_existing`

| | |
|---|---|
| **Trigger** | Saved to an existing design |
| **Required** | `product_id: string`, `design_id: string`, `entry_point: string` |
| **Optional** | — |

---

#### `design_tool_saved_as_new`

| | |
|---|---|
| **Trigger** | Saved as a new design |
| **Required** | `product_id: string`, `design_id: string`, `entry_point: string` |
| **Optional** | — |

---

#### `design_tool_abandoned`
User navigated away without saving.

| | |
|---|---|
| **Trigger** | Component unmount with no save event fired |
| **Required** | `product_id: string`, `entry_point: string`, `had_logo: boolean`, `layers_added: number`, `time_spent_ms: number` |
| **Optional** | `exit_destination: string` |

---

### 1.9 Collection Events

#### `collection_preview_viewed`

| | |
|---|---|
| **Trigger** | `/collection/preview` mounts |
| **Required** | `product_count: number`, `entry_point: 'workspace' \| 'my_collections' \| 'my_designs_menu'` |
| **Optional** | `design_id: string`, `logo_id: string` |

---

#### `collection_budget_set`

| | |
|---|---|
| **Trigger** | Budget selector changed |
| **Required** | `budget: number`, `visible_product_count: number` |
| **Optional** | `design_id: string` |

---

#### `collection_country_set`

| | |
|---|---|
| **Trigger** | Country selector changed |
| **Required** | `country_code: string` |
| **Optional** | `design_id: string`, `visible_product_count: number` |

---

#### `collection_products_filtered_out`
Budget or country selection removes items from view.

| | |
|---|---|
| **Trigger** | `visible_product_count < total_product_count` after filter change |
| **Required** | `total_products: number`, `visible_products: number`, `hidden_count: number`, `filter_type: 'budget' \| 'country'` |
| **Optional** | `design_id: string` |

---

#### `collection_send_started`

| | |
|---|---|
| **Trigger** | "Continue" clicked → navigates to `/send` |
| **Required** | `design_id: string`, `budget: number`, `country_code: string`, `total_products: number`, `visible_products: number` |
| **Optional** | `logo_id: string` |

---

#### `collection_share_link_copied`

| | |
|---|---|
| **Trigger** | Share link copied |
| **Required** | — |
| **Optional** | `design_id: string` |

---

#### `collection_created`
Collection saved from CollectionEditMode.

| | |
|---|---|
| **Trigger** | Collection saved |
| **Required** | `collection_id: string`, `product_count: number`, `type: 'swag_only' \| 'mixed'` |
| **Optional** | `design_id: string`, `marketplace_item_count: number`, `swag_item_count: number` |

---

### 1.10 Store Events

#### `store_create_initiated`

| | |
|---|---|
| **Trigger** | "Create a new storefront" selected in Experience Modal or ellipsis menu |
| **Required** | `origin: 'workspace_modal' \| 'my_designs_menu'` |
| **Optional** | `design_id: string`, `product_count: number` |

---

### 1.11 My Swag Events

#### `my_designs_viewed`

| | |
|---|---|
| **Trigger** | `/designs` mounts |
| **Required** | `design_count: number`, `has_logo: boolean` |
| **Optional** | — |

---

#### `my_collections_viewed`

| | |
|---|---|
| **Trigger** | `/my-collections` mounts |
| **Required** | `collection_count: number` |
| **Optional** | — |

---

### 1.12 Onboarding Events

#### `onboarding_popup_shown`

| | |
|---|---|
| **Trigger** | OnboardingPopup renders |
| **Required** | `design_id: string` |
| **Optional** | — |

---

#### `onboarding_popup_dismissed`

| | |
|---|---|
| **Trigger** | "Got it, let's go" clicked |
| **Required** | `design_id: string` |
| **Optional** | — |

---

### 1.13 Legacy Product Events

#### `legacy_product_viewed`

| | |
|---|---|
| **Trigger** | Legacy product detail page viewed |
| **Required** | `product_id: string` |
| **Optional** | `entry_point: string` |

---

#### `legacy_product_add_to_collection_clicked`

| | |
|---|---|
| **Trigger** | "Add to Collection" on a legacy product |
| **Required** | `product_id: string` |
| **Optional** | `collection_id: string` |

---

#### `legacy_product_send_clicked`

| | |
|---|---|
| **Trigger** | "Send" on a legacy product |
| **Required** | `product_id: string` |
| **Optional** | — |

---

## 2. Entity Model

All IDs should be stable, server-generated, and passed as event properties. The following entities are the analytical objects of record.

### Entity Definitions

| Entity | ID Format | Description | Lifecycle |
|---|---|---|---|
| **Account** | `acc_*` | Snappy account (company admin) | Created at onboarding |
| **Organization** | `org_*` | Parent org (may have multiple accounts) | Created at signup |
| **User** | `usr_*` | Individual user within an account | Created at user creation |
| **Logo** | `lgx_*` | A specific uploaded or fetched logo file | Created on upload/fetch; immutable after creation |
| **Design** | `dsg_*` | Named swag workspace (e.g., "Holiday 2026") | Created by user; mutable |
| **Designed Item** | `dsi_*` | A product with a specific canvas configuration | Created on design tool save |
| **Product** | `prd_*` | Catalog product (from Covver or custom) | Managed by platform |
| **Theme** | `thm_*` | Pre-configured design template | Managed by platform |
| **Collection** | `col_*` | Recipient-facing curated product set | Created by user; mutable |
| **Store** | `str_*` | Storefront experience | Created by user |
| **Bulk Quote** | `bqt_*` | A bulk product inquiry submission | Created on form submission |
| **Send** | `snd_*` | A gifting event | Created on send initiation |

---

### ID Tracking Rules

**Logo ID**
- A new `logo_id` is generated each time a logo is saved — even if the file is identical to a previous upload.
- This allows tracking of replacement chains.
- The `CompanyLogoContext` should maintain a `logo_history: string[]` in addition to the current `logoUrl`.

**Design ID**
- Generated server-side at creation (`design_${timestamp}_${random}` is prototype-only; production must use server IDs).
- Passed on every event that occurs within or because of a Design.

**Session ID**
- Generated client-side at session start.
- Persisted in `sessionStorage` (cleared on tab close, not on refresh).
- Used to stitch events within a single working session even across routes.

---

### Property Reference Table

| Property Name | Type | Entity | Used in |
|---|---|---|---|
| `design_id` | string | Design | Design, Workspace, Collection, Store events |
| `logo_id` | string | Logo | All logo events, design_created, design_tool events |
| `product_id` | string | Product | Catalog, Product Detail, Design Tool, Picker events |
| `theme_id` | string | Theme | discover_theme_clicked, design_created |
| `collection_id` | string | Collection | collection_created, collection_send_started |
| `store_id` | string | Store | store_create_initiated |
| `designed_item_id` | string | Designed Item | design_tool_saved_* |
| `bulk_quote_id` | string | Bulk Quote | product_bulk_quote_submitted |
| `send_id` | string | Send | collection_send_started |
| `account_id` | string | Account | Global context |
| `org_id` | string | Organization | Global context |
| `user_id` | string | User | Global context |

---

## 3. Funnels

All funnels should be built with a **14-day conversion window** unless otherwise noted.

---

### 3.1 Discovery → Design Funnel

Measures how effectively the Discover page converts visitors into design creators.

```
Step 1:  discover_page_viewed
Step 2:  [any] discover_theme_clicked | discover_popular_item_clicked | discover_diy_option_clicked | logo_upload_started
Step 3:  logo_acquired
Step 4:  branding_loader_completed  [if quick start path]
Step 5:  design_created
Step 6:  design_opened
```

**Segment by:** `origin` (quick_start, theme, new_design_button)
**Key drop-off to watch:** Step 2 → Step 3 (logo acquisition friction)

---

### 3.2 Design Tool Completion Funnel

Measures whether users who enter the design tool actually complete a design.

```
Step 1:  design_tool_opened
Step 2:  design_tool_logo_placed  [if no logo at open]
Step 3:  design_tool_save_started
Step 4:  design_tool_saved_to_existing | design_tool_saved_as_new
```

**Segment by:** `entry_point` (discover_popular, product_detail, workspace, catalog)
**Key metric:** Completion rate = Step 4 / Step 1
**Compare by entry_point** to evaluate the impact of routing changes (e.g., Discover → Design Tool directly vs. Discover → Product Detail → Design Tool)

---

### 3.3 Design → Collection Creation Funnel

Measures conversion from a completed Design to a sent Collection.

```
Step 1:  design_opened             (is_design_ready: true)
Step 2:  design_deliver_clicked
Step 3:  design_delivery_method_selected  (method: gift_collection)
Step 4:  collection_preview_viewed
Step 5:  collection_budget_set
Step 6:  collection_send_started
```

**Segment by:** `product_count`, `alert_count`
**Key drop-off:** Step 4 → Step 5 (budget selection friction)

---

### 3.4 Design → Store Creation Funnel

```
Step 1:  design_opened
Step 2:  design_deliver_clicked
Step 3:  design_delivery_method_selected  (method: storefront)
Step 4:  store_create_initiated
```

**Note:** Steps beyond Step 4 depend on the Covver store tool, which is external. Track `store_create_initiated` as the terminal event for now.

---

### 3.5 Logo Acquisition Funnel

Measures the end-to-end success rate of getting a usable logo into the system.

```
Step 1:  logo_upload_started | logo_fetch_started
Step 2:  logo_acquired
Step 3:  logo_analysis_completed  (passed: true)
Step 4:  design_created           (had_logo: true)
```

**Segment by:** `method` (upload, fetch)
**Key metric:** % of logo acquisitions that reach a usable state without replacement

---

### 3.6 Quality Alert Resolution Funnel

Measures whether users resolve design quality issues and reach Design Ready.

```
Step 1:  design_quality_alert_viewed
Step 2:  design_tool_opened        (from workspace, to fix product)
Step 3:  design_tool_saved_to_existing
Step 4:  design_opened             (is_design_ready: true)
```

**Conversion window:** 7 days
**Key metric:** % of users with alerts who reach Design Ready

---

### 3.7 Bulk Quote Funnel

```
Step 1:  catalog_product_clicked   (product_type: bulk)
Step 2:  product_bulk_quote_started
Step 3:  product_bulk_quote_submitted
```

---

### 3.8 Popular Items → Send Funnel (new flow)

Specific funnel for the Discover → Design Tool → Send flow.

```
Step 1:  discover_popular_item_clicked
Step 2:  design_tool_opened        (entry_point: discover_popular)
Step 3:  design_tool_saved_*
Step 4:  design_opened
Step 5:  design_deliver_clicked
Step 6:  collection_send_started
```

**Conversion window:** 7 days
**Compare against:** Catalog → Product Detail → Design Tool path to measure uplift from routing change

---

## 4. Executive Dashboards

### Dashboard 1: Weekly KPIs — Swag Health

Reviewed weekly by Product Leadership and Growth.

| Metric | Calculation | Target Direction |
|---|---|---|
| Accounts with ≥1 Design | `DISTINCT account_id WHERE design_created` (rolling 28d) | ↑ |
| New Designs created (weekly) | `COUNT design_created` | ↑ |
| Design → Collection rate | `designs with collection_send_started / designs_created` | ↑ |
| Design → Store rate | `designs with store_create_initiated / designs_created` | ↑ |
| Logo acquisition success rate | `logo_acquired / (logo_upload_started + logo_fetch_started)` | ↑ |
| Design Tool completion rate | `design_tool_saved_* / design_tool_opened` | ↑ |
| Collections sent (weekly) | `COUNT collection_send_started` | ↑ |

---

### Dashboard 2: Funnel Health

Reviewed weekly by Product and Engineering.

Show step-level conversion for each funnel in Section 3 with week-over-week delta. Flag any step with >10% drop week-over-week.

Key views:
- Discovery → Design conversion by origin
- Design Tool completion rate by entry_point
- Alert resolution rate (% of users with alerts who reach Design Ready within 7 days)
- Logo acquisition method breakdown (upload vs. fetch)

---

### Dashboard 3: Discovery Performance

Reviewed weekly by Product and Growth.

| Metric | Breakdowns |
|---|---|
| Theme click rate (clicks / views) | By theme_name |
| Popular item click rate | By product_id, position |
| DIY option click rate | By option |
| Designs created from each discovery path | By origin |

Goal: understand which discovery surfaces drive the most Design creation.

---

### Dashboard 4: Logo Quality Friction

Reviewed weekly by Product and Data.

| Metric | |
|---|---|
| Logo analysis pass rate | % of `logo_analysis_completed` where `passed: true` |
| Most common quality issues | Top 5 `issue_type` values |
| Abandonment after quality warning | % of `logo_quality_warning_shown` with no `logo_acquired` in next 30 min |
| Logo replacement rate | `logo_replaced / logo_acquired` |
| Avg replacements before Design Ready | Per design |

---

### Dashboard 5: Product & Theme Performance

Reviewed monthly by Product and Merchandising.

- Top 10 products by `design_tool_opened` count
- Top 10 products by `design_tool_saved_*` count
- Top 10 themes by `discover_theme_clicked` → `design_created` conversion
- Top 10 products added to collections (`collection_send_started` with product in list)

---

## 5. Business Questions

The following questions must be answerable from the event data above.

### Adoption

1. What % of Snappy accounts have created at least one Design?
2. What is the week-over-week growth rate of Design creation?
3. Which customer segments (by org size, plan tier) have the highest Design adoption?
4. How many accounts upload a logo but never create a Design?

### Discovery

5. Which discovery path (Quick Start, theme, popular item, DIY, catalog) has the highest rate of Design creation?
6. Which themes drive the most Design creation?
7. Which popular products convert best from click → design tool save?
8. What % of users who view the Discover page take any action within the session?

### Design Tool

9. What % of users who open the Design Tool save a design?
10. What is the abandonment rate of the Design Tool by entry point?
11. What is the average number of layers added before saving?
12. What % of Design Tool sessions include a logo placement?
13. How does the Design Tool completion rate differ between users who had a logo at open vs. those who didn't?

### Logo Quality

14. What % of logos pass Covver analysis on first upload?
15. Which logo issues (low_resolution, wrong_format, etc.) occur most frequently?
16. What % of users who see a quality warning replace their logo?
17. What % of users who see a quality warning abandon entirely?
18. How does logo quality at creation correlate with Design → Collection conversion?

### Collection & Distribution

19. What % of Designs are used to create at least one Collection?
20. What is the median time from `design_created` to `collection_send_started`?
21. What % of Collections sent include only swag items vs. mixed (BYOC)?
22. What budget level is most commonly selected in Collection Preview?
23. How many products are hidden when a budget filter is applied (friction signal)?

### Store

24. What % of Designs are used to create a Store?
25. Which Design origins (theme, quick start, blank) lead most often to Store creation?

### Quality Alerts

26. What % of designs have at least one quality alert at any point?
27. What % of users with quality alerts resolve them within 7 days?
28. What is the alert-to-resolve time (median)?
29. Do quality alerts correlate with lower Collection creation rates?

### Legacy Products

30. How often are legacy products added to new Collections?
31. What % of legacy product send events are for products without any Design?

---

## 6. Logo Friction Analysis

### Overview

Logo quality is a critical friction point. A user may acquire a logo via four methods, each with different quality risk profiles:

| Method | Quality Risk |
|---|---|
| File upload (PNG/JPG) | High — raster images may be low resolution |
| File upload (SVG) | Low — vector, scales cleanly |
| Domain fetch (Clearbit) | Medium — fetched files vary in quality |
| Select existing | None — already validated |

The goal of this framework is to quantify friction at each stage and understand recovery vs. abandonment behavior.

---

### 6.1 Logo Session Model

Define a **Logo Session** as the sequence of logo-related events within a single Design creation flow. A Logo Session starts at `logo_upload_started` or `logo_fetch_started` and ends when either:
- A Design is created with a passing logo (`design_created` with `had_logo: true`)
- The user abandons (session ends with no `design_created`)

Track all events in the Logo Session with a shared `logo_session_id` property.

---

### 6.2 Event Model for Logo Friction

Add `logo_session_id` as a property to all logo-related events. This enables session-level analysis.

#### Additional events for this framework

**`logo_session_started`**
| | |
|---|---|
| **Trigger** | First logo acquisition attempt (upload or fetch) in a session |
| **Required** | `logo_session_id: string`, `method: string`, `surface: string` |

**`logo_issue_acknowledged`**
| | |
|---|---|
| **Trigger** | User dismisses or interacts with quality warning without replacing logo |
| **Required** | `logo_session_id: string`, `logo_id: string`, `issue_type: string`, `action: 'continue_anyway' \| 'dismissed'` |

**`logo_session_ended`**
| | |
|---|---|
| **Trigger** | Design created or session abandoned (use 30-min inactivity as abandonment signal) |
| **Required** | `logo_session_id: string`, `outcome: 'success' \| 'abandoned'`, `total_logo_attempts: number`, `final_logo_id: string \| null`, `total_replacements: number` |
| **Optional** | `abandonment_stage: 'pre_acquisition' \| 'post_warning' \| 'post_acquisition'` |

---

### 6.3 Metrics & Queries

**Which logo acquisition method performs best?**
Query: `logo_acquired.count GROUP BY method` + `logo_analysis_completed WHERE passed=true GROUP BY method`
→ Pass rate per method = `passed / acquired` per method

**What % of users replace their logo after upload?**
Query: `logo_replaced WHERE triggered_by != 'quality_warning' / logo_acquired WHERE method='upload'`

**What % of users replace their logo after fetch?**
Query: `logo_replaced / logo_acquired WHERE method='fetch'`

**How many logo analysis failures occur?**
Query: `logo_analysis_completed WHERE passed=false` (by week, by issue_type)

**Which logo issues occur most frequently?**
Query: `UNNEST(issues) FROM logo_analysis_completed WHERE passed=false GROUP BY issue`

**What % of users abandon after a logo issue?**
Query: `logo_session_ended WHERE outcome='abandoned' AND abandonment_stage='post_warning' / logo_quality_warning_shown`

**What % of users successfully recover from a logo issue?**
Query: `logo_replaced WHERE triggered_by='quality_warning' AND subsequent design_created / logo_quality_warning_shown`

**How many logo replacements before Design Ready?**
Query: `AVG(total_replacements) FROM logo_session_ended WHERE outcome='success'`
→ Also: distribution (P50, P90) of replacements per successful session

---

### 6.4 Logo Quality Friction Scorecard

Build a weekly scorecard with these headline numbers:

| Metric | Formula |
|---|---|
| Upload pass rate | `logo_analysis_completed(passed=true, method=upload) / logo_acquired(method=upload)` |
| Fetch pass rate | `logo_analysis_completed(passed=true, method=fetch) / logo_acquired(method=fetch)` |
| Post-warning replacement rate | `logo_replaced(triggered_by=quality_warning) / logo_quality_warning_shown` |
| Post-warning abandonment rate | `logo_session_ended(outcome=abandoned, stage=post_warning) / logo_quality_warning_shown` |
| Avg replacements per successful session | `AVG(total_replacements) WHERE outcome=success` |
| Logo → Design Ready rate | `design_opened(is_design_ready=true) / logo_acquired` (14d window) |

---

## 7. North Star Metrics

### North Star Metric

**Designs Activated**

> The number of unique Designs that result in at least one Collection send or Store creation within 30 days of being created.

**Why this metric:**
- It measures the full value chain: logo → design → distribution
- A Design that is never activated represents sunk effort (logo upload, product selection, design work) with no business outcome
- It is resistant to vanity inflation: creating Designs is easy, but activating them requires real user intent and product quality
- It directly maps to GMV (activated Designs drive swag sends and store purchases)

**Formula:**
```
Designs Activated (monthly) =
  COUNT(design_id)
  WHERE design_id IN (
    SELECT design_id FROM collection_send_started
    UNION
    SELECT design_id FROM store_create_initiated
  )
  AND design_created.timestamp >= NOW() - 30 days
```

---

### Input Metrics

These are the leading indicators that drive the North Star. Each maps to a specific part of the funnel.

| Input Metric | What it measures | Funnel Stage |
|---|---|---|
| **Logo acquisition rate** | % of Discover sessions that result in a logo acquired | Discovery → Logo |
| **Design creation rate** | % of logo acquisitions that result in a Design created within 7 days | Logo → Design |
| **Design Tool completion rate** | % of design tool opens that result in a save | Design Tool |
| **Design Ready rate** | % of Designs that reach 0 quality alerts | Design → Ready |
| **Design → Collection conversion rate** | % of Design Ready states that lead to `collection_send_started` | Design → Distribution |
| **Design → Store conversion rate** | % of Design Ready states that lead to `store_create_initiated` | Design → Distribution |

---

### Guardrail Metrics

These are metrics that must not degrade while improving the North Star.

| Guardrail | Threshold | Risk |
|---|---|---|
| **Logo acquisition success rate** | Must not fall below 80% | Aggressive logo gating could hurt this |
| **Design Tool abandonment rate** | Must not exceed 60% | Routing changes (e.g., Discover → Tool directly) could hurt this |
| **Quality alert rate** | Must not increase week-over-week | Indicates degradation in logo analysis or product compatibility |
| **Bulk quote submission rate** | Must hold steady | Ensure Catalog changes don't suppress bulk intent |
| **Collection product visibility rate** | `visible_products / total_products` in Collection Preview must stay > 70% | Budget/country filtering must not systematically hide products |

---

### Metric Hierarchy Summary

```
NORTH STAR
  Designs Activated (Collection send or Store created within 30d)

INPUT METRICS
  ├── Logo acquisition rate          (Discovery → Logo)
  ├── Design creation rate           (Logo → Design)
  ├── Design Tool completion rate    (Design Tool)
  ├── Design Ready rate              (Quality)
  ├── Design → Collection rate       (Distribution)
  └── Design → Store rate            (Distribution)

GUARDRAIL METRICS
  ├── Logo acquisition success rate  ≥ 80%
  ├── Design Tool abandonment rate   ≤ 60%
  ├── Quality alert rate             stable or declining
  ├── Bulk quote submission rate     stable
  └── Collection product visibility  ≥ 70%
```

---

*Implementation note: All events in this spec should be treated as a single taxonomy. Before shipping, validate naming against your existing Amplitude/Mixpanel schema to avoid collisions with platform-level auto-tracked events.*
