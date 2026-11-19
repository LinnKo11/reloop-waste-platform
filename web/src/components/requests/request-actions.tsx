"use client"

import { Check, CheckCheck, Loader2, X } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ActionState } from "@/lib/action-state"
import {
  cancelRequestAction,
  completeRequestAction,
  respondToRequestAction,
} from "@/lib/actions"
import { useI18n } from "@/lib/i18n/client"
import type { MaterialRequestStatus } from "@/lib/types"

export function RequestActions({
  requestId,
  status,
  role,
}: {
  requestId: number
  status: MaterialRequestStatus
  role: "owner" | "requester"
}) {
  const [pending, startTransition] = useTransition()
  const { t } = useI18n()

  function run(action: () => Promise<ActionState>) {
    startTransition(async () => {
      const result = await action()
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  if (role === "owner" && status === "PENDING") {
    return (
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={() => run(() => respondToRequestAction(requestId, "ACCEPTED"))}>
          {pending ? <Loader2 className="animate-spin" /> : <Check />} {t.requests.accept}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => respondToRequestAction(requestId, "REJECTED"))}
        >
          <X /> {t.requests.reject}
        </Button>
      </div>
    )
  }

  if (role === "owner" && status === "ACCEPTED") {
    return (
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => completeRequestAction(requestId))}>
        {pending ? <Loader2 className="animate-spin" /> : <CheckCheck />} {t.requests.markCompleted}
      </Button>
    )
  }

  if (role === "requester" && (status === "PENDING" || status === "ACCEPTED")) {
    return (
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => cancelRequestAction(requestId))}>
        {pending ? <Loader2 className="animate-spin" /> : <X />} {t.requests.cancelRequest}
      </Button>
    )
  }

  return null
}
