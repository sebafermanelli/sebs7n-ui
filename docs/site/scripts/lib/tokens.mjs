// Las tablas de tokens salen de los archivos del paquete, no de una copia a mano:
// tokens/geist.json para la paleta, src/styles/theme.css para las superficies, la tipografía,
// las sombras y los radios, src/styles/reset.css para la escala de radios de la app. Si cambia un valor, cambia la página.
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
  // Primero los semánticos de theme.css, que son los que usan los componentes; después
  // la escala de reset.css, que queda para el código de la app.
  const css = ["theme", "reset"].map((file) => readFileSync(join(root, `src/styles/${file}.css`), "utf8")).join("\n")
  return [...css.matchAll(/--radius-([a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => ({ name, value: value.trim() }))
}

/** Las superficies de iCloud (2.0) con su rol y su valor claro y oscuro, leídos de theme.css. */
export function readBackgrounds(root) {
  const theme = readFileSync(join(root, "src/styles/theme.css"), "utf8")
  const values = (variable) => [...theme.matchAll(new RegExp(`--sf-${variable}:\\s*([^;]+);`, "g"))].map(([, value]) => value.trim())
  return [
    ["background", "background", "La página. `body` (ya lo pone el paquete), el contenido de una lista o de un detalle."],
    ["surface", "surface", "Lo que flota: menú, popover, diálogo, hoja, toast, el cuerpo de una Card."],
    ["surface-secondary", "surface-secondary", "La columna del `Sidebar` y el panel de `SplitViewSidebar`."],
    ["surface-bar", "surface-bar", "La `Toolbar` de una app y la franja de `CardHeader`."],
    ["surface-header", "surface-header", "La barra global: `Navbar`, `AppShell header`, la barra del teléfono."],
    ["grouped", "group", "Un grupo plano: `Card variant=\"subtle\"`, `EmptyState`."],
    ["fill-1", "fill-1", "Relleno neutro: campos, activo del Sidebar, Toggle suelto."],
    ["fill-2", "fill-2", "Hover y resaltado de un menú, `secondary`, pista del segmentado."],
    ["fill-3", "fill-3", "Apretado; la línea base de las pestañas."],
  ].map(([token, variable, rol]) => {
    const [light, dark] = values(variable)
    return { token: `bg-${token}`, rol, light, dark }
  })
}

export function readShadows(root) {
  const css = readFileSync(join(root, "src/styles/theme.css"), "utf8")
  const uso = {
    menu: "DropdownMenu, ContextMenu, Menubar, Select, Combobox, Popover, HoverCard, Command, el toast. `0 11px 34px` con el filo de 1 px.",
    modal: "Dialog, AlertDialog, Sheet, Drawer: la misma que el menú.",
    tooltip: "Tooltip y la etiqueta del AiLauncher.",
    widget: "La Card (el widget de iCloud) y `WidgetCard`.",
    segment: "El segmento activo del segmentado (Tabs, ThemeSwitcher, ToggleGroup).",
    badge: "`Badge variant=\"count\"`.",
    thumbnail: "El filo de una miniatura: `FileGrid`, el chip del total de `StackedMeter`.",
    card: "Plana (sin sombra): queda para la app.",
    "card-hover": "Card `interactive` al pasar el puntero.",
  }
  return Object.entries(uso).map(([name, text]) => ({ name: `shadow-${name}`, uso: text, presente: css.includes(`--sf-shadow-${name}:`) }))
}
