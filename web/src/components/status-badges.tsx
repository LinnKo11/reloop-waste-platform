"use client"

import {
  accountTypeTone,
  listingStatusTone,
  listingTypeTone,
  methodTone,
  reportStatusTone,
  requestStatusTone,
  toneClasses,
  type Tone,
} from "@/lib/constants"
import { useI18n } from "@/lib/i18n/client"
import type {
  ListingStatus,
  ListingType,
  MaterialRequestStatus,
  SuggestionMethod,
  UserAccountType,
  WasteReportStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"

export function Pill({ tone, className, children }: { tone: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const Dot = () => <span className="size-1.5 rounded-full bg-current" aria-hidden />

export function ListingTypeBadge({ type, className }: { type: ListingType; className?: string }) {
  const { t } = useI18n()
  return (
    <Pill tone={listingTypeTone[type]} className={className}>
      {t.enums.listingType[type].label}
    </Pill>
  )
}

export function ListingStatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  const { t } = useI18n()
  return (
    <Pill tone={listingStatusTone[status]} className={className}>
      <Dot />
      {t.enums.listingStatus[status]}
    </Pill>
  )
}

export function RequestStatusBadge({ status, className }: { status: MaterialRequestStatus; className?: string }) {
  const { t } = useI18n()
  return (
    <Pill tone={requestStatusTone[status]} className={className}>
      <Dot />
      {t.enums.requestStatus[status]}
    </Pill>
  )
}

export function ReportStatusBadge({ status, className }: { status: WasteReportStatus; className?: string }) {
  const { t } = useI18n()
  return (
    <Pill tone={reportStatusTone[status]} className={className}>
      <Dot />
      {t.enums.reportStatus[status].label}
    </Pill>
  )
}

export function AccountTypeBadge({ type, className }: { type: UserAccountType; className?: string }) {
  const { t } = useI18n()
  return (
    <Pill tone={accountTypeTone[type]} className={className}>
      {t.enums.accountType[type]}
    </Pill>
  )
}

export function MethodBadge({ method, className }: { method: SuggestionMethod; className?: string }) {
  const { t } = useI18n()
  return (
    <Pill tone={methodTone[method]} className={className}>
      {t.enums.method[method]}
    </Pill>
  )
}
