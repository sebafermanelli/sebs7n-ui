"use client"

import type * as React from "react"
import { useSyncExternalStore } from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { segmentedThumbClassName, segmentedTrackClassName } from "../variants/segmented.js"

/**
 * Los textos viven una sola vez, en `sebs7n-ui/labels`. Acá queda el alias para
 * que el tipo público siga llamándose igual y nadie tenga que cambiar un import.
 */
type ThemeSwitcherLabels = Labels["themeSwitcher"]

type ThemeSwitcherProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  labels?: Partial<ThemeSwitcherLabels>
}

const OPTIONS = [
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
  { value: "system", Icon: MonitorIcon },
] as const

// La misma pista que `Tabs`, con íconos en vez de texto.
const groupClassName = cn(segmentedTrackClassName, "inline-flex")
// La opción elegida no se pinta: la marca la pastilla, que llega deslizándose. Lo único que
// cambia en el ítem es el color del ícono.
const itemClassName =
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
function Pastilla({ index }: { index: number }) {
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
function useThemeOptions() {
  const { theme, setTheme, themes } = useTheme()
  const hasSystem = themes.includes("system")
  const options = hasSystem ? OPTIONS : OPTIONS.filter((option) => option.value !== "system")
  const actual = theme ?? (hasSystem ? "system" : "")
  return { theme: actual, setTheme, options, index: options.findIndex((option) => option.value === actual) }
}

const noopSubscribe = () => () => {}

// true solo en el cliente, sin setState en un efecto: en SSR no se marca ninguna opción
// (el servidor no conoce el tema) y así no hay hydration mismatch.
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

// Teclas que el radiogroup maneja y que un Menu de Base UI también escucha (navegación y typeahead).
// Se frenan acá para que las flechas muevan el tema y no el foco del menú.
function stopMenuKeys(event: React.KeyboardEvent) {
  if (event.key !== "Escape" && event.key !== "Tab") event.stopPropagation()
}

// Control segmentado Claro/Oscuro/Sistema (como el de Vercel), para usar fuera de un menú.
// Dentro de un DropdownMenuContent usá <ThemeMenuRadio> (lo hace UserMenu).
function ThemeSwitcher({ className, labels: labelsProp, onKeyDown, ...props }: ThemeSwitcherProps) {
  const { theme, setTheme, options, index } = useThemeOptions()
  const mounted = useMounted()
  const labels = { ...useLabels().themeSwitcher, ...labelsProp }

  return (
    <div
      data-slot="theme-switcher"
      onKeyDown={(event) => {
        stopMenuKeys(event)
        onKeyDown?.(event)
      }}
      className={cn("inline-flex", className)}
      {...props}
    >
      <RadioGroupPrimitive
        aria-label={labels.group}
        value={mounted ? theme : ""}
        // El `value` de Base UI es `unknown` porque un RadioGroup acepta cualquier valor; acá
        // los tres son los strings de `options`, así que el cast dice lo que el tipo no sabe.
        onValueChange={(value) => setTheme(value as string)}
        className={groupClassName}
      >
        {options.map(({ value, Icon }) => (
          <RadioPrimitive.Root
            key={value}
            value={value}
            aria-label={labels[value]}
            nativeButton
            render={<button type="button" />}
            data-slot="theme-switcher-item"
            className={itemClassName}
          >
            <Icon aria-hidden="true" />
          </RadioPrimitive.Root>
        ))}
        <Pastilla index={mounted ? index : -1} />
      </RadioGroupPrimitive>
    </div>
  )
}

type ThemeMenuRadioProps = Omit<MenuPrimitive.RadioGroup.Props, "className" | "value" | "onValueChange" | "children"> & {
  className?: string
  labels?: Partial<ThemeSwitcherLabels>
}

// El mismo control segmentado, pero hecho de Menu.RadioItem para vivir dentro de un DropdownMenuContent:
// las flechas lo recorren como al resto de los ítems (menuitemradio, ARIA válido) y elegir no cierra el menú.
function ThemeMenuRadio({ className, labels: labelsProp, ...props }: ThemeMenuRadioProps) {
  const { theme, setTheme, options, index } = useThemeOptions()
  const mounted = useMounted()
  const labels = { ...useLabels().themeSwitcher, ...labelsProp }

  return (
    <MenuPrimitive.RadioGroup
      data-slot="theme-menu-radio"
      aria-label={labels.group}
      value={mounted ? theme : ""}
      // Mismo caso que en ThemeSwitcher: `value` es `unknown` y los tres valores posibles
      // son los strings de `options`.
      onValueChange={(value) => setTheme(value as string)}
      className={cn(groupClassName, className)}
      {...props}
    >
      {options.map(({ value, Icon }) => (
        <MenuPrimitive.RadioItem
          key={value}
          value={value}
          aria-label={labels[value]}
          data-slot="theme-menu-radio-item"
          className={cn(itemClassName, "data-highlighted:text-gray-1000")}
        >
          <Icon aria-hidden="true" />
        </MenuPrimitive.RadioItem>
      ))}
      <Pastilla index={mounted ? index : -1} />
    </MenuPrimitive.RadioGroup>
  )
}

export { ThemeMenuRadio, ThemeSwitcher, type ThemeMenuRadioProps, type ThemeSwitcherLabels, type ThemeSwitcherProps }
