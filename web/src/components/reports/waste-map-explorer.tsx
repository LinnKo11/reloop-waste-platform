"use client"

import { MapPin, Megaphone, Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { CategoryIcon } from "@/components/category-visual"
import { Map, type MapMarker } from "@/components/map/map"
import { ReportStatusBadge } from "@/components/status-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { reportStatusColor } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import { WASTE_REPORT_STATUSES, type MaterialCategory, type WasteReportStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface ReportSummary {
  id: number
  title: string
  status: WasteReportStatus
  categoryId: number
  categoryName: string
  location: string
  position: [number, number]
  reportedLabel: string
  quantityLabel: string | null
}

export function WasteMapExplorer({
  reports,
  categories,
}: {
  reports: ReportSummary[]
  categories: MaterialCategory[]
}) {
  const [statuses, setStatuses] = useState<Set<WasteReportStatus>>(new Set(WASTE_REPORT_STATUSES))
  const [category, setCategory] = useState("all")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { t, f } = useI18n()

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return reports.filter(
      (r) =>
        statuses.has(r.status) &&
        (category === "all" || String(r.categoryId) === category) &&
        (!needle || `${r.title} ${r.location}`.toLowerCase().includes(needle)),
    )
  }, [reports, statuses, category, query])

  const markers = useMemo<MapMarker[]>(
    () =>
      filtered.map((r) => ({
        id: r.id,
        position: r.position,
        color: reportStatusColor[r.status],
        title: r.title,
        subtitle: `${t.enums.reportStatus[r.status].label} · ${r.location}`,
        href: `/reports/${r.id}`,
      })),
    [filtered, t],
  )

  const counts = useMemo(() => {
    const c = Object.fromEntries(WASTE_REPORT_STATUSES.map((s) => [s, 0])) as Record<WasteReportStatus, number>
    reports.forEach((r) => c[r.status]++)
    return c
  }, [reports])

  function toggleStatus(status: WasteReportStatus) {
    setStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status) && next.size > 1) next.delete(status)
      else next.add(status)
      return next
    })
  }

  return (
    <div className="grid border-b lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="order-2 flex min-h-0 flex-col border-r lg:order-1">
        <div className="flex flex-col gap-4 border-b p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{t.map.title}</h1>
              <p className="text-sm text-muted-foreground">{t.map.subtitle}</p>
            </div>
            <Button asChild size="sm">
              <Link href="/reports/new">
                <Megaphone /> {t.map.report}
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.map.filterStatus}>
            {WASTE_REPORT_STATUSES.map((s) => {
              const active = statuses.has(s)
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                    active ? "bg-background shadow-xs" : "opacity-50 hover:opacity-80",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: reportStatusColor[s] }} />
                  {t.enums.reportStatus[s].label}
                  <span className="text-muted-foreground">{f.number(counts[s])}</span>
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.map.searchPlaceholder}
                className="pl-8"
                aria-label={t.map.searchLabel}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40" aria-label={t.listings.category}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.map.allTypes}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {f.category(c.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <ul className="flex flex-col divide-y">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 px-4 py-3 text-left transition hover:bg-muted/60",
                    selectedId === r.id && "bg-accent hover:bg-accent",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm leading-snug font-medium">{r.title}</span>
                    <ReportStatusBadge status={r.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CategoryIcon name={r.categoryName} className="size-3.5" />
                      {f.category(r.categoryName)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {r.location}
                    </span>
                    <span>{r.reportedLabel}</span>
                  </div>
                </button>
                {selectedId === r.id && (
                  <div className="bg-accent px-4 pb-3">
                    <Link href={`/reports/${r.id}`} className="text-xs font-medium text-primary hover:underline">
                      {t.map.openReport}
                    </Link>
                  </div>
                )}
              </li>
            ))}
            {!filtered.length && (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                {t.map.noMatch}
              </li>
            )}
          </ul>
        </ScrollArea>
      </div>
      <div className="order-1 h-[55vh] lg:order-2 lg:h-full">
        <Map
          markers={markers}
          fitToMarkers
          selectedId={selectedId}
          onMarkerClick={(id) => setSelectedId(Number(id))}
        />
      </div>
    </div>
  )
}
