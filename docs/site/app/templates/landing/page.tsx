import type { Metadata } from "next"

import { Clients } from "./_components/clients"
import { Faq } from "./_components/faq"
import { Features } from "./_components/features"
import { FinalCta } from "./_components/final-cta"
import { Hero } from "./_components/hero"
import { LandingFooter } from "./_components/landing-footer"
import { LandingNavbar } from "./_components/landing-navbar"
import { Pricing } from "./_components/pricing"
import { ProductDemo } from "./_components/product-demo"
import { Stats } from "./_components/stats"
import { Testimonials } from "./_components/testimonials"
import { PRODUCT } from "./_data/content"

export const metadata: Metadata = {
  title: PRODUCT.name,
  description: PRODUCT.subtitle,
}

// Sobre el wallpaper (`bg-ambient` + `data-ambient`): la barra y las cards pasan solas al material
// translúcido. Server Components: al abrir solo hay JS en los precios; el menú, el carrusel, el tema y el
// formulario de ventas llegan diferidos.
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-ambient" data-ambient="" id="top">
      <LandingNavbar />
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-20 px-4 pb-20 md:gap-24 md:px-6 md:pb-24">
        <Hero />
        <Clients />
        <Features />
        <ProductDemo />
        <Stats />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
