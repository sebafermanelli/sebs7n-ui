"use client"

import { MoreHorizontalIcon } from "lucide-react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "sebs7n-ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "sebs7n-ui/table"

const FACTURAS = [
  { id: "0012", cliente: "Acme S.A.", estado: "Pagada", color: "green", importe: "$ 128.400" },
  { id: "0013", cliente: "Nube Digital", estado: "Pendiente", color: "amber", importe: "$ 96.000" },
  { id: "0014", cliente: "Estudio Ruiz", estado: "Vencida", color: "red", importe: "$ 41.200" },
] as const

/**
 * Con números a la derecha
 * `numeric` alinea a la derecha y usa cifras tabulares: las columnas de plata se comparan de un vistazo.
 */
export function Basico() {
  return (
    <Table>
      <TableCaption>Facturas emitidas en septiembre.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nº</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead numeric>Importe</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURAS.map((factura) => (
          <TableRow key={factura.id}>
            <TableCell className="text-label-13-mono">{factura.id}</TableCell>
            <TableCell>{factura.cliente}</TableCell>
            <TableCell>
              <Badge color={factura.color} size="sm">
                {factura.estado}
              </Badge>
            </TableCell>
            <TableCell numeric>{factura.importe}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button aria-label={`Acciones de la factura ${factura.id}`} size="icon-sm" variant="ghost" />}
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver</DropdownMenuItem>
                  <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell numeric>$ 265.600</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

/**
 * Densidad compacta
 * Para más de ~20 filas visibles.
 */
export function Compacta() {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Nº</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead numeric>Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURAS.map((factura) => (
          <TableRow key={factura.id}>
            <TableCell className="text-label-13-mono">{factura.id}</TableCell>
            <TableCell>{factura.cliente}</TableCell>
            <TableCell numeric>{factura.importe}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
