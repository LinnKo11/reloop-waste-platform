import { CalendarDays, CircleCheck, Layers, MapPin, Scale, ShieldCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CategoryIcon } from "@/components/category-visual"
import { Map } from "@/components/map/map"
import { PageContainer, PageHeader } from "@/components/page-header"
import { ReportStatusControl } from "@/components/reports/report-status-control"
import { ReportStatusTimeline } from "@/components/reports/report-status-timeline"
import { AccountTypeBadge, MethodBadge, ReportStatusBadge } from "@/components/status-badges"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { reportStatusColor } from "@/lib/constants"
import { getSuggestions, getWasteReportById } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { positiveInt } from "@/lib/search-params"

export async function generateMetadata({ params }: PageProps<"/reports/[id]">): Promise<Metadata> {
  const [{ id }, { t }] = await Promise.all([params, getI18n()])
  const reportId = positiveInt(id)
  const report = reportId ? await getWasteReportById(reportId) : null
  return { title: report?.title ?? t.report.notFound }
}

export default async function ReportDetailPage({ params, searchParams }: PageProps<"/reports/[id]">) {
  const [{ id: rawId }, sp, user, { t, f }] = await Promise.all([params, searchParams, getCurrentUser(), getI18n()])
  const id = positiveInt(rawId)
  const report = id ? await getWasteReportById(id) : null
  if (!report) notFound()

  const suggestions = await getSuggestions({ categoryId: report.category_id, limit: 3 })
  const admin = isAdmin(user)
  const categoryName = f.category(report.category.name)
  const tr = t.report

  const details = [
    { icon: Layers, label: tr.wasteType, value: categoryName },
    {
      icon: Scale,
      label: tr.estimatedAmount,
      value:
        report.estimated_quantity != null && report.quantity_unit
          ? f.quantity(report.estimated_quantity, report.quantity_unit)
          : tr.notEstimated,
    },
    { icon: MapPin, label: tr.location, value: f.location(report.city, report.township) },
    { icon: CalendarDays, label: tr.reported, value: f.dateTime(report.reported_at) },
  ]

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[{ label: t.nav.wasteMap, href: "/map" }, { label: report.title }]}
        title={report.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <ReportStatusBadge status={report.status} />
            <span className="text-sm">
              {f.t(tr.reportNo, { id: f.number(report.id), when: f.relative(report.updated_at) })}
            </span>
          </span>
        }
      />

      {sp.created === "1" && (
        <Alert className="mb-6 border-emerald-600/30 bg-emerald-500/5">
          <CircleCheck className="text-emerald-600" />
          <AlertTitle>{tr.thanksTitle}</AlertTitle>
          <AlertDescription>{tr.thanksBody}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="h-80">
              <Map
                center={[report.latitude, report.longitude]}
                zoom={16}
                scrollWheelZoom={false}
                markers={[
                  { id: report.id, position: [report.latitude, report.longitude], color: reportStatusColor[report.status] },
                ]}
              />
            </div>
            {report.address_description && (
              <p className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {report.address_description}
              </p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tr.whatReported}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <p className="leading-relaxed text-pretty whitespace-pre-line text-muted-foreground">
                {report.description || t.common.noDescription}
              </p>
              <dl className="grid gap-4 sm:grid-cols-2">
                {details.map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <d.icon className="size-4 text-muted-foreground" />
                    </span>
                    <div className="flex flex-col">
                      <dt className="text-xs text-muted-foreground">{d.label}</dt>
                      <dd className="text-sm font-medium">{d.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {suggestions.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{f.t(tr.whatCanBeDone, { category: categoryName })}</h2>
                <Button asChild variant="link" size="sm">
                  <Link href={`/listings?category=${report.category_id}&type=WANTED`}>{tr.findBuyers}</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {suggestions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/suggestions/${s.id}`}
                    className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-foreground/25"
                  >
                    <MethodBadge method={s.method} />
                    <span className="text-sm leading-snug font-medium">{s.title}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{s.description}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>{tr.progress}</CardTitle>
              <CardDescription>{t.enums.reportStatus[report.status].description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <ReportStatusTimeline status={report.status} />
              {admin && (
                <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <ShieldCheck className="size-3.5" /> {tr.adminUpdate}
                  </span>
                  <ReportStatusControl reportId={report.id} status={report.status} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>{tr.reportedBy}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/users/${report.reporter.id}`} className="flex items-center gap-3 hover:opacity-90">
                <UserAvatar user={report.reporter} className="size-10" />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-medium">{report.reporter.full_name}</span>
                  <AccountTypeBadge type={report.reporter.account_type} />
                </div>
              </Link>
            </CardContent>
          </Card>

          <Link
            href="/reports/new"
            className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm hover:bg-muted/50"
          >
            <CategoryIcon name={report.category.name} className="size-5 shrink-0" />
            {tr.seenAnother}
          </Link>
        </aside>
      </div>
    </PageContainer>
  )
}
