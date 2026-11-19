"use client"

import { Check, ChevronDown, Inbox, LayoutDashboard, LogIn, ShieldCheck, UserPlus, UserRound } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"

import { AccountTypeBadge } from "@/components/status-badges"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"
import { switchDemoUserAction } from "@/lib/actions"
import type { SessionUser } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/client"
import type { PublicUser } from "@/lib/types"

export function UserMenuClient({ user, demoUsers }: { user: SessionUser; demoUsers: PublicUser[] }) {
  const [pending, startTransition] = useTransition()
  const { t } = useI18n()

  function switchTo(id: number) {
    startTransition(async () => {
      const result = await switchDemoUserAction(id)
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5" disabled={pending} aria-label={t.nav.accountMenu}>
          <UserAvatar user={user} className="size-7" />
          <span className="hidden max-w-32 truncate text-sm xl:inline">{user.full_name}</span>
          <ChevronDown className="hidden size-3.5 text-muted-foreground xl:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1.5 py-2">
          <span className="truncate text-sm font-semibold text-foreground">{user.full_name}</span>
          <span className="flex items-center gap-1.5">
            <AccountTypeBadge type={user.account_type} />
            {user.system_role === "ADMIN" && <span className="text-xs font-medium text-primary">{t.nav.admin}</span>}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/users/${user.id}`}>
              <UserRound /> {t.nav.publicProfile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard /> {t.nav.dashboard}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard?tab=incoming">
              <Inbox /> {t.nav.requests}
            </Link>
          </DropdownMenuItem>
          {user.system_role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck /> {t.nav.adminConsole}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogIn /> {t.nav.login}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/register">
              <UserPlus /> {t.nav.register}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t.nav.switchDemoUser}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-96 w-64 overflow-y-auto">
            <DropdownMenuLabel className="text-xs font-normal">{t.nav.demoUserHint}</DropdownMenuLabel>
            {demoUsers.map((u) => (
              <DropdownMenuItem key={u.id} onSelect={() => switchTo(u.id)} className="gap-2">
                <UserAvatar user={u} className="size-6" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{u.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {u.system_role === "ADMIN" ? t.nav.admin : t.enums.accountType[u.account_type]}
                  </span>
                </span>
                {u.id === user.id && <Check className="text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
