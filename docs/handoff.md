# OfferLane — Client & developer handoff

Quick reference for taking over the project after Options A–D (UI, CMS import, tracking, documentation).

**Full developer guide:** [README.md](../README.md)  
**CMS CSV reference:** [cms-import.md](./cms-import.md)

---

## What you received

| Deliverable | Description |
|-------------|-------------|
| **Product catalog** | `/products` — affiliate product grid, pagination |
| **Store deals** | `/store/[slug]` — coupons & deals, filter/sort |
| **Global shell** | Header, search overlay, auth modal, footer + disclosure |
| **CMS import** | Three CSV files → JSON via `npm run import:cms` |
| **Ads tracking** | UTM persistence, `/api/track`, optional GA4/Meta/TikTok pixels |
| **Content pages** | About, Terms, Privacy, blogs, categories (JSON-driven) |

**Not included in v1:** shopping cart, checkout, buy box, FAQ block, review wall, product video gallery.

---

## Day-one commands

```bash
npm install
cp .env.example .env.local   # optional: add pixel IDs
npm run dev                  # http://localhost:3000
```

After editing CSV data:

```bash
npm run import:cms
npm run build
npm run start                # optional local prod test
```

---

## Your three data files

| File | You change |
|------|------------|
| `public/import/stores.csv` | Store name, logo, description, ribbon |
| `public/import/offers.csv` | Coupons & deals per store |
| `public/import/products.csv` | Catalog for `/products` |

Templates: `public/import/*.sample.csv`

---

## Coupon vs deal (for marketers)

| Type | Button | User flow |
|------|--------|-----------|
| **coupon** | Show Coupon | Reveal code → Copy → optional visit store |
| **deal** | Get Deal | Open affiliate link immediately |

Always set **`outboundUrl`** to your real tracking link before running ads.

---

## Images & links checklist

- [ ] Product images in `public/assets/products/`
- [ ] Store logos in `public/assets/stores/`
- [ ] CSV paths start with `/assets/...`
- [ ] No placeholder `affiliate-link.com` in production CSV
- [ ] No copyrighted assets from other brands

---

## Tracking setup (5 minutes)

1. Add to hosting env (e.g. Vercel):
   - `NEXT_PUBLIC_GA4_ID`
   - `NEXT_PUBLIC_META_PIXEL_ID`
   - `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
2. Deploy.
3. Open test URL with UTM (see README §14).
4. Confirm `POST /api/track` → `{ "success": true }`.

Empty pixel env = no third-party script; internal tracking still works.

---

## Pre-launch checklist (ads)

See [README.md §15](../README.md#15-ads-launch-checklist) for the full list. Minimum:

1. `npm run import:cms`
2. `npm run build`
3. Real affiliate URLs + images
4. Pixel IDs in production
5. Mobile + footer disclosure + Terms/Privacy
6. Test coupon copy and Get Deal on one store and one product

---

## Deploy on Vercel (summary)

1. Connect git repo.
2. Set env variables (pixels).
3. Build: `npm run build`.
4. Test live `/products` and `/store/carpuride`.

Commit regenerated `public/data/*.json` after CMS import, or automate import in CI before build.

---

## When you need a developer

- New page layout or section (e.g. FAQ, comparison table)
- New page type beyond products + store + content
- Cart / checkout
- Real auth backend (v1 is UI shell only)
- CMS beyond CSV (database, admin UI)
- Automated import on every deploy

---

## Support contacts

Update this section with your agency or internal owner:

| Role | Contact |
|------|---------|
| Project owner | _TBD_ |
| Technical | _TBD_ |
| Hosting (Vercel) | _TBD_ |

---

## Document map

```text
README.md           → Full technical + ops guide (18 sections)
docs/handoff.md     → This file — executive handoff
docs/cms-import.md  → CSV columns, validation, workflows
.env.example        → Pixel environment variables
```
