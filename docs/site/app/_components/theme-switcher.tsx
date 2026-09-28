"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { useLabels } from "sebs7n-ui/lib/labels"
import { cn } from "sebs7n-ui/lib/utils"
import { segmentedTrackClassName } from "sebs7n-ui/variants/segmented"

// El `ThemeSwitcher` del paquete comparte módulo con `ThemeMenuRadio`, y el build no descarta
// ese export aunque nadie lo use: importarlo mete el `Menu` entero de Base UI —con su
// floating-ui, typeahead y navegación por lista— en el arranque de todas las páginas, ~65 KB
// gzip, para un control que no abre ningún menú. Se carga después de hidratar, y mientras tanto
// el HTML lleva `ThemeSwitcherEstatico`: el mismo marcado que el paquete renderiza en el
// servidor, donde todavía no se conoce el tema y no se dibuja la pastilla. Visualmente no cambia
// nada: la pastilla aparece al montar, igual que antes. `test/theme-switcher.test.ts` compara los
// dos HTML para que no se separen si el paquete cambia el suyo.
export const ThemeSwitcher = dynamic(() => import("sebs7n-ui/theme-switcher").then((mod) => mod.ThemeSwitcher), {
  ssr: false,
  loading: () => <ThemeSwitcherEstatico />,
})

const OPCIONES = [
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
  { value: "system", Icon: MonitorIcon },
] as const

// Copiado de `theme-switcher.tsx` del paquete, que no lo exporta.
const itemClassName =
  "inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring data-checked:text-gray-1000 [&_svg]:pointer-events-none [&_svg]:size-4"

/** Lo que el `ThemeSwitcher` del paquete pinta en el servidor: sin opción marcada ni pastilla. */
export function ThemeSwitcherEstatico() {
  const labels = useLabels().themeSwitcher
  return (
    <div className="inline-flex" data-slot="theme-switcher">
      <div aria-label={labels.group} className={cn(segmentedTrackClassName, "inline-flex")} role="radiogroup">
        {OPCIONES.map(({ value, Icon }) => (
          <button
            aria-checked="false"
            aria-label={labels[value]}
            className={itemClassName}
            data-slot="theme-switcher-item"
            data-unchecked=""
            key={value}
            role="radio"
            tabIndex={-1}
            type="button"
          >
            <Icon aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
