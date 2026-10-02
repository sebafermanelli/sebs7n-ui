import { Card, CardContent } from "sebs7n-ui/card"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { PRODUCT } from "../_data/content"

// El cierre: la misma acción del hero, al final del recorrido. En tu app, `href` es la ruta de registro.
export function FinalCta() {
  return (
    <section className="scroll-mt-20" id="registro">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <h2 className="text-title-1 text-balance text-label">Empezá a cobrar a tiempo hoy</h2>
          <p className="max-w-xl text-body text-label-secondary">14 días gratis, sin tarjeta. Cancelás cuando quieras.</p>
          <a className={buttonVariants({ size: "lg" })} href="#registro">
            {PRODUCT.primaryCta}
          </a>
        </CardContent>
      </Card>
    </section>
  )
}
