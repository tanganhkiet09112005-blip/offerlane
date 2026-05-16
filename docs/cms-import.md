# CMS file import (OfferLane)

OfferLane loads catalog, store, offer, and blog data from JSON under `public/data/`. The **CMS import** flow lets you maintain that data in CSV files, then regenerate JSON with one command—no admin dashboard required.

For a client-friendly Vietnamese handoff guide, see [client-update-guide.md](./client-update-guide.md).

## What it does

1. You edit CSV files in `public/import/`.
2. You run `npm run import:cms`.
3. The script writes:
   - `public/data/products.json`
   - `public/data/stores/[storeSlug].json` (one file per store)
   - `public/data/pages.json` (`blogs.posts` only; other content pages are preserved)

The site UI, tracking, and components stay the same; only the data files change.

## Files you maintain

| File | Purpose |
|------|---------|
| `public/import/stores.csv` | Store identity (name, logo, ribbon, description) |
| `public/import/offers.csv` | Coupons and deals per store |
| `public/import/products.csv` | Product catalog for `/products` |
| `public/import/blogs.csv` | Blog posts for `/blogs` and `/blogs/[slug]` |

Reference templates (do not import directly):

- `public/import/stores.sample.csv`
- `public/import/offers.sample.csv`
- `public/import/products.sample.csv`
- `public/import/blogs.sample.csv`

## Workflow

```bash
# 1. Edit CSVs in public/import/
# 2. Regenerate JSON
npm run import:cms

# 3. Rebuild site
npm run build

# 4. Preview
npm run dev
```

## Add a new product

1. Add a row to `products.csv` with unique `productId` and `slug`.
2. Set `outboundUrl` to your affiliate link.
3. Put image in `public/assets/products/` and set `imageSrc` (e.g. `/assets/products/my-item.jpg`).
4. Run `npm run import:cms` then `npm run build`.

Optional: leave `page` empty—the script assigns page numbers with `pageSize` 16.

## Add a new store

1. Add a row to `stores.csv` with unique `storeSlug` and `storeName`.
2. Add offers in `offers.csv` with the same `storeSlug`.
3. Run `npm run import:cms` then `npm run build`.
4. Open `/store/[storeSlug]` (e.g. `/store/sample-tech`).

## Add a coupon or deal

Add a row to `offers.csv`:

| type | CTA on site | Required extras |
|------|-------------|-----------------|
| `coupon` | Show Coupon → reveal + copy code | `couponCode` recommended |
| `deal` | Get Deal → outbound redirect | `outboundUrl` required for real links |

Both types should include `outboundUrl` for partner redirects after copy or on Get Deal.

## Add a blog post

1. Add a row to `blogs.csv` with unique `postId` and `slug`.
2. Put the hero image in `public/assets/blogs/` or use a placeholder path.
3. Write `sectionsJson` as a JSON array of `{ "heading": "...", "body": "..." }` objects.
4. Use `relatedProductSlugs` and `relatedStoreSlugs` for future per-post relationships; slugs should match `products.csv` and `stores.csv`.
5. Run `npm run import:cms` then `npm run build`.

The importer updates only `blogs.posts` inside `public/data/pages.json`; it preserves About, Terms, Privacy, category, and store directory content.

## Affiliate links

Edit the `outboundUrl` column in `offers.csv` or `products.csv`, then run `npm run import:cms`.

## Images

1. Upload files under `public/assets/` (e.g. `public/assets/stores/`, `public/assets/products/`, `public/assets/blogs/`).
2. Reference them in CSV as site paths: `/assets/stores/logo.png`.
3. Empty `logo`, `imageSrc`, or blog `heroImage` uses a placeholder URL (warning in import log).

## Field reference

### stores.csv

| Field | Required | Notes |
|-------|----------|-------|
| storeSlug | Yes | URL slug → `/store/{storeSlug}` |
| storeName | Yes | Display name |
| domainLabel | No | Shown under title |
| logo | No | Path or URL; placeholder if empty |
| promoRibbon | No | Default ribbon text |
| pageTitle | No | Defaults to `{storeName} Coupons and Promo Codes` |
| pagePeriodLabel | No | Defaults to current month/year |
| description | No | Store blurb |

### offers.csv

| Field | Required | Notes |
|-------|----------|-------|
| storeSlug | Yes | Must exist in stores.csv |
| offerId | Yes | Unique per store |
| type | Yes | `coupon` or `deal` only |
| headline | Yes | Offer title |
| summary | No | Defaults to headline |
| couponCode | No | Warn if `coupon` and empty |
| ctaLabel | No | Defaults: Show Coupon / Get Deal |
| expiryDate | No | `YYYY-MM-DD`; warn if invalid |
| outboundUrl | No | Warn if empty |
| popularity | No | Default `0` |
| createdAt | No | Used to sort “Latest” in export order |
| engagementCount | No | Defaults to popularity |
| engagementLabel | No | Default `Times Loyal` |

### products.csv

| Field | Required | Notes |
|-------|----------|-------|
| productId | Yes | Unique ID |
| slug | Yes | URL slug |
| title | Yes | Product name |
| imageSrc | No | Placeholder if empty |
| imageAlt | No | Defaults to title |
| currentPrice | No | Default `0` |
| compareAtPrice | No | Empty → `null` |
| currency | No | Default `USD` |
| vendor | No | |
| internalUrl | No | Default `/products/{slug}` |
| outboundUrl | No | Warn if empty |
| page | No | Auto from row index if empty |
| featured | No | `true` / `false` |
| category | No | Stored for future use (not shown in UI v1) |

### blogs.csv

| Field | Required | Notes |
|-------|----------|-------|
| postId | Yes | Unique post ID |
| slug | Yes | URL slug -> `/blogs/{slug}` |
| title | Yes | Blog title |
| excerpt | No | Defaults to title |
| category | No | Blog category label |
| author | No | Author label |
| date | No | `YYYY-MM-DD`; warning if invalid |
| heroImage | No | Placeholder if empty |
| sectionsJson | No | JSON array of `{ heading, body }`; invalid JSON warns and becomes `[]` |
| relatedProductSlugs | No | `;` or `|` separated product slugs |
| relatedStoreSlugs | No | `;` or `|` separated store slugs |
| ctaLabel | No | Stored for future UI usage |
| seoTitle | No | Blog metadata title |
| seoDescription | No | Blog metadata description |

## Common warnings

| Warning | Fix |
|---------|-----|
| Missing `outboundUrl` | Add affiliate URL |
| Coupon without `couponCode` | Add code or change type to `deal` |
| Invalid `expiryDate` | Use `YYYY-MM-DD` |
| Empty image/logo | Add path under `public/assets/` |
| Store in offers but not in stores.csv | Add store row or fix slug typo |
| Invalid blog `sectionsJson` | Fix JSON array syntax; importer will warn and use `[]` |
| Empty blog `heroImage` | Add image path or accept the local placeholder |

## Scope limits

- Import updates **existing page sections** (products grid, store offers, blog posts, etc.).
- New layout sections (FAQ, cart, hero video, etc.) require a **developer task**.
- `public/data/site.json` is **not** overwritten by import (header/footer/nav stay manual).
- `public/data/pages.json` is only partially updated: `blogs.posts` is replaced from `blogs.csv`; other content pages are preserved.

## Technical notes

- Store routes are discovered from `public/data/stores/*.json` at build time (`getAllStoreSlugs()`).
- Import errors on missing required fields stop the script; warnings do not.
- Debug import output in the terminal after `npm run import:cms`.
