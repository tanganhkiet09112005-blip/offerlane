# Hướng dẫn cập nhật dữ liệu OfferLane cho khách/dev

Tài liệu này hướng dẫn cách cập nhật dữ liệu website OfferLane sau khi bàn giao. Nội dung dựa trên codebase hiện tại: Next.js 15, dữ liệu CSV trong `public/import/`, dữ liệu JSON trong `public/data/`, và script import `scripts/import-cms-data.mjs`.

## 1. Tổng quan

OfferLane dùng cơ chế CMS dạng file/CSV. Với các cập nhật dữ liệu cơ bản, khách/dev không cần sửa code giao diện.

Quy trình chuẩn:

1. Cập nhật file CSV hoặc file dữ liệu thủ công theo đúng phần bên dưới.
2. Chạy import CMS nếu đã sửa CSV.
3. Chạy build để kiểm tra website.
4. Commit/push hoặc deploy lại lên Vercel.

Lưu ý quan trọng:

- `public/import/*.csv` là file nguồn để chỉnh sản phẩm, store, coupon/deal và blog.
- `public/data/products.json` và `public/data/stores/*.json` là file được generate sau import, không nên chỉnh tay nếu vẫn dùng CSV.
- Blog hiện đã có `public/import/blogs.csv`; import sẽ cập nhật phần `blogs.posts` trong `public/data/pages.json`.
- Website là affiliate/content-commerce site. Link mua hàng là link outbound/affiliate, không có cart/checkout trong website.

## 2. Các file khách/dev cần biết

| File/thư mục | Dùng để làm gì |
|---|---|
| `public/import/products.csv` | File nguồn để thêm/sửa/xóa sản phẩm. |
| `public/import/stores.csv` | File nguồn để thêm/sửa/xóa store/công ty. |
| `public/import/offers.csv` | File nguồn để thêm/sửa/xóa coupon/deal của từng store. |
| `public/import/blogs.csv` | File nguồn để thêm/sửa/xóa bài blog. |
| `public/import/*.sample.csv` | File mẫu tham khảo cấu trúc cột CSV. |
| `public/assets/products/` | Nơi đặt ảnh sản phẩm. |
| `public/assets/stores/` | Nơi đặt logo store/công ty. |
| `public/assets/blogs/` | Nơi nên đặt ảnh blog nếu cần dùng ảnh riêng. Nếu chưa có thư mục này thì dev có thể tạo. |
| `public/assets/placeholders/` | Ảnh placeholder mặc định khi thiếu ảnh/logo. |
| `public/data/products.json` | JSON sản phẩm được generate từ `products.csv`. Không nên chỉnh tay lâu dài. |
| `public/data/stores/*.json` | JSON từng store được generate từ `stores.csv` + `offers.csv`. Không nên chỉnh tay lâu dài. |
| `public/data/pages.json` | Dữ liệu content pages. Khi có `blogs.csv`, import chỉ cập nhật phần `blogs.posts` và giữ nguyên các page khác. |
| `public/data/site.json` | Brand, header, footer, theme, home config. Chỉnh file này khi cần đổi nav/footer/copy tổng quan. |
| `.env.example` | Danh sách biến môi trường cho pixel/analytics. |

File trong `public/import/` là nguồn chính cho sản phẩm/store/coupon/blog. File trong `public/data/` là dữ liệu website đọc khi render. Với sản phẩm/store/coupon/blog, import sẽ ghi đè dữ liệu generate, nên không nên sửa trực tiếp `products.json`, `stores/*.json`, hoặc `pages.json.blogs.posts` nếu sau đó vẫn chạy `npm run import:cms`.

## 3. Cách cập nhật sản phẩm

File cần sửa: `public/import/products.csv`

Mỗi dòng trong CSV là một sản phẩm. URL sản phẩm được tạo theo `slug`:

```text
/products/[slug]
```

Ví dụ nếu `slug` là `smart-screen-pro`, URL sẽ là:

```text
/products/smart-screen-pro
```

Thao tác:

- Thêm sản phẩm: thêm một dòng mới với `productId` và `slug` chưa từng dùng.
- Sửa sản phẩm: chỉnh trực tiếp dòng đang có.
- Xóa sản phẩm: xóa dòng sản phẩm khỏi `products.csv`, sau đó chạy import/build.

Các cột hiện có:

| Cột | Bắt buộc | Ý nghĩa |
|---|---:|---|
| `productId` | Có | ID duy nhất của sản phẩm, ví dụ `prod_001`. Không được trùng. |
| `slug` | Có | Slug URL của sản phẩm, ví dụ `smart-screen-pro`. Không dấu, không khoảng trắng. |
| `badge` | Không | Nhãn nhỏ trên card, ví dụ `Exclusive`. Nếu trống sẽ dùng `Exclusive`. |
| `title` | Có | Tên sản phẩm hiển thị trên website. |
| `imageSrc` | Không | Đường dẫn ảnh, ví dụ `/assets/products/smart-screen-pro.webp`. Nếu trống sẽ dùng placeholder. |
| `imageAlt` | Không | Mô tả ảnh cho SEO/accessibility. Nếu trống sẽ dùng `title`. |
| `currentPrice` | Không | Giá hiện tại, dạng số. Nếu trống dùng `0`. |
| `compareAtPrice` | Không | Giá so sánh/gạch ngang. Để trống nếu không có. |
| `currency` | Không | Tiền tệ, mặc định `USD`. |
| `vendor` | Không | Tên vendor/merchant hiển thị. |
| `internalUrl` | Không | Link nội bộ, thường là `/products/[slug]`. Nếu trống tự dùng slug. |
| `outboundUrl` | Nên có | Link affiliate/quảng cáo thật cho nút `Shop Now`. Không nên để placeholder khi chạy ads. |
| `page` | Không | Trang phân trang. Nếu trống hoặc nhỏ hơn 1, import tự tính theo page size 16. |
| `featured` | Không | `true` hoặc `false`. Sản phẩm featured có thể xuất hiện ở home/section nổi bật. |
| `category` | Không | Category slug, ví dụ `auto-tech`, dùng cho `/category/[slug]`. |
| `promoRibbon` | Không | Dòng nhấn mạnh trên product detail, ví dụ `Dashboard pick`. |
| `vendorHref` | Không | Link vendor/affiliate ở khu vực vendor trên product detail. |
| `shortDescription` | Không | Mô tả ngắn trên product detail. |
| `detailSectionsJson` | Không | JSON array cho phần nội dung chi tiết sản phẩm. |
| `similarProductSlugs` | Không | Danh sách slug sản phẩm liên quan, ngăn cách bằng `;`. |
| `popularProductSlugs` | Không | Danh sách slug sản phẩm phổ biến, ngăn cách bằng `;`. |
| `seoTitle` | Không | Title SEO riêng cho product detail. |
| `seoDescription` | Không | Meta description SEO riêng cho product detail. |
| `ogImage` | Không | Ảnh social/OG nếu có. |

Ví dụ một dòng CSV sản phẩm:

```csv
prod_010,wireless-carplay-adapter,Exclusive,Wireless CarPlay Adapter,/assets/products/wireless-carplay-adapter.webp,Wireless CarPlay Adapter,89,119,USD,CarPuride,/products/wireless-carplay-adapter,https://affiliate.example.com/wireless-carplay-adapter,1,true,auto-tech,Cable-free pick,https://affiliate.example.com/wireless-carplay-adapter,A wireless adapter for upgrading wired CarPlay dashboards.,"[{""heading"":""Why it earns a lane"",""body"":""This adapter helps drivers reduce cable clutter while keeping a familiar dashboard flow.""}]",smart-screen-pro;dash-cam-lite,smart-screen-pro,Wireless CarPlay Adapter Review | OfferLane,Compare Wireless CarPlay Adapter pricing and partner terms.,
```

Sau khi sửa `products.csv`, chạy:

```bash
npm run import:cms
npm run build
```

## 4. Cách cập nhật hình ảnh sản phẩm

1. Đưa ảnh vào thư mục:

```text
public/assets/products/
```

2. Ví dụ file ảnh:

```text
public/assets/products/smart-screen-pro.webp
```

3. Trong `public/import/products.csv`, sửa cột `imageSrc` thành:

```text
/assets/products/smart-screen-pro.webp
```

4. Sửa `imageAlt` thành mô tả ngắn, rõ nghĩa. Ví dụ:

```text
Smart Screen Pro dashboard display
```

Khuyến nghị ảnh:

- Dùng `.webp`, `.jpg`, `.jpeg`, hoặc `.png`.
- Dung lượng càng nhẹ càng tốt để tải nhanh.
- Tên file không dấu, không khoảng trắng, ví dụ `wireless-carplay-adapter.webp`.
- Không hotlink ảnh từ website khác.
- Nếu để trống `imageSrc`, import sẽ dùng placeholder và hiển thị warning.

## 5. Cách cập nhật store/công ty

File cần sửa: `public/import/stores.csv`

Mỗi dòng trong CSV là một store/công ty. URL store được tạo theo `storeSlug`:

```text
/store/[storeSlug]
```

Ví dụ nếu `storeSlug` là `carpuride`, URL sẽ là:

```text
/store/carpuride
```

Thao tác:

- Thêm store: thêm một dòng mới vào `stores.csv`, sau đó thêm coupon/deal tương ứng trong `offers.csv`.
- Sửa store: chỉnh trực tiếp dòng store đang có.
- Xóa store: xóa dòng store khỏi `stores.csv` và xóa các dòng offer có cùng `storeSlug` trong `offers.csv`.

Các cột hiện có:

| Cột | Bắt buộc | Ý nghĩa |
|---|---:|---|
| `storeSlug` | Có | Slug duy nhất của store, ví dụ `carpuride`. Không dấu, không khoảng trắng. |
| `storeName` | Có | Tên store/công ty hiển thị. |
| `domainLabel` | Không | Text domain hiển thị dưới hero, ví dụ `carpuride.com`. |
| `logo` | Không | Đường dẫn logo, ví dụ `/assets/stores/carpuride-logo.webp`. Nếu trống dùng placeholder. |
| `promoRibbon` | Không | Ribbon trên hero store, ví dụ `Earn up to 30% discount`. |
| `pageTitle` | Không | H1/title chính của store page. Nếu trống tự tạo từ `storeName`. |
| `pagePeriodLabel` | Không | Nhãn thời gian, ví dụ `May - 2026`. Nếu trống tự dùng tháng/năm hiện tại. |
| `description` | Không | Mô tả ngắn về store/công ty. |
| `storeCategories` | Không | Category slug cho store, ngăn cách bằng `;`, ví dụ `auto-tech;car-accessories`. |
| `heroSupportText` | Không | Đoạn hỗ trợ dưới hero store. |
| `seoTitle` | Không | Title SEO riêng cho store page. |
| `seoDescription` | Không | Meta description SEO riêng cho store page. |
| `ogImage` | Không | Ảnh social/OG nếu có. |

Hiện tại importer không có cột riêng `merchantUrl` hoặc `affiliateUrl` trong `stores.csv`. Link affiliate thật nằm ở:

- `outboundUrl` trong `offers.csv` cho coupon/deal của store.
- `outboundUrl` trong `products.csv` cho sản phẩm.

Ví dụ một dòng CSV store:

```csv
carpuride,CarPuride,carpuride.com,/assets/stores/carpuride-logo.webp,Earn up to 30% discount,CarPuride Coupons and Promo Codes,May - 2026,Smart car electronics and accessories,auto-tech;car-accessories,OfferLane tracks current CarPuride coupons before shoppers leave for the merchant.,CarPuride Coupons & Deals | OfferLane,Current CarPuride promo codes and smart-car accessory deals.,
```

Sau khi sửa `stores.csv`, chạy:

```bash
npm run import:cms
npm run build
```

## 6. Cách cập nhật logo store

1. Đưa logo vào thư mục:

```text
public/assets/stores/
```

2. Ví dụ file logo:

```text
public/assets/stores/carpuride-logo.webp
```

3. Trong `public/import/stores.csv`, sửa cột `logo` thành:

```text
/assets/stores/carpuride-logo.webp
```

Khuyến nghị:

- Dùng logo có nền trong suốt nếu có thể (`.png` hoặc `.webp`).
- Tên file không dấu, không khoảng trắng.
- Nếu để trống `logo`, import sẽ dùng placeholder và hiển thị warning.
- Chỉ dùng logo/asset được phép sử dụng.

## 7. Cách cập nhật coupon/deal

File cần sửa: `public/import/offers.csv`

Mỗi dòng là một coupon hoặc deal, được gắn với store qua `storeSlug`.

Thao tác:

- Thêm coupon/deal: thêm một dòng mới với `offerId` chưa từng dùng.
- Sửa coupon/deal: chỉnh trực tiếp dòng offer đang có.
- Xóa coupon/deal: xóa dòng offer khỏi `offers.csv`.

Các cột hiện có:

| Cột | Bắt buộc | Ý nghĩa |
|---|---:|---|
| `storeSlug` | Có | Phải trùng với `storeSlug` trong `stores.csv`. Nếu không trùng, offer sẽ bị skip. |
| `offerId` | Có | ID duy nhất của offer, ví dụ `offer_001`. |
| `type` | Có | Chỉ nhận `coupon` hoặc `deal`. |
| `badge` | Không | Nhãn offer, ví dụ `Discount Code` hoặc `Special Offer`. |
| `headline` | Có | Tiêu đề offer hiển thị. |
| `summary` | Không | Mô tả ngắn/chi tiết offer. Nếu trống sẽ dùng `headline`. |
| `couponCode` | Nên có với coupon | Mã coupon để copy. Deal có thể để trống. |
| `ctaLabel` | Không | Text nút CTA. Nếu trống: coupon dùng `Show Coupon`, deal dùng `Get Deal`. |
| `expiryDate` | Không | Ngày hết hạn dạng `YYYY-MM-DD`. Nếu sai format sẽ warning và fallback. |
| `outboundUrl` | Nên có | Link affiliate/quảng cáo thật cho offer. Không nên để trống khi chạy ads. |
| `popularity` | Không | Số dùng cho sort popular. |
| `createdAt` | Không | Ngày tạo dạng `YYYY-MM-DD`, dùng để sort latest trong export. |
| `engagementCount` | Không | Số social proof hiển thị. Nếu trống thường fallback theo popularity. |
| `engagementLabel` | Không | Nhãn social proof, ví dụ `Times Loyal`. |

Hiện tại importer chưa có các cột `terms`, `verifiedAt`, hoặc `merchantNotes`. Nếu sau này cần hiển thị các thông tin đó, dev cần mở rộng importer và UI theo scope mới.

Quy tắc `type`:

- `type=coupon`: website hiển thị flow `Show Coupon` -> reveal mã -> `Copy` -> có thể đi tới store.
- `type=deal`: website hiển thị `Get Deal` và đi thẳng tới link quảng bá/affiliate.

Ví dụ coupon:

```csv
carpuride,offer_010,coupon,Discount Code,Get 20% Off Accessories,Use this code on selected accessories,SAVE20,Show Coupon,2026-07-31,https://affiliate.example.com/carpuride-save20,42,2026-05-16,42,Times Loyal
```

Ví dụ deal:

```csv
carpuride,offer_011,deal,Special Offer,Limited Time Dashboard Deal,Selected dashboard displays on sale,,Get Deal,2026-07-31,https://affiliate.example.com/carpuride-dashboard-deal,35,2026-05-16,35,Times Loyal
```

Sau khi sửa `offers.csv`, chạy:

```bash
npm run import:cms
npm run build
```

## 8. Cách cập nhật blog/bài viết

File cần sửa: `public/import/blogs.csv`

Mỗi dòng trong CSV là một bài blog. URL bài viết được tạo theo `slug`:

```text
/blogs/[slug]
```

Ví dụ nếu `slug` là `stack-seasonal-coupons`, URL sẽ là:

```text
/blogs/stack-seasonal-coupons
```

Import blog sẽ cập nhật phần `blogs.posts` trong `public/data/pages.json`, nhưng giữ nguyên các page/static content khác như `about`, `privacy`, `categories`, `stores`.

Thao tác:

- Thêm bài blog: thêm một dòng mới vào `blogs.csv` với `postId` và `slug` chưa từng dùng.
- Sửa bài blog: chỉnh trực tiếp dòng bài viết đang có.
- Xóa bài blog: xóa dòng bài viết khỏi `blogs.csv`, sau đó chạy import/build.

Các cột blog hiện có:

| Cột | Bắt buộc | Ý nghĩa |
|---|---:|---|
| `postId` | Có | ID duy nhất của bài viết, ví dụ `post_001`. |
| `slug` | Có | Slug URL của bài viết, ví dụ `stack-seasonal-coupons`. |
| `title` | Có | Tiêu đề bài viết. |
| `excerpt` | Không | Mô tả ngắn hiển thị ở blog index/detail. Nếu trống sẽ dùng `title`. |
| `category` | Không | Nhãn category bài viết. |
| `author` | Không | Tác giả. |
| `date` | Không | Ngày đăng dạng `YYYY-MM-DD`. Nếu sai format sẽ warning. |
| `heroImage` | Không | Đường dẫn ảnh hero, ví dụ `/assets/blogs/post-cover.webp`. Nếu trống dùng placeholder. |
| `sectionsJson` | Không | JSON array nội dung bài viết. Nếu sai format sẽ warning và dùng `[]`. |
| `relatedProductSlugs` | Không | Danh sách slug sản phẩm liên quan, ngăn cách bằng `;`. Phải trùng `slug` trong `products.csv`. |
| `relatedStoreSlugs` | Không | Danh sách store liên quan, ngăn cách bằng `;`. Phải trùng `storeSlug` trong `stores.csv`. |
| `ctaLabel` | Không | Nhãn CTA nội dung nếu UI sau này dùng. |
| `seoTitle` | Không | Title SEO riêng cho bài viết. |
| `seoDescription` | Không | Meta description SEO riêng cho bài viết. |

Ví dụ một dòng CSV blog:

```csv
post_010,auto-tech-buying-guide,Auto tech buying guide,What to check before clicking an auto-tech deal.,Buying Notes,OfferLane Editorial,2026-05-16,/assets/blogs/auto-tech-buying-guide.webp,"[{""heading"":""Check compatibility first"",""body"":""Confirm vehicle fit, app requirements, and merchant return terms before using an affiliate link.""}]",smart-screen-pro;wireless-carplay,carpuride,Compare product picks,Auto Tech Buying Guide | OfferLane,OfferLane checklist for reviewing auto-tech deals before clicking out.
```

Flow hiện tại:

```text
Blog -> Product picks mentioned by OfferLane -> Product detail -> Shop Now -> outbound affiliate
```

Lưu ý: route blog hiện đã lưu `relatedProductSlugs`, `relatedStoreSlugs`, và `ctaLabel` trong data để backward-compatible cho phase sau. UI hiện tại vẫn dùng danh sách featured products cho section recommended products, nên nếu muốn UI lọc đúng từng bài theo `relatedProductSlugs` thì đó là scope dev riêng.

## 9. Cách chạy import sau khi cập nhật

Sau khi sửa một trong các file CSV:

- `public/import/products.csv`
- `public/import/stores.csv`
- `public/import/offers.csv`
- `public/import/blogs.csv`

Chạy:

```bash
npm run import:cms
```

Lệnh này đọc dữ liệu từ CSV và generate:

- `public/data/products.json`
- `public/data/stores/[storeSlug].json`
- `public/data/pages.json` phần `blogs.posts`

Thông báo import:

- Warning về `imageSrc` hoặc `logo` trống nghĩa là hệ thống dùng placeholder, website vẫn chạy.
- Warning về `outboundUrl` trống nghĩa là link affiliate chưa sẵn sàng, nên sửa trước khi chạy ads.
- Lỗi bắt buộc như thiếu `productId`, `slug`, `storeSlug`, `storeName`, `offerId`, `headline`, hoặc `type` sai sẽ làm import fail.

Sau import, chạy tiếp:

```bash
npm run build
```

## 10. Cách kiểm tra local

Chạy dev server:

```bash
npm run dev
```

Mở các route sau:

```text
http://localhost:3000/
http://localhost:3000/products
http://localhost:3000/store/carpuride
http://localhost:3000/store/sample-tech
http://localhost:3000/category/auto-tech
http://localhost:3000/blogs
http://localhost:3000/products/smart-screen-pro
http://localhost:3000/blogs/stack-seasonal-coupons
```

Nếu thêm slug mới, mở đúng URL mới:

```text
http://localhost:3000/products/[slug-moi]
http://localhost:3000/store/[storeSlug-moi]
http://localhost:3000/blogs/[slug-moi]
```

## 11. Cách build trước khi deploy

Chạy:

```bash
npm run build
```

Nếu build pass thì có thể deploy. Nếu build lỗi:

- Đọc log lỗi trong terminal.
- Nếu lỗi liên quan CSV, sửa file trong `public/import/`.
- Nếu lỗi liên quan blog CSV, kiểm tra `sectionsJson`, `slug`, `postId`, hoặc format ngày trong `public/import/blogs.csv`.
- Chạy lại `npm run import:cms` nếu đã sửa CSV.
- Chạy lại `npm run build`.

## 12. Cách deploy lại

### Cách A - Dùng GitHub + Vercel

1. Sửa CSV/ảnh/blog theo nhu cầu.
2. Chạy local:

```bash
npm run import:cms
npm run build
```

3. Commit và push:

```bash
git add .
git commit -m "Update campaign data"
git push
```

4. Vercel sẽ tự deploy lại khi nhận commit mới.

Khuyến nghị Vercel:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run import:cms && npm run build`

Nếu build command trên đã dùng import trên Vercel, CSV là nguồn dữ liệu chính khi deploy. Nếu không dùng import trong CI, cần commit cả JSON đã generate trong `public/data/`.

### Cách B - Cập nhật trực tiếp trên server/CI

Chạy:

```bash
npm run import:cms && npm run build
```

Sau đó restart hoặc publish lại theo hệ thống hosting đang dùng.

## 13. Cách cập nhật Pixel/Analytics

Trên Vercel:

1. Vào project OfferLane.
2. Mở `Settings` -> `Environment Variables`.
3. Cập nhật các biến:

| Biến | Dùng để làm gì |
|---|---|
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4, đo traffic tổng thể. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel, đo Facebook/Instagram Ads. |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Pixel, đo TikTok Ads. |
| `NEXT_PUBLIC_SITE_URL` | URL production dùng cho robots/sitemap/canonical nếu project cấu hình biến này. |

Nếu chưa có pixel thật, có thể để trống các pixel ID. Khi env trống, third-party pixel script không load, nhưng tracking nội bộ `/api/track` vẫn hoạt động.

Sau khi thay env, cần redeploy để biến mới có hiệu lực.

## 14. SEO (metadata, sitemap, robots)

Website đã có SEO technical sẵn — khách **không cần sửa code** cho các mục sau:

| Thành phần | Mô tả |
|---|---|
| Metadata | Mỗi trang chính có title, description, canonical, Open Graph, Twitter card |
| `robots.txt` | Cho phép index trang public; chặn `/api/` |
| `sitemap.xml` | Liệt kê home, products, blogs, stores, categories, about/terms/privacy |
| JSON-LD | Organization/WebSite (home), Product, Article, CollectionPage, BreadcrumbList |

**Bắt buộc trước production:** đặt `NEXT_PUBLIC_SITE_URL` = domain thật (ví dụ `https://www.offerlane.com`). Nếu để trống, build vẫn chạy nhưng canonical/sitemap dùng `https://example.com`.

**Tùy chọn trong CSV:** `seoTitle`, `seoDescription` (products, stores, blogs) để ghi đè title/description SEO.

Sau deploy, mở:

- `https://your-domain.com/sitemap.xml`
- `https://your-domain.com/robots.txt`

## 15. Checklist sau khi cập nhật dữ liệu

Kiểm tra trước khi bàn giao hoặc chạy quảng cáo:

- Sản phẩm mới/sửa đã hiện đúng trên `/products`.
- Product detail `/products/[slug]` mở được.
- Ảnh sản phẩm đúng, không bị vỡ.
- Giá `currentPrice` và `compareAtPrice` đúng.
- Nút `Shop Now` đi đúng link affiliate.
- Store `/store/[storeSlug]` mở được.
- Logo store đúng hoặc placeholder được chấp nhận.
- Coupon hiện đúng headline/summary/expiry.
- `Show Coupon` reveal mã đúng.
- `Copy` copy được mã coupon.
- `Get Deal` đi đúng link affiliate.
- Category `/category/[slug]` có đúng stores/products.
- Blog index/detail render đúng.
- Bài blog liên kết flow Recommended Products -> Product detail -> Shop Now hoạt động.
- Mobile không vỡ layout hoặc tràn ngang.
- Network request `/api/track` trả `{ "success": true }`.
- Footer affiliate disclosure vẫn hiển thị.
- `npm run import:cms` pass.
- `npm run build` pass.

## 16. Các lỗi thường gặp

| Lỗi | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| Thiếu `imageSrc` | Dòng sản phẩm chưa có ảnh. | Thêm ảnh vào `public/assets/products/` và sửa `imageSrc`, hoặc chấp nhận placeholder. |
| Thiếu `logo` | Dòng store chưa có logo. | Thêm logo vào `public/assets/stores/` và sửa `logo`, hoặc chấp nhận placeholder. |
| `slug` bị trùng | Hai sản phẩm dùng cùng slug. | Đổi slug để mỗi product URL là duy nhất. |
| `productId` bị trùng | Hai sản phẩm dùng cùng ID. | Đổi `productId`. |
| `offerId` bị trùng | Hai offer dùng cùng ID. | Đổi `offerId`, nên unique trong từng store. |
| `storeSlug` không tồn tại | Offer đang trỏ tới store chưa có trong `stores.csv`. | Thêm store hoặc sửa typo `storeSlug`. |
| `similarProductSlugs` không khớp | Slug trong danh sách không tồn tại ở `products.csv`. | Sửa slug cho trùng chính xác. |
| `popularProductSlugs` không khớp | Slug trong danh sách không tồn tại ở `products.csv`. | Sửa slug cho trùng chính xác. |
| `relatedPostSlugs` không khớp | Blog trỏ tới slug bài khác không tồn tại. | Nếu cần dùng field này, dev có thể thêm cột optional; importer hiện vẫn preserve dữ liệu cũ theo slug. |
| `relatedProductSlugs` không khớp | Slug không tồn tại trong `products.csv`. | Sửa slug cho trùng chính xác với sản phẩm. |
| `relatedStoreSlugs` không khớp | Slug không tồn tại trong `stores.csv`. | Sửa slug cho trùng chính xác với store. |
| `sectionsJson` trong blog sai JSON | Thiếu dấu phẩy, quote, hoặc ngoặc trong `blogs.csv`. | Sửa JSON array; import sẽ warning và dùng `[]` nếu sai. |
| `detailSectionsJson` sai format | CSV chứa JSON array không hợp lệ. | Dùng format `[{""heading"":""..."",""body"":""...""}]` trong CSV. |
| `outboundUrl` trống | Chưa gắn link affiliate/quảng cáo. | Thêm link thật trước khi chạy ads. |
| `expiryDate` sai format | Không dùng `YYYY-MM-DD`. | Sửa thành ví dụ `2026-07-31`. |
| Quên chạy import | Đã sửa CSV nhưng JSON chưa đổi. | Chạy `npm run import:cms`. |
| Quên chạy build | Import xong nhưng chưa kiểm tra production build. | Chạy `npm run build`. |
| Vercel chưa redeploy | Đã push chưa thành công hoặc build command chưa chạy. | Kiểm tra Vercel Deployments và trigger redeploy. |

## 17. Lưu ý phạm vi

- Cập nhật sản phẩm/store/coupon bằng CSV là cập nhật dữ liệu.
- Cập nhật blog hiện tại là chỉnh `public/import/blogs.csv`; import sẽ cập nhật `public/data/pages.json` phần `blogs.posts`.
- Thêm section mới, layout mới, chức năng mới, field mới cho blog/store/product là công việc dev mới.
- Không nên sửa trực tiếp `public/data/products.json` hoặc `public/data/stores/*.json` nếu vẫn dùng import CSV, vì import có thể ghi đè.
- Không copy ảnh, logo, text, hoặc affiliate link từ website khác nếu chưa có quyền.
- Không thêm cart/checkout/buybox nếu mục tiêu vẫn là affiliate outbound site.
