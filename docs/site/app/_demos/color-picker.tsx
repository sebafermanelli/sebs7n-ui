"use client"

import { useId, useState } from "react"
import { ColorPicker } from "sebs7n-ui/color-picker"
import { Label } from "sebs7n-ui/label"
import { hexOfOklch, type Oklch } from "sebs7n-ui/lib/contrast"

/**
 * Con recientes
 * El componente muestra la lista, no la guarda. Acá se suma el color al cerrar el panel: elegí uno, cerrá, y volvé a abrir.
 */
export function Recientes() {
  const id = useId()
  const [color, setColor] = useState<Oklch>([0.573, 0.214, 258])
  const [recientes, setRecientes] = useState<Oklch[]>([
    [0.55, 0.16, 35],
    [0.515, 0.099, 183],
    [0.53, 0.13, 162],
  ])
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Color de la etiqueta</Label>
      <ColorPicker
        id={id}
        onOpenChange={(abierto) => {
          if (abierto) return
          // El más nuevo adelante, sin repetidos, y ocho como mucho.
          setRecientes((lista) => [color, ...lista.filter((otro) => hexOfOklch(otro) !== hexOfOklch(color))].slice(0, 8))
        }}
        onValueChange={setColor}
        recent={recientes}
        value={color}
      />
    </div>
  )
}

/**
 * Básico
 * Sin `recent`, la sección no aparece. Con `name`, el color viaja en el formulario como hexadecimal.
 */
export function Basico() {
  const id = useId()
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Color</Label>
      <ColorPicker defaultValue={[0.55, 0.16, 35]} id={id} name="color" />
    </div>
  )
}

/**
 * Tamaños y pie
 * Las mismas tres alturas que `Input`. `footer` recibe el color actual: sirve para una vista previa.
 */
export function TamanosYPie() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <ColorPicker aria-label="Chico" defaultValue={[0.515, 0.099, 183]} size="sm" />
      <ColorPicker
        aria-label="Con vista previa"
        defaultValue={[0.53, 0.13, 162]}
        footer={(color) => (
          <div
            className="flex h-10 items-center justify-center rounded-full text-button-14 text-white sheen"
            style={{ backgroundColor: hexOfOklch(color) }}
          >
            Vista previa
          </div>
        )}
      />
      <ColorPicker aria-label="Grande" defaultValue={[0.55, 0.16, 35]} size="lg" />
      <ColorPicker aria-label="Deshabilitado" disabled />
    </div>
  )
}
