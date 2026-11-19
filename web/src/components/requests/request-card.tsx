import Link from "next/link"

import { CategoryIcon } from "@/components/category-visual"
import { RequestStatusBadge } from "@/components/status-badges"
import { UserAvatar } from "@/components/user-avatar"
import { getI18n } from "@/lib/i18n/server"
import type { RequestWithRelations } from "@/lib/types"
import { cn } from "@/lib/utils"

import { ContactList, LockedContacts } from "./contact-list"
import { RequestActions } from "./request-actions"

/**
 * One request, seen by the listing owner ("owner") or by the person who sent
 * it ("requester"). Contacts appear only when the data layer revealed them.
 */
export async function RequestCard({
  request,
  perspective,
  showListing = true,
  className,
}: {
  request: RequestWithRelations
  perspective: "owner" | "requester"
  showListing?: boolean
  className?: string
}) {
  const { t, f } = await getI18n()
  const other = perspective === "owner" ? request.requester : request.listing.owner
  const isWanted = request.listing.listing_type === "WANTED"
  const qty = (
    <span className="font-medium text-foreground">
      {f.quantity(request.requested_quantity, request.listing.quantity_unit)}
    </span>
  )

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10", className)}>
      <div className="flex items-start gap-3">
        <UserAvatar user={other} className="size-9" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/users/${other.id}`} className="truncate font-medium hover:underline">
              {other.full_name}
            </Link>
            <RequestStatusBadge status={request.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {perspective === "owner" ? (
              <>
                {isWanted ? t.requests.offers : t.requests.requests} {qty}
              </>
            ) : (
              <>
                {isWanted ? t.requests.youOffered : t.requests.youRequested} {qty}{" "}
                {f.t(t.requests.from, { name: request.listing.owner.full_name })}
              </>
            )}{" "}
            · {f.relative(request.created_at)}
          </p>
        </div>
      </div>

      {showListing && (
        <Link
          href={`/listings/${request.listing.id}`}
          className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm hover:bg-muted"
        >
          <CategoryIcon name={request.listing.category.name} className="size-4 shrink-0" />
          <span className="truncate">{request.listing.title}</span>
        </Link>
      )}

      {request.message && (
        <p className="rounded-md border-l-2 border-primary/40 pl-3 text-sm text-pretty">{request.message}</p>
      )}

      {request.revealed_contacts ? (
        <ContactList contacts={request.revealed_contacts} name={other.full_name} />
      ) : request.status === "PENDING" ? (
        <LockedContacts
          message={perspective === "owner" ? t.requests.acceptToExchange : t.requests.appearsOnceAccepted}
        />
      ) : null}

      <div className="flex justify-end empty:hidden">
        <RequestActions requestId={request.id} status={request.status} role={perspective} />
      </div>
    </div>
  )
}
