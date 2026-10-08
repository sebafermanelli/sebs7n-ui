"use client"

import { Card, CardContent } from "sebs7n-ui/card"
import { Reveal, RevealGroup } from "sebs7n-ui/reveal"

const ITEMS = [
  ["Emitir", "Una factura lista en dos pasos."],
  ["Enviar", "Tu cliente la recibe por email."],
  ["Cobrar", "El pago se concilia solo."],
]

/**
 * Entrada escalonada
 * Bajá la página: cada bloque sube 16 px y se asienta, uno tras otro. Solo se mueve; el texto nunca baja de opacidad. Con movimiento reducido, quieto.
 */
export function Staggered() {
  return (
    <RevealGroup className="grid w-full gap-4 @lg:grid-cols-3" step={90}>
      {ITEMS.map(([title, text]) => (
        <Card key={title}>
          <CardContent>
            <p className="text-headline text-label">{title}</p>
            <p className="text-callout text-label-secondary">{text}</p>
          </CardContent>
        </Card>
      ))}
    </RevealGroup>
  )
}

/**
 * Una pieza sin texto con fade
 * `fade` suma opacidad: solo para una captura, un marco o una imagen, donde no hay texto que pierda contraste.
 */
export function WithFade() {
  return (
    <Reveal distance={24} fade>
      <div aria-hidden="true" className="h-32 w-full rounded-surface bg-fill-2" />
    </Reveal>
  )
}
