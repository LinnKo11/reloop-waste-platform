import {
  CircleDot,
  Construction,
  Cpu,
  Leaf,
  Milk,
  Package,
  Recycle,
  Shirt,
  TreePine,
  Wine,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryStyle {
  icon: LucideIcon
  /** Soft gradient background for placeholders. */
  surface: string
  /** Icon / text colour. */
  ink: string
}

const styles: Record<string, CategoryStyle> = {
  Plastic: {
    icon: Milk,
    surface: "from-sky-100 to-cyan-50 dark:from-sky-950/60 dark:to-cyan-950/30",
    ink: "text-sky-600 dark:text-sky-400",
  },
  "Paper & Cardboard": {
    icon: Package,
    surface: "from-amber-100 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/30",
    ink: "text-amber-700 dark:text-amber-400",
  },
  Metal: {
    icon: Wrench,
    surface: "from-slate-200 to-zinc-100 dark:from-slate-800/70 dark:to-zinc-900/40",
    ink: "text-slate-600 dark:text-slate-300",
  },
  Glass: {
    icon: Wine,
    surface: "from-teal-100 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/30",
    ink: "text-teal-600 dark:text-teal-400",
  },
  "E-waste": {
    icon: Cpu,
    surface: "from-violet-100 to-indigo-50 dark:from-violet-950/60 dark:to-indigo-950/30",
    ink: "text-violet-600 dark:text-violet-400",
  },
  Organic: {
    icon: Leaf,
    surface: "from-lime-100 to-green-50 dark:from-lime-950/60 dark:to-green-950/30",
    ink: "text-lime-700 dark:text-lime-400",
  },
  Textile: {
    icon: Shirt,
    surface: "from-pink-100 to-rose-50 dark:from-pink-950/60 dark:to-rose-950/30",
    ink: "text-pink-600 dark:text-pink-400",
  },
  "Rubber & Tyres": {
    icon: CircleDot,
    surface: "from-stone-200 to-neutral-100 dark:from-stone-800/70 dark:to-neutral-900/40",
    ink: "text-stone-700 dark:text-stone-300",
  },
  Wood: {
    icon: TreePine,
    surface: "from-yellow-100 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/30",
    ink: "text-yellow-800 dark:text-yellow-500",
  },
  "Construction Debris": {
    icon: Construction,
    surface: "from-orange-100 to-red-50 dark:from-orange-950/60 dark:to-red-950/30",
    ink: "text-orange-700 dark:text-orange-400",
  },
}

const fallback: CategoryStyle = {
  icon: Recycle,
  surface: "from-emerald-100 to-green-50 dark:from-emerald-950/60 dark:to-green-950/30",
  ink: "text-emerald-700 dark:text-emerald-400",
}

export function getCategoryStyle(name: string): CategoryStyle {
  return styles[name] ?? fallback
}

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const { icon: Icon, ink } = getCategoryStyle(name)
  return <Icon className={cn(ink, className)} aria-hidden />
}

/**
 * Image area for a listing / report / suggestion. Shows the first uploaded
 * image when there is one, otherwise a category-coloured placeholder.
 */
export function MaterialVisual({
  categoryName,
  imageUrl,
  alt,
  className,
  iconClassName,
}: {
  categoryName: string
  imageUrl?: string | null
  alt: string
  className?: string
  iconClassName?: string
}) {
  const { icon: Icon, surface, ink } = getCategoryStyle(categoryName)

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs come from object storage
      <img src={imageUrl} alt={alt} className={cn("object-cover", className)} />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-linear-to-br",
        surface,
        className,
      )}
    >
      <Icon className={cn("size-12 opacity-80", ink, iconClassName)} aria-hidden />
      <Icon
        className={cn("absolute -right-6 -bottom-6 size-32 rotate-12 opacity-[0.07]", ink)}
        aria-hidden
      />
    </div>
  )
}
