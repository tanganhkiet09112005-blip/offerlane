import fs from "fs";
import path from "path";
import type {
  BlogPostPreview,
  CategoryPreview,
  ContentPageData,
  Product,
  ProductsPageData,
  SearchResult,
  SiteConfig,
  StorePageData,
} from "./types";
import siteJson from "@/public/data/site.json";
import productsJson from "@/public/data/products.json";
import pagesJson from "@/public/data/pages.json";

const pages = pagesJson as Record<string, ContentPageData>;
const productsData = productsJson as ProductsPageData;

const STORES_DIR = path.join(process.cwd(), "public", "data", "stores");

function readStoreFile(slug: string): StorePageData | null {
  const filePath = path.join(STORES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as StorePageData;
  } catch {
    return null;
  }
}

export const CONTENT_PAGE_SLUGS = [
  "about",
  "terms",
  "privacy",
  "contact",
  "join",
  "forgot-password",
  "categories",
  "stores",
] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSearchResults(): SearchResult[] {
  const blogResults = getBlogPosts().map((post) => ({
    title: post.title,
    href: `/blogs/${post.slug}`,
    type: "Blog",
  }));

  const storeResults = getAllStores().map((store) => ({
    title: store.name,
    href: `/store/${store.slug}`,
    type: "Store",
  }));

  const productResults = productsData.items.map((product) => ({
    title: product.title,
    href: product.internalUrl,
    type: "Product",
  }));

  return [...blogResults, ...storeResults, ...productResults];
}

export function getContentPage(slug: string): ContentPageData | null {
  return pages[slug] ?? null;
}

export function getCategoryPage(slug: string): ContentPageData | null {
  const categories = pages.categories;
  if (!categories?.categoryList) return null;
  const cat = categories.categoryList.find((c) => c.slug === slug);
  if (!cat) return null;
  return {
    title: cat.title,
    lead: cat.description,
    sections: [
      {
        heading: "Deal map",
        body: "Stores and products tagged for this topic are grouped below.",
      },
    ],
    seo: {
      title: `${cat.title} Deals, Products & Stores | OfferLane`,
      description: cat.description,
      canonical: `/category/${cat.slug}`,
    },
  };
}

export function getAllCategorySlugs(): string[] {
  return pages.categories?.categoryList?.map((cat) => cat.slug) ?? [];
}

export function getCategoryProducts(slug: string): Product[] {
  const target = normalizeCategory(slug);
  return productsData.items.filter((product) => {
    if (!product.category) return false;
    return normalizeCategory(product.category) === target;
  });
}

export function getCategoryStores(slug: string): StorePageData[] {
  const target = normalizeCategory(slug);
  return getAllStores().filter((store) =>
    (store.storeCategories ?? []).some(
      (category) => normalizeCategory(category) === target
    )
  );
}

export function getBlogPosts(): BlogPostPreview[] {
  return pages.blogs?.posts ?? [];
}

export function getAllBlogSlugs(): string[] {
  return getBlogPosts().map((post) => post.slug);
}

export function getBlogPostBySlug(slug: string): BlogPostPreview | null {
  return getBlogPosts().find((post) => post.slug === slug) ?? null;
}

export function getRecentBlogPosts(currentSlug?: string, limit = 4): BlogPostPreview[] {
  return getBlogPosts()
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);
}

export function getBlogPost(slug: string): ContentPageData | null {
  const post = getBlogPostBySlug(slug);
  if (!post) return null;
  return {
    title: post.title,
    lead: post.excerpt,
    sections:
      post.sections && post.sections.length > 0
        ? post.sections
        : [
            {
              heading: "Why this matters",
              body: `${post.excerpt} OfferLane focuses on practical buying signals, merchant terms, and deal timing so readers can compare offers with less guesswork.`,
            },
            {
              heading: "What to check before clicking",
              body: "Confirm the final merchant price, shipping terms, coupon restrictions, and return window before completing a purchase on a partner site.",
            },
          ],
    seo: post.seo,
  };
}

export function getSiteConfig(): SiteConfig {
  const site = siteJson as SiteConfig;
  return {
    ...site,
    home: {
      featuredProductLimit: 8,
      storeCategoryPills: site.header.shortcutNav,
      headlinePostSlugs: getBlogPosts().slice(0, 3).map((post) => post.slug),
      partnerLinks: [{ label: "Partner spotlight", href: "/store/carpuride" }],
      socialLinks: [{ label: "Community picks", href: "/blogs" }],
      ...site.home,
    },
    searchMockResults: buildSearchResults(),
  };
}

export function getProductsData(): ProductsPageData {
  return productsData;
}

export function getProductBySlug(slug: string): Product | null {
  return productsData.items.find((product) => product.slug === slug) ?? null;
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  const seen = new Set<string>();
  return slugs
    .map((slug) => slug.trim())
    .filter((slug) => {
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is Product => Boolean(product));
}

export function getFeaturedProducts(limit = 8): Product[] {
  const featured = productsData.items.filter((product) => product.featured);
  return (featured.length ? featured : productsData.items).slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  if (product.similarProductSlugs?.length) {
    const explicit = getProductsBySlugs(product.similarProductSlugs);
    if (explicit.length) return explicit.slice(0, limit);
  }

  const category = product.category ? normalizeCategory(product.category) : "";
  return productsData.items
    .filter((item) => item.slug !== product.slug)
    .filter((item) => {
      if (category && item.category) {
        return normalizeCategory(item.category) === category;
      }
      return item.vendor === product.vendor;
    })
    .slice(0, limit);
}

export function getPopularProducts(product?: Product, limit = 4): Product[] {
  if (product?.popularProductSlugs?.length) {
    const explicit = getProductsBySlugs(product.popularProductSlugs);
    if (explicit.length) return explicit.slice(0, limit);
  }

  return productsData.items
    .filter((item) => item.slug !== product?.slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, limit);
}

/** Load store JSON generated by `npm run import:cms` (public/data/stores/[slug].json). */
export function getStoreBySlug(slug: string): StorePageData | null {
  return readStoreFile(slug);
}

export function getStoresBySlugs(slugs: string[]): StorePageData[] {
  const seen = new Set<string>();
  return slugs
    .map((slug) => slug.trim())
    .filter((slug) => {
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => getStoreBySlug(slug))
    .filter((store): store is StorePageData => Boolean(store));
}

export function getAllStores(): StorePageData[] {
  return getAllStoreSlugs()
    .map((slug) => readStoreFile(slug))
    .filter((store): store is StorePageData => Boolean(store));
}

/** All store slugs present in public/data/stores/*.json */
export function getAllStoreSlugs(): string[] {
  if (!fs.existsSync(STORES_DIR)) return [];
  return fs
    .readdirSync(STORES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

export function getCategoryTitle(slug: string): string {
  const category = pages.categories?.categoryList?.find((cat) => cat.slug === slug);
  return category?.title ?? titleFromSlug(slug);
}

/** Other taxonomy chips for category pages (excludes current slug). */
export function getRelatedCategories(excludeSlug: string): CategoryPreview[] {
  const list = pages.categories?.categoryList ?? [];
  return list.filter((c) => c.slug !== excludeSlug);
}

/** Return up to `limit` stores for home page featured section. */
export function getFeaturedStores(limit = 6): StorePageData[] {
  return getAllStores().slice(0, limit);
}
