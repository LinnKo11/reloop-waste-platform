"use client"

import { Loader2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateListingStatusAction } from "@/lib/actions"
import { useI18n } from "@/lib/i18n/client"
import { LISTING_STATUSES, type ListingStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ListingStatusControl({
  listingId,
  status,
  size = "default",
  className,
}: {
  listingId: number
  status: ListingStatus
  size?: "sm" | "default"
  className?: string
}) {
  const [pending, startTransition] = useTransition()
  const { t } = useI18n()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={status}
        disabled={pending}
        onValueChange={(next) =>
          startTransition(async () => {
            const result = await updateListingStatusAction(listingId, next as ListingStatus)
            if (result.ok) toast.success(result.message)
            else toast.error(result.message)
          })
        }
      >
        <SelectTrigger size={size} className={size === "sm" ? "w-36" : "w-full"} aria-label={t.listing.statusLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LISTING_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t.enums.listingStatus[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
    </div>
  )
}
