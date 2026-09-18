"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CardPhoto } from "@/components/shared/CardPhoto"

import { sportToSlug } from "@/lib/mock-products"
import type { BackendProductSummary } from "@/lib/api"

interface SportPickerProps {
  categorySlug: string
  categoryName: string
  sports: BackendProductSummary[]
}

export function SportPicker({ categorySlug, categoryName, sports }: SportPickerProps) {
  return (
    <div>
      <div className="mb-8 flex gap-4">
        <span aria-hidden="true" className="mt-1 w-[3px] shrink-0 self-stretch rounded-full bg-[var(--color-brand-green)]" />
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-brand-green)]">
            {categoryName}
          </p>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Choose your <span className="text-[var(--color-brand-green)]">sport</span>
          </h1>
          <p className="text-sm text-[var(--color-text-gray)]">
            Designs are tailored to each sport — pick one to see the right kits.
          </p>
        </div>
      </div>

      {sports.length === 0 ? (
        <p className="text-sm text-[var(--color-text-gray)]">
          No sports available yet for this category.
        </p>
      ) : (
        <>
          {/* Mobile: single-column stacked wide cards - icon/title/arrow on
              the left, a wide (landscape) photo on the right. Uses the
              mobile-specific thumbnail if the admin set one, since a
              square/portrait desktop crop usually doesn't compose well
              this wide. */}
          <div className="flex flex-col gap-4 md:hidden">
            {sports.map((item, i) => {
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
                  href={`/customize/${categorySlug}/${sportToSlug(item.sport)}`}
                  className="group glass-sheen glass-bevel relative flex h-32 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[16px] transition-all duration-[var(--duration-medium)] hover:border-[var(--color-brand-green)] hover:shadow-[var(--glow-green-strong)] active:scale-[0.98] active:border-[var(--color-brand-green)]"
                >
                  <div className="flex w-[42%] flex-shrink-0 flex-col justify-between p-4">
                    <div>
                      <p className="text-base font-bold text-white">{item.sport}</p>
                      <p className="text-xs text-[var(--color-text-gray)]">{item.name}</p>
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

          {/* Desktop/tablet: square/portrait card grid. A lone item left
              over in the last xl (4-col) row - e.g. 5 sports - would
              otherwise render as a single narrow card orphaned in its own
              row. Instead it spans the full row and switches to the same
              wide horizontal layout used for mobile cards. Below xl the
              remainder math differs (2/3-col grids), so it just falls back
              to being a normal grid item there. */}
          <div className="hidden grid-cols-1 gap-5 sm:grid-cols-2 md:grid lg:grid-cols-3 xl:grid-cols-4">
            {sports.map((item, i) => {
              const isLastAlone = i === sports.length - 1 && sports.length % 4 === 1
              return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={isLastAlone ? "xl:col-span-4" : undefined}
              >
              {isLastAlone ? (
                <Link
                  href={`/customize/${categorySlug}/${sportToSlug(item.sport)}`}
                  className="group glass-sheen glass-bevel relative flex h-32 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[16px] transition-all duration-[var(--duration-medium)] hover:border-[var(--color-brand-green)] hover:shadow-[var(--glow-green-strong)] active:scale-[0.98] active:border-[var(--color-brand-green)]"
                >
                  <div className="flex w-[28%] flex-shrink-0 flex-col justify-between p-5 xl:w-[18%]">
                    <div>
                      <p className="text-base font-bold text-white">{item.name}</p>
                      <p className="text-xs text-[var(--color-text-gray)]">{item.sport}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-brand-green)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:border-[var(--color-brand-green)] group-hover:bg-[var(--color-brand-green)]/10"
                    >
                      →
                    </span>
                  </div>
                  <div className="relative flex-1">
                    <CardPhoto src={item.thumbnailImageUrl} alt={item.name} sizes="80vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--color-card-dark)] to-transparent" />
                  </div>
                </Link>
              ) : (
              <Link
                href={`/customize/${categorySlug}/${sportToSlug(item.sport)}`}
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

                {/* Glass chip behind the text row - the black gradient above
                    isn't enough contrast against bright thumbnails, so the
                    text sits on its own frosted panel instead of directly
                    on the photo. Fixed min-height + line-clamp keeps every
                    card's chip the same size regardless of how many words
                    the sport/product name wraps to. */}
                <div className="glass-bevel relative mx-3 mb-3 flex min-h-[76px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/30 p-3 backdrop-blur-[20px]">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="line-clamp-2 text-base font-bold leading-tight text-white">{item.name}</span>
                    <span className="text-xs text-[var(--color-text-gray)]">{item.sport}</span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-brand-green)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:border-[var(--color-brand-green)] group-hover:bg-[var(--color-brand-green)]/10"
                  >
                    →
                  </span>
                </div>
              </Link>
              )}
              </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
