"use client"

import { Loader2, Send } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { initialActionState, type ActionState } from "@/lib/action-state"
import { createRequestAction } from "@/lib/actions"
import { useI18n } from "@/lib/i18n/client"
import type { ListingType, QuantityUnit } from "@/lib/types"

export function RequestDialog({
  listingId,
  listingTitle,
  listingType,
  maxQuantity,
  unit,
  ownerName,
}: {
  listingId: number
  listingTitle: string
  listingType: ListingType
  maxQuantity: number
  unit: QuantityUnit
  ownerName: string
}) {
  const { t, f } = useI18n()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ActionState>(initialActionState)
  const [pending, startTransition] = useTransition()
  const action = t.enums.listingType[listingType].action
  const unitLabel = t.enums.unit[unit].short

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createRequestAction(state, formData)
      setState(result)
      if (result.ok) {
        toast.success(result.message)
        setOpen(false)
      } else if (result.message) {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Send /> {action}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            {f.t(listingType === "WANTED" ? t.requests.descWanted : t.requests.descOther, {
              owner: ownerName,
              title: listingTitle,
            })}{" "}
            {t.requests.contactsAfter}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit(new FormData(e.currentTarget))
          }}
        >
          <input type="hidden" name="listing_id" value={listingId} />
          <Field
            label={listingType === "WANTED" ? t.requests.qtyOffer : t.requests.qtyWant}
            htmlFor="requested_quantity"
            required
            hint={f.t(t.requests.upTo, { max: f.number(maxQuantity), unit: unitLabel })}
            error={state.fieldErrors?.requested_quantity?.[0]}
          >
            <div className="relative">
              <Input
                id="requested_quantity"
                name="requested_quantity"
                type="number"
                inputMode="decimal"
                min="0"
                max={maxQuantity}
                step="0.001"
                defaultValue={listingType === "WANTED" ? undefined : maxQuantity}
                className="pr-16"
                aria-invalid={!!state.fieldErrors?.requested_quantity}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                {unitLabel}
              </span>
            </div>
          </Field>
          <Field label={t.requests.message} htmlFor="message" hint={t.requests.messageHint}>
            <Textarea
              id="message"
              name="message"
              rows={4}
              maxLength={1000}
              placeholder={t.requests.messagePlaceholder}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {t.requests.send}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
