"use client"

import { BanIcon, CheckCircle2Icon, MoreHorizontalIcon, PanelRightIcon } from "lucide-react"
import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { DataTable, type DataTableColumn } from "sebs7n-ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"
import { EmptyState } from "sebs7n-ui/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { linkVariants } from "sebs7n-ui/variants/link"

import type { Invoice, InvoiceStatus } from "../_data/invoices-mock"
import { formatDate, money } from "../_lib/format"
import { isCollectable } from "../_state/invoices-reducer"
import { STATUS_BADGE, STATUS_ITEMS } from "./invoice-status"

interface InvoicesDataTableProps {
  invoices: Invoice[]
  loading: boolean
  selected: string[]
  onSelectedChange: (ids: string[]) => void
  onMarkPaid: (ids: string[]) => void
  onOpenDetail: (invoice: Invoice) => void
  onVoid: (invoice: Invoice) => void
}

export function InvoicesDataTable({
  invoices,
  loading,
  selected,
  onSelectedChange,
  onMarkPaid,
  onOpenDetail,
  onVoid,
}: InvoicesDataTableProps) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<InvoiceStatus | "all">("all")
  const shown = status === "all" ? invoices : invoices.filter((inv) => inv.status === status)

  const columns: DataTableColumn<Invoice>[] = [
    {
      id: "number",
      header: "Número",
      value: (row) => row.id,
      // Abre un panel, no navega: es un botón con forma de link de fila.
      cell: (row) => (
        <button className={linkVariants({ variant: "row" })} onClick={() => onOpenDetail(row)} type="button">
          {row.id}
        </button>
      ),
      sortable: true,
      className: "w-28",
    },
    { id: "customer", header: "Cliente", value: (row) => row.customer, sortable: true },
    { id: "concept", header: "Concepto", value: (row) => row.concept },
    {
      id: "amount",
      header: "Monto",
      value: (row) => row.amount,
      cell: (row) => money.format(row.amount),
      numeric: true,
      sortable: true,
      className: "w-32",
    },
    {
      id: "status",
      header: "Estado",
      value: (row) => STATUS_BADGE[row.status].label,
      cell: (row) => (
        <Badge color={STATUS_BADGE[row.status].color} size="sm">
          {STATUS_BADGE[row.status].label}
        </Badge>
      ),
      className: "w-28",
    },
    {
      id: "dueDate",
      header: "Vencimiento",
      value: (row) => row.dueDate,
      cell: (row) => formatDate(row.dueDate),
      numeric: true,
      sortable: true,
      className: "w-36",
    },
    {
      id: "actions",
      header: <span className="sr-only">Acciones</span>,
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button aria-label={`Acciones para ${row.id}`} size="icon-sm" variant="plain" />}>
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpenDetail(row)}>
              <PanelRightIcon />
              Ver detalle
            </DropdownMenuItem>
            {isCollectable(row) && (
              <DropdownMenuItem onClick={() => onMarkPaid([row.id])}>
                <CheckCircle2Icon />
                Marcar cobrada
              </DropdownMenuItem>
            )}
            {row.status !== "void" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onVoid(row)} variant="destructive">
                  <BanIcon />
                  Anular factura
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ]

  const clearFilters = () => {
    setQuery("")
    setStatus("all")
  }

  return (
    <DataTable
      aria-label="Facturas"
      columns={columns}
      data={shown}
      defaultSort={{ id: "dueDate", direction: "desc" }}
      empty={
        <EmptyState
          action={
            <Button onClick={clearFilters} variant="secondary">
              Limpiar filtros
            </Button>
          }
          description="Probá con otro estado o con otra búsqueda."
          title="Ninguna factura coincide"
          variant="plain"
        />
      }
      filter
      getRowId={(row) => row.id}
      getRowLabel={(row) => `${row.id} de ${row.customer}`}
      loading={loading}
      locale="es-AR"
      onQueryChange={setQuery}
      onSelectedChange={onSelectedChange}
      pageSize={10}
      query={query}
      selectable
      selected={selected}
      toolbar={
        selected.length > 0 ? (
          // Con selección, la barra cambia a las acciones masivas: el filtro vuelve al limpiarla.
          <>
            <span className="text-callout text-label-secondary">{`${selected.length} seleccionadas`}</span>
            <Button onClick={() => onMarkPaid(selected)} size="sm" variant="secondary">
              Marcar cobradas
            </Button>
            <Button onClick={() => onSelectedChange([])} size="sm" variant="plain">
              Limpiar selección
            </Button>
          </>
        ) : (
          <div className="w-full sm:w-48">
            <Select
              aria-label="Estado"
              items={STATUS_ITEMS}
              onValueChange={(value) => setStatus((value ?? "all") as InvoiceStatus | "all")}
              value={status}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }
    />
  )
}
