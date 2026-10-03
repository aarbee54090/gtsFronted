import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

import type { Platform } from "@/lib/platform-types"

interface PlatformCardProps {
  platform: Platform
}

export function PlatformCard({ platform }: PlatformCardProps) {
  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noreferrer"
      className="group glass-sheen glass-2 flex items-center gap-4 rounded-[var(--radius-lg)] p-5 transition-all duration-[var(--duration-medium)] hover:-translate-y-1 hover:border-[var(--color-brand-green)] hover:shadow-[0_0_32px_rgba(182,255,0,0.18)]"
    >
      <span className="glass-1 flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
        {platform.logo?.url ? (
          <Image src={platform.logo.url} alt={platform.name} width={44} height={44} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-[var(--color-brand-green)]">{platform.name.charAt(0)}</span>
        )}
      </span>
      <span className="flex-1">
        <span className="block text-base font-bold text-white">{platform.name}</span>
        {platform.description && (
          <span className="block text-xs text-[var(--color-text-gray)]">{platform.description}</span>
        )}
      </span>
      <ArrowUpRight className="h-5 w-5 flex-shrink-0 text-[var(--color-text-gray)] transition-colors group-hover:text-[var(--color-brand-green)]" />
    </a>
  )
}
