# SanMar Walkthrough — Demo Plan (7/23)

One store lifecycle, told in order: **create → curate → sell → get paid.** ~15 minutes of driving, the rest conversation. Ridgeline United is the "fully dressed" store — when in doubt, return to it.

---

## Before the meeting (10-minute prep, do it the morning of)

1. **Reset once, then stage.** Click **↺ Reset all** (bottom-right pill) to get fresh seed data — then do all staging *after*, and **never touch Reset again** (it wipes staged artwork and orders).
2. **Stage one artwork edit** so the "saves update everything" moment has a before/after: Ridgeline → Products → **Cuffed Beanie** → Edit artwork → nudge the crest, add a small text layer → Save. Confirm the tile updated.
3. **Enable shopper customization**: Ridgeline → Products → **Dri-FIT tee** → toggle *"Show a Customize button on this product"* and set its logo layer to **Editable**.
4. **Files on the desktop**: a clean client logo PNG, a wide banner image (~1600×480), and the sample users CSV (Users tab → **Sample CSV** download).
5. **Two browser tabs**: Tab A = admin (`/stores`), Tab B = storefront. 100% zoom, bookmarks bar hidden.

---

## The arc

### 1. Console — the book of business (1 min) — `/stores`
KPIs across every customer storefront, search/filter/sort, margin per store. Name-drop without clicking: bulk publish/pause, duplicate-as-template, delete.

### 2. Create a store live (3 min) — `+ Create store`
- **Customer**: invent a plausible SanMar end-customer. Customer type is optional — pick one or skip.
- **Logos & brand**: upload the logo → brand colors detected → **recommended garment colors pre-select themselves**. This is the "intelligent color recommendation" they asked for — pause on it.
- **Catalog**: Full Catalog is the default → use the search bar ("hoodie"), toggle a couple of items off, point at the live count.
- **Theme & pricing**: pick a theme, **upload the banner**, drag the markup slider and read the example math aloud ("your cost → store price → your margin"). Note the line: everything is further customizable after creation. → **Generate.**

### 3. Manage — switch to Ridgeline, the dressed store (4 min)
- **Products**: search + filters; open the **tee** → editable description/specs, price override, per-color logo assignment. Click **Edit artwork** → the studio loads with the store crest already placed and every store logo in the picker → move the logo, save → **point at the tile refreshing instantly**.
- **Featured drops**: open the manager, drag to reorder, **Save & publish** — "fully manual merchandising, nothing automatic."
- **Pricing & markup**: markup slider (price list repricing live), volume tiers, **discount codes** — create `SANMAR15` (15% off), then validate it in *Test a code*.
- **Users**: import the CSV → preview screen flags bad rows → import; show per-user discounts and rules ("everyone @club.org gets 10%").
- **Settings**: three access modes incl. **Approved email list**; SEO card with the Google-style preview.

### 4. Shop it — Tab B, `/store/ridgeline-united` (5 min)
- **Home**: banner hero; Featured drops appear **in the exact order just published**.
- **PDP (beanie, then tee)**: gallery (Front / Print detail), size chart, **Garment + Decoration** price split, volume-tier ladder. On the tee: **Customize** → drag the crest, add a player name → save → cart shows the custom preview **+$3/item**.
- **Checkout**: choose **3-Day** shipping, apply **WELCOME10**, type `k.mitchell@ridgelineunited.org` in the email field → **member discount appears live** → place the order → confirmation → **Track this order** (production timeline).
- **Close the loop**: back to Tab A → **Orders** tab → the order just placed is sitting there with margin attributed, and the code's usage count went up. *"The distributor sees every dollar."*

### 5. Optional closers (1 min)
- **Northgate** email gate (`s.porter@northgatehvac.com`) — frame it: *"company-paid uniform program — approved employees check out at no cost."* (That $0 total is by design, not a bug.)
- **Summit** passcode store (`SUMMIT26`) + points-based payment.

---

## Talk tracks for WIP edges (pre-frame; never apologize mid-click)

| Area | Line to use |
|---|---|
| Color swatches | "Colorway selection is wired end-to-end — per-color photography drops in as soon as we load the asset files you offered." **Don't click a swatch expecting the photo to change.** |
| Gallery "Back" view | "Additional angles come from the same asset pipeline." It shows the undecorated garment, and only on flat product shots. |
| Numbers/data | "Everything here is seeded demo data — the flows are real, the figures are illustrative." |

## Do-not-touch list

- **Never Reset** after staging — it wipes artwork, orders, and codes.
- **Bulk rebrand** and **Export CSV** are stubs (they pop an alert). Mention, don't click.
- Keep artwork-studio demos on **apparel or the beanie** — the print area is calibrated for garments, not drinkware.
- In the studio, use **store logos or uploads**; skip the "AI designs" graphic picker (placeholder art from an external service — can also break the shopper-preview export).
- Drag-reorder only works with **search/filters cleared** (intentionally paused otherwise — the hint text explains it if asked).
- Stay out of the legacy tabs (Discover / Catalog / My Swag) and the ACME top chrome — off-script surface.
- The **⊞ Flows / ↺ Reset** pills bottom-right are dev chrome; ignore them on the share.

## If something goes sideways

- Storefront looks stale → hard-refresh **the storefront tab only** (all state is client-side).
- A live-created store misbehaves → finish the point on **Ridgeline** or **Driftwood** (both fully dressed) and move on. Never reset mid-meeting.
- Off-list discount code typed → expected: the validator rejects it with a reason. That's a feature — say so.
