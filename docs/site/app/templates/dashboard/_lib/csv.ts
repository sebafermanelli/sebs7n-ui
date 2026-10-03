import type { Invoice } from "../_data/invoices-mock"
import { STATUS_BADGE } from "../_components/invoice-status"

// Una celda entre comillas si trae coma, comilla o salto de línea; las comillas se duplican (RFC 4180).
const cell = (value: string | number) => {
  const text = String(value)
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Las facturas como CSV, con una fila de cabecera. Excel las abre bien con el BOM de `downloadCsv`. */
export function invoicesToCsv(invoices: Invoice[]) {
  const header = ["Número", "Cliente", "Concepto", "Monto (USD)", "Estado", "Emisión", "Vencimiento"]
  const rows = invoices.map((inv) => [inv.id, inv.customer, inv.concept, inv.amount, STATUS_BADGE[inv.status].label, inv.date, inv.dueDate])
  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\n")
}

/** Una serie como CSV: una fila por punto, con el rótulo y el valor. */
export function seriesToCsv(header: [string, string], labels: string[], values: number[]) {
  return [header, ...labels.map((label, index) => [label, values[index] ?? 0])].map((row) => row.map(cell).join(",")).join("\n")
}

/** Baja un texto como archivo: un `Blob` y un `<a download>` que se hace clic solo. */
export function downloadCsv(filename: string, text: string) {
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob(["﻿", text], { type: "text/csv;charset=utf-8" }))
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
