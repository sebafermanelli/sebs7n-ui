import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import site from "@/.generated/site.json"
import { SiteHeader } from "./_components/site-header"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(site.site),
  title: { default: "sebs7n-ui", template: "%s · sebs7n-ui" },
  description: site.blurb,
  openGraph: { title: "sebs7n-ui", description: site.blurb, type: "website", locale: "es_AR" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader version={site.version} />
          {children}
        </Providers>
      </body>
    </html>
  )
}
