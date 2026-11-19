import "server-only"

import * as seed from "@/lib/data/seed"
import type {
  ListingImage,
  MaterialCategory,
  MaterialListing,
  MaterialRequest,
  ReuseSuggestion,
  User,
  UserContact,
  WasteReport,
  WasteReportImage,
} from "@/lib/types"

/**
 * In-memory stand-in for the PostgreSQL database.
 *
 * - Lives on `globalThis` so it survives hot reloads in `next dev`.
 * - Resets whenever the server process restarts.
 * - Replace the functions in `queries.ts` / `actions.ts` with SQL when a real
 *   database is connected; nothing in the UI needs to change.
 */
export interface Store {
  users: User[]
  userContacts: UserContact[]
  materialCategories: MaterialCategory[]
  materialListings: MaterialListing[]
  listingImages: ListingImage[]
  materialRequests: MaterialRequest[]
  wasteReports: WasteReport[]
  wasteReportImages: WasteReportImage[]
  reuseSuggestions: ReuseSuggestion[]
}

function createStore(): Store {
  return structuredClone({
    users: seed.users,
    userContacts: seed.userContacts,
    materialCategories: seed.materialCategories,
    materialListings: seed.materialListings,
    listingImages: seed.listingImages,
    materialRequests: seed.materialRequests,
    wasteReports: seed.wasteReports,
    wasteReportImages: seed.wasteReportImages,
    reuseSuggestions: seed.reuseSuggestions,
  })
}

const globalForStore = globalThis as unknown as { __reloopStore?: Store }

export const db: Store = (globalForStore.__reloopStore ??= createStore())

/** Emulates `GENERATED ALWAYS AS IDENTITY`. */
export function nextId(rows: { id: number }[]) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
}

export function now() {
  return new Date().toISOString()
}
