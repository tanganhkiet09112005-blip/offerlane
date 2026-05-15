export interface SiteBrand {
  name: string;
  tagline: string;
  legalLine: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteTheme {
  primary: string;
  accent: string;
  background: string;
  text: string;
}

export interface SiteHeader {
  mainNav: NavLink[];
  shortcutNav: NavLink[];
  searchLabel: string;
  aboutLink: NavLink;
  auth: {
    joinLabel: string;
    signInLabel: string;
  };
  mobileMenu: NavLink[];
}

export interface SiteFooter {
  brandBlurb: string;
  usefulLinks: NavLink[];
  newsletter: {
    title: string;
    description: string;
    buttonLabel: string;
    placeholder: string;
  };
  affiliateDisclosure: string;
  copyright: string;
}

export interface SiteConfig {
  brand: SiteBrand;
  theme: SiteTheme;
  header: SiteHeader;
  footer: SiteFooter;
  searchMockResults: { title: string; href: string; type: string }[];
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  productId: string;
  slug: string;
  badge: string;
  title: string;
  image: ProductImage;
  currentPrice: number;
  compareAtPrice: number | null;
  currency: string;
  vendor: string;
  internalUrl: string;
  outboundUrl: string;
  page: number;
  featured: boolean;
  category?: string;
}

export interface ProductsPageData {
  title: string;
  pageSize: number;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  items: Product[];
}

export interface StoreLogo {
  src: string;
  alt: string;
}

export interface Offer {
  offerId: string;
  type: "coupon" | "deal";
  badge: string;
  headline: string;
  summary: string;
  engagementCount: number | null;
  engagementLabel: string | null;
  couponCode: string | null;
  ctaLabel: string;
  expiryDate: string;
  outboundUrl: string;
  popularity?: number;
}

export interface FeaturedStore {
  name: string;
  slug: string;
  logo: string;
  href: string;
}

export interface RelatedStore {
  name: string;
  href: string;
}

export interface ContentSection {
  heading: string;
  body: string;
}

export interface BlogPostPreview {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

export interface CategoryPreview {
  slug: string;
  title: string;
  description: string;
}

export interface StorePreview {
  slug: string;
  name: string;
  description: string;
  href: string;
}

export interface ContentPageData {
  title: string;
  lead: string;
  sections: ContentSection[];
  posts?: BlogPostPreview[];
  categoryList?: CategoryPreview[];
  storeList?: StorePreview[];
}

export interface StorePageData {
  storeId: string;
  slug: string;
  name: string;
  promoRibbon: string;
  pageTitle: string;
  pagePeriodLabel: string;
  logo: StoreLogo;
  domainLabel: string;
  description: string;
  rating: {
    enabled: boolean;
    average: number;
    count: number;
    rateNowLabel: string;
  };
  filters: string[];
  sortOptions: string[];
  offers: Offer[];
  featuredStores: FeaturedStore[];
  relatedStores: RelatedStore[];
  shareBlock: {
    title: string;
    image: string;
    description: string;
    ctaLabel: string;
    ctaUrl: string;
  };
  inlineSignup: {
    title: string;
    description: string;
    buttonLabel: string;
  };
}
