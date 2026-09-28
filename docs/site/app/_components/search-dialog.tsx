"use client"

import { SearchIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "sebs7n-ui/dialog"
import { Kbd } from "sebs7n-ui/kbd"

import { search, type SearchEntry } from "../_lib/search"
import { Inline } from "./inline"

// Se carga la primera vez que alguien abre el buscador (ver `search.tsx`). El índice se pide
// una sola vez por visita y queda en memoria del módulo.
let indexPromise: Promise<SearchEntry[]> | null = null
function loadIndex() {
  indexPromise ??= fetch("/search-index.json").then((response) => (response.ok ? response.json() : []))
  return indexPromise
}

export default function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (abierto: boolean) => void }) {
  const [consulta, setConsulta] = useState("")
  const [index, setIndex] = useState<SearchEntry[] | null>(null)
  const resultados = useMemo(() => (index ? search(index, consulta) : []), [index, consulta])
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let vivo = true
    loadIndex().then((entries) => vivo && setIndex(entries))
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (!open) setConsulta("")
  }, [open])

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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

            No lleva indicador de foco propio, y es a propósito: es el único campo de un
            diálogo que se abre con el foco ya puesto ahí, así que el cursor es el indicador.
            Una línea de color debajo marcaba un estado que no tiene alternativa. */}
        <div className="flex items-center gap-3 border-b border-gray-alpha-400 px-5">
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
                onOpenChange(false)
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
          {index === null && <p className="px-2 py-6 text-center text-copy-14 text-gray-900">Cargando…</p>}
          {index !== null && consulta && !resultados.length && (
            <p className="px-2 py-6 text-center text-copy-14 text-gray-900">Sin resultados para «{consulta}».</p>
          )}
          {index !== null && !consulta && (
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
                  onClick={() => onOpenChange(false)}
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
  )
}
