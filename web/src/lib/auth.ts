import "server-only"

import { cookies } from "next/headers"

import { db } from "@/lib/data/store"
import type { User } from "@/lib/types"

/**
 * Mock authentication. There is no login yet: the "current user" is chosen
 * with the demo user switcher in the header and stored in a cookie.
 * Replace with a real session lookup (e.g. Auth.js / Lucia / custom JWT).
 */
export const DEMO_USER_COOKIE = "reloop_demo_user"
export const DEFAULT_DEMO_USER_ID = 1

export type SessionUser = Pick<
  User,
  "id" | "full_name" | "email" | "account_type" | "system_role" | "city" | "township"
>

export async function getCurrentUser(): Promise<SessionUser> {
  const store = await cookies()
  const id = Number(store.get(DEMO_USER_COOKIE)?.value ?? DEFAULT_DEMO_USER_ID)
  const user =
    db.users.find((u) => u.id === id && u.is_active) ??
    db.users.find((u) => u.id === DEFAULT_DEMO_USER_ID)!

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    account_type: user.account_type,
    system_role: user.system_role,
    city: user.city,
    township: user.township,
  }
}

export function isAdmin(user: Pick<User, "system_role">) {
  return user.system_role === "ADMIN"
}
