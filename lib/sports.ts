import { tidyIfLowercase } from "./text"

/** "e-sports", "E Sports", "esports" -> "esports"; used to match sports across records. */
export function sportKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

// How searchers write the sports and styles admins type in other forms.
const DISPLAY_NAMES: Record<string, string> = {
  esports: "Esports",
  tshirt: "T-Shirt",
}

/** "e-sports" -> "Esports", "volleyball" -> "Volleyball", "Football" -> "Football" */
export function sportLabel(sport: string): string {
  return DISPLAY_NAMES[sportKey(sport)] ?? tidyIfLowercase(sport)
}
