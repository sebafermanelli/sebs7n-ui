"use client"

import { icons, SearchIcon } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Icon } from "sebs7n-ui/icon"
import { Input } from "sebs7n-ui/input"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { toast } from "sonner"

/** `icons` viene en PascalCase sin sufijo (`Search`); el export con sufijo es `SearchIcon`. */
const TODOS = Object.keys(icons).map((nombre) => ({
  nombre,
  exportado: `${nombre}Icon`,
  // kebab-case para buscar «arrow-right» además de «ArrowRight».
  kebab: nombre.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
}))

const PAGINA = 96
type Tamano = "sm" | "md" | "lg"

/**
 * Catálogo con búsqueda. Solo esta ruta importa los 1.800 íconos; el resto del
 * sitio no los paga. La búsqueda va por `useDeferredValue` para que tipear no
 * espere al filtrado, y la grilla muestra de a 96 para no prerenderizar 1.800
 * `<svg>` en el HTML.
 */
export function IconCatalog() {
  const [consulta, setConsulta] = useState("")
  const [tamano, setTamano] = useState<Tamano>("md")
  const [limite, setLimite] = useState(PAGINA)
  const diferida = useDeferredValue(consulta)

  const resultados = useMemo(() => {
    const terminos = diferida.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (!terminos.length) return TODOS
    return TODOS.filter((icono) => terminos.every((t) => icono.kebab.includes(t)))
  }, [diferida])

  const visibles = resultados.slice(0, limite)

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
            type="search"
            value={consulta}
          />
        </div>
        <ToggleGroup aria-label="Tamaño" onValueChange={(v) => v[0] && setTamano(v[0] as Tamano)} value={[tamano]}>
          <ToggleGroupItem value="sm">16</ToggleGroupItem>
          <ToggleGroupItem value="md">20</ToggleGroupItem>
          <ToggleGroupItem value="lg">24</ToggleGroupItem>
        </ToggleGroup>
        <span aria-live="polite" className="text-label-13 text-gray-900">
          {resultados.length === TODOS.length ? `${TODOS.length} íconos` : `${resultados.length} de ${TODOS.length}`}
        </span>
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-copy-14 text-gray-900">Nada con «{diferida}». Probá en inglés: lucide nombra en inglés.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
          {visibles.map((icono) => {
            const Svg = icons[icono.nombre as keyof typeof icons]
            const importLine = `import { ${icono.exportado} } from "lucide-react"`
            return (
              <li key={icono.nombre}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border border-gray-400 bg-background-100 text-gray-1000 shadow-card outline-none transition-surface hover:-translate-y-px hover:border-gray-500 hover:shadow-card-hover active:translate-y-0 active:bg-gray-100 active:shadow-card focus-visible:focus-ring"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(importLine)
                            toast(`Copiado: ${icono.exportado}`, { description: importLine })
                          } catch {
                            toast.error("No se pudo copiar")
                          }
                        }}
                        type="button"
                      />
                    }
                  >
                    <Icon icon={Svg} label={`Copiar el import de ${icono.exportado}`} size={tamano} />
                  </TooltipTrigger>
                  <TooltipContent>{icono.exportado}</TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      )}

      {visibles.length < resultados.length && (
        <Button className="self-center" onClick={() => setLimite((n) => n + PAGINA * 2)} variant="outline">
          Mostrar más ({resultados.length - visibles.length} restantes)
        </Button>
      )}
    </div>
  )
}
