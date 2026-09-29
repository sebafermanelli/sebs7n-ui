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
      {/* Lisa, como las apps de iCloud: el wallpaper (`bg-ambient`) es opcional y lo prende el
          Playground (glass-config lo pone en el body). Con la clase acá, la página arrancaba con el
          wallpaper y lo sacaba al hidratar. */}
      <body>
        {/* El header propio vive en el home; /docs usa el AppShell del paquete. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
