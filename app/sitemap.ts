import type { MetadataRoute } from "next";
import {
  getAllBlogSlugs,
  getAllCategorySlugs,
  getAllStoreSlugs,
  getProductsData,
} from "@/lib/data";
import { absoluteUrl, SITEMAP_STATIC_PATHS } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const productRoutes = getProductsData().items.map(
    (product) => `/products/${product.slug}`
  );
  const blogRoutes = getAllBlogSlugs().map((slug) => `/blogs/${slug}`);
  const categoryRoutes = getAllCategorySlugs().map((slug) => `/category/${slug}`);
  const storeRoutes = getAllStoreSlugs().map((slug) => `/store/${slug}`);

  const paths = [
    ...SITEMAP_STATIC_PATHS,
    ...productRoutes,
    ...blogRoutes,
    ...categoryRoutes,
    ...storeRoutes,
  ];

  return [...new Set(paths)].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
  }));
}
