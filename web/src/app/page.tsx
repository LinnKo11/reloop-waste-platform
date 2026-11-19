import { ArrowRight, Handshake, Lock, MapPinned, Megaphone, PackagePlus, Send } from "lucide-react"
import Link from "next/link"

import { CategoryIcon, getCategoryStyle } from "@/components/category-visual"
import { ListingCard } from "@/components/listings/listing-card"
import { PageContainer } from "@/components/page-header"
import { ReportStatusBadge } from "@/components/status-badges"
import { SuggestionCard } from "@/components/suggestions/suggestion-card"
import { Button } from "@/components/ui/button"
import {
  getCategoriesWithCounts,
  getListings,
  getPlatformStats,
  getSuggestions,
  getWasteReports,
} from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { cn } from "@/lib/utils"

export default async function HomePage() {
  const [{ t, f }, stats, latest, categories, reports, suggestions] = await Promise.all([
    getI18n(),
    getPlatformStats(),
    getListings({ status: "ACTIVE", limit: 8 }),
    getCategoriesWithCounts(),
    getWasteReports(),
    getSuggestions({ limit: 3 }),
  ])
  const recentReports = reports.slice(0, 5)
  const h = t.home

  const kpis = [
    { label: h.kpiActiveListings, value: f.number(stats.activeListings) },
    { label: h.kpiKgOnOffer, value: f.number(Math.round(stats.kgAvailable)) },
    { label: h.kpiSitesReported, value: f.number(stats.totalReports) },
    { label: h.kpiSitesResolved, value: `${f.number(Math.round(stats.resolvedRate * 100))}%` },
  ]

  const steps = [
    { icon: PackagePlus, title: h.step1Title, body: h.step1Body },
    { icon: Send, title: h.step2Title, body: h.step2Body },
    { icon: Handshake, title: h.step3Title, body: h.step3Body },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-linear-to-b from-accent/70 to-background">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[20px_20px] mask-[linear-gradient(to_bottom,black,transparent)] opacity-[0.35]"
          aria-hidden
        />
        <PageContainer className="relative grid gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" /> {t.meta.tagline}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {h.heroTitleA} <span className="text-primary">{h.heroTitleHighlight}</span> {h.heroTitleB}
            </h1>
            <p className="max-w-xl text-lg text-pretty text-muted-foreground">{h.heroBody}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/listings">
                  {h.browseMarketplace} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/reports/new">
                  <Megaphone /> {t.nav.reportWaste}
                </Link>
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl bg-background/80 p-5 ring-1 ring-foreground/10 backdrop-blur">
                <dd className="text-3xl font-semibold tracking-tight tabular-nums">{k.value}</dd>
                <dt className="mt-1 text-sm text-muted-foreground">{k.label}</dt>
              </div>
            ))}
          </dl>
        </PageContainer>
      </section>

      {/* Categories */}
      <PageContainer className="py-14">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">{h.byMaterialTitle}</h2>
          <p className="text-muted-foreground">{h.byMaterialSub}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/listings?category=${c.id}`}
              className={cn(
                "group flex flex-col gap-3 rounded-xl bg-linear-to-br p-4 ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:shadow-md",
                getCategoryStyle(c.name).surface,
              )}
            >
              <CategoryIcon name={c.name} className="size-6" />
              <div>
                <p className="font-medium">{f.category(c.name)}</p>
                <p className="text-xs text-muted-foreground">
                  {f.t(h.activeListingsCount, { count: f.number(c.listing_count) })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>

      {/* Latest listings */}
      <section className="border-y bg-muted/30">
        <PageContainer className="py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{h.freshTitle}</h2>
              <p className="text-muted-foreground">{h.freshSub}</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/listings">
                {t.common.viewAll} <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* How it works */}
      <PageContainer className="py-14">
        <div className="mb-8 flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">{h.howTitle}</h2>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4 shrink-0" /> {h.howPrivacy}
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <span className="absolute top-5 right-5 text-4xl font-semibold text-muted-foreground/20 tabular-nums">
                {f.number(i + 1)}
              </span>
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <s.icon className="size-5" />
              </span>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </PageContainer>

      {/* Waste map teaser + ideas */}
      <PageContainer className="grid gap-8 pb-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{h.latestReports}</h2>
              <p className="text-sm text-muted-foreground">
                {f.t(h.sitesNeedAttention, { count: f.number(stats.openReports) })}
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <MapPinned className="size-5" />
            </span>
          </div>
          <ul className="flex flex-col divide-y">
            {recentReports.map((r) => (
              <li key={r.id}>
                <Link href={`/reports/${r.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{r.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {f.location(r.city, r.township)} · {f.relative(r.reported_at)}
                    </span>
                  </div>
                  <ReportStatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-auto">
            <Link href="/map">
              {h.openMap} <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{h.ideasTitle}</h2>
              <p className="text-sm text-muted-foreground">{h.ideasSub}</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/suggestions">
                {h.allIdeas} <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}
