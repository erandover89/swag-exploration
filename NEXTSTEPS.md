# NEXTSTEPS.md — Swag Experience Prototype: Iteration Roadmap

> This document captures UX suggestions, open questions, and implementation ideas for the next iteration of the Swag Experience prototype. It is organized by theme and roughly prioritized.

---

## 1. Critical Flow Gaps (Build These Next)

### 1.1 The "Create" / Logo Upload Flow
The current prototype assumes a logo already exists (ACME is hardcoded). The real flow begins with:
- Upload company logo (PNG/SVG/EPS)
- Auto-generate logo placement mockups on each product category
- Show a preview before entering the catalog

**Suggestion:** Add a "Logo Setup" onboarding step or a persistent "Your Logo" panel in the sidebar that lets users swap/upload a logo and see all products update in real-time. This directly addresses the discoverability-to-confidence gap identified in the challenges doc.

### 1.2 Collection Builder
The "Add To A Collection" CTA exists but has no destination. Collections are a core object in the 2026 strategy — they are how managers curate a shortlist and let recipients self-select.

**Suggestion:** Build a sliding panel (Sheet) that shows the current collection, allows reordering items, and surfaces the "Create a Collection and Let Them Pick" CTA. This is the most impactful missing piece for the Erin (mid-market) persona.

### 1.3 Send / Recipient Flow
After selecting a product or collection, the user needs a way to send it. The current prototype dead-ends at CTAs.

**Suggestion:** Create a simple `/send` wizard with 3 steps:
1. **Choose what to send** — specific product vs. collection vs. let recipient pick
2. **Add recipients** — paste emails, upload CSV, or pick from contacts
3. **Personalize & schedule** — custom message, delivery date, budget limit

---

## 2. Catalog & Discovery Improvements

### 2.1 Active Filter Pills
When filters are applied (category, budget, country), the filter bar should show removable pills summarizing active filters. Helps users understand their current context and easily reset.

```
[Budget: $50–$100 ×]  [Apparel ×]  [Clear All]
```

### 2.2 Product Count in Real-Time
Show a "Showing X of Y products" counter above the grid. Updates as filters are applied. Small but significantly reduces uncertainty.

### 2.3 Category Icons in Sidebar
Replace plain text category checkboxes with icon + label pairs:
- 👕 Apparel, 💻 Electronics, 🏠 Home & Decor, 🥤 Drinkware, 🎒 Bags, ✏️ Accessories, 🏕️ Outdoor

### 2.4 Empty-State Messaging
The current empty state shows a generic "No products found" message. Improve it with:
- Specific cause ("No Apparel products under $50")
- Actionable suggestions ("Try removing the budget filter")
- Related products from adjacent categories

### 2.5 "Featured" or Curated Sections
Instead of a flat grid, consider a curated layout for the default view:
- "Popular this month" (top row, full-width cards)
- "New arrivals"
- "Great for onboarding kits"

This mirrors competitor UX (SwagUp, Sendoso) and reduces decision paralysis.

### 2.6 Product Type Badges Are Confusing
"On Demand" vs "Bulk Orders" is a platform-internal distinction. Recipients don't think this way.

**Suggestion:** Consider renaming or reframing in context:
- "On Demand" → "Send Individually" (with a person icon)
- "Bulk Orders" → "Order in Bulk" (with a stack icon)
Or surface this information only when contextually relevant (e.g., in the quantity selector on the product detail page).

---

## 3. Product Detail Page Improvements

### 3.1 Logo Placement Editor
The "Edit Design" button should open a canvas-style editor (or a simplified version) that lets the user:
- Drag the logo to a new position on the product
- Resize and rotate the logo
- Switch between embroidery / print / engraving styles
- Preview in different product colors

This is the key confidence-builder before committing to a send/order.

### 3.2 Live Color Preview
Selecting a color should immediately update the product image (or tint the background) to reflect the selection. The current prototype changes background tint but should aim for actual product color change.

### 3.3 Size Guide
For apparel products, add a "Size Guide" link next to the size selector that opens a modal with a measurement chart. Critical for reducing post-send friction.

### 3.4 Social Proof / Reviews
Add a rating row (e.g., ★ 4.7 · 234 orders) near the price. Even if mocked, it signals quality confidence to the sender.

### 3.5 "Ships to [Country]" Indicator
Since the catalog has a country filter, the product detail page should reflect the selected shipping destination and show estimated delivery time.

### 3.6 Quantity Selector for Bulk
For bulk products, add an interactive quantity input that updates the total price:
```
Quantity: [  24  ] → Total: $1,560.00
```

---

## 4. AI / Snipsy Integration

### 4.1 "Ask Snipsy" Chat Panel
The AskSnippyButton is a placeholder. Wire it to a side panel (Sheet) with:
- Contextual suggestions based on current page/filters
- Natural language product search ("Find me eco-friendly gifts under $50")
- "Build a kit for a new hire in Austin" → returns a pre-filled collection
- Explanation of product differences ("What's the difference between on-demand and bulk?")

### 4.2 Smart Kit Recommendations
On the catalog page, surface an "AI-suggested kit" section:
> "For a 50-person onboarding kit, we suggest: North Face Fleece + Swell Tumbler + Moleskine Notebook — estimated $275/person"

### 4.3 Logo Quality Checker
When a logo is uploaded, auto-analyze and warn if resolution is too low for embroidery, or if the color won't print well on a dark background.

---

## 5. Collection / Kit Builder

### 5.1 Budget Calculator
Show a running total as products are added to a collection. Bonus: add a "Budget per recipient" input that filters eligible products.

### 5.2 "Let Them Pick" Mode
Allow the sender to define a budget cap and offer multiple product options. Recipients see a personalized selection page and pick their preferred item(s). This is the highest-value differentiator vs. sending specific gifts.

### 5.3 Collection Templates
Pre-built kits for common use cases:
- New Hire Welcome Kit
- Sales Performance Reward
- Remote Team Holiday Box
- Conference Swag Bag

---

## 6. Technical / Engineering Priorities

### 6.1 Real API Integration
Replace `mockData.ts` with API calls to the Covver engine:
- `GET /products?country=US&minPrice=0&maxPrice=100&category=Apparel`
- `POST /logos` — upload and store company logos
- `POST /designs` — generate design mockup for a product+logo combination
- `GET /designs` — list all existing designs

### 6.2 State Management
As collections, designs, and send flows get added, introduce lightweight global state (Zustand or Jotai recommended over Redux for this scale).

### 6.3 Persistent Filters
Save filter state (budget, country, categories) to URL params so users can bookmark/share filtered catalog views:
```
/swag?country=US&budget=50-100&category=Apparel
```

### 6.4 Image Assets
Replace emoji placeholders with real product photography. The card and detail page layouts are already built to accommodate images — swap the emoji `<span>` for an `<img>` tag.

### 6.5 Analytics Events
Track key funnel moments:
- `catalog_viewed` (with active filters)
- `product_detail_viewed`
- `add_to_collection_clicked`
- `send_gift_clicked`
- `edit_design_clicked`

---

## 7. Open Design Questions

| Question | Current State | Recommendation |
|---|---|---|
| Should "Design" be its own entity or live on a product? | Unclear | Make Design a first-class entity: a product + logo + placement = a Design. Designs are shareable and reusable. |
| Auto-create design on logo upload? | Debated in challenges doc | Yes — reduce friction by auto-generating a preview. User confirms or edits. |
| Where does the user manage their logo library? | Not implemented | Add a "Brand Assets" section under Manage. |
| How does the Erin persona (mid-market) share a collection with her manager for approval? | Not in prototype | Add an "Invite to review" share flow, similar to Figma share. |
| Mobile experience? | Desktop only | Q3 2026 on roadmap. All layouts use max-w + padding — should be refactorable. |

---

## 8. Quick Wins for Next Session

These are small, high-impact additions that can be done in 1–2 hours:

1. **Clickable breadcrumb** on product detail that navigates back preserving catalog filters
2. **Toast notification** when adding to collection (replace the `alert()`)
3. **Product detail route transition** — fade in/out animation between catalog and detail
4. **Sticky product CTA bar** on mobile (for when viewport is narrow)
5. **"Related products" section** at the bottom of the product detail page
6. **Logo display toggle** in the filter bar — switch between "with logo" and "without logo" mockup view
7. **Dark/light brand logo auto-switch** based on product color selection

---

*Last updated: 2026-02-23 | Prototype version: 0.1.0*
