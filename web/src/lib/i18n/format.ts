import type { MaterialListing, QuantityUnit } from "@/lib/types"

import { INTL_LOCALE, interpolate, type Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

/**
 * Locale-aware formatters. Burmese uses Myanmar digits and month names via
 * Intl (`my-MM`); English uses `en-GB`. Times are shown in Asia/Yangon.
 */
const MYANMAR_DIGITS = "၀၁၂၃၄၅၆၇၈၉"

export function createFormatters(locale: Locale, t: Dictionary) {
  const tag = INTL_LOCALE[locale]
  // Numbers are formatted the same way on server and browser: browsers (e.g.
  // Chrome) ship without Burmese number data, so Intl("my-MM") would print
  // Latin digits on the client and Myanmar digits on the server, breaking
  // hydration. Format in English, then swap digits ourselves.
  const digits = (s: string) => (locale === "my" ? s.replace(/[0-9]/g, (d) => MYANMAR_DIGITS[Number(d)]) : s)
  const enNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 })
  const enMoney = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
  const numberFmt = { format: (n: number) => digits(enNumber.format(n)) }
  const moneyFmt = { format: (n: number) => digits(enMoney.format(n)) }
  const dateFmt = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Yangon",
  })
  const dateTimeFmt = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Yangon",
  })
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  const unitShort = (unit: QuantityUnit) => t.enums.unit[unit].short
  const currency = (code: string) => (t.enums.currency as Record<string, string>)[code] ?? code

  const f = {
    number: (value: number) => numberFmt.format(value),
    quantity: (quantity: number, unit: QuantityUnit) => `${numberFmt.format(quantity)} ${unitShort(unit)}`,
    money: (amount: number, code = "MMK") => `${moneyFmt.format(amount)} ${currency(code)}`,
    date: (iso: string) => dateFmt.format(new Date(iso)),
    dateTime: (iso: string) => dateTimeFmt.format(new Date(iso)),
    /** Request-time only (Server Components after data access). */
    relative: (iso: string, now: number = Date.now()) => {
      const diff = Math.round((new Date(iso).getTime() - now) / 1000)
      const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 31_536_000],
        ["month", 2_592_000],
        ["week", 604_800],
        ["day", 86_400],
        ["hour", 3_600],
        ["minute", 60],
      ]
      for (const [unit, seconds] of units) {
        if (Math.abs(diff) >= seconds) return rtf.format(Math.round(diff / seconds), unit)
      }
      return rtf.format(0, "second")
    },
    city: (city: string | null) => (city ? (t.cities[city] ?? city) : ""),
    location: (city: string | null, township: string | null) =>
      [township, city ? (t.cities[city] ?? city) : null].filter(Boolean).join(locale === "my" ? "၊ " : ", ") ||
      t.common.locationNotSet,
    category: (name: string) => t.categories[name] ?? name,
    difficulty: (value: string | null) => (value ? (t.enums.difficulty[value] ?? value) : null),
    listingPrice: (
      listing: Pick<MaterialListing, "listing_type" | "price_per_unit" | "currency" | "quantity_unit">,
    ) => {
      if (listing.listing_type === "FREE") return t.enums.listingType.FREE.label
      if (listing.listing_type === "WANTED") return t.enums.listingType.WANTED.label
      if (listing.price_per_unit == null) return t.listings.priceOnRequest
      return `${moneyFmt.format(listing.price_per_unit)} ${currency(listing.currency)} / ${unitShort(listing.quantity_unit)}`
    },
    t: interpolate,
  }
  return f
}

export type Formatters = ReturnType<typeof createFormatters>
