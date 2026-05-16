import type { MetadataRoute } from "next";
import {
  CONTENT_PAGE_SLUGS,
  getAllBlogSlugs,
  getAllCategorySlugs,
  getAllStoreSlugs,
  getProductsData,
} from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

function url(path: string): string {
  return `${SITE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/products", "/blogs", ...CONTENT_PAGE_SLUGS.map((slug) => `/${slug}`)];
  const productRoutes = getProductsData().items.map(
    (product) => `/products/${product.slug}`
  );
  const blogRoutes = getAllBlogSlugs().map((slug) => `/blogs/${slug}`);
  const categoryRoutes = getAllCategorySlugs().map((slug) => `/category/${slug}`);
  const storeRoutes = getAllStoreSlugs().map((slug) => `/store/${slug}`);

  return [
    ...new Set([
      ...staticRoutes,
      ...productRoutes,
      ...blogRoutes,
      ...categoryRoutes,
      ...storeRoutes,
    ]),
  ].map((route) => ({
    url: url(route),
    lastModified: new Date(),
  }));
}
