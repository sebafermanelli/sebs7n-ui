"use client"

import { CheckIcon } from "lucide-react"
import { Badge } from "sebs7n-ui/badge"
import { ScrollSequence } from "sebs7n-ui/scroll-sequence"

const STEPS = [{ label: "Borrador" }, { label: "Revisada" }, { label: "Emitida" }]

/**
 * Una factura que se emite al bajar
 * El escenario queda fijo y el scroll maneja el paso: borrador → revisada → emitida, con el tilde al final. Al subir, vuelve. Con movimiento reducido o sin JavaScript, los tres pasos apilados.
 */
export function Basic() {
  return (
    <div className="w-full">
      <ScrollSequence aria-label="Una factura de borrador a emitida" stepLength="60svh" steps={STEPS}>
        {({ step, label }) => (
          <div className="flex h-full items-center justify-center p-4">
            <div className="flex w-full max-w-sm flex-col gap-3 rounded-surface bg-surface p-5 shadow-widget">
              <div className="flex items-center justify-between">
                <p className="text-headline text-label">Factura F-0012</p>
                <Badge color={step === 2 ? "green" : step === 1 ? "blue" : "gray"}>{label}</Badge>
              </div>
              <p className="text-callout text-label-secondary">Estudio Norte · $ 145.200</p>
              {/* Lo que cambia entre pasos se mueve con transform (el tilde crece); el texto nunca baja de
                  opacidad, para no quedar por debajo del contraste mientras aparece. */}
              <ul className="flex list-none flex-col gap-2 text-callout text-label">
                {["Revisada por Administración", "Emitida y enviada al cliente"].map((text, index) => (
                  <li className="flex items-center gap-2" key={text}>
                    <span className="grid size-5 place-items-center rounded-full bg-fill-2">
                      <CheckIcon
                        aria-hidden="true"
                        className="size-3.5 text-green-900 transition-transform duration-300 motion-reduce:transition-none"
                        style={{ transform: `scale(${step > index ? 1 : 0})` }}
                      />
                    </span>
                    <span className={step > index ? "font-semibold" : "text-label-secondary"}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </ScrollSequence>
    </div>
  )
}
