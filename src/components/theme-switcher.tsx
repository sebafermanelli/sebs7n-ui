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

const groupClassName = "inline-flex items-center gap-0.5 rounded-full border border-gray-alpha-400 bg-background-100 p-0.5 shadow-card"
const itemClassName =
  "inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring data-checked:bg-gray-200 data-checked:text-gray-1000 data-checked:shadow-card [&_svg]:pointer-events-none [&_svg]:size-4"

// Sin enableSystem en el ThemeProvider, next-themes no incluye "system" en themes: no se ofrece.
function useThemeOptions() {
  const { theme, setTheme, themes } = useTheme()
  const hasSystem = themes.includes("system")
  const options = hasSystem ? OPTIONS : OPTIONS.filter((option) => option.value !== "system")
  return { theme: theme ?? (hasSystem ? "system" : ""), setTheme, options }
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
  const { theme, setTheme, options } = useThemeOptions()
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
  const { theme, setTheme, options } = useThemeOptions()
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
    </MenuPrimitive.RadioGroup>
  )
}

export { ThemeMenuRadio, ThemeSwitcher, type ThemeMenuRadioProps, type ThemeSwitcherLabels, type ThemeSwitcherProps }
