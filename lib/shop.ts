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

/** Shop grid section order — matches the categories set up in Big Cartel,
 *  per Josh: "Prints, Stickers, Small Things." A category created later
 *  that isn't in this list still shows, just after these three. */
const CATEGORY_ORDER = ["Prints", "Stickers", "Small Things"];

export type ShopSection = { name: string; products: BigCartelProduct[] };

/** Groups by each product's first category (falling back to "Other" for
 *  anything uncategorised), ordered per CATEGORY_ORDER. */
export function groupByCategory(products: BigCartelProduct[]): ShopSection[] {
  const groups = new Map<string, BigCartelProduct[]>();
  for (const product of products) {
    const name = product.categories[0]?.name ?? "Other";
    const group = groups.get(name) ?? [];
    group.push(product);
    groups.set(name, group);
  }

  const ordered = CATEGORY_ORDER.filter((name) => groups.has(name));
  const rest = [...groups.keys()].filter(
    (name) => !CATEGORY_ORDER.includes(name),
  );

  return [...ordered, ...rest].map((name) => ({
    name,
    products: groups.get(name)!,
  }));
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
