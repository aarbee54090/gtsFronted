// Single entry point for every backend call the frontend makes - the base
// URL, the admin-key helpers, the generic fetch wrappers, and every
// domain-specific function (about, contact, hub section images, main
// products, GTS Hub public content, platforms, products/addons) all live
// here so there's exactly one place that knows how to reach the backend.
// Previously this was split across 7 near-identical files, each redefining
// its own API_URL (one of which had silently drifted to a different value
// than the rest - a real bug this consolidation fixes).

import type { AdminProduct } from "./admin-types";
import type { ApiItemResponse, ApiListResponse } from "./admin-types";
import type { Addon } from "./types";
import type { AboutPage } from "./about-types";
import type { ContactInfo, ContactSubmission, ContactSubmissionStatus } from "./contact-types";
import type { HubSectionImage, HubSectionKey } from "./hub-section-image-types";
import type { ContentDetailResponse, ContentListResponse } from "./gts-hub-types";
import type { Platform } from "./platform-types";

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!envApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to gts-fr/.env (and to your hosting env vars).");
}
export const API_URL: string = envApiUrl;
const ADMIN_KEY_STORAGE = "gts_admin_key";

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

// Checks a key against the backend's actual admin key, without saving
// anything. Returns true only if the backend genuinely accepts it.
export async function verifyAdminKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/verify`, {
      headers: { "x-admin-key": key },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function clearAdminKey() {
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  requireAdmin?: boolean;
}

// Calls the backend. When requireAdmin is true, attaches the saved admin
// key as the x-admin-key header - the same static-key check the backend's
// requireAdmin middleware expects. If body is a FormData instance (e.g. a
// file upload), it's sent as-is - the browser sets the correct multipart
// Content-Type/boundary itself, so we must NOT set it manually.
export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, requireAdmin = false }: ApiFetchOptions = {}
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };

  if (requireAdmin) {
    const key = getAdminKey();
    if (!key) {
      throw new ApiError("No admin key saved. Please enter it first.", 401);
    }
    headers["x-admin-key"] = key;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include", // required for the customer session cookie to be sent/received cross-origin
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message || `Request failed with status ${res.status}`, res.status);
  }

  return json as T;
}

// For binary responses (e.g. the admin-only receipt image endpoint) -
// returns an object URL the caller must revoke when done with it.
export async function apiFetchBlobUrl(path: string, { requireAdmin = false } = {}): Promise<string> {
  const headers: Record<string, string> = {};
  if (requireAdmin) {
    const key = getAdminKey();
    if (!key) {
      throw new ApiError("No admin key saved. Please enter it first.", 401);
    }
    headers["x-admin-key"] = key;
  }

  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) {
    throw new ApiError(`Request failed with status ${res.status}`, res.status);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ---------------------------------------------------------------------------
// About page
// ---------------------------------------------------------------------------

// Public server-side fetch - 404s if the admin hasn't set it up yet, so the
// caller falls back to null and the page renders a "coming soon" state
// instead of crashing. Plain fetch (not apiFetch) so Next's revalidate
// caching option is available, same pattern as getPublishedPlatforms.
export async function getAboutPage(): Promise<AboutPage | null> {
  const res = await fetch(`${API_URL}/about`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json: ApiItemResponse<AboutPage> = await res.json();
  return json.data;
}

export async function adminUpdateAboutPage(input: {
  heading?: string;
  body?: string;
  heroImage?: AboutPage["heroImage"];
  seo?: AboutPage["seo"];
}): Promise<AboutPage> {
  const res = await apiFetch<ApiItemResponse<AboutPage>>("/about", {
    method: "PUT",
    requireAdmin: true,
    body: input,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

// Public server-side fetch - same pattern as getAboutPage/getPublishedPlatforms.
export async function getContactInfo(): Promise<ContactInfo | null> {
  const res = await fetch(`${API_URL}/contact`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json: ApiItemResponse<ContactInfo> = await res.json();
  return json.data;
}

export async function adminUpdateContactInfo(input: {
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  mapEmbedUrl?: string;
  seo?: ContactInfo["seo"];
}): Promise<ContactInfo> {
  const res = await apiFetch<ApiItemResponse<ContactInfo>>("/contact", {
    method: "PUT",
    requireAdmin: true,
    body: input,
  });
  return res.data;
}

// Public/guest - the Contact Us form.
export async function submitContactMessage(input: { name: string; email: string; message: string }): Promise<void> {
  await apiFetch("/contact/submissions", { method: "POST", body: input });
}

export async function adminListSubmissions(): Promise<ContactSubmission[]> {
  const res = await apiFetch<ApiListResponse<ContactSubmission>>("/contact/submissions", { requireAdmin: true });
  return res.data;
}

export async function adminUpdateSubmissionStatus(
  id: string,
  status: ContactSubmissionStatus
): Promise<ContactSubmission> {
  const res = await apiFetch<ApiItemResponse<ContactSubmission>>(`/contact/submissions/${id}/status`, {
    method: "PATCH",
    requireAdmin: true,
    body: { status },
  });
  return res.data;
}

export async function adminDeleteSubmission(id: string): Promise<void> {
  await apiFetch(`/contact/submissions/${id}`, { method: "DELETE", requireAdmin: true });
}

// ---------------------------------------------------------------------------
// GTS Hub section images
// ---------------------------------------------------------------------------

// Public - no admin key needed, safe to call from both the public /gts-hub
// page (server-side) and the admin editor (client-side, to prefill).
export async function getHubSectionImages(): Promise<HubSectionImage[]> {
  const res = await fetch(`${API_URL}/hub-section-images`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json: ApiListResponse<HubSectionImage> = await res.json();
  return json.data;
}

export async function adminUpsertHubSectionImage(
  sectionKey: HubSectionKey,
  input: { desktopImageUrl?: string; mobileImageUrl?: string }
): Promise<HubSectionImage> {
  const res = await apiFetch<ApiItemResponse<HubSectionImage>>(`/hub-section-images/${sectionKey}`, {
    method: "PUT",
    requireAdmin: true,
    body: input,
  });
  return res.data;
}

export async function adminDeleteHubSectionImage(sectionKey: HubSectionKey): Promise<void> {
  await apiFetch(`/hub-section-images/${sectionKey}`, { method: "DELETE", requireAdmin: true });
}

// ----------------------------------------------------------------------------
// Main products (top-level categories, e.g. "Jersey", "Hoodie", "Tracksuit")
// ---------------------------------------------------------------------------

export interface MainProductSummary {
  _id: string;
  name: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  description?: string;
}

// Fetches active Main Products for the /products landing page - fully
// admin-curated, separate from the per-sport sub-products under each one.
export async function fetchMainProducts(): Promise<MainProductSummary[]> {
  try {
    const res = await fetch(`${API_URL}/main-products`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// GTS Hub public content (portfolio/journal/new-arrivals/materials - generic
// list + slug lookups shared across all of them). No admin key - these only
// ever return published content (enforced by the backend itself).
// `revalidate: 60` keeps pages reasonably fresh without refetching on every
// single request.
// ---------------------------------------------------------------------------

export async function getPublishedList<T>(
  apiBasePath: string,
  params?: Record<string, string | undefined>
): Promise<ContentListResponse<T>> {
  const query = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
  }
  const qs = query.toString();
  const res = await fetch(`${API_URL}${apiBasePath}${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to load ${apiBasePath} (${res.status})`);
  return res.json();
}

export async function getBySlug<T>(apiBasePath: string, slug: string): Promise<ContentDetailResponse<T> | null> {
  const res = await fetch(`${API_URL}${apiBasePath}/slug/${slug}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load ${apiBasePath}/slug/${slug} (${res.status})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Platforms (social / external links)
// ---------------------------------------------------------------------------

// Server-side fetch for the public "Our Platforms" section - published only
// (enforced by the backend), pre-sorted by the admin-set `order` field.
export async function getPublishedPlatforms(): Promise<Platform[]> {
  const res = await fetch(`${API_URL}/platforms`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load platforms (${res.status})`);
  const json: { success: boolean; data: Platform[] } = await res.json();
  return json.data;
}

// ---------------------------------------------------------------------------
// Products, categories, addons
// ---------------------------------------------------------------------------

export interface BackendProductSummary {
  _id: string;
  name: string;
  category: string;
  sport: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
}

// Distinct category strings actually in use across sub-products.
export async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/products/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchProductsByCategory(categoryName: string): Promise<BackendProductSummary[]> {
  try {
    const res = await fetch(`${API_URL}/products/category/${encodeURIComponent(categoryName)}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

interface BackendAddonStyle {
  _id: string;
  label: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

interface BackendAddon {
  _id: string;
  name: string;
  styles: BackendAddonStyle[];
}

// Live, admin-managed addons (Shorts/Track/etc., each with priced styles and
// an optional Cloudinary preview image) - falls back to an empty list on any
// failure so the customize flow degrades to its mock addons instead of
// breaking outright (see the [design] page, which does that merge).
export async function fetchAddons(): Promise<Addon[]> {
  try {
    const res = await fetch(`${API_URL}/addons`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const items: BackendAddon[] = json.data ?? [];
    // Some older test records predate the styles[] field and have none -
    // nothing for a customer to pick, so they're excluded here rather than
    // rendering an addon with zero options. They still show up in the admin
    // list (unfiltered) so they can be filled in or deleted from there.
    return items
      .filter((addon) => addon.styles.length > 0)
      .map((addon) => ({
        id: addon._id,
        name: addon.name,
        styles: addon.styles.map((style) => ({
          id: style._id,
          label: style.label,
          price: style.price,
          imageUrl: style.imageUrl,
          description: style.description,
        })),
      }));
  } catch {
    return [];
  }
}

export async function fetchProductByCategorySport(
  categoryName: string,
  sport: string
): Promise<AdminProduct | null> {
  try {
    const res = await fetch(
      `${API_URL}/products/category/${encodeURIComponent(categoryName)}/sport/${encodeURIComponent(sport)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Order tracking
// ---------------------------------------------------------------------------

// What the public tracking endpoint returns - deliberately no contact
// details, address, or uploaded files.
export interface OrderTracking {
  orderId: string;
  status: "pending" | "approved" | "rejected";
  productName: string;
  sport: string;
  designName: string;
  designImageUrl?: string;
  quantity: number;
  deadlineDate?: string;
  currency: string;
  total: number;
  advanceAmount: number;
  balanceAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Public/guest - no login. Throws ApiError(404) if the ID doesn't match an order.
export async function trackOrder(orderId: string): Promise<OrderTracking> {
  const res = await apiFetch<ApiItemResponse<OrderTracking>>(`/orders/track/${encodeURIComponent(orderId)}`);
  return res.data;
}
