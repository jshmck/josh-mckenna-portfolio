import { siteConfig } from "@/lib/site";

/**
 * Big Cartel product data layer.
 *
 * Fetched live, client-side, from Big Cartel's public v0 API
 * (api.bigcartel.com/{subdomain}/products.json — unauthenticated, CORS
 * open to any origin) rather than baked in at build time. That keeps
 * /shop genuinely live — a product Josh adds or marks sold out in Big
 * Cartel shows up with no rebuild — while the page itself still
 * prerenders static; only the product grid is client-fetched. See
 * components/shop/shop-grid.tsx for the fetching component.
 *
 * Only `"active"` is confirmed (Big Cartel's own API docs example) as
 * the buyable status. Anything else — `"coming-soon"` (Josh's real first
 * listing right now), presumably `"sold-out"`/hidden/draft states too —
 * is treated as not-yet-buyable rather than enumerated exhaustively,
 * since the full status list isn't documented anywhere public.
 */

export type BigCartelProductOption = {
  id: number;
  name: string;
  price: number;
  sold_out: boolean;
};

export type BigCartelCategory = {
  id: number;
  name: string;
  permalink: string;
};

export type BigCartelProduct = {
  id: number;
  name: string;
  permalink: string;
  price: number;
  status: string;
  description: string;
  url: string;
  images: { url: string; width: number; height: number }[];
  options: BigCartelProductOption[];
  categories: BigCartelCategory[];
};

/** Sort order for the shop grid, per Josh: "Prints, Stickers, Small
 *  Things" — a flat re-sort, not a visual grouping. Anything in a
 *  category not listed here sorts after these three. */
const CATEGORY_ORDER = ["Prints", "Stickers", "Small Things"];

export function sortByCategory(
  products: BigCartelProduct[],
): BigCartelProduct[] {
  const rank = (product: BigCartelProduct) => {
    const index = CATEGORY_ORDER.indexOf(product.categories[0]?.name ?? "");
    return index === -1 ? CATEGORY_ORDER.length : index;
  };
  return [...products].sort((a, b) => rank(a) - rank(b));
}

export async function fetchShopProducts(): Promise<BigCartelProduct[]> {
  const response = await fetch(
    `https://api.bigcartel.com/${siteConfig.shop.subdomain}/products.json`,
  );
  if (!response.ok) {
    throw new Error(`Big Cartel returned ${response.status}`);
  }
  return response.json();
}

export function isBuyable(product: BigCartelProduct): boolean {
  return (
    product.status === "active" &&
    product.options.some((option) => !option.sold_out)
  );
}

export function isSoldOut(product: BigCartelProduct): boolean {
  return (
    product.status === "sold-out" ||
    (product.options.length > 0 &&
      product.options.every((option) => option.sold_out))
  );
}

/** "£50" for a single price, "From £50" when options vary. */
export function formatPrice(product: BigCartelProduct): string {
  const prices = product.options.length
    ? product.options.map((option) => option.price)
    : [product.price];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const format = (value: number) =>
    `£${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}`;
  return min === max ? format(min) : `From ${format(min)}`;
}

export function checkoutUrl(product: BigCartelProduct): string {
  return `${siteConfig.shop.url}${product.url}`;
}
