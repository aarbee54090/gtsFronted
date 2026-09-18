// Sport/ProductType stay as plain strings in the database (per the GTS Hub
// architecture decisions), but the admin UI only offers them via these
// dropdowns so "Football" can never accidentally become "football" or
// "Football " in stored data. If a value you need isn't here, add it here
// first rather than typing it freehand somewhere else.

export const SPORTS = [
  "Football",
  "Cricket",
  "Basketball",
  "Volleyball",
  "Badminton",
  "Hockey",
  "Rugby",
  "Athletics",
] as const;

export const PRODUCT_TYPES = [
  "Jersey Kit",
  "Tracksuit",
  "Hoodie",
  "Gym Wear",
  "Training Kit",
] as const;

export const ORGANIZATION_TYPES = ["College", "Club", "Company", "School", "Academy", "Individual"] as const;

export const MATERIAL_CATEGORIES = ["Fabric", "Trim", "Print Material"] as const;
