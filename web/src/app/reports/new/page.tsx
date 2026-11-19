import type { Metadata } from "next"

import { PageContainer, PageHeader } from "@/components/page-header"
import { ReportForm } from "@/components/reports/report-form"
import { getCurrentUser } from "@/lib/auth"
import { LOCATIONS } from "@/lib/constants"
import { getCategories } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.reportForm.pageTitle }
}

export default async function NewReportPage() {
  const [user, categories, { t }] = await Promise.all([
    getCurrentUser(),
    getCategories({ includeInactive: true }),
    getI18n(),
  ])
  const defaultCity = user.city && LOCATIONS[user.city] ? user.city : "Yangon"
  const defaultTownship =
    user.township && LOCATIONS[defaultCity]?.townships.includes(user.township) ? user.township : ""

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title={t.reportForm.pageTitle}
        description={t.reportForm.pageDescription}
        breadcrumbs={[{ label: t.nav.wasteMap, href: "/map" }, { label: t.reportForm.breadcrumb }]}
      />
      <ReportForm categories={categories} defaultCity={defaultCity} defaultTownship={defaultTownship} />
    </PageContainer>
  )
}
