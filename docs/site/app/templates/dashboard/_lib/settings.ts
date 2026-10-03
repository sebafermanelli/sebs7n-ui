import type { Oklch } from "sebs7n-ui/lib/contrast"

import type { Invoice } from "../_data/invoices-mock"

/** Un archivo ya elegido: el template no sube nada, así que alcanza con su nombre y su tamaño. */
export interface AttachedFile {
  id: string
  name: string
  size: number
}

export interface Settings {
  company: string
  timezone: string
  /** El color de marca, en OKLCH (lo que entiende `ColorPicker`). */
  brand: Oklch
  logo: AttachedFile | null
  documents: AttachedFile[]
  currency: string
  dueDays: string
  /** Qué avisos le llegan al cliente: `before` (antes de vencer), `overdue` (al vencer), `paid` (al cobrar). */
  customerNotices: string[]
}

export const DEFAULT_SETTINGS: Settings = {
  company: "Acme Corporation",
  timezone: "America/Argentina/Buenos_Aires",
  brand: [0.573, 0.214, 258],
  logo: null,
  documents: [],
  currency: "USD",
  dueDays: "30",
  customerNotices: ["before", "overdue"],
}

export const GENERAL_KEYS = ["company", "timezone", "brand", "logo", "documents"] as const satisfies readonly (keyof Settings)[]
export const BILLING_KEYS = ["currency", "dueDays", "customerNotices"] as const satisfies readonly (keyof Settings)[]

/** Si algo de `keys` difiere entre lo guardado y el borrador. Las listas se comparan por contenido. */
export function isDirty(saved: Settings, draft: Settings, keys: readonly (keyof Settings)[]) {
  return keys.some((key) => JSON.stringify(saved[key]) !== JSON.stringify(draft[key]))
}

/** Le deja al borrador solo lo de `keys` y el resto como estaba: guardar una pestaña no guarda la otra. */
export function applyKeys(base: Settings, from: Settings, keys: readonly (keyof Settings)[]): Settings {
  const next = { ...base }
  for (const key of keys) (next as Record<string, unknown>)[key] = from[key]
  return next
}

export const PLAN_QUOTA = 12

/** Cuántas facturas se emitieron en `month` (`YYYY-MM`) contra el cupo del plan. */
export function planUsage(invoices: Invoice[], month: string, quota = PLAN_QUOTA) {
  const used = invoices.filter((inv) => inv.date.startsWith(month)).length
  return { used, quota, remaining: Math.max(0, quota - used), percent: Math.min(100, Math.round((used / quota) * 100)) }
}

/** Lo que incluye el plan además de las facturas: lugares de usuario y espacio, en GB. */
export const PLAN_SEATS = 5
export const PLAN_SPACE_GB = 10

/**
 * El uso del plan de un vistazo: facturas del mes, usuarios y espacio. El espacio sale de cuántas facturas hay
 * (cada PDF pesa ~0,12 GB en la maqueta): el template no sube archivos, y así el número es el mismo en el
 * servidor y en el cliente.
 */
export function planOverview(invoices: Invoice[], month: string, members: number) {
  return {
    invoices: planUsage(invoices, month),
    seats: { used: members, max: PLAN_SEATS },
    space: { used: Math.round(invoices.length * 0.12 * 10) / 10, max: PLAN_SPACE_GB },
  }
}

/** «84 KB», «1,2 MB»: el tamaño de un archivo elegido, para la grilla de archivos. */
export function fileSizeLabel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`
}

/** Los archivos que `DropZone` entrega, como lo que se guarda: id, nombre y tamaño. El id es único por nombre y orden de llegada. */
export function attach(existing: AttachedFile[], files: { name: string; size: number }[]): AttachedFile[] {
  let next = existing.length
  return [...existing, ...files.map((file) => ({ id: `file-${next++}-${file.name}`, name: file.name, size: file.size }))]
}
