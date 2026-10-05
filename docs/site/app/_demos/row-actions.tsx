"use client"

import { CheckCircle2Icon, PanelRightIcon, Trash2Icon } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "sebs7n-ui/dropdown-menu"
import { RowActions } from "sebs7n-ui/row-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"

const FACTURAS = ["F-0012", "F-0013", "F-0014"]

/**
 * El «…» de una fila
 * Un botón icon-sm plain con el nombre de la fila («Acciones para F-0012») que abre el menú, con tooltip. Va en la última columna.
 */
export function Basic() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Factura</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURAS.map((id) => (
          <TableRow key={id}>
            <TableCell>{id}</TableCell>
            <TableCell className="text-right">
              <RowActions label={`Acciones para ${id}`}>
                <DropdownMenuItem>
                  <PanelRightIcon />
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle2Icon />
                  Marcar cobrada
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Anular
                </DropdownMenuItem>
              </RowActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
