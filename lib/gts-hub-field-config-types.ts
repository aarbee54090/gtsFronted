import type { ContentType } from "./gts-hub-types"

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "boolean"
  | "tags"
  | "media-list"
  | "media-single"
  | "richtext"

export interface FieldConfig {
  key: string // dot-path into the document, e.g. "title" or "seo.title"
  label: string
  kind: FieldKind
  options?: readonly string[] // for "select"
  placeholder?: string
  required?: boolean // affects publish validation hint only, not enforced client-side
}

export interface ContentTypeConfig {
  contentType: ContentType
  label: string // e.g. "Portfolio Project"
  pluralLabel: string // e.g. "Portfolio"
  apiBasePath: string // e.g. "/portfolio"
  adminBasePath: string // e.g. "/admin/portfolio"
  titleField: "title" | "name" // Material uses "name", everything else "title"
  fields: FieldConfig[]
  // Which of the fields feed the related-content suggestion criteria.
  relatedCriteriaFields: { sport?: string; productType?: string; tags?: string }
}
