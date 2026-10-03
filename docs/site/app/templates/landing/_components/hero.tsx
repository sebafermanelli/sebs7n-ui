import { buttonVariants } from "sebs7n-ui/variants/button"

import { CTA_HREF, PRODUCT } from "../_data/content"

// El único `<h1>` y la única acción primaria de la primera pantalla. Los dos botones miden lo mismo en el
// teléfono (ancho entero, hasta 20 rem) y van lado a lado desde `sm`. Sin relleno de más abajo: los logos
// siguen al hero con la separación normal entre secciones.
export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 pt-12 text-center md:pt-20">
      <h1 className="max-w-3xl text-large-title text-balance text-label">{PRODUCT.title}</h1>
      <p className="max-w-2xl text-body text-pretty text-label-secondary">{PRODUCT.subtitle}</p>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
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
