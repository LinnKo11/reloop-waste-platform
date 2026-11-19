import { Recycle } from "lucide-react"
import type { Metadata } from "next"
import { connection } from "next/server"

import { RegisterForm } from "@/components/auth/auth-forms"
import { PageContainer } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.auth.registerTitle }
}

export default async function RegisterPage() {
  await connection()
  const { t } = await getI18n()

  return (
    <PageContainer className="flex max-w-xl flex-col py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Recycle className="size-5" />
          </span>
          <CardTitle className="text-xl">{t.auth.registerTitle}</CardTitle>
          <CardDescription>{t.auth.registerSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
