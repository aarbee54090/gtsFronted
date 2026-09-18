// Shared ambient backdrop for every customer-facing page (never used on
// admin pages). Without this, glass surfaces (backdrop-blur + translucent
// background) have nothing but flat solid color behind them to blur - which
// looks visually identical to a plain opaque box, no matter how correct the
// glass CSS is. This gives every public page the same soft, showroom-style
// glow/texture the homepage Hero already has, so glassmorphism actually
// reads as glass everywhere, not just on the homepage.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-[10%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-[var(--color-brand-green)]/[0.22] blur-[110px]" />
      <div className="absolute -right-[15%] top-[25%] h-[65vh] w-[65vh] rounded-full bg-[var(--color-brand-green)]/[0.16] blur-[130px]" />
      <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-[var(--color-brand-green)]/[0.09] to-transparent" />
      {/* Single diagonal light sweep across the whole page, like a light
          catching a glass pane at an angle - a thin bright core fading to
          transparent on both sides, rotated and oversized so it clears the
          viewport at any aspect ratio. */}
      <div className="absolute left-[-20%] top-[8%] h-[140%] w-[45%] -rotate-[22deg] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  )
}
