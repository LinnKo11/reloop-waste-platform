import { Check } from "lucide-react"

import { reportStatusColor } from "@/lib/constants"
import { getI18n } from "@/lib/i18n/server"
import { WASTE_REPORT_STATUSES, type WasteReportStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export async function ReportStatusTimeline({ status }: { status: WasteReportStatus }) {
  const { t, f } = await getI18n()
  const current = WASTE_REPORT_STATUSES.indexOf(status)

  return (
    <ol className="flex flex-col">
      {WASTE_REPORT_STATUSES.map((s, i) => {
        const done = i < current
        const active = i === current
        const meta = t.enums.reportStatus[s]
        return (
          <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
            {i < WASTE_REPORT_STATUSES.length - 1 && (
              <span
                className={cn("absolute top-7 left-3.25 h-[calc(100%-1.5rem)] w-px bg-border", done && "bg-primary")}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-2",
                !done && !active && "text-muted-foreground",
              )}
              style={active ? { borderColor: reportStatusColor[s], color: reportStatusColor[s] } : undefined}
            >
              {done ? <Check className="size-3.5" /> : f.number(i + 1)}
            </span>
            <div className="flex flex-col pt-0.5">
              <span className={cn("text-sm font-medium", !done && !active && "text-muted-foreground")}>{meta.label}</span>
              <span className="text-xs text-muted-foreground">{meta.description}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
