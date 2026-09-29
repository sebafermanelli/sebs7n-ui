import type { Metadata } from "next"
import { Inter } from "next/font/google"

import site from "@/.generated/site.json"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(site.site),
  title: { default: "sebs7n-ui", template: "%s · sebs7n-ui" },
  description: site.blurb,
  openGraph: { title: "sebs7n-ui", description: site.blurb, type: "website", locale: "es_AR" },
}

// Inter variable con la variable que lee `--font-sans` del paquete.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable} lang="es" suppressHydrationWarning>
      {/* Lisa, como las apps de iCloud. El wallpaper (`bg-ambient` + `data-ambient`) lo lleva la home
          en su contenedor y el Playground en su `AppShell ambient` (`_lib/wallpaper.ts`). */}
      <body>
        {/* El header propio vive en el home; /docs usa el AppShell del paquete. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
