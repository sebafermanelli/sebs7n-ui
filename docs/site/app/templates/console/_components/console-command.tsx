"use client"

import dynamic from "next/dynamic"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"


// La paleta no hace falta para pintar la pantalla: se pide la primera vez que se abre y queda montada.
const ConsoleCommandDialog = dynamic(() => import("./console-command-dialog"), { ssr: false })

const CommandContext = createContext<{ open: () => void } | null>(null)

export function useConsoleCommand() {
  const context = useContext(CommandContext)
  if (!context) throw new Error("useConsoleCommand necesita <ConsoleCommandProvider>")
  return context
}

// Los atajos globales de la consola: ir a una sección o cambiar de proyecto. El atajo lo registra la app.
export function ConsoleCommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [used, setUsed] = useState(false)

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
    }),
    []
  )

  return (
    <CommandContext.Provider value={value}>
      {children}
      {used && <ConsoleCommandDialog onOpenChange={setOpen} open={open} />}
    </CommandContext.Provider>
  )
}
