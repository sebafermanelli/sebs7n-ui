import type { Metadata } from "next"
import { Reveal } from "sebs7n-ui/reveal"
import { SkipLink } from "sebs7n-ui/skip-link"

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

// `Reveal`: cada sección sube una vez al entrar y se asienta (solo `transform`, quieta con movimiento reducido).
// Sobre el wallpaper (`bg-ambient` + `data-ambient`): la barra y las cards pasan solas al material
// translúcido. Server Components: al abrir solo hay JS en los precios; el menú, el carrusel, el tema y el
// formulario de ventas llegan diferidos.
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-ambient" data-ambient="" id="top">
      <SkipLink />
      <LandingNavbar />
      <main id="main" className="mx-auto flex w-full max-w-[1080px] flex-col gap-20 px-4 pb-20 md:gap-24 md:px-6 md:pb-24">
        <Hero />
        <Reveal>
          <Clients />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <ProductDemo />
        </Reveal>
        <Reveal>
          <Stats />
        </Reveal>
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <Testimonials />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <FinalCta />
        </Reveal>
      </main>
      <LandingFooter />
    </div>
  )
}
