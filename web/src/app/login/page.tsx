import { Recycle } from "lucide-react"
import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/auth-forms"
import { PageContainer } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDemoUsers } from "@/lib/data/queries"
import { db } from "@/lib/data/store"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.auth.loginTitle }
}

export default async function LoginPage() {
  const [{ t }, demoUsers] = await Promise.all([getI18n(), getDemoUsers()])
  // Demo helper: emails of a few seeded accounts so reviewers can log in quickly.
  const demoEmails = demoUsers.slice(0, 6).flatMap((u) => {
    const email = db.users.find((x) => x.id === u.id)?.email
    return email ? [{ email, name: u.full_name }] : []
  })
  const admin = db.users.find((u) => u.system_role === "ADMIN")
  if (admin && !demoEmails.some((d) => d.email === admin.email)) {
    demoEmails.push({ email: admin.email, name: admin.full_name })
  }

  return (
    <PageContainer className="flex max-w-md flex-col py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Recycle className="size-5" />
          </span>
          <CardTitle className="text-xl">{t.auth.loginTitle}</CardTitle>
          <CardDescription>{t.auth.loginSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm demoEmails={demoEmails} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
