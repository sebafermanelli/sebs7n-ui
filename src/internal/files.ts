// Lo que comparten `DropZone` y `DropTarget`: el `accept`, los tamaños y los arrastres de archivos.
import type * as React from "react"

import type { Labels } from "../lib/labels.js"

/** Los textos de `DropZone`. `replace` y `addMore` (2.1) son opcionales: un objeto con las claves de 2.0 sigue valiendo. */
export type DropZoneLabels = NonNullable<Labels["dropZone"]>

/**
 * Los textos por defecto de `DropZone` y `DropTarget`. No están en `defaultLabels` porque el barrel no tenía lugar (ver el tipo
 * `Labels`).
 */
export const dropZoneLabels: Required<DropZoneLabels> = {
  prompt: "Arrastrá archivos acá o hacé clic para elegirlos",
  drop: "Soltá para agregarlos",
  remove: "Quitar",
  added: "Archivos agregados:",
  removed: "Archivo quitado:",
  invalidType: "no es de un tipo permitido",
  tooLarge: "pesa más de",
  tooMany: "no entra: el máximo es",
  locale: "es-AR",
  replace: "Elegir otro",
  addMore: "Agregar más",
}


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

