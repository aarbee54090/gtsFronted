/**
 * Display tidy-up for admin-typed text that was entered all lower case
 * ("kalanki kathmandu", "blue dragon custom jersey"): capitalizes each
 * all-lowercase word and collapses whitespace. Words the admin capitalized
 * themselves (GTS, RAYZRS, T-shirt) are left exactly as typed.
 */
export function tidyWords(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s(/])([a-z][a-z'’-]*)/g, (_match, lead: string, word: string) => lead + word[0].toUpperCase() + word.slice(1))
}

/** tidyWords only when the whole string is lower case - mixed-case text is left alone. */
export function tidyIfLowercase(text: string): string {
  return text === text.toLowerCase() ? tidyWords(text) : text.trim().replace(/\s+/g, " ")
}
