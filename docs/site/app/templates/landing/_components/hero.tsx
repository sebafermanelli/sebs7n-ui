import { buttonVariants } from "sebs7n-ui/variants/button"

import { CTA_HREF, PRODUCT } from "../_data/content"

// El único `<h1>` y la única acción primaria de la primera pantalla.
export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 py-20 text-center md:py-28">
      <h1 className="max-w-3xl text-large-title text-balance text-label">{PRODUCT.title}</h1>
      <p className="max-w-2xl text-body text-pretty text-label-secondary">{PRODUCT.subtitle}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a className={buttonVariants({ size: "lg" })} href={CTA_HREF}>
          {PRODUCT.primaryCta}
        </a>
        <a className={buttonVariants({ variant: "secondary", size: "lg" })} href="#beneficios">
          {PRODUCT.secondaryCta}
        </a>
      </div>
    </section>
  )
}
