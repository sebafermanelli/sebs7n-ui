"use client"

import { Badge } from "sebs7n-ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "sebs7n-ui/card"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { ListViewContent, ListViewControls, ListViewProvider, type ListColumn } from "sebs7n-ui/list-view"
import { SearchField } from "sebs7n-ui/search-field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"

const COLUMNS: ListColumn[] = [
  { id: "number", label: "Número", required: true },
  { id: "client", label: "Cliente" },
  { id: "status", label: "Estado" },
  { id: "amount", label: "Importe" },
]

const ROWS = [
  { number: "F-0001", client: "Cliente de ejemplo", status: "Cobrada", amount: "$ 120.000" },
  { number: "F-0002", client: "Otro cliente", status: "Pendiente", amount: "$ 86.500" },
  { number: "F-0003", client: "Tercer cliente", status: "Vencida", amount: "$ 42.000" },
]

/**
 * Tabla o tarjetas, y columnas visibles
 * ViewToggle y ColumnPicker van en las acciones de la barra; se recuerdan por lista en el navegador. Las celdas llevan data-col.
 */
export function Basic() {
  const table = (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((c) => (
            <TableHead data-col={c.id} key={c.id}>
              {c.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.number}>
            <TableCell data-col="number">{r.number}</TableCell>
            <TableCell data-col="client">{r.client}</TableCell>
            <TableCell data-col="status">{r.status}</TableCell>
            <TableCell data-col="amount">{r.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
  const cards = (
    <div className="grid gap-3 @lg:grid-cols-2">
      {ROWS.map((r) => (
        <Card key={r.number}>
          <CardHeader>
            <CardTitle>{r.number}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-callout">
            <span>{r.client}</span>
            <Badge size="sm">{r.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
  return (
    <ListViewProvider columns={COLUMNS} listKey="demo-invoices">
      <div className="flex w-full flex-col gap-4">
        <FilterBar actions={<ListViewControls />} search={<SearchField aria-label="Buscar facturas" size="sm" />} />
        <ListViewContent cards={cards} table={table} />
      </div>
    </ListViewProvider>
  )
}
