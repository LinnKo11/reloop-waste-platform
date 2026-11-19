import type { Metadata } from "next"

import { WasteMapExplorer, type ReportSummary } from "@/components/reports/waste-map-explorer"
import { getCategories, getWasteReports } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.map.title, description: t.map.subtitle }
}

export default async function MapPage() {
  const [reports, categories, { f }] = await Promise.all([
    getWasteReports(),
    getCategories({ includeInactive: true }),
    getI18n(),
  ])

  const summaries: ReportSummary[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    categoryId: r.category_id,
    categoryName: r.category.name,
    location: f.location(r.city, r.township),
    position: [r.latitude, r.longitude],
    reportedLabel: f.relative(r.reported_at),
    quantityLabel:
      r.estimated_quantity != null && r.quantity_unit ? f.quantity(r.estimated_quantity, r.quantity_unit) : null,
  }))

  return <WasteMapExplorer reports={summaries} categories={categories} />
}
