import { Gauge } from "lucide-react"
import Link from "next/link"

import { CategoryIcon, MaterialVisual } from "@/components/category-visual"
import { MethodBadge } from "@/components/status-badges"
import { getI18n } from "@/lib/i18n/server"
import type { SuggestionWithCategory } from "@/lib/types"

export async function SuggestionCard({ suggestion }: { suggestion: SuggestionWithCategory }) {
  const { f } = await getI18n()
  return (
    <Link
      href={`/suggestions/${suggestion.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20"
    >
      <MaterialVisual
        categoryName={suggestion.category.name}
        imageUrl={suggestion.image_url}
        alt={suggestion.title}
        className="aspect-16/7 w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={suggestion.method} />
          {suggestion.difficulty && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Gauge className="size-3.5" /> {f.difficulty(suggestion.difficulty)}
            </span>
          )}
        </div>
        <h3 className="leading-snug font-medium group-hover:text-primary">{suggestion.title}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{suggestion.description}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
          <CategoryIcon name={suggestion.category.name} className="size-3.5" />
          {f.category(suggestion.category.name)}
        </span>
      </div>
    </Link>
  )
}
