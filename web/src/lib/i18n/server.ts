import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config"
import { en } from "./dictionaries/en"
import { my } from "./dictionaries/my"
import { createFormatters } from "./format"

const dictionaries = { en, my }

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

/** Reads the language cookie. A runtime API: call it inside a Suspense boundary. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
})

/** `const { t, f, locale } = await getI18n()` in Server Components and Server Actions. */
export const getI18n = cache(async () => {
  const locale = await getLocale()
  const t = getDictionary(locale)
  return { locale, t, f: createFormatters(locale, t) }
})
