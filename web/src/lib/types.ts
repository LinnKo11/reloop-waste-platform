/**
 * Domain types mirroring `source/waste_platform_mvp_postgresql.sql`.
 *
 * Column names are kept in snake_case so rows from Postgres can be mapped 1:1
 * later. NUMERIC / BIGINT columns are typed as `number` here; when a real
 * driver is added (pg returns them as strings) convert them in the data layer.
 */

// ---------------------------------------------------------------------------
// 1. ENUM TYPES
// ---------------------------------------------------------------------------

export const USER_ACCOUNT_TYPES = ["INDIVIDUAL", "JUNK_SHOP", "ORGANISATION", "BUSINESS"] as const
export type UserAccountType = (typeof USER_ACCOUNT_TYPES)[number]

export const SYSTEM_ROLES = ["USER", "ADMIN"] as const
export type SystemRole = (typeof SYSTEM_ROLES)[number]

export const CONTACT_TYPES = ["TELEGRAM", "PHONE", "EMAIL"] as const
export type ContactType = (typeof CONTACT_TYPES)[number]

export const LISTING_TYPES = ["FOR_SALE", "FREE", "WANTED"] as const
export type ListingType = (typeof LISTING_TYPES)[number]

export const LISTING_STATUSES = ["ACTIVE", "PAUSED", "RESERVED", "COMPLETED", "CLOSED"] as const
export type ListingStatus = (typeof LISTING_STATUSES)[number]

export const QUANTITY_UNITS = ["KG", "GRAM", "TON", "PIECE", "BAG", "BUNDLE", "LITRE", "OTHER"] as const
export type QuantityUnit = (typeof QUANTITY_UNITS)[number]

export const MATERIAL_REQUEST_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const
export type MaterialRequestStatus = (typeof MATERIAL_REQUEST_STATUSES)[number]

export const WASTE_REPORT_STATUSES = ["REPORTED", "VERIFIED", "COLLECTED", "RESOLVED"] as const
export type WasteReportStatus = (typeof WASTE_REPORT_STATUSES)[number]

export const SUGGESTION_METHODS = ["REUSE", "RECYCLE"] as const
export type SuggestionMethod = (typeof SUGGESTION_METHODS)[number]

// ---------------------------------------------------------------------------
// 2..9 TABLE ROWS
// ---------------------------------------------------------------------------

export type ISODateString = string

export interface User {
  id: number
  full_name: string
  email: string
  password_hash: string
  account_type: UserAccountType
  system_role: SystemRole
  profile_image_url: string | null
  bio: string | null
  city: string | null
  township: string | null
  is_active: boolean
  created_at: ISODateString
  updated_at: ISODateString
}

export interface UserContact {
  id: number
  user_id: number
  contact_type: ContactType
  contact_value: string
  is_primary: boolean
  created_at: ISODateString
}

export interface MaterialCategory {
  id: number
  name: string
  description: string | null
  is_active: boolean
  created_at: ISODateString
}

export interface MaterialListing {
  id: number
  user_id: number
  category_id: number
  listing_type: ListingType
  title: string
  description: string | null
  quantity: number
  quantity_unit: QuantityUnit
  /** Required for FOR_SALE, must be NULL for FREE / WANTED (chk_listing_price). */
  price_per_unit: number | null
  currency: string
  city: string
  township: string | null
  address_description: string | null
  latitude: number | null
  longitude: number | null
  status: ListingStatus
  created_at: ISODateString
  updated_at: ISODateString
}

export interface ListingImage {
  id: number
  listing_id: number
  image_url: string
  display_order: number
  created_at: ISODateString
}

export interface MaterialRequest {
  id: number
  listing_id: number
  requester_id: number
  message: string | null
  requested_quantity: number
  status: MaterialRequestStatus
  responded_at: ISODateString | null
  completed_at: ISODateString | null
  created_at: ISODateString
  updated_at: ISODateString
}

export interface WasteReport {
  id: number
  reported_by: number
  category_id: number
  title: string
  description: string | null
  estimated_quantity: number | null
  quantity_unit: QuantityUnit | null
  city: string
  township: string | null
  address_description: string | null
  latitude: number
  longitude: number
  status: WasteReportStatus
  reported_at: ISODateString
  updated_at: ISODateString
}

export interface WasteReportImage {
  id: number
  waste_report_id: number
  image_url: string
  display_order: number
  created_at: ISODateString
}

export interface ReuseSuggestion {
  id: number
  category_id: number
  title: string
  description: string
  method: SuggestionMethod
  /** Newline-separated steps. */
  instructions: string | null
  difficulty: string | null
  safety_notes: string | null
  image_url: string | null
  is_published: boolean
  created_at: ISODateString
  updated_at: ISODateString
}

// ---------------------------------------------------------------------------
// VIEW MODELS (what the data layer returns to the UI)
// ---------------------------------------------------------------------------

/**
 * Safe, public projection of a user.
 * Rule 1: never expose user_contacts, email or password_hash publicly.
 */
export type PublicUser = Pick<
  User,
  | "id"
  | "full_name"
  | "account_type"
  | "system_role"
  | "profile_image_url"
  | "bio"
  | "city"
  | "township"
  | "is_active"
  | "created_at"
>

export interface ListingWithRelations extends MaterialListing {
  category: MaterialCategory
  owner: PublicUser
  images: ListingImage[]
  pending_request_count: number
}

export interface RequestWithRelations extends MaterialRequest {
  listing: ListingWithRelations
  requester: PublicUser
  /**
   * Contacts of the *other* party, only populated when the viewer is the
   * listing owner or the requester AND status is ACCEPTED or COMPLETED (rule 2).
   */
  revealed_contacts: UserContact[] | null
}

export interface WasteReportWithRelations extends WasteReport {
  category: MaterialCategory
  reporter: PublicUser
  images: WasteReportImage[]
}

export interface SuggestionWithCategory extends ReuseSuggestion {
  category: MaterialCategory
}
