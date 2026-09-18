"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Shirt } from "lucide-react"

import { fetchMainProducts, type MainProductSummary } from "@/lib/api"
import { CardPhoto } from "@/components/shared/CardPhoto"

export function ProductCategories() {
  const [mainProducts, setMainProducts] = useState<MainProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMainProducts()
      .then(setMainProducts)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="products" className="mx-auto max-w-[1300px] px-6 py-16 sm:py-24">
      <div className="mb-10 text-center sm:mb-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
          What We Make
        </p>
        <h2 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Built for every team, <span className="text-[var(--color-brand-green)]">every sport</span>
        </h2>
      </div>

      {!loading && mainProducts.length === 0 && (
        <p className="text-center text-sm text-[var(--color-text-gray)]">
          No products available yet.
        </p>
      )}

      {/* Mobile: single-column stacked wide cards, same layout as the sport
          picker - icon/title/arrow on the left, wide photo on the right. */}
      <div className="flex flex-col gap-4 md:hidden">
        {mainProducts.map((item, i) => {
          const mobileImage = item.thumbnailImageUrlMobile || item.thumbnailImageUrl
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/customize/${encodeURIComponent(item.name)}`}
                className="group glass-sheen glass-bevel relative flex h-32 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[16px] transition-all duration-[var(--duration-medium)] hover:border-[var(--color-brand-green)] hover:shadow-[var(--glow-green-strong)] active:scale-[0.98] active:border-[var(--color-brand-green)]"
              >
                <div className="flex w-[42%] flex-shrink-0 flex-col justify-between p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                    <Shirt className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-white">{item.name}</p>
                    <p className="line-clamp-2 text-xs text-[var(--color-text-gray)]">
                      {item.description || `Custom ${item.name.toLowerCase()}, made to order`}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-brand-green)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:border-[var(--color-brand-green)] group-hover:bg-[var(--color-brand-green)]/10"
                  >
                    →
                  </span>
                </div>
                <div className="relative flex-1">
                  <CardPhoto src={mobileImage} alt={item.name} sizes="60vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  {/* Fade the photo into the left panel so the edge doesn't look like a hard cut */}
                  <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--color-card-dark)] to-transparent" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Desktop/tablet: existing square/portrait card grid, unchanged */}
      <div className="hidden grid-cols-1 gap-5 sm:grid-cols-2 md:grid lg:grid-cols-3 xl:grid-cols-4">
        {mainProducts.map((item, i) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/customize/${encodeURIComponent(item.name)}`}
              className="group glass-bevel relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[16px] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-brand-green)] hover:shadow-[var(--glow-green-strong)]"
            >
              <CardPhoto
                src={item.thumbnailImageUrl}
                alt={item.name}
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.thumbnailImageUrl && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              )}

              <div className="glass-bevel relative mx-3 mb-3 flex min-h-[76px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/30 p-3 backdrop-blur-[20px]">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                  <Shirt className="h-4 w-4" />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <h3 className="line-clamp-2 text-base font-bold leading-tight text-white">{item.name}</h3>
                  <span className="line-clamp-1 text-xs text-[var(--color-text-gray)]">
                    {item.description || `Custom ${item.name.toLowerCase()}, made to order`}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-brand-green)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:border-[var(--color-brand-green)] group-hover:bg-[var(--color-brand-green)]/10"
                >
                  →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
