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
import { updateReportStatusAction } from "@/lib/actions"
import { reportStatusColor } from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import { WASTE_REPORT_STATUSES, type WasteReportStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ReportStatusControl({
  reportId,
  status,
  className,
}: {
  reportId: number
  status: WasteReportStatus
  className?: string
}) {
  const [pending, startTransition] = useTransition()
  const { t, f } = useI18n()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={status}
        disabled={pending}
        onValueChange={(next) =>
          startTransition(async () => {
            const result = await updateReportStatusAction(reportId, next as WasteReportStatus)
            if (result.ok) toast.success(result.message)
            else toast.error(result.message)
          })
        }
      >
        <SelectTrigger size="sm" className="w-40" aria-label={f.t(t.report.statusOf, { id: reportId })}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WASTE_REPORT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              <span className="size-2 rounded-full" style={{ background: reportStatusColor[s] }} />
              {t.enums.reportStatus[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
    </div>
  )
}
