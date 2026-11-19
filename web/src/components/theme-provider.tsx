"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * next-themes renders an inline <script> that sets the theme class before
 * first paint. React warns in development when a <script> is rendered on the
 * client, so (as the Next.js "preventing flash before hydration" guide
 * recommends) the script runs as JavaScript on the server render only.
 */
const scriptProps = {
  type: typeof window === "undefined" ? "text/javascript" : "text/plain",
  suppressHydrationWarning: true,
} as const

export function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider scriptProps={scriptProps} {...props} />
}
