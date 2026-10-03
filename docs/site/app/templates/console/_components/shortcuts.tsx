"use client"

import { useRouter } from "next/navigation"
import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { useKeySequence } from "sebs7n-ui/lib/use-key-sequence"
import { ShortcutsDialog, type ShortcutItem } from "sebs7n-ui/shortcuts-dialog"

import { ALERTS_PATH, CONSOLE_PATH, COSTS_PATH, DEPLOYMENTS_PATH, LOGS_PATH, RESOURCES_PATH, VARIABLES_PATH } from "../_lib/routes"

/** Ir a: `g` y, enseguida, la letra. Lo usa el listener, la hoja de atajos y ⌘K. */
export const GO_SHORTCUTS = [
  { key: "s", label: "Servicios", href: CONSOLE_PATH },
  { key: "r", label: "Recursos", href: RESOURCES_PATH },
  { key: "d", label: "Despliegues", href: DEPLOYMENTS_PATH },
  { key: "l", label: "Logs en vivo", href: LOGS_PATH },
  { key: "v", label: "Variables de entorno", href: VARIABLES_PATH },
  { key: "a", label: "Alertas y mantenimiento", href: ALERTS_PATH },
  { key: "c", label: "Estado y costos", href: COSTS_PATH },
] as const

/** Una sola lista alimenta la hoja y el mapa del hook: nunca se desfasan. */
export const SHORTCUTS: ShortcutItem[] = [
  { keys: ["⌘", "K"], label: "Buscar y ejecutar acciones" },
  { keys: ["⌘", "J"], label: "Preguntar a la IA (abrir o cerrar el panel)" },
  { keys: ["?"], label: "Mostrar esta hoja" },
  ...GO_SHORTCUTS.map<ShortcutItem>((shortcut) => ({ keys: ["g", shortcut.key], label: `Ir a ${shortcut.label}`, sequence: true })),
]

const ShortcutsContext = createContext<{ open: () => void } | null>(null)

export function useShortcuts() {
  const context = useContext(ShortcutsContext)
  if (!context) throw new Error("useShortcuts necesita <ShortcutsProvider>")
  return context
}

// Los atajos de la app los registra la app, en el layout: el componente no escucha teclas globales.
export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useKeySequence({
    "?": () => setOpen((previous) => !previous),
    ...Object.fromEntries(GO_SHORTCUTS.map((shortcut) => [`g ${shortcut.key}`, () => router.push(shortcut.href)])),
  })

  const value = useMemo(() => ({ open: () => setOpen(true) }), [])

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <ShortcutsDialog description="Funcionan en toda la consola, menos mientras escribís en un campo." onOpenChange={setOpen} open={open} shortcuts={SHORTCUTS} />
    </ShortcutsContext.Provider>
  )
}
