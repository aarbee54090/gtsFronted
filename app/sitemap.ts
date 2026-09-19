import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublishedList, fetchCategories, fetchProductsByCategory } from "@/lib/api";
import { sportToSlug } from "@/lib/mock-products";

const STATIC_ROUTES = [
  "",
  "/products",
  "/process",
  "/customize",
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

async function hubDetailUrls(): Promise<MetadataRoute.Sitemap> {
  const lists = await Promise.all(
    HUB_CONTENT_PATHS.map((path) =>
      getPublishedList<{ slug: string; updatedAt?: string }>(path, { limit: "500" }).catch(
        () => ({ data: [] }) as { data: { slug: string; updatedAt?: string }[] }
      )
    )
  );

  return lists.flatMap((res, i) =>
    res.data.map((item) => ({
      url: `${SITE_URL}/gts-hub${HUB_CONTENT_PATHS[i]}/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }))
  );
}

async function customizeUrls(): Promise<MetadataRoute.Sitemap> {
  const categories = await fetchCategories();
  const entries: MetadataRoute.Sitemap = [];

  await Promise.all(
    categories.map(async (category) => {
      const encodedCategory = encodeURIComponent(category);
      entries.push({ url: `${SITE_URL}/customize/${encodedCategory}` });

      const sports = await fetchProductsByCategory(category);
      for (const item of sports) {
        entries.push({ url: `${SITE_URL}/customize/${encodedCategory}/${sportToSlug(item.sport)}` });
      }
    })
  );

  return entries;
}

// /admin, /account, and the checkout/quotation/design-configurator steps
// are deliberately excluded - they're noindex'd (see their own metadata)
// and have no standalone content worth sending crawlers to.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));

  const [hubEntries, customizeEntries] = await Promise.all([
    hubDetailUrls(),
    customizeUrls(),
  ]);

  return [...staticEntries, ...hubEntries, ...customizeEntries];
}
