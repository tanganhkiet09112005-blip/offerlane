"use client";

import { trackOutbound } from "@/lib/analytics";
import type { Product } from "@/lib/types";

export function ProductOutboundLink({
  product,
  placement,
  className = "btn btn--primary",
}: {
  product: Product;
  placement: string;
  className?: string;
}) {
  return (
    <a
      href={product.outboundUrl}
      className={className}
      data-event="outbound_click"
      rel="nofollow sponsored noopener"
      onClick={(e) => {
        e.preventDefault();
        trackOutbound({
          events: [
            {
              name: "view_product",
              payload: {
                product_id: product.productId,
                list_name: placement,
                source: "shop_now",
              },
            },
            {
              name: "outbound_click",
              payload: {
                placement,
                entity_type: "product",
                entity_id: product.productId,
              },
            },
          ],
          url: product.outboundUrl,
        });
      }}
    >
      Shop Now
    </a>
  );
}
