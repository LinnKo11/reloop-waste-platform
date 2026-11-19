import "server-only"

import { connection } from "next/server"

import { db } from "@/lib/data/store"
import type {
  ListingStatus,
  ListingType,
  ListingWithRelations,
  MaterialListing,
  MaterialRequest,
  PublicUser,
  RequestWithRelations,
  SuggestionMethod,
  SuggestionWithCategory,
  User,
  UserContact,
  WasteReport,
  WasteReportStatus,
  WasteReportWithRelations,
} from "@/lib/types"

/**
 * Read-side data access. Every function is async and calls `connection()` so
 * pages render at request time — exactly as they will once these functions
 * run SQL against PostgreSQL.
 */

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/** Rule 1: never leak contacts, email or password hash in public payloads. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    full_name: user.full_name,
    account_type: user.account_type,
    system_role: user.system_role,
    profile_image_url: user.profile_image_url,
    bio: user.bio,
    city: user.city,
    township: user.township,
    is_active: user.is_active,
    created_at: user.created_at,
  }
}

function userById(id: number) {
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new Error(`User ${id} not found`)
  return user
}

function categoryById(id: number) {
  const category = db.materialCategories.find((c) => c.id === id)
  if (!category) throw new Error(`Category ${id} not found`)
  return category
}

function withListingRelations(listing: MaterialListing): ListingWithRelations {
  return {
    ...listing,
    category: categoryById(listing.category_id),
    owner: toPublicUser(userById(listing.user_id)),
    images: db.listingImages
      .filter((img) => img.listing_id === listing.id)
      .sort((a, b) => a.display_order - b.display_order),
    pending_request_count: db.materialRequests.filter(
      (r) => r.listing_id === listing.id && r.status === "PENDING",
    ).length,
  }
}

function withReportRelations(report: WasteReport): WasteReportWithRelations {
  return {
    ...report,
    category: categoryById(report.category_id),
    reporter: toPublicUser(userById(report.reported_by)),
    images: db.wasteReportImages
      .filter((img) => img.waste_report_id === report.id)
      .sort((a, b) => a.display_order - b.display_order),
  }
}

/**
 * Rule 2: contacts are revealed only to the listing owner or the requester,
 * and only once the request is ACCEPTED or COMPLETED. Each side sees the
 * *other* party's contacts.
 */
export function revealContacts(
  request: MaterialRequest,
  listing: MaterialListing,
  viewerId: number,
): UserContact[] | null {
  if (request.status !== "ACCEPTED" && request.status !== "COMPLETED") return null

  let otherPartyId: number | null = null
  if (viewerId === listing.user_id) otherPartyId = request.requester_id
  else if (viewerId === request.requester_id) otherPartyId = listing.user_id
  if (otherPartyId == null) return null

  return db.userContacts
    .filter((c) => c.user_id === otherPartyId)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
}

function withRequestRelations(request: MaterialRequest, viewerId: number): RequestWithRelations {
  const listing = db.materialListings.find((l) => l.id === request.listing_id)!
  return {
    ...request,
    listing: withListingRelations(listing),
    requester: toPublicUser(userById(request.requester_id)),
    revealed_contacts: revealContacts(request, listing, viewerId),
  }
}

const byNewest = <T extends { created_at: string }>(a: T, b: T) =>
  b.created_at.localeCompare(a.created_at)

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories({ includeInactive = false } = {}) {
  await connection()
  return db.materialCategories
    .filter((c) => includeInactive || c.is_active)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getCategoriesWithCounts() {
  await connection()
  return db.materialCategories
    .filter((c) => c.is_active)
    .map((c) => ({
      ...c,
      listing_count: db.materialListings.filter(
        (l) => l.category_id === c.id && l.status === "ACTIVE",
      ).length,
      report_count: db.wasteReports.filter((r) => r.category_id === c.id).length,
      suggestion_count: db.reuseSuggestions.filter((s) => s.category_id === c.id && s.is_published)
        .length,
    }))
    .sort((a, b) => b.listing_count - a.listing_count || a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export type ListingSort = "newest" | "oldest" | "price_asc" | "price_desc" | "quantity_desc"
export type ListingStatusFilter = "open" | "all" | ListingStatus

export interface ListingFilters {
  q?: string
  type?: ListingType
  categoryId?: number
  city?: string
  status?: ListingStatusFilter
  sort?: ListingSort
  userId?: number
  limit?: number
}

export async function getListings(filters: ListingFilters = {}) {
  await connection()
  const { q, type, categoryId, city, status = "open", sort = "newest", userId, limit } = filters
  const needle = q?.trim().toLowerCase()

  let rows = db.materialListings.filter((l) => {
    if (type && l.listing_type !== type) return false
    if (categoryId && l.category_id !== categoryId) return false
    if (city && l.city !== city) return false
    if (userId && l.user_id !== userId) return false
    if (status === "open" && l.status !== "ACTIVE" && l.status !== "RESERVED") return false
    if (status !== "open" && status !== "all" && l.status !== status) return false
    if (needle) {
      const haystack = `${l.title} ${l.description ?? ""} ${l.township ?? ""} ${l.city}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  rows = rows.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.created_at.localeCompare(b.created_at)
      case "price_asc":
        return (a.price_per_unit ?? Infinity) - (b.price_per_unit ?? Infinity)
      case "price_desc":
        return (b.price_per_unit ?? -Infinity) - (a.price_per_unit ?? -Infinity)
      case "quantity_desc":
        return b.quantity - a.quantity
      default:
        return byNewest(a, b)
    }
  })

  if (limit) rows = rows.slice(0, limit)
  return rows.map(withListingRelations)
}

export async function getListingById(id: number) {
  await connection()
  const listing = db.materialListings.find((l) => l.id === id)
  return listing ? withListingRelations(listing) : null
}

export async function getSimilarListings(listing: MaterialListing, limit = 3) {
  await connection()
  return db.materialListings
    .filter((l) => l.id !== listing.id && l.category_id === listing.category_id && l.status === "ACTIVE")
    .sort(byNewest)
    .slice(0, limit)
    .map(withListingRelations)
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

/** All requests on a listing — only the owner may see them. */
export async function getRequestsForListing(listingId: number, viewerId: number) {
  await connection()
  const listing = db.materialListings.find((l) => l.id === listingId)
  if (!listing || listing.user_id !== viewerId) return []
  return db.materialRequests
    .filter((r) => r.listing_id === listingId)
    .sort(byNewest)
    .map((r) => withRequestRelations(r, viewerId))
}

/** The viewer's own requests on a listing, newest first. */
export async function getViewerRequestsForListing(listingId: number, viewerId: number) {
  await connection()
  return db.materialRequests
    .filter((r) => r.listing_id === listingId && r.requester_id === viewerId)
    .sort(byNewest)
    .map((r) => withRequestRelations(r, viewerId))
}

/** Requests other people sent on the viewer's listings. */
export async function getIncomingRequests(viewerId: number) {
  await connection()
  const myListingIds = new Set(
    db.materialListings.filter((l) => l.user_id === viewerId).map((l) => l.id),
  )
  return db.materialRequests
    .filter((r) => myListingIds.has(r.listing_id))
    .sort(byNewest)
    .map((r) => withRequestRelations(r, viewerId))
}

/** Requests the viewer sent on other people's listings. */
export async function getOutgoingRequests(viewerId: number) {
  await connection()
  return db.materialRequests
    .filter((r) => r.requester_id === viewerId)
    .sort(byNewest)
    .map((r) => withRequestRelations(r, viewerId))
}

// ---------------------------------------------------------------------------
// Waste reports
// ---------------------------------------------------------------------------

export interface ReportFilters {
  q?: string
  status?: WasteReportStatus
  categoryId?: number
  city?: string
  reportedBy?: number
}

export async function getWasteReports(filters: ReportFilters = {}) {
  await connection()
  const needle = filters.q?.trim().toLowerCase()
  return db.wasteReports
    .filter((r) => {
      if (filters.status && r.status !== filters.status) return false
      if (filters.categoryId && r.category_id !== filters.categoryId) return false
      if (filters.city && r.city !== filters.city) return false
      if (filters.reportedBy && r.reported_by !== filters.reportedBy) return false
      if (needle) {
        const haystack = `${r.title} ${r.description ?? ""} ${r.township ?? ""} ${r.city}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })
    .sort((a, b) => b.reported_at.localeCompare(a.reported_at))
    .map(withReportRelations)
}

export async function getWasteReportById(id: number) {
  await connection()
  const report = db.wasteReports.find((r) => r.id === id)
  return report ? withReportRelations(report) : null
}

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

export interface SuggestionFilters {
  q?: string
  categoryId?: number
  method?: SuggestionMethod
  includeUnpublished?: boolean
  limit?: number
}

export async function getSuggestions(filters: SuggestionFilters = {}) {
  await connection()
  const needle = filters.q?.trim().toLowerCase()
  let rows = db.reuseSuggestions.filter((s) => {
    if (!filters.includeUnpublished && !s.is_published) return false
    if (filters.categoryId && s.category_id !== filters.categoryId) return false
    if (filters.method && s.method !== filters.method) return false
    if (needle && !`${s.title} ${s.description}`.toLowerCase().includes(needle)) return false
    return true
  })
  rows = rows.sort((a, b) => a.title.localeCompare(b.title))
  if (filters.limit) rows = rows.slice(0, filters.limit)
  return rows.map<SuggestionWithCategory>((s) => ({ ...s, category: categoryById(s.category_id) }))
}

export async function getSuggestionById(id: number, { includeUnpublished = false } = {}) {
  await connection()
  const s = db.reuseSuggestions.find((x) => x.id === id && (includeUnpublished || x.is_published))
  return s ? { ...s, category: categoryById(s.category_id) } : null
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getPublicUser(id: number) {
  await connection()
  const user = db.users.find((u) => u.id === id)
  return user ? toPublicUser(user) : null
}

export async function getDemoUsers() {
  await connection()
  return db.users.filter((u) => u.is_active).map(toPublicUser)
}

export async function getUserStats(userId: number) {
  await connection()
  const listings = db.materialListings.filter((l) => l.user_id === userId)
  const listingIds = new Set(listings.map((l) => l.id))
  return {
    listings: listings.length,
    activeListings: listings.filter((l) => l.status === "ACTIVE").length,
    completedExchanges: db.materialRequests.filter(
      (r) => r.status === "COMPLETED" && (listingIds.has(r.listing_id) || r.requester_id === userId),
    ).length,
    reports: db.wasteReports.filter((r) => r.reported_by === userId).length,
  }
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getPlatformStats() {
  await connection()
  const active = db.materialListings.filter((l) => l.status === "ACTIVE")
  const kgAvailable = active
    .filter((l) => l.listing_type !== "WANTED")
    .reduce((sum, l) => {
      if (l.quantity_unit === "KG") return sum + l.quantity
      if (l.quantity_unit === "TON") return sum + l.quantity * 1000
      if (l.quantity_unit === "GRAM") return sum + l.quantity / 1000
      return sum
    }, 0)
  const reports = db.wasteReports
  const resolved = reports.filter((r) => r.status === "RESOLVED").length

  return {
    activeListings: active.length,
    kgAvailable,
    completedExchanges: db.materialRequests.filter((r) => r.status === "COMPLETED").length,
    acceptedRequests: db.materialRequests.filter((r) => r.status === "ACCEPTED").length,
    totalReports: reports.length,
    openReports: reports.filter((r) => r.status !== "RESOLVED").length,
    resolvedReports: resolved,
    resolvedRate: reports.length ? resolved / reports.length : 0,
    members: db.users.filter((u) => u.is_active).length,
    reportsByStatus: (["REPORTED", "VERIFIED", "COLLECTED", "RESOLVED"] as const).map((status) => ({
      status,
      count: reports.filter((r) => r.status === status).length,
    })),
  }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** Admin user table. Includes email (admin-only) but still never contacts. */
export async function getAdminUsers() {
  await connection()
  return db.users
    .map((u) => ({
      ...toPublicUser(u),
      email: u.email,
      listing_count: db.materialListings.filter((l) => l.user_id === u.id).length,
      report_count: db.wasteReports.filter((r) => r.reported_by === u.id).length,
    }))
    .sort((a, b) => a.id - b.id)
}
