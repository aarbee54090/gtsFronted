// Shared ambient backdrop for every customer-facing page (never used on
// admin pages). Without this, glass surfaces (backdrop-blur + translucent
// background) have nothing but flat solid color behind them to blur - which
// looks visually identical to a plain opaque box, no matter how correct the
// glass CSS is. This gives every public page the same soft, showroom-style
// glow/texture the homepage Hero already has, so glassmorphism actually
// reads as glass everywhere, not just on the homepage.
//
// Fixed to the viewport and sent behind the page (-z-10), so glass always
// has lit color behind it while scrolling and the glow never paints over
// photos or text. The page wrapper rendering this must be `isolate` - that
// keeps -z-10 above the wrapper's own background instead of behind it.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Glows are capped by viewport width too (min(vh, vw)) and pushed
          off-screen by a fraction of their own size, not of the page width -
          otherwise a narrow/tall window keeps the full-height circle while
          hiding less of it, and the glow floods the content area. */}
      <div className="absolute left-0 top-[-10%] h-[min(55vh,70vw)] w-[min(55vh,70vw)] -translate-x-1/3 rounded-full bg-[var(--color-brand-green)]/[0.22] blur-[110px]" />
      <div className="absolute right-0 top-[30%] h-[min(65vh,80vw)] w-[min(65vh,80vw)] translate-x-1/2 rounded-full bg-[var(--color-brand-green)]/[0.16] blur-[130px]" />
      <div className="absolute bottom-0 left-[20%] h-[min(45vh,60vw)] w-[min(45vh,60vw)] translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/[0.1] blur-[120px]" />
      {/* Single diagonal light sweep across the whole page, like a light
          catching a glass pane at an angle - a thin bright core fading to
          transparent on both sides, rotated and oversized so it clears the
          viewport at any aspect ratio. */}
      <div className="absolute left-[-20%] top-[8%] h-[140%] w-[45%] -rotate-[22deg] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="ambient-grain absolute inset-0" />
    </div>
  )
}
