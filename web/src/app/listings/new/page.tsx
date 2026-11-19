import type { Metadata } from "next"

import { ListingForm } from "@/components/listings/listing-form"
import { PageContainer, PageHeader } from "@/components/page-header"
import { getCurrentUser } from "@/lib/auth"
import { LOCATIONS } from "@/lib/constants"
import { getCategories } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { oneOf, param } from "@/lib/search-params"
import { LISTING_TYPES } from "@/lib/types"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.listingForm.pageTitle }
}

export default async function NewListingPage({ searchParams }: PageProps<"/listings/new">) {
  const [sp, user, categories, { t, f }] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getCategories(),
    getI18n(),
  ])
  const defaultType = oneOf(param(sp, "type"), LISTING_TYPES) ?? "FOR_SALE"
  const defaultCity = user.city && LOCATIONS[user.city] ? user.city : "Yangon"
  const defaultTownship =
    user.township && LOCATIONS[defaultCity]?.townships.includes(user.township) ? user.township : ""

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title={t.listingForm.pageTitle}
        description={f.t(t.listingForm.pageDescription, { name: user.full_name })}
        breadcrumbs={[{ label: t.nav.marketplace, href: "/listings" }, { label: t.listingForm.breadcrumb }]}
      />
      <ListingForm
        categories={categories}
        defaultCity={defaultCity}
        defaultTownship={defaultTownship}
        defaultType={defaultType}
      />
    </PageContainer>
  )
}
