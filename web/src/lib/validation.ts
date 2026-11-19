import { z } from "zod"

import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { LISTING_TYPES, QUANTITY_UNITS, USER_ACCOUNT_TYPES } from "@/lib/types"

/**
 * Form schemas. Limits mirror the platform's data rules so the UI rejects
 * what would be rejected on save. Messages come from the active language.
 */

type Messages = Dictionary["validation"]

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || (typeof v === "string" && v.trim() === "") ? undefined : v

const MAX_QUANTITY = 999_999_999.999
const MAX_PRICE = 9_999_999_999.99

function helpers(m: Messages) {
  const optionalText = (max: number) =>
    z.preprocess(emptyToUndefined, z.string().trim().max(max, m.tooLong).optional())
  const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number({ message: m.invalid }).optional())
  return { optionalText, optionalNumber }
}

export function listingSchema(m: Messages) {
  const { optionalText, optionalNumber } = helpers(m)
  return z
    .object({
      listing_type: z.enum(LISTING_TYPES, { message: m.chooseType }),
      category_id: z.coerce.number({ message: m.chooseCategory }).int().positive(m.chooseCategory),
      title: z.string().trim().min(5, m.titleMin).max(180, m.tooLong),
      description: optionalText(4000),
      quantity: z.coerce.number({ message: m.enterQuantity }).gt(0, m.quantityPositive).max(MAX_QUANTITY, m.tooLarge),
      quantity_unit: z.enum(QUANTITY_UNITS, { message: m.chooseUnit }),
      price_per_unit: optionalNumber.pipe(z.number().min(0, m.priceNegative).max(MAX_PRICE, m.tooLarge).optional()),
      currency: z.string().trim().length(3).toUpperCase().default("MMK"),
      city: z.string({ message: m.chooseCity }).trim().min(1, m.chooseCity).max(100),
      township: optionalText(100),
      address_description: optionalText(500),
      latitude: optionalNumber.pipe(z.number().min(-90).max(90).optional()),
      longitude: optionalNumber.pipe(z.number().min(-180).max(180).optional()),
    })
    .superRefine((data, ctx) => {
      // FOR_SALE needs a price; FREE / WANTED store none.
      if (data.listing_type === "FOR_SALE" && data.price_per_unit == null) {
        ctx.addIssue({ code: "custom", path: ["price_per_unit"], message: m.priceRequired })
      }
      // Coordinates come as a pair or not at all.
      if ((data.latitude == null) !== (data.longitude == null)) {
        ctx.addIssue({ code: "custom", path: ["latitude"], message: m.bothCoords })
      }
    })
    .transform((data) => ({
      ...data,
      price_per_unit: data.listing_type === "FOR_SALE" ? (data.price_per_unit ?? null) : null,
    }))
}

export function requestSchema(m: Messages) {
  const { optionalText } = helpers(m)
  return z.object({
    listing_id: z.coerce.number().int().positive(),
    requested_quantity: z.coerce
      .number({ message: m.enterQuantity })
      .gt(0, m.quantityPositive)
      .max(MAX_QUANTITY, m.tooLarge),
    message: optionalText(1000),
  })
}

export function wasteReportSchema(m: Messages) {
  const { optionalText, optionalNumber } = helpers(m)
  return z
    .object({
      category_id: z.coerce.number({ message: m.chooseCategory }).int().positive(m.chooseCategory),
      title: z.string().trim().min(5, m.titleMin).max(180, m.tooLong),
      description: optionalText(4000),
      estimated_quantity: optionalNumber.pipe(
        z.number().gt(0, m.estimatePositive).max(MAX_QUANTITY, m.tooLarge).optional(),
      ),
      quantity_unit: z.preprocess(emptyToUndefined, z.enum(QUANTITY_UNITS).optional()),
      city: z.string({ message: m.chooseCity }).trim().min(1, m.chooseCity).max(100),
      township: optionalText(100),
      address_description: optionalText(500),
      latitude: z.preprocess(emptyToUndefined, z.coerce.number({ message: m.pickOnMap }).min(-90).max(90)),
      longitude: z.preprocess(emptyToUndefined, z.coerce.number({ message: m.pickOnMap }).min(-180).max(180)),
    })
    .superRefine((data, ctx) => {
      if (data.estimated_quantity != null && !data.quantity_unit) {
        ctx.addIssue({ code: "custom", path: ["quantity_unit"], message: m.chooseUnit })
      }
    })
}

export function loginSchema(a: Dictionary["auth"]) {
  return z.object({
    email: z.string().trim().toLowerCase().email(a.emailInvalid),
    password: z.string().min(6, a.passwordMin),
  })
}

export function registerSchema(a: Dictionary["auth"], m: Messages) {
  const { optionalText } = helpers(m)
  return z
    .object({
      full_name: z.string().trim().min(2, a.nameMin).max(150, m.tooLong),
      email: z.string().trim().toLowerCase().email(a.emailInvalid).max(255),
      password: z.string().min(6, a.passwordMin),
      account_type: z.enum(USER_ACCOUNT_TYPES).default("INDIVIDUAL"),
      city: optionalText(100),
      township: optionalText(100),
      telegram: optionalText(255),
      phone: optionalText(255),
    })
    .superRefine((data, ctx) => {
      if (!data.telegram && !data.phone) {
        ctx.addIssue({ code: "custom", path: ["telegram"], message: a.contactRequired })
      }
    })
}

/** Reads FormData into a plain object of string values. */
export function formDataToObject(formData: FormData) {
  const obj: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") obj[key] = value
  }
  return obj
}
