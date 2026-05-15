# CMS file import (OfferLane)

OfferLane loads catalog and store data from JSON under `public/data/`. The **CMS import** flow lets you maintain that data in three spreadsheets (CSV), then regenerate JSON with one command—no admin dashboard required.

## What it does

1. You edit CSV files in `public/import/`.
2. You run `npm run import:cms`.
3. The script writes:
   - `public/data/products.json`
   - `public/data/stores/[storeSlug].json` (one file per store)

The site UI, tracking, and components stay the same; only the data files change.

## Files you maintain

| File | Purpose |
|------|---------|
| `public/import/stores.csv` | Store identity (name, logo, ribbon, description) |
| `public/import/offers.csv` | Coupons and deals per store |
| `public/import/products.csv` | Product catalog for `/products` |

Reference templates (do not import directly):

- `public/import/stores.sample.csv`
- `public/import/offers.sample.csv`
- `public/import/products.sample.csv`

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

## Affiliate links

Edit the `outboundUrl` column in `offers.csv` or `products.csv`, then run `npm run import:cms`.

## Images

1. Upload files under `public/assets/` (e.g. `public/assets/stores/`, `public/assets/products/`).
2. Reference them in CSV as site paths: `/assets/stores/logo.png`.
3. Empty `logo` or `imageSrc` uses a placeholder URL (warning in import log).

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

## Common warnings

| Warning | Fix |
|---------|-----|
| Missing `outboundUrl` | Add affiliate URL |
| Coupon without `couponCode` | Add code or change type to `deal` |
| Invalid `expiryDate` | Use `YYYY-MM-DD` |
| Empty image/logo | Add path under `public/assets/` |
| Store in offers but not in stores.csv | Add store row or fix slug typo |

## Scope limits

- Import only updates **existing page sections** (products grid, store offers, etc.).
- New layout sections (FAQ, cart, hero video, etc.) require a **developer task**.
- `public/data/site.json` is **not** overwritten by import (header/footer/nav stay manual).

## Technical notes

- Store routes are discovered from `public/data/stores/*.json` at build time (`getAllStoreSlugs()`).
- Import errors on missing required fields stop the script; warnings do not.
- Debug import output in the terminal after `npm run import:cms`.
