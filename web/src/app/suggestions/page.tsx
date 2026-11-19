import { Lightbulb } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CategoryIcon } from "@/components/category-visual"
import { EmptyState, PageContainer, PageHeader } from "@/components/page-header"
import { SuggestionCard } from "@/components/suggestions/suggestion-card"
import { getCategories, getSuggestions } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { oneOf, param, positiveInt } from "@/lib/search-params"
import { SUGGESTION_METHODS, type SuggestionMethod } from "@/lib/types"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.suggestions.title, description: t.suggestions.description }
}

function chipClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
    active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
  )
}

export default async function SuggestionsPage({ searchParams }: PageProps<"/suggestions">) {
  const [sp, { t, f }] = await Promise.all([searchParams, getI18n()])
  const categoryId = positiveInt(param(sp, "category"))
  const method = oneOf(param(sp, "method"), SUGGESTION_METHODS)

  const [suggestions, categories] = await Promise.all([getSuggestions({ categoryId, method }), getCategories()])

  const href = (patch: { category?: number | null; method?: SuggestionMethod | null }) => {
    const params = new URLSearchParams()
    const c = patch.category === undefined ? categoryId : patch.category
    const m = patch.method === undefined ? method : patch.method
    if (c) params.set("category", String(c))
    if (m) params.set("method", m)
    const qs = params.toString()
    return qs ? `/suggestions?${qs}` : "/suggestions"
  }

  return (
    <PageContainer>
      <PageHeader title={t.suggestions.title} description={t.suggestions.description} />

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href={href({ method: null })} className={chipClass(!method)}>
            {t.suggestions.allMethods}
          </Link>
          {SUGGESTION_METHODS.map((m) => (
            <Link key={m} href={href({ method: m })} className={chipClass(method === m)}>
              {t.enums.method[m]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={href({ category: null })} className={chipClass(!categoryId)}>
            {t.suggestions.allMaterials}
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={href({ category: c.id })} className={chipClass(categoryId === c.id)}>
              <CategoryIcon name={c.name} className={cn("size-4", categoryId === c.id && "text-current")} />
              {f.category(c.name)}
            </Link>
          ))}
        </div>
      </div>

      {suggestions.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Lightbulb} title={t.suggestions.emptyTitle} description={t.suggestions.emptyBody} />
      )}
    </PageContainer>
  )
}
