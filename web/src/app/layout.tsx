import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_Myanmar } from "next/font/google"
import { Suspense } from "react"

import { AppShellFallback, LocaleRoot } from "@/components/layout/locale-root"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig } from "@/lib/constants"

import "./globals.css"

const sans = Geist({ variable: "--font-geist", subsets: ["latin"] })
const myanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
})
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Waste exchange & environmental mapping`,
    template: `%s · ${siteConfig.name}`,
  },
  description: "Buy, sell, give away and find recyclable materials — and map illegal dumping in Myanmar.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${myanmar.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {/* The language comes from a cookie, so the shell streams in at request time. */}
            <Suspense fallback={<AppShellFallback />}>
              <LocaleRoot>{children}</LocaleRoot>
            </Suspense>
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
