import { PackageSearch, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { ListingCard, ListingGrid } from "@/components/listings/listing-card"
import { ListingFilters } from "@/components/listings/listing-filters"
import { EmptyState, PageContainer, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { getCategories, getListings, type ListingSort, type ListingStatusFilter } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { oneOf, param, positiveInt } from "@/lib/search-params"
import { LISTING_STATUSES, LISTING_TYPES } from "@/lib/types"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.listings.title, description: t.listings.description }
}

const SORTS = ["newest", "oldest", "price_asc", "price_desc", "quantity_desc"] as const
const STATUS_FILTERS = ["open", "all", ...LISTING_STATUSES] as const

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const [sp, { t }] = await Promise.all([searchParams, getI18n()])
  const q = param(sp, "q") ?? ""
  const type = oneOf(param(sp, "type"), LISTING_TYPES)
  const categoryId = positiveInt(param(sp, "category"))
  const city = param(sp, "city")
  const status: ListingStatusFilter = oneOf(param(sp, "status"), STATUS_FILTERS) ?? "open"
  const sort: ListingSort = oneOf(param(sp, "sort"), SORTS) ?? "newest"

  const [listings, categories] = await Promise.all([
    getListings({ q, type, categoryId, city, status, sort }),
    getCategories(),
  ])

  return (
    <PageContainer>
      <PageHeader
        title={t.listings.title}
        description={t.listings.description}
        actions={
          <Button asChild>
            <Link href="/listings/new">
              <Plus /> {t.nav.postAListing}
            </Link>
          </Button>
        }
      />
      <ListingFilters
        values={{
          q,
          type: type ?? "all",
          category: categoryId ? String(categoryId) : "all",
          city: city ?? "all",
          status,
          sort,
        }}
        categories={categories}
        resultCount={listings.length}
      />
      <div className="mt-6">
        {listings.length ? (
          <ListingGrid>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </ListingGrid>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title={t.listings.emptyTitle}
            description={t.listings.emptyBody}
            action={
              <Button asChild variant="outline">
                <Link href="/listings/new">{t.nav.postAListing}</Link>
              </Button>
            }
          />
        )}
      </div>
    </PageContainer>
  )
}
