# Snappy Swag – Research & Context Document

## 1. Company Background

**Snappy** (snappy.com) is a B2B gifting platform that enables organizations to send gifts to employees, customers, and prospects. The typical experience:
- Sender creates a **gift collection** (curated set of gift options)
- Gift is delivered via email/SMS/link
- Recipient chooses their favorite item and enters shipping address
- Snappy also supports **single-item sends** and **Swag** (branded/customized items)

**Covver** (covver.io) was acquired by Snappy in early 2025. Covver brought:
- An **AI-powered Auto Designer** for on-demand branded printing
- Stronger international coverage
- Premium brand catalog (Nike, Carhartt, North Face, Under Armour, etc.)
- Personalized items (names, anniversary year, birth sign)

---

## 2. 2025 Recap

### Business Performance
- **~$15.1M Swag GMV** total (12% of overall Snappy GMV)
- **+84% YoY growth**
- Breakdown:
  - $6.5M – Covver GMV (2x YoY, accelerated by Phase 2 integration in July 2025)
  - $5.6M – Legacy + Manual On-Demand GMV
  - $2.9M – Bulk + Kits GMV

### Key Product Milestones
- **Q1 2025**: Covver Acquisition closed
- **Feb 2025**: Swag Phase 1 – Re-skin integration
- **Apr 2025**: Covver customers fully migrated
- **Jun 2025**: Swag Phase 2 – Swag Products migrated to Snappy Marketplace
- **Aug 2025**: Swag Phase 3 – Stores in Dashboard, unified billing, pricing/shipping alignment
- **Nov 2025**: Bug fixes and continuous support

### The Critical Problem
Despite strong growth, **swag adoption flatlined at ~12-13%** of all Snappy customers from 2024 to 2025 — meaning **87% of Snappy customers buy swag from someone else**.

---

## 3. Core Problems Identified

### 3.1 "Too Many Doors"
The current product has multiple competing paths to create swag:
- Instant On-Demand
- On-Demand Plus
- Bulk & Kits
- Snappy Stores
- Covver Stores (still discoverable at covver.io)

Customers don't understand the taxonomy. Internal systems run on two separate APIs (Snappy API + Covver API).

### 3.2 Low Discoverability
- Only **2–3%** of Snappy.com visitors reach swag pages (down from 6% in mid-2025)
- Only **~8%** of logged-in users visit the Swag Hub in the dashboard
- Sales calls mentioning swag dropped from **72% → 53%** over 3 years

### 3.3 Poor Conversion Funnel
Current funnel (for users who find the swag section):
1. Traffic to Swag Hub: ~8%
2. Start design process: ~39% (of those who get to hub)
3. Complete design: ~40% conversion
4. Create-to-send: ~19%
5. **Overall swag send rate: ~7.5%** of all users who enter the swag flow

**Target for 2026**: Create-to-send = 12.5% (66% improvement)

### 3.4 Quality Issues
- Logo placement often incorrect
- Color choices wrong for embroidery vs. print
- Customers send swag that comes out poorly → destroys trust
- CX team often has to catch and manually fix issues post-submission

### 3.5 Enterprise Scale Gap
- Large enterprises (like the Marsh example: 100k employees, 88 countries, $4M budget) require white-glove service
- No self-serve path for enterprise bulk orders
- GTM team spends enormous time building proposals, price sheets, timelines

---

## 4. User Personas

### "Donna" – SMB Self-Serve
- **Role**: HR Specialist at small company (~80 employees)
- **Need**: Recognize employee anniversaries with branded + unbranded gifts
- **Behavior**: Found swag hub, created 2 collections, set up automation campaign
- **Pain**: Logo placement and color choices were off; required extra effort to get right
- **Outcome**: Successful, but with friction

### "Erin" – Mid-Market Self-Serve
- **Role**: CHRO at nonprofit (~500 employees)
- **Need**: Holiday gift branded collection for all US employees
- **Behavior**: Found swag hub, overwhelmed by many similar-looking collections, created new one
- **Pain**: Logo didn't work well for embroidery; CX team had to fix and resend
- **Outcome**: Resolved, but required manual intervention from Snappy's ops team

### "Bonnie" – Enterprise (High-Touch)
- **Role**: Brand Specialist at large insurance co. (100k employees, 88 countries)
- **Need**: Global branded gift send with $4M budget
- **Behavior**: Reached out to account team who created custom proposals, price sheets, timelines
- **Pain**: Complexity too high; project was ultimately cancelled
- **Outcome**: Trust earned, but no revenue

---

## 5. The Swag Continuum

Snappy needs to serve customers across a spectrum:

| Dimension | Self-Service | Enterprise |
|---|---|---|
| Creation | Instant | Rigorous approval process |
| Buying | Every admin | Centralized procurement |
| Management | Lightweight | Sophisticated tools |
| Motion | Product-led | Sales-led |
| Deal Size | Smaller | Larger |
| Support | Limited | Dedicated |
| ICP | SMB, decentralized | Enterprise, CMO/Brand/Procurement |
| Customer voice | "I want to do it myself, quickly" | "Everything must be approved, large send" |

**Strategy: Build from the middle outward** — nail the mid-market self-serve experience first, then expand to both ends.

---

## 6. 2026 Strategy

### Mission
> **"Empower Every User to Create & Send Perfect Swag, Anywhere on Earth."**
> *(All in the time it takes to Drink a Cup of Coffee)*

### Strategic Pillars
1. **Building a World-class Team** – Hiring Product/Eng leadership
2. **Developing a scalable Swag backend** – One backend powered by Covver engine
3. **Delivering a magical Swag Experience** – Simple, intuitive, inspiring

### Architecture: FROM → TO
**FROM**: Two separate systems (Snappy API + Covver API) with 5+ product types
**TO**: Single Snappy API → Covver Engine + Self-serve UX + AI → three clean modes:
- On-Demand (no minimums)
- Bulk & Kits (with minimums)
- Stores (maintenance mode)

### Operating Principles
1. **"Swag as Craft"** – Create WOW moments, not just features
2. **"Focus and Excellence"** – Swag and Gifting as a unified ecosystem
3. **"AI AI AI AI"** – AI-first across curation, design, and the entire journey

---

## 7. 2026 Roadmap

| Quarter | Key Deliverables |
|---|---|
| Q1 2026 | Hire team; New Swag Backend (Internal API) |
| Q2 2026 | New Swag Experience: Browse Catalog, Design Flow, Guest Experience (Snappy.com); Public Swag API |
| Q3 2026 | New Swag Experience: Mobile Support, AI Assistant, Collection Creation; OrderMesh Integration |
| Q4 2026 | Swag Experience Iterations; Holiday Scale |

---

## 8. Key Metrics

### North Star
- **$12M Swag Net Revenue** in 2026 (2x from $6M in 2025)

### Quality Constraints
| Metric | 2025 Actual | 2026 Target |
|---|---|---|
| % Swag create-to-send conversion | 7.5% | >12.5% |
| % Swag logo adoption rate | 13% | 20% |
| # Swag API Partners | ~4 | 7 |

### Funnel KPIs (Baseline → Target)
| KPI | Baseline | Target |
|---|---|---|
| % Traffic to Swag Pages (Snappy.com) | 3% | 10% |
| % Logged-in traffic to Swag Hub | 8% | 30% |
| % Swag design creation conversion | 39% | >50% |
| % Created-to-send conversion | 19% | >25% |

---

## 9. The New Swag Journey (DISCOVER → CREATE → MANAGE → DISTRIBUTE)

### DISCOVER
- Sleek, simple swag catalog for both logged-in users and public guests
- Available at `/swag` on Snappy.com
- Sortable, searchable catalog of all base swag items
- Budget filter, country filter, category/brand filters

### CREATE
- Click on a product → add logo → save design
- AI-assisted design journey (Auto Designer from Covver)
- Bulk design: apply logo to many products at once
- New entity: **"Design"** (separate from Gift Collections)

### MANAGE
- Find, approve, and share swag designs within the enterprise
- Approval workflows for enterprise customers
- Design library

### DISTRIBUTE
- Send swag in a collection (recipient picks) or as a single item
- Integration with automations (anniversary campaigns, etc.)
- Bulk send / Bulk & Kits flow

---

## 10. Figma Design Analysis

### Swag Catalog Page (node 1687:41826 – "Browse Gifts")

**Layout**: Full-width dashboard with:
- **Top bar**: Plan indicator, global search, credit usage, country selector, settings, notifications, user avatar
- **Main nav**: Snappy logo + account selector, then horizontal tabs: Browse | Send | Track | Manage, plus "+ Create" button and "Send Gifts" CTA
- **Page header**: Breadcrumb (DISCOVER / SWAG), "Swag" H1 title, "Ask Snipp AI" floating button (top right)
- **Filter tabs**: All Catalog | On Demand | Bulk Orders
- **Sort/filter bar**: Budget dropdown, USA country dropdown, Most Popular sort, Search by name input
- **Left sidebar**: Filters panel with Categories (checkbox list), Brand (accordion), Size (button group: XS/S/M/L/XL), Color (swatches)
- **Product grid**: 3-column grid of product cards
- **Product card**: Tag row (POPULAR / SWAG), large product image with logo applied, brand name, product name, price, "+ MORE OPTIONS AVAILABLE" link, hover "+ add to collection" icon

**Key UX Decisions**:
- Products shown with logo already applied (ACME/company brand auto-applied)
- "POPULAR" / "SWAG" / "SUSTAINABLE" tags visible immediately
- Clean, minimal white card design
- Both On Demand and Bulk items shown in same catalog (unified)

### Product Details Page (node 1728:44487)

**Layout**:
- Same header structure
- Breadcrumb: DISCOVER / SWAG / CUTTER & BUCK / PRODUCT NAME
- **Left**: Large product image (with logo applied), "Edit Design" button overlay, thumbnail strip below
- **Right**: POPULAR + SWAG tags, "BY [BRAND]" label, large product name, price + shipping info, color picker (swatches with selected state), size selector (pill buttons), recipient note, 3 CTAs:
  1. **"Send This Specific Gift"** (primary, blue, full-width)
  2. **"Edit Design"** (secondary, with pencil icon)
  3. **"Add To A Collection"** (secondary, with grid icon)
- Description section (collapsed/expanded)
- "Ask Snipp AI" floating in top right

**Key UX Decisions**:
- Logo already visible on product — confidence builder
- Recipient picks size/color → reduces sender friction
- Three clear action paths: send now, customize further, or add to collection
- Clean white background, professional typography

---

## 11. Technical Notes from Challenges Doc

### API Endpoints Needed
- `GET /base-swag-products` – Pulls base products from Covver backend
- `POST /upload-logo` – Upload company logo
- `POST /generate-swag-design` – Create items in bulk
- `GET /designs` – Retrieve saved designs
- `GET /swag-products` – Retrieve branded products
- `GET /swag-products-from-design` – Get products from a specific design

### Key UX Decisions from Internal Discussion
1. **Allow bulk logo application** (apply logo to multiple products at once) ✓
2. **Add "Design" as a new entity** (not the same as Gift Collections) ✓
3. **Auto-create swag in draft** – debated; VP Swag (Eric) says risky, other stakeholders push for it

### Let's Send Swag CTAs
- "Create a Collection and Let Them Pick"
- "Design Swag Products in Bulk"
- "Design Swag One-by-One"

---

## 12. Competitive Landscape (Deep Dive)

*Research completed February 2026. Covers 2024–2025 product launches, AI features, and UX evolutions.*

---

### SwagUp (swagup.com)

**Overview:** Most product-forward corporate swag platform, targeting tech companies and HR/People teams for onboarding kits, event swag, and employee gifting at scale. Snappy's closest direct competitor.

**Key UX patterns:**
- **Swag Packs as the primary unit.** Pre-assembled bundles of 5–10 items as the starting point — dramatically lowers activation energy vs. building from scratch.
- **Dashboard-first experience.** Current pack inventory levels, recent shipments, "Reorder / Ship to Someone" quick actions. Acts as a control room.
- **Linear, step-based wizard flows.** Design pack → quantity → mockup → checkout with clear progress indicators.
- **Mockup-first product cards.** Lifestyle mockups (branded tees on hangers) rather than flat product images.
- **Warehouse-on-demand.** Store inventory in SwagUp's warehouse, trigger individual shipments on-demand (e.g., new hire onboarding).

**Design tool:** Functional inline customizer — upload logo, reposition/scale/rotate on 2D flat canvas, "Preview" renders a photorealistic mockup. Color and decoration type selection. **Weakness:** feels like a technical tool, not a design experience.

**Stands out:** Best-in-class inventory + on-demand shipping UX. Swag pack as primary unit is the right product instinct. Strong HRIS integrations (Workday, BambooHR).

**Falls short:** No recipient-choice mechanic. Shallow catalog browsing — no semantic search, no editorial curation. No AI features. Poor mobile experience.

---

### Sendoso (sendoso.com)

**Overview:** Market leader in B2B corporate gifting, targeting sales and marketing teams. A platform for orchestrating sends at scale via CRM integrations — not primarily a product catalog.

**Key UX patterns:**
- **Send-centric UX.** Everything organized around "Sends." The catalog exists to support the send.
- **Integration-first.** Primary entry points: Salesforce/HubSpot sidebars, Slack slash commands, Chrome extensions.
- **Budget controls and approval flows are first-class.** Per-user limits, manager approval thresholds, spend reporting — rare in this space.
- **Recipient-choice mechanic.** Sendoso pioneered recipient-choice gifting at B2B scale. "Collections" = named sets of 3–8 items recipients choose from.

**Design tool:** None — Sendoso is not a design platform. Branded swag integrates with third-party vendors (SwagUp, Printfection). Significant capability gap.

**AI features:** Smart Gifting AI (2024) recommends gifts based on LinkedIn profile, CRM fields (company size, deal stage), and send history. AI-suggested send timing. AI-generated personalized gift notes.

**Stands out:** Best-in-class CRM integration and workflow automation. Enterprise-grade budget controls. Pioneered recipient-choice gifting.

**Falls short:** No design platform. Inconsistent catalog quality (marketplace aggregation). Dense UI suited only to power users. Poor price transparency.

---

### Printful (printful.com)

**Overview:** Dominant print-on-demand platform for creators and Shopify stores. Not a corporate swag platform, but sets the **industry benchmark for design tooling and mockup generation**.

**Key UX patterns:**
- **Design Tool as center of gravity.** Browser-based editor with layers, text, graphics, uploaded assets — genuinely polished creative tool.
- **Instant photorealistic mockup generation.** Auto-generates high-quality mockups in real time across multiple angles (front, back, lifestyle) after any change. **Industry-leading.**
- **Template library.** Large library of pre-built design templates by category accelerates the flow for non-designers.
- **Color swatches on product cards.** Clicking a swatch changes the card preview image — delightful UX detail.
- **Rich filter set:** Product type, print technique (DTG/embroidery/sublimation), price, sustainability certifications, print area size, available colors.

**AI features:** AI Image Generator (generates design elements from text prompts within the editor), AI Background Remover, AI Mockup Styles (beta generates scene mockups via AI).

**Stands out:** Industry-best design tooling. Real-time photorealistic mockups. Deepest product catalog. Rich filtering with color swatch previews. AI image generation within the editor.

**Falls short:** No brand kits — logo must be re-uploaded per product. No gift collections, recipient-choice, or distribution mechanics. Design tool built for individual items, not "apply my brand across everything."

---

### Kotis Design (kotisdesign.com)

**Overview:** Branded merchandise agency/platform for mid-market and enterprise. Blends concierge service with self-serve tooling.

**Key UX patterns:**
- **Concierge-forward.** Primary CTAs: "Get a Quote" and "Talk to an Expert." Sales-assisted workflow encouraged.
- **"Swag Stores" as core product.** Internal/external branded storefronts where employees or customers order branded items.
- **Async design collaboration.** Customers submit briefs; Kotis's in-house design team delivers proofs via portal; approval/revision cycles happen asynchronously.

**Design tool:** None — users submit spec forms and receive proofs in 1–3 business days. High quality output, but not self-serve.

**Stands out:** High-quality output via design team involvement. Well-executed company store model for large organizations.

**Falls short:** Not self-serve — design team touchpoint required. No real-time mockup. No recipient gifting or choice mechanics. Catalog UX is a product brochure with a form attached.

---

### Vistaprint Business (vistaprint.com)

**Overview:** Business printing platform expanded into branded merchandise. Targets small businesses and startups. Features the most mature consumer-grade design studio studied.

**Key UX patterns:**
- **Design Studio as anchor.** VistaCreate (Canva-like) with thousands of templates, stock library, full text/layout editing.
- **Template-first for non-designers.** "Browse templates" is the primary entry point — massive industry-specific library.
- **Brand Kit: upload once, apply everywhere.** Upload logo, set brand colors and fonts at account level. Auto-applies to any template. **The most underrated UX innovation in the space.**
- **Cross-product design consistency.** Same design adapted across business cards, banners, mugs, shirts.

**AI features:** AI Design Assistant (generates complete brand identity from text description — logo, palette, font), AI Logo Maker, AI Smart Resize (adapts design for different products), AI Image Upscaler.

**Stands out:** Most polished self-serve design studio. Brand Kit feature is genuinely important. AI brand identity generation is best-in-class for SMB.

**Falls short:** Not a gifting platform — no recipient management or distribution mechanics. Merchandise is an afterthought vs. print products. AI brand identities can feel generic.

---

### 4imprint (4imprint.com)

**Overview:** Largest US promotional products distributor by revenue. Built for transactional volume purchasing by event managers and marketing teams.

**Key UX patterns:**
- **Catalog breadth is the value prop.** Tens of thousands of SKUs.
- **Search-first navigation.** Search bar is the primary navigation method given catalog size.
- **"Blue Box" free sample program.** A free sample product before bulk order commitment — highly effective trust-building mechanism.
- **Best-in-class tiered pricing transparency.** Every product shows per-unit pricing at multiple quantity tiers.

**Design tool:** Inline HTML5 customizer — weakest of all platforms studied. Upload/place logo on line-drawing "virtual proof" (not photorealistic).

**Stands out:** Widest catalog. Best tiered pricing transparency. "Blue Box" sample program reduces purchase hesitation.

**Falls short:** Weakest design tool. Overwhelming catalog with limited curation. No gifting or recipient-choice mechanics. Poor mobile experience.

---

### Competitive Matrix

| Feature | SwagUp | Sendoso | Printful | Kotis | Vistaprint | 4imprint |
|---|---|---|---|---|---|---|
| Self-serve design tool | Moderate | None | **Excellent** | None | **Excellent** | Poor |
| Real-time mockup | Yes | N/A | **Yes (best)** | No | Yes | Basic |
| Brand Kit / upload-once | No | No | No | No | **Yes** | No |
| Recipient-choice gifting | No | **Yes** | No | No | No | No |
| Bundle / pack builder | **Good** | Basic | None | Basic | None | None |
| Catalog depth | Medium | Wide | Deep | Medium | Medium | **Widest** |
| Inventory management | **Excellent** | Moderate | N/A | Good | N/A | N/A |
| CRM / workflow integrations | Moderate | **Excellent** | None | None | None | None |
| AI features | Minimal | Moderate | Moderate | None | Good | None |
| Mobile experience | Poor | Moderate | Moderate | Poor | Moderate | Poor |
| Price transparency | Good | Poor | **Excellent** | Poor | Good | **Excellent** |

---

### Key Takeaways for Snappy

1. **Design tool = moment of truth.** The customization step is the conversion hook. Printful sets the ceiling; 4imprint is the floor. Real-time photorealistic mockups are non-negotiable.

2. **Brand Kit is the highest-leverage friction reducer.** Upload logo once, auto-applied everywhere. No swag-specific platform does this. Vistaprint proves it works.

3. **Recipient choice is Snappy's core moat — apply it to swag.** No swag platform combines great design tooling *and* recipient-choice send mechanics. This is genuinely unique.

4. **Swag Packs as the primary UX primitive.** SwagUp's insight — "pack/collection as the default unit" — is correct. Individual browsing is secondary. Lead with curated templates ("New Hire Kit," "Sales Kickoff Pack").

5. **Curation over overwhelming choice.** Keep the primary catalog tightly curated: 50–100 premium products with editorial curation ("Staff Picks," "Popular for Tech Companies"). Reserve deep filtering for opt-in.

6. **Mockup sharing for internal approval.** The mockup should be shareable as a link for stakeholder approval — turns a tool step into a collaboration primitive.

7. **AI opportunities still largely untapped in swag:** AI-assisted bundle curation based on sender context, AI-generated design elements to complement logos, smart size/quantity recommendations, reorder prediction.

8. **Mobile for post-design flows.** All platforms have poor mobile for the design tool (acceptable). But approval, collection review, and sharing flows should be genuinely excellent on mobile.

**Snappy's Unique Opportunity:** The intersection of (1) recipient-choice gifting mechanics, (2) self-serve swag design tooling, and (3) a unified gifting platform where regular gifts and branded swag share the same send flow. No competitor combines all three. The redesigned Swag flow should make this feel seamless.
