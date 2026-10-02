// How ordering works, step by step. These describe what the site actually
// does (catalog -> customizer -> live quote -> checkout with a 40% advance
// receipt -> admin review -> tracking by Order ID), so the same wording is
// used on /process and in the homepage summary. Change the flow, change this.

export interface ProcessStep {
  key: string
  title: string
  summary: string
  detail: string
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    key: "design",
    title: "Choose your design",
    summary: "Pick a product and sport, then a design - or upload your own.",
    detail:
      "Browse by product and sport and choose from the GTS design catalog, or upload your own artwork if you already have a design.",
  },
  {
    key: "customize",
    title: "Customize",
    summary: "Sleeves, collars, extras, names, numbers, and sizes.",
    detail:
      "Choose sleeve and collar options and extras like shorts or tracks, then add player names, numbers, and sizes - type them in or upload a spreadsheet. Logos and sponsor artwork can be attached as files.",
  },
  {
    key: "price",
    title: "See your price",
    summary: "The total updates as you customize.",
    detail:
      "Your price is calculated from the design, the quantity tier, and the options you choose, and it updates as you go. If your quantity is outside the listed price tiers, contact us for a custom quote.",
  },
  {
    key: "advance",
    title: "Pay 40% to order",
    summary: "Place the order with a 40% advance.",
    detail:
      "Check out with your contact details and delivery address, pay the 40% advance using one of the listed payment methods, and upload your payment receipt. A GTS account (name, phone, address) is needed to place an order.",
  },
  {
    key: "review",
    title: "We review, then produce",
    summary: "Every order is reviewed before production.",
    detail: "The GTS team reviews and approves each order before it goes into production.",
  },
  {
    key: "track",
    title: "Track your order",
    summary: "Check progress anytime with your Order ID.",
    detail: "Use the Order ID you receive at checkout to see your order's status at any time - no login needed.",
  },
  {
    key: "receive",
    title: "Get your kit",
    summary: "Pay the remaining 60% and receive your order.",
    detail: "The remaining 60% is due once your order is ready, then your kit is handed over or delivered anywhere in Nepal.",
  },
]
