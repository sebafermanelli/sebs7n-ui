"use client"

import type * as React from "react"
import { useSyncExternalStore } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "../lib/utils.js"
import { segmentedThumbClassName, segmentedTrackClassName } from "../variants/segmented.js"
// Con `../internal/` y no `./`: el registry lee `./x.js` como un componente.
import { segmentedHitAreaClassName } from "../internal/segmented-hit-area.js"

// Lo que comparten `ThemeSwitcher` y `ThemeMenuRadio`: las opciones, las clases, la pastilla y
// los hooks. Vive acá y no en ninguno de los dos para que importar uno no arrastre al otro; ver
// el comentario de `theme-menu-radio.tsx`.

export const OPTIONS = [
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
  { value: "system", Icon: MonitorIcon },
] as const

// La misma pista que `Tabs`, con íconos en vez de texto.
export const groupClassName = cn(segmentedTrackClassName, "inline-flex")
// La opción elegida no se pinta: la marca la pastilla, que llega deslizándose. Lo único que
// cambia en el ítem es el color del ícono. Segmentos de 24 × 32 pegados, como el de Calendar
// (§2.10), con el separador de 1 × 16 entre los que no tocan al elegido. Con el dedo se ven igual
// (como el botón de ícono de al lado) y el área crece a 44 de alto, invisible.
export const itemClassName =
  "relative inline-flex h-6 w-8 cursor-pointer items-center justify-center rounded-[calc(var(--radius-control)-2px)] text-label-secondary outline-none transition-control hover:text-label focus-visible:focus-ring data-checked:text-label [&_svg]:pointer-events-none [&_svg]:size-4 " +
  "after:absolute after:left-0 after:top-1 after:h-4 after:w-px after:bg-fill-3 first:after:hidden data-checked:after:hidden [[data-checked]+&]:after:hidden " +
  segmentedHitAreaClassName

/**
 * La pastilla que se desliza hasta el tema elegido.
 *
 * Las opciones miden todas lo mismo —32 px, pegadas—, así que la posición es
 * el índice por 32 px (también con el dedo) y no hay que medir nada: un `translate` por CSS, sin efecto ni
 * `ResizeObserver`.
 *
 * No se dibuja hasta conocer el tema. En el servidor no se sabe cuál es, y si la pastilla
 * naciera en la primera opción, al hidratar se la vería viajar hasta la correcta: un
 * movimiento que nadie pidió, en cada carga de página. Como nace ya en su lugar, la primera
 * vez aparece y recién después se desliza.
 */
export function Pastilla({ index }: { index: number }) {
  if (index < 0) return null
  return (
    <span
      aria-hidden="true"
      data-slot="theme-switcher-indicator"
      className={cn(
        segmentedThumbClassName,
        "top-0.5 left-0.5 h-6 w-8 translate-x-[calc(var(--index)*--spacing(8))]"
      )}
      style={{ "--index": index } as React.CSSProperties}
    />
  )
}

// Sin enableSystem en el ThemeProvider, next-themes no incluye "system" en themes: no se ofrece.
export function useThemeOptions() {
  const { theme, setTheme, themes } = useTheme()
  const hasSystem = themes.includes("system")
  const options = hasSystem ? OPTIONS : OPTIONS.filter((option) => option.value !== "system")
  const actual = theme ?? (hasSystem ? "system" : "")
  return { theme: actual, setTheme, options, index: options.findIndex((option) => option.value === actual) }
}

const noopSubscribe = () => () => {}

// true solo en el cliente, sin setState en un efecto: en SSR no se marca ninguna opción
// (el servidor no conoce el tema) y así no hay hydration mismatch.
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

// Teclas que el radiogroup maneja y que un Menu de Base UI también escucha (navegación y typeahead).
// Se frenan acá para que las flechas muevan el tema y no el foco del menú.
export function stopMenuKeys(event: React.KeyboardEvent) {
  if (event.key !== "Escape" && event.key !== "Tab") event.stopPropagation()
}
