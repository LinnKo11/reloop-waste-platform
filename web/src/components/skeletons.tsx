import { PageContainer } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  )
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <Skeleton className="aspect-16/10 w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GridPageSkeleton() {
  return (
    <PageContainer>
      <PageHeaderSkeleton />
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-36" />
      </div>
      <CardGridSkeleton />
    </PageContainer>
  )
}

export function DetailPageSkeleton() {
  return (
    <PageContainer>
      <PageHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </PageContainer>
  )
}

export function FormPageSkeleton() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </PageContainer>
  )
}
