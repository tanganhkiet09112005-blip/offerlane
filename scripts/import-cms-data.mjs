#!/usr/bin/env node
/**
 * CMS CSV → public/data JSON generator
 * Run: npm run import:cms
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMPORT_DIR = path.join(ROOT, "public", "import");
const DATA_DIR = path.join(ROOT, "public", "data");
const STORES_OUT_DIR = path.join(DATA_DIR, "stores");

const PAGE_SIZE = 16;
const PLACEHOLDER_LOGO =
  "/assets/placeholders/store.svg";
const PLACEHOLDER_PRODUCT =
  "/assets/placeholders/product.svg";
const PLACEHOLDER_SHARE = "/assets/placeholders/store-share.svg";

const warnings = [];
const errors = [];

function warn(msg) {
  warnings.push(msg);
  console.warn(`⚠ ${msg}`);
}

function fail(msg) {
  errors.push(msg);
  console.error(`✗ ${msg}`);
}

function trim(v) {
  return String(v ?? "").trim();
}

function parseBool(v) {
  const s = trim(v).toLowerCase();
  if (!s) return false;
  return ["1", "true", "yes", "y"].includes(s);
}

function parseNum(v, fallback = 0) {
  const s = trim(v);
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionalNum(v) {
  const s = trim(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function currentPeriodLabel() {
  const d = new Date();
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} - ${d.getFullYear()}`;
}

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(s);
  return !Number.isNaN(t);
}

/** Minimal RFC4180-style CSV parser */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || (c === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((cell) => trim(cell) !== "")) rows.push(row);
      row = [];
      if (c === "\r") i++;
    } else if (c !== "\r") {
      field += c;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => trim(cell) !== "")) rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map((h) => trim(h));
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    return obj;
  });
}

function readCsv(filename) {
  const filePath = path.join(IMPORT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fail(`Missing required file: public/import/${filename}`);
    return null;
  }
  const text = fs.readFileSync(filePath, "utf8");
  return parseCsv(text);
}

function storeDefaults(slug, name) {
  return {
    featuredStores: [],
    relatedStores: [],
    shareBlock: {
      title: "Share Now Stores",
      image: PLACEHOLDER_SHARE,
      description: "Discover curated deals and offers from this store.",
      ctaLabel: "Sign Up",
      ctaUrl: "/join",
    },
    inlineSignup: {
      title: "Don't miss any deal!",
      description: "Sign up to receive new coupons and promo codes.",
      buttonLabel: "Subscribe",
    },
    rating: {
      enabled: true,
      average: 0,
      count: 0,
      rateNowLabel: "Rate Now",
    },
    filters: ["All", "Coupons"],
    sortOptions: ["Latest", "Popular", "Expiry"],
    storeId: `store_${slug}`,
    slug,
    name,
  };
}

function parseStores(rows) {
  const stores = new Map();

  rows.forEach((row, i) => {
    const line = i + 2;
    const storeSlug = trim(row.storeSlug);
    const storeName = trim(row.storeName);

    if (!storeSlug) {
      fail(`stores.csv line ${line}: storeSlug is required`);
      return;
    }
    if (!storeName) {
      fail(`stores.csv line ${line}: storeName is required`);
      return;
    }

    const logoSrc = trim(row.logo) || PLACEHOLDER_LOGO;
    if (!trim(row.logo)) {
      warn(`stores.csv line ${line}: logo empty for "${storeSlug}", using placeholder`);
    }

    stores.set(storeSlug, {
      ...storeDefaults(storeSlug, storeName),
      domainLabel: trim(row.domainLabel) || `${storeSlug}.example`,
      logo: {
        src: logoSrc,
        alt: `${storeName} logo`,
      },
      promoRibbon: trim(row.promoRibbon) || "Earn up to 30% discount",
      pageTitle:
        trim(row.pageTitle) || `${storeName} Coupons and Promo Codes`,
      pagePeriodLabel: trim(row.pagePeriodLabel) || currentPeriodLabel(),
      description:
        trim(row.description) ||
        `${storeName} offers curated deals, coupons, and partner savings.`,
      offers: [],
    });
  });

  return stores;
}

function parseOffers(rows, stores) {
  const offersByStore = new Map();

  rows.forEach((row, i) => {
    const line = i + 2;
    const storeSlug = trim(row.storeSlug);
    const offerId = trim(row.offerId);
    const type = trim(row.type).toLowerCase();
    const headline = trim(row.headline);

    if (!storeSlug) {
      fail(`offers.csv line ${line}: storeSlug is required`);
      return;
    }
    if (!offerId) {
      fail(`offers.csv line ${line}: offerId is required`);
      return;
    }
    if (!headline) {
      fail(`offers.csv line ${line}: headline is required`);
      return;
    }
    if (type !== "coupon" && type !== "deal") {
      fail(`offers.csv line ${line}: type must be "coupon" or "deal"`);
      return;
    }

    if (!stores.has(storeSlug)) {
      warn(
        `offers.csv line ${line}: store "${storeSlug}" not in stores.csv — offer skipped`
      );
      return;
    }

    const couponCode = trim(row.couponCode) || null;
    if (type === "coupon" && !couponCode) {
      warn(`offers.csv line ${line}: coupon "${offerId}" has no couponCode`);
    }

    const outboundUrl = trim(row.outboundUrl);
    if (!outboundUrl) {
      warn(`offers.csv line ${line}: offer "${offerId}" has no outboundUrl`);
    }

    let expiryDate = trim(row.expiryDate);
    if (expiryDate && !isValidDate(expiryDate)) {
      warn(
        `offers.csv line ${line}: invalid expiryDate "${expiryDate}" for "${offerId}"`
      );
      expiryDate = "";
    }
    if (!expiryDate) expiryDate = "2099-12-31";

    const popularity = parseNum(row.popularity, 0);
    const engagementCountRaw = trim(row.engagementCount);
    const engagementCount = engagementCountRaw
      ? parseNum(engagementCountRaw, popularity)
      : popularity;

    const offer = {
      offerId,
      type,
      badge: trim(row.badge) || (type === "coupon" ? "Discount Code" : "Special Offer"),
      headline,
      summary: trim(row.summary) || headline,
      engagementCount,
      engagementLabel: trim(row.engagementLabel) || "Times Loyal",
      couponCode: type === "coupon" ? couponCode : null,
      ctaLabel:
        trim(row.ctaLabel) ||
        (type === "coupon" ? "Show Coupon" : "Get Deal"),
      expiryDate,
      outboundUrl: outboundUrl || "#",
      popularity,
      _createdAt: trim(row.createdAt) || "",
    };

    if (!offersByStore.has(storeSlug)) offersByStore.set(storeSlug, []);
    offersByStore.get(storeSlug).push(offer);
  });

  for (const [slug, store] of stores) {
    const offers = offersByStore.get(slug) ?? [];
    offers.sort((a, b) => {
      const da = Date.parse(a._createdAt) || 0;
      const db = Date.parse(b._createdAt) || 0;
      return db - da;
    });
    store.offers = offers.map(({ _createdAt, ...rest }) => rest);
    if (!offers.length) {
      warn(`Store "${slug}" has no offers in offers.csv`);
    }
  }

  return stores;
}

function parseProducts(rows) {
  const items = [];

  rows.forEach((row, i) => {
    const line = i + 2;
    const productId = trim(row.productId);
    const slug = trim(row.slug);
    const title = trim(row.title);

    if (!productId) {
      fail(`products.csv line ${line}: productId is required`);
      return;
    }
    if (!slug) {
      fail(`products.csv line ${line}: slug is required`);
      return;
    }
    if (!title) {
      fail(`products.csv line ${line}: title is required`);
      return;
    }

    const imageSrc = trim(row.imageSrc) || PLACEHOLDER_PRODUCT;
    if (!trim(row.imageSrc)) {
      warn(`products.csv line ${line}: imageSrc empty for "${slug}", using placeholder`);
    }

    const outboundUrl = trim(row.outboundUrl);
    if (!outboundUrl) {
      warn(`products.csv line ${line}: product "${slug}" has no outboundUrl`);
    }

    items.push({
      productId,
      slug,
      badge: trim(row.badge) || "Exclusive",
      title,
      image: {
        src: imageSrc,
        alt: trim(row.imageAlt) || title,
      },
      currentPrice: parseNum(row.currentPrice, 0),
      compareAtPrice: parseOptionalNum(row.compareAtPrice),
      currency: trim(row.currency) || "USD",
      vendor: trim(row.vendor) || "",
      internalUrl: trim(row.internalUrl) || `/products/${slug}`,
      outboundUrl: outboundUrl || "#",
      page: parseNum(row.page, 0),
      featured: parseBool(row.featured),
      category: trim(row.category),
    });
  });

  items.forEach((item, index) => {
    if (!item.page || item.page < 1) {
      item.page = Math.floor(index / PAGE_SIZE) + 1;
    }
  });

  return items;
}

function writeProductsJson(items) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const data = {
    title: "All Products",
    pageSize: PAGE_SIZE,
    pagination: {
      totalItems,
      totalPages,
      currentPage: 1,
    },
    items,
  };

  const outPath = path.join(DATA_DIR, "products.json");
  fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return outPath;
}

function writeStoreJson(store) {
  fs.mkdirSync(STORES_OUT_DIR, { recursive: true });
  const outPath = path.join(STORES_OUT_DIR, `${store.slug}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  return outPath;
}

function ensureImportSamples() {
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
  const samples = [
    "stores.sample.csv",
    "offers.sample.csv",
    "products.sample.csv",
  ];
  for (const name of samples) {
    const samplePath = path.join(IMPORT_DIR, name);
    if (!fs.existsSync(samplePath)) {
      warn(`Sample missing: public/import/${name}`);
    }
  }
}

function main() {
  console.log("OfferLane CMS import\n");

  ensureImportSamples();

  const storeRows = readCsv("stores.csv");
  const offerRows = readCsv("offers.csv");
  const productRows = readCsv("products.csv");

  if (!storeRows || !offerRows || !productRows) {
    console.error("\nImport aborted due to missing CSV files.");
    process.exit(1);
  }

  if (errors.length) {
    console.error("\nImport aborted due to validation errors.");
    process.exit(1);
  }

  let stores = parseStores(storeRows);
  if (errors.length) {
    console.error("\nImport aborted.");
    process.exit(1);
  }

  stores = parseOffers(offerRows, stores);

  const products = parseProducts(productRows);
  if (errors.length) {
    console.error("\nImport aborted.");
    process.exit(1);
  }

  const productsPath = writeProductsJson(products);
  console.log(`✓ Wrote ${productsPath} (${products.length} products)`);

  const storePaths = [];
  for (const store of stores.values()) {
    storePaths.push(writeStoreJson(store));
  }
  console.log(`✓ Wrote ${storePaths.length} store file(s) in public/data/stores/`);

  console.log("\nRoutes available after build:");
  console.log("  /products");
  for (const slug of stores.keys()) {
    console.log(`  /store/${slug}`);
  }

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s) — review messages above.`);
  }

  console.log("\nDone. Run: npm run build");
}

main();
