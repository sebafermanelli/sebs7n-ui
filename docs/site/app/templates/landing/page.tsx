import type { Metadata } from "next"

import { Clients } from "./_components/clients"
import { Faq } from "./_components/faq"
import { Features } from "./_components/features"
import { FinalCta } from "./_components/final-cta"
import { Hero } from "./_components/hero"
import { LandingFooter } from "./_components/landing-footer"
import { LandingNavbar } from "./_components/landing-navbar"
import { Pricing } from "./_components/pricing"
import { Testimonials } from "./_components/testimonials"
import { PRODUCT } from "./_data/content"

export const metadata: Metadata = {
  title: PRODUCT.name,
  description: PRODUCT.subtitle,
}

// Sobre el wallpaper (`bg-ambient` + `data-ambient`): la barra y las cards pasan solas al material
// translúcido. Server Component: el único JS propio es el toggle de precios.
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-ambient" data-ambient="">
      <LandingNavbar />
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-24 px-4 pb-24 md:px-6">
        <Hero />
        <Clients />
        <Features />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
