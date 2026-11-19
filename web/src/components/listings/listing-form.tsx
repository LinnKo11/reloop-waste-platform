"use client"

import { Gift, HandCoins, Loader2, Search, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { startTransition, useActionState, useState } from "react"

import { Field, FormSection } from "@/components/forms/field"
import { LocationFields } from "@/components/forms/location-fields"
import { LocationPicker } from "@/components/map/location-picker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { initialActionState } from "@/lib/action-state"
import { createListingAction } from "@/lib/actions"
import { DEFAULT_MAP_CENTER, LOCATIONS } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import { LISTING_TYPES, QUANTITY_UNITS, type ListingType, type MaterialCategory, type QuantityUnit } from "@/lib/types"
import { cn } from "@/lib/utils"

const typeIcons: Record<ListingType, React.ComponentType<{ className?: string }>> = {
  FOR_SALE: HandCoins,
  FREE: Gift,
  WANTED: Search,
}

export function ListingForm({
  categories,
  defaultCity,
  defaultTownship,
  defaultType,
}: {
  categories: MaterialCategory[]
  defaultCity: string
  defaultTownship: string
  defaultType: ListingType
}) {
  const { t, f } = useI18n()
  const [state, formAction, pending] = useActionState(createListingAction, initialActionState)
  const [type, setType] = useState<ListingType>(defaultType)
  const [categoryId, setCategoryId] = useState("")
  const [unit, setUnit] = useState<QuantityUnit>("KG")
  const [city, setCity] = useState(defaultCity)
  const [township, setTownship] = useState(defaultTownship)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const errors = state.fieldErrors
  const tf = t.listingForm

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        // Submitting manually keeps the inputs as typed if validation fails.
        startTransition(() => formAction(formData))
      }}
    >
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>{tf.couldNotPost}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <FormSection title={tf.whatPosting} description={tf.whatPostingSub}>
        <input type="hidden" name="listing_type" value={type} />
        <div role="radiogroup" aria-label={tf.typeLabel} className="grid gap-3 sm:grid-cols-3">
          {LISTING_TYPES.map((option) => {
            const Icon = typeIcons[option]
            const active = option === type
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setType(option)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition hover:border-primary/50",
                  active && "border-primary bg-accent ring-2 ring-primary/20",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md bg-muted",
                    active && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="font-medium">{t.enums.listingType[option].label}</span>
                <span className="text-xs text-muted-foreground">{t.enums.listingType[option].description}</span>
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection title={tf.material}>
        <Field label={tf.category} htmlFor="category_id" required error={errors?.category_id?.[0]}>
          <Select name="category_id" value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category_id" className="w-full sm:w-72" aria-invalid={!!errors?.category_id}>
              <SelectValue placeholder={tf.chooseCategory} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {f.category(c.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={tf.title} htmlFor="title" required error={errors?.title?.[0]}>
          <Input
            id="title"
            name="title"
            maxLength={180}
            aria-invalid={!!errors?.title}
            placeholder={type === "WANTED" ? tf.titlePlaceholderWanted : tf.titlePlaceholder}
          />
        </Field>
        <Field label={tf.description} htmlFor="description" hint={tf.descriptionHint} error={errors?.description?.[0]}>
          <Textarea id="description" name="description" rows={4} maxLength={4000} />
        </Field>
      </FormSection>

      <FormSection
        title={type === "FOR_SALE" ? tf.qtyAndPrice : tf.quantitySection}
        description={type === "WANTED" ? tf.qtyWantedSub : tf.qtyHaveSub}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field label={tf.quantity} htmlFor="quantity" required error={errors?.quantity?.[0]}>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              aria-invalid={!!errors?.quantity}
              placeholder="0"
            />
          </Field>
          <Field label={tf.unit} htmlFor="quantity_unit" required>
            <Select name="quantity_unit" value={unit} onValueChange={(v) => setUnit(v as QuantityUnit)}>
              <SelectTrigger id="quantity_unit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITY_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {t.enums.unit[u].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        {type === "FOR_SALE" && (
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <Field
              label={tf.pricePerUnit}
              htmlFor="price_per_unit"
              required
              error={errors?.price_per_unit?.[0]}
              hint={f.t(tf.priceHint, { unit: t.enums.unit[unit].label })}
            >
              <div className="relative">
                <Input
                  id="price_per_unit"
                  name="price_per_unit"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  aria-invalid={!!errors?.price_per_unit}
                  className="pr-28"
                  placeholder="0"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                  {t.enums.currency.MMK} / {t.enums.unit[unit].short}
                </span>
              </div>
            </Field>
            <input type="hidden" name="currency" value="MMK" />
          </div>
        )}
      </FormSection>

      <FormSection title={tf.location} description={tf.locationSub}>
        <LocationFields
          city={city}
          township={township}
          onCityChange={(c) => {
            setCity(c)
            setTownship("")
          }}
          onTownshipChange={setTownship}
          errors={errors}
        />
        <Field label={tf.mapPin}>
          <LocationPicker
            value={position}
            onChange={setPosition}
            center={LOCATIONS[city]?.center ?? DEFAULT_MAP_CENTER}
            error={errors?.latitude?.[0]}
          />
        </Field>
      </FormSection>

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" type="button">
          <Link href="/listings">{t.common.cancel}</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {tf.publish}
        </Button>
      </div>
    </form>
  )
}
