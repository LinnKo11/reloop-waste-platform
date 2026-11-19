import { Recycle } from "lucide-react"
import Link from "next/link"

import { siteConfig } from "@/lib/constants"
import { getI18n } from "@/lib/i18n/server"

export async function SiteFooter() {
  const { t } = await getI18n()

  const columns = [
    {
      title: t.footer.exchange,
      links: [
        { href: "/listings", label: t.footer.browseMarketplace },
        { href: "/listings?type=FREE", label: t.footer.freeMaterials },
        { href: "/listings?type=WANTED", label: t.footer.wanted },
        { href: "/listings/new", label: t.nav.postAListing },
      ],
    },
    {
      title: t.footer.environment,
      links: [
        { href: "/map", label: t.nav.wasteMap },
        { href: "/reports/new", label: t.footer.reportDumping },
        { href: "/suggestions", label: t.footer.reuseIdeas },
      ],
    },
    {
      title: t.footer.account,
      links: [
        { href: "/about", label: t.nav.about },
        { href: "/dashboard", label: t.nav.dashboard },
        { href: "/login", label: t.nav.login },
        { href: "/admin", label: t.nav.adminConsole },
      ],
    },
  ]

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Recycle className="size-4" />
            </span>
            {siteConfig.name}
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{t.meta.description}</p>
          <p className="text-xs text-muted-foreground">{t.footer.demoNote}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
