"use client"

import type * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { groupClassName, itemClassName, Pastilla, stopMenuKeys, useMounted, useThemeOptions } from "../internal/theme-options.js"

/**
 * Los textos viven una sola vez, en `sebs7n-ui/labels`. Acá queda el alias para
 * que el tipo público siga llamándose igual y nadie tenga que cambiar un import.
 */
type ThemeSwitcherLabels = Labels["themeSwitcher"]

type ThemeSwitcherProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  labels?: Partial<ThemeSwitcherLabels>
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

// `ThemeMenuRadio` sigue saliendo por este subpath, como siempre: vive en su propio módulo para
// que quien importa solo `ThemeSwitcher` no cargue el `Menu` de Base UI.
export { ThemeMenuRadio, type ThemeMenuRadioProps } from "../internal/theme-menu-radio.js"
export { ThemeSwitcher, type ThemeSwitcherLabels, type ThemeSwitcherProps }
