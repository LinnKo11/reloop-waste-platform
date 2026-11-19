import { Skeleton } from "@/components/ui/skeleton"
import { I18nProvider } from "@/lib/i18n/client"
import { getI18n } from "@/lib/i18n/server"

import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** Reads the language cookie once and provides it to every Client Component. */
export async function LocaleRoot({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n()

  return (
    <I18nProvider locale={locale} dictionary={t}>
      {/* lang on a wrapper (not only <html>) so Burmese typography applies on first paint. */}
      <div lang={locale} className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </I18nProvider>
  )
}

export function AppShellFallback() {
  return (
    <>
      <div className="sticky top-0 z-40 h-14 border-b bg-background">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="size-7 rounded-full" />
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
      </main>
    </>
  )
}
