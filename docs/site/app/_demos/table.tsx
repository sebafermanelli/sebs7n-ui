"use client"

import { FileTextIcon, MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "sebs7n-ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableGroupHeader,
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
 * La vista de lista de Drive: la primera celda es el nombre (17, texto principal) y el resto metadatos en 14 gris. `numeric` alinea a la derecha con cifras tabulares.
 */
export function Basico() {
  return (
    <Table>
      <TableCaption>Facturas emitidas en septiembre.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Nº</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead numeric>Importe</TableHead>
          <TableHead className="w-12"><span className="sr-only">Acciones</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURAS.map((factura) => (
          <TableRow key={factura.id}>
            <TableCell>{factura.cliente}</TableCell>
            <TableCell className="tabular-nums">{factura.id}</TableCell>
            <TableCell>
              <Badge color={factura.color} size="sm">
                {factura.estado}
              </Badge>
            </TableCell>
            <TableCell numeric>{factura.importe}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button aria-label={`Acciones de la factura ${factura.id}`} size="icon-sm" variant="plain" />}
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

const DOCUMENTOS = [
  { grupo: "Últimos 7 días", filas: [
    { id: "a", nombre: "Factura 0014", tipo: "Documento PDF", tamano: "110 KB", fecha: "25/09/2026" },
    { id: "b", nombre: "Factura 0013", tipo: "Documento PDF", tamano: "96 KB", fecha: "23/09/2026" },
    { id: "c", nombre: "Resumen de cuenta", tipo: "Planilla", tamano: "36 KB", fecha: "22/09/2026" },
  ] },
  { grupo: "Últimos 30 días", filas: [
    { id: "d", nombre: "Factura 0012", tipo: "Documento PDF", tamano: "104 KB", fecha: "14/09/2026" },
    { id: "e", nombre: "Contrato de licencia", tipo: "Documento PDF", tamano: "1,5 MB", fecha: "02/09/2026" },
  ] },
]

/**
 * Grupos y selección
 * `TableGroupHeader` es el título de grupo de Drive con su contador. Tocá una fila: la elegida va en el acento mientras la tabla tiene el foco y en gris cuando el foco se va (hacé click afuera).
 */
export function Grupos() {
  const [elegida, setElegida] = useState("b")
  return (
    <Table aria-label="Documentos">
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead numeric>Tamaño</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      {DOCUMENTOS.map(({ grupo, filas }) => (
        // Un `TableBody` por grupo: el título (`scope="rowgroup"`) encabeza las filas de su cuerpo.
        <TableBody key={grupo}>
          <TableGroupHeader colSpan={4} count={`${filas.length} ítems`}>
            {grupo}
          </TableGroupHeader>
          {filas.map((fila) => (
            <TableRow
              aria-selected={elegida === fila.id}
              data-state={elegida === fila.id ? "selected" : undefined}
              key={fila.id}
              onClick={() => setElegida(fila.id)}
            >
              <TableCell>
                <span className="flex items-center gap-2.5">
                  <FileTextIcon aria-hidden="true" className="size-4 text-label-secondary" />
                  {fila.nombre}
                </span>
              </TableCell>
              <TableCell>{fila.tipo}</TableCell>
              <TableCell numeric>{fila.tamano}</TableCell>
              <TableCell className="tabular-nums">{fila.fecha}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      ))}
    </Table>
  )
}

/**
 * Densidad compacta
 * Filas de 32, para más de ~20 filas visibles.
 */
export function Compacta() {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Nº</TableHead>
          <TableHead numeric>Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURAS.map((factura) => (
          <TableRow key={factura.id}>
            <TableCell>{factura.cliente}</TableCell>
            <TableCell className="tabular-nums">{factura.id}</TableCell>
            <TableCell numeric>{factura.importe}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Apilada en el teléfono
 * Por debajo de 640 px no hay cabecera: cada fila es un bloque con el nombre arriba y las acciones en la esquina. El fondo de hover y de selección va en la fila entera.
 */
export function Apilada() {
  const [elegida, setElegida] = useState<string | null>("0013")
  return (
    <Table stacked>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead numeric>Importe</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FACTURAS.map((factura) => (
          <TableRow data-state={elegida === factura.id ? "selected" : undefined} key={factura.id} onClick={() => setElegida(factura.id)}>
            <TableCell stacked="full">{factura.cliente}</TableCell>
            <TableCell>
              <Badge color={factura.color} size="sm">
                {factura.estado}
              </Badge>
            </TableCell>
            <TableCell numeric>{factura.importe}</TableCell>
            <TableCell stacked="corner">
              <Button aria-label={`Acciones de ${factura.cliente}`} size="icon-sm" variant="plain">
                <MoreHorizontalIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
