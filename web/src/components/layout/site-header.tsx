import { Megaphone, Plus, Recycle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { siteConfig } from "@/lib/constants"
import { getI18n } from "@/lib/i18n/server"

import { LanguageSwitcher } from "./language-switcher"
import { MainNav, MobileNav, NavLinks } from "./nav"
import { UserMenu } from "./user-menu"

export async function SiteHeader() {
  const { t } = await getI18n()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="size-8 md:hidden" />}>
          <MobileNav />
        </Suspense>
        <Link href="/" className="mr-2 flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Recycle className="size-4" />
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <Suspense fallback={<NavLinks />}>
          <MainNav />
        </Suspense>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
            <Link href="/reports/new">
              <Megaphone /> {t.nav.reportWaste}
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/listings/new">
              <Plus /> {t.nav.postListing}
            </Link>
          </Button>
          <LanguageSwitcher />
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="size-7 rounded-full" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
