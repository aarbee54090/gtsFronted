import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { WhatsAppButton } from "@/components/shared/WhatsAppButton"

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void

// A controllable IntersectionObserver: the test decides what's on screen.
function installObserver() {
  const observers: { callback: Callback; targets: Element[] }[] = []
  class FakeObserver {
    targets: Element[] = []
    constructor(callback: Callback) {
      observers.push({ callback, targets: this.targets })
    }
    observe(target: Element) {
      this.targets.push(target)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  const original = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
  return {
    show: (target: Element, isIntersecting: boolean) =>
      act(() => observers.forEach((o) => o.targets.includes(target) && o.callback([{ target, isIntersecting }]))),
    restore: () => {
      globalThis.IntersectionObserver = original
    },
  }
}

const fab = () => screen.getByLabelText("Chat with GoalThali Sports on WhatsApp", { selector: "a" })

describe("WhatsAppButton", () => {
  afterEach(() => vi.useRealTimers())

  it("appears straight away on pages without their own WhatsApp button", async () => {
    render(<WhatsAppButton number="+977 970-574-3117" />)
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(fab()).toHaveAttribute("aria-hidden", "false")
    expect(fab().getAttribute("href")).toMatch(/^https:\/\/wa\.me\/9779705743117\?text=/)
  })

  it("steps aside while an on-page WhatsApp button is visible, and comes back after it", async () => {
    const io = installObserver()
    try {
      render(
        <>
          <a href="https://wa.me/1" data-whatsapp-cta>
            Chat on WhatsApp
          </a>
          <WhatsAppButton />
        </>
      )
      const inline = screen.getByText("Chat on WhatsApp")
      io.show(inline, true)
      expect(fab()).toHaveAttribute("aria-hidden", "true")
      expect(fab()).toHaveAttribute("tabindex", "-1")
      io.show(inline, false)
      expect(fab()).toHaveAttribute("aria-hidden", "false")
      expect(fab()).not.toHaveAttribute("tabindex")
    } finally {
      io.restore()
    }
  })
})
