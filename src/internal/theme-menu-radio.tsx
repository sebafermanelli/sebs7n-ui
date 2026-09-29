"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
// `../internal/` y no `./`: el registry de shadcn (`docs/site/scripts/lib/registry.mjs`) lee
// `./x.js` como un componente de `components/` y reescribe el import a `@/components/ui/x`.
import { groupClassName, itemClassName, Pastilla, useMounted, useThemeOptions } from "../internal/theme-options.js"
import { defined } from "./defined.js"

// `ThemeMenuRadio` vivía en `theme-switcher.tsx`, al lado de `ThemeSwitcher`. Ningún bundler
// descartaba este export aunque nadie lo usara —ni con `sideEffects`, ni sacando el `"use client"`;
// medido con Turbopack en el sitio de docs—, así que cada app que ponía un `ThemeSwitcher`
// cargaba el `Menu` entero de Base UI, con su floating-ui, ~65 KB gzip, para un control que no
// abre ningún menú. En su propio módulo, `theme-switcher.tsx` lo re-exporta y el bundler sí poda
// el re-export que nadie importa. Va en `internal/` porque su subpath público sigue siendo
// `sebs7n-ui/theme-switcher` (y el barrel): un archivo en `components/` sería un subpath nuevo.

type ThemeMenuRadioProps = Omit<MenuPrimitive.RadioGroup.Props, "className" | "value" | "onValueChange" | "children"> & {
  className?: string
  labels?: Partial<Labels["themeSwitcher"]>
}

// El mismo control segmentado, pero hecho de Menu.RadioItem para vivir dentro de un DropdownMenuContent:
// las flechas lo recorren como al resto de los ítems (menuitemradio, ARIA válido) y elegir no cierra el menú.
function ThemeMenuRadio({ className, labels: labelsProp, ...props }: ThemeMenuRadioProps) {
  const { theme, setTheme, options, index } = useThemeOptions()
  const mounted = useMounted()
  const labels = { ...useLabels().themeSwitcher, ...defined(labelsProp) }

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
          className={cn(itemClassName, "data-highlighted:text-label")}
        >
          <Icon aria-hidden="true" />
        </MenuPrimitive.RadioItem>
      ))}
      <Pastilla index={mounted ? index : -1} />
    </MenuPrimitive.RadioGroup>
  )
}

export { ThemeMenuRadio, type ThemeMenuRadioProps }
