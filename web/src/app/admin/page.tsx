import { ShieldAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CategoryActiveSwitch, SuggestionPublishedSwitch, UserActiveSwitch } from "@/components/admin/admin-toggles"
import { CategoryIcon } from "@/components/category-visual"
import { ListingStatusControl } from "@/components/listings/listing-status-control"
import { EmptyState, PageContainer, PageHeader } from "@/components/page-header"
import { ReportStatusControl } from "@/components/reports/report-status-control"
import { AccountTypeBadge, ListingTypeBadge, MethodBadge } from "@/components/status-badges"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { reportStatusColor } from "@/lib/constants"
import {
  getAdminUsers,
  getCategories,
  getCategoriesWithCounts,
  getListings,
  getPlatformStats,
  getSuggestions,
  getWasteReports,
} from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.admin.title }
}

export default async function AdminPage() {
  const [user, { t, f }] = await Promise.all([getCurrentUser(), getI18n()])
  const ta = t.admin

  if (!isAdmin(user)) {
    return (
      <PageContainer className="py-16">
        <EmptyState icon={ShieldAlert} title={ta.onlyTitle} description={ta.onlyBody} />
      </PageContainer>
    )
  }

  const [stats, reports, users, categories, allCategories, suggestions, listings] = await Promise.all([
    getPlatformStats(),
    getWasteReports(),
    getAdminUsers(),
    getCategoriesWithCounts(),
    getCategories({ includeInactive: true }),
    getSuggestions({ includeUnpublished: true }),
    getListings({ status: "all" }),
  ])
  const countsByCategory = new Map(categories.map((c) => [c.id, c]))

  const kpis = [
    { label: ta.kpiActiveListings, value: f.number(stats.activeListings) },
    { label: ta.kpiMaterialOnOffer, value: f.quantity(Math.round(stats.kgAvailable), "KG") },
    { label: ta.kpiOpenReports, value: f.number(stats.openReports) },
    { label: ta.kpiMembers, value: f.number(stats.members) },
  ]

  return (
    <PageContainer>
      <PageHeader title={ta.title} description={ta.description} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} size="sm">
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{k.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mt-4" size="sm">
        <CardHeader>
          <CardTitle>{ta.byStage}</CardTitle>
          <CardDescription>
            {f.t(ta.resolvedOf, {
              resolved: f.number(stats.resolvedReports),
              total: f.number(stats.totalReports),
              pct: f.number(Math.round(stats.resolvedRate * 100)),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          {stats.reportsByStatus.map((s) => (
            <div key={s.status} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: reportStatusColor[s.status] }} />
                  {t.enums.reportStatus[s.status].label}
                </span>
                <span className="font-medium tabular-nums">{f.number(s.count)}</span>
              </div>
              <Progress value={stats.totalReports ? (s.count / stats.totalReports) * 100 : 0} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="reports">{ta.tabReports}</TabsTrigger>
          <TabsTrigger value="listings">{ta.tabListings}</TabsTrigger>
          <TabsTrigger value="users">{ta.tabMembers}</TabsTrigger>
          <TabsTrigger value="categories">{ta.tabCategories}</TabsTrigger>
          <TabsTrigger value="suggestions">{ta.tabIdeas}</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{ta.colReport}</TableHead>
                  <TableHead className="hidden md:table-cell">{ta.colLocation}</TableHead>
                  <TableHead className="hidden lg:table-cell">{ta.colReported}</TableHead>
                  <TableHead>{ta.colStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{f.number(r.id)}</TableCell>
                    <TableCell className="max-w-72">
                      <Link href={`/reports/${r.id}`} className="block truncate font-medium hover:underline">
                        {r.title}
                      </Link>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CategoryIcon name={r.category.name} className="size-3" /> {f.category(r.category.name)} ·{" "}
                        {f.t(ta.by, { name: r.reporter.full_name })}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {f.location(r.city, r.township)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{f.relative(r.reported_at)}</TableCell>
                    <TableCell>
                      <ReportStatusControl reportId={r.id} status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ta.colListing}</TableHead>
                  <TableHead className="hidden md:table-cell">{ta.colOwner}</TableHead>
                  <TableHead className="hidden lg:table-cell">{ta.colLocation}</TableHead>
                  <TableHead>{ta.colStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="max-w-80">
                      <Link href={`/listings/${l.id}`} className="block truncate font-medium hover:underline">
                        {l.title}
                      </Link>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ListingTypeBadge type={l.listing_type} /> {f.category(l.category.name)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{l.owner.full_name}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {f.location(l.city, l.township)}
                    </TableCell>
                    <TableCell>
                      <ListingStatusControl listingId={l.id} status={l.status} size="sm" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ta.colMember}</TableHead>
                  <TableHead className="hidden md:table-cell">{ta.colType}</TableHead>
                  <TableHead className="hidden lg:table-cell">{ta.colLocation}</TableHead>
                  <TableHead className="hidden sm:table-cell">{ta.colActivity}</TableHead>
                  <TableHead className="hidden lg:table-cell">{ta.colJoined}</TableHead>
                  <TableHead className="text-right">{ta.colActive}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className={u.is_active ? undefined : "opacity-60"}>
                    <TableCell>
                      <Link href={`/users/${u.id}`} className="font-medium hover:underline">
                        {u.full_name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {u.email}
                        {u.system_role === "ADMIN" && ` · ${t.nav.admin}`}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <AccountTypeBadge type={u.account_type} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {f.location(u.city, u.township)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {f.t(ta.activity, { listings: f.number(u.listing_count), reports: f.number(u.report_count) })}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{f.date(u.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <UserActiveSwitch userId={u.id} active={u.is_active} isSelf={u.id === user.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <p className="mt-2 text-xs text-muted-foreground">{ta.keepHistory}</p>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ta.colCategory}</TableHead>
                  <TableHead className="hidden md:table-cell">{ta.colDescription}</TableHead>
                  <TableHead className="text-right">{ta.colListings}</TableHead>
                  <TableHead className="text-right">{ta.colReports}</TableHead>
                  <TableHead className="text-right">{ta.colEnabled}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCategories.map((c) => {
                  const counts = countsByCategory.get(c.id)
                  return (
                    <TableRow key={c.id} className={c.is_active ? undefined : "opacity-60"}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-medium">
                          <CategoryIcon name={c.name} className="size-4" /> {f.category(c.name)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-md truncate text-muted-foreground md:table-cell">
                        {c.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{f.number(counts?.listing_count ?? 0)}</TableCell>
                      <TableCell className="text-right tabular-nums">{f.number(counts?.report_count ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <CategoryActiveSwitch categoryId={c.id} active={c.is_active} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ta.colIdea}</TableHead>
                  <TableHead className="hidden md:table-cell">{ta.colMaterial}</TableHead>
                  <TableHead className="hidden sm:table-cell">{ta.colMethod}</TableHead>
                  <TableHead className="text-right">{ta.colPublished}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/suggestions/${s.id}`} className="font-medium hover:underline">
                        {s.title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{f.difficulty(s.difficulty) ?? "—"}</span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{f.category(s.category.name)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <MethodBadge method={s.method} />
                    </TableCell>
                    <TableCell className="text-right">
                      <SuggestionPublishedSwitch suggestionId={s.id} published={s.is_published} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
