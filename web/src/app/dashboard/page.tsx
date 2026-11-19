import { CircleCheck, Inbox, MapPinned, PackageOpen, Plus, Send } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { ListingCard, ListingGrid } from "@/components/listings/listing-card"
import { EmptyState, PageContainer, PageHeader } from "@/components/page-header"
import { RequestCard } from "@/components/requests/request-card"
import { ReportStatusBadge } from "@/components/status-badges"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { getIncomingRequests, getListings, getOutgoingRequests, getWasteReports } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { oneOf, param } from "@/lib/search-params"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.dashboard.title }
}

const TABS = ["listings", "incoming", "outgoing", "reports"] as const

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const [sp, user, { t, f }] = await Promise.all([searchParams, getCurrentUser(), getI18n()])
  const tab = oneOf(param(sp, "tab"), TABS) ?? "listings"
  const td = t.dashboard

  const [listings, incoming, outgoing, reports] = await Promise.all([
    getListings({ userId: user.id, status: "all" }),
    getIncomingRequests(user.id),
    getOutgoingRequests(user.id),
    getWasteReports({ reportedBy: user.id }),
  ])

  const pendingIncoming = incoming.filter((r) => r.status === "PENDING").length
  const stats = [
    {
      label: td.activeListings,
      value: listings.filter((l) => l.status === "ACTIVE").length,
      sub: f.t(t.common.total, { count: f.number(listings.length) }),
      icon: PackageOpen,
    },
    { label: td.toReview, value: pendingIncoming, sub: f.t(td.received, { count: f.number(incoming.length) }), icon: Inbox },
    {
      label: td.acceptedExchanges,
      value: [...incoming, ...outgoing].filter((r) => r.status === "ACCEPTED").length,
      sub: td.contactsShared,
      icon: Send,
    },
    {
      label: td.wasteReports,
      value: reports.length,
      sub: f.t(td.resolved, { count: f.number(reports.filter((r) => r.status === "RESOLVED").length) }),
      icon: MapPinned,
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={f.t(td.hi, { name: user.full_name.split(" ")[0] })}
        description={td.description}
        actions={
          <Button asChild>
            <Link href="/listings/new">
              <Plus /> {td.newListing}
            </Link>
          </Button>
        }
      />

      {sp.welcome === "1" && (
        <Alert className="mb-6 border-emerald-600/30 bg-emerald-500/5">
          <CircleCheck className="text-emerald-600" />
          <AlertTitle>{f.t(t.auth.welcome, { name: user.full_name })}</AlertTitle>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} size="sm">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <s.icon className="size-4 shrink-0" /> {s.label}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">{f.number(s.value)}</CardTitle>
              <CardDescription className="text-xs">{s.sub}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={tab} className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="listings">{td.tabListings}</TabsTrigger>
          <TabsTrigger value="incoming">
            {td.tabIncoming}
            {pendingIncoming > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {f.number(pendingIncoming)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">{td.tabSent}</TabsTrigger>
          <TabsTrigger value="reports">{td.tabReports}</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-4">
          {listings.length ? (
            <ListingGrid>
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </ListingGrid>
          ) : (
            <EmptyState
              icon={PackageOpen}
              title={td.emptyListingsTitle}
              description={td.emptyListingsBody}
              action={
                <Button asChild>
                  <Link href="/listings/new">{t.nav.postAListing}</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-4">
          {incoming.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {incoming.map((r) => (
                <RequestCard key={r.id} request={r} perspective="owner" />
              ))}
            </div>
          ) : (
            <EmptyState icon={Inbox} title={td.emptyIncomingTitle} description={td.emptyIncomingBody} />
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4">
          {outgoing.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {outgoing.map((r) => (
                <RequestCard key={r.id} request={r} perspective="requester" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title={td.emptySentTitle}
              action={
                <Button asChild variant="outline">
                  <Link href="/listings">{t.footer.browseMarketplace}</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          {reports.length ? (
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
                      {f.category(r.category.name)} · {f.location(r.city, r.township)} · {f.relative(r.reported_at)}
                    </span>
                  </div>
                  <ReportStatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MapPinned}
              title={td.emptyReportsTitle}
              action={
                <Button asChild variant="outline">
                  <Link href="/reports/new">{td.reportDumped}</Link>
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
