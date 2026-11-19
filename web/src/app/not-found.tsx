import { SearchX } from "lucide-react"
import Link from "next/link"

import { EmptyState, PageContainer } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { getI18n } from "@/lib/i18n/server"

export default async function NotFound() {
  const { t } = await getI18n()
  return (
    <PageContainer className="py-20">
      <EmptyState
        icon={SearchX}
        title={t.notFound.title}
        description={t.notFound.body}
        action={
          <Button asChild>
            <Link href="/">{t.common.backHome}</Link>
          </Button>
        }
      />
    </PageContainer>
  )
}
