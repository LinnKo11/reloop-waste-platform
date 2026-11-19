import { CalendarDays, CircleCheck, Inbox, MapPin, Scale, Tag } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CategoryIcon, MaterialVisual } from "@/components/category-visual"
import { ListingCard } from "@/components/listings/listing-card"
import { ListingStatusControl } from "@/components/listings/listing-status-control"
import { Map } from "@/components/map/map"
import { PageContainer, PageHeader } from "@/components/page-header"
import { ContactList, LockedContacts } from "@/components/requests/contact-list"
import { RequestCard } from "@/components/requests/request-card"
import { RequestDialog } from "@/components/requests/request-dialog"
import { AccountTypeBadge, ListingStatusBadge, ListingTypeBadge, RequestStatusBadge } from "@/components/status-badges"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/user-avatar"
import { getCurrentUser } from "@/lib/auth"
import {
  getListingById,
  getRequestsForListing,
  getSimilarListings,
  getViewerRequestsForListing,
} from "@/lib/data/queries"
import { getI18n } from "@/lib/i18n/server"
import { positiveInt } from "@/lib/search-params"

export async function generateMetadata({ params }: PageProps<"/listings/[id]">): Promise<Metadata> {
  const [{ id }, { t }] = await Promise.all([params, getI18n()])
  const listingId = positiveInt(id)
  const listing = listingId ? await getListingById(listingId) : null
  return { title: listing?.title ?? t.listing.notFound }
}

export default async function ListingDetailPage({ params, searchParams }: PageProps<"/listings/[id]">) {
  const [{ id: rawId }, sp, user, { t, f }] = await Promise.all([params, searchParams, getCurrentUser(), getI18n()])
  const id = positiveInt(rawId)
  const listing = id ? await getListingById(id) : null
  if (!listing) notFound()

  const isOwner = listing.user_id === user.id
  const [ownerRequests, myRequests, similar] = await Promise.all([
    isOwner ? getRequestsForListing(listing.id, user.id) : Promise.resolve([]),
    isOwner ? Promise.resolve([]) : getViewerRequestsForListing(listing.id, user.id),
    getSimilarListings(listing),
  ])

  const latestMine = myRequests[0]
  const hasPending = myRequests.some((r) => r.status === "PENDING")
  const canRequest = !isOwner && listing.status === "ACTIVE" && !hasPending
  const categoryName = f.category(listing.category.name)
  const qty = f.quantity(listing.quantity, listing.quantity_unit)
  const tl = t.listing

  const details = [
    { icon: Scale, label: listing.listing_type === "WANTED" ? tl.qtyWanted : tl.qtyAvailable, value: qty },
    { icon: Tag, label: tl.category, value: categoryName },
    { icon: MapPin, label: tl.location, value: f.location(listing.city, listing.township) },
    { icon: CalendarDays, label: tl.posted, value: `${f.date(listing.created_at)} (${f.relative(listing.created_at)})` },
  ]

  const latestMessage =
    latestMine?.status === "PENDING"
      ? tl.waitingOwner
      : latestMine?.status === "REJECTED"
        ? tl.ownerDeclined
        : tl.requestCancelled

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: t.nav.marketplace, href: "/listings" },
          { label: categoryName, href: `/listings?category=${listing.category_id}` },
          { label: listing.title },
        ]}
        title={listing.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <ListingTypeBadge type={listing.listing_type} />
            <ListingStatusBadge status={listing.status} />
            <span className="inline-flex items-center gap-1 text-sm">
              <MapPin className="size-3.5" /> {f.location(listing.city, listing.township)}
            </span>
          </span>
        }
      />

      {sp.created === "1" && (
        <Alert className="mb-6 border-emerald-600/30 bg-emerald-500/5">
          <CircleCheck className="text-emerald-600" />
          <AlertTitle>{tl.createdTitle}</AlertTitle>
          <AlertDescription>{tl.createdBody}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <MaterialVisual
            categoryName={listing.category.name}
            imageUrl={listing.images[0]?.image_url}
            alt={listing.title}
            className="aspect-16/8 w-full rounded-xl"
            iconClassName="size-20"
          />

          <Card>
            <CardHeader>
              <CardTitle>{tl.about}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <p className="leading-relaxed text-pretty whitespace-pre-line text-muted-foreground">
                {listing.description || t.common.noDescription}
              </p>
              <dl className="grid gap-4 sm:grid-cols-2">
                {details.map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <d.icon className="size-4 text-muted-foreground" />
                    </span>
                    <div className="flex flex-col">
                      <dt className="text-xs text-muted-foreground">{d.label}</dt>
                      <dd className="text-sm font-medium">{d.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              {listing.address_description && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{tl.landmark}</span> {listing.address_description}
                </p>
              )}
            </CardContent>
          </Card>

          {listing.latitude != null && listing.longitude != null && (
            <Card className="gap-0 overflow-hidden py-0">
              <div className="h-64">
                <Map
                  center={[listing.latitude, listing.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  markers={[{ id: listing.id, position: [listing.latitude, listing.longitude], color: "#059669" }]}
                />
              </div>
              <p className="px-4 py-2.5 text-xs text-muted-foreground">{tl.approxLocation}</p>
            </Card>
          )}

          {isOwner && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{tl.requestsOnListing}</h2>
                <span className="text-sm text-muted-foreground">
                  {f.t(t.common.total, { count: f.number(ownerRequests.length) })}
                </span>
              </div>
              {ownerRequests.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {ownerRequests.map((r) => (
                    <RequestCard key={r.id} request={r} perspective="owner" showListing={false} />
                  ))}
                </div>
              ) : (
                <LockedContacts message={tl.noRequestsYet} />
              )}
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardDescription>
                {listing.listing_type === "FOR_SALE" ? tl.price : listing.listing_type === "FREE" ? tl.cost : tl.lookingFor}
              </CardDescription>
              <CardTitle className="text-2xl">
                {listing.listing_type === "WANTED" ? qty : f.listingPrice(listing)}
              </CardTitle>
              {listing.listing_type === "FOR_SALE" && listing.price_per_unit != null && (
                <CardDescription>
                  {f.t(tl.approxTotal, { total: f.money(listing.price_per_unit * listing.quantity, listing.currency), qty })}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isOwner ? (
                <>
                  <p className="text-sm font-medium">{tl.yourListing}</p>
                  <ListingStatusControl listingId={listing.id} status={listing.status} />
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Inbox className="size-4" />
                    {f.t(tl.pendingRequests, { count: f.number(listing.pending_request_count) })}
                  </p>
                </>
              ) : (
                <>
                  {canRequest && (
                    <RequestDialog
                      listingId={listing.id}
                      listingTitle={listing.title}
                      listingType={listing.listing_type}
                      maxQuantity={listing.quantity}
                      unit={listing.quantity_unit}
                      ownerName={listing.owner.full_name}
                    />
                  )}
                  {!canRequest && !latestMine && listing.status !== "ACTIVE" && (
                    <LockedContacts message={tl.notAccepting} />
                  )}
                  {latestMine && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{tl.yourLatestRequest}</span>
                        <RequestStatusBadge status={latestMine.status} />
                      </div>
                      {latestMine.revealed_contacts ? (
                        <ContactList contacts={latestMine.revealed_contacts} name={listing.owner.full_name} />
                      ) : (
                        <LockedContacts message={latestMessage} />
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard?tab=outgoing">{tl.manageRequests}</Link>
                      </Button>
                    </div>
                  )}
                  {!latestMine && canRequest && <LockedContacts message={tl.privateUntilAccept} />}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>{listing.listing_type === "WANTED" ? tl.wantedBy : tl.listedBy}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Link href={`/users/${listing.owner.id}`} className="flex items-center gap-3 hover:opacity-90">
                <UserAvatar user={listing.owner} className="size-11" />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-medium">{listing.owner.full_name}</span>
                  <AccountTypeBadge type={listing.owner.account_type} />
                </div>
              </Link>
              {listing.owner.bio && <p className="line-clamp-3 text-sm text-muted-foreground">{listing.owner.bio}</p>}
              <Separator />
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>{f.location(listing.owner.city, listing.owner.township)}</span>
                <span>{f.t(t.common.memberSince, { date: f.date(listing.owner.created_at) })}</span>
              </div>
            </CardContent>
          </Card>

          <Link
            href={`/suggestions?category=${listing.category_id}`}
            className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm hover:bg-muted/50"
          >
            <CategoryIcon name={listing.category.name} className="size-5 shrink-0" />
            <span>{f.t(tl.ideasFor, { category: categoryName })}</span>
          </Link>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{f.t(tl.moreListings, { category: categoryName })}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
