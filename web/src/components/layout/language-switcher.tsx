"use client"

import { Check, Languages } from "lucide-react"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setLocaleAction } from "@/lib/actions"
import { useI18n } from "@/lib/i18n/client"
import { LOCALE_LABEL, LOCALES } from "@/lib/i18n/config"

export function LanguageSwitcher() {
  const { locale, t } = useI18n()
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2" disabled={pending} aria-label={t.nav.language}>
          <Languages />
          <span className="text-xs font-medium">{locale === "my" ? "မြန်မာ" : "EN"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs font-normal">{t.nav.language}</DropdownMenuLabel>
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            lang={l}
            onSelect={() => startTransition(async () => void (await setLocaleAction(l)))}
          >
            {LOCALE_LABEL[l]}
            {l === locale && <Check className="ml-auto text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
