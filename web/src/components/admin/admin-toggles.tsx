"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import type { ActionState } from "@/lib/action-state"
import {
  toggleCategoryActiveAction,
  toggleSuggestionPublishedAction,
  toggleUserActiveAction,
} from "@/lib/actions"
import { useI18n } from "@/lib/i18n/client"

function ActionSwitch({
  checked,
  label,
  disabled,
  action,
}: {
  checked: boolean
  label: string
  disabled?: boolean
  action: () => Promise<ActionState>
}) {
  const [pending, startTransition] = useTransition()
  return (
    <Switch
      checked={checked}
      disabled={disabled || pending}
      aria-label={label}
      onCheckedChange={() =>
        startTransition(async () => {
          const result = await action()
          if (result.ok) toast.success(result.message)
          else toast.error(result.message)
        })
      }
    />
  )
}

export function UserActiveSwitch({ userId, active, isSelf }: { userId: number; active: boolean; isSelf: boolean }) {
  const { t } = useI18n()
  return (
    <ActionSwitch
      checked={active}
      disabled={isSelf}
      label={active ? t.admin.deactivateUser : t.admin.reactivateUser}
      action={() => toggleUserActiveAction(userId)}
    />
  )
}

export function CategoryActiveSwitch({ categoryId, active }: { categoryId: number; active: boolean }) {
  const { t } = useI18n()
  return (
    <ActionSwitch
      checked={active}
      label={active ? t.admin.disableCategory : t.admin.enableCategory}
      action={() => toggleCategoryActiveAction(categoryId)}
    />
  )
}

export function SuggestionPublishedSwitch({ suggestionId, published }: { suggestionId: number; published: boolean }) {
  const { t } = useI18n()
  return (
    <ActionSwitch
      checked={published}
      label={published ? t.admin.unpublishIdea : t.admin.publishIdea}
      action={() => toggleSuggestionPublishedAction(suggestionId)}
    />
  )
}
