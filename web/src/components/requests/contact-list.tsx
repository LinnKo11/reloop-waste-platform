import { Lock, Mail, Phone, Send } from "lucide-react"

import { contactHref } from "@/lib/constants"
import { getI18n } from "@/lib/i18n/server"
import type { ContactType, UserContact } from "@/lib/types"
import { cn } from "@/lib/utils"

const icons: Record<ContactType, React.ComponentType<{ className?: string }>> = {
  TELEGRAM: Send,
  PHONE: Phone,
  EMAIL: Mail,
}

export async function ContactList({
  contacts,
  name,
  className,
}: {
  contacts: UserContact[]
  name: string
  className?: string
}) {
  const { t, f } = await getI18n()
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-emerald-600/20 bg-emerald-500/5 p-3", className)}>
      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{f.t(t.requests.contact, { name })}</p>
      {contacts.length ? (
        <ul className="flex flex-col gap-1.5">
          {contacts.map((c) => {
            const Icon = icons[c.contact_type]
            return (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{t.enums.contactType[c.contact_type]}</span>
                <a
                  href={contactHref[c.contact_type](c.contact_value)}
                  className="truncate font-medium hover:underline"
                  target={c.contact_type === "TELEGRAM" ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {c.contact_value}
                </a>
                {c.is_primary && <span className="text-[10px] text-muted-foreground uppercase">{t.requests.primary}</span>}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t.requests.noContacts}</p>
      )}
    </div>
  )
}

export function LockedContacts({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border border-dashed p-3 text-sm text-muted-foreground", className)}>
      <Lock className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
