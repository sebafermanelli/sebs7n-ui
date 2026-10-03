"use client"

import { BanIcon, BellRingIcon, CheckCircle2Icon, Columns3Icon, DownloadIcon, MoreHorizontalIcon, PanelRightIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Badge } from "sebs7n-ui/badge"
import { BulkActionsBar } from "sebs7n-ui/bulk-actions-bar"
import { Button } from "sebs7n-ui/button"
import { DataTable, type DataTableColumn } from "sebs7n-ui/data-table"
import { DatePicker } from "sebs7n-ui/date-picker"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"
import { EmptyState } from "sebs7n-ui/empty-state"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { HoverCard, HoverCardContent, HoverCardHeader, HoverCardTrigger } from "sebs7n-ui/hover-card"
import { useStoredState } from "sebs7n-ui/lib/use-stored-state"
import { MultiSelect } from "sebs7n-ui/multi-select"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { linkVariants } from "sebs7n-ui/variants/link"

import { applyInvoiceFilters, NO_FILTERS, type Customer, type InvoiceFilters } from "../_data/derive"
import { filterInvoices, type Invoice, type InvoiceStatus } from "../_data/invoices-mock"
import { downloadCsv, invoicesToCsv } from "../_lib/csv"
import { formatDate, fromIsoDate, money, plural, toIsoDate } from "../_lib/format"
import { customerPath } from "../_lib/routes"
import { initials } from "../_data/team-mock"
import { isCollectable } from "../_state/invoices-reducer"
import { STATUS_BADGE, STATUS_OPTIONS } from "./invoice-status"

// Las columnas que se pueden ocultar. El número y las acciones siempre están: sin ellos la fila no se
// puede abrir ni operar.
const OPTIONAL_COLUMNS = { customer: "Cliente", concept: "Concepto", amount: "Monto", status: "Estado", dueDate: "Vencimiento", tags: "Etiquetas" }
type OptionalColumn = keyof typeof OPTIONAL_COLUMNS
const ALL_COLUMNS = Object.keys(OPTIONAL_COLUMNS) as OptionalColumn[]
// Las etiquetas arrancan ocultas: con seis columnas a la vista la tabla ya llena un 1280.
const DEFAULT_COLUMNS = ALL_COLUMNS.filter((column) => column !== "tags")
const isColumnList = (value: unknown): value is OptionalColumn[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string" && item in OPTIONAL_COLUMNS)

interface InvoicesDataTableProps {
  invoices: Invoice[]
  /** Los clientes para el filtro: los del store, no solo los que ya tienen factura. */
  customers: string[]
  /** El resumen de cada cliente por nombre: con él, el nombre abre una tarjeta al pasar el mouse. */
  customerInfo?: Record<string, Customer>
  loading: boolean
  selected: string[]
  onSelectedChange: (ids: string[]) => void
  /** Los filtros, controlados por la página (la alerta de vencidas los cambia). Sin ellos, el estado es de la tabla. */
  filters?: InvoiceFilters
  onFiltersChange?: (filters: InvoiceFilters) => void
  onMarkPaid: (ids: string[]) => void
  onRemind: (ids: string[]) => void
  onOpenDetail: (invoice: Invoice) => void
  onVoid: (invoice: Invoice) => void
}

export function InvoicesDataTable({
  invoices,
  customers,
  customerInfo,
  loading,
  selected,
  onSelectedChange,
  filters: filtersProp,
  onFiltersChange,
  onMarkPaid,
  onRemind,
  onOpenDetail,
  onVoid,
}: InvoicesDataTableProps) {
  const [query, setQuery] = useState("")
  const [ownFilters, setOwnFilters] = useState<InvoiceFilters>(NO_FILTERS)
  const filters = filtersProp ?? ownFilters
  const setFilters = (next: InvoiceFilters) => {
    setOwnFilters(next)
    onFiltersChange?.(next)
  }
  const [visible, setVisible] = useStoredState<OptionalColumn[]>("acme-dashboard:invoice-columns", DEFAULT_COLUMNS, isColumnList)
  const shown = applyInvoiceFilters(invoices, filters)
  const hasFilters = filters.statuses.length > 0 || filters.customer !== "all" || filters.from !== null || filters.to !== null

  // Se exporta lo que se ve (con la búsqueda aplicada) o, si hay selección, solo lo elegido.
  const exportCsv = (ids?: string[]) => {
    const rows = ids ? invoices.filter((inv) => ids.includes(inv.id)) : filterInvoices(shown, query, "all")
    downloadCsv(`facturas-${toIsoDate(new Date())}.csv`, invoicesToCsv(rows))
  }

  const allColumns: DataTableColumn<Invoice>[] = [
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
    {
      id: "customer",
      header: "Cliente",
      value: (row) => row.customer,
      cell: (row) => <CustomerCell customer={customerInfo?.[row.customer]} name={row.customer} />,
      sortable: true,
    },
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
      id: "tags",
      header: "Etiquetas",
      value: (row) => (row.tags ?? []).join(" "),
      cell: (row) =>
        (row.tags ?? []).length === 0 ? (
          <span className="text-label-secondary">—</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {row.tags!.map((tag) => (
              <Badge color="gray" key={tag} size="sm">
                {tag}
              </Badge>
            ))}
          </span>
        ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Acciones</span>,
      cell: (row) => (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger render={<DropdownMenuTrigger render={<Button aria-label={`Acciones para ${row.id}`} size="icon-sm" variant="plain" />} />}>
              <MoreHorizontalIcon />
            </TooltipTrigger>
            <TooltipContent>Acciones</TooltipContent>
          </Tooltip>
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

  const columns = allColumns.filter((column) => column.id === "number" || column.id === "actions" || visible.includes(column.id as OptionalColumn))

  const clearFilters = () => {
    setQuery("")
    setFilters(NO_FILTERS)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Una barra, tres zonas: búsqueda, filtros y, a la derecha, lo que actúa sobre la lista. Los controles
          son `sm` (es una barra de tabla) y en el teléfono pasan a una columna de ancho completo. */}
      <FilterBar
        actions={
          selected.length > 0 ? (
            // Con selección, las acciones de siempre ceden su lugar a las masivas.
            <BulkActionsBar count={selected.length} labels={{ selectedOne: "{count} seleccionada", selectedOther: "{count} seleccionadas" }} onClear={() => onSelectedChange([])}>
              <Button onClick={() => onMarkPaid(selected)} size="sm" variant="secondary">
                <CheckCircle2Icon />
                Marcar cobradas
              </Button>
              <Button onClick={() => onRemind(selected)} size="sm" variant="secondary">
                <BellRingIcon />
                Enviar recordatorio
              </Button>
              <Button onClick={() => exportCsv(selected)} size="sm" variant="secondary">
                <DownloadIcon />
                Exportar selección
              </Button>
            </BulkActionsBar>
          ) : (
            <>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger render={<DropdownMenuTrigger render={<Button aria-label="Columnas visibles" size="icon-sm" variant="secondary" />} />}>
                    <Columns3Icon />
                  </TooltipTrigger>
                  <TooltipContent>Columnas visibles</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  {ALL_COLUMNS.map((id) => (
                    <DropdownMenuCheckboxItem
                      checked={visible.includes(id)}
                      key={id}
                      onCheckedChange={(checked) => setVisible(checked ? ALL_COLUMNS.filter((column) => column === id || visible.includes(column)) : visible.filter((column) => column !== id))}
                    >
                      {OPTIONAL_COLUMNS[id]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger render={<Button aria-label="Exportar a CSV" onClick={() => exportCsv()} size="icon-sm" variant="secondary" />}>
                  <DownloadIcon />
                </TooltipTrigger>
                <TooltipContent>Exportar a CSV</TooltipContent>
              </Tooltip>
            </>
          )
        }
        aria-label="Buscar y filtrar facturas"
        filters={
          <>
            <MultiSelect
              aria-label="Estado"
              className="@xl:w-48"
              onValueChange={(statuses) => setFilters({ ...filters, statuses: statuses as InvoiceStatus[] })}
              options={STATUS_OPTIONS}
              placeholder="Todos los estados"
              showClear={false}
              size="sm"
              value={filters.statuses}
            />
            <Select
              aria-label="Cliente"
              items={{ all: "Todos los clientes", ...Object.fromEntries(customers.map((name) => [name, name])) }}
              onValueChange={(value) => setFilters({ ...filters, customer: value ?? "all" })}
              value={filters.customer}
            >
              <SelectTrigger className="@xl:w-44" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {customers.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePicker
              aria-label="Vencimiento"
              className="@xl:w-52"
              clearable
              mode="range"
              numberOfMonths={2}
              onValueChange={(range) => setFilters({ ...filters, from: range.from ? toIsoDate(range.from) : null, to: range.to ? toIsoDate(range.to) : null })}
              size="sm"
              value={{ from: filters.from ? fromIsoDate(filters.from) : null, to: filters.to ? fromIsoDate(filters.to) : null }}
            />
            {hasFilters && (
              <Button onClick={() => setFilters(NO_FILTERS)} size="sm" variant="plain">
                Quitar filtros
              </Button>
            )}
          </>
        }
        role="search"
        search={<SearchField aria-label="Buscar facturas" onValueChange={setQuery} placeholder="Buscar facturas" size="sm" value={query} />}
      />
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
            description="Probá con otros filtros o con otra búsqueda."
            title="Ninguna factura coincide"
            variant="plain"
          />
        }
        getRowId={(row) => row.id}
        getRowLabel={(row) => `${row.id} de ${row.customer}`}
        loading={loading}
        locale="es-AR"
        onSelectedChange={onSelectedChange}
        pageSize={10}
        query={query}
        selectable
        selected={selected}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {loading ? "" : plural(shown.length, "factura", "facturas")}
      </p>
    </div>
  )
}

// El cliente es un link a su ficha; con el mouse encima, una tarjeta con lo que importa de él. Todo lo que
// dice la tarjeta está también en la ficha: en un celular, donde no hay hover, el link lleva a ella.
function CustomerCell({ name, customer }: { name: string; customer?: Customer }) {
  if (!customer) return name
  return (
    <HoverCard>
      <HoverCardTrigger className={linkVariants({ variant: "subtle" })} render={<Link href={customerPath(customer.id)} />}>
        {name}
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <HoverCardHeader>
          <Avatar>
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-headline text-label">{name}</span>
            <span className="truncate text-callout text-label-secondary">{customer.email ?? "Sin correo cargado"}</span>
          </div>
        </HoverCardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={customer.outstanding > 0 ? "amber" : "green"} size="sm">
            {customer.outstanding > 0 ? "Con saldo" : "Al día"}
          </Badge>
          <span className="text-callout text-label-secondary">
            {plural(customer.invoiceCount, "factura", "facturas")} · {money.format(customer.outstanding)} por cobrar
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
