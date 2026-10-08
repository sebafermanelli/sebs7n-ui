"use client"

import { CheckIcon } from "lucide-react"
import { Badge } from "sebs7n-ui/badge"
import { ScrollStory } from "sebs7n-ui/scroll-story"
import { WindowFrame } from "sebs7n-ui/window-frame"

const STEPS = [
  { label: "Cargar", title: "Cargá la factura", description: "Desde un PDF o a mano, con los datos del cliente." },
  { label: "Revisar", title: "Revisala con tu equipo", description: "Cada cambio queda en el historial." },
  { label: "Emitir", title: "Emitila y envíala", description: "Tu cliente la recibe al instante." },
]

/**
 * Un recorrido que avanza al bajar
 * La lista numerada a la izquierda y el escenario a la derecha. En un teléfono, en una ventana baja o con movimiento reducido, los tres pasos apilados.
 */
export function Basic() {
  return (
    <div className="w-full">
      <ScrollStory aria-label="De la factura cargada a la emitida" offset="0px" stepLength="55svh" steps={STEPS}>
        {({ step }) => (
          <WindowFrame title="Factura F-0012">
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-headline text-label">Estudio Norte</p>
                <Badge color={step === 2 ? "green" : step === 1 ? "blue" : "gray"}>{STEPS[step]?.label}</Badge>
              </div>
              <p className="text-callout text-label-secondary">$ 145.200 · vence el 30/11</p>
              <ul className="flex list-none flex-col gap-2 p-0 text-callout text-label">
                {["Revisada por Administración", "Emitida y enviada"].map((text, index) => (
                  <li className="flex items-center gap-2" key={text}>
                    <span className="grid size-5 place-items-center rounded-full bg-fill-2">
                      <CheckIcon
                        aria-hidden="true"
                        className="size-3.5 text-green-900 transition-transform duration-300 ease-out-expo motion-reduce:transition-none"
                        style={{ transform: `scale(${step > index ? 1 : 0})` }}
                      />
                    </span>
                    <span className={step > index ? "font-semibold" : "text-label-secondary"}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </WindowFrame>
        )}
      </ScrollStory>
    </div>
  )
}
