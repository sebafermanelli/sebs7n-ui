"use client"

import { SearchIcon, type LucideIcon } from "lucide-react"
import { cloneElement, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Button } from "sebs7n-ui/button"
import { Icon } from "sebs7n-ui/icon"
import { Input } from "sebs7n-ui/input"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

import { PAGINA } from "../_lib/iconos"

type Tamano = "sm" | "md" | "lg"
type TooltipModule = typeof import("sebs7n-ui/tooltip")

/**
 * Catálogo con búsqueda. Solo esta ruta usa los 1.800 íconos; el resto del
 * sitio no los paga. La búsqueda va por `useDeferredValue` para que tipear no
 * espere al filtrado, y la grilla muestra de a 96 para no prerenderizar 1.800
 * `<svg>` en el HTML.
 *
 * Los 1.800 íconos tampoco van en el arranque de esta página: eran ~185 KB gzip de JS para
 * pintar 96. La página, que es Server Component, pasa los nombres y los primeros 96 `<svg>` ya
 * renderizados (son HTML, no JS), y el mapa entero de lucide se pide al montar. Cuando llega,
 * cada botón pasa a dibujar su componente: el mismo `<svg>`. Si alguien busca o cambia el
 * tamaño antes de que llegue, los botones que todavía no tienen su ícono quedan vacíos un
 * instante, con su tamaño de siempre.
 */
export function IconCatalog({ nombres, iniciales }: { nombres: string[]; iniciales: Record<string, ReactNode> }) {
  const todos = useMemo(
    () =>
      // `icons` viene en PascalCase sin sufijo (`Search`); el export con sufijo es `SearchIcon`.
      nombres.map((nombre) => ({
        nombre,
        exportado: `${nombre}Icon`,
        // kebab-case para buscar «arrow-right» además de «ArrowRight».
        kebab: nombre.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
      })),
    [nombres]
  )
  const [icons, setIcons] = useState<Record<string, LucideIcon> | null>(null)
  useEffect(() => {
    let vigente = true
    void import("lucide-react").then((mod) => {
      if (vigente) setIcons(mod.icons)
    })
    return () => {
      vigente = false
    }
  }, [])
  // El Tooltip de Base UI (con floating-ui, ~40 KB gzip) tampoco va en el arranque: se ve recién
  // con el mouse o el foco encima de un ícono, así que se pide al montar, como el mapa de lucide.
  // Hasta que llega, los botones son los mismos sin tooltip. Al llegar, cada botón pasa a ser el
  // trigger de Base UI —otro nodo—: si uno tenía el foco, se le devuelve al nuevo.
  const [tooltip, setTooltip] = useState<TooltipModule | null>(null)
  const lista = useRef<HTMLUListElement>(null)
  const enfocado = useRef<string | null>(null)
  useEffect(() => {
    let vigente = true
    void import("sebs7n-ui/tooltip").then((mod) => {
      if (!vigente) return
      enfocado.current = document.activeElement instanceof HTMLElement ? (document.activeElement.dataset.icono ?? null) : null
      setTooltip(mod)
    })
    return () => {
      vigente = false
    }
  }, [])
  useLayoutEffect(() => {
    if (!tooltip || !enfocado.current) return
    lista.current?.querySelector<HTMLElement>(`[data-icono="${enfocado.current}"]`)?.focus()
    enfocado.current = null
  }, [tooltip])
  const [consulta, setConsulta] = useState("")
  const [tamano, setTamano] = useState<Tamano>("md")
  const [limite, setLimite] = useState(PAGINA)
  const diferida = useDeferredValue(consulta)

  const resultados = useMemo(() => {
    const terminos = diferida.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (!terminos.length) return todos
    return todos.filter((icono) => terminos.every((t) => icono.kebab.includes(t)))
  }, [diferida, todos])

  const visibles = resultados.slice(0, limite)

  const grilla = (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2" ref={lista}>
      {visibles.map((icono) => {
        const Svg = icons?.[icono.nombre]
        // Antes de que llegue el mapa, el `<svg>` que vino renderizado del servidor (solo
        // los primeros 96 en 20 px, que es lo que se ve al abrir).
        const inicial = tamano === "md" ? iniciales[icono.nombre] : undefined
        const importLine = `import { ${icono.exportado} } from "lucide-react"`
        const boton = (
          <button
            className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-surface border border-gray-alpha-400 glass text-gray-1000 shadow-card outline-none transition-surface hover:-translate-y-px hover:border-gray-alpha-500 hover:shadow-card-hover active:translate-y-0 active:bg-gray-alpha-200 active:shadow-card focus-visible:focus-ring"
            data-icono={icono.nombre}
            onClick={async () => {
              // sonner se pide al primer clic: el `Toaster` ya se carga después de
              // hidratar (ver `providers.tsx`), y así su módulo no va en el arranque.
              const { toast } = await import("sonner")
              try {
                await navigator.clipboard.writeText(importLine)
                toast(`Copiado: ${icono.exportado}`, { description: importLine })
              } catch {
                toast.error("No se pudo copiar")
              }
            }}
            type="button"
          />
        )
        const contenido = Svg ? (
          <Icon icon={Svg} label={`Copiar el import de ${icono.exportado}`} size={tamano} />
        ) : (
          (inicial ?? <span className="sr-only">{`Copiar el import de ${icono.exportado}`}</span>)
        )
        if (!tooltip) return <li key={icono.nombre}>{cloneElement(boton, undefined, contenido)}</li>
        const { Tooltip, TooltipContent, TooltipTrigger } = tooltip
        return (
          <li key={icono.nombre}>
            <Tooltip>
              <TooltipTrigger render={boton}>{contenido}</TooltipTrigger>
              <TooltipContent>{icono.exportado}</TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
  // El `TooltipProvider` ya no es global (ver `demo-slot.tsx`): cada pantalla con tooltips
  // pone el suyo. Envuelve solo la grilla, así su llegada no remonta el buscador.
  const grillaConTooltips = tooltip ? <tooltip.TooltipProvider>{grilla}</tooltip.TooltipProvider> : grilla

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Icon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" icon={SearchIcon} size="sm" tone="muted" />
          <Input
            aria-label="Buscar un ícono"
            className="pl-9"
            onChange={(event) => {
              setConsulta(event.target.value)
              setLimite(PAGINA)
            }}
            placeholder="Buscar: arrow, user, file…"
            enterKeyHint="search"
            type="text"
            value={consulta}
          />
        </div>
        <ToggleGroup aria-label="Tamaño" onValueChange={(v) => v[0] && setTamano(v[0] as Tamano)} value={[tamano]}>
          <ToggleGroupItem value="sm">16</ToggleGroupItem>
          <ToggleGroupItem value="md">20</ToggleGroupItem>
          <ToggleGroupItem value="lg">24</ToggleGroupItem>
        </ToggleGroup>
        <span aria-live="polite" className="text-label-13 text-gray-900">
          {resultados.length === todos.length ? `${todos.length} íconos` : `${resultados.length} de ${todos.length}`}
        </span>
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-copy-14 text-gray-900">Nada con «{diferida}». Probá en inglés: lucide nombra en inglés.</p>
      ) : (
        grillaConTooltips
      )}

      {visibles.length < resultados.length && (
        <Button className="self-center" onClick={() => setLimite((n) => n + PAGINA * 2)} variant="outline">
          Mostrar más ({resultados.length - visibles.length} restantes)
        </Button>
      )}
    </div>
  )
}
