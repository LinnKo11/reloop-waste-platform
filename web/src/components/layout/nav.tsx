"use client"

import { Info, LayoutDashboard, Lightbulb, Map, Menu, Recycle, Store } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteConfig } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { cn } from "@/lib/utils"

function getNavItems(t: Dictionary) {
  return [
    { href: "/listings", label: t.nav.marketplace, icon: Store },
    { href: "/map", label: t.nav.wasteMap, icon: Map },
    { href: "/suggestions", label: t.nav.reuseIdeas, icon: Lightbulb },
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/about", label: t.nav.about, icon: Info },
  ]
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/map") return pathname === "/map" || pathname.startsWith("/reports")
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Static markup shared by the live nav and its Suspense fallback. */
export function NavLinks({ pathname }: { pathname?: string | null }) {
  const { t } = useI18n()
  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
      {getNavItems(t).map((item) => {
        const active = isActive(pathname ?? null, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              item.href === "/about" && "hidden xl:inline-flex",
              active && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function MainNav() {
  const pathname = usePathname()
  return <NavLinks pathname={pathname} />
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.nav.openMenu}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Recycle className="size-5 text-primary" />
            {siteConfig.name}
          </SheetTitle>
          <SheetDescription>{t.meta.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
          {getNavItems(t).map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <Separator className="my-3" />
          <Button asChild onClick={() => setOpen(false)}>
            <Link href="/listings/new">{t.nav.postAListing}</Link>
          </Button>
          <Button asChild variant="outline" className="mt-2" onClick={() => setOpen(false)}>
            <Link href="/reports/new">{t.nav.reportWaste}</Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
