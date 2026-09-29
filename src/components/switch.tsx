"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn, type WithClassName } from "../lib/utils.js"

type SwitchProps = WithClassName<SwitchPrimitive.Root.Props> & {
  size?: "sm" | "md"
  /**
   * `default` y `accent` prenden con el brand: desde 1.0 son lo mismo, y `accent` queda para
   * no romper a quien ya lo escribía. `neutral` prende en `gray-1000`, para una pantalla donde
   * el brand ya está en la acción principal y un interruptor más de color compite con ella.
   */
  variant?: "default" | "accent" | "neutral"
}

function Switch({ className, size = "md", variant = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/switch peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-control after:absolute after:-inset-2 pointer-coarse:after:-inset-3.5",
        "data-[size=md]:h-5 data-[size=md]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        // La pista apagada tiene que distinguirse del fondo (WCAG 1.4.11) Y del pulgar blanco que
        // lleva adentro: el lado donde está el pulgar es lo que dice si está prendido o apagado.
        // `gray-400` fallaba en los dos frentes (1,20:1 contra la superficie en claro y 1,20:1
        // contra el pulgar: la pista y el pulgar eran el mismo blanco). `gray-700` (#8f8f8f en los
        // dos temas) es el punto medio que pasa por los dos lados: 3,23:1 contra el blanco en
        // claro, 6,12:1 contra el negro en oscuro, y 3,23:1 contra el pulgar en los dos.
        "bg-gray-700 hover:bg-gray-800",
        // El foco va por fuera de la pista: el anillo interior del acento sobre `gray-700` daba
        // ~1,3:1, y sobre la pista prendida habría que invertirlo. Afuera queda sobre la página,
        // donde el acento llega a 3:1 (test/contrast.test.ts), prendido o apagado.
        "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(color:--sf-focus)",
        "data-checked:bg-brand-700 data-checked:hover:bg-brand-800",
        "data-[variant=neutral]:data-checked:bg-label data-[variant=neutral]:data-checked:hover:bg-button-primary-hover",
        "aria-invalid:ring-1 aria-invalid:ring-red-800 data-invalid:ring-1 data-invalid:ring-red-800",
        // Apagado a .4, como todo control de iCloud: se sigue viendo si estaba prendido.
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-tooltip transition-thumb",
          // Apretado, el pulgar se estira: es la respuesta al toque.
          "group-active/switch:scale-x-125 group-active/switch:scale-y-110",
          "group-data-[size=md]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "data-checked:bg-brand-contrast group-data-[variant=neutral]/switch:data-checked:bg-surface",
          "group-data-[size=md]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3",
          "group-data-disabled/switch:scale-100"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, type SwitchProps }
