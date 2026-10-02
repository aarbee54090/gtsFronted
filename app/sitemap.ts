import type { MetadataRoute } from "next";
import { getPublishedList, fetchCategories, fetchProductsByCategory, fetchProductByCategorySport } from "@/lib/api";
import { sportToSlug } from "@/lib/mock-products";
import { absoluteUrl, customizePath } from "@/lib/seo";

// Every URL here is in the exact form its page declares as canonical
// (absoluteUrl / customizePath). Deliberately left out: /admin, /account,
// the /customize fallback and the design/checkout/quotation steps (all
// noindex'd), one-product category pickers (noindex'd), /about (a permanent
// redirect), and anything that would render an empty or "not found" page.
const STATIC_ROUTES = [
  "/",
  "/products",
  "/process",
  "/track",
  "/gts-hub",
  "/gts-hub/about",
  "/gts-hub/contact",
  "/gts-hub/journal",
  "/gts-hub/materials",
  "/gts-hub/new-arrivals",
  "/gts-hub/portfolio",
];

const HUB_CONTENT_PATHS = ["/journal", "/materials", "/new-arrivals", "/portfolio"] as const;

// The public list endpoint caps `limit` at 50, so larger sections have to be
// paged through. The page cap is just a guard against a runaway loop.
const HUB_PAGE_SIZE = 50;
const HUB_MAX_PAGES = 40;

interface HubListItem {
  slug: string;
  updatedAt?: string;
}

async function publishedHubItems(apiPath: string): Promise<HubListItem[]> {
  const items: HubListItem[] = [];
  for (let page = 1; page <= HUB_MAX_PAGES; page++) {
    const res = await getPublishedList<HubListItem>(apiPath, { limit: String(HUB_PAGE_SIZE), page: String(page) });
    items.push(...res.data);
    if (res.data.length < HUB_PAGE_SIZE || items.length >= res.count) break;
  }
  return items;
}

async function hubDetailUrls(): Promise<MetadataRoute.Sitemap> {
  const lists = await Promise.all(
    HUB_CONTENT_PATHS.map((path) => publishedHubItems(path).catch(() => [] as HubListItem[]))
  );

  return lists.flatMap((items, i) =>
    items.map((item) => ({
      url: absoluteUrl(`/gts-hub${HUB_CONTENT_PATHS[i]}/${item.slug}`),
      lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }))
  );
}

async function customizeUrls(): Promise<MetadataRoute.Sitemap> {
  const categories = await fetchCategories();

  const perCategory = await Promise.all(
    categories.map(async (category): Promise<MetadataRoute.Sitemap> => {
      const sports = await fetchProductsByCategory(category);
      // An empty category renders an empty (noindex'd) sport picker.
      if (sports.length === 0) return [];

      // Only sport pages that actually resolve, via the same lookup the page
      // itself does - anything else renders "Product not found", which is
      // noindex'd and doesn't belong here.
      const products = await Promise.all(
        sports.map((item) => fetchProductByCategorySport(category, sportToSlug(item.sport)))
      );

      return [
        // A one-product category is noindex'd in favour of that product's page.
        ...(sports.length > 1 ? [{ url: absoluteUrl(customizePath(category)) }] : []),
        ...products.flatMap((product) =>
          product ? [{ url: absoluteUrl(customizePath(product.category, product.sport)) }] : []
        ),
      ];
    })
  );

  return perCategory.flat();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
  }));

  const [hubEntries, customizeEntries] = await Promise.all([hubDetailUrls(), customizeUrls()]);

  const seen = new Set<string>();
  return [...staticEntries, ...hubEntries, ...customizeEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
