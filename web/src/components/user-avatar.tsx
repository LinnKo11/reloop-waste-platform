import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, initials } from "@/lib/utils"

const palette = [
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
]

export function UserAvatar({
  user,
  className,
}: {
  user: { id: number; full_name: string; profile_image_url?: string | null }
  className?: string
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {user.profile_image_url ? <AvatarImage src={user.profile_image_url} alt="" /> : null}
      <AvatarFallback className={cn("text-xs font-semibold", palette[user.id % palette.length])}>
        {initials(user.full_name)}
      </AvatarFallback>
    </Avatar>
  )
}
