// Lo que comparten `DropZone` y `DropTarget`: el `accept`, los tamaños y los arrastres de archivos.
import type * as React from "react"

/** `accept` como el del input: extensiones, `tipo/*` o el tipo exacto. */
export function accepts(file: File, accept: string | undefined): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase()
    if (!rule) return false
    if (rule === "*/*" || rule === "*") return true
    if (rule.startsWith(".")) return name.endsWith(rule)
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

const UNITS = ["kilobyte", "megabyte", "gigabyte"] as const

/**
 * En base 1024: los límites se escriben en MiB (`20 * 1024 * 1024`), y en base 1000 ese límite decía
 * «21 MB». La unidad es la que escribe `Intl` («kB», «MB»), aunque el número sea binario.
 */
export function formatBytes(bytes: number, locale: string): string {
  if (bytes < 1024) return `${bytes} B`
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return new Intl.NumberFormat(locale, { style: "unit", unit: UNITS[unit], unitDisplay: "short", maximumFractionDigits: 1 }).format(value)
}

export const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
export const hasFiles = (event: DragEvent | React.DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files")

