// Every GTS price is in Nepali rupees, shown as "Rs 1,200".

export const CURRENCY = "Rs"

/**
 * The symbol to show for a stored currency. Orders and drafts saved before
 * October 2026 carry "₹" - the old template's symbol, applied to the same
 * Nepali-rupee amounts - so it's shown as "Rs" too.
 */
export function displayCurrency(currency: string | undefined | null): string {
  const symbol = currency?.trim()
  return !symbol || symbol === "₹" ? CURRENCY : symbol
}

/**
 * "Rs 1,200". A non-breaking space keeps the symbol and the amount on one
 * line; the amount is rounded to whole rupees.
 */
export function formatMoney(currency: string | undefined | null, amount: number): string {
  return `${displayCurrency(currency)} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
