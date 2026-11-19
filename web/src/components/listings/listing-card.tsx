import { MapPin, Scale } from "lucide-react"
import Link from "next/link"

import { CategoryIcon, MaterialVisual } from "@/components/category-visual"
import { ListingStatusBadge, ListingTypeBadge } from "@/components/status-badges"
import { UserAvatar } from "@/components/user-avatar"
import { getI18n } from "@/lib/i18n/server"
import type { ListingWithRelations } from "@/lib/types"
import { cn } from "@/lib/utils"

export async function ListingCard({ listing, className }: { listing: ListingWithRelations; className?: string }) {
  const { t, f } = await getI18n()
  const qty = f.quantity(listing.quantity, listing.quantity_unit)

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <div className="relative">
        <MaterialVisual
          categoryName={listing.category.name}
          imageUrl={listing.images[0]?.image_url}
          alt={listing.title}
          className="aspect-16/10 w-full"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <ListingTypeBadge type={listing.listing_type} className="bg-background/90 backdrop-blur" />
          {listing.status !== "ACTIVE" && (
            <ListingStatusBadge status={listing.status} className="bg-background/90 backdrop-blur" />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CategoryIcon name={listing.category.name} className="size-3.5" />
          {f.category(listing.category.name)}
        </div>
        <h3 className="line-clamp-2 leading-snug font-medium group-hover:text-primary">{listing.title}</h3>
        <p
          className={cn(
            "text-base font-semibold tracking-tight",
            listing.listing_type === "FREE" && "text-sky-700 dark:text-sky-300",
            listing.listing_type === "WANTED" && "text-amber-700 dark:text-amber-300",
          )}
        >
          {listing.listing_type === "WANTED" ? f.t(t.listings.lookingFor, { qty }) : f.listingPrice(listing)}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          {listing.listing_type !== "WANTED" && (
            <span className="inline-flex items-center gap-1">
              <Scale className="size-3.5" />
              {qty}
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{f.location(listing.city, listing.township)}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <UserAvatar user={listing.owner} className="size-5 text-[10px]" />
        <span className="truncate">{listing.owner.full_name}</span>
        <span className="ml-auto shrink-0">{f.relative(listing.created_at)}</span>
      </div>
    </Link>
  )
}

export function ListingGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>{children}</div>
}
