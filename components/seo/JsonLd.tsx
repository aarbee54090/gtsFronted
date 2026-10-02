import type { JsonLdNode } from "@/lib/structured-data"

// Renders schema.org structured data. "<" is escaped so CMS text inside the
// payload can never close the script tag early (per the Next.js JSON-LD guide).
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
