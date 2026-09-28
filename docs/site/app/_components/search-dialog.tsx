"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "sebs7n-ui/command"

import { groupResults, plainText, search, type SearchEntry } from "../_lib/search"

// Se carga la primera vez que alguien abre el buscador (ver `search.tsx`). El índice se pide
// una sola vez por visita y queda en memoria del módulo.
let indexPromise: Promise<SearchEntry[]> | null = null
function loadIndex() {
  indexPromise ??= fetch("/search-index.json").then((response) => (response.ok ? response.json() : []))
  return indexPromise
}

export default function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (abierto: boolean) => void }) {
  const router = useRouter()
  const [consulta, setConsulta] = useState("")
  const [index, setIndex] = useState<SearchEntry[] | null>(null)
  const grupos = useMemo(() => groupResults(index ? search(index, consulta) : []), [index, consulta])

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

  const ir = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    // `shouldFilter={false}`: el ranking es el de `_lib/search.ts` (título antes que cuerpo, prefijo
    // antes que contenido). Command muestra lo que recibe, en ese orden.
    <CommandDialog
      labels={{ dialog: "Buscar en la documentación" }}
      onOpenChange={onOpenChange}
      onValueChange={setConsulta}
      open={open}
      shouldFilter={false}
      value={consulta}
    >
      <CommandInput placeholder="Button, tokens, aria-invalid…" />
      <CommandList>
        {grupos.map(([grupo, entries]) => (
          <CommandGroup heading={grupo} key={grupo}>
            {entries.map((entry) => (
              <CommandItem description={plainText(entry.description)} key={entry.href} onSelect={ir} textValue={entry.title} value={entry.href}>
                {entry.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <CommandEmpty>
        {index === null
          ? "Cargando…"
          : consulta.trim()
            ? `Sin resultados para «${consulta}».`
            : "Buscá un componente, un token o una regla."}
      </CommandEmpty>
    </CommandDialog>
  )
}
