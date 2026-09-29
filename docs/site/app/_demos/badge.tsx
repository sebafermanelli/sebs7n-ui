"use client"

import { Badge } from "sebs7n-ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"

/**
 * Colores
 * Sólidos y sin borde, como las etiquetas del Finder. La tinta es blanca o negra según el relleno: la que llega a 4,5:1.
 */
export function Colores() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Borrador</Badge>
      <Badge color="brand">Nuevo</Badge>
      <Badge color="green">Pagado</Badge>
      <Badge color="amber">Pendiente</Badge>
      <Badge color="red">Vencido</Badge>
      <Badge color="blue">En revisión</Badge>
      <Badge color="teal">Enviado</Badge>
      <Badge color="purple">Archivado</Badge>
      <Badge color="pink">Prueba</Badge>
    </div>
  )
}

/**
 * Con punto
 * El punto va en la tinta del badge: del color del relleno no se vería.
 */
export function ConPunto() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge dot color="green">
        Activo
      </Badge>
      <Badge dot color="red" size="sm">
        Caído
      </Badge>
    </div>
  )
}

/**
 * En una tabla
 * `size="sm"` dentro de una fila, para que no infle el alto.
 */
export function EnTabla() {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Factura</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead numeric>Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>0012</TableCell>
          <TableCell>
            <Badge size="sm" color="green">
              Pagada
            </Badge>
          </TableCell>
          <TableCell numeric>$ 128.400</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>0013</TableCell>
          <TableCell>
            <Badge size="sm" color="amber">
              Pendiente
            </Badge>
          </TableCell>
          <TableCell numeric>$ 96.000</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
