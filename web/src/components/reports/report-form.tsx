"use client"

import { Loader2, TriangleAlert } from "lucide-react"
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
import { createWasteReportAction } from "@/lib/actions"
import { DEFAULT_MAP_CENTER, LOCATIONS } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import { QUANTITY_UNITS, type MaterialCategory } from "@/lib/types"

export function ReportForm({
  categories,
  defaultCity,
  defaultTownship,
}: {
  categories: MaterialCategory[]
  defaultCity: string
  defaultTownship: string
}) {
  const { t, f } = useI18n()
  const [state, formAction, pending] = useActionState(createWasteReportAction, initialActionState)
  const [categoryId, setCategoryId] = useState("")
  const [unit, setUnit] = useState("")
  const [city, setCity] = useState(defaultCity)
  const [township, setTownship] = useState(defaultTownship)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const errors = state.fieldErrors
  const tr = t.reportForm

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
      }}
    >
      {state.message && !state.ok && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>{tr.couldNotSubmit}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <FormSection title={tr.whereTitle} description={tr.whereSub}>
        <LocationPicker
          value={position}
          onChange={setPosition}
          center={LOCATIONS[city]?.center ?? DEFAULT_MAP_CENTER}
          required
          error={errors?.latitude?.[0] ?? errors?.longitude?.[0]}
        />
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
      </FormSection>

      <FormSection title={tr.whatTitle}>
        <Field label={tr.wasteType} htmlFor="category_id" required error={errors?.category_id?.[0]}>
          <Select name="category_id" value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category_id" className="w-full sm:w-72" aria-invalid={!!errors?.category_id}>
              <SelectValue placeholder={tr.chooseType} />
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
        <Field label={tr.shortTitle} htmlFor="title" required error={errors?.title?.[0]}>
          <Input id="title" name="title" maxLength={180} aria-invalid={!!errors?.title} placeholder={tr.titlePlaceholder} />
        </Field>
        <Field label={tr.details} htmlFor="description" hint={tr.detailsHint} error={errors?.description?.[0]}>
          <Textarea id="description" name="description" rows={4} maxLength={4000} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field
            label={tr.estimatedAmount}
            htmlFor="estimated_quantity"
            hint={tr.estimatedHint}
            error={errors?.estimated_quantity?.[0]}
          >
            <Input
              id="estimated_quantity"
              name="estimated_quantity"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              aria-invalid={!!errors?.estimated_quantity}
            />
          </Field>
          <Field label={tr.unit} htmlFor="quantity_unit" error={errors?.quantity_unit?.[0]}>
            <Select name="quantity_unit" value={unit} onValueChange={setUnit}>
              <SelectTrigger id="quantity_unit" className="w-full" aria-invalid={!!errors?.quantity_unit}>
                <SelectValue placeholder={tr.unit} />
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
        <p className="text-xs text-muted-foreground">{tr.photoSoon}</p>
      </FormSection>

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" type="button">
          <Link href="/map">{t.common.cancel}</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {tr.submit}
        </Button>
      </div>
    </form>
  )
}
