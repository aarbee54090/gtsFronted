import "@testing-library/jest-dom/vitest"

// jsdom doesn't implement IntersectionObserver, which Motion's `whileInView`
// relies on. A minimal mock is enough for components under test to mount
// without crashing; we don't assert on actual scroll-triggered behavior.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ""
  readonly thresholds: ReadonlyArray<number> = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver
