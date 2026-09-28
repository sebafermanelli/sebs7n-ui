"use client"

import type * as React from "react"
import { useSyncExternalStore } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "../lib/utils.js"
import { segmentedThumbClassName, segmentedTrackClassName } from "../variants/segmented.js"

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
// cambia en el ítem es el color del ícono.
export const itemClassName =
  "inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring data-checked:text-gray-1000 [&_svg]:pointer-events-none [&_svg]:size-4"

/**
 * La pastilla que se desliza hasta el tema elegido.
 *
 * Las opciones miden todas lo mismo —28px, con 2px entre una y otra—, así que la posición es
 * el índice por 30px y no hay que medir nada: un `translate` por CSS, sin efecto ni
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
      className={cn(segmentedThumbClassName, "top-0.5 left-0.5 size-7 translate-x-[calc(var(--index)*--spacing(7.5))]")}
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
