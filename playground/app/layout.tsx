import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import type * as React from "react"

import "./globals.css"
import { Providers } from "./providers"

export const metadata = { title: "sebs7n-ui playground" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
