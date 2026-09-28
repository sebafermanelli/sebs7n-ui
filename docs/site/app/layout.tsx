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
      {/* La luz ambiente viene prendida: el sitio muestra el material, y sobre una página lisa
          el vidrio no tiene nada que desenfocar. El Playground la puede apagar. */}
      <body className="bg-ambient">
        {/* El header propio vive en el home; /docs usa el AppShell del paquete. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
