import type { SeoFields } from "./gts-hub-types"

export interface ContactInfo {
  _id: string
  phone?: string
  email?: string
  address?: string
  whatsapp?: string
  mapEmbedUrl?: string
  seo?: SeoFields
}

export type ContactSubmissionStatus = "new" | "read"

export interface ContactSubmission {
  _id: string
  name: string
  email: string
  message: string
  status: ContactSubmissionStatus
  createdAt: string
}
