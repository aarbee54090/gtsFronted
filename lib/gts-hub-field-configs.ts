import { SPORTS, PRODUCT_TYPES, ORGANIZATION_TYPES, MATERIAL_CATEGORIES } from "./taxonomy-constants"
import type { ContentTypeConfig } from "./gts-hub-field-config-types"

export const PORTFOLIO_CONFIG: ContentTypeConfig = {
  contentType: "portfolio",
  label: "Portfolio Project",
  pluralLabel: "Portfolio",
  apiBasePath: "/portfolio",
  adminBasePath: "/admin/portfolio",
  titleField: "title",
  relatedCriteriaFields: { sport: "sport", productType: "productType", tags: "tags" },
  fields: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "organizationName", label: "Organization Name", kind: "text" },
    { key: "organizationType", label: "Organization Type", kind: "select", options: ORGANIZATION_TYPES },
    { key: "sport", label: "Sport", kind: "select", options: SPORTS },
    { key: "productType", label: "Product Type", kind: "select", options: PRODUCT_TYPES },
    { key: "quantity", label: "Quantity", kind: "number" },
    { key: "description", label: "Description", kind: "textarea", required: true },
    { key: "fabric", label: "Fabric", kind: "text" },
    { key: "printingMethod", label: "Printing Method", kind: "text" },
    { key: "thumbnailImageUrl", label: "Thumbnail Image URL (desktop)", kind: "text", placeholder: "https://res.cloudinary.com/..." },
    { key: "thumbnailImageUrlMobile", label: "Thumbnail Image URL (mobile)", kind: "text", placeholder: "Optional - falls back to desktop image" },
    { key: "designImages", label: "Design Images", kind: "media-list" },
    { key: "productionImages", label: "Production Images", kind: "media-list" },
    { key: "finalImages", label: "Final Images", kind: "media-list", required: true },
    { key: "tags", label: "Tags", kind: "tags" },
  ],
}

export const JOURNAL_CONFIG: ContentTypeConfig = {
  contentType: "journal",
  label: "Journal Article",
  pluralLabel: "Journal",
  apiBasePath: "/journal",
  adminBasePath: "/admin/journal",
  titleField: "title",
  relatedCriteriaFields: { sport: "sport", productType: "productType", tags: "tags" },
  fields: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "excerpt", label: "Excerpt", kind: "textarea", required: true, placeholder: "Shown in listings, max ~300 characters" },
    { key: "content", label: "Content", kind: "richtext", required: true },
    { key: "coverImage", label: "Cover Image", kind: "media-single" },
    { key: "category", label: "Category", kind: "text", placeholder: "e.g. Guides, Behind the Scenes" },
    { key: "sport", label: "Sport", kind: "select", options: SPORTS },
    { key: "productType", label: "Product Type", kind: "select", options: PRODUCT_TYPES },
    { key: "author", label: "Author", kind: "text", placeholder: "GTS" },
    { key: "tags", label: "Tags", kind: "tags" },
  ],
}

export const NEW_ARRIVAL_CONFIG: ContentTypeConfig = {
  contentType: "new-arrival",
  label: "New Arrival",
  pluralLabel: "New Arrivals",
  apiBasePath: "/new-arrivals",
  adminBasePath: "/admin/new-arrivals",
  titleField: "title",
  relatedCriteriaFields: { sport: "sport", productType: "productType", tags: "tags" },
  fields: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "sport", label: "Sport", kind: "select", options: SPORTS },
    { key: "productType", label: "Product Type", kind: "select", options: PRODUCT_TYPES },
    { key: "description", label: "Description", kind: "textarea", required: true },
    { key: "thumbnailImageUrl", label: "Thumbnail Image URL (desktop)", kind: "text", placeholder: "https://res.cloudinary.com/..." },
    { key: "thumbnailImageUrlMobile", label: "Thumbnail Image URL (mobile)", kind: "text", placeholder: "Optional - falls back to desktop image" },
    { key: "images", label: "Images", kind: "media-list", required: true },
    { key: "availableCustomization", label: "Available Customization", kind: "tags", placeholder: "e.g. Sleeve length, Collar" },
    { key: "tags", label: "Tags", kind: "tags" },
  ],
}

export const MATERIAL_CONFIG: ContentTypeConfig = {
  contentType: "material",
  label: "Material",
  pluralLabel: "Materials",
  apiBasePath: "/materials",
  adminBasePath: "/admin/materials",
  titleField: "name",
  relatedCriteriaFields: { tags: "tags" }, // Material has no sport/productType field
  fields: [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "category", label: "Category", kind: "select", options: MATERIAL_CATEGORIES },
    { key: "description", label: "Description", kind: "textarea", required: true },
    { key: "gsm", label: "GSM", kind: "number" },
    { key: "features", label: "Features", kind: "tags", placeholder: "e.g. Lightweight, Quick-drying" },
    { key: "suitableFor", label: "Suitable For (sports)", kind: "tags", placeholder: "e.g. Football, Cricket" },
    { key: "thumbnailImageUrl", label: "Thumbnail Image URL (desktop)", kind: "text", placeholder: "https://res.cloudinary.com/..." },
    { key: "thumbnailImageUrlMobile", label: "Thumbnail Image URL (mobile)", kind: "text", placeholder: "Optional - falls back to desktop image" },
    { key: "images", label: "Images", kind: "media-list" },
    { key: "tags", label: "Tags", kind: "tags" },
  ],
}
