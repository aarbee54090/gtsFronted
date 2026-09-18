"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import {
  PenLine,
  Zap,
  ShieldCheck,
  Truck,
  PlayCircle,
  Shirt,
  Dumbbell,
  Bike,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// Faint floor reflection under the grounded cutouts (ball/bag) - the case
// stays reflection-free since its edges are already faded by a radial mask,
// and reflecting a fading oval reads as a smudge rather than a floor. Not a
// standard React CSS property, so it's applied via a plain style object cast.
const REFLECT_STYLE = {
  WebkitBoxReflect: "below 6px linear-gradient(transparent, transparent 55%, rgba(255,255,255,0.14))",
} as CSSProperties

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

const FEATURES = [
  { icon: PenLine, label: "Fully\nCustomizable" },
  { icon: Zap, label: "Fast\nTurnaround" },
  { icon: ShieldCheck, label: "Premium\nQuality" },
  { icon: Truck, label: "Worldwide\nShipping" },
]

const CATEGORIES = [
  { icon: Shirt, title: "Jerseys", subtitle: "For Every Team" },
  { icon: Shirt, title: "Tracksuits", subtitle: "Train in Style" },
  { icon: Shirt, title: "Hoodies", subtitle: "Stay Comfortable" },
  { icon: Bike, title: "Cycling Jersey", subtitle: "Ride in Comfort" },
  { icon: Dumbbell, title: "Gym Wear", subtitle: "Built for Performance" },
]

const SPORTS = [
  { icon: "/images/sport-basketball.png", label: "Basketball" },
  { icon: "/images/sport-football.png", label: "Football" },
  { icon: "/images/sport-volleyball.png", label: "Volleyball" },
  { icon: "/images/sport-cricket.png", label: "Cricket" },
  { icon: "/images/sport-cycling.png", label: "Cycling" },
]

// The case/ball/bag composition, reused for both mobile (normal flow, no
// absolute positioning at all) and desktop (absolutely positioned within
// the hero). Internal percentages are relative to THIS wrapper's own
// aspect-ratio box, not the whole page - so they stay correct regardless
// of how tall the surrounding text ends up being.
function Scene({ variant }: { variant: "mobile" | "desktop" }) {
  if (variant === "mobile") {
    return (
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/15 blur-[45px]"
        />
        <div
          className="absolute left-1/2 top-[4%] w-[62%] -translate-x-1/2 aspect-[382/535]"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 78%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 78%, transparent 100%)",
          }}
        >
          <Image src="/images/hero-case.png" alt="Custom jersey with dragon design in a glass display case" fill sizes="260px" className="object-contain" />
        </div>
        <div className="absolute bottom-[6%] left-0 w-[26%] aspect-[539/463] drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)]" style={REFLECT_STYLE}>
          <Image src="/images/hero-ball.png" alt="Branded GTS football" fill sizes="110px" className="object-contain" />
        </div>
        <div className="absolute bottom-[8%] right-0 w-[34%] aspect-[697/358] drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)]" style={REFLECT_STYLE}>
          <Image src="/images/hero-bag-cutout.png" alt="Branded GTS duffel bag" fill sizes="145px" className="object-contain" />
        </div>
      </div>
    )
  }

  // Desktop: absolutely positioned within the hero section, percentages
  // matched against the reference mockup's own pixel dimensions.
  return (
    <div className="absolute inset-0 z-[5] hidden md:block">
      <div className="absolute left-[52%] top-[10%] w-[29%] aspect-[382/535]">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/15 blur-[50px]"
        />
        <div
          className="absolute inset-0"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 78%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 78%, transparent 100%)",
          }}
        >
          <Image src="/images/hero-case.png" alt="Custom jersey with dragon design in a glass display case" fill priority sizes="29vw" className="object-contain" />
        </div>
      </div>

      <div className="absolute left-[42%] top-[73%] w-[7.6%] aspect-[539/463] drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)]" style={REFLECT_STYLE}>
        <Image src="/images/hero-ball.png" alt="Branded GTS football" fill sizes="8vw" className="object-contain" />
      </div>

      <div className="absolute left-[82%] top-[64%] w-[15%] aspect-[697/358] drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)]" style={REFLECT_STYLE}>
        <Image src="/images/hero-bag-cutout.png" alt="Branded GTS duffel bag" fill sizes="15vw" className="object-contain" />
      </div>

      <div className="glass-bevel absolute left-[82%] top-[20%] hidden w-[16%] flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-[16px] xl:flex">
        {CATEGORIES.map(({ icon: Icon, title, subtitle }) => (
          <Link key={title} href="/products" className="group flex items-center gap-3 whitespace-nowrap">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-brand-green)] transition-colors group-hover:border-[var(--color-brand-green)] group-hover:bg-[var(--color-brand-green)]/10">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">{title}</span>
              <span className="block text-xs text-[var(--color-text-gray)]">{subtitle}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-8 pt-32 md:min-h-[700px] md:pb-10 lg:min-h-[780px]">
      {/* Frosted-glass fade at the bottom edge - blends the section into
          whatever follows (Footer) instead of an abrupt hard cutoff. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-24 bg-white/5 backdrop-blur-md [mask-image:linear-gradient(to_top,black,transparent)]"
      />
      {/* ONE shared background image - cropped differently per breakpoint via
          object-position, instead of two separate files (which is what was
          intermittently failing to load on mobile). */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg-desktop.webp"
          alt=""
          fill
          priority
          className="object-cover object-[68%_center] md:object-center"
        />
      </div>

      {/* Desktop scene - absolutely positioned, unaffected by text length */}
      <Scene variant="desktop" />

      <div className="relative z-10 mx-auto max-w-[1300px]">
        <div className="max-w-[560px] text-center md:text-left">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
          >
            Custom Team Sportswear
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="mb-6 text-4xl font-extrabold uppercase leading-[1.1] tracking-tight sm:text-5xl"
          >
            Create your team.
            <br />
            Wear your <span className="text-[var(--color-brand-green)]">identity.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="mb-8 text-base leading-relaxed text-[var(--color-text-gray)]"
          >
            Design custom jerseys, tracksuits, hoodies, and gym wear for your
            team, college, or company. Pick your options, get an instant quote,
            and order — no account needed.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.25}
            className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 md:items-start">
                <Icon className="h-6 w-6 text-[var(--color-brand-green)]" strokeWidth={2} />
                <span className="whitespace-pre-line text-xs font-bold uppercase leading-tight text-white">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="mb-8 flex flex-wrap items-center justify-center gap-4 md:justify-start"
          >
            <Button asChild size="lg">
              <Link href="/products" className="group">
                Start Customizing{" "}
                <span className="inline-block text-lg leading-none transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/process" className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Watch How It Works
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile scene - normal document flow, placed here (after the CTA
            buttons, before Our Sports) so it can never overlap the navbar or
            header text regardless of how tall they render. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 md:hidden"
        >
          <Scene variant="mobile" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.35} className="max-w-[560px]">
          <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-white">
            Sports
            <span className="h-px max-w-[120px] flex-1 bg-white/40" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
            {SPORTS.map((sport) => (
              <div key={sport.label} className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/95">
                  {/* eslint-disable-next-line @next/next/no-img-element -- small fixed icon, next/image overhead not needed */}
                  <img src={sport.icon} alt={sport.label} className="h-6 w-6 object-contain" />
                </span>
                <span className="text-xs text-[var(--color-text-gray)]">{sport.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
