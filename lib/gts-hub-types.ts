export type ContentType = "portfolio" | "journal" | "new-arrival" | "material";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  provider?: string;
  alt?: string;
  caption?: string;
}

export interface RelatedContentRef {
  contentType: ContentType;
  refId: string;
}

export interface SeoFields {
  title?: string;
  description?: string;
  ogImage?: string;
}

export type PublishStatus = "draft" | "published";

interface BaseContent {
  _id: string;
  slug: string;
  tags: string[];
  relatedContent: RelatedContentRef[];
  seo?: SeoFields;
  status: PublishStatus;
  publishedAt?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioProject extends BaseContent {
  title: string;
  organizationName?: string;
  organizationType?: string;
  sport?: string;
  productType?: string;
  quantity?: number;
  description?: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  designImages: MediaItem[];
  productionImages: MediaItem[];
  finalImages: MediaItem[];
  fabric?: string;
  printingMethod?: string;
  usedDesign?: { productId?: string; designId?: string };
}

export interface JournalArticle extends BaseContent {
  title: string;
  excerpt?: string;
  content?: string; // HTML from Tiptap
  coverImage?: MediaItem;
  category?: string;
  sport?: string;
  productType?: string;
  author?: string;
}

export interface NewArrival extends BaseContent {
  title: string;
  productType?: string;
  sport?: string;
  description?: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  images: MediaItem[];
  availableCustomization: string[];
}

export interface Material extends BaseContent {
  name: string; // Material uses "name" instead of "title"
  category?: string;
  description?: string;
  gsm?: number;
  features: string[];
  suitableFor: string[];
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  images: MediaItem[];
  specifications?: Record<string, string>;
}

export interface RelatedContentEntry {
  contentType: ContentType;
  item: PortfolioProject | JournalArticle | NewArrival | Material;
}

export interface SuggestedRelatedEntry extends RelatedContentEntry {
  score?: number;
}

export interface ContentListResponse<T> {
  success: boolean;
  count: number;
  page: number;
  data: T[];
}

export interface ContentDetailResponse<T> {
  success: boolean;
  data: T;
  related?: RelatedContentEntry[];
}
