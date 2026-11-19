import {
  ArrowRight,
  Eye,
  FileText,
  HandHeart,
  Leaf,
  Lightbulb,
  Link2Off,
  MapPinned,
  Recycle,
  Sprout,
  Store,
  Users,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageContainer } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.about.title }
}

export default async function AboutPage() {
  const { t } = await getI18n()
  const a = t.about

  const problems = [
    { icon: Link2Off, title: a.problem1Title, body: a.problem1Body },
    { icon: MapPinned, title: a.problem2Title, body: a.problem2Body },
    { icon: Lightbulb, title: a.problem3Title, body: a.problem3Body },
  ]
  const solutions = [
    { icon: Store, title: a.solution1Title, body: a.solution1Body, href: "/listings" },
    { icon: MapPinned, title: a.solution2Title, body: a.solution2Body, href: "/map" },
    { icon: Recycle, title: a.solution3Title, body: a.solution3Body, href: "/suggestions" },
  ]
  const impacts = [
    { icon: Leaf, label: a.impact1 },
    { icon: Recycle, label: a.impact2 },
    { icon: Eye, label: a.impact3 },
    { icon: Sprout, label: a.impact4 },
    { icon: Users, label: a.impact5 },
  ]

  return (
    <>
      <section className="border-b bg-linear-to-b from-accent/70 to-background">
        <PageContainer className="flex flex-col items-center gap-5 py-16 text-center lg:py-20">
          <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">{a.eyebrow}</span>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{a.heading}</h1>
          <span className="h-1 w-24 rounded-full bg-primary" aria-hidden />
          <p className="text-lg font-medium text-primary">{a.tagline}</p>
          <p className="max-w-2xl text-pretty text-muted-foreground">{a.intro}</p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-3.5 shrink-0" /> {a.basedOn}
          </p>
        </PageContainer>
      </section>

      <PageContainer className="flex flex-col gap-14 py-14">
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight">{a.problemTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {problems.map((p) => (
              <div key={p.title} className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
                <span className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                  <p.icon className="size-5" />
                </span>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight">{a.solutionTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {solutions.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <s.icon className="size-5" />
                </span>
                <h3 className="font-semibold group-hover:text-primary">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
                <ArrowRight className="mt-auto size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight">{a.impactTitle}</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {impacts.map((i) => (
              <li key={i.label} className="flex flex-col items-start gap-3 rounded-xl bg-muted/50 p-4">
                <i.icon className="size-5 text-primary" />
                <span className="text-sm font-medium">{i.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-center gap-3 rounded-2xl bg-primary/5 px-6 py-10 text-center ring-1 ring-primary/15">
          <HandHeart className="size-7 text-primary" />
          <p className="max-w-2xl text-xl font-semibold text-balance text-primary">
            {a.visionA}
            <br />
            {a.visionB}
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-dashed p-6">
          <h2 className="font-semibold">{a.scopeTitle}</h2>
          <p className="text-sm text-muted-foreground">{a.scopeBody}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/listings">{t.home.browseMarketplace}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/reports/new">{t.nav.reportWaste}</Link>
            </Button>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
