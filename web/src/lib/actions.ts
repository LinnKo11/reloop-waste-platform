"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { ActionState } from "@/lib/action-state"
import { DEMO_USER_COOKIE, getCurrentUser, isAdmin } from "@/lib/auth"
import { db, nextId, now } from "@/lib/data/store"
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import {
  LISTING_STATUSES,
  WASTE_REPORT_STATUSES,
  type ListingStatus,
  type WasteReportStatus,
} from "@/lib/types"
import {
  formDataToObject,
  listingSchema,
  loginSchema,
  registerSchema,
  requestSchema,
  wasteReportSchema,
} from "@/lib/validation"

/**
 * Write-side data access (Server Actions). Every action re-checks
 * authorisation on the server — never trust the UI — and returns messages in
 * the visitor's language.
 */

const fail = (message: string, fieldErrors?: ActionState["fieldErrors"]): ActionState => ({
  ok: false,
  message,
  fieldErrors,
})

const COOKIE_OPTIONS = { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 } as const

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

export async function setLocaleAction(locale: string): Promise<ActionState> {
  if (!isLocale(locale)) return { ok: false }
  ;(await cookies()).set(LOCALE_COOKIE, locale, COOKIE_OPTIONS)
  refresh()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Demo authentication
// ---------------------------------------------------------------------------

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getI18n()
  const parsed = loginSchema(t.auth).safeParse(formDataToObject(formData))
  if (!parsed.success) return fail(t.actions.fixFields, z.flattenError(parsed.error).fieldErrors)

  const user = db.users.find((u) => u.email.toLowerCase() === parsed.data.email && u.is_active)
  if (!user) return fail(t.auth.invalidLogin, { email: [t.auth.invalidLogin] })

  // Demo only: no password check yet. Replace with a real session + password hash check.
  ;(await cookies()).set(DEMO_USER_COOKIE, String(user.id), COOKIE_OPTIONS)
  redirect("/dashboard")
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getI18n()
  const parsed = registerSchema(t.auth, t.validation).safeParse(formDataToObject(formData))
  if (!parsed.success) return fail(t.actions.fixFields, z.flattenError(parsed.error).fieldErrors)

  const input = parsed.data
  if (db.users.some((u) => u.email.toLowerCase() === input.email)) {
    return fail(t.auth.emailTaken, { email: [t.auth.emailTaken] })
  }

  const timestamp = now()
  const id = nextId(db.users)
  db.users.push({
    id,
    full_name: input.full_name,
    email: input.email,
    password_hash: "demo-not-hashed",
    account_type: input.account_type,
    system_role: "USER",
    profile_image_url: null,
    bio: null,
    city: input.city ?? null,
    township: input.township ?? null,
    is_active: true,
    created_at: timestamp,
    updated_at: timestamp,
  })
  const contacts: [("TELEGRAM" | "PHONE"), string | undefined][] = [
    ["TELEGRAM", input.telegram],
    ["PHONE", input.phone],
  ]
  let primary = true
  for (const [contact_type, value] of contacts) {
    if (!value) continue
    db.userContacts.push({
      id: nextId(db.userContacts),
      user_id: id,
      contact_type,
      contact_value: value,
      is_primary: primary,
      created_at: timestamp,
    })
    primary = false
  }

  ;(await cookies()).set(DEMO_USER_COOKIE, String(id), COOKIE_OPTIONS)
  redirect("/dashboard?welcome=1")
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export async function createListingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()])
  const parsed = listingSchema(t.validation).safeParse(formDataToObject(formData))
  if (!parsed.success) return fail(t.actions.fixFields, z.flattenError(parsed.error).fieldErrors)

  const input = parsed.data
  const category = db.materialCategories.find((c) => c.id === input.category_id && c.is_active)
  if (!category) return fail(t.actions.categoryUnavailable, { category_id: [t.validation.chooseCategory] })

  const timestamp = now()
  const id = nextId(db.materialListings)
  db.materialListings.push({
    id,
    user_id: user.id,
    category_id: input.category_id,
    listing_type: input.listing_type,
    title: input.title,
    description: input.description ?? null,
    quantity: input.quantity,
    quantity_unit: input.quantity_unit,
    price_per_unit: input.price_per_unit,
    currency: input.currency,
    city: input.city,
    township: input.township ?? null,
    address_description: input.address_description ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    status: "ACTIVE",
    created_at: timestamp,
    updated_at: timestamp,
  })

  redirect(`/listings/${id}?created=1`)
}

export async function updateListingStatusAction(listingId: number, status: ListingStatus): Promise<ActionState> {
  const [{ t, f }, user] = await Promise.all([getI18n(), getCurrentUser()])
  if (!LISTING_STATUSES.includes(status)) return fail(t.actions.unknownStatus)

  const listing = db.materialListings.find((l) => l.id === listingId)
  if (!listing) return fail(t.actions.listingNotFound)
  if (listing.user_id !== user.id && !isAdmin(user)) return fail(t.actions.onlyOwnerStatus)

  listing.status = status
  listing.updated_at = now()
  refresh()
  return { ok: true, message: f.t(t.actions.listingStatusChanged, { status: t.enums.listingStatus[status] }) }
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export async function createRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [{ t, f }, user] = await Promise.all([getI18n(), getCurrentUser()])
  const parsed = requestSchema(t.validation).safeParse(formDataToObject(formData))
  if (!parsed.success) return fail(t.actions.fixFields, z.flattenError(parsed.error).fieldErrors)

  const { listing_id, requested_quantity, message } = parsed.data
  const listing = db.materialListings.find((l) => l.id === listing_id)
  if (!listing) return fail(t.actions.listingNotFound)

  // A user cannot request their own listing.
  if (listing.user_id === user.id) return fail(t.actions.ownListing)
  if (listing.status !== "ACTIVE") return fail(t.actions.notAccepting)
  if (requested_quantity > listing.quantity) {
    return fail(t.actions.tooMuch, { requested_quantity: [f.t(t.actions.maxIs, { max: f.number(listing.quantity) })] })
  }

  // One pending request per listing per user.
  const duplicate = db.materialRequests.some(
    (r) => r.listing_id === listing_id && r.requester_id === user.id && r.status === "PENDING",
  )
  if (duplicate) return fail(t.actions.duplicatePending)

  const timestamp = now()
  db.materialRequests.push({
    id: nextId(db.materialRequests),
    listing_id,
    requester_id: user.id,
    message: message ?? null,
    requested_quantity,
    status: "PENDING",
    responded_at: null,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  })

  refresh()
  return { ok: true, message: t.actions.requestSent }
}

function findRequestWithListing(requestId: number) {
  const request = db.materialRequests.find((r) => r.id === requestId)
  const listing = request && db.materialListings.find((l) => l.id === request.listing_id)
  return request && listing ? { request, listing } : null
}

export async function respondToRequestAction(
  requestId: number,
  decision: "ACCEPTED" | "REJECTED",
): Promise<ActionState> {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()])
  const found = findRequestWithListing(requestId)
  if (!found) return fail(t.actions.requestNotFound)
  const { request, listing } = found

  // Only the listing owner may accept or reject.
  if (listing.user_id !== user.id) return fail(t.actions.onlyOwnerRespond)
  if (request.status !== "PENDING") return fail(t.actions.alreadyAnswered)
  if (decision !== "ACCEPTED" && decision !== "REJECTED") return fail(t.actions.unknownDecision)

  const timestamp = now()
  request.status = decision
  request.responded_at = timestamp
  request.updated_at = timestamp

  refresh()
  return { ok: true, message: decision === "ACCEPTED" ? t.actions.accepted : t.actions.rejected }
}

export async function cancelRequestAction(requestId: number): Promise<ActionState> {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()])
  const found = findRequestWithListing(requestId)
  if (!found) return fail(t.actions.requestNotFound)
  const { request } = found

  if (request.requester_id !== user.id) return fail(t.actions.onlyRequesterCancel)
  if (request.status !== "PENDING" && request.status !== "ACCEPTED") return fail(t.actions.cannotCancel)

  request.status = "CANCELLED"
  request.updated_at = now()
  refresh()
  return { ok: true, message: t.actions.cancelled }
}

export async function completeRequestAction(requestId: number): Promise<ActionState> {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()])
  const found = findRequestWithListing(requestId)
  if (!found) return fail(t.actions.requestNotFound)
  const { request, listing } = found

  if (listing.user_id !== user.id) return fail(t.actions.onlyOwnerComplete)
  if (request.status !== "ACCEPTED") return fail(t.actions.onlyAcceptedComplete)

  const timestamp = now()
  request.status = "COMPLETED"
  request.completed_at = timestamp
  request.updated_at = timestamp
  refresh()
  return { ok: true, message: t.actions.completed }
}

// ---------------------------------------------------------------------------
// Waste reports
// ---------------------------------------------------------------------------

export async function createWasteReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()])
  const parsed = wasteReportSchema(t.validation).safeParse(formDataToObject(formData))
  if (!parsed.success) return fail(t.actions.fixFields, z.flattenError(parsed.error).fieldErrors)

  const input = parsed.data
  if (!db.materialCategories.some((c) => c.id === input.category_id)) {
    return fail(t.actions.categoryUnavailable, { category_id: [t.validation.chooseCategory] })
  }

  const timestamp = now()
  const id = nextId(db.wasteReports)
  db.wasteReports.push({
    id,
    reported_by: user.id,
    category_id: input.category_id,
    title: input.title,
    description: input.description ?? null,
    estimated_quantity: input.estimated_quantity ?? null,
    quantity_unit: input.quantity_unit ?? null,
    city: input.city,
    township: input.township ?? null,
    address_description: input.address_description ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
    status: "REPORTED",
    reported_at: timestamp,
    updated_at: timestamp,
  })

  redirect(`/reports/${id}?created=1`)
}

export async function updateReportStatusAction(reportId: number, status: WasteReportStatus): Promise<ActionState> {
  const [{ t, f }, user] = await Promise.all([getI18n(), getCurrentUser()])
  if (!isAdmin(user)) return fail(t.actions.onlyAdminReport)
  if (!WASTE_REPORT_STATUSES.includes(status)) return fail(t.actions.unknownStatus)

  const report = db.wasteReports.find((r) => r.id === reportId)
  if (!report) return fail(t.actions.reportNotFound)

  report.status = status
  report.updated_at = now()
  refresh()
  return {
    ok: true,
    message: f.t(t.actions.reportStatusChanged, { id: reportId, status: t.enums.reportStatus[status].label }),
  }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** Members are deactivated, never hard-deleted, so their history stays intact. */
export async function toggleUserActiveAction(userId: number): Promise<ActionState> {
  const [{ t, f }, user] = await Promise.all([getI18n(), getCurrentUser()])
  if (!isAdmin(user)) return fail(t.actions.onlyAdminUsers)
  if (userId === user.id) return fail(t.actions.cannotDeactivateSelf)

  const target = db.users.find((u) => u.id === userId)
  if (!target) return fail(t.actions.userNotFound)

  target.is_active = !target.is_active
  target.updated_at = now()
  refresh()
  return {
    ok: true,
    message: f.t(target.is_active ? t.actions.userReactivated : t.actions.userDeactivated, { name: target.full_name }),
  }
}

export async function toggleSuggestionPublishedAction(suggestionId: number): Promise<ActionState> {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()])
  if (!isAdmin(user)) return fail(t.actions.onlyAdminIdeas)

  const suggestion = db.reuseSuggestions.find((s) => s.id === suggestionId)
  if (!suggestion) return fail(t.actions.ideaNotFound)

  suggestion.is_published = !suggestion.is_published
  suggestion.updated_at = now()
  refresh()
  return { ok: true, message: suggestion.is_published ? t.actions.ideaPublished : t.actions.ideaHidden }
}

export async function toggleCategoryActiveAction(categoryId: number): Promise<ActionState> {
  const [{ t, f }, user] = await Promise.all([getI18n(), getCurrentUser()])
  if (!isAdmin(user)) return fail(t.actions.onlyAdminCategories)

  const category = db.materialCategories.find((c) => c.id === categoryId)
  if (!category) return fail(t.actions.categoryNotFound)

  category.is_active = !category.is_active
  refresh()
  return {
    ok: true,
    message: f.t(category.is_active ? t.actions.categoryEnabled : t.actions.categoryDisabled, {
      name: f.category(category.name),
    }),
  }
}

// ---------------------------------------------------------------------------
// Demo session
// ---------------------------------------------------------------------------

export async function switchDemoUserAction(userId: number): Promise<ActionState> {
  const { t, f } = await getI18n()
  const target = db.users.find((u) => u.id === userId && u.is_active)
  if (!target) return fail(t.actions.demoUserUnavailable)

  ;(await cookies()).set(DEMO_USER_COOKIE, String(userId), COOKIE_OPTIONS)
  refresh()
  return { ok: true, message: f.t(t.actions.nowViewingAs, { name: target.full_name }) }
}
