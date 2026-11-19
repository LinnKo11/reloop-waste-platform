import { Gauge, ShieldAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CategoryIcon, MaterialVisual } from "@/components/category-visual"
import { ListingCard } from "@/components/listings/listing-card"
import { PageContainer, PageHeader } from "@/components/page-header"
import { MethodBadge } from "@/components/status-badges"
import { SuggestionCard } from "@/components/suggestions/suggestion-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { getListings, getSuggestionById, getSuggestions } from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { positiveInt } from "@/lib/search-params"

export async function generateMetadata({ params }: PageProps<"/suggestions/[id]">): Promise<Metadata> {
  const [{ id }, { t }] = await Promise.all([params, getI18n()])
  const suggestionId = positiveInt(id)
  const s = suggestionId ? await getSuggestionById(suggestionId, { includeUnpublished: true }) : null
  return { title: s?.title ?? t.suggestions.notFound }
}

export default async function SuggestionDetailPage({ params }: PageProps<"/suggestions/[id]">) {
  const [{ id: rawId }, user, { t, f }] = await Promise.all([params, getCurrentUser(), getI18n()])
  const id = positiveInt(rawId)
  // Admins can preview unpublished ideas.
  const suggestion = id ? await getSuggestionById(id, { includeUnpublished: isAdmin(user) }) : null
  if (!suggestion) notFound()

  const steps = suggestion.instructions?.split("\n").map((s) => s.trim()).filter(Boolean) ?? []
  const [listings, related] = await Promise.all([
    getListings({ categoryId: suggestion.category_id, status: "ACTIVE", limit: 3 }),
    getSuggestions({ categoryId: suggestion.category_id }),
  ])
  const others = related.filter((s) => s.id !== suggestion.id).slice(0, 3)
  const categoryName = f.category(suggestion.category.name)
  const ts = t.suggestions

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: t.nav.reuseIdeas, href: "/suggestions" },
          { label: categoryName, href: `/suggestions?category=${suggestion.category_id}` },
          { label: suggestion.title },
        ]}
        title={suggestion.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <MethodBadge method={suggestion.method} />
            {suggestion.difficulty && (
              <span className="inline-flex items-center gap-1 text-sm">
                <Gauge className="size-4" /> {f.difficulty(suggestion.difficulty)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm">
              <CategoryIcon name={suggestion.category.name} className="size-4" /> {categoryName}
            </span>
            {!suggestion.is_published && <span className="text-sm font-medium text-amber-600">{ts.unpublished}</span>}
          </span>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <MaterialVisual
            categoryName={suggestion.category.name}
            imageUrl={suggestion.image_url}
            alt={suggestion.title}
            className="aspect-16/6 w-full rounded-xl"
            iconClassName="size-16"
          />
          <p className="text-lg leading-relaxed text-pretty">{suggestion.description}</p>

          {steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{ts.howTo}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {f.number(i + 1)}
                      </span>
                      <span className="pt-0.5 text-pretty">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {suggestion.safety_notes && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <ShieldAlert className="text-amber-600" />
              <AlertTitle>{ts.safety}</AlertTitle>
              <AlertDescription>{suggestion.safety_notes}</AlertDescription>
            </Alert>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{f.t(ts.haveSpare, { category: categoryName })}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/listings/new?type=FREE">{ts.giveAway}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/listings?category=${suggestion.category_id}&type=WANTED`}>{ts.seeWho}</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {listings.length > 0 && (
        <section className="mt-12 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{f.t(ts.onMarketplace, { category: categoryName })}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-12 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{ts.moreIdeas}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
