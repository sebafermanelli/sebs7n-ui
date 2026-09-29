"use client"

import { SearchIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Kbd } from "sebs7n-ui/kbd"
import { cn } from "sebs7n-ui/lib/utils"

// El diálogo y el índice no están en el arranque de ninguna página: se cargan la primera vez que
// alguien abre el buscador. Antes el índice entero viajaba importado en el bundle de cada página.
const SearchDialog = dynamic(() => import("./search-dialog"), { ssr: false })

/** La paleta vive una sola vez en el árbol; el header y el Sidebar solo la abren. */
const SearchContext = createContext<{ abrir: () => void } | null>(null)

export function useSearch() {
  const contexto = useContext(SearchContext)
  if (!contexto) throw new Error("useSearch necesita <SearchProvider>")
  return contexto
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false)
  // Una vez que se abrió por primera vez, el diálogo queda montado: cerrarlo no debe
  // volver a pedir el índice ni desmontar el `dynamic import`.
  const [usado, setUsado] = useState(false)

  const abrir = () => {
    setUsado(true)
    setAbierto(true)
  }

  // El atajo lo registra la app, no el paquete: SidebarSearch solo muestra el Kbd.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setUsado(true)
      setAbierto((previo) => !previo)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const valor = useMemo(() => ({ abrir }), [])

  return (
    <SearchContext.Provider value={valor}>
      {children}
      {usado && (
        <SearchDialog
          onOpenChange={(next) => {
            if (next) setUsado(true)
            setAbierto(next)
          }}
          open={abierto}
        />
      )}
    </SearchContext.Provider>
  )
}

/**
 * El disparador de la paleta con forma de botón: el header del home y la barra mobile del shell.
 * Dentro del Sidebar se usa `SidebarSearch` del paquete, que ya tiene la forma correcta.
 */
export function SearchButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { abrir } = useSearch()
  return (
    // El search field de iCloud (catálogo §2.13): relleno `fill-1`, sin borde, radio 10, la lupa y
    // el texto en terciario. 32 px, el alto de todos los controles de la barra (el ThemeSwitcher y
    // el link a GitHub), que es el del campo de búsqueda de la barra de Mail.
    <button
      aria-keyshortcuts="Meta+K"
      className={cn(
        "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-field bg-fill-1 text-callout text-label-tertiary outline-none transition-control hover:bg-fill-2 focus-visible:focus-ring [&_svg]:size-4 [&_svg]:shrink-0",
        !compact && "sm:w-56 sm:justify-start sm:px-2.5",
        className
      )}
      onClick={abrir}
      type="button"
    >
      <SearchIcon aria-hidden="true" />
      {!compact && (
        <>
          <span className="hidden sm:inline">Buscar…</span>
          <Kbd className="ml-auto hidden sm:inline-flex" size="sm">
            ⌘K
          </Kbd>
        </>
      )}
      <span className={cn("sr-only", !compact && "sm:hidden")}>Buscar</span>
    </button>
  )
}
