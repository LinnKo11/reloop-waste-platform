"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CITIES, LOCATIONS } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"

import { Field } from "./field"

export function LocationFields({
  city,
  township,
  onCityChange,
  onTownshipChange,
  errors,
}: {
  city: string
  township: string
  onCityChange: (city: string) => void
  onTownshipChange: (township: string) => void
  errors?: Record<string, string[] | undefined>
}) {
  const { t, f } = useI18n()
  const townships = LOCATIONS[city]?.townships ?? []

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.locationFields.city} htmlFor="city" required error={errors?.city?.[0]}>
          <Select name="city" value={city} onValueChange={onCityChange}>
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder={t.locationFields.chooseCity} />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {f.city(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.locationFields.township} htmlFor="township" error={errors?.township?.[0]}>
          <Select name="township" value={township} onValueChange={onTownshipChange} disabled={!townships.length}>
            <SelectTrigger id="township" className="w-full">
              <SelectValue placeholder={t.locationFields.chooseTownship} />
            </SelectTrigger>
            <SelectContent>
              {townships.map((tw) => (
                <SelectItem key={tw} value={tw}>
                  {tw}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field
        label={t.locationFields.address}
        htmlFor="address_description"
        hint={t.locationFields.addressHint}
        error={errors?.address_description?.[0]}
      >
        <Input
          id="address_description"
          name="address_description"
          maxLength={500}
          placeholder={t.locationFields.addressPlaceholder}
        />
      </Field>
    </>
  )
}
