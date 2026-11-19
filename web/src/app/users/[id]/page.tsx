import { CalendarDays, Lock, MapPin, PackageOpen } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ListingCard, ListingGrid } from "@/components/listings/listing-card"
import { EmptyState, PageContainer } from "@/components/page-header"
import { AccountTypeBadge, ReportStatusBadge } from "@/components/status-badges"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser } from "@/lib/auth"
import { getListings, getPublicUser, getUserStats, getWasteReports } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { positiveInt } from "@/lib/search-params"

export async function generateMetadata({ params }: PageProps<"/users/[id]">): Promise<Metadata> {
  const [{ id }, { t }] = await Promise.all([params, getI18n()])
  const userId = positiveInt(id)
  const user = userId ? await getPublicUser(userId) : null
  return { title: user?.full_name ?? t.profile.notFound }
}

export default async function UserProfilePage({ params }: PageProps<"/users/[id]">) {
  const [{ id: rawId }, viewer, { t, f }] = await Promise.all([params, getCurrentUser(), getI18n()])
  const id = positiveInt(rawId)
  const profile = id ? await getPublicUser(id) : null
  if (!profile) notFound()

  const isSelf = viewer.id === profile.id
  const [listings, reports, stats] = await Promise.all([
    getListings({ userId: profile.id, status: isSelf ? "all" : "open" }),
    getWasteReports({ reportedBy: profile.id }),
    getUserStats(profile.id),
  ])
  const tp = t.profile

  const statItems = [
    { label: tp.activeListings, value: stats.activeListings },
    { label: tp.completedExchanges, value: stats.completedExchanges },
    { label: tp.wasteReports, value: stats.reports },
  ]

  return (
    <PageContainer className="py-8">
      <Card>
        <CardContent className="flex flex-col gap-6 md:flex-row md:items-center">
          <UserAvatar user={profile} className="size-20 text-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{profile.full_name}</h1>
              <AccountTypeBadge type={profile.account_type} />
              {!profile.is_active && <span className="text-sm text-destructive">{tp.deactivated}</span>}
            </div>
            {profile.bio && <p className="max-w-2xl text-pretty text-muted-foreground">{profile.bio}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" /> {f.location(profile.city, profile.township)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" /> {f.t(t.common.memberSince, { date: f.date(profile.created_at) })}
              </span>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 md:w-[26rem]">
            {statItems.map((s) => (
              <div key={s.label} className="flex flex-col-reverse rounded-lg bg-muted/50 p-3 text-center">
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="text-2xl font-semibold">{f.number(s.value)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0" />
        {tp.privacy}
      </p>

      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{isSelf ? tp.yourListings : tp.listings}</h2>
        {listings.length ? (
          <ListingGrid>
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </ListingGrid>
        ) : (
          <EmptyState icon={PackageOpen} title={tp.noOpenListings} />
        )}
      </section>

      {reports.length > 0 && (
        <section className="mt-10 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{tp.wasteReports}</h2>
          <div className="divide-y rounded-xl ring-1 ring-foreground/10">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {f.location(r.city, r.township)} · {f.relative(r.reported_at)}
                  </span>
                </div>
                <ReportStatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
