"use client"

import { createContext, useContext, useEffect, useMemo } from "react"

import type { Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"
import { createFormatters } from "./format"

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null)

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale
  dictionary: Dictionary
  children: React.ReactNode
}) {
  // <html lang> is rendered before the locale is known; keep it in sync for
  // screen readers, fonts and line-height rules.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => ({ locale, t: dictionary }), [locale, dictionary])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>")
  const { locale, t } = ctx
  const f = useMemo(() => createFormatters(locale, t), [locale, t])
  return { locale, t, f }
}
