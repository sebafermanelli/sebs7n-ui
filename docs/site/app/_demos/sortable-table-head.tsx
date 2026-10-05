"use client"

import { useState } from "react"
import { SortableTableHead, type SortDirection } from "sebs7n-ui/sortable-table-head"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"

const FACTURAS = [
  { id: "0012", cliente: "Acme S.A.", importe: 128400 },
  { id: "0013", cliente: "Nube Digital", importe: 96000 },
  { id: "0014", cliente: "Estudio Ruiz", importe: 41200 },
]

/**
 * Encabezados ordenables
 * Por callback (estado local) en la demo; en el servidor se usa `href`, que arma `?sort=<col>&dir=asc|desc`. Primer click ascendente, segundo descendente, tercero quita el orden.
 */
export function Basic() {
  const [sort, setSort] = useState<{ id: "cliente" | "importe"; direction: SortDirection } | null>({ id: "importe", direction: "desc" })
  const rows = [...FACTURAS].sort((a, b) => {
    if (!sort) return 0
    const r = sort.id === "importe" ? a.importe - b.importe : a.cliente.localeCompare(b.cliente)
    return sort.direction === "asc" ? r : -r
  })
  const head = (id: "cliente" | "importe") => ({
    direction: sort?.id === id ? sort.direction : null,
    onSort: (next: SortDirection | null) => setSort(next ? { id, direction: next } : null),
  })
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead {...head("cliente")}>Cliente</SortableTableHead>
          <TableHead>Nº</TableHead>
          <SortableTableHead numeric {...head("importe")}>
            Importe
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((f) => (
          <TableRow key={f.id}>
            <TableCell>{f.cliente}</TableCell>
            <TableCell className="tabular-nums">{f.id}</TableCell>
            <TableCell numeric>$ {f.importe.toLocaleString("es-AR")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
