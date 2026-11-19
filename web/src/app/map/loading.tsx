import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="grid border-b lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="order-2 flex flex-col gap-4 border-r p-4 lg:order-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <Skeleton className="order-1 h-[55vh] rounded-none lg:order-2 lg:h-full" />
    </div>
  )
}
