import type { ShortcutItem } from "sebs7n-ui/shortcuts-dialog"

import { CUSTOMERS_PATH, DASHBOARD_PATH, INVOICES_PATH, SETTINGS_PATH } from "./routes"

/** Un atajo de la hoja y, si navega, adónde. Es la única lista: la hoja, ⌘K y el hook de teclas la leen. */
export interface DashboardShortcut extends ShortcutItem {
  href?: string
}

export const SHORTCUTS: DashboardShortcut[] = [
  { keys: ["⌘", "K"], label: "Buscar y ejecutar comandos" },
  { keys: ["⌘", "J"], label: "Preguntar a la IA (abrir o cerrar el panel)" },
  { keys: ["?"], label: "Ver los atajos" },
  { keys: ["g", "i"], label: "Ir a Inicio", sequence: true, href: DASHBOARD_PATH },
  { keys: ["g", "f"], label: "Ir a Facturas", sequence: true, href: INVOICES_PATH },
  { keys: ["g", "c"], label: "Ir a Clientes", sequence: true, href: CUSTOMERS_PATH },
  { keys: ["g", "s"], label: "Ir a Configuración", sequence: true, href: SETTINGS_PATH },
]

/** El mapa de `useKeySequence`: «g f» → navegar a Facturas. */
export function navigationSequences(go: (href: string) => void): Record<string, () => void> {
  const map: Record<string, () => void> = {}
  for (const shortcut of SHORTCUTS) {
    const href = shortcut.href
    if (href) map[shortcut.keys.join(" ")] = () => go(href)
  }
  return map
}

/** «g luego f» para las secciones que tienen atajo, para el detalle de cada ítem de ⌘K. */
export function shortcutOf(href: string) {
  const shortcut = SHORTCUTS.find((item) => item.href === href)
  return shortcut ? shortcut.keys.join(" luego ") : undefined
}
