"use client"

import { Loader2, RotateCcw, Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CITIES } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import { LISTING_STATUSES, LISTING_TYPES, type MaterialCategory } from "@/lib/types"

export interface ListingFilterValues {
  q: string
  type: string
  category: string
  city: string
  status: string
  sort: string
}

const ALL = "all"

export function ListingFilters({
  values,
  categories,
  resultCount,
}: {
  values: ListingFilterValues
  categories: MaterialCategory[]
  resultCount: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, f } = useI18n()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useState(values.q)

  function apply(patch: Partial<ListingFilterValues>) {
    const next = { ...values, q, ...patch }
    const params = new URLSearchParams()
    if (next.q.trim()) params.set("q", next.q.trim())
    if (next.type !== ALL) params.set("type", next.type)
    if (next.category !== ALL) params.set("category", next.category)
    if (next.city !== ALL) params.set("city", next.city)
    if (next.status !== "open") params.set("status", next.status)
    if (next.sort !== "newest") params.set("sort", next.sort)
    const qs = params.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  const hasFilters =
    values.q || values.type !== ALL || values.category !== ALL || values.city !== ALL || values.status !== "open"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={values.type} onValueChange={(type) => apply({ type })}>
          <TabsList>
            <TabsTrigger value={ALL}>{t.listings.all}</TabsTrigger>
            {LISTING_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {t.enums.listingType[type].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <form
          className="relative w-full lg:max-w-sm"
          onSubmit={(e) => {
            e.preventDefault()
            apply({ q })
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.listings.searchPlaceholder}
            className="pl-8"
            aria-label={t.listings.searchLabel}
          />
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={values.category} onValueChange={(category) => apply({ category })}>
          <SelectTrigger className="w-44" aria-label={t.listings.category}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.listings.allCategories}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {f.category(c.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={values.city} onValueChange={(city) => apply({ city })}>
          <SelectTrigger className="w-36" aria-label={t.listings.city}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.listings.allCities}</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {f.city(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={values.status} onValueChange={(status) => apply({ status })}>
          <SelectTrigger className="w-48" aria-label={t.listings.status}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">{t.listings.statusOpen}</SelectItem>
            <SelectItem value={ALL}>{t.listings.anyStatus}</SelectItem>
            {LISTING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t.enums.listingStatus[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={values.sort} onValueChange={(sort) => apply({ sort })}>
          <SelectTrigger className="w-44" aria-label={t.listings.sort}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t.listings.sortNewest}</SelectItem>
            <SelectItem value="oldest">{t.listings.sortOldest}</SelectItem>
            <SelectItem value="price_asc">{t.listings.sortPriceAsc}</SelectItem>
            <SelectItem value="price_desc">{t.listings.sortPriceDesc}</SelectItem>
            <SelectItem value="quantity_desc">{t.listings.sortQuantity}</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("")
              apply({ q: "", type: ALL, category: ALL, city: ALL, status: "open" })
            }}
          >
            <RotateCcw /> {t.common.reset}
          </Button>
        ) : null}
        <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {f.t(resultCount === 1 ? t.listings.resultOne : t.listings.resultMany, { count: f.number(resultCount) })}
        </span>
      </div>
    </div>
  )
}
