"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { Badge, Button } from "sebs7n-ui"
import { DataTable, type DataTableColumn } from "sebs7n-ui/data-table"

type Factura = { id: string; numero: string; cliente: string; fecha: Date; importe: number; estado: "Pagada" | "Pendiente" | "Vencida" }

const CLIENTES = ["Acme S.A.", "Nube Digital", "Estudio Ruiz", "Óptica Sur", "Taller Norte", "Librería Central"]
const ESTADOS = ["Pagada", "Pendiente", "Vencida"] as const

const FACTURAS: Factura[] = Array.from({ length: 23 }, (_, index) => ({
  id: String(index + 1),
  numero: `A-${String(12 + index).padStart(4, "0")}`,
  cliente: CLIENTES[(index * 5) % CLIENTES.length]!,
  fecha: new Date(2026, 8, 29 - index),
  importe: 7500 + ((index * 37_919) % 140_000),
  estado: ESTADOS[(index * 7) % 3]!,
}))

const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
const dia = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
const COLOR = { Pagada: "green", Pendiente: "amber", Vencida: "red" } as const

const COLUMNAS: DataTableColumn<Factura>[] = [
  { id: "numero", header: "Número", value: (row) => row.numero, sortable: true, className: "w-32" },
  { id: "cliente", header: "Cliente", value: (row) => row.cliente, sortable: true },
  { id: "fecha", header: "Fecha", value: (row) => row.fecha, cell: (row) => dia.format(row.fecha), sortable: true, className: "w-32" },
  { id: "estado", header: "Estado", value: (row) => row.estado, cell: (row) => <Badge color={COLOR[row.estado]}>{row.estado}</Badge>, className: "w-28" },
  { id: "importe", header: "Importe", value: (row) => row.importe, cell: (row) => pesos.format(row.importe), numeric: true, sortable: true, className: "w-32" },
]

/**
 * Facturas emitidas
 * Orden con la cabecera, búsqueda sin tildes ni mayúsculas, selección con casillas y páginas. La fila elegida va en el acento mientras la tabla tiene el foco, como la lista de Drive.
 */
export function Basico() {
  const [elegidas, setElegidas] = useState<string[]>([])
  return (
    <div className="w-full">
      <DataTable
        aria-label="Facturas emitidas"
        columns={COLUMNAS}
        data={FACTURAS}
        defaultSort={{ id: "fecha", direction: "desc" }}
        filter
        getRowId={(row) => row.id}
        getRowLabel={(row) => `${row.numero} de ${row.cliente}`}
        onSelectedChange={setElegidas}
        pageSize={8}
        selectable
        selected={elegidas}
        toolbar={
          <>
            {elegidas.length > 0 && <span className="text-callout text-label-secondary">{elegidas.length} elegidas</span>}
            <Button size="sm">
              <PlusIcon />
              Nueva factura
            </Button>
          </>
        }
      />
    </div>
  )
}

/**
 * Por estado, con «Cargar más»
 * `groupBy` arma un grupo por estado con el título de Drive y su contador; `paging="more"` suma filas abajo en vez de paginar.
 */
export function Agrupada() {
  return (
    <div className="w-full">
      <DataTable
        aria-label="Facturas por estado"
        columns={COLUMNAS.filter((column) => column.id !== "estado")}
        data={[...FACTURAS].sort((a, b) => ESTADOS.indexOf(a.estado) - ESTADOS.indexOf(b.estado))}
        getRowId={(row) => row.id}
        groupBy={(row) => row.estado}
        pageSize={8}
        paging="more"
      />
    </div>
  )
}

/**
 * Cargando y vacía
 * Mientras llegan los datos, filas de esqueleto y `aria-busy`; sin filas, la tabla lo dice.
 */
export function Estados() {
  const [cargando, setCargando] = useState(true)
  return (
    <div className="flex w-full flex-col gap-4">
      <Button className="self-start" onClick={() => setCargando(!cargando)} size="sm" variant="secondary">
        {cargando ? "Mostrar vacía" : "Volver a cargar"}
      </Button>
      <DataTable
        aria-label="Facturas del mes"
        columns={COLUMNAS}
        data={[]}
        empty="Todavía no emitiste facturas este mes."
        getRowId={(row) => row.id}
        loading={cargando}
        loadingRows={4}
      />
    </div>
  )
}
