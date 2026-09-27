"use client"

import { SearchIcon } from "lucide-react"
import Link from "next/link"
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "sebs7n-ui/dialog"
import { Kbd } from "sebs7n-ui/kbd"
import { cn } from "sebs7n-ui/lib/utils"

import index from "@/.generated/search.json"
import { Inline } from "./inline"

type Entrada = (typeof index)[number]

/** Todo lo que se busca de una entrada, una sola vez. */
const CORPUS: { entrada: Entrada; texto: string }[] = index.map((entrada) => ({
  entrada,
  texto: `${entrada.title} ${entrada.group} ${entrada.description} ${entrada.keywords}`.toLowerCase(),
}))

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

function buscar(consulta: string) {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (!terminos.length) return []
  return CORPUS.map(({ entrada, texto }) => {
    const plano = normalizar(texto)
    if (!terminos.every((termino) => plano.includes(termino))) return null
    // El título pesa más que el cuerpo, y empezar con el término más que contenerlo.
    const titulo = normalizar(entrada.title)
    const puntaje = terminos.reduce(
      (total, termino) => total + (titulo.startsWith(termino) ? 100 : titulo.includes(termino) ? 40 : 1),
      0
    )
    return { entrada, puntaje }
  })
    .filter((resultado) => resultado !== null)
    .sort((a, b) => b.puntaje - a.puntaje || a.entrada.title.localeCompare(b.entrada.title))
    .slice(0, 12)
    .map((resultado) => resultado.entrada)
}

/** La paleta vive una sola vez en el árbol; el header y el Sidebar solo la abren. */
const SearchContext = createContext<{ abrir: () => void } | null>(null)

export function useSearch() {
  const contexto = useContext(SearchContext)
  if (!contexto) throw new Error("useSearch necesita <SearchProvider>")
  return contexto
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false)
  const [consulta, setConsulta] = useState("")
  const resultados = useMemo(() => buscar(consulta), [consulta])
  const campo = useRef<HTMLInputElement>(null)

  // El atajo lo registra la app, no el paquete: SidebarSearch solo muestra el Kbd.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setAbierto((previo) => !previo)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!abierto) setConsulta("")
  }, [abierto])

  const valor = useMemo(() => ({ abrir: () => setAbierto(true) }), [])

  return (
    <SearchContext.Provider value={valor}>
      {children}
      <Dialog onOpenChange={setAbierto} open={abierto}>
        {/* `initialFocus` y no `autoFocus`: el foco lo decide el diálogo, que es quien lo atrapa.
            Con el atributo, quién llega primero —el `focus()` de React o el del diálogo— depende
            del navegador. */}
        <DialogContent className="top-24 max-w-xl translate-y-0 gap-0 overflow-hidden p-0" initialFocus={campo} showCloseButton={false}>
          <DialogTitle className="sr-only">Buscar en la documentación</DialogTitle>
          <DialogDescription className="sr-only">
            Escribí el nombre de un componente o de una página. Enter para ir al primer resultado.
          </DialogDescription>
          {/* El campo ES la cabecera del diálogo, no un Input apoyado adentro. Con borde y fondo
              propios era una caja de 10px de radio a 8px del borde de otra de 26: dos curvas que
              no se acompañan. Sin caja no hay nada que alinear.

              El indicador de foco es la línea de abajo, que toma el color de marca: un campo sin
              borde no puede mostrar el suyo, y el cursor solo no alcanza. */}
          <div className="flex items-center gap-3 border-b border-gray-alpha-400 px-5 transition-control has-[input:focus]:border-brand-700">
            <SearchIcon aria-hidden="true" className="size-4.5 shrink-0 text-gray-900" />
            <input
              aria-label="Buscar en la documentación"
              autoCapitalize="off"
              autoComplete="off"
              className="h-14 min-w-0 flex-1 bg-transparent text-copy-16 text-gray-1000 outline-none placeholder:text-gray-900"
              onChange={(event) => setConsulta(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && resultados[0]) {
                  event.preventDefault()
                  setAbierto(false)
                  window.location.assign(resultados[0].href)
                }
              }}
              placeholder="Button, tokens, aria-invalid…"
              ref={campo}
              spellCheck={false}
              // `text` y no `search`: con `search` el navegador dibuja su propia × de limpiar,
              // que no se puede estilar. `enterKeyHint` conserva lo útil, la tecla «Buscar» del
              // teclado en pantalla.
              enterKeyHint="search"
              type="text"
              value={consulta}
            />
            <Kbd>Esc</Kbd>
          </div>
          <div aria-live="polite" className="max-h-80 overflow-y-auto p-2">
            {consulta && !resultados.length && (
              <p className="px-2 py-6 text-center text-copy-14 text-gray-900">Sin resultados para «{consulta}».</p>
            )}
            {!consulta && (
              <p className="px-2 py-6 text-center text-copy-14 text-gray-900">
                Buscá un componente, un token o una regla.
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {resultados.map((resultado) => (
                <li key={resultado.href}>
                  <Link
                    // Concéntrico con el diálogo: su radio menos los 8px que los separan.
                    className="flex flex-col gap-0.5 rounded-[calc(var(--radius-panel)-(--spacing(2)))] px-3 py-2 outline-none transition-control hover:bg-gray-alpha-100 focus-visible:focus-ring"
                    href={resultado.href}
                    onClick={() => setAbierto(false)}
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="text-label-14 text-gray-1000">{resultado.title}</span>
                      <span className="text-label-12 text-gray-700">{resultado.group}</span>
                    </span>
                    <span className="line-clamp-1 text-copy-13 text-gray-900">
                      <Inline text={resultado.description} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
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
    <Button
      aria-keyshortcuts="Meta+K"
      className={cn(
        "w-9 justify-center gap-2 px-0",
        !compact && "sm:w-56 sm:justify-start sm:px-3",
        className
      )}
      onClick={abrir}
      size="sm"
      variant="outline"
    >
      <SearchIcon className="text-gray-900" />
      {!compact && (
        <>
          <span className="hidden text-gray-700 sm:inline">Buscar…</span>
          <Kbd className="ml-auto hidden sm:inline-flex">⌘K</Kbd>
        </>
      )}
      <span className={cn("sr-only", !compact && "sm:hidden")}>Buscar</span>
    </Button>
  )
}
