"use client";

import { useEffect, useState } from "react";

import { Plate } from "@/components/ui/plate";
import {
  checkoutUrl,
  fetchShopProducts,
  formatPrice,
  isBuyable,
  isSoldOut,
  sortByCategory,
  type BigCartelProduct,
} from "@/lib/shop";

/**
 * Live product grid, fetched client-side straight from Big Cartel (see
 * lib/shop.ts) — the page itself still prerenders static; only this
 * component talks to the network, after mount.
 *
 * Renders nothing (silently) on fetch failure or an empty catalogue, so a
 * Big Cartel hiccup or a store with nothing listed yet just leaves the
 * waitlist copy above it standing alone, rather than showing an error
 * where a product grid should be.
 */
export function ShopGrid() {
  const [products, setProducts] = useState<BigCartelProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchShopProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <ul className="mt-24 grid gap-8 md:grid-cols-3">
      {sortByCategory(products).map((product) => {
        const buyable = isBuyable(product);
        const soldOut = isSoldOut(product);
        const image = product.images[0];
        const status = buyable ? null : soldOut ? "Sold out" : "Coming soon";

        const card = (
          <>
            <div className="relative">
              <Plate
                image={{
                  ratio: "4/5",
                  alt: product.name,
                  src: image?.url,
                }}
                sizes="(max-width: 768px) 100vw, 33vw"
                className={!buyable ? "opacity-40" : undefined}
              />
              {status && (
                // Centred rather than corner-pinned -- at left-3 it sat
                // inside the frame's 40px corner curve (rounded-frame),
                // poking into the curved zone instead of the flat part
                // of the image. Centring sidesteps that regardless of
                // card size/ratio. border-ink + this padding matches the
                // sitewide pill shape (Work's filters, nav search, the
                // waitlist/HOWDY buttons) -- bg-canvas stays (unlike
                // those) since this is the only pill that sits on top of
                // a photo rather than the plain page background, and
                // needs the fill to stay legible over it.
                <span className="type-label absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-ink bg-canvas px-4 py-[9.5px] text-ink-muted">
                  {status}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <p className="font-body text-[15px] font-medium text-ink">
                {product.name}
              </p>
              <p className="type-label text-ink-muted">
                {formatPrice(product)}
              </p>
            </div>
          </>
        );

        return (
          <li key={product.id}>
            {buyable ? (
              <a
                href={checkoutUrl(product)}
                className="block transition-opacity hover:opacity-80"
              >
                {card}
              </a>
            ) : (
              card
            )}
          </li>
        );
      })}
    </ul>
  );
}
