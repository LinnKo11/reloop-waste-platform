import { getCurrentUser } from "@/lib/auth"
import { getDemoUsers } from "@/lib/data/queries"

import { UserMenuClient } from "./user-menu-client"

export async function UserMenu() {
  const [user, demoUsers] = await Promise.all([getCurrentUser(), getDemoUsers()])
  return <UserMenuClient user={user} demoUsers={demoUsers} />
}
