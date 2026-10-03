"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useKeySequence } from "sebs7n-ui/lib/use-key-sequence"
import { ShortcutsDialog } from "sebs7n-ui/shortcuts-dialog"

import { navigationSequences, SHORTCUTS } from "../_lib/shortcuts"

// La paleta no hace falta para pintar la pantalla: se pide la primera vez que se abre y queda montada.
const DashboardCommandDialog = dynamic(() => import("./dashboard-command-dialog"), { ssr: false })

const CommandContext = createContext<{ open: () => void; openShortcuts: () => void } | null>(null)

export function useDashboardCommand() {
  const context = useContext(CommandContext)
  if (!context) throw new Error("useDashboardCommand necesita <DashboardCommandProvider>")
  return context
}

// La paleta vive una vez en el layout; el sidebar solo la abre. Los atajos los registra la app, no el paquete.
export function DashboardCommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [used, setUsed] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const router = useRouter()
  const openShortcuts = useCallback(() => setShortcuts(true), [])

  // `g` + letra y `?`: lo de teclado de la app vive en un solo lugar, junto con ⌘K.
  useKeySequence({ "?": openShortcuts, ...navigationSequences((href) => router.push(href)) })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      // En la fase de captura y cortando la propagación: en el sitio, ⌘K también lo escucha el buscador
      // de la documentación, y con los dos se abrirían dos paletas. En una app copiada no cambia nada.
      event.stopImmediatePropagation()
      setUsed(true)
      setOpen((previous) => !previous)
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [])

  const value = useMemo(
    () => ({
      open: () => {
        setUsed(true)
        setOpen(true)
      },
      openShortcuts,
    }),
    [openShortcuts]
  )

  return (
    <CommandContext.Provider value={value}>
      {children}
      {used && <DashboardCommandDialog onOpenChange={setOpen} onOpenShortcuts={openShortcuts} open={open} />}
      <ShortcutsDialog
        description="Para ir más rápido sin soltar el teclado. «g» y la letra se tipean en secuencia."
        onOpenChange={setShortcuts}
        open={shortcuts}
        shortcuts={SHORTCUTS}
      />
    </CommandContext.Provider>
  )
}
