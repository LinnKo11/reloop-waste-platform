import type {
  ContactType,
  ListingStatus,
  ListingType,
  MaterialRequestStatus,
  SuggestionMethod,
  UserAccountType,
  WasteReportStatus,
} from "@/lib/types"

/**
 * Non-translatable configuration. All user-facing labels live in
 * `lib/i18n/dictionaries/*` so the UI can switch between English and Burmese.
 */
export const siteConfig = {
  /** Working name — the proposal lists the final name as "to be confirmed". */
  name: "ReLoop",
  defaultCurrency: "MMK",
}

export type Tone = "green" | "blue" | "amber" | "red" | "gray" | "sky" | "violet"

/** Tailwind class strings for small coloured status pills. */
export const toneClasses: Record<Tone, string> = {
  green: "bg-emerald-500/12 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300",
  blue: "bg-blue-500/12 text-blue-700 ring-blue-600/20 dark:text-blue-300",
  amber: "bg-amber-500/15 text-amber-800 ring-amber-600/25 dark:text-amber-300",
  red: "bg-rose-500/12 text-rose-700 ring-rose-600/20 dark:text-rose-300",
  gray: "bg-muted text-muted-foreground ring-border",
  sky: "bg-sky-500/12 text-sky-700 ring-sky-600/20 dark:text-sky-300",
  violet: "bg-violet-500/12 text-violet-700 ring-violet-600/20 dark:text-violet-300",
}

export const listingTypeTone: Record<ListingType, Tone> = { FOR_SALE: "green", FREE: "sky", WANTED: "amber" }

export const listingStatusTone: Record<ListingStatus, Tone> = {
  ACTIVE: "green",
  PAUSED: "gray",
  RESERVED: "amber",
  COMPLETED: "blue",
  CLOSED: "gray",
}

export const requestStatusTone: Record<MaterialRequestStatus, Tone> = {
  PENDING: "amber",
  ACCEPTED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
  COMPLETED: "blue",
}

export const reportStatusTone: Record<WasteReportStatus, Tone> = {
  REPORTED: "red",
  VERIFIED: "amber",
  COLLECTED: "sky",
  RESOLVED: "green",
}

/** Marker colours on the waste map. */
export const reportStatusColor: Record<WasteReportStatus, string> = {
  REPORTED: "#e11d48",
  VERIFIED: "#d97706",
  COLLECTED: "#0284c7",
  RESOLVED: "#059669",
}

export const accountTypeTone: Record<UserAccountType, Tone> = {
  INDIVIDUAL: "gray",
  JUNK_SHOP: "amber",
  ORGANISATION: "violet",
  BUSINESS: "blue",
}

export const methodTone: Record<SuggestionMethod, Tone> = { REUSE: "violet", RECYCLE: "green" }

export const contactHref: Record<ContactType, (value: string) => string> = {
  TELEGRAM: (v) => `https://t.me/${v.replace(/^@/, "")}`,
  PHONE: (v) => `tel:${v.replace(/\s/g, "")}`,
  EMAIL: (v) => `mailto:${v}`,
}

/** Cities and townships offered in forms and filters, with a map centre per city. */
export const LOCATIONS: Record<string, { center: [number, number]; townships: string[] }> = {
  Yangon: {
    center: [16.8409, 96.1735],
    townships: [
      "Bahan",
      "Dagon",
      "Hlaing",
      "Hlaingthaya",
      "Insein",
      "Kamayut",
      "Mayangon",
      "North Dagon",
      "Sanchaung",
      "South Okkalapa",
      "Tamwe",
      "Thingangyun",
    ],
  },
  Mandalay: {
    center: [21.9588, 96.0891],
    townships: ["Aungmyethazan", "Chanayethazan", "Chanmyathazi", "Mahaaungmye", "Pyigyidagun"],
  },
  Naypyitaw: {
    center: [19.7633, 96.0785],
    townships: ["Ottarathiri", "Pyinmana", "Zabuthiri"],
  },
  Bago: { center: [17.3352, 96.4813], townships: ["Bago"] },
  Mawlamyine: { center: [16.4905, 97.6283], townships: ["Mawlamyine"] },
}

export const CITIES = Object.keys(LOCATIONS)
export const DEFAULT_MAP_CENTER: [number, number] = LOCATIONS.Yangon.center
