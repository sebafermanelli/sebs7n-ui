"use client"

import { CopyIcon, FilterIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { EmptyState } from "sebs7n-ui/empty-state"
import { ScrollArea } from "sebs7n-ui/scroll-area"
import { TextLink } from "sebs7n-ui/text-link"
import { toast } from "sonner"

import type { RuntimeLine } from "../_data/derive"
import { servicePath } from "../_lib/routes"

const LEVEL = { info: { label: "Info", color: "gray" }, warn: { label: "Aviso", color: "amber" }, error: { label: "Error", color: "red" } } as const

/** Las `radius` líneas de cada lado de la elegida, de la lista completa (no solo de la filtrada). */
export function contextOf(lines: RuntimeLine[], id: number, radius = 3) {
  const index = lines.findIndex((line) => line.id === id)
  return index < 0 ? [] : lines.slice(Math.max(0, index - radius), index + radius + 1)
}

// El panel de la derecha de Logs: la línea elegida con su servicio y las de alrededor. Elegir una línea es
// un clic; con teclado, «Último error» elige la más reciente con ese nivel.
export function LogLineDetail({ line, lines, onFilterService, onPickLastError }: { line: RuntimeLine | null; lines: RuntimeLine[]; onFilterService: (service: string) => void; onPickLastError: () => void }) {
  if (!line) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <EmptyState
          action={
            <Button onClick={onPickLastError} variant="secondary">
              Ver el último error
            </Button>
          }
          description="Hacé clic en una línea del log para ver su detalle y lo que pasó alrededor."
          title="Ninguna línea elegida"
          variant="plain"
        />
      </div>
    )
  }
  const level = LEVEL[line.level]
  return (
    <ScrollArea className="h-full" contentClassName="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={level.color}>{level.label}</Badge>
        <span className="font-mono text-callout text-label-secondary">{line.time}</span>
        <TextLink render={<Link href={servicePath(line.service)} />} trailing="chevron">
          {line.service}
        </TextLink>
      </div>
      <p className="font-mono text-callout break-words text-label">{line.message}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            void navigator.clipboard?.writeText(`${line.time} ${line.service} ${line.level} ${line.message}`)
            toast.success("Línea copiada")
          }}
          size="sm"
          variant="secondary"
        >
          <CopyIcon />
          Copiar
        </Button>
        <Button onClick={() => onFilterService(line.service)} size="sm" variant="secondary">
          <FilterIcon />
          Solo {line.service}
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-headline text-label">Alrededor</h3>
        <ul aria-label="Líneas cercanas" className="flex flex-col font-mono text-footnote">
          {contextOf(lines, line.id).map((near) => (
            <li className={near.id === line.id ? "font-semibold text-label" : "text-label-secondary"} key={near.id}>
              {near.time} {near.message}
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  )
}
