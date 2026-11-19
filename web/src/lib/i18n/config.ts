export const LOCALES = ["en", "my"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "reloop_locale"

/** BCP 47 tags used for Intl formatting. `my-MM` renders Myanmar digits. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  my: "my-MM",
}

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  my: "မြန်မာ",
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

/** Fills `{name}` placeholders: interpolate("Hi, {name}", { name: "Aung" }). */
export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : `{${key}}`))
}
