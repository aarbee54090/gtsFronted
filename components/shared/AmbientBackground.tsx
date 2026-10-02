// Shared ambient backdrop for every customer-facing page (never used on
// admin pages): a faint lime light from the top corners over the charcoal
// background, so glass chrome (navbar, menus) has something to frost.
//
// Deliberately quiet - the old version stacked three strong glows and a
// light sweep, which competed with the jersey photography. Fixed to the
// viewport and sent behind the page (-z-10); the page wrapper rendering this
// must be `isolate`, which keeps -z-10 above the wrapper's own background.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Sized by min(vh, vw) and pushed off-screen by a fraction of their own
          size, so a narrow/tall window doesn't flood the content area. */}
      <div className="absolute left-0 top-[-12%] h-[min(55vh,70vw)] w-[min(55vh,70vw)] -translate-x-1/2 rounded-full bg-[var(--color-brand-green)]/[0.09] blur-[120px]" />
      <div className="absolute right-0 top-[35%] h-[min(60vh,75vw)] w-[min(60vh,75vw)] translate-x-2/3 rounded-full bg-[var(--color-brand-green)]/[0.06] blur-[130px]" />
      <div className="ambient-grain absolute inset-0" />
    </div>
  )
}
