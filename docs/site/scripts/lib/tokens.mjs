// Las tablas de tokens salen de los archivos del paquete, no de una copia a mano:
// tokens/geist.json para el color, src/styles/theme.css para la tipografía y las
// sombras, src/styles/reset.css para los radios. Si cambia un valor, cambia la página.
import { readFileSync } from "node:fs"
import { join } from "node:path"

export function readColors(root) {
  const tokens = JSON.parse(readFileSync(join(root, "tokens/geist.json"), "utf8"))
  const groups = Object.keys(tokens.light)
  return {
    groups,
    steps: (group) => Object.keys(tokens.light[group]),
    value: (theme, group, step) => tokens[theme][group][step],
    light: tokens.light,
    dark: tokens.dark,
  }
}

/** `@utility text-heading-20 { font-size: 20px; … }` → { name, size, leading, weight, tracking, mono } */
export function readTypography(root) {
  const css = readFileSync(join(root, "src/styles/theme.css"), "utf8")
  const out = []
  for (const [, name, body] of css.matchAll(/@utility (text-[a-z0-9-]+)\s*\{([^}]*)\}/g)) {
    const get = (prop) => body.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1].trim() ?? ""
    out.push({
      name,
      size: get("font-size"),
      leading: get("line-height"),
      weight: get("font-weight"),
      tracking: get("letter-spacing") || "0",
      mono: get("font-family").includes("mono"),
    })
  }
  return out
}

export function readRadii(root) {
  const css = readFileSync(join(root, "src/styles/reset.css"), "utf8")
  return [...css.matchAll(/--radius-([a-z0-9]+):\s*([^;]+);/g)].map(([, name, value]) => ({ name, value: value.trim() }))
}

/** Los tres fondos con su rol y sus valores por tema. */
export function readBackgrounds(root) {
  const colors = readColors(root)
  const theme = readFileSync(join(root, "src/styles/theme.css"), "utf8")
  const page = [...theme.matchAll(/--sf-background:\s*([^;]+);/g)].map(([, value]) => value.trim())
  return [
    {
      token: "bg-background",
      rol: "La página. `body` (ya lo pone el paquete) y la raíz del `AppShell`.",
      light: page[0],
      dark: page[1],
    },
    {
      token: "bg-background-100",
      rol: "La superficie: lo que flota sobre la página. Input, Select, Textarea, popup de menú, Popover, Dialog, Sheet, Card, Alert, Toast, barra mobile del shell.",
      light: colors.light.background["100"],
      dark: colors.dark.background["100"],
    },
    {
      token: "bg-background-200",
      rol: "El fondo sutil / banda: Sidebar, `thead`/`tfoot` de Table, `Card variant=\"subtle\"`, `EmptyState`.",
      light: colors.light.background["200"],
      dark: colors.dark.background["200"],
    },
  ]
}

export function readShadows(root) {
  const css = readFileSync(join(root, "src/styles/theme.css"), "utf8")
  return ["tooltip", "menu", "modal", "card", "card-hover", "button", "button-inverted", "track"].map((name) => ({
    name: `shadow-${name}`,
    uso: {
      tooltip: "Tooltip.",
      menu: "DropdownMenu, Select, Combobox, Popover, el tooltip de un Chart.",
      modal: "Dialog, AlertDialog, Sheet.",
      card: "Lo que flota en reposo: Card `default`, Button `outline` y `secondary`, los controles de formulario, Toggle, Kbd, Toolbar, ThemeSwitcher, Alert, Table, SidebarSearch y la barra mobile del AppShell.",
      "card-hover": "Card `interactive` al pasar el puntero: sube un pixel y la sombra crece.",
      button: "Lo sólido de color que se aprieta: Button `accent` y `destructive`. Filo claro arriba, 1px abajo.",
      "button-inverted": "Lo sólido en gray-1000: Button `default`, Checkbox y Radio marcados. En claro es el mismo filo claro; en oscuro (superficie blanca) el filo es gris.",
      track: "Lo hundido: la pista de Switch, Slider, Progress y Meter, y la Card `subtle`. Sombra interior de 1px.",
    }[name],
    presente: css.includes(`--sf-shadow-${name}:`),
  }))
}
